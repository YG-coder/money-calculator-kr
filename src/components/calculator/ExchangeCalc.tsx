"use client";

import { useMemo, useState } from "react";
import { useCalcState } from "@/hooks/useCalcState";
import { readNum, isFilled } from "@/lib/calcInput";
import { formatKRW } from "@/lib/loan";
import {
  calcExchange,
  type ExchangeDirection,
  type SpreadInputMode,
} from "@/lib/exchange";
import {
  CURRENCIES,
  HUNDRED_UNIT_CODES,
  findCurrency,
} from "@/lib/policy/currency";
import InputField from "@/components/calculator/InputField";
import ResultCard from "@/components/calculator/ResultCard";
import ToggleGroup from "@/components/calculator/ToggleGroup";

const FIELDS = [
  { key: "baseRate", kind: "decimal" as const, defaultValue: "" },
  { key: "spreadPct", kind: "decimal" as const, defaultValue: "" },
  { key: "cashRate", kind: "decimal" as const, defaultValue: "" },
  { key: "preferential", kind: "decimal" as const, defaultValue: "0" },
  { key: "amount", kind: "decimal" as const, defaultValue: "" },
];

const trim = (n: number, d = 2) => Number(n.toFixed(d));

/**
 * 환율 표기 — 뒤따르는 0 은 지운다.
 *
 * ⚠️ 100단위 고시 통화의 '1단위당 환율'은 자릿수가 크게 늘어난다.
 *    (예: 100엔당 953.325원 → 1엔당 9.53325원)
 *    기본 4자리로 자르면 9.5333 이 되어 예시 표기와 어긋나므로,
 *    1단위 환산 환율은 digits 를 6 으로 넘겨 쓴다.
 */
function formatRate(n: number, digits = 4): string {
  return trim(n, digits).toLocaleString("ko-KR", {
    maximumFractionDigits: digits,
  });
}

export default function ExchangeCalc() {
  const { state, setValue } = useCalcState(FIELDS);

  const [code, setCode] = useState("USD");
  const [direction, setDirection] = useState<ExchangeDirection>("buy");
  const [spreadMode, setSpreadMode] = useState<SpreadInputMode>("rate");

  const currency = findCurrency(code)!;
  const isBuy = direction === "buy";

  const outcome = useMemo(() => {
    const amount = readNum(state, "amount");
    if (!amount) return null;

    // 매매기준율은 조용한 기본값을 두지 않는다 — 비어 있으면 엔진이 사유를 돌려준다
    return calcExchange({
      currencyCode: code,
      direction,
      baseRate: readNum(state, "baseRate"),
      spreadMode,
      spreadPercent: isFilled(state, "spreadPct")
        ? readNum(state, "spreadPct")
        : undefined,
      cashRate: isFilled(state, "cashRate")
        ? readNum(state, "cashRate")
        : undefined,
      preferentialPercent: readNum(state, "preferential"),
      foreignAmount: amount,
    });
  }, [state, code, direction, spreadMode]);

  const result = outcome?.status === "ok" ? outcome.value : null;
  const blockedReason =
    outcome?.status === "unsupported" ? outcome.reason : null;

  const unitLabel =
    currency.quoteUnit === 100 ? `100${currency.code}` : currency.code;

  return (
    <div className="space-y-5">
      {/* ── 통화 ── */}
      <div>
        <label
          htmlFor="currency"
          className="mb-1.5 block text-sm font-semibold text-slate-700"
        >
          통화
        </label>
        <select
          id="currency"
          name="currency"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 outline-none transition-colors focus:border-brand-500"
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} · {c.name} ({c.region})
              {c.quoteUnit === 100 ? " — 100단위 고시" : ""}
            </option>
          ))}
        </select>
        {currency.quoteUnit === 100 && (
          <p className="mt-1.5 text-xs leading-relaxed text-amber-700">
            {currency.name}는 <strong>100{currency.code} 단위</strong>로
            고시됩니다. 아래 환율은 은행 고시표에 적힌 값(=100{currency.code}당
            원화)을 그대로 입력하세요.
          </p>
        )}
      </div>

      <ToggleGroup<ExchangeDirection>
        label="환전 방향"
        value={direction}
        onChange={setDirection}
        options={[
          { value: "buy", label: "원화 → 외화 (살 때)" },
          { value: "sell", label: "외화 → 원화 (팔 때)" },
        ]}
      />

      {/* ── 환율 ── */}
      <fieldset className="space-y-4 rounded-2xl border border-slate-200 p-4">
        <legend className="px-1 text-sm font-semibold text-slate-700">
          은행 고시환율
        </legend>

        <InputField
          label={`매매기준율 (${unitLabel}당)`}
          name="baseRate"
          suffix="원"
          step={0.01}
          placeholder={currency.quoteUnit === 100 ? "예: 950" : "예: 1,200"}
          hint="이 계산기는 실시간 환율을 가져오지 않습니다. 거래하려는 은행이 고시한 오늘의 매매기준율을 직접 입력하세요."
          value={state.baseRate?.value ?? ""}
          onChange={(v) => setValue("baseRate", v)}
        />

        <ToggleGroup<SpreadInputMode>
          label="환전 수수료 입력 방식"
          value={spreadMode}
          onChange={setSpreadMode}
          options={[
            { value: "rate", label: "수수료율(%)로" },
            { value: "cashRate", label: "현찰 환율로" },
          ]}
          hint="은행마다 공시 형태가 다릅니다. 수수료율만 아는 경우와 현찰 환율만 아는 경우 모두 계산할 수 있습니다."
        />

        {spreadMode === "rate" ? (
          <InputField
            label="환전 수수료율 (스프레드)"
            name="spreadPct"
            suffix="%"
            step={0.01}
            placeholder="예: 1.75"
            hint="은행·통화·상품마다 다르므로 기본값을 두지 않습니다. 고시환율표의 '환전 수수료율'을 확인해 입력하세요."
            value={state.spreadPct?.value ?? ""}
            onChange={(v) => setValue("spreadPct", v)}
          />
        ) : (
          <InputField
            label={`현찰 ${isBuy ? "살 때" : "파실 때"} 환율 (${unitLabel}당)`}
            name="cashRate"
            suffix="원"
            step={0.01}
            placeholder={
              currency.quoteUnit === 100 ? "예: 966.63" : "예: 1,221"
            }
            hint="매매기준율과 같은 단위로 입력하세요. 이 값에서 수수료율을 역산합니다."
            value={state.cashRate?.value ?? ""}
            onChange={(v) => setValue("cashRate", v)}
          />
        )}

        <InputField
          label="환율 우대율 (우대 없으면 0)"
          name="preferential"
          suffix="%"
          step={1}
          placeholder="예: 50"
          hint="우대율은 수수료를 깎아주는 비율입니다. 90% 우대는 수수료의 10%만 낸다는 뜻이고, 100%면 매매기준율 그대로 환전합니다."
          value={state.preferential?.value ?? ""}
          onChange={(v) => setValue("preferential", v)}
        />
      </fieldset>

      <InputField
        label={`환전할 금액 (${currency.code})`}
        name="amount"
        suffix={currency.code}
        step={1}
        placeholder={currency.quoteUnit === 100 ? "예: 100,000" : "예: 1,000"}
        hint={
          isBuy
            ? "받을 외화 금액을 입력하면 필요한 원화를 계산합니다."
            : "팔 외화 금액을 입력하면 받을 원화를 계산합니다."
        }
        value={state.amount?.value ?? ""}
        onChange={(v) => setValue("amount", v)}
      />

      {/* ── 계산 차단 안내 ── */}
      {blockedReason && (
        <div className="animate-in fade-in slide-in-from-bottom-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800 duration-300">
          <p className="mb-1 font-semibold">이 조건은 계산하지 않습니다</p>
          <p>{blockedReason}</p>
        </div>
      )}

      {/* ── 결과 ── */}
      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-2 space-y-4 pt-2 duration-300">
          <ResultCard
            label={isBuy ? "필요한 원화" : "받는 원화"}
            value={formatKRW(result.krwWithPreference)}
            sub={`적용환율 ${formatRate(result.rateWithPreference)}원 / ${unitLabel}`}
            highlight
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ResultCard
              label="우대 적용 전"
              value={formatKRW(result.krwWithoutPreference)}
              sub={`${formatRate(result.rateWithoutPreference)}원 / ${unitLabel}`}
            />
            <ResultCard
              label={isBuy ? "우대로 아낀 금액" : "우대로 더 받는 금액"}
              value={formatKRW(result.savedKrw)}
              sub={
                result.savedKrw > 0
                  ? `수수료율 ${trim(result.spreadPercent)}% → ${trim(result.effectiveSpreadPercent)}%`
                  : "우대율 0% — 고시 수수료가 그대로 적용됩니다"
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ResultCard
              label={`실질 환율 (1${currency.code}당)`}
              value={`${formatRate(result.unitRateWithPreference, 6)}원`}
              sub="우대까지 반영한 최종 적용 환율"
            />
            <ResultCard
              label="남은 환전 수수료"
              value={formatKRW(result.feeAfterPreference)}
              sub={`매매기준율 기준 ${formatKRW(result.krwAtBaseRate)} 대비`}
            />
          </div>

          {result.effectiveSpreadPercent === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              우대율 100%가 적용되어 매매기준율 그대로 환전하는 경우입니다.
              실제로는 은행별 최소 환전 금액·통화별 우대 한도 조건이 있을 수
              있습니다.
            </div>
          )}
        </div>
      )}

      {/* ── 고지 ── */}
      <div className="space-y-2 border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-400">
        <p>
          ※ 이 계산기는 <strong>실시간 환율을 연동하지 않습니다.</strong>{" "}
          매매기준율과 수수료율은 사용자가 입력한 값을 그대로 사용하며, 임의의
          기본 환율이나 과거 시점의 환율을 대신 쓰지 않습니다.
        </p>
        <p>
          ※ 환율은 하루에도 여러 번 바뀌고 수수료율·우대율은
          은행·통화·상품·채널에 따라 다릅니다. 결과는 입력값 기준의 예상
          금액이며 실제 환전 금액은 거래 시점의 고시환율과 은행 조건에 따라
          달라집니다.
        </p>
        <p>
          ※ {HUNDRED_UNIT_CODES.join(" · ")}는 100단위로 고시됩니다. 이 통화들은
          고시표의 값을 그대로 입력해야 하며, 1단위 환율로 환산해 넣으면 결과가
          100배 어긋납니다.
        </p>
        <p>
          ※ 현찰 환전 기준입니다. 송금 보내실 때·받으실 때 환율, 여행자수표,
          카드 해외결제 환율은 별도이며 이 계산기는 다루지 않습니다.
        </p>
      </div>
    </div>
  );
}
