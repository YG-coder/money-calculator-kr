import { describe, it, expect } from "vitest";
import {
  calcDsr,
  estimatePrincipalFromDsr,
  getEffectiveStressRate,
  getCreditEffectiveStressRate,
  calcNewLoanAnnualDebtService,
  calcCreditAnnualDebtService,
  resolveExistingDebt,
  todayKst,
  DSR_VERIFIED_DATE,
  DSR_LIMIT,
  LOCAL_MORTGAGE_DEFERRAL_UNTIL,
  CREDIT_STRESS_GATE_WON,
  type ExistingDebtInput,
  type NewLoanInput,
  type DsrCheckResult,
  type DsrEstimateResult,
  type ExistingDebtBreakdown,
} from "@/lib/dsr";
import { DSR_POLICY_META } from "@/lib/policy/dsr";

const 만원 = 10_000;
const 억 = 100_000_000;
const BEFORE_EXPIRY = "2026-08-25";
const AFTER_EXPIRY = "2027-01-01";

/** 기존 부채 없음 + 전세대출 없음 (명시 선택) */
const NO_EXISTING: ExistingDebtInput = {
  otherAnnualDebt: 0,
  creditBalance: 0,
  creditLineLimit: 0,
  creditInstallmentBalance: 0,
  creditRatePercent: 0,
  jeonse: { status: "none" },
};

const MORTGAGE_30E: NewLoanInput = {
  kind: "mortgage",
  principal: 30_000 * 만원,
  ratePercent: 4.5,
  months: 360,
  repayment: "equal_payment",
  region: "metro",
  rateType: "variable",
};

function unwrap<T>(out: { status: string; value?: T; reason?: string }): T {
  if (out.status !== "ok") throw new Error(`expected ok, got: ${out.reason}`);
  return out.value as T;
}

const okCheck = (i: Parameters<typeof calcDsr>[0]): DsrCheckResult =>
  unwrap<DsrCheckResult>(calcDsr(i));

const okEstimate = (
  i: Parameters<typeof estimatePrincipalFromDsr>[0],
): DsrEstimateResult => unwrap<DsrEstimateResult>(estimatePrincipalFromDsr(i));

describe("정책 레이어 연결 — 단일 출처", () => {
  it("검증일이 정책 메타에서 온다", () => {
    expect(DSR_VERIFIED_DATE).toBe(DSR_POLICY_META.verifiedAt);
  });

  it("DSR 한도·유예 종료일·게이팅 기준을 정책 레이어에서 재수출한다", () => {
    expect(DSR_LIMIT).toEqual({ bank: 40, nonbank: 50 });
    expect(LOCAL_MORTGAGE_DEFERRAL_UNTIL).toBe("2026-12-31");
    expect(CREDIT_STRESS_GATE_WON).toBe(1 * 억);
  });
});

describe("주담대 스트레스 금리 — 기존 값 불변", () => {
  it("수도권 변동형 3.0%p / 지방 변동형 0.75%p / 순수고정 0%p", () => {
    expect(
      getEffectiveStressRate({
        region: "metro",
        rateType: "variable",
        asOf: BEFORE_EXPIRY,
      }),
    ).toEqual({ status: "ok", value: 3.0 });
    expect(
      getEffectiveStressRate({
        region: "local",
        rateType: "variable",
        asOf: BEFORE_EXPIRY,
      }),
    ).toEqual({ status: "ok", value: 0.75 });
    expect(
      getEffectiveStressRate({
        region: "local",
        rateType: "fixed",
        asOf: BEFORE_EXPIRY,
      }),
    ).toEqual({ status: "ok", value: 0 });
  });
});

describe("지방 유예 만료 — 값을 추정하지 않는다", () => {
  it("만료 후 지방 변동형은 unsupported", () => {
    const out = getEffectiveStressRate({
      region: "local",
      rateType: "variable",
      asOf: AFTER_EXPIRY,
    });
    expect(out.status).toBe("unsupported");
    if (out.status === "unsupported") {
      expect(out.reason).toContain("2026-12-31");
      expect(out.reason).toContain("금융회사");
    }
  });

  it("반기 적용 기간이 끝나면 수도권도 차단한다", () => {
    // 2027-01-01 은 지방 유예 만료일이자 반기 적용 종료일 다음 날이다.
    // 만료된 반기 금리로 계산하면 안 되므로 지역과 무관하게 막는다.
    const out = getEffectiveStressRate({
      region: "metro",
      rateType: "variable",
      asOf: AFTER_EXPIRY,
    });
    expect(out.status).toBe("unsupported");
    if (out.status === "unsupported") {
      expect(out.reason).toContain("스트레스 금리 적용 기간");
      expect(out.reason).toContain("6월·12월");
    }
  });

  it("반기 적용 기간이 끝나면 순수고정형도 차단한다", () => {
    // '순수고정은 스트레스 0' 도 현행 행정지도의 규율이라
    // 다음 발표를 확인하기 전에는 유지된다고 단정할 수 없다.
    const out = getEffectiveStressRate({
      region: "metro",
      rateType: "fixed",
      asOf: AFTER_EXPIRY,
    });
    expect(out.status).toBe("unsupported");
  });

  it("적용 기간 안에서는 순수고정형이 0%p 로 계산된다", () => {
    expect(
      getEffectiveStressRate({
        region: "local",
        rateType: "fixed",
        asOf: BEFORE_EXPIRY,
      }),
    ).toEqual({ status: "ok", value: 0 });
  });

  it("calcDsr 도 만료 시 결과 대신 사유를 돌려준다", () => {
    const out = calcDsr({
      annualIncome: 5_000 * 만원,
      existing: NO_EXISTING,
      newLoan: { ...MORTGAGE_30E, region: "local" },
      limitPercent: 40,
      asOf: AFTER_EXPIRY,
    });
    expect(out.status).toBe("unsupported");
  });
});

describe("회귀 — 페이지 EXAMPLES 표기와 일치", () => {
  it("예시 1: 일반 36.5% / 스트레스 50.3% / 10.3%p 초과", () => {
    const r = okCheck({
      annualIncome: 5_000 * 만원,
      existing: NO_EXISTING,
      newLoan: MORTGAGE_30E,
      limitPercent: 40,
      asOf: BEFORE_EXPIRY,
    });
    expect(r.effectiveStressRate).toBe(3.0);
    expect(r.stressedRatePercent).toBe(7.5);
    expect(r.dsrNormal.toFixed(1)).toBe("36.5");
    expect(r.dsrStressed.toFixed(1)).toBe("50.3");
    expect(r.exceeded).toBe(true);
    expect(r.exceedByPct.toFixed(1)).toBe("10.3");
  });

  it("예시 2: 추정 가능액 약 2.38억, 명목 역산은 3.29억", () => {
    const stressed = okEstimate({
      annualIncome: 5_000 * 만원,
      existing: NO_EXISTING,
      limitPercent: 40,
      newLoan: MORTGAGE_30E,
      asOf: BEFORE_EXPIRY,
    });
    expect(stressed.stressedRatePercent).toBe(7.5);
    expect(Math.round(stressed.estimatedPrincipal / 1_000_000)).toBe(238);

    const nominal = okEstimate({
      annualIncome: 5_000 * 만원,
      existing: NO_EXISTING,
      limitPercent: 40,
      newLoan: { ...MORTGAGE_30E, rateType: "fixed" },
      asOf: BEFORE_EXPIRY,
    });
    expect(Math.round(nominal.estimatedPrincipal / 1_000_000)).toBe(329);
  });
});

describe("전세자금대출 5상태 — 조용한 0원 금지", () => {
  const base = {
    annualIncome: 5_000 * 만원,
    newLoan: MORTGAGE_30E,
    limitPercent: 40,
    asOf: BEFORE_EXPIRY,
  };

  it("미선택이면 계산하지 않는다", () => {
    const out = calcDsr({
      ...base,
      existing: { ...NO_EXISTING, jeonse: { status: "unselected" } },
    });
    expect(out.status).toBe("unsupported");
    if (out.status === "unsupported")
      expect(out.reason).toContain("전세자금대출 여부를 선택");
  });

  it("'그 밖'은 자동 판정하지 않는다", () => {
    const out = calcDsr({
      ...base,
      existing: { ...NO_EXISTING, jeonse: { status: "other" } },
    });
    expect(out.status).toBe("unsupported");
    if (out.status === "unsupported")
      expect(out.reason).toContain("자동으로 판정하지 않습니다");
  });

  it("'없음'과 '무주택자'는 둘 다 0원이지만 사유 표기가 다르다", () => {
    const none = okCheck({
      ...base,
      existing: { ...NO_EXISTING, jeonse: { status: "none" } },
    });
    const noHouse = okCheck({
      ...base,
      existing: { ...NO_EXISTING, jeonse: { status: "noHouse" } },
    });

    expect(none.breakdown.jeonseAnnualDebt).toBe(0);
    expect(noHouse.breakdown.jeonseAnnualDebt).toBe(0);
    expect(none.dsrStressed).toBe(noHouse.dsrStressed);

    expect(none.breakdown.jeonseNote).toBeNull();
    expect(noHouse.breakdown.jeonseNote).toContain(
      "원칙적으로 DSR 산정에서 제외",
    );
  });

  it("1주택·수도권 규제지역은 이자만 반영한다", () => {
    const r = okCheck({
      ...base,
      existing: {
        ...NO_EXISTING,
        jeonse: { status: "oneHouseMetro", annualInterest: 300 * 만원 },
      },
    });
    expect(r.breakdown.jeonseAnnualDebt).toBe(300 * 만원);
    expect(r.existingAnnualDebt).toBe(300 * 만원);
    expect(r.breakdown.jeonseNote).toContain("이자상환분만");
  });
});

describe("신용대출 게이팅 — 기존 + 신규 합산", () => {
  const base = {
    annualIncome: 8_000 * 만원,
    limitPercent: 40,
    asOf: BEFORE_EXPIRY,
  };
  const credit = (amount: number): NewLoanInput => ({
    kind: "credit",
    amount,
    ratePercent: 5.5,
    repaymentKind: "lumpSum",
    fixedTerm: "other",
  });

  it("총잔액 1억원 이하 → 스트레스 미적용", () => {
    const r = okCheck({
      ...base,
      existing: NO_EXISTING,
      newLoan: credit(1 * 억),
    });
    expect(r.creditTotalWon).toBe(1 * 억);
    expect(r.creditGatePassed).toBe(false);
    expect(r.effectiveStressRate).toBe(0);
    expect(r.notes.join(" ")).toContain("1억원 이하");
  });

  it("기존 8천 + 신규 3천 = 1.1억 → 합산 기준으로 스트레스 적용", () => {
    const r = okCheck({
      ...base,
      existing: {
        ...NO_EXISTING,
        creditBalance: 8_000 * 만원,
        creditRatePercent: 5.5,
      },
      newLoan: credit(3_000 * 만원),
    });
    expect(r.creditTotalWon).toBe(110_000_000);
    expect(r.creditGatePassed).toBe(true);
    expect(r.effectiveStressRate).toBe(1.5);
  });

  it("금리유형별 적용비율이 반영된다", () => {
    const mk = (fixedTerm: "other" | "fixed3to5" | "fixed5plus") =>
      okCheck({
        ...base,
        existing: NO_EXISTING,
        newLoan: {
          kind: "credit",
          amount: 1.5 * 억,
          ratePercent: 5.5,
          repaymentKind: "lumpSum",
          fixedTerm,
        },
      }).effectiveStressRate;

    expect(mk("other")).toBe(1.5);
    expect(mk("fixed3to5")).toBe(0.9);
    expect(mk("fixed5plus")).toBe(0);
  });

  it("신용대출에는 지역 개념이 없다 — 지방이라고 0.75로 깎이지 않는다", () => {
    expect(
      getCreditEffectiveStressRate({
        fixedTerm: "other",
        creditTotalWon: 2 * 억,
        asOf: BEFORE_EXPIRY,
      }),
    ).toEqual({ status: "ok", value: 1.5 });
  });

  it("반기 적용 기간이 끝나면 신용대출도 차단한다", () => {
    const out = getCreditEffectiveStressRate({
      fixedTerm: "other",
      creditTotalWon: 2 * 억,
      asOf: AFTER_EXPIRY,
    });
    expect(out.status).toBe("unsupported");
    if (out.status === "unsupported") {
      expect(out.reason).toContain("스트레스 금리 적용 기간");
    }
  });
});

describe("마이너스통장 — 약정한도 전액", () => {
  it("사용액 0원이어도 한도 전액이 원금으로 잡힌다", () => {
    const r = okCheck({
      annualIncome: 8_000 * 만원,
      existing: {
        ...NO_EXISTING,
        creditLineLimit: 5_000 * 만원,
        creditRatePercent: 6,
      },
      newLoan: MORTGAGE_30E,
      limitPercent: 40,
      asOf: BEFORE_EXPIRY,
    });
    // 5,000만원 · 산정만기 5년 원금균등 → 원금분 1,000만원 + 첫해 이자
    expect(r.breakdown.creditAnnualDebt).toBeGreaterThan(1_000 * 만원);
    expect(r.breakdown.existingCreditTotal).toBe(5_000 * 만원);
  });

  it("신규 마이너스통장도 한도 전액으로 산정하고 안내한다", () => {
    const r = okCheck({
      annualIncome: 8_000 * 만원,
      existing: NO_EXISTING,
      newLoan: {
        kind: "credit",
        amount: 5_000 * 만원,
        ratePercent: 6,
        repaymentKind: "creditLine",
        fixedTerm: "other",
      },
      limitPercent: 40,
      asOf: BEFORE_EXPIRY,
    });
    expect(r.notes.join(" ")).toContain("약정한도 전액");
  });
});

describe("분할상환 신용대출 — 자동 계산하지 않는다", () => {
  const base = {
    annualIncome: 8_000 * 만원,
    existing: NO_EXISTING,
    limitPercent: 40,
    asOf: BEFORE_EXPIRY,
  };

  it("직접 입력이 없으면 계산을 차단한다", () => {
    const out = calcDsr({
      ...base,
      newLoan: {
        kind: "credit",
        amount: 5_000 * 만원,
        ratePercent: 5.5,
        repaymentKind: "installment",
        fixedTerm: "other",
      },
    });
    expect(out.status).toBe("unsupported");
    if (out.status === "unsupported") {
      expect(out.reason).toContain("최장 10년");
      expect(out.reason).toContain("직접 입력");
    }
  });

  it("직접 입력하면 그 값을 그대로 쓴다", () => {
    const r = okCheck({
      ...base,
      newLoan: {
        kind: "credit",
        amount: 5_000 * 만원,
        ratePercent: 5.5,
        repaymentKind: "installment",
        fixedTerm: "other",
        installmentAnnualDebt: 800 * 만원,
      },
    });
    expect(r.newAnnualDebtNormal).toBe(800 * 만원);
    expect(r.newAnnualDebtStressed).toBe(800 * 만원);
  });

  it("추정 가능액도 역산하지 않는다", () => {
    const out = estimatePrincipalFromDsr({
      ...base,
      newLoan: {
        kind: "credit",
        amount: 0,
        ratePercent: 5.5,
        repaymentKind: "installment",
        fixedTerm: "other",
      },
    });
    expect(out.status).toBe("unsupported");
  });
});

describe("중복 합산 경고", () => {
  it("기타 부채와 기존 신용대출을 함께 입력하면 경고한다", () => {
    const r = okCheck({
      annualIncome: 8_000 * 만원,
      existing: {
        ...NO_EXISTING,
        otherAnnualDebt: 600 * 만원,
        creditBalance: 3_000 * 만원,
        creditRatePercent: 5.5,
      },
      newLoan: MORTGAGE_30E,
      limitPercent: 40,
      asOf: BEFORE_EXPIRY,
    });
    expect(r.warnings.join(" ")).toContain("두 번 더해집니다");
  });

  it("기타 부채와 전세대출 이자를 함께 입력해도 경고한다", () => {
    const r = okCheck({
      annualIncome: 8_000 * 만원,
      existing: {
        ...NO_EXISTING,
        otherAnnualDebt: 600 * 만원,
        jeonse: { status: "oneHouseMetro", annualInterest: 300 * 만원 },
      },
      newLoan: MORTGAGE_30E,
      limitPercent: 40,
      asOf: BEFORE_EXPIRY,
    });
    expect(r.warnings.join(" ")).toContain("전세자금대출 이자");
  });

  it("한쪽만 입력하면 경고하지 않는다", () => {
    const r = okCheck({
      annualIncome: 8_000 * 만원,
      existing: { ...NO_EXISTING, otherAnnualDebt: 600 * 만원 },
      newLoan: MORTGAGE_30E,
      limitPercent: 40,
      asOf: BEFORE_EXPIRY,
    });
    expect(r.warnings).toEqual([]);
  });
});

describe("추정 가능액 — 신용대출 1억원 경계 분기", () => {
  const mk = (annualIncome: number, existingCredit = 0) =>
    okEstimate({
      annualIncome,
      existing: {
        ...NO_EXISTING,
        creditBalance: existingCredit,
        creditRatePercent: 5.5,
      },
      limitPercent: 40,
      newLoan: {
        kind: "credit",
        amount: 0,
        ratePercent: 5.5,
        repaymentKind: "lumpSum",
        fixedTerm: "other",
      },
      asOf: BEFORE_EXPIRY,
    });

  it("소득이 낮으면 1억원 미만 구간에서 스트레스 없이 산출된다", () => {
    const r = mk(3_000 * 만원);
    expect(r.estimatedPrincipal).toBeLessThan(1 * 억);
    expect(r.effectiveStressRate).toBe(0);
    expect(r.cappedAtCreditGate).toBe(false);
    expect(r.notes.join(" ")).toContain("1억원 이하");
  });

  it("소득이 충분하면 1억원 초과 구간에서 스트레스가 적용된다", () => {
    const r = mk(30_000 * 만원);
    expect(r.estimatedPrincipal).toBeGreaterThan(1 * 억);
    expect(r.effectiveStressRate).toBe(1.5);
    expect(r.cappedAtCreditGate).toBe(false);
  });

  it("경계에 걸리면 1억원 직전에서 잘리고 그 사실을 알린다", () => {
    // 스트레스 없으면 1억 초과, 스트레스 붙으면 1억 이하가 되는 소득 구간을 찾는다
    let capped: ReturnType<typeof mk> | null = null;
    for (let 소득 = 6_000; 소득 <= 12_000; 소득 += 100) {
      const r = mk(소득 * 만원);
      if (r.cappedAtCreditGate) {
        capped = r;
        break;
      }
    }
    expect(capped).not.toBeNull();
    expect(capped!.estimatedPrincipal).toBe(1 * 억);
    expect(capped!.effectiveStressRate).toBe(0);
    expect(capped!.notes.join(" ")).toContain("오히려 줄어듭니다");
  });

  it("기존 신용대출이 이미 1억원이면 추가 여력이 0이다", () => {
    const r = mk(30_000 * 만원, 1 * 억);
    expect(r.effectiveStressRate).toBe(1.5);
  });
});

describe("연간 원리금 산정", () => {
  it("원금균등 첫해가 원리금균등보다 크다", () => {
    expect(
      calcNewLoanAnnualDebtService(30_000 * 만원, 4.5, 360, "equal_principal"),
    ).toBeGreaterThan(
      calcNewLoanAnnualDebtService(30_000 * 만원, 4.5, 360, "equal_payment"),
    );
  });

  it("신용대출은 산정만기 5년 원금균등 — 원금의 1/5 이상", () => {
    const p = 5_000 * 만원;
    const annual = calcCreditAnnualDebtService(p, 6);
    expect(annual).toBeGreaterThan(p / 5);
    expect(annual).toBeLessThan(p / 5 + p * 0.06);
  });

  it("신용대출 연간 원리금은 원금에 선형이다 (역산 근거)", () => {
    const unit = calcCreditAnnualDebtService(1, 6);
    expect(calcCreditAnnualDebtService(7_777 * 만원, 6)).toBeCloseTo(
      unit * 7_777 * 만원,
      3,
    );
  });

  it("원금 0 또는 기간 0이면 0", () => {
    expect(calcNewLoanAnnualDebtService(0, 4.5, 360, "equal_payment")).toBe(0);
    expect(calcNewLoanAnnualDebtService(1000, 4.5, 0, "equal_payment")).toBe(0);
  });
});

describe("기존 부채 합산", () => {
  it("세 갈래가 모두 더해진다", () => {
    const out = resolveExistingDebt({
      otherAnnualDebt: 600 * 만원,
      creditBalance: 3_000 * 만원,
      creditLineLimit: 2_000 * 만원,
      creditInstallmentBalance: 0,
      creditRatePercent: 6,
      jeonse: { status: "oneHouseMetro", annualInterest: 300 * 만원 },
    });
    const b = unwrap<ExistingDebtBreakdown>(out);

    expect(b.existingCreditTotal).toBe(5_000 * 만원);
    expect(b.annualDebt).toBeCloseTo(
      b.otherAnnualDebt + b.creditAnnualDebt + b.jeonseAnnualDebt,
      6,
    );
  });
});

describe("기준일", () => {
  it("todayKst 는 YYYY-MM-DD 형식", () => {
    expect(todayKst()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("asOf 를 생략하면 오늘 기준으로 판정한다", () => {
    expect(
      getEffectiveStressRate({ region: "local", rateType: "variable" }),
    ).toEqual(
      getEffectiveStressRate({
        region: "local",
        rateType: "variable",
        asOf: todayKst(),
      }),
    );
  });
});

describe("적격 분할상환 잔액 — 게이팅에만 합산", () => {
  const base = {
    annualIncome: 10_000 * 만원,
    limitPercent: 40,
    asOf: BEFORE_EXPIRY,
  };
  const 신규신용대출: NewLoanInput = {
    kind: "credit",
    amount: 5_000 * 만원,
    ratePercent: 5.5,
    repaymentKind: "lumpSum",
    fixedTerm: "other",
  };
  /** 8,000만원 분할상환 신용대출의 실제 연간 원리금(사용자 입력값 가정) */
  const 분할상환_연간원리금 = 1_800 * 만원;

  it("1. 기존 적격 분할상환 8천 + 신규 신용대출 5천 → 총잔액 1.3억, 스트레스 적용", () => {
    const r = okCheck({
      ...base,
      existing: {
        ...NO_EXISTING,
        otherAnnualDebt: 분할상환_연간원리금,
        creditInstallmentBalance: 8_000 * 만원,
      },
      newLoan: 신규신용대출,
    });

    expect(r.creditTotalWon).toBe(130_000_000);
    expect(r.creditGatePassed).toBe(true);
    expect(r.effectiveStressRate).toBe(1.5);
  });

  it("2. 적격 분할상환 잔액은 연간 원리금에 자동 합산되지 않는다", () => {
    const r = okCheck({
      ...base,
      existing: {
        ...NO_EXISTING,
        otherAnnualDebt: 분할상환_연간원리금,
        creditInstallmentBalance: 8_000 * 만원,
        creditRatePercent: 5.5,
      },
      newLoan: 신규신용대출,
    });

    // 게이팅에는 들어가지만 원리금은 0
    expect(r.breakdown.installmentBalance).toBe(8_000 * 만원);
    expect(r.breakdown.creditAnnualDebt).toBe(0);
    // 기존 부채는 사용자가 입력한 연간 원리금 그대로
    expect(r.existingAnnualDebt).toBe(분할상환_연간원리금);
  });

  it("2-b. 잔액을 넣어도 넣지 않아도 기존 연간 원리금은 같다 (게이팅만 달라진다)", () => {
    const 공통 = {
      ...NO_EXISTING,
      otherAnnualDebt: 분할상환_연간원리금,
      creditRatePercent: 5.5,
    };
    const 미입력 = okCheck({ ...base, existing: 공통, newLoan: 신규신용대출 });
    const 입력 = okCheck({
      ...base,
      existing: { ...공통, creditInstallmentBalance: 8_000 * 만원 },
      newLoan: 신규신용대출,
    });

    expect(입력.existingAnnualDebt).toBe(미입력.existingAnnualDebt);
    expect(미입력.creditGatePassed).toBe(false); // 5천만원만 보임 — 과소 판정
    expect(입력.creditGatePassed).toBe(true); // 1.3억 — 정확
    expect(입력.dsrStressed).toBeGreaterThan(미입력.dsrStressed);
  });

  it("3. 기타 부채 원리금 + 적격 분할상환 잔액 조합에는 중복 경고가 없다", () => {
    const r = okCheck({
      ...base,
      existing: {
        ...NO_EXISTING,
        otherAnnualDebt: 분할상환_연간원리금,
        creditInstallmentBalance: 8_000 * 만원,
      },
      newLoan: 신규신용대출,
    });

    expect(r.warnings.join(" ")).not.toContain("두 번 더해집니다");
    // 잔액을 이미 입력했으므로 조건부 안내도 뜨지 않는다
    expect(r.warnings.join(" ")).not.toContain("1억원 판정에 반영");
  });

  it("3-b. 일시상환 잔액과 함께 넣으면 기존 중복 경고는 그대로 뜬다", () => {
    const r = okCheck({
      ...base,
      existing: {
        ...NO_EXISTING,
        otherAnnualDebt: 600 * 만원,
        creditBalance: 3_000 * 만원,
        creditInstallmentBalance: 8_000 * 만원,
        creditRatePercent: 5.5,
      },
      newLoan: 신규신용대출,
    });
    expect(r.warnings.join(" ")).toContain("두 번 더해집니다");
  });

  it("3-c. 신규가 신용대출 + 기타 부채만 있고 잔액이 비면 조건부 안내를 띄운다", () => {
    const r = okCheck({
      ...base,
      existing: { ...NO_EXISTING, otherAnnualDebt: 분할상환_연간원리금 },
      newLoan: 신규신용대출,
    });
    expect(r.warnings.join(" ")).toContain("1억원 판정에 반영");
  });

  it("3-d. 신규가 주담대면 조건부 안내를 띄우지 않는다", () => {
    const r = okCheck({
      ...base,
      existing: { ...NO_EXISTING, otherAnnualDebt: 분할상환_연간원리금 },
      newLoan: MORTGAGE_30E,
    });
    expect(r.warnings.join(" ")).not.toContain("1억원 판정에 반영");
  });

  it("4. 추정 가능액의 1억원 경계가 적격 분할상환 잔액을 포함한다", () => {
    const mk = (annualIncome: number, installment: number) =>
      okEstimate({
        annualIncome,
        existing: { ...NO_EXISTING, creditInstallmentBalance: installment },
        limitPercent: 40,
        newLoan: {
          kind: "credit",
          amount: 0,
          ratePercent: 5.5,
          repaymentKind: "lumpSum",
          fixedTerm: "other",
        },
        asOf: BEFORE_EXPIRY,
      });

    // 같은 소득이라도 분할상환 잔액이 있으면 총잔액이 1억원을 넘어 스트레스 구간으로 넘어간다
    const 없음 = mk(3_000 * 만원, 0);
    const 구천 = mk(3_000 * 만원, 9_000 * 만원);

    expect(없음.effectiveStressRate).toBe(0); // 총잔액 1억원 이하 구간
    expect(구천.effectiveStressRate).toBe(1.5); // 잔액 9천 + 신규 → 1억원 초과
    expect(구천.estimatedPrincipal).toBeLessThan(없음.estimatedPrincipal);

    // 이미 1억원을 넘겼으면 처음부터 스트레스 구간
    expect(mk(3_000 * 만원, 11_000 * 만원).effectiveStressRate).toBe(1.5);
  });

  it("4-b. 경계에서 잘릴 때 남은 여력이 적격 분할상환 잔액을 반영한다", () => {
    // 잔액 9천만원 → 무스트레스 여력은 1천만원까지.
    // 경계에 걸리는 소득 구간을 찾아 잘린 값이 정확히 1천만원인지 확인한다.
    let capped = null as ReturnType<typeof okEstimate> | null;
    for (let 소득 = 400; 소득 <= 1_200; 소득 += 10) {
      const r = okEstimate({
        annualIncome: 소득 * 만원,
        existing: { ...NO_EXISTING, creditInstallmentBalance: 9_000 * 만원 },
        limitPercent: 40,
        newLoan: {
          kind: "credit",
          amount: 0,
          ratePercent: 5.5,
          repaymentKind: "lumpSum",
          fixedTerm: "other",
        },
        asOf: BEFORE_EXPIRY,
      });
      if (r.cappedAtCreditGate) {
        capped = r;
        break;
      }
    }

    expect(capped).not.toBeNull();
    // 1억원 − 기존 9천만원 = 1천만원
    expect(capped!.estimatedPrincipal).toBe(1_000 * 만원);
    expect(capped!.effectiveStressRate).toBe(0);
  });
});
