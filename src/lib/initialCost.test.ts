import { describe, it, expect } from "vitest";
import {
  calcInitialCost,
  type InitialCostInput,
  type CostChoice,
} from "@/lib/initialCost";
import {
  calcMaxBrokerageFee,
  BROKERAGE_META,
  SALE_BROKERAGE_BANDS,
  VERIFIED_LOCAL_ORDINANCES,
} from "@/lib/policy/brokerage";
import { validatePolicyMeta } from "@/lib/policy/types";

const 억 = 100_000_000;
const 만 = 10_000;

const cost = (won: number): CostChoice => ({ kind: "amount", amountWon: won });

function run(over: Partial<InitialCostInput> = {}) {
  const base: InitialCostInput = {
    housePriceWon: 5 * 억,
    acquisition: {
      ownership: "first",
      isAdjustedArea: false,
      isOver85: false,
    },
    brokerage: { kind: "auto", includeVat: true },
    registrationCost: cost(150 * 만),
    otherCostWon: 0,
    loanWon: 3 * 억,
    rentDepositWon: 0,
  };
  return calcInitialCost({ ...base, ...over });
}

// ─────────────────────────────────────────────
describe("중개보수 정책", () => {
  it("메타데이터 필수 필드가 갖춰져 있다", () => {
    expect(validatePolicyMeta(BROKERAGE_META)).toEqual([]);
  });

  it("effectiveFrom 은 조례 버전이 아니라 요율 적용 시작일이다", () => {
    expect(BROKERAGE_META.effectiveFrom).toBe("2021-12-30");
    expect(BROKERAGE_META.note).toContain("2022-12-30");
  });

  it("조례 일치를 확인한 시·도만 기록한다", () => {
    expect(VERIFIED_LOCAL_ORDINANCES).toEqual(["서울특별시", "경기도"]);
    expect(BROKERAGE_META.unsupported.join()).toContain("시·도별 조례 요율차");
  });

  it("6개 구간이 정의되어 있다", () => {
    expect(SALE_BROKERAGE_BANDS).toHaveLength(6);
  });
});

describe("중개보수 구간 경계 — 미만/이상", () => {
  const rateAt = (won: number) => calcMaxBrokerageFee(won)?.band.rate;

  it("5천만원 직전은 0.6%, 정확히 5천만원은 0.5%", () => {
    expect(rateAt(50 * 억 * 0 + 49_999_999)).toBe(0.006);
    expect(rateAt(50_000_000)).toBe(0.005);
  });

  it("2억 / 9억 / 12억 / 15억 경계", () => {
    expect(rateAt(199_999_999)).toBe(0.005);
    expect(rateAt(2 * 억)).toBe(0.004);
    expect(rateAt(899_999_999)).toBe(0.004);
    expect(rateAt(9 * 억)).toBe(0.005);
    expect(rateAt(1_199_999_999)).toBe(0.005);
    expect(rateAt(12 * 억)).toBe(0.006);
    expect(rateAt(1_499_999_999)).toBe(0.006);
    expect(rateAt(15 * 억)).toBe(0.007);
    expect(rateAt(30 * 억)).toBe(0.007);
  });

  it("0 이하는 계산하지 않는다", () => {
    expect(calcMaxBrokerageFee(0)).toBeNull();
    expect(calcMaxBrokerageFee(-1)).toBeNull();
  });
});

describe("중개보수 한도액", () => {
  it("5천만원 미만 구간의 한도 25만원", () => {
    const r = calcMaxBrokerageFee(49_000_000); // 0.6% = 294,000
    expect(r?.rawFeeWon).toBe(294_000);
    expect(r?.maxFeeWon).toBe(250_000);
    expect(r?.capApplied).toBe(true);
  });

  it("5천만~2억 구간의 한도 80만원", () => {
    const r = calcMaxBrokerageFee(199_000_000); // 0.5% = 995,000
    expect(r?.maxFeeWon).toBe(800_000);
    expect(r?.capApplied).toBe(true);
  });

  it("한도와 정확히 같으면 한도 적용으로 보지 않는다", () => {
    const r = calcMaxBrokerageFee(160_000_000); // 0.5% = 800,000 = 한도
    expect(r?.maxFeeWon).toBe(800_000);
    expect(r?.capApplied).toBe(false);
  });

  it("2억 이상 구간에는 한도가 없다", () => {
    const r = calcMaxBrokerageFee(5 * 억); // 0.4% = 2,000,000
    expect(r?.band.capWon).toBeNull();
    expect(r?.maxFeeWon).toBe(2_000_000);
  });
});

// ─────────────────────────────────────────────
describe("실투자금 — 기본 산식", () => {
  it("매매 5억 · 1주택 · 대출 3억 · 등기 150만", () => {
    const r = run();
    if (r.status !== "ok") throw new Error("ok 여야 함");
    const x = r.result;
    expect(x.acquisitionTaxWon).toBe(5_500_000); // 취득세 500만 + 지방교육세 50만
    expect(x.brokerageFeeWon).toBe(2_000_000); // 0.4%
    expect(x.brokerageVatWon).toBe(200_000);
    expect(x.registrationCostWon).toBe(1_500_000);
    expect(x.totalExtraCostWon).toBe(9_200_000);
    expect(x.totalRequiredWon).toBe(509_200_000);
    expect(x.equityWon).toBe(209_200_000);
    expect(x.extraCostRatioPct).toBeCloseTo(1.84, 2);
  });

  it("임대보증금을 승계하면 실투자금이 그만큼 줄어든다", () => {
    const r = run({ rentDepositWon: 1 * 억 });
    if (r.status !== "ok") throw new Error("ok 여야 함");
    expect(r.result.equityWon).toBe(109_200_000);
  });

  it("대출·보증금이 총 필요자금을 넘으면 음수를 표시하되 표시로 알린다", () => {
    const r = run({ loanWon: 6 * 억 });
    if (r.status !== "ok") throw new Error("ok 여야 함");
    expect(r.result.equityWon).toBeLessThan(0);
    expect(r.result.isEquityNegative).toBe(true);
  });
});

describe("부가가치세", () => {
  it("제외하면 중개보수에서 VAT 만큼 빠진다", () => {
    const on = run();
    const off = run({ brokerage: { kind: "auto", includeVat: false } });
    if (on.status !== "ok" || off.status !== "ok") throw new Error("ok 여야 함");
    expect(off.result.brokerageVatWon).toBe(0);
    expect(on.result.totalExtraCostWon - off.result.totalExtraCostWon).toBe(200_000);
  });

  it("직접 입력한 중개보수에도 VAT 를 적용한다", () => {
    const r = run({
      brokerage: { kind: "amount", amountWon: 1_000_000, includeVat: true },
    });
    if (r.status !== "ok") throw new Error("ok 여야 함");
    expect(r.result.brokerageFeeWon).toBe(1_000_000);
    expect(r.result.brokerageVatWon).toBe(100_000);
    expect(r.result.brokerageBandLabel).toBeNull();
  });
});

describe("등기·법무 비용 명시 선택", () => {
  it("선택하지 않으면 계산하지 않는다", () => {
    const r = run({ registrationCost: { kind: "unselected" } });
    expect(r.status).toBe("needsInput");
    if (r.status === "needsInput") expect(r.missing).toContain("registrationCost");
  });

  it("'포함하지 않음'을 고르면 0원으로 계산한다", () => {
    const r = run({ registrationCost: { kind: "excluded" } });
    if (r.status !== "ok") throw new Error("ok 여야 함");
    expect(r.result.registrationCostWon).toBe(0);
    expect(r.result.totalExtraCostWon).toBe(7_700_000);
    expect(r.result.notes.join()).toContain("등기");
  });

  it("주택 가격이 없으면 입력 필요", () => {
    const r = run({ housePriceWon: 0 });
    expect(r.status).toBe("needsInput");
    if (r.status === "needsInput") expect(r.missing).toContain("housePrice");
  });
});

describe("취득세 엔진 연동", () => {
  it("PR 2a 의 저가주택 중과 배제가 그대로 반영된다", () => {
    const r = run({
      housePriceWon: 3 * 억,
      acquisition: {
        ownership: "third",
        isAdjustedArea: true,
        isOver85: false,
        isMetroArea: false,
        officialPriceMan: 15_000,
      },
    });
    if (r.status !== "ok") throw new Error("ok 여야 함");
    expect(r.result.acquisitionDetail.appliedRule).toBe("lowPriceExempt");
    expect(r.result.acquisitionTaxWon).toBe(3_300_000);
  });

  it("취득세가 지원하지 않는 조합이면 사유를 그대로 올린다", () => {
    const r = run({
      acquisition: {
        ownership: "first",
        isAdjustedArea: false,
        isOver85: true,
        firstHomeReduction: "standard",
      },
    });
    if (r.status !== "ok") throw new Error("ok 여야 함");
    expect(r.result.notes.join()).toMatch(/자동 적용하지 않|확인이 필요/);
  });

  it("정책 메타데이터를 모두 돌려준다", () => {
    const r = run();
    if (r.status !== "ok") throw new Error("ok 여야 함");
    const ids = r.result.metas.map((m) => m.id);
    expect(ids).toContain("brokerage-fee");
    expect(ids).toContain("acquisition-tax");
  });
});
