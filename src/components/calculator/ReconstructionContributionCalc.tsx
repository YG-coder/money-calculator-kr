"use client";

import { useMemo } from "react";
import { useCalcState } from "@/hooks/useCalcState";
import { readNum, readWon } from "@/lib/calcInput";
import { formatKRW } from "@/lib/loan";
import InputField from "@/components/calculator/InputField";
import ResultCard from "@/components/calculator/ResultCard";

const FIELDS = [
  {
    key: "previousAsset",
    kind: "money" as const,
    defaultValue: "",
    validate: (v: string) =>
      !v || Number(v) <= 0 ? "종전자산평가액을 입력해주세요" : undefined,
  },
  {
    key: "ratio",
    kind: "decimal" as const,
    defaultValue: "100",
    validate: (v: string) =>
      !v || Number(v) < 0 ? "비례율을 입력해주세요" : undefined,
  },
  {
    key: "futureAsset",
    kind: "money" as const,
    defaultValue: "",
    validate: (v: string) =>
      !v || Number(v) <= 0 ? "종후자산가액을 입력해주세요" : undefined,
  },
];

export default function ReconstructionContributionCalc() {
  const { state, setValue } = useCalcState(FIELDS);

  const result = useMemo(() => {
    // readWon: 만원 단위 입력 → 원 단위로 변환됨
    const previous = readWon(state, "previousAsset");
    const proportionalRatio = readNum(state, "ratio");
    const future = readWon(state, "futureAsset");

    if (!previous || !future || proportionalRatio < 0) return null;

    const rightValue = previous * (proportionalRatio / 100);
    const contribution = Math.max(future - rightValue, 0);
    const refund = Math.max(rightValue - future, 0);

    return {
      rightValue,
      contribution,
      refund,
    };
  }, [state]);

  return (
    <div className="space-y-5">
      <InputField
        label="종전자산평가액"
        name="previousAsset"
        suffix="만원"
        placeholder="예: 60,000"
        hint="현재 보유 부동산의 평가액 (6억 → 60,000)"
        value={state.previousAsset?.value ?? ""}
        error={state.previousAsset?.error}
        onChange={(v) => setValue("previousAsset", v)}
      />

      <InputField
        label="비례율"
        name="ratio"
        suffix="%"
        step={0.1}
        placeholder="예: 100"
        hint="조합 발표 비례율 (보통 90~110% 수준)"
        value={state.ratio?.value ?? ""}
        error={state.ratio?.error}
        onChange={(v) => setValue("ratio", v)}
      />

      <InputField
        label="종후자산가액"
        name="futureAsset"
        suffix="만원"
        placeholder="예: 90,000"
        hint="재건축 후 받을 부동산의 가액 (9억 → 90,000)"
        value={state.futureAsset?.value ?? ""}
        error={state.futureAsset?.error}
        onChange={(v) => setValue("futureAsset", v)}
      />

      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-2 space-y-4 pt-2 duration-300">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <ResultCard
              label={result.refund > 0 ? "예상 환급금" : "예상 분담금"}
              value={formatKRW(result.contribution > 0 ? result.contribution : result.refund)}
              sub={result.refund > 0 ? "권리가액 > 종후자산" : "종후자산 − 권리가액"}
              highlight
            />
            <ResultCard
              label="권리가액"
              value={formatKRW(result.rightValue)}
              sub="종전자산 × 비례율"
            />
            <ResultCard
              label="종후자산가액"
              value={formatKRW(readWon(state, "futureAsset"))}
              sub="재건축 후 받을 자산"
            />
          </div>

          <div className="rounded-2xl bg-slate-50 border border-slate-100 px-5 py-4 text-sm text-slate-600">
            <p className="font-bold text-slate-800 mb-3">📋 분담금 계산 요약</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>종전자산평가액</span>
                <span className="font-semibold tabular-nums text-slate-800">
                  {formatKRW(readWon(state, "previousAsset"))}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>× 비례율 ({readNum(state, "ratio")}%)</span>
                <span className="font-semibold tabular-nums text-slate-800">
                  {formatKRW(result.rightValue)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>종후자산가액</span>
                <span className="font-semibold tabular-nums text-slate-800">
                  {formatKRW(readWon(state, "futureAsset"))}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex items-center justify-between font-bold text-slate-900">
                <span>{result.refund > 0 ? "환급금" : "분담금"}</span>
                <span className="text-brand-600 tabular-nums">
                  {formatKRW(result.contribution > 0 ? result.contribution : result.refund)}
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            ※ 본 계산은 단순 추정치입니다. 실제 분담금은 공사비, 일반분양가,
            사업비, 조합원 분양가 등 여러 변수에 따라 달라질 수 있으므로, 정확한
            금액은 조합 발표 자료를 확인하세요.
          </p>
        </div>
      )}
    </div>
  );
}
