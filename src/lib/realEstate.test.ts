import { describe, expect, it } from "vitest";
import { calcAcquisitionTax, calcPropertyYield } from "./realEstate";

const base = {
  priceMan: 50_000,
  ownership: "first" as const,
  isAdjustedArea: false,
  isOver85: false,
};

describe("calcAcquisitionTax PR 2a", () => {
  it("keeps the existing one-home result", () => {
    expect(calcAcquisitionTax(base)).toMatchObject({
      acquisitionTax: 5_000_000,
      localEduTax: 500_000,
      farmSpecialTax: 0,
      totalTax: 5_500_000,
      appliedRule: "standard",
    });
  });

  it("keeps the 12% heavy-tax result", () => {
    const result = calcAcquisitionTax({
      ...base,
      priceMan: 100_000,
      ownership: "third",
      isAdjustedArea: true,
      isOver85: true,
    });
    expect(result.taxRate).toBe(0.12);
    expect(result.totalTax).toBe(134_000_000);
  });

  it("uses the progressive rate at 700m won", () => {
    expect(calcAcquisitionTax({ ...base, priceMan: 70_000 }).taxRate).toBe(
      0.016667,
    );
  });

  it("excludes a qualifying non-metro low-price home from heavy tax", () => {
    const result = calcAcquisitionTax({
      ...base,
      ownership: "third",
      isAdjustedArea: true,
      isMetroArea: false,
      officialPriceMan: 15_000,
      isRedevelopmentZone: false,
    });
    expect(result.taxRate).toBe(0.01);
    expect(result.appliedRule).toBe("lowPriceExempt");
  });

  it("includes exactly 200m won but excludes 200m won plus one won", () => {
    const input = {
      ...base,
      ownership: "third" as const,
      isAdjustedArea: true,
      isMetroArea: false,
      isRedevelopmentZone: false,
    };
    expect(
      calcAcquisitionTax({ ...input, officialPriceWon: 200_000_000 }).taxRate,
    ).toBe(0.01);
    expect(
      calcAcquisitionTax({ ...input, officialPriceWon: 200_000_001 }).taxRate,
    ).toBe(0.12);
  });

  it("does not exempt a redevelopment-zone home", () => {
    const result = calcAcquisitionTax({
      ...base,
      ownership: "third",
      isAdjustedArea: true,
      isMetroArea: false,
      officialPriceMan: 15_000,
      isRedevelopmentZone: true,
    });
    expect(result.taxRate).toBe(0.12);
  });

  it("applies the standard first-home reduction and education-tax reduction", () => {
    const result = calcAcquisitionTax({
      ...base,
      firstHomeReduction: "standard",
    });
    expect(result.reductionWon).toBe(2_000_000);
    expect(result.acquisitionTax).toBe(3_000_000);
    expect(result.localEduTax).toBe(300_000);
  });

  it("fully exempts a 100m won, <=85m2 first home", () => {
    const result = calcAcquisitionTax({
      ...base,
      priceMan: 10_000,
      firstHomeReduction: "standard",
    });
    expect(result.totalTax).toBe(0);
  });

  it("does not guess the first-home ancillary taxes above 85m2", () => {
    const result = calcAcquisitionTax({
      ...base,
      priceMan: 10_000,
      isOver85: true,
      firstHomeReduction: "standard",
    });
    expect(result.reductionWon).toBe(0);
    expect(result.unsupportedReason).toContain("85㎡ 초과");
  });

  it("does not apply first-home reduction above 1.2b won", () => {
    expect(
      calcAcquisitionTax({
        ...base,
        priceMan: 130_000,
        firstHomeReduction: "standard",
      }).reductionWon,
    ).toBe(0);
  });

  it("treats a declared temporary second home as standard", () => {
    const result = calcAcquisitionTax({
      ...base,
      ownership: "second",
      isAdjustedArea: true,
      isTemporaryTwoHouse: true,
    });
    expect(result.taxRate).toBe(0.01);
    expect(result.appliedRule).toBe("temporaryTwoHouse");
  });
});

describe("임대수익률 — 취득 부대비용", () => {
  const 만원 = 10_000;
  const BASE = {
    purchasePriceMan: 30_000, // 3억
    depositMan: 5_000, // 5천
    monthlyRentMan: 100, // 100만원
    loanAmountMan: 15_000, // 1.5억
    loanRatePct: 4.0,
    monthlyCostMan: 10,
  };

  it("부대비용을 생략하면 이 필드 추가 이전과 결과가 같다", () => {
    const r = calcPropertyYield(BASE);

    // 기존 정의: 매입가 − 보증금 − 대출금 = 3억 − 5천 − 1.5억 = 1억
    expect(r.investedCapital).toBe(10_000 * 만원);
    expect(r.investedCapitalWithoutExtra).toBe(10_000 * 만원);
    expect(r.extraCostWon).toBe(0);
    expect(r.equityYield).toBe(r.equityYieldWithoutExtra);
  });

  it("부대비용 0 을 명시해도 생략과 같다", () => {
    expect(calcPropertyYield({ ...BASE, extraCostMan: 0 })).toEqual(
      calcPropertyYield(BASE),
    );
  });

  it("부대비용은 자기자본 수익률 분모에 더해진다", () => {
    const r = calcPropertyYield({ ...BASE, extraCostMan: 2_000 });

    expect(r.extraCostWon).toBe(2_000 * 만원);
    expect(r.investedCapital).toBe(12_000 * 만원); // 1억 + 2천
    expect(r.investedCapitalWithoutExtra).toBe(10_000 * 만원);
  });

  it("분모가 커지므로 자기자본 수익률은 낮아진다 (더 보수적)", () => {
    const 없음 = calcPropertyYield(BASE);
    const 있음 = calcPropertyYield({ ...BASE, extraCostMan: 2_000 });

    expect(있음.equityYield).toBeLessThan(없음.equityYield);
    // 비교용 값은 부대비용 없는 계산과 일치해야 한다
    expect(있음.equityYieldWithoutExtra).toBeCloseTo(없음.equityYield, 10);
  });

  it("매입가 기준 수익률에는 부대비용을 넣지 않는다", () => {
    const 없음 = calcPropertyYield(BASE);
    const 있음 = calcPropertyYield({ ...BASE, extraCostMan: 2_000 });
    expect(있음.purchaseYield).toBe(없음.purchaseYield);
  });

  it("월 순수익은 부대비용에 영향받지 않는다 — 일회성 비용이므로", () => {
    const 없음 = calcPropertyYield(BASE);
    const 있음 = calcPropertyYield({ ...BASE, extraCostMan: 2_000 });
    expect(있음.monthlyNetIncome).toBe(없음.monthlyNetIncome);
    expect(있음.annualNetIncome).toBe(없음.annualNetIncome);
  });

  it("음수 부대비용은 0 으로 본다", () => {
    expect(calcPropertyYield({ ...BASE, extraCostMan: -5_000 })).toEqual(
      calcPropertyYield(BASE),
    );
  });

  it("실투자금 0 이하 판정은 부대비용 포함 기준이다", () => {
    // 보증금 + 대출이 매입가와 같아 기존 정의로는 0
    const 경계 = {
      ...BASE,
      depositMan: 15_000,
      loanAmountMan: 15_000,
    };
    expect(calcPropertyYield(경계).isInvestedNegative).toBe(true);

    // 부대비용을 넣으면 실제로 나간 돈이 있으므로 0 초과가 된다
    const r = calcPropertyYield({ ...경계, extraCostMan: 2_000 });
    expect(r.investedCapital).toBe(2_000 * 만원);
    expect(r.isInvestedNegative).toBe(false);
    expect(r.equityYieldWithoutExtra).toBe(0); // 분모 0 이하 → 0
  });

  it("실투자금 계산기와 분모 정의가 일치한다", () => {
    // 실투자금 계산기: 총필요자금(매매가 + 부대비용) − 대출 − 보증금
    const 매매가 = 30_000 * 만원;
    const 부대비용 = 2_000 * 만원;
    const 대출 = 15_000 * 만원;
    const 보증금 = 5_000 * 만원;
    const 실투자금계산기 = 매매가 + 부대비용 - 대출 - 보증금;

    const r = calcPropertyYield({ ...BASE, extraCostMan: 2_000 });
    expect(r.investedCapital).toBe(실투자금계산기);
  });
});
