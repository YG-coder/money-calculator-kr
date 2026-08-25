"use client";

import { useMemo } from "react";
import { useCalcState } from "@/hooks/useCalcState";
import { formatKRW } from "@/lib/loan";
import {
  calcJeonseWolseConversion,
  CONVERSION_RATE_INFO,
  getLegalConversionCapPct,
} from "@/lib/realEstate";
import InputField from "@/components/calculator/InputField";
import ResultCard from "@/components/calculator/ResultCard";

const FIELDS = [
  { key: "jeonse", kind: "money" as const, defaultValue: "" },
  { key: "wolseDeposit", kind: "money" as const, defaultValue: "" },
  { key: "wolse", kind: "money" as const, defaultValue: "" },
];

const manFmt = (man: number) => formatKRW(man * 10_000);

export default function JeonseWolseConversionCalc() {
  const { state, setValue } = useCalcState(FIELDS);

  // 현재 렌더의 state.raw를 직접 읽는다 (getWon/getNum의 ref는 한 박자 늦어 stale)
  const man = (key: string): number => {
    const n = Number(state[key]?.raw ?? "0");
    return isNaN(n) ? 0 : n;
  };
  const filled = (key: string) => (state[key]?.raw ?? "") !== "";

  const result = useMemo(() => {
    const jeonse = man("jeonse");
    const wolseDeposit = man("wolseDeposit");
    // 전환 대상 = 전세보증금 − 월세보증금 이 0보다 커야 성립
    if (!jeonse || !filled("wolseDeposit") || !filled("wolse")) return null;
    if (jeonse - wolseDeposit <= 0) return null;

    return calcJeonseWolseConversion({
      jeonseDepositMan: jeonse,
      wolseDepositMan: wolseDeposit,
      wolseMonthlyMan: man("wolse"),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <div className="space-y-5">
      <InputField
        label="전세 보증금"
        name="jeonse"
        suffix="만원"
        placeholder="예: 30,000"
        hint="전환 전 전세 보증금 (3억 → 30,000)"
        value={state.jeonse?.value ?? ""}
        onChange={(v) => setValue("jeonse", v)}
      />

      <div className="grid grid-cols-2 gap-3">
        <InputField
          label="전환 후 보증금"
          name="wolseDeposit"
          suffix="만원"
          placeholder="예: 20,000"
          hint="월세 전환 후 남기는 보증금"
          value={state.wolseDeposit?.value ?? ""}
          onChange={(v) => setValue("wolseDeposit", v)}
        />
        <InputField
          label="월세"
          name="wolse"
          suffix="만원"
          placeholder="예: 50"
          hint="매달 내는 월세"
          value={state.wolse?.value ?? ""}
          onChange={(v) => setValue("wolse", v)}
        />
      </div>

      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-2 space-y-4 pt-2 duration-300">
          {/* 적용 전환율 (핵심) */}
          <ResultCard
            label="적용 전환율"
            value={`${result.appliedRatePct.toFixed(2)}%`}
            sub={`전환 대상 보증금 ${manFmt(result.convertedAmountMan)} 기준`}
            highlight
          />

          {/* 법정 상한 대비 (사실) */}
          <div
            className={`rounded-2xl border p-4 text-sm ${
              result.exceedsCap
                ? "border-yellow-200 bg-yellow-50 text-slate-700"
                : "border-slate-200 bg-slate-50 text-slate-700"
            }`}
          >
            {result.exceedsCap ? (
              <p>
                적용 전환율 {result.appliedRatePct.toFixed(2)}%는 법정 상한{" "}
                <strong>{result.legalCapPct.toFixed(2)}%</strong>(주택)를
                넘습니다. 같은 조건에서 상한을 적용하면 월세는 약{" "}
                <strong>{manFmt(result.legalCapMonthlyMan)}</strong>입니다.
              </p>
            ) : (
              <p>
                적용 전환율 {result.appliedRatePct.toFixed(2)}%는 법정 상한{" "}
                <strong>{result.legalCapPct.toFixed(2)}%</strong>(주택) 이하입니다.
                상한을 적용한 월세는 약{" "}
                <strong>{manFmt(result.legalCapMonthlyMan)}</strong>까지입니다.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── 고지 ── */}
      <div className="space-y-2 border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-400">
        <p>
          ※ 법정 상한(주택) = 연 10%와 (한국은행 기준금리 + 연 2%) 중 낮은 값.
          현재 기준금리 {CONVERSION_RATE_INFO.baseRatePct}% 기준 상한{" "}
          {getLegalConversionCapPct().toFixed(2)}
          %입니다(검증일 {CONVERSION_RATE_INFO.verifiedAt}, 기준금리 변동 시 상한도
          바뀝니다).
        </p>
        <p>
          ※ 이 상한은 기존 임대차에서 보증금의 전부 또는 일부를 월세로 전환하는
          경우에 적용되는 기준입니다. 이 계산기는 우열이나 위법 여부를 판단하지
          않고 전환율과 법정 상한 대비 결과만 보여주므로, 구체적인 상황은 전문가와
          확인하세요.
        </p>
      </div>
    </div>
  );
}
