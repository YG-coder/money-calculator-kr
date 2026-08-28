// src/lib/policy/dsr.ts
// 스트레스 DSR 정책 테이블 — 2026-08-25 기준
//
// ⚠️ 이 파일은 정책값만 담습니다. 계산은 @/lib/dsr 에서 합니다.
//    값을 수정할 때는 반드시 같은 커밋에서 verifiedAt 과 sources 를 갱신하세요.
//
// 조사 근거: docs/policies/DSR-POLICY-2026-08.md (rev.3)
//
// ─────────────────────────────────────────────
// ⚠️ 재검증 트리거가 법령이 아닙니다
//
//   취득세·중개보수는 법령 개정으로 추적할 수 있지만, 스트레스 DSR 은
//   금융위원회 '행정지도'로 운용됩니다. 따라서 "시행일"이 아니라
//   아래 두 가지가 재검증 시점입니다.
//     · 스트레스 금리 반기 발표 (매년 6월 · 12월)
//     · 가계부채 관리방안 발표
// ─────────────────────────────────────────────

import type { PolicyMeta, PolicyTable } from "@/lib/policy/types";

// ─────────────────────────────────────────────
// 조건 축
// ─────────────────────────────────────────────

/**
 * 주택담보대출의 지역 구분 (2분법).
 *
 * ⚠️ @/lib/policy/ltv 의 LtvRegion(3분법)과 이름이 비슷하지만 다릅니다.
 *    두 타입을 서로 대입하지 마세요.
 *
 * ⚠️ 이 축은 **주택담보대출 전용**입니다. 신용대출 스트레스 금리는
 *    전국 동일하므로 신용대출 계산 경로에 이 타입을 넘기지 마세요.
 *    (넘길 수 없도록 getCreditStressRatePct 는 지역 인자를 받지 않습니다)
 */
export type MortgageRegion = "metro" | "local";

/**
 * 신용대출의 금리유형 축 — **고정금리 기간** 기준.
 *
 * ⚠️ 주택담보대출의 금리유형 축(변동 / 혼합형 / 주기형)과 다른 축입니다.
 *    두 표는 구조가 닮았을 뿐 서로 다른 표이며, 값을 교차 적용하면 안 됩니다.
 */
export type CreditFixedTerm =
  | "fixed5plus" // 만기 5년 이상 고정
  | "fixed3to5" // 만기 3년 이상 5년 미만 고정
  | "other"; // 변동형 등 그 밖의 대출

export const CREDIT_FIXED_TERM_LABEL: Record<CreditFixedTerm, string> = {
  fixed5plus: "5년 이상 고정금리",
  fixed3to5: "3년 이상 5년 미만 고정금리",
  other: "변동금리 등 그 밖",
};

// ─────────────────────────────────────────────
// 일반 스트레스 금리 — 반기 산정값
//
//   스트레스 금리 = 과거 5년 中 최고 가계대출 금리 − 현재 금리(5월·11월)
//                   단, 일반대출은 하한 1.5%p · 상한 3.0%p
//   발표 연 2회(6월·12월), 발표 이후 6개월 적용.
//
//   ⚠️ currentPct 는 **상수가 아니라 이번 반기의 산정 결과**입니다.
//      현재는 산정 결과가 하한에 걸려 1.5% 입니다.
//      2026년 12월 발표 시 갱신하고 applicableHalf 도 함께 올리세요.
//      이 값 하나만 바꾸면 신용대출·지방 주담대가 함께 움직입니다(파생 함수 참고).
// ─────────────────────────────────────────────

export const STRESS_RATE = {
  /** 2026-H2 산정 결과 (%p) — 하한에 걸린 상태 */
  currentPct: 1.5,
  /** 일반대출 하한 (%p) */
  minPct: 1.5,
  /** 일반대출 상한 (%p) */
  maxPct: 3.0,
  /** 적용 반기 */
  applicableHalf: "2026-H2",
  effectiveFrom: "2026-07-01",
  effectiveUntil: "2026-12-31",
} as const;

// ─────────────────────────────────────────────
// 게이팅 기준 — 두 개의 1억원
//
//   ⚠️ 값이 같다고 하나로 합치지 마세요. 의미가 다르므로
//      한쪽 정책이 바뀌면 다른 쪽이 조용히 따라 움직입니다.
// ─────────────────────────────────────────────

/** 차주단위 DSR 적용 기준 — 차주의 **총 대출** 기준 */
export const DSR_APPLICATION_THRESHOLD_WON = 100_000_000;

/** 신용대출 스트레스 게이팅 — **신용대출 총잔액(기존 + 신규)** 기준 */
export const CREDIT_STRESS_GATE_WON = 100_000_000;

// ─────────────────────────────────────────────
// 주택담보대출 스트레스 금리
// ─────────────────────────────────────────────

/**
 * 수도권·규제지역 주담대의 **강화 하한** (%p).
 * 10·15 대책 이후 적용.
 *
 * ⚠️ "하한"이므로 문언대로면 max(현재 스트레스 금리, 3.0) 입니다.
 *    현재 일반 스트레스 금리(1.5%)와 그 상한(3.0%) 모두 3.0 을 넘지 않으므로,
 *    "하한 해석"과 "고정값 3.0 해석"은 지금 같은 값을 냅니다.
 *    값 대신 관계를 남기기 위해 max() 로 구현합니다.
 */
export const METRO_MORTGAGE_MINIMUM_PCT = 3.0;

/**
 * 지방 비규제지역 주담대에 적용되는 2단계 적용비율.
 * 유예 조치이며 종료일은 LOCAL_MORTGAGE_DEFERRAL_UNTIL.
 */
export const LOCAL_MORTGAGE_PHASE_RATIO = 0.5;

/**
 * 지방 주담대 2단계(0.75%) 유지 유예 종료일.
 *
 * ⚠️ 이미 두 차례 연장된 이력이 있습니다. 이 날짜가 지나면 값이 자동으로
 *    틀려지므로, 경과 여부를 isLocalDeferralActive() 로 확인하세요.
 */
export const LOCAL_MORTGAGE_DEFERRAL_UNTIL = "2026-12-31";

// ─────────────────────────────────────────────
// 신용대출 금리유형별 스트레스 적용비율
//
//   근거: 금융위원회 「스트레스 DSR 제도 시행」 2023-12-27 (1차)
//         2026년 유지 여부는 금융위원회공고 제2026-362호에서 확인 (1차)
// ─────────────────────────────────────────────

const DSR_META: PolicyMeta = {
  id: "dsr-stress",
  version: "2.0.0",
  effectiveFrom: "2026-07-01", // 현재 반기 스트레스 금리 적용 개시일
  effectiveUntil: "2026-12-31", // 반기 종료 = 재산정 시점
  verifiedAt: "2026-08-25",
  sources: [
    {
      name: "금융위원회 「전 금융권 스트레스 DSR 제도 시행」 — 신용대출 게이팅 및 금리유형별 적용비율",
      publishedAt: "2023-12-27",
    },
    {
      name: "금융위원회 「스트레스 DSR 3단계 행정지도 변경시행 예고」 (공고 제2026-362호) — 2026년 유지 및 지방 유예",
      publishedAt: "2026-06-18",
    },
    {
      name: "10·15 주택시장 안정화 대책 — 수도권·규제지역 주담대 강화 하한 3.0%",
      publishedAt: "2025-10-15",
    },
  ],
  supported: [
    "신용대출 총잔액 1억원 초과 게이팅",
    "신용대출 금리유형별 적용비율 (5년 이상 고정 0% / 3~5년 고정 60% / 그 밖 100%)",
    "수도권·규제지역 주택담보대출 스트레스 금리",
    "지방 비규제지역 주택담보대출 유예 스트레스 금리",
    "차주단위 DSR 한도 (은행 40% / 비은행 50%)",
  ],
  unsupported: [
    "분할상환 신용대출의 실제만기 인정 요건과 세부 원금 산식",
    "마이너스통장 산정만기의 감독업무시행세칙 원문 대조",
    "기타대출 종류별 세부 산정만기",
    "보증기관(HF·HUG·SGI)별 전세자금대출 취급 차이",
    "스트레스 DSR 4단계 (확정 시행일·수치 확인 불가)",
    "지방 주담대 유예의 2026-12-31 이후 처리",
    "주택담보대출의 혼합형·주기형 적용비율",
  ],
  note:
    "8·13 대책은 가계대출 총량 증가율 목표를 조정했으나, 신용대출 스트레스 수치·" +
    "금리유형별 적용비율·차주별 DSR 한도의 변경은 공식 발표에서 확인되지 않았습니다. " +
    "(부존재 증명이 아니라 해당 자료 범위에서의 확인 결과입니다)",
  nextReviewHint:
    "2026년 12월 스트레스 금리 반기 발표 / 지방 주담대 유예 2026-12-31 만료 / 차기 가계부채 관리방안 발표",
};

export interface CreditStressCondition {
  fixedTerm: CreditFixedTerm;
}

/** 신용대출 금리유형별 스트레스 적용비율 (0~1) */
export const CREDIT_STRESS_RATIO_TABLE: PolicyTable<
  CreditStressCondition,
  number
> = {
  meta: DSR_META,
  entries: [
    {
      conditions: { fixedTerm: "fixed5plus" },
      value: 0,
      note: "만기 5년 이상 고정금리 — 스트레스 금리 미적용",
    },
    {
      conditions: { fixedTerm: "fixed3to5" },
      value: 0.6,
      note: "만기 3년 이상 5년 미만 고정금리 — 스트레스 금리의 60%",
    },
    {
      conditions: { fixedTerm: "other" },
      value: 1,
      note: "변동금리 등 그 밖의 대출 — 스트레스 금리의 100%",
    },
  ],
};

export const DSR_POLICY_META = DSR_META;

// ─────────────────────────────────────────────
// 산정만기
// ─────────────────────────────────────────────

/**
 * 신용대출(일시상환·마이너스통장)의 DSR 산정만기(년).
 *
 * ⚠️ "모든 신용대출 5년"이 아닙니다. 요건을 갖춘 분할상환 신용대출은
 *    실제 만기(최장 10년으로 안내된 자료 있음)를 인정받을 수 있으나,
 *    인정 요건과 원금 산식의 1차 원문을 확인하지 못했습니다.
 *    → 분할상환 신용대출은 사용자가 실제 연간 원리금을 직접 입력하게 합니다.
 */
export const CREDIT_ASSESSMENT_TERM_YEARS = 5;

/**
 * 마이너스통장은 사용잔액이 아니라 **약정한도 전액**을 대출금액으로 봅니다.
 * 사용액이 0원이어도 한도가 유지되면 DSR 에 영향을 줍니다.
 *
 * 근거 등급: 2차 (금융위 안내를 인용한 실무자료).
 *            현행 감독업무시행세칙 원문 대조는 하지 못했습니다.
 */
export const CREDIT_LINE_USES_FULL_LIMIT = true;

// ─────────────────────────────────────────────
// 차주단위 DSR 한도
// ─────────────────────────────────────────────

export const DSR_LIMIT = { bank: 40, nonbank: 50 } as const;

// ─────────────────────────────────────────────
// 파생 계산
//
//   ⚠️ 아래 함수들은 모두 STRESS_RATE.currentPct 하나에서 파생됩니다.
//      반기 발표로 그 값이 바뀌면 신용대출과 지방 주담대가 함께 움직입니다.
//      개별 상수(0.75 등)를 따로 박아두지 마세요.
// ─────────────────────────────────────────────

/** 백분율 계산의 부동소수점 오차 제거 (1.5 × 0.6 = 0.8999… → 0.9) */
function roundPct(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}

/**
 * 신용대출의 유효 스트레스 금리(%p).
 *
 * ⚠️ 지역 인자를 받지 않습니다. 지방 유예는 주택담보대출 한정이며
 *    신용대출 스트레스 금리는 전국 동일합니다.
 *
 * @param fixedTerm 고정금리 기간 구분
 * @param creditTotalWon 신용대출 총잔액(기존 + 신규). 1억원 이하면 0 을 돌려줍니다.
 */
export function getCreditStressRatePct(params: {
  fixedTerm: CreditFixedTerm;
  creditTotalWon: number;
}): number {
  if (params.creditTotalWon <= CREDIT_STRESS_GATE_WON) return 0;

  const ratio = CREDIT_STRESS_RATIO_TABLE.entries.find(
    (e) => e.conditions.fixedTerm === params.fixedTerm,
  )?.value;

  // 테이블에 없는 조합은 추정하지 않는다 — 호출부에서 unsupported 처리
  if (ratio === undefined) return 0;

  return roundPct(STRESS_RATE.currentPct * ratio);
}

/** 지방 주담대 유예가 기준일 현재 살아 있는지 */
export function isLocalDeferralActive(asOf: string): boolean {
  return asOf <= LOCAL_MORTGAGE_DEFERRAL_UNTIL;
}

/**
 * 주택담보대출의 유효 스트레스 금리(%p) — 변동형(적용비율 100%) 기준.
 *
 *   수도권·규제지역 : max(현재 스트레스 금리, 강화 하한 3.0)
 *   지방 비규제     : 현재 스트레스 금리 × 2단계 적용비율 50%
 *
 * 지방 유예가 만료되면 지방도 수도권과 같은 산식으로 넘어가는지 여부는
 * 확인되지 않았습니다. 만료 시점에는 값을 돌려주지 않고 재검증합니다.
 */
export function getMortgageStressRatePct(params: {
  region: MortgageRegion;
  asOf: string;
}): number | null {
  if (params.region === "metro") {
    return roundPct(
      Math.max(STRESS_RATE.currentPct, METRO_MORTGAGE_MINIMUM_PCT),
    );
  }

  // 지방 — 유예 만료 후 처리는 확인 불가
  if (!isLocalDeferralActive(params.asOf)) return null;

  return roundPct(STRESS_RATE.currentPct * LOCAL_MORTGAGE_PHASE_RATIO);
}
