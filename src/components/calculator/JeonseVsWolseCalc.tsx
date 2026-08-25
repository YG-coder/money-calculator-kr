"use client";

import { useMemo } from "react";
import { useCalcState } from "@/hooks/useCalcState";
import { readNum } from "@/lib/calcInput";
import { formatKRW, formatUnit } from "@/lib/loan";
import { calcJeonseVsWolse } from "@/lib/realEstate";
import InputField from "@/components/calculator/InputField";
import ResultCard from "@/components/calculator/ResultCard";
import SavingBanner from "@/components/calculator/SavingBanner";

const FIELDS = [
  {
    key: "jeonseDeposit",
    kind: "money" as const,
    defaultValue: "",
    validate: (v: string) =>
      !v || Number(v) <= 0 ? "전세 보증금을 입력해주세요" : undefined,
  },
  {
    key: "wolseDeposit",
    kind: "money" as const,
    defaultValue: "0",
  },
  {
    key: "wolseMonthly",
    kind: "money" as const,
    defaultValue: "",
    validate: (v: string) =>
      !v || Number(v) <= 0 ? "월 임대료를 입력해주세요" : undefined,
  },
  {
    key: "investRate",
    kind: "decimal" as const,
    defaultValue: "3.5",
    validate: (v: string) =>
      !v || Number(v) <= 0
        ? "이자율을 입력해주세요"
        : Number(v) > 30
          ? "이자율이 너무 높습니다"
          : undefined,
  },
];

export default function JeonseVsWolseCalc() {
  const { state, setValue } = useCalcState(FIELDS);

  const result = useMemo(() => {
    const jd = readNum(state, "jeonseDeposit");
    const wd = readNum(state, "wolseDeposit");
    const wm = readNum(state, "wolseMonthly");
    const ir = readNum(state, "investRate");

    if (!jd || !wm || !ir) return null;
    return calcJeonseVsWolse(jd, wd, wm, ir);
  }, [state]);

  return (
    <div className="space-y-5">
      {/* 전세 조건 */}
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
          전세 조건
        </p>
        <InputField
          label="전세 보증금"
          name="jeonseDeposit"
          suffix="만원"
          placeholder="예: 30,000"
          hint="단위: 만원 (3억 → 30,000)"
          value={state.jeonseDeposit?.value ?? ""}
          error={state.jeonseDeposit?.error}
          onChange={(v) => setValue("jeonseDeposit", v)}
        />
      </div>

      {/* 월세 조건 */}
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
          월세 조건
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputField
            label="월세 보증금"
            name="wolseDeposit"
            suffix="만원"
            placeholder="예: 1,000"
            hint="없으면 0 입력"
            value={state.wolseDeposit?.value ?? ""}
            onChange={(v) => setValue("wolseDeposit", v)}
          />
          <InputField
            label="월 임대료 (월세)"
            name="wolseMonthly"
            suffix="만원"
            placeholder="예: 100"
            value={state.wolseMonthly?.value ?? ""}
            error={state.wolseMonthly?.error}
            onChange={(v) => setValue("wolseMonthly", v)}
          />
        </div>
      </div>

      {/* 이자율 */}
      <InputField
        label="보증금 운용 연 이자율"
        name="investRate"
        suffix="%"
        step={0.1}
        placeholder="예: 3.5"
        hint="전세 보증금을 예금·투자로 운용 시 기대 수익률 (정기예금 기준 권장)"
        value={state.investRate?.value ?? ""}
        error={state.investRate?.error}
        onChange={(v) => setValue("investRate", v)}
      />

      {/* 결과 */}
      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-2 space-y-4 pt-2 duration-300">
          {/* 핵심 결론 배너 */}
          <div
            className={`rounded-2xl p-5 border-2 ${
              result.jeonseIsBetter
                ? "bg-brand-50 border-brand-300"
                : "bg-orange-50 border-orange-300"
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-1 text-slate-500">
              분석 결과
            </p>
            <p className="text-xl font-black text-slate-900">
              {result.jeonseIsBetter
                ? `✅ 전세가 월 ${formatKRW(result.monthlyDiff)} 더 유리`
                : `🏠 월세가 월 ${formatKRW(result.monthlyDiff)} 더 유리`}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              연간으로 환산하면 약 {formatUnit(result.yearlyDiff)} 차이
            </p>
          </div>

          {/* 상세 수치 */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ResultCard
              label="전세 월 기회비용"
              value={formatKRW(result.jeonseMonthlyOpportunityCost)}
              sub="보증금 묶임으로 포기하는 이자"
              highlight={!result.jeonseIsBetter}
            />
            <ResultCard
              label="월세 월 실질 비용"
              value={formatKRW(result.wolseMonthlyTotalCost)}
              sub="월세 + 보증금 기회비용"
              highlight={result.jeonseIsBetter}
            />
          </div>

          {/* 손익분기 */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            ⚖️ 손익분기 이자율:{" "}
            <strong className="text-slate-900">
              연 {result.breakEvenRate.toFixed(2)}%
            </strong>
            {" "}— 이보다 높으면 <strong>전세</strong> 유리,
            낮으면 <strong>월세</strong> 유리
          </div>

          <SavingBanner
            message={
              result.jeonseIsBetter
                ? `현재 조건에서 전세가 월 ${formatKRW(result.monthlyDiff)}, 연 ${formatUnit(result.yearlyDiff)} 더 유리합니다.`
                : `현재 조건에서 월세가 월 ${formatKRW(result.monthlyDiff)}, 연 ${formatUnit(result.yearlyDiff)} 더 유리합니다.`
            }
            isProfit={result.jeonseIsBetter}
          />

          <p className="text-xs text-slate-400 leading-relaxed">
            ※ 순수 기회비용 기준 계산입니다. 전세보증보험료, 월세 소득공제,
            보증금 반환 리스크 등은 포함되지 않습니다.
          </p>
        </div>
      )}
    </div>
  );
}
