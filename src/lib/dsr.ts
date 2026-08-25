// src/lib/dsr.ts
// ─────────────────────────────────────────────
// 스트레스 DSR 계산 엔진
//
// ⚠️ 이 파일에는 정책값을 두지 않습니다.
//    모든 수치는 @/lib/policy/dsr 에서 가져옵니다.
//    값을 고쳐야 한다면 이 파일이 아니라 정책 파일을 고치세요.
//
// 조사 근거: 프로젝트 문서 claude/DSR-POLICY-2026-08.md (rev.2)
//
// 현재 범위:
//   · 대상: 주택담보대출. (신용대출·전세자금대출은 다음 단계)
//   · 기존 부채 = 사용자가 DSR 산정용 연간 원리금을 직접 입력
//   · 신규 대출 = 원리금균등 / 원금균등 만 지원 (만기일시·거치식 제외)
//   · 금리유형 = 변동형 / 순수고정형 만 지원 (혼합형·주기형 제외)
//
// ── 다음 단계에서 다룰 것 (근거는 정책 문서 rev.2 참고) ──
//   1) 신용대출
//        · 게이팅: 신용대출 총잔액(기존+신규) 1억원 초과 시에만 스트레스 적용
//        · 금리유형별 적용비율: 5년↑ 고정 0% / 3~5년 고정 60% / 그 밖 100%
//        · 지역 구분 없음 — 지방 유예는 주담대 한정이므로 Region 을 넘기지 말 것
//        · 산정만기 5년 (일시상환·마이너스통장). 마이너스통장은 약정한도 전액 기준
//        · ⚠️ "모든 신용대출 일괄 5년" 아님 — 적격 분할상환은 실제만기 예외가 있으나
//             인정 요건·산식의 1차 원문 미확인 → 사용자 직접 입력으로 처리
//   2) 전세자금대출 — 단일 규칙 아님
//        · 무주택자: DSR 산정 제외
//        · 1주택 + 수도권·규제지역 임차: 이자상환분만 반영
//        · 단순 만기연장: 신규 적용 제외 / 증액분: 신규대출로 취급
//        · 그 밖: 자동 판정하지 않음
// ─────────────────────────────────────────────

import {
  monthlyRate,
  equalPaymentMonthly,
  principalFromPayment,
} from "@/lib/loan";
import {
  DSR_POLICY_META,
  getMortgageStressRatePct,
  LOCAL_MORTGAGE_DEFERRAL_UNTIL,
  DSR_LIMIT,
  type MortgageRegion,
} from "@/lib/policy/dsr";

export { LOCAL_MORTGAGE_DEFERRAL_UNTIL, DSR_LIMIT };

// ── 타입 ──
/**
 * 주택담보대출 지역 구분.
 * 정책 레이어의 MortgageRegion 과 같은 타입입니다(기존 이름 유지).
 */
export type Region = MortgageRegion; // "metro" | "local"
export type RateType = "variable" | "fixed"; // 변동형 / 순수고정형(만기까지 고정)
export type DsrRepayment = "equal_payment" | "equal_principal"; // 원리금균등 / 원금균등

/** 정책 검증일 — 정책 레이어가 단일 출처 */
export const DSR_VERIFIED_DATE = DSR_POLICY_META.verifiedAt;

/**
 * 정책값을 찾지 못하면 값을 추정하지 않고 사유를 돌려준다.
 * (lib/policy/types 의 lookupPolicy 와 같은 규약)
 */
export type DsrOutcome<T> =
  { status: "ok"; value: T } | { status: "unsupported"; reason: string };

/** 오늘(Asia/Seoul) YYYY-MM-DD. 유예 만료 판정에 쓴다. */
export function todayKst(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

// ─────────────────────────────────────────────
// 유효 스트레스 금리(%p) — 주택담보대출
//   변동형: 정책 레이어에서 지역별로 조회
//   순수고정형(만기까지 고정): 미래 금리변동 위험이 없어 0
//
//   ⚠️ 지방 유예가 만료되면 정책 레이어가 값을 돌려주지 않습니다.
//      그 경우 임의 대체값을 쓰지 않고 unsupported 로 되돌립니다.
// ─────────────────────────────────────────────
export function getEffectiveStressRate(params: {
  region: Region;
  rateType: RateType;
  asOf?: string;
}): DsrOutcome<number> {
  if (params.rateType === "fixed") return { status: "ok", value: 0 };

  const asOf = params.asOf ?? todayKst();
  const pct = getMortgageStressRatePct({ region: params.region, asOf });

  if (pct === null) {
    return {
      status: "unsupported",
      reason:
        `지방(비규제) 주택담보대출의 스트레스 금리 유예가 ${LOCAL_MORTGAGE_DEFERRAL_UNTIL}자로 종료되어, ` +
        "현재 적용 기준을 확인하기 전에는 계산하지 않습니다. 금융회사 또는 금융위원회 공시로 확인하세요.",
    };
  }

  return { status: "ok", value: pct };
}

// ─────────────────────────────────────────────
// 신규 대출의 DSR 산정용 연간 원리금
//   · 원리금균등 : 월 상환액 × 12
//   · 원금균등   : 첫해(부담 최대) 기준 = 원금/기간×12 + 첫 12개월 이자 합
//   ⚠️ DSR 분자는 실제 상환액과 다를 수 있음(대출종류·상환방식별 산정규칙 상이).
// ─────────────────────────────────────────────
export function calcNewLoanAnnualDebtService(
  principal: number,
  ratePercent: number,
  months: number,
  repayment: DsrRepayment,
): number {
  if (principal <= 0 || months <= 0) return 0;

  const r = monthlyRate(ratePercent);

  if (repayment === "equal_payment") {
    return equalPaymentMonthly(principal, r, months) * 12;
  }

  // 원금균등: 첫해 원리금 (원금 균등분할 + 잔액 기준 이자)
  const monthsInYear = Math.min(12, months);
  const principalPay = principal / months;
  let balance = principal;
  let interestSum = 0;

  for (let i = 0; i < monthsInYear; i++) {
    interestSum += balance * r;
    balance -= principalPay;
  }

  return principalPay * monthsInYear + interestSum;
}

// ─────────────────────────────────────────────
// 모드 A: DSR 확인
// ─────────────────────────────────────────────
export interface DsrCheckInput {
  annualIncome: number; // 원
  existingAnnualDebt: number; // 원 (직접 입력)
  newPrincipal: number; // 원
  ratePercent: number; // 실제 대출 금리(%)
  months: number;
  repayment: DsrRepayment;
  region: Region;
  rateType: RateType;
  limitPercent: number; // 선택한 DSR 기준 (40 | 50)
  /** 유예 만료 판정 기준일. 생략하면 오늘(Asia/Seoul) */
  asOf?: string;
}

export interface DsrCheckResult {
  effectiveStressRate: number; // %p
  stressedRatePercent: number; // 실제금리 + 스트레스금리
  newAnnualDebtNormal: number; // 원
  newAnnualDebtStressed: number; // 원
  dsrNormal: number; // %
  dsrStressed: number; // %
  headroomAnnual: number; // 원 (스트레스 기준 남은 연간 상환여력, 음수면 초과)
  exceeded: boolean; // 스트레스 DSR 이 기준 초과 여부
  exceedByPct: number; // %p (dsrStressed − limit)
}

export function calcDsr(input: DsrCheckInput): DsrOutcome<DsrCheckResult> {
  const stress = getEffectiveStressRate({
    region: input.region,
    rateType: input.rateType,
    asOf: input.asOf,
  });
  if (stress.status === "unsupported") return stress;

  const effectiveStressRate = stress.value;
  const stressedRatePercent = input.ratePercent + effectiveStressRate;

  const newAnnualDebtNormal = calcNewLoanAnnualDebtService(
    input.newPrincipal,
    input.ratePercent,
    input.months,
    input.repayment,
  );
  const newAnnualDebtStressed = calcNewLoanAnnualDebtService(
    input.newPrincipal,
    stressedRatePercent,
    input.months,
    input.repayment,
  );

  const dsrNormal =
    input.annualIncome > 0
      ? ((input.existingAnnualDebt + newAnnualDebtNormal) /
          input.annualIncome) *
        100
      : 0;
  const dsrStressed =
    input.annualIncome > 0
      ? ((input.existingAnnualDebt + newAnnualDebtStressed) /
          input.annualIncome) *
        100
      : 0;

  // 규제 게이트는 스트레스 DSR 기준
  const headroomAnnual =
    (input.annualIncome * input.limitPercent) / 100 -
    (input.existingAnnualDebt + newAnnualDebtStressed);

  return {
    status: "ok",
    value: {
      effectiveStressRate,
      stressedRatePercent,
      newAnnualDebtNormal,
      newAnnualDebtStressed,
      dsrNormal,
      dsrStressed,
      headroomAnnual,
      exceeded: dsrStressed > input.limitPercent,
      exceedByPct: dsrStressed - input.limitPercent,
    },
  };
}

// ─────────────────────────────────────────────
// 모드 B: DSR 기준 추정 가능 대출액
//   허용 연간 원리금 = 연소득 × 목표 DSR
//   신규 가용 = 허용 − 기존 (≤0이면 0)
//   원금 = principalFromPayment(월 가용, 스트레스 금리 월이율, 기간)
//   ※ 역산은 반드시 스트레스 금리 기준 (명목 역산은 한도 과대계상)
//   ※ 원리금균등 기준 역산
// ─────────────────────────────────────────────
export interface DsrEstimateInput {
  annualIncome: number; // 원
  existingAnnualDebt: number; // 원
  limitPercent: number; // 목표 DSR (40 | 50)
  ratePercent: number;
  months: number;
  region: Region;
  rateType: RateType;
  /** 유예 만료 판정 기준일. 생략하면 오늘(Asia/Seoul) */
  asOf?: string;
}

export interface DsrEstimateResult {
  effectiveStressRate: number; // %p
  stressedRatePercent: number;
  allowedAnnualDebt: number; // 원 (연소득 × 목표DSR)
  availableForNew: number; // 원 (허용 − 기존, ≥0)
  estimatedPrincipal: number; // 원 (DSR 기준 추정 가능 대출액, 스트레스 역산)
  monthlyPaymentActual: number; // 원 (그 원금의 실제금리 기준 월 상환액 — 참고)
}

export function estimatePrincipalFromDsr(
  input: DsrEstimateInput,
): DsrOutcome<DsrEstimateResult> {
  const stress = getEffectiveStressRate({
    region: input.region,
    rateType: input.rateType,
    asOf: input.asOf,
  });
  if (stress.status === "unsupported") return stress;

  const effectiveStressRate = stress.value;
  const stressedRatePercent = input.ratePercent + effectiveStressRate;

  const allowedAnnualDebt = (input.annualIncome * input.limitPercent) / 100;
  const availableForNew = Math.max(
    0,
    allowedAnnualDebt - input.existingAnnualDebt,
  );

  const monthlyAvailable = availableForNew / 12;
  const estimatedPrincipal = principalFromPayment(
    monthlyAvailable,
    monthlyRate(stressedRatePercent),
    input.months,
  );

  const monthlyPaymentActual = equalPaymentMonthly(
    estimatedPrincipal,
    monthlyRate(input.ratePercent),
    input.months,
  );

  return {
    status: "ok",
    value: {
      effectiveStressRate,
      stressedRatePercent,
      allowedAnnualDebt,
      availableForNew,
      estimatedPrincipal,
      monthlyPaymentActual,
    },
  };
}
