import { describe, it, expect, afterEach } from "vitest";
import {
  CONVERSION_RATE_INFO,
  getLegalConversionCapPct,
  calcJeonseWolseConversion,
} from "@/lib/realEstate";

const ORIGINAL_BASE_RATE = CONVERSION_RATE_INFO.baseRatePct;

afterEach(() => {
  CONVERSION_RATE_INFO.baseRatePct = ORIGINAL_BASE_RATE;
});

describe("전월세 전환 법정 상한", () => {
  it("연 10%와 (기준금리 + 대통령령 이율) 중 낮은 값", () => {
    expect(getLegalConversionCapPct()).toBe(
      Math.min(
        CONVERSION_RATE_INFO.fixedCapPct,
        CONVERSION_RATE_INFO.baseRatePct + CONVERSION_RATE_INFO.legalAddPct,
      ),
    );
  });

  it("현재 상수(기준금리 3.0%)에서 상한은 5.0%", () => {
    expect(CONVERSION_RATE_INFO.baseRatePct).toBe(3.0);
    expect(getLegalConversionCapPct()).toBeCloseTo(5.0, 10);
  });

  it("기준금리가 오르면 상한도 함께 오른다 — 엔진과 헬퍼가 같은 값을 쓴다", () => {
    CONVERSION_RATE_INFO.baseRatePct = 3.0; // 금통위 0.25%p 인상 가정
    expect(getLegalConversionCapPct()).toBeCloseTo(5.0, 10);

    const r = calcJeonseWolseConversion({
      jeonseDepositMan: 30_000,
      wolseDepositMan: 20_000,
      wolseMonthlyMan: 50,
    });
    expect(r.legalCapPct).toBeCloseTo(5.0, 10);
  });

  it("기준금리가 8%를 넘으면 연 10% 고정 상한이 걸린다", () => {
    CONVERSION_RATE_INFO.baseRatePct = 9.0; // 9 + 2 = 11 > 10
    expect(getLegalConversionCapPct()).toBe(10);
  });

  it("전환율은 (월세 × 12) ÷ 전환 대상 금액", () => {
    const r = calcJeonseWolseConversion({
      jeonseDepositMan: 30_000,
      wolseDepositMan: 20_000,
      wolseMonthlyMan: 50,
    });
    expect(r.convertedAmountMan).toBe(10_000);
    expect(r.appliedRatePct).toBeCloseTo(6.0, 10);
    expect(r.exceedsCap).toBe(true);
  });

  it("전환 대상 금액이 0 이하면 계산하지 않는다", () => {
    const r = calcJeonseWolseConversion({
      jeonseDepositMan: 20_000,
      wolseDepositMan: 20_000,
      wolseMonthlyMan: 50,
    });
    expect(r.convertedAmountMan).toBe(0);
    expect(r.appliedRatePct).toBe(0);
    expect(r.exceedsCap).toBe(false);
  });
});
