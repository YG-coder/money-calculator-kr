// src/lib/exchange.ts
// ─────────────────────────────────────────────
// 환전 계산 엔진
//
// ⚠️ 환율과 스프레드는 이 파일에도, 정책 파일에도 두지 않습니다.
//    실시간 연동이 없으므로 빌드 시점 환율을 심으면 오래된 값이 조용히 쓰입니다.
//    매매기준율은 **사용자가 입력하지 않으면 계산하지 않습니다.**
//    (LTV 방공제에 적용한 규율과 같습니다)
//
// 계산식 (국내 은행 대고객 환율 관행)
//   현찰 살 때  = 매매기준율 × (1 + 스프레드율)
//   현찰 팔 때  = 매매기준율 × (1 − 스프레드율)
//   우대율 p    → 스프레드율 × (1 − p)
//   우대 100%   → 매매기준율 그대로
//
// ⚠️ 고시 단위
//   JPY·IDR·VND·KHR 의 매매기준율은 **100단위** 기준으로 고시됩니다.
//   "엔화 950원"은 1엔이 아니라 100엔 값입니다. 단위를 나누지 않으면 100배 어긋납니다.
// ─────────────────────────────────────────────

// 조사 근거: docs/policies/EXCHANGE-POLICY-2026-08.md (rev.1)

import { findCurrency, type CurrencyInfo } from "@/lib/policy/currency";

/** 원화 → 외화(살 때) / 외화 → 원화(팔 때) */
export type ExchangeDirection = "buy" | "sell";

/**
 * 스프레드 입력 방식 — 은행마다 공시 형태가 달라 명시 선택으로 둔다.
 *   rate    : 환전 수수료율(%)을 직접 입력
 *   cashRate: 현찰 살 때(또는 팔 때) 환율을 입력하고 스프레드를 역산
 */
export type SpreadInputMode = "rate" | "cashRate";

export type ExchangeOutcome<T> =
  { status: "ok"; value: T } | { status: "unsupported"; reason: string };

export interface ExchangeInput {
  currencyCode: string;
  direction: ExchangeDirection;
  /** 매매기준율 (원). 고시 단위 기준 값 그대로 — JPY 면 100엔당 값 */
  baseRate: number;
  spreadMode: SpreadInputMode;
  /** spreadMode === "rate" 일 때: 환전 수수료율(%) */
  spreadPercent?: number;
  /** spreadMode === "cashRate" 일 때: 현찰 환율(원), 고시 단위 기준 */
  cashRate?: number;
  /** 우대율(%). 0 = 우대 없음 */
  preferentialPercent: number;
  /** 환전할 외화 금액 (통화 단위) */
  foreignAmount: number;
}

export interface ExchangeResult {
  currency: CurrencyInfo;
  direction: ExchangeDirection;
  /** 고시 단위 기준 매매기준율 */
  baseRate: number;
  /** 환전 수수료율(%) — cashRate 모드에서는 역산값 */
  spreadPercent: number;
  /** 우대 적용 후 실질 수수료율(%) = spreadPercent × (1 − 우대율) */
  effectiveSpreadPercent: number;
  /** 우대 전 적용환율 (고시 단위 기준) */
  rateWithoutPreference: number;
  /** 우대 후 적용환율 (고시 단위 기준) */
  rateWithPreference: number;
  /** 외화 1단위당 우대 후 적용환율 — 화면의 '실질 환율' */
  unitRateWithPreference: number;
  /** 우대 전 원화 금액 (살 때: 필요액 / 팔 때: 수령액) */
  krwWithoutPreference: number;
  /** 우대 후 원화 금액 */
  krwWithPreference: number;
  /** 우대로 아낀(또는 더 받은) 원화 금액. 우대 0%면 0 */
  savedKrw: number;
  /** 매매기준율로만 환전했을 때의 원화 금액 — 수수료 총액 비교 기준 */
  krwAtBaseRate: number;
  /** 우대 후에도 남는 수수료 총액 (원) */
  feeAfterPreference: number;
}

/** 부동소수점 잔여 정리 */
function round(value: number, digits: number): number {
  const f = 10 ** digits;
  return Math.round(value * f) / f;
}

export function calcExchange(
  input: ExchangeInput,
): ExchangeOutcome<ExchangeResult> {
  const currency = findCurrency(input.currencyCode);
  if (!currency) {
    return {
      status: "unsupported",
      reason:
        "지원하지 않는 통화입니다. 목록에 없는 통화는 은행 고시환율을 직접 확인하세요.",
    };
  }

  // ── 매매기준율 — 조용한 기본값을 두지 않는다 ──
  if (!(input.baseRate > 0)) {
    return {
      status: "unsupported",
      reason:
        "매매기준율을 입력해야 계산합니다. 이 계산기는 실시간 환율을 가져오지 않으므로 " +
        "임의의 기본 환율이나 오래된 값을 대신 쓰지 않습니다. " +
        "거래하려는 은행이 고시한 오늘의 매매기준율을 입력하세요.",
    };
  }

  // ── 스프레드 ──
  let spreadPercent: number;

  if (input.spreadMode === "rate") {
    const p = input.spreadPercent;
    if (p === undefined || !(p >= 0)) {
      return {
        status: "unsupported",
        reason:
          "환전 수수료율을 입력해야 계산합니다. 수수료율은 은행·통화·상품마다 달라 " +
          "공통 기본값을 쓰지 않습니다. 고시환율표의 '환전 수수료율' 또는 " +
          "'스프레드'를 확인해 입력하세요.",
      };
    }
    spreadPercent = p;
  } else {
    const cash = input.cashRate;
    if (cash === undefined || !(cash > 0)) {
      return {
        status: "unsupported",
        reason:
          "현찰 환율을 입력해야 계산합니다. 고시환율표의 '현찰 살 때' 또는 " +
          "'현찰 파실 때' 값을 매매기준율과 같은 단위로 입력하세요.",
      };
    }

    // 살 때는 기준율보다 높고, 팔 때는 낮아야 스프레드가 양수로 나온다
    const diff =
      input.direction === "buy" ? cash - input.baseRate : input.baseRate - cash;

    if (diff < 0) {
      return {
        status: "unsupported",
        reason:
          input.direction === "buy"
            ? "현찰 살 때 환율이 매매기준율보다 낮습니다. 두 값이 바뀌었는지, 같은 단위인지 확인하세요."
            : "현찰 파실 때 환율이 매매기준율보다 높습니다. 두 값이 바뀌었는지, 같은 단위인지 확인하세요.",
      };
    }

    spreadPercent = (diff / input.baseRate) * 100;
  }

  // ── 우대율 ──
  const pref = Math.min(100, Math.max(0, input.preferentialPercent));
  const effectiveSpreadPercent = spreadPercent * (1 - pref / 100);

  const sign = input.direction === "buy" ? 1 : -1;
  const rateWithoutPreference =
    input.baseRate * (1 + (sign * spreadPercent) / 100);
  const rateWithPreference =
    input.baseRate * (1 + (sign * effectiveSpreadPercent) / 100);

  // ── 금액 ──
  // 고시 단위가 100이면 외화 1단위당 환율은 1/100
  const perUnit = (rate: number) => rate / currency.quoteUnit;
  const amount = Math.max(0, input.foreignAmount);

  const krwWithoutPreference = perUnit(rateWithoutPreference) * amount;
  const krwWithPreference = perUnit(rateWithPreference) * amount;
  const krwAtBaseRate = perUnit(input.baseRate) * amount;

  // 살 때는 덜 내는 금액, 팔 때는 더 받는 금액 — 어느 쪽이든 이득분은 양수
  const savedKrw = Math.abs(krwWithoutPreference - krwWithPreference);
  const feeAfterPreference = Math.abs(krwWithPreference - krwAtBaseRate);

  return {
    status: "ok",
    value: {
      currency,
      direction: input.direction,
      baseRate: input.baseRate,
      spreadPercent: round(spreadPercent, 4),
      effectiveSpreadPercent: round(effectiveSpreadPercent, 4),
      rateWithoutPreference: round(rateWithoutPreference, 4),
      rateWithPreference: round(rateWithPreference, 4),
      unitRateWithPreference: round(perUnit(rateWithPreference), 6),
      krwWithoutPreference: round(krwWithoutPreference, 2),
      krwWithPreference: round(krwWithPreference, 2),
      savedKrw: round(savedKrw, 2),
      krwAtBaseRate: round(krwAtBaseRate, 2),
      feeAfterPreference: round(feeAfterPreference, 2),
    },
  };
}
