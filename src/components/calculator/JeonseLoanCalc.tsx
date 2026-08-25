"use client";

import { useMemo } from "react";
import { useCalcState } from "@/hooks/useCalcState";
import { readNum, readWon } from "@/lib/calcInput";
import { calcJeonseLoan, formatKRW, formatUnit } from "@/lib/loan";
import InputField from "./InputField";
import ResultCard from "./ResultCard";
import SavingBanner from "./SavingBanner";

const FIELDS = [
  {
    key: "deposit",
    kind: "money" as const,
    defaultValue: "",
    validate: (v: string) =>
      !v || Number(v) <= 0 ? "보증금을 입력해주세요" : undefined,
  },
  {
    key: "rate",
    kind: "decimal" as const,
    defaultValue: "",
    validate: (v: string) =>
      !v || Number(v) <= 0 ? "이자율을 입력해주세요" : undefined,
  },
  {
    key: "months",
    kind: "integer" as const,
    defaultValue: "24",
    validate: (v: string) =>
      !v || Number(v) <= 0 ? "기간을 입력해주세요" : undefined,
  },
  {
    key: "income",
    kind: "money" as const,
    defaultValue: "",
  },
  {
    key: "ltv",
    kind: "decimal" as const,
    defaultValue: "80",
  },
];

const EXAMPLES = [
  {
    label: "서울 소형 전세",
    deposit: "30000",
    rate: "3.5",
    months: "24",
    income: "500",
  },
  {
    label: "수도권 중형 전세",
    deposit: "20000",
    rate: "3.8",
    months: "24",
    income: "400",
  },
  {
    label: "지방 전세",
    deposit: "10000",
    rate: "4.0",
    months: "24",
    income: "300",
  },
];

export default function JeonseLoanCalc() {
  const { state, setValue } = useCalcState(FIELDS);

  const result = useMemo(() => {
    const d = readWon(state, "deposit");
    const r = readNum(state, "rate");
    const m = readNum(state, "months");

    if (!d || !r || !m) return null;

    const income = readWon(state, "income");
    const ltv = readNum(state, "ltv") || 80;

    return calcJeonseLoan(d, r, m, income, ltv);
  }, [state]);

  function applyExample(ex: (typeof EXAMPLES)[0]) {
    setValue("deposit", ex.deposit);
    setValue("rate", ex.rate);
    setValue("months", ex.months);
    setValue("income", ex.income);
    setValue("ltv", "80");
  }

  return (
    <div className="space-y-6">
      <div className="space-y-5">
        <InputField
          label="전세 보증금"
          name="deposit"
          suffix="만원"
          placeholder="예: 30,000"
          hint="단위: 만원"
          value={state.deposit?.value ?? ""}
          error={state.deposit?.error}
          onChange={(v) => setValue("deposit", v)}
        />

        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="LTV 비율"
            name="ltv"
            suffix="%"
            placeholder="80"
            hint="통상 70~80%"
            value={state.ltv?.value ?? ""}
            error={state.ltv?.error}
            onChange={(v) => setValue("ltv", v)}
          />

          <InputField
            label="연 이자율"
            name="rate"
            suffix="%"
            step={0.1}
            placeholder="예: 3.8"
            value={state.rate?.value ?? ""}
            error={state.rate?.error}
            onChange={(v) => setValue("rate", v)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="전세 기간"
            name="months"
            suffix="개월"
            placeholder="24"
            value={state.months?.value ?? ""}
            error={state.months?.error}
            onChange={(v) => setValue("months", v)}
          />

          <InputField
            label="월 소득 (선택)"
            name="income"
            suffix="만원"
            placeholder="예: 500"
            hint="이자 부담 비율 계산용"
            value={state.income?.value ?? ""}
            onChange={(v) => setValue("income", v)}
          />
        </div>
      </div>

      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-2 space-y-4 duration-300">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <ResultCard
              label="대출 금액"
              value={formatUnit(result.loanAmount)}
              highlight
            />
            <ResultCard
              label="월 이자"
              value={formatKRW(result.monthlyInterest)}
            />
            <ResultCard
              label="총 이자"
              value={formatUnit(result.totalInterest)}
            />
            <ResultCard
              label="자기 부담"
              value={formatUnit(result.selfFunding)}
              danger={result.selfFunding > result.loanAmount}
            />
          </div>

          {result.interestRatio > 0 && (
            <div
              className={`rounded-xl border px-4 py-3 ${
                result.interestRatio > 40
                  ? "border-amber-200 bg-amber-50 text-amber-800"
                  : "border-emerald-200 bg-emerald-50 text-emerald-800"
              }`}
            >
              <p className="text-sm font-bold">
                {result.interestRatio > 40 ? "⚠️" : "✅"} 월소득 대비 월이자
                부담 비율(참고용): {result.interestRatio.toFixed(1)}%
              </p>
              <p className="mt-0.5 text-xs opacity-75">
                이 수치는 단순 참고용입니다. 실제 금융기관 DTI 심사 기준과 다를
                수 있습니다.
              </p>
            </div>
          )}

          <SavingBanner
            message={result.savingMessage}
            isProfit={result.interestRatio <= 40 || result.interestRatio === 0}
          />

          <p className="text-xs text-slate-400">
            ※ 실제 대출 한도는 소득·신용·보증기관(HUG·HF·SGI)에 따라 다를 수
            있습니다.
          </p>
        </div>
      )}

      <div className="border-t border-slate-100 pt-2">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
          계산 예시 — 눌러서 바로 적용
        </p>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {EXAMPLES.map((ex) => {
            const preview = calcJeonseLoan(
              Number(ex.deposit) * 10_000,
              Number(ex.rate),
              Number(ex.months),
              Number(ex.income) * 10_000,
              80,
            );

            return (
              <button
                key={ex.label}
                onClick={() => applyExample(ex)}
                className="group rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-left transition-all hover:border-brand-200 hover:bg-brand-50"
              >
                <p className="mb-1 text-xs font-bold text-slate-600 group-hover:text-brand-700">
                  {ex.label}
                </p>
                <p className="text-xs text-slate-400">
                  보증금 {Number(ex.deposit).toLocaleString()}만원 · {ex.rate}%
                </p>
                <p className="mt-1.5 text-sm font-black text-slate-800">
                  월 이자 {formatKRW(preview.monthlyInterest)}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  대출 {formatUnit(preview.loanAmount)}
                </p>
              </button>
            );
          })}
        </div>

        <p className="mt-3 text-xs leading-relaxed text-slate-400">
          💡 전세자금대출은 보통 <strong>만기일시상환</strong> 방식으로, 계약
          기간 동안 이자만 납부하고 만기에 보증금을 돌려받아 원금을 상환합니다.
        </p>
      </div>
    </div>
  );
}
