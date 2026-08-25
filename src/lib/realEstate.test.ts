import { describe, expect, it } from "vitest";
import { calcAcquisitionTax } from "./realEstate";

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
    expect(calcAcquisitionTax({ ...base, priceMan: 70_000 }).taxRate).toBe(0.016667);
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
    expect(calcAcquisitionTax({ ...input, officialPriceWon: 200_000_000 }).taxRate).toBe(0.01);
    expect(calcAcquisitionTax({ ...input, officialPriceWon: 200_000_001 }).taxRate).toBe(0.12);
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
    const result = calcAcquisitionTax({ ...base, firstHomeReduction: "standard" });
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
    expect(calcAcquisitionTax({
      ...base,
      priceMan: 130_000,
      firstHomeReduction: "standard",
    }).reductionWon).toBe(0);
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
