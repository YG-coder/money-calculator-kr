import { describe, it, expect } from "vitest";
import {
  calcDsr,
  estimatePrincipalFromDsr,
  getEffectiveStressRate,
  calcNewLoanAnnualDebtService,
  todayKst,
  DSR_VERIFIED_DATE,
  DSR_LIMIT,
  LOCAL_MORTGAGE_DEFERRAL_UNTIL,
} from "@/lib/dsr";
import { DSR_POLICY_META } from "@/lib/policy/dsr";

const 만원 = 10_000;
const BEFORE_EXPIRY = "2026-08-25";
const AFTER_EXPIRY = "2027-01-01";

// 페이지 EXAMPLES 와 동일한 조건 — 화면 표기와 엔진이 어긋나면 여기서 깨진다.
const EXAMPLE_CHECK = {
  annualIncome: 5_000 * 만원,
  existingAnnualDebt: 0,
  newPrincipal: 30_000 * 만원,
  ratePercent: 4.5,
  months: 360,
  repayment: "equal_payment" as const,
  region: "metro" as const,
  rateType: "variable" as const,
  limitPercent: 40,
  asOf: BEFORE_EXPIRY,
};

function okCheck(input: Parameters<typeof calcDsr>[0]) {
  const out = calcDsr(input);
  if (out.status !== "ok") throw new Error(`expected ok, got: ${out.reason}`);
  return out.value;
}

function okEstimate(input: Parameters<typeof estimatePrincipalFromDsr>[0]) {
  const out = estimatePrincipalFromDsr(input);
  if (out.status !== "ok") throw new Error(`expected ok, got: ${out.reason}`);
  return out.value;
}

describe("정책 레이어 연결 — 단일 출처", () => {
  it("검증일이 정책 메타에서 온다", () => {
    expect(DSR_VERIFIED_DATE).toBe(DSR_POLICY_META.verifiedAt);
  });

  it("DSR 한도와 유예 종료일을 정책 레이어에서 재수출한다", () => {
    expect(DSR_LIMIT).toEqual({ bank: 40, nonbank: 50 });
    expect(LOCAL_MORTGAGE_DEFERRAL_UNTIL).toBe("2026-12-31");
  });
});

describe("유효 스트레스 금리 — 기존 값 불변", () => {
  it("수도권 변동형 3.0%p", () => {
    expect(
      getEffectiveStressRate({
        region: "metro",
        rateType: "variable",
        asOf: BEFORE_EXPIRY,
      }),
    ).toEqual({ status: "ok", value: 3.0 });
  });

  it("지방 변동형 0.75%p", () => {
    expect(
      getEffectiveStressRate({
        region: "local",
        rateType: "variable",
        asOf: BEFORE_EXPIRY,
      }),
    ).toEqual({ status: "ok", value: 0.75 });
  });

  it("순수고정형은 지역 무관 0%p", () => {
    for (const region of ["metro", "local"] as const) {
      expect(
        getEffectiveStressRate({
          region,
          rateType: "fixed",
          asOf: BEFORE_EXPIRY,
        }),
      ).toEqual({ status: "ok", value: 0 });
    }
  });
});

describe("지방 유예 만료 — 값을 추정하지 않는다", () => {
  it("만료 후 지방 변동형은 unsupported 를 돌려준다", () => {
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

  it("만료 후에도 수도권은 계산된다", () => {
    expect(
      getEffectiveStressRate({
        region: "metro",
        rateType: "variable",
        asOf: AFTER_EXPIRY,
      }),
    ).toEqual({ status: "ok", value: 3.0 });
  });

  it("만료 후 지방 순수고정형은 스트레스가 없으므로 계산된다", () => {
    expect(
      getEffectiveStressRate({
        region: "local",
        rateType: "fixed",
        asOf: AFTER_EXPIRY,
      }),
    ).toEqual({ status: "ok", value: 0 });
  });

  it("calcDsr 도 만료 시 결과 대신 사유를 돌려준다", () => {
    const out = calcDsr({
      ...EXAMPLE_CHECK,
      region: "local",
      asOf: AFTER_EXPIRY,
    });
    expect(out.status).toBe("unsupported");
  });

  it("estimatePrincipalFromDsr 도 만료 시 결과 대신 사유를 돌려준다", () => {
    const out = estimatePrincipalFromDsr({
      annualIncome: 5_000 * 만원,
      existingAnnualDebt: 0,
      limitPercent: 40,
      ratePercent: 4.5,
      months: 360,
      region: "local",
      rateType: "variable",
      asOf: AFTER_EXPIRY,
    });
    expect(out.status).toBe("unsupported");
  });
});

describe("회귀 — 페이지 EXAMPLES 표기와 일치", () => {
  it("예시 1: 일반 36.5% / 스트레스 50.3% / 기준 40% 대비 10.3%p 초과", () => {
    const r = okCheck(EXAMPLE_CHECK);
    expect(r.effectiveStressRate).toBe(3.0);
    expect(r.stressedRatePercent).toBe(7.5);
    expect(r.dsrNormal.toFixed(1)).toBe("36.5");
    expect(r.dsrStressed.toFixed(1)).toBe("50.3");
    expect(r.exceeded).toBe(true);
    expect(r.exceedByPct.toFixed(1)).toBe("10.3");
  });

  it("예시 2: 추정 가능액 약 2.38억 (스트레스 7.5% 역산)", () => {
    const r = okEstimate({
      annualIncome: 5_000 * 만원,
      existingAnnualDebt: 0,
      limitPercent: 40,
      ratePercent: 4.5,
      months: 360,
      region: "metro",
      rateType: "variable",
      asOf: BEFORE_EXPIRY,
    });
    expect(r.stressedRatePercent).toBe(7.5);
    expect(Math.round(r.estimatedPrincipal / 1_000_000)).toBe(238);
  });

  it("명목 금리로 역산하면 더 커진다 — 스트레스 역산이 보수적", () => {
    const stressed = okEstimate({
      annualIncome: 5_000 * 만원,
      existingAnnualDebt: 0,
      limitPercent: 40,
      ratePercent: 4.5,
      months: 360,
      region: "metro",
      rateType: "variable",
      asOf: BEFORE_EXPIRY,
    });
    const nominal = okEstimate({
      annualIncome: 5_000 * 만원,
      existingAnnualDebt: 0,
      limitPercent: 40,
      ratePercent: 4.5,
      months: 360,
      region: "metro",
      rateType: "fixed", // 스트레스 0
      asOf: BEFORE_EXPIRY,
    });
    expect(nominal.estimatedPrincipal).toBeGreaterThan(
      stressed.estimatedPrincipal,
    );
    expect(Math.round(nominal.estimatedPrincipal / 1_000_000)).toBe(329);
  });
});

describe("연간 원리금 산정", () => {
  it("원금균등 첫해가 원리금균등보다 크다", () => {
    const ep = calcNewLoanAnnualDebtService(
      30_000 * 만원,
      4.5,
      360,
      "equal_payment",
    );
    const eprin = calcNewLoanAnnualDebtService(
      30_000 * 만원,
      4.5,
      360,
      "equal_principal",
    );
    expect(eprin).toBeGreaterThan(ep);
  });

  it("원금 0 또는 기간 0이면 0", () => {
    expect(calcNewLoanAnnualDebtService(0, 4.5, 360, "equal_payment")).toBe(0);
    expect(calcNewLoanAnnualDebtService(1000, 4.5, 0, "equal_payment")).toBe(0);
  });
});

describe("기준일", () => {
  it("todayKst 는 YYYY-MM-DD 형식", () => {
    expect(todayKst()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("asOf 를 생략하면 오늘 기준으로 판정한다", () => {
    const withDefault = getEffectiveStressRate({
      region: "local",
      rateType: "variable",
    });
    const explicit = getEffectiveStressRate({
      region: "local",
      rateType: "variable",
      asOf: todayKst(),
    });
    expect(withDefault).toEqual(explicit);
  });
});
