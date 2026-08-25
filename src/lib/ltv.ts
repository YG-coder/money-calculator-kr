// src/lib/ltv.ts
// LTV(담보인정비율) 기준 담보 한도 계산 — 순수 함수. 정책값은 @/lib/policy/ltv 에서 조회만 한다.
//
// ── 산식 근거 ────────────────────────────────────────────────
// 두 개의 공식 제약을 동시에 만족시키면 아래 식이 유일하게 도출된다.
//
//   ① 은행업감독업무시행세칙 [별표 18] 「주택관련 담보대출 등에 대한 리스크관리 세부기준」
//      LTV = (담보대출금액 + 선순위채권 + 임차보증금 및 최우선변제 소액임차보증금) ÷ 담보가치
//      → 담보대출금액 ≤ 담보가치 × LTV − 선순위채권 − 임차보증금 − 최우선변제금
//
//   ② 금융위원회 대출한도 규정 (6·27 / 10·15 대책)
//      6억·4억·2억은 "금융회사가 취급하는 주담대의 최대한도" = 실행 대출액 상한
//      → 담보대출금액 ≤ 절대한도
//
//   두 제약의 좌변이 같은 변수이므로 최대값은 두 상한의 최솟값이고,
//   차감 결과가 음수일 수 있으므로 0으로 클램프한다.
//
//      한도 = max(0, min(담보가치 × LTV − 선순위채권 − 방공제, 절대한도))
//
//   ⚠️ 절대한도를 차감 '전' 값에 씌우면(A안) 절대한도가 걸리는 구간에서 한도가
//      과소 계산된다. 회귀 케이스는 lib/ltv.test.ts 참조.
//   상세: 저장소 루트 LTV-POLICY-2026-08.md 4.4절
// ─────────────────────────────────────────────────────────────

import { lookupPolicy, type PolicyMeta } from "@/lib/policy/types";
import {
  LTV_TABLE,
  ABSOLUTE_CAP_META,
  getAbsoluteCapWon,
  type BorrowerType,
  type LtvRegion,
} from "@/lib/policy/ltv";

// ─────────────────────────────────────────────
// 방공제 입력 — 3상태
//
// 조용히 0원을 기본값으로 두지 않는다. 사용자가 '직접 입력' 또는 '공제 없음'을
// 명시적으로 고르기 전에는 계산하지 않는다. 0원은 '공제 없음'을 고른 경우에만 허용한다.
// ─────────────────────────────────────────────

export type RoomDeductionChoice =
  | { kind: "unselected" }
  | { kind: "none" } // MCI·MCG 가입 등으로 공제하지 않음
  | { kind: "amount"; amountWon: number };

export interface LtvInput {
  housePriceWon: number;
  region: LtvRegion;
  borrower: BorrowerType;
  /** 선순위 근저당·기존 채권 (원). 없으면 0 */
  seniorDebtWon: number;
  roomDeduction: RoomDeductionChoice;
}

export type LtvMissingField = "housePrice" | "roomDeduction";

export interface LtvResult {
  appliedLtvPct: number;
  /** 담보가치 × 적용LTV */
  ltvAmountWon: number;
  seniorDebtWon: number;
  roomDeductionWon: number;
  /** LTV한도 − 선순위 − 방공제 (클램프 전, 음수 가능) */
  afterDeductionWon: number;
  /** 적용되지 않는 지역이면 null */
  absoluteCapWon: number | null;
  /** 절대한도가 실제로 최종값을 결정했는지 */
  capApplied: boolean;
  /** 최종 담보 기준 한도 */
  limitWon: number;
  /** 주택가격 − 최종 한도 */
  requiredEquityWon: number;
  ltvMeta: PolicyMeta;
  capMeta: PolicyMeta;
}

export type LtvOutcome =
  | { status: "needsInput"; missing: LtvMissingField[] }
  | { status: "unsupported"; reason: string; meta: PolicyMeta }
  | { status: "ok"; result: LtvResult };

/** 방공제 선택값 → 차감액(원). 아직 계산할 수 없으면 null. */
function resolveRoomDeduction(choice: RoomDeductionChoice): number | null {
  if (choice.kind === "none") return 0;
  if (choice.kind === "amount") {
    // 0원 이하는 '공제 없음'을 선택해야 한다. 직접 입력으로는 허용하지 않는다.
    return choice.amountWon > 0 ? choice.amountWon : null;
  }
  return null; // unselected
}

export function calcLtv(input: LtvInput): LtvOutcome {
  // ── 입력 게이팅 ──
  const missing: LtvMissingField[] = [];
  if (!(input.housePriceWon > 0)) missing.push("housePrice");

  const roomDeductionWon = resolveRoomDeduction(input.roomDeduction);
  if (roomDeductionWon === null) missing.push("roomDeduction");

  if (missing.length > 0 || roomDeductionWon === null) {
    return { status: "needsInput", missing };
  }

  // ── 정책 조회 ──
  const lookup = lookupPolicy(LTV_TABLE, {
    region: input.region,
    borrower: input.borrower,
  });

  if (lookup.status === "unsupported") {
    return {
      status: "unsupported",
      reason: lookup.reason,
      meta: lookup.meta,
    };
  }

  const appliedLtvPct = lookup.value;

  // ── 산식 B ──
  const ltvAmountWon = input.housePriceWon * (appliedLtvPct / 100);
  const seniorDebtWon = Math.max(0, input.seniorDebtWon);

  const afterDeductionWon = ltvAmountWon - seniorDebtWon - roomDeductionWon;

  const absoluteCapWon = getAbsoluteCapWon(input.region, input.housePriceWon);

  const beforeClamp =
    absoluteCapWon === null
      ? afterDeductionWon
      : Math.min(afterDeductionWon, absoluteCapWon);

  const limitWon = Math.max(0, beforeClamp);

  // 절대한도가 실제로 최종값을 결정했는지 (동률은 결정한 것으로 보지 않는다)
  const capApplied =
    absoluteCapWon !== null && afterDeductionWon > absoluteCapWon;

  return {
    status: "ok",
    result: {
      appliedLtvPct,
      ltvAmountWon,
      seniorDebtWon,
      roomDeductionWon,
      afterDeductionWon,
      absoluteCapWon,
      capApplied,
      limitWon,
      requiredEquityWon: input.housePriceWon - limitWon,
      ltvMeta: lookup.meta,
      capMeta: ABSOLUTE_CAP_META,
    },
  };
}
