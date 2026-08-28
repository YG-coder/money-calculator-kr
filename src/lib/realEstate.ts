// src/lib/realEstate.ts
// 부동산 관련 순수 계산 함수 (사이드 이펙트 없음)
// formatKRW, formatUnit 은 @/lib/loan 에서 export 되어 있으므로 중복 정의 없음

/* ─────────────────────────────────────────────
   취득세 계산 (주택 · 2026-08-25 지방세법 기준 검증)
───────────────────────────────────────────── */

import {
  firstHomeReductionLimit,
  NON_METRO_LOW_PRICE_LIMIT_WON,
  type FirstHomeReduction,
} from "@/lib/policy/acquisitionTax";

export type OwnershipType = "first" | "second" | "third" | "fourth_plus";

export interface AcquisitionTaxResult {
  acquisitionTax: number; // 취득세 (원)
  farmSpecialTax: number; // 농어촌특별세 (원)
  localEduTax: number; // 지방교육세 (원)
  totalTax: number; // 합계 (원)
  taxRate: number; // 취득세율 (소수, e.g. 0.01)
  appliedRule: "standard" | "heavy" | "lowPriceExempt" | "temporaryTwoHouse";
  reductionWon: number;
  totalTaxBeforeReduction: number;
  notes: string[];
  unsupportedReason?: string;
  breakdown: {
    acquisitionTaxRate: string; // "1%"
    farmSpecialTaxRate: string;
    localEduTaxRate: string;
  };
}

/** 퍼센트 값을 소수점 넷째 자리까지 반올림 (지방세법 산출세율 규정) */
function roundTo4(pct: number): number {
  return Math.round(pct * 10_000) / 10_000;
}

/**
 * 1주택 구간별 취득세율 (지방세법 §11①8)
 * 6억 이하          → 1%
 * 6억 초과 ~ 9억 이하 → (취득가액(억) × 2/3 − 3) %, 소수점 넷째 자리 반올림
 * 9억 초과          → 3%
 */
function firstHouseRate(priceWon: number): number {
  if (priceWon <= 600_000_000) return 0.01;
  if (priceWon <= 900_000_000) {
    const uk = priceWon / 100_000_000;
    return roundTo4(uk * (2 / 3) - 3) / 100;
  }
  return 0.03;
}

function pctStr(r: number): string {
  const v = r * 100;
  if (Number.isInteger(v)) return `${v}%`;
  // 산출세율과 동일하게 소수점 넷째 자리까지 표시(불필요한 0 제거)
  return `${parseFloat(v.toFixed(4))}%`;
}

export interface AcquisitionTaxInput {
  priceMan: number;
  ownership: OwnershipType;
  isAdjustedArea: boolean;
  isOver85: boolean;
  isMetroArea?: boolean;
  officialPriceMan?: number;
  /** 경계값 테스트용 원 단위 입력. 있으면 officialPriceMan보다 우선한다. */
  officialPriceWon?: number;
  isRedevelopmentZone?: boolean;
  firstHomeReduction?: FirstHomeReduction;
  isTemporaryTwoHouse?: boolean;
}

export function calcAcquisitionTax(
  input: AcquisitionTaxInput,
): AcquisitionTaxResult {
  const {
    priceMan,
    ownership,
    isAdjustedArea,
    isOver85,
    isMetroArea,
    officialPriceMan,
    officialPriceWon: exactOfficialPriceWon,
    isRedevelopmentZone = false,
    firstHomeReduction = "none",
    isTemporaryTwoHouse = false,
  } = input;
  const priceWon = priceMan * 10_000;

  const officialPriceWon =
    exactOfficialPriceWon ??
    (officialPriceMan === undefined ? undefined : officialPriceMan * 10_000);
  const lowPriceExempt =
    ownership !== "first" &&
    isMetroArea === false &&
    officialPriceWon !== undefined &&
    officialPriceWon <= NON_METRO_LOW_PRICE_LIMIT_WON &&
    !isRedevelopmentZone;
  const temporaryTwoHouse = ownership === "second" && isTemporaryTwoHouse;

  // 취득세 본세율 (지방세법 §11 · §13의2)
  let taxRate = 0;
  if (ownership === "first" || lowPriceExempt || temporaryTwoHouse) {
    taxRate = firstHouseRate(priceWon);
  } else if (ownership === "second") {
    taxRate = isAdjustedArea ? 0.08 : firstHouseRate(priceWon);
  } else if (ownership === "third") {
    taxRate = isAdjustedArea ? 0.12 : 0.08;
  } else {
    // 4주택 이상 → 조정·비조정 모두 12%
    taxRate = 0.12;
  }

  const isHeavy = taxRate === 0.08 || taxRate === 0.12;

  // 지방교육세: 표준구간 본세율의 10%, 중과구간 0.4% 고정 (지방세법 §151)
  const localEduTaxRate = isHeavy ? 0.004 : taxRate * 0.1;

  // 농어촌특별세: 전용 85㎡ 이하 비과세, 초과 시 표준 0.2% / 8%중과 0.6% / 12%중과 1.0%
  let farmSpecialTaxRate = 0;
  if (isOver85) {
    if (taxRate === 0.12) farmSpecialTaxRate = 0.01;
    else if (taxRate === 0.08) farmSpecialTaxRate = 0.006;
    else farmSpecialTaxRate = 0.002;
  }

  const acquisitionTaxBeforeReduction = Math.floor(priceWon * taxRate);
  const farmSpecialTaxBeforeReduction = Math.floor(
    priceWon * farmSpecialTaxRate,
  );
  const localEduTaxBeforeReduction = Math.floor(priceWon * localEduTaxRate);
  const totalTaxBeforeReduction =
    acquisitionTaxBeforeReduction +
    farmSpecialTaxBeforeReduction +
    localEduTaxBeforeReduction;

  const notes: string[] = [];
  let unsupportedReason: string | undefined;
  let reductionWon = 0;
  let acquisitionTax = acquisitionTaxBeforeReduction;
  let localEduTax = localEduTaxBeforeReduction;
  let farmSpecialTax = farmSpecialTaxBeforeReduction;

  if (firstHomeReduction !== "none") {
    if (priceWon > 1_200_000_000) {
      notes.push("취득가액 12억원 초과로 생애최초 감면을 적용하지 않았습니다.");
    } else if (ownership !== "first") {
      notes.push("생애최초 감면은 첫 주택 취득에만 적용합니다.");
    } else if (isOver85) {
      unsupportedReason =
        "85㎡ 초과 생애최초 감면은 감면분 농어촌특별세 확인이 필요해 자동 적용하지 않습니다.";
    } else {
      const limit = firstHomeReductionLimit(firstHomeReduction);
      reductionWon = Math.min(acquisitionTaxBeforeReduction, limit);
      const reductionRate =
        acquisitionTaxBeforeReduction > 0
          ? reductionWon / acquisitionTaxBeforeReduction
          : 0;
      acquisitionTax -= reductionWon;
      localEduTax = Math.floor(
        localEduTaxBeforeReduction * (1 - reductionRate),
      );
      farmSpecialTax = 0;
      notes.push(
        `생애최초 취득세 감면 ${reductionWon.toLocaleString("ko-KR")}원 적용`,
      );
    }
  }
  const totalTax = acquisitionTax + farmSpecialTax + localEduTax;

  const appliedRule = temporaryTwoHouse
    ? "temporaryTwoHouse"
    : lowPriceExempt
      ? "lowPriceExempt"
      : isHeavy
        ? "heavy"
        : "standard";

  return {
    acquisitionTax,
    farmSpecialTax,
    localEduTax,
    totalTax,
    taxRate,
    appliedRule,
    reductionWon,
    totalTaxBeforeReduction,
    notes,
    unsupportedReason,
    breakdown: {
      acquisitionTaxRate: pctStr(taxRate),
      farmSpecialTaxRate: pctStr(farmSpecialTaxRate),
      localEduTaxRate: pctStr(localEduTaxRate),
    },
  };
}

/* ─────────────────────────────────────────────
   월세 vs 전세 비교 계산
───────────────────────────────────────────── */

export interface JeonseVsWolseResult {
  jeonseMonthlyOpportunityCost: number; // 전세 월 기회비용 (원)
  wolseMonthlyTotalCost: number; // 월세 월 실질 비용 (원)
  jeonseIsBetter: boolean;
  monthlyDiff: number; // 절대값 차이 (원)
  yearlyDiff: number; // 연간 차이 (원)
  breakEvenRate: number; // 손익분기 연 이자율 (%)
}

export function calcJeonseVsWolse(
  jeonseDepositMan: number, // 전세 보증금 (만원)
  wolseDepositMan: number, // 월세 보증금 (만원)
  wolseMonthlyMan: number, // 월 임대료 (만원)
  investRatePct: number, // 연 이자율 (%, e.g. 3.5)
): JeonseVsWolseResult {
  const rMonthly = investRatePct / 100 / 12;

  const jeonseOpp = jeonseDepositMan * 10_000 * rMonthly;
  const wolseDeposOpp = wolseDepositMan * 10_000 * rMonthly;
  const wolseTotal = wolseDeposOpp + wolseMonthlyMan * 10_000;

  const rawDiff = wolseTotal - jeonseOpp;
  const jeonseIsBetter = rawDiff > 0;
  const monthlyDiff = Math.floor(Math.abs(rawDiff));
  const yearlyDiff = monthlyDiff * 12;

  // 손익분기: jeonseDeposit × r/12 = wolseDeposit × r/12 + wolseMonthly
  // → r = wolseMonthly / (jeonseDeposit − wolseDeposit) × 12 × 100
  const depositDiff = jeonseDepositMan - wolseDepositMan;
  const breakEvenRate =
    depositDiff > 0
      ? Math.round((wolseMonthlyMan / depositDiff) * 12 * 100 * 100) / 100
      : 0;

  return {
    jeonseMonthlyOpportunityCost: Math.floor(jeonseOpp),
    wolseMonthlyTotalCost: Math.floor(wolseTotal),
    jeonseIsBetter,
    monthlyDiff,
    yearlyDiff,
    breakEvenRate,
  };
}

/* ─────────────────────────────────────────────
   부동산 수익률 계산 (월세 임대 기준)
───────────────────────────────────────────── */

export interface PropertyYieldResult {
  monthlyInterest: number; // 월 대출 이자 (원)
  monthlyNetIncome: number; // 월 순수익 (원)
  annualNetIncome: number; // 연 순수익 (원)

  /** 취득 부대비용 (원). 입력하지 않으면 0 */
  extraCostWon: number;
  /** 실투자금 = 매입가 + 취득 부대비용 − 보증금 − 대출금 (원) */
  investedCapital: number;
  /** 부대비용을 뺀 실투자금 = 매입가 − 보증금 − 대출금 (원). 비교 표시용 */
  investedCapitalWithoutExtra: number;

  purchaseYield: number; // 매입가 기준 수익률 (%) — 부대비용 미포함
  /** 자기자본 수익률 (%) — 분모에 부대비용 포함 */
  equityYield: number;
  /** 부대비용을 제외한 분모로 계산한 자기자본 수익률 (%). 차이 안내용 */
  equityYieldWithoutExtra: number;

  isInvestedNegative: boolean; // 실투자금이 0 이하인 경우
}

export interface PropertyYieldInput {
  purchasePriceMan: number; // 매입가 (만원)
  depositMan: number; // 임대 보증금 (만원)
  monthlyRentMan: number; // 월세 (만원)
  loanAmountMan: number; // 대출금 (만원)
  loanRatePct: number; // 대출 연 금리 (%)
  monthlyCostMan: number; // 월 관리·기타비용 (만원)
  /**
   * 취득 부대비용 (만원). 취득세·중개보수·등기비용 등 매입 시점의 일회성 비용.
   *
   * ⚠️ 생략하면 0 이며, 그때 결과는 이 필드를 추가하기 이전과 완전히 같다.
   *    실투자금 계산기에서 인계될 때만 값이 채워진다.
   */
  extraCostMan?: number;
}

/**
 * 월세 임대 기준 수익률.
 *
 * ⚠️ 두 가지 '실투자금'
 *   실투자금 계산기 : 총필요자금(매매가 + 부대비용) − 대출 − 보증금
 *   이 함수(기존)   : 매입가 − 보증금 − 대출금            ← 부대비용 제외
 *
 *   extraCostMan 을 받으면 두 정의가 일치한다. 분모가 커지므로 자기자본
 *   수익률은 낮아진다(= 더 보수적). 차이를 화면에서 보여줄 수 있도록
 *   부대비용을 뺀 값도 함께 돌려준다.
 *
 * ⚠️ purchaseYield(매입가 기준 수익률)에는 부대비용을 넣지 않는다.
 *    이름 그대로 매입가 대비 임대료 비율이며, 매물 간 비교용 지표다.
 */
export function calcPropertyYield(
  input: PropertyYieldInput,
): PropertyYieldResult {
  const priceWon = input.purchasePriceMan * 10_000;
  const depWon = input.depositMan * 10_000;
  const rentWon = input.monthlyRentMan * 10_000;
  const loanWon = input.loanAmountMan * 10_000;
  const costWon = input.monthlyCostMan * 10_000;
  const extraCostWon = Math.max(0, input.extraCostMan ?? 0) * 10_000;

  const monthlyInterest =
    loanWon > 0 && input.loanRatePct > 0
      ? (loanWon * input.loanRatePct) / 100 / 12
      : 0;

  const monthlyNetIncome = rentWon - monthlyInterest - costWon;
  const annualNetIncome = monthlyNetIncome * 12;

  const investedCapitalWithoutExtra = priceWon - depWon - loanWon;
  const investedCapital = investedCapitalWithoutExtra + extraCostWon;

  const purchaseYield = priceWon > 0 ? ((rentWon * 12) / priceWon) * 100 : 0;

  const yieldOn = (denominator: number) =>
    denominator > 0 ? (annualNetIncome / denominator) * 100 : 0;

  return {
    monthlyInterest: Math.floor(monthlyInterest),
    monthlyNetIncome: Math.floor(monthlyNetIncome),
    annualNetIncome: Math.floor(annualNetIncome),
    extraCostWon,
    investedCapital: Math.floor(investedCapital),
    investedCapitalWithoutExtra: Math.floor(investedCapitalWithoutExtra),
    purchaseYield,
    equityYield: yieldOn(investedCapital),
    equityYieldWithoutExtra: yieldOn(investedCapitalWithoutExtra),
    isInvestedNegative: investedCapital <= 0,
  };
}

// ─────────────────────────────────────────────
// 전월세 전환율 (전세 ↔ 월세 환산 이율)
//   · calcJeonseVsWolse(투자 이자율 기준 기회비용 비교)와 역할이 다르다.
//     이 함수는 "전세보증금 일부를 월세로 돌릴 때 적용된 환산 이율"을 계산한다.
//   · 전환율 = (월세 × 12) ÷ (전세보증금 − 월세보증금) × 100
//   · 법정 상한(주택) = min(연 10%, 한국은행 기준금리 + 대통령령 이율 2%)
//     (주택임대차보호법 제7조의2 각 호 중 낮은 비율, 시행령 제9조 ①②)
//   · 판정은 하지 않는다. 상한 초과 여부는 사실로만 표시한다. 이 상한은 기존
//     임대차에서 보증금의 전부 또는 일부를 월세로 전환하는 경우에 적용되는 기준이다.
// ─────────────────────────────────────────────

// ⚠️ 시간민감 규제 수치 — 금통위마다 바뀔 수 있음. 검증일자 확인 필수.
// 주택 월차임 전환율 상한 = min(연 10%, 기준금리 + 연 2%)
// (주택임대차보호법 제7조의2 각 호 중 낮은 비율, 시행령 제9조 ①②)
export const CONVERSION_RATE_INFO = {
  fixedCapPct: 10, // 시행령 제9조① "연 1할" (대통령령상 고정 비율)
  baseRatePct: 3.0, // 한국은행 기준금리 (2026-08-27 금통위 0.25%p 인상, 2회 연속)
  legalAddPct: 2.0, // 시행령 제9조② 대통령령 이율
  verifiedAt: "2026-08-28", // 다음 금통위: 2026-10-22 (이후 변동 가능)
  source: "한국은행 기준금리 · 주택임대차보호법 제7조의2 · 시행령 제9조",
};

/**
 * 주택 전월세 전환 법정 상한(%) = min(연 10%, 기준금리 + 대통령령 이율).
 *
 * 같은 계산이 엔진·컴포넌트·페이지 예시에 흩어져 있으면 기준금리를 바꿀 때
 * 일부만 갱신되어 화면 안에서 값이 어긋난다. 단일 함수로 둔다.
 */
export function getLegalConversionCapPct(): number {
  return Math.min(
    CONVERSION_RATE_INFO.fixedCapPct,
    CONVERSION_RATE_INFO.baseRatePct + CONVERSION_RATE_INFO.legalAddPct,
  );
}

export interface ConversionInput {
  jeonseDepositMan: number; // 전세보증금 (만원)
  wolseDepositMan: number; // 전환 후 월세보증금 (만원)
  wolseMonthlyMan: number; // 월세 (만원)
}

export interface ConversionResult {
  convertedAmountMan: number; // 전환 대상 금액 = 전세보증금 − 월세보증금 (만원)
  appliedRatePct: number; // 적용 전환율 (%)
  legalCapPct: number; // 법정 상한 = min(연 10%, 기준금리 + 대통령령 이율) (%)
  exceedsCap: boolean; // 적용 전환율 > 법정 상한
  legalCapMonthlyMan: number; // 법정 상한 적용 시 월세 (만원)
}

export function calcJeonseWolseConversion(
  input: ConversionInput,
): ConversionResult {
  const { jeonseDepositMan, wolseDepositMan, wolseMonthlyMan } = input;

  const converted = jeonseDepositMan - wolseDepositMan; // 만원 (전환 대상)
  // 법정 상한 = min(연 10%, 기준금리 + 대통령령 이율) — 주임법 제7조의2 각 호 중 낮은 비율
  const legalCapPct = getLegalConversionCapPct();

  if (converted <= 0) {
    return {
      convertedAmountMan: 0,
      appliedRatePct: 0,
      legalCapPct,
      exceedsCap: false,
      legalCapMonthlyMan: 0,
    };
  }

  // 전환율은 만원/만원 비율이라 단위 변환 불필요
  const appliedRatePct = ((wolseMonthlyMan * 12) / converted) * 100;
  const legalCapMonthlyMan = (converted * (legalCapPct / 100)) / 12;

  return {
    convertedAmountMan: converted,
    appliedRatePct,
    legalCapPct,
    exceedsCap: appliedRatePct > legalCapPct,
    legalCapMonthlyMan,
  };
}

// ─────────────────────────────────────────────
// 공실률 영향 (공실이 임대수익에 미치는 감소 효과)
//   · calcPropertyYield(만실 가정 수익률)의 공백을 채운다 — 공실 미반영이 그 함수의
//     명시적 한계이므로 역할이 겹치지 않는다.
//   · 감소율을 둘로 구분: 임대수입 감소율(=공실률) vs 순수익 감소율(운영비 반영).
//     운영비는 공실과 무관하게 나가므로 순수익 감소율이 공실률보다 크다.
//   · 판정/추천은 하지 않는다. 입력 기준 단순 시뮬레이션 수치만 제공.
//   · 매입가(선택) 입력 시 만실 순수익률과 공실 반영 실효 수익률을 함께 제공.
// ─────────────────────────────────────────────

export interface VacancyImpactInput {
  monthlyRentMan: number; // 월세 (만원)
  vacancyRatePct: number; // 공실률 (%)
  monthlyOpCostMan: number; // 월 운영비 (만원)
  purchasePriceMan?: number; // 매입가 (만원) — 선택
}

export interface VacancyImpactResult {
  grossAnnualIncome: number; // 연 만실 임대수입 (원)
  vacancyLoss: number; // 공실 손실 (원)
  effectiveIncome: number; // 공실 반영 임대수입 (원)
  annualOpCost: number; // 연 운영비 (원)
  fullNetIncome: number; // 만실 순수익 (원)
  effectiveNetIncome: number; // 공실 반영 순수익 (원)
  vacancyMonths: number; // 연 공실 개월수
  incomeDropPct: number; // 임대수입 감소율 (%) = 공실률
  netDropPct: number | null; // 순수익 감소율 (%) — 운영비 반영. 만실 순수익 0 이하면 null(산정 불가)
  fullNetYield: number | null; // 만실 순수익 기준 수익률 (%)
  effectiveNetYield: number | null; // 공실 반영 순수익 기준 수익률 (%)
}

export function calcVacancyImpact(
  input: VacancyImpactInput,
): VacancyImpactResult {
  const { monthlyRentMan, vacancyRatePct, monthlyOpCostMan, purchasePriceMan } =
    input;

  const grossAnnualIncome = monthlyRentMan * 12 * 10_000;
  const vacancyLoss = grossAnnualIncome * (vacancyRatePct / 100);
  const effectiveIncome = grossAnnualIncome - vacancyLoss;

  const annualOpCost = monthlyOpCostMan * 12 * 10_000;
  const fullNetIncome = grossAnnualIncome - annualOpCost;
  const effectiveNetIncome = effectiveIncome - annualOpCost;

  const vacancyMonths = (vacancyRatePct * 12) / 100;
  const incomeDropPct = vacancyRatePct;
  const netDropPct =
    fullNetIncome > 0
      ? ((fullNetIncome - effectiveNetIncome) / fullNetIncome) * 100
      : null;

  const priceWon =
    purchasePriceMan && purchasePriceMan > 0 ? purchasePriceMan * 10_000 : 0;
  const fullNetYield = priceWon > 0 ? (fullNetIncome / priceWon) * 100 : null;
  const effectiveNetYield =
    priceWon > 0 ? (effectiveNetIncome / priceWon) * 100 : null;

  return {
    grossAnnualIncome,
    vacancyLoss,
    effectiveIncome,
    annualOpCost,
    fullNetIncome,
    effectiveNetIncome,
    vacancyMonths,
    incomeDropPct,
    netDropPct,
    fullNetYield,
    effectiveNetYield,
  };
}
