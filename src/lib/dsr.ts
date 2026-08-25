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
// 범위
//   신규 대출 : 주택담보대출 | 신용대출
//   기존 부채 : 기타 부채(연간 원리금 직접 입력)
//               + 신용대출·마이너스통장(구조화 입력)
//               + 전세자금대출(5상태)
//
// 지원하지 않는 것 — 값을 추정하지 않고 계산을 차단한다
//   · 주담대 혼합형·주기형, 만기일시·거치식
//   · 적격 분할상환 신용대출의 실제만기 인정 (요건·산식 1차 원문 미확인)
//       → 사용자가 실제 연간 원리금을 직접 입력
//   · 전세자금대출의 '그 밖의 조건'
//   · 지방 주담대 유예 만료 이후 기준
// ─────────────────────────────────────────────

import {
  monthlyRate,
  equalPaymentMonthly,
  principalFromPayment,
} from "@/lib/loan";
import {
  DSR_POLICY_META,
  getMortgageStressRatePct,
  getCreditStressRatePct,
  CREDIT_ASSESSMENT_TERM_YEARS,
  CREDIT_STRESS_GATE_WON,
  LOCAL_MORTGAGE_DEFERRAL_UNTIL,
  DSR_LIMIT,
  type MortgageRegion,
  type CreditFixedTerm,
} from "@/lib/policy/dsr";

export { LOCAL_MORTGAGE_DEFERRAL_UNTIL, DSR_LIMIT, CREDIT_STRESS_GATE_WON };
export type { CreditFixedTerm };

// ─────────────────────────────────────────────
// 타입
// ─────────────────────────────────────────────

/** 주택담보대출 지역 구분. 정책 레이어의 MortgageRegion 과 같은 타입(기존 이름 유지). */
export type Region = MortgageRegion; // "metro" | "local"
export type RateType = "variable" | "fixed"; // 변동형 / 순수고정형(만기까지 고정)
export type DsrRepayment = "equal_payment" | "equal_principal"; // 원리금균등 / 원금균등

/** 신규 대출 종류 */
export type NewLoanKind = "mortgage" | "credit";

/**
 * 신용대출 상환 유형.
 *   lumpSum     — 일시상환. 산정만기 5년
 *   creditLine  — 마이너스통장. 약정한도 전액을 원금으로 보고 산정만기 5년
 *   installment — 분할상환. 실제만기 인정 요건·산식 미확인 → 직접 입력
 */
export type CreditRepaymentKind = "lumpSum" | "creditLine" | "installment";

/** 전세자금대출 5상태 — 조용한 0원을 막기 위해 미선택·없음을 별도 상태로 둔다. */
export type JeonseInput =
  | { status: "unselected" }
  | { status: "none" }
  | { status: "noHouse" }
  | { status: "oneHouseMetro"; annualInterest: number }
  | { status: "other" };

/** 정책 검증일 — 정책 레이어가 단일 출처 */
export const DSR_VERIFIED_DATE = DSR_POLICY_META.verifiedAt;

/**
 * 값을 찾지 못하면 추정하지 않고 사유를 돌려준다.
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
// 유효 스트레스 금리(%p) — 신용대출
//
//   ⚠️ 지역 인자를 받지 않습니다. 지방 유예는 주담대 한정이며
//      신용대출 스트레스는 전국 동일합니다.
//   게이팅: 신용대출 총잔액(기존 + 신규)이 1억원을 넘을 때만 적용됩니다.
// ─────────────────────────────────────────────
export function getCreditEffectiveStressRate(params: {
  fixedTerm: CreditFixedTerm;
  creditTotalWon: number;
}): number {
  return getCreditStressRatePct(params);
}

// ─────────────────────────────────────────────
// 신규 주택담보대출의 DSR 산정용 연간 원리금
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
// 신용대출의 DSR 산정용 연간 원리금
//   산정만기 5년 기준 원금균등으로 산정한다.
//
//   ⚠️ 마이너스통장은 사용액이 아니라 약정한도 전액이 principal 이다.
//   ⚠️ 분할상환 신용대출은 이 함수를 쓰지 않는다.
//      실제만기 인정 요건과 원금 산식의 1차 원문을 확인하지 못했으므로
//      사용자가 실제 연간 원리금을 직접 입력한다.
// ─────────────────────────────────────────────
export function calcCreditAnnualDebtService(
  principal: number,
  ratePercent: number,
): number {
  return calcNewLoanAnnualDebtService(
    principal,
    ratePercent,
    CREDIT_ASSESSMENT_TERM_YEARS * 12,
    "equal_principal",
  );
}

// ─────────────────────────────────────────────
// 기존 부채
// ─────────────────────────────────────────────

export interface ExistingDebtInput {
  /** 기타 부채의 DSR 산정용 연간 원리금 — 사용자 직접 입력 */
  otherAnnualDebt: number;
  /** 기존 일시상환 신용대출 잔액 (적격 분할상환은 실제 연간 원리금으로 입력) */
  creditBalance: number;
  /** 기존 마이너스통장 약정한도 — 사용액이 아니라 한도 전액 */
  creditLineLimit: number;
  /** 기존 신용대출·마이너스통장의 평균 금리(%) */
  creditRatePercent: number;
  /** 전세자금대출 */
  jeonse: JeonseInput;
}

export interface ExistingDebtBreakdown {
  /** 합산된 연간 원리금 (원) */
  annualDebt: number;
  otherAnnualDebt: number;
  creditAnnualDebt: number;
  jeonseAnnualDebt: number;
  /** 신용대출 게이팅 판정에 쓰는 기존 신용대출 총잔액 (원) */
  existingCreditTotal: number;
  /** 전세대출이 0원으로 잡힌 이유 — '없음'과 '무주택 제외'를 구분해 표시한다 */
  jeonseNote: string | null;
  warnings: string[];
}

export function resolveExistingDebt(
  input: ExistingDebtInput,
): DsrOutcome<ExistingDebtBreakdown> {
  const { jeonse } = input;

  if (jeonse.status === "unselected") {
    return {
      status: "unsupported",
      reason:
        "전세자금대출 여부를 선택해 주세요. 전세대출은 주택 보유 여부와 지역에 따라 " +
        "DSR 산정에서 제외되기도 하고 이자만 반영되기도 하므로, 선택하지 않으면 계산하지 않습니다.",
    };
  }

  if (jeonse.status === "other") {
    return {
      status: "unsupported",
      reason:
        "선택하신 전세자금대출 조건은 이 계산기가 자동으로 판정하지 않습니다. " +
        "무주택자는 원칙적으로 DSR 산정에서 제외되고, 1주택자가 수도권·규제지역에서 임차인으로 받는 " +
        "전세대출은 이자상환분만 반영됩니다. 그 밖의 조건은 금융회사에 확인하세요.",
    };
  }

  const existingCreditTotal = input.creditBalance + input.creditLineLimit;

  const creditAnnualDebt =
    existingCreditTotal > 0
      ? calcCreditAnnualDebtService(
          existingCreditTotal,
          input.creditRatePercent,
        )
      : 0;

  const jeonseAnnualDebt =
    jeonse.status === "oneHouseMetro" ? Math.max(0, jeonse.annualInterest) : 0;

  const jeonseNote =
    jeonse.status === "noHouse"
      ? "무주택자 전세자금대출은 원칙적으로 DSR 산정에서 제외되어 0원으로 반영했습니다."
      : jeonse.status === "none"
        ? null
        : jeonse.status === "oneHouseMetro"
          ? "1주택자가 수도권·규제지역에서 받는 전세대출은 이자상환분만 반영합니다."
          : null;

  const warnings: string[] = [];
  if (input.otherAnnualDebt > 0 && existingCreditTotal > 0) {
    warnings.push(
      "'기타 부채 연간 원리금'과 '기존 신용대출'을 함께 입력하셨습니다. " +
        "기타 부채 금액에 신용대출·마이너스통장이 이미 포함돼 있다면 같은 빚이 두 번 더해집니다. " +
        "기타 부채에는 신용대출을 빼고 입력하세요.",
    );
  }
  if (input.otherAnnualDebt > 0 && jeonseAnnualDebt > 0) {
    warnings.push(
      "'기타 부채 연간 원리금'에 전세자금대출 이자가 이미 포함돼 있다면 두 번 더해집니다.",
    );
  }

  return {
    status: "ok",
    value: {
      annualDebt: input.otherAnnualDebt + creditAnnualDebt + jeonseAnnualDebt,
      otherAnnualDebt: input.otherAnnualDebt,
      creditAnnualDebt,
      jeonseAnnualDebt,
      existingCreditTotal,
      jeonseNote,
      warnings,
    },
  };
}

// ─────────────────────────────────────────────
// 신규 대출
// ─────────────────────────────────────────────

export interface NewMortgageInput {
  kind: "mortgage";
  principal: number;
  ratePercent: number;
  months: number;
  repayment: DsrRepayment;
  region: Region;
  rateType: RateType;
}

export interface NewCreditInput {
  kind: "credit";
  /** 일시상환·분할상환은 대출금액, 마이너스통장은 약정한도 */
  amount: number;
  ratePercent: number;
  repaymentKind: CreditRepaymentKind;
  fixedTerm: CreditFixedTerm;
  /** 분할상환일 때만 사용 — 사용자가 직접 입력한 연간 원리금 */
  installmentAnnualDebt?: number;
}

export type NewLoanInput = NewMortgageInput | NewCreditInput;

interface NewLoanResolved {
  /** 적용 스트레스 금리(%p) */
  stressPct: number;
  /** 스트레스 미적용 기준 연간 원리금 */
  annualNormal: number;
  /** 스트레스 적용 기준 연간 원리금 */
  annualStressed: number;
  /** 신용대출 게이팅 통과 여부 (주담대는 null) */
  creditGatePassed: boolean | null;
  /** 신용대출 총잔액 (주담대는 null) */
  creditTotalWon: number | null;
  notes: string[];
}

function resolveNewLoan(
  loan: NewLoanInput,
  existingCreditTotal: number,
  asOf: string | undefined,
): DsrOutcome<NewLoanResolved> {
  if (loan.kind === "mortgage") {
    const stress = getEffectiveStressRate({
      region: loan.region,
      rateType: loan.rateType,
      asOf,
    });
    if (stress.status === "unsupported") return stress;

    return {
      status: "ok",
      value: {
        stressPct: stress.value,
        annualNormal: calcNewLoanAnnualDebtService(
          loan.principal,
          loan.ratePercent,
          loan.months,
          loan.repayment,
        ),
        annualStressed: calcNewLoanAnnualDebtService(
          loan.principal,
          loan.ratePercent + stress.value,
          loan.months,
          loan.repayment,
        ),
        creditGatePassed: null,
        creditTotalWon: null,
        notes: [],
      },
    };
  }

  // ── 신용대출 ──
  const creditTotalWon = existingCreditTotal + loan.amount;
  const stressPct = getCreditEffectiveStressRate({
    fixedTerm: loan.fixedTerm,
    creditTotalWon,
  });
  const creditGatePassed = creditTotalWon > CREDIT_STRESS_GATE_WON;

  const notes: string[] = [];
  if (!creditGatePassed) {
    notes.push(
      "신용대출 총잔액(기존 + 신규)이 1억원 이하라 스트레스 금리가 적용되지 않았습니다.",
    );
  }
  if (loan.repaymentKind === "creditLine") {
    notes.push(
      "마이너스통장은 사용액이 아니라 약정한도 전액을 대출금액으로 보고 산정했습니다.",
    );
  }

  if (loan.repaymentKind === "installment") {
    const direct = loan.installmentAnnualDebt;
    if (direct === undefined || direct <= 0) {
      return {
        status: "unsupported",
        reason:
          "분할상환 신용대출은 요건에 따라 실제 만기(최장 10년)를 인정받을 수 있는데, " +
          "그 인정 요건과 원금 산식을 공식 원문에서 확인하지 못했습니다. " +
          "일괄 5년으로 계산하면 DSR이 실제보다 높게 나올 수 있어 자동 계산하지 않습니다. " +
          "금융회사에서 안내받은 DSR 산정용 연간 원리금을 직접 입력해 주세요.",
      };
    }
    notes.push(
      "분할상환 신용대출은 직접 입력하신 연간 원리금을 그대로 사용했습니다. " +
        "스트레스 금리는 이 금액에 자동으로 더해지지 않습니다.",
    );
    return {
      status: "ok",
      value: {
        stressPct,
        annualNormal: direct,
        annualStressed: direct,
        creditGatePassed,
        creditTotalWon,
        notes,
      },
    };
  }

  return {
    status: "ok",
    value: {
      stressPct,
      annualNormal: calcCreditAnnualDebtService(loan.amount, loan.ratePercent),
      annualStressed: calcCreditAnnualDebtService(
        loan.amount,
        loan.ratePercent + stressPct,
      ),
      creditGatePassed,
      creditTotalWon,
      notes,
    },
  };
}

// ─────────────────────────────────────────────
// 모드 A: DSR 확인
// ─────────────────────────────────────────────
export interface DsrCheckInput {
  annualIncome: number; // 원
  existing: ExistingDebtInput;
  newLoan: NewLoanInput;
  limitPercent: number; // 선택한 DSR 기준 (40 | 50)
  /** 유예 만료 판정 기준일. 생략하면 오늘(Asia/Seoul) */
  asOf?: string;
}

export interface DsrCheckResult {
  effectiveStressRate: number; // %p
  stressedRatePercent: number; // 실제금리 + 스트레스금리
  existingAnnualDebt: number; // 원
  newAnnualDebtNormal: number; // 원
  newAnnualDebtStressed: number; // 원
  dsrNormal: number; // %
  dsrStressed: number; // %
  headroomAnnual: number; // 원 (스트레스 기준 남은 연간 상환여력, 음수면 초과)
  exceeded: boolean;
  exceedByPct: number; // %p (dsrStressed − limit)
  breakdown: ExistingDebtBreakdown;
  creditGatePassed: boolean | null;
  creditTotalWon: number | null;
  notes: string[];
  warnings: string[];
}

export function calcDsr(input: DsrCheckInput): DsrOutcome<DsrCheckResult> {
  const existing = resolveExistingDebt(input.existing);
  if (existing.status === "unsupported") return existing;

  const resolved = resolveNewLoan(
    input.newLoan,
    existing.value.existingCreditTotal,
    input.asOf,
  );
  if (resolved.status === "unsupported") return resolved;

  const b = existing.value;
  const n = resolved.value;
  const baseRate = input.newLoan.ratePercent;

  const dsrOf = (newAnnual: number) =>
    input.annualIncome > 0
      ? ((b.annualDebt + newAnnual) / input.annualIncome) * 100
      : 0;

  const dsrNormal = dsrOf(n.annualNormal);
  const dsrStressed = dsrOf(n.annualStressed);

  // 규제 게이트는 스트레스 DSR 기준
  const headroomAnnual =
    (input.annualIncome * input.limitPercent) / 100 -
    (b.annualDebt + n.annualStressed);

  return {
    status: "ok",
    value: {
      effectiveStressRate: n.stressPct,
      stressedRatePercent: baseRate + n.stressPct,
      existingAnnualDebt: b.annualDebt,
      newAnnualDebtNormal: n.annualNormal,
      newAnnualDebtStressed: n.annualStressed,
      dsrNormal,
      dsrStressed,
      headroomAnnual,
      exceeded: dsrStressed > input.limitPercent,
      exceedByPct: dsrStressed - input.limitPercent,
      breakdown: b,
      creditGatePassed: n.creditGatePassed,
      creditTotalWon: n.creditTotalWon,
      notes: n.notes,
      warnings: b.warnings,
    },
  };
}

// ─────────────────────────────────────────────
// 모드 B: DSR 기준 추정 가능 대출액
//   허용 연간 원리금 = 연소득 × 목표 DSR
//   신규 가용 = 허용 − 기존 (≤0이면 0)
//   ※ 역산은 반드시 스트레스 금리 기준 (명목 역산은 한도 과대계상)
//   ※ 주담대는 원리금균등 기준 역산
//   ※ 신용대출은 산정만기 5년 원금균등 기준 역산이며,
//      1억원 경계에서 스트레스 적용 여부가 갈리므로 두 구간을 나눠 계산한다.
// ─────────────────────────────────────────────

export interface DsrEstimateInput {
  annualIncome: number; // 원
  existing: ExistingDebtInput;
  limitPercent: number; // 목표 DSR (40 | 50)
  /** 역산할 신규 대출의 조건. 금액(principal/amount)은 무시한다. */
  newLoan: NewLoanInput;
  asOf?: string;
}

export interface DsrEstimateResult {
  effectiveStressRate: number; // %p
  stressedRatePercent: number;
  existingAnnualDebt: number; // 원
  allowedAnnualDebt: number; // 원 (연소득 × 목표DSR)
  availableForNew: number; // 원 (허용 − 기존, ≥0)
  estimatedPrincipal: number; // 원
  monthlyPaymentActual: number; // 원 (실제금리 기준 월 상환액 — 주담대만, 신용대출은 0)
  breakdown: ExistingDebtBreakdown;
  /** 신용대출에서 1억원 경계에 걸려 한도가 제한된 경우 */
  cappedAtCreditGate: boolean;
  notes: string[];
  warnings: string[];
}

/** 원금 1원당 연간 원리금 — 신용대출 산정만기 5년 원금균등 기준(원금에 선형) */
function creditUnitAnnualDebt(ratePercent: number): number {
  return calcCreditAnnualDebtService(1, ratePercent);
}

export function estimatePrincipalFromDsr(
  input: DsrEstimateInput,
): DsrOutcome<DsrEstimateResult> {
  const existing = resolveExistingDebt(input.existing);
  if (existing.status === "unsupported") return existing;
  const b = existing.value;

  const allowedAnnualDebt = (input.annualIncome * input.limitPercent) / 100;
  const availableForNew = Math.max(0, allowedAnnualDebt - b.annualDebt);

  const base = {
    existingAnnualDebt: b.annualDebt,
    allowedAnnualDebt,
    availableForNew,
    breakdown: b,
    warnings: b.warnings,
  };

  // ── 주택담보대출 ──
  if (input.newLoan.kind === "mortgage") {
    const loan = input.newLoan;
    const stress = getEffectiveStressRate({
      region: loan.region,
      rateType: loan.rateType,
      asOf: input.asOf,
    });
    if (stress.status === "unsupported") return stress;

    const stressedRatePercent = loan.ratePercent + stress.value;
    const estimatedPrincipal = principalFromPayment(
      availableForNew / 12,
      monthlyRate(stressedRatePercent),
      loan.months,
    );

    return {
      status: "ok",
      value: {
        ...base,
        effectiveStressRate: stress.value,
        stressedRatePercent,
        estimatedPrincipal,
        monthlyPaymentActual: equalPaymentMonthly(
          estimatedPrincipal,
          monthlyRate(loan.ratePercent),
          loan.months,
        ),
        cappedAtCreditGate: false,
        notes: [],
      },
    };
  }

  // ── 신용대출 — 1억원 경계 전후 분기 ──
  const loan = input.newLoan;

  if (loan.repaymentKind === "installment") {
    return {
      status: "unsupported",
      reason:
        "분할상환 신용대출은 실제만기 인정 요건과 원금 산식을 공식 원문에서 확인하지 못해 " +
        "추정 가능액을 역산하지 않습니다. 금융회사에 문의하세요.",
    };
  }

  const room = Math.max(0, CREDIT_STRESS_GATE_WON - b.existingCreditTotal);

  // 구간 1: 스트레스 미적용 (총잔액 ≤ 1억원)
  const pNoStress = availableForNew / creditUnitAnnualDebt(loan.ratePercent);

  // 구간 2: 스트레스 적용 (총잔액 > 1억원)
  const stressPct = getCreditEffectiveStressRate({
    fixedTerm: loan.fixedTerm,
    creditTotalWon: CREDIT_STRESS_GATE_WON + 1, // 게이팅 통과 가정
  });
  const pStressed =
    availableForNew / creditUnitAnnualDebt(loan.ratePercent + stressPct);

  const notes: string[] = [];
  let estimatedPrincipal: number;
  let effectiveStressRate: number;
  let cappedAtCreditGate = false;

  if (pNoStress <= room) {
    // 구간 1에서 해결 — 스트레스가 붙지 않는다
    estimatedPrincipal = pNoStress;
    effectiveStressRate = 0;
    notes.push(
      "신용대출 총잔액(기존 + 신규)이 1억원 이하라 스트레스 금리가 적용되지 않는 구간입니다.",
    );
  } else if (b.existingCreditTotal + pStressed > CREDIT_STRESS_GATE_WON) {
    // 구간 2에서 해결
    estimatedPrincipal = pStressed;
    effectiveStressRate = stressPct;
  } else {
    // 경계: 1억원을 넘는 순간 스트레스가 붙어 오히려 한도가 줄어든다
    estimatedPrincipal = room;
    effectiveStressRate = 0;
    cappedAtCreditGate = true;
    notes.push(
      "신용대출 총잔액이 1억원을 넘는 순간 스트레스 금리가 붙어 한도가 오히려 줄어듭니다. " +
        "1억원 경계 직전 금액을 추정치로 표시했습니다.",
    );
  }

  if (loan.repaymentKind === "creditLine") {
    notes.push(
      "마이너스통장은 약정한도 전액이 대출금액으로 잡히므로, 위 금액은 '사용액'이 아니라 '설정 가능한 한도'입니다.",
    );
  }

  return {
    status: "ok",
    value: {
      ...base,
      effectiveStressRate,
      stressedRatePercent: loan.ratePercent + effectiveStressRate,
      estimatedPrincipal: Math.max(0, estimatedPrincipal),
      monthlyPaymentActual: 0,
      cappedAtCreditGate,
      notes,
    },
  };
}
