import { describe, it, expect } from "vitest";
import {
  CALC_PATH,
  toManwonParam,
  buildHandoffUrl,
  ltvToInitialCostUrl,
  initialCostToYieldUrl,
} from "@/lib/handoff";

const 만원 = 10_000;

describe("toManwonParam — 인계 가능한 값만 통과", () => {
  it("원을 만원 정수로 바꾼다", () => {
    expect(toManwonParam(500_000_000)).toBe(50_000);
    expect(toManwonParam(0)).toBe(0);
  });

  it("반올림한다", () => {
    expect(toManwonParam(15_500)).toBe(2);
    expect(toManwonParam(14_000)).toBe(1);
  });

  it("음수·NaN·무한대·null 은 제외한다", () => {
    for (const bad of [
      -1,
      -10_000,
      NaN,
      Infinity,
      -Infinity,
      null,
      undefined,
    ]) {
      expect(toManwonParam(bad as number)).toBeNull();
    }
  });
});

describe("buildHandoffUrl", () => {
  it("null 항목은 쿼리에서 빠진다", () => {
    expect(buildHandoffUrl("/x", { a: 1, b: null, c: 3 })).toBe("/x?a=1&c=3");
  });

  it("넣을 값이 없으면 경로만 돌려준다", () => {
    expect(buildHandoffUrl("/x", { a: null })).toBe("/x");
    expect(buildHandoffUrl("/x", {})).toBe("/x");
  });

  it("0 은 유효한 값이라 유지된다", () => {
    // 수도권 유주택 LTV 0% 처럼 한도가 0인 경우도 의미 있는 정보다
    expect(buildHandoffUrl("/x", { loan: 0 })).toBe("/x?loan=0");
  });
});

describe("LTV → 실투자금", () => {
  it("주택가격과 담보 기준 한도를 만원으로 넘긴다", () => {
    const url = ltvToInitialCostUrl({
      housePriceWon: 50_000 * 만원,
      limitWon: 30_000 * 만원,
    });
    expect(url).toBe(`${CALC_PATH.initialCost}?price=50000&loan=30000`);
  });

  it("한도 0원(수도권 유주택 등)도 그대로 넘긴다", () => {
    const url = ltvToInitialCostUrl({
      housePriceWon: 50_000 * 만원,
      limitWon: 0,
    });
    expect(url).toContain("loan=0");
  });

  it("명시 선택 항목(등기비용·중개보수 모드)은 쿼리에 넣지 않는다", () => {
    const url = ltvToInitialCostUrl({
      housePriceWon: 50_000 * 만원,
      limitWon: 30_000 * 만원,
    });
    for (const forbidden of ["registration", "brokerage", "ownership", "reg"]) {
      expect(url).not.toContain(forbidden);
    }
  });
});

describe("실투자금 → 임대수익률", () => {
  it("매입가·대출금·보증금·취득 부대비용을 넘긴다", () => {
    const url = initialCostToYieldUrl({
      purchasePriceWon: 50_000 * 만원,
      loanWon: 30_000 * 만원,
      depositWon: 5_000 * 만원,
      extraCostWon: 2_000 * 만원,
    });
    expect(url).toBe(
      `${CALC_PATH.propertyYield}?purchasePrice=50000&loanAmount=30000&deposit=5000&extraCost=2000`,
    );
  });

  it("실투자금 금액 자체는 넘기지 않는다 — 수신 측이 입력에서 파생한다", () => {
    const url = initialCostToYieldUrl({
      purchasePriceWon: 50_000 * 만원,
      loanWon: 30_000 * 만원,
      depositWon: 0,
      extraCostWon: 2_000 * 만원,
    });
    expect(url).not.toContain("equity");
    expect(url).not.toContain("invested");
  });
});

describe("경로 상수", () => {
  it("실제 라우트와 일치한다", () => {
    expect(CALC_PATH.ltv).toBe("/ltv-calculator");
    expect(CALC_PATH.dsr).toBe("/dsr-calculator");
    expect(CALC_PATH.initialCost).toBe("/real-estate/initial-cost-calculator");
    expect(CALC_PATH.propertyYield).toBe(
      "/real-estate/property-yield-calculator",
    );
  });
});
