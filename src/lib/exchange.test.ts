import { describe, it, expect } from "vitest";
import {
  calcExchange,
  type ExchangeInput,
  type ExchangeResult,
} from "@/lib/exchange";
import {
  CURRENCIES,
  CURRENCY_META,
  findCurrency,
  HUNDRED_UNIT_CODES,
} from "@/lib/policy/currency";
import { validatePolicyMeta } from "@/lib/policy/types";

const USD_BASE: ExchangeInput = {
  currencyCode: "USD",
  direction: "buy",
  baseRate: 1_200,
  spreadMode: "rate",
  spreadPercent: 1.75,
  preferentialPercent: 0,
  foreignAmount: 1_000,
};

function ok(input: ExchangeInput): ExchangeResult {
  const out = calcExchange(input);
  if (out.status !== "ok") throw new Error(`expected ok, got: ${out.reason}`);
  return out.value;
}

function reason(input: ExchangeInput): string {
  const out = calcExchange(input);
  if (out.status !== "unsupported") throw new Error("expected unsupported");
  return out.reason;
}

describe("정책 메타데이터", () => {
  it("PolicyMeta 필수 항목을 만족한다", () => {
    expect(validatePolicyMeta(CURRENCY_META)).toEqual([]);
  });

  it("환율과 스프레드는 정책 파일에 두지 않는다", () => {
    const joined = CURRENCY_META.unsupported.join(" ");
    expect(joined).toContain("환율 값 자체");
    expect(joined).toContain("스프레드");
  });
});

describe("고시 단위", () => {
  it("100단위 고시 통화는 JPY·VND·IDR·KHR 네 개다", () => {
    expect([...HUNDRED_UNIT_CODES].sort()).toEqual(
      ["IDR", "JPY", "KHR", "VND"].sort(),
    );
  });

  it("USD 는 1단위 고시", () => {
    expect(findCurrency("USD")?.quoteUnit).toBe(1);
  });

  it("통화 코드가 중복되지 않는다", () => {
    const codes = CURRENCIES.map((c) => c.code);
    expect(new Set(codes).size).toBe(codes.length);
  });
});

describe("기본 계산 — KB 공식 자료 예시 재현", () => {
  it("기준 1,200원 · 스프레드 1.75% · 살 때 → 1,221원", () => {
    const r = ok(USD_BASE);
    expect(r.rateWithoutPreference).toBe(1_221);
    expect(r.rateWithPreference).toBe(1_221); // 우대 0%
  });

  it("같은 조건 팔 때 → 1,179원", () => {
    const r = ok({ ...USD_BASE, direction: "sell" });
    expect(r.rateWithoutPreference).toBe(1_179);
  });

  it("우대 50% → 스프레드 0.875%, 살 때 1,210.5원 / 팔 때 1,189.5원", () => {
    const buy = ok({ ...USD_BASE, preferentialPercent: 50 });
    expect(buy.effectiveSpreadPercent).toBe(0.875);
    expect(buy.rateWithPreference).toBe(1_210.5);

    const sell = ok({
      ...USD_BASE,
      direction: "sell",
      preferentialPercent: 50,
    });
    expect(sell.rateWithPreference).toBe(1_189.5);
  });

  it("우대 100% → 매매기준율 그대로, 수수료 0", () => {
    const r = ok({ ...USD_BASE, preferentialPercent: 100 });
    expect(r.rateWithPreference).toBe(1_200);
    expect(r.effectiveSpreadPercent).toBe(0);
    expect(r.feeAfterPreference).toBe(0);
  });
});

describe("금액·절약액", () => {
  it("1,000달러 · 우대 0% → 1,221,000원 필요, 절약 0", () => {
    const r = ok(USD_BASE);
    expect(r.krwWithPreference).toBe(1_221_000);
    expect(r.savedKrw).toBe(0);
    expect(r.feeAfterPreference).toBe(21_000);
  });

  it("우대 50% → 10,500원 절약, 남은 수수료 10,500원", () => {
    const r = ok({ ...USD_BASE, preferentialPercent: 50 });
    expect(r.krwWithPreference).toBe(1_210_500);
    expect(r.savedKrw).toBe(10_500);
    expect(r.feeAfterPreference).toBe(10_500);
  });

  it("팔 때 우대는 '더 받는' 방향이며 절약액은 양수", () => {
    const r = ok({
      ...USD_BASE,
      direction: "sell",
      preferentialPercent: 50,
    });
    expect(r.krwWithPreference).toBeGreaterThan(r.krwWithoutPreference);
    expect(r.savedKrw).toBe(10_500);
  });
});

describe("100단위 고시 통화 — 100배 오차 방지", () => {
  it("엔화 매매기준율 950원은 100엔 기준이다", () => {
    const r = ok({
      currencyCode: "JPY",
      direction: "buy",
      baseRate: 950, // 100엔당
      spreadMode: "rate",
      spreadPercent: 1.75,
      preferentialPercent: 0,
      foreignAmount: 100_000, // 10만엔
    });

    // 100엔당 966.625원 → 10만엔은 966,625원
    expect(r.rateWithoutPreference).toBe(966.625);
    expect(r.unitRateWithPreference).toBe(9.66625);
    expect(r.krwWithPreference).toBe(966_625);
  });

  it("같은 숫자를 1단위 통화로 넣으면 정확히 100배가 된다", () => {
    const base = {
      direction: "buy" as const,
      baseRate: 950,
      spreadMode: "rate" as const,
      spreadPercent: 1.75,
      preferentialPercent: 0,
      foreignAmount: 100_000,
    };
    const jpy = ok({ ...base, currencyCode: "JPY" });
    const usd = ok({ ...base, currencyCode: "USD" });
    expect(usd.krwWithPreference).toBeCloseTo(jpy.krwWithPreference * 100, 2);
  });
});

describe("현찰 환율로 스프레드 역산", () => {
  it("기준 1,200 · 현찰 살 때 1,221 → 스프레드 1.75%", () => {
    const r = ok({
      ...USD_BASE,
      spreadMode: "cashRate",
      spreadPercent: undefined,
      cashRate: 1_221,
    });
    expect(r.spreadPercent).toBe(1.75);
    expect(r.rateWithoutPreference).toBe(1_221);
  });

  it("팔 때는 현찰 파실 때 환율이 기준율보다 낮아야 한다", () => {
    const r = ok({
      ...USD_BASE,
      direction: "sell",
      spreadMode: "cashRate",
      spreadPercent: undefined,
      cashRate: 1_179,
    });
    expect(r.spreadPercent).toBe(1.75);
  });

  it("두 방식의 결과가 일치한다", () => {
    const a = ok({ ...USD_BASE, preferentialPercent: 70 });
    const b = ok({
      ...USD_BASE,
      spreadMode: "cashRate",
      spreadPercent: undefined,
      cashRate: 1_221,
      preferentialPercent: 70,
    });
    expect(b.krwWithPreference).toBeCloseTo(a.krwWithPreference, 6);
  });
});

describe("조용한 기본값 금지 — 미입력 시 계산하지 않는다", () => {
  it("매매기준율이 없으면 차단하고 이유를 밝힌다", () => {
    const r = reason({ ...USD_BASE, baseRate: 0 });
    expect(r).toContain("매매기준율을 입력");
    expect(r).toContain("실시간 환율을 가져오지 않");
  });

  it("수수료율이 없으면 차단한다", () => {
    const r = reason({ ...USD_BASE, spreadPercent: undefined });
    expect(r).toContain("환전 수수료율을 입력");
    expect(r).toContain("공통 기본값을 쓰지 않습니다");
  });

  it("현찰 환율 모드에서 현찰 환율이 없으면 차단한다", () => {
    const r = reason({
      ...USD_BASE,
      spreadMode: "cashRate",
      spreadPercent: undefined,
    });
    expect(r).toContain("현찰 환율을 입력");
  });

  it("수수료율 0%는 유효한 입력이다 (우대 100% 상품 등)", () => {
    const r = ok({ ...USD_BASE, spreadPercent: 0 });
    expect(r.rateWithPreference).toBe(1_200);
  });

  it("지원하지 않는 통화는 차단한다", () => {
    expect(reason({ ...USD_BASE, currencyCode: "ZZZ" })).toContain(
      "지원하지 않는 통화",
    );
  });
});

describe("입력이 뒤바뀐 경우", () => {
  it("살 때인데 현찰 환율이 기준율보다 낮으면 알려준다", () => {
    const r = reason({
      ...USD_BASE,
      spreadMode: "cashRate",
      spreadPercent: undefined,
      cashRate: 1_179,
    });
    expect(r).toContain("두 값이 바뀌었는지");
  });

  it("팔 때인데 현찰 환율이 기준율보다 높으면 알려준다", () => {
    const r = reason({
      ...USD_BASE,
      direction: "sell",
      spreadMode: "cashRate",
      spreadPercent: undefined,
      cashRate: 1_221,
    });
    expect(r).toContain("두 값이 바뀌었는지");
  });

  it("우대율은 0~100% 로 제한된다", () => {
    expect(
      ok({ ...USD_BASE, preferentialPercent: 150 }).rateWithPreference,
    ).toBe(1_200);
    expect(
      ok({ ...USD_BASE, preferentialPercent: -50 }).rateWithPreference,
    ).toBe(1_221);
  });
});
