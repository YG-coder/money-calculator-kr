// src/lib/initialCost.ts
// 부동산 실투자금(총 필요자금) 계산 — 순수 함수. 정책값은 policy 모듈에서 조회만 한다.
//
// ── 산식 ─────────────────────────────────────────────
//   취득세합계   = calcAcquisitionTax(...).totalTax        ← PR 2a 엔진 재사용
//   중개보수     = 자동: min(매매가 × 상한요율, 한도액) / 직접 입력: 입력값
//   중개보수VAT  = 포함 시 중개보수 × 10% (일반과세 기준)
//   총부대비용   = 취득세합계 + 중개보수 + VAT + 등기법무 + 기타
//   총필요자금   = 매매가 + 총부대비용
//   실투자금     = 총필요자금 − 대출금 − 임대보증금
//
// ⚠️ 등기·법무 비용은 자동 계산하지 않는다. 국민주택채권 할인율이 매일 바뀌어
//    정적 사이트에 상수화하면 그날부터 틀린 값이 된다. 사용자가 명시적으로
//    '직접 입력' 또는 '포함하지 않음' 을 골라야 계산한다.
//    상세: 저장소 루트 BROKERAGE-POLICY-2026-08.md

import type { PolicyMeta } from "@/lib/policy/types";
import {
  calcAcquisitionTax,
  type AcquisitionTaxInput,
  type AcquisitionTaxResult,
} from "@/lib/realEstate";
import { ACQUISITION_TAX_POLICY_META } from "@/lib/policy/acquisitionTax";
import {
  calcMaxBrokerageFee,
  BROKERAGE_META,
  BROKERAGE_VAT_RATE,
} from "@/lib/policy/brokerage";

// ─────────────────────────────────────────────
// 입력
// ─────────────────────────────────────────────

/** 항상 발생하지만 계산기가 값을 제시할 수 없는 비용 — 조용히 0원을 쓰지 않는다. */
export type CostChoice =
  | { kind: "unselected" }
  | { kind: "excluded" } // 포함하지 않음 (별도 확인)
  | { kind: "amount"; amountWon: number };

export type BrokerageChoice =
  | { kind: "auto"; includeVat: boolean }
  | { kind: "amount"; amountWon: number; includeVat: boolean };

export interface InitialCostInput {
  housePriceWon: number;
  /** 취득세 입력. priceMan 은 housePriceWon 에서 파생하므로 제외 */
  acquisition: Omit<AcquisitionTaxInput, "priceMan">;
  brokerage: BrokerageChoice;
  /** 등기·법무 비용 — 명시 선택 필요 */
  registrationCost: CostChoice;
  /** 기타 비용(이사·수리·가전 등). 실제로 0일 수 있으므로 기본 0 */
  otherCostWon: number;
  loanWon: number;
  /** 임대보증금 승계(갭투자 등) */
  rentDepositWon: number;
}

export type InitialCostMissing = "housePrice" | "registrationCost";

export interface InitialCostResult {
  acquisitionTaxWon: number;
  acquisitionDetail: AcquisitionTaxResult;

  brokerageFeeWon: number; // VAT 제외
  brokerageVatWon: number;
  brokerageTotalWon: number;
  /** 자동 산정일 때의 구간 라벨. 직접 입력이면 null */
  brokerageBandLabel: string | null;
  brokerageCapApplied: boolean;

  registrationCostWon: number;
  otherCostWon: number;

  totalExtraCostWon: number;
  /** 매매가 대비 부대비용 비율 (%) */
  extraCostRatioPct: number;
  totalRequiredWon: number;

  /** 실투자금 = 총 필요자금 − 대출 − 임대보증금 */
  equityWon: number;
  isEquityNegative: boolean;

  metas: PolicyMeta[];
  notes: string[];
}

export type InitialCostOutcome =
  | { status: "needsInput"; missing: InitialCostMissing[] }
  | { status: "ok"; result: InitialCostResult };

// ─────────────────────────────────────────────

function resolveCost(choice: CostChoice): number | null {
  if (choice.kind === "excluded") return 0;
  if (choice.kind === "amount") {
    return choice.amountWon >= 0 ? choice.amountWon : null;
  }
  return null; // unselected
}

export function calcInitialCost(input: InitialCostInput): InitialCostOutcome {
  // ── 입력 게이팅 ──
  const missing: InitialCostMissing[] = [];
  if (!(input.housePriceWon > 0)) missing.push("housePrice");

  const registrationCostWon = resolveCost(input.registrationCost);
  if (registrationCostWon === null) missing.push("registrationCost");

  if (missing.length > 0 || registrationCostWon === null) {
    return { status: "needsInput", missing };
  }

  const notes: string[] = [];

  // ── 취득세 (PR 2a 엔진 재사용) ──
  const acquisitionDetail = calcAcquisitionTax({
    ...input.acquisition,
    priceMan: input.housePriceWon / 10_000,
  });
  notes.push(...acquisitionDetail.notes);
  if (acquisitionDetail.unsupportedReason) {
    notes.push(acquisitionDetail.unsupportedReason);
  }

  // ── 중개보수 ──
  let brokerageFeeWon = 0;
  let brokerageBandLabel: string | null = null;
  let brokerageCapApplied = false;

  if (input.brokerage.kind === "auto") {
    const band = calcMaxBrokerageFee(input.housePriceWon);
    if (band) {
      brokerageFeeWon = band.maxFeeWon;
      brokerageBandLabel = band.band.label;
      brokerageCapApplied = band.capApplied;
      if (band.capApplied) {
        notes.push(
          `중개보수에 구간 한도액 ${band.band.capWon?.toLocaleString("ko-KR")}원이 적용되었습니다.`,
        );
      }
    }
  } else {
    brokerageFeeWon = Math.max(0, input.brokerage.amountWon);
  }

  const brokerageVatWon = input.brokerage.includeVat
    ? Math.floor(brokerageFeeWon * BROKERAGE_VAT_RATE)
    : 0;
  const brokerageTotalWon = brokerageFeeWon + brokerageVatWon;

  if (!input.brokerage.includeVat) {
    notes.push("중개보수 부가가치세를 제외하고 계산했습니다.");
  }

  // ── 합산 ──
  const otherCostWon = Math.max(0, input.otherCostWon);

  if (input.registrationCost.kind === "excluded") {
    notes.push(
      "등기·법무 비용을 포함하지 않았습니다. 실제 필요자금은 이보다 큽니다.",
    );
  }

  const totalExtraCostWon =
    acquisitionDetail.totalTax +
    brokerageTotalWon +
    registrationCostWon +
    otherCostWon;

  const totalRequiredWon = input.housePriceWon + totalExtraCostWon;
  const equityWon =
    totalRequiredWon - Math.max(0, input.loanWon) - Math.max(0, input.rentDepositWon);

  return {
    status: "ok",
    result: {
      acquisitionTaxWon: acquisitionDetail.totalTax,
      acquisitionDetail,

      brokerageFeeWon,
      brokerageVatWon,
      brokerageTotalWon,
      brokerageBandLabel,
      brokerageCapApplied,

      registrationCostWon,
      otherCostWon,

      totalExtraCostWon,
      extraCostRatioPct: (totalExtraCostWon / input.housePriceWon) * 100,
      totalRequiredWon,

      equityWon,
      isEquityNegative: equityWon < 0,

      metas: [ACQUISITION_TAX_POLICY_META, BROKERAGE_META],
      notes,
    },
  };
}
