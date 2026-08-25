"use client";

import { useMemo } from "react";
import { useCalcState } from "@/hooks/useCalcState";
import { readNum } from "@/lib/calcInput";
import { formatKRW, formatUnit } from "@/lib/loan";
import { calcPropertyYield } from "@/lib/realEstate";
import InputField from "@/components/calculator/InputField";
import ResultCard from "@/components/calculator/ResultCard";

const FIELDS = [
  {
    key: "purchasePrice",
    kind: "money" as const,
    defaultValue: "",
    validate: (v: string) =>
      !v || Number(v) <= 0 ? "매입가를 입력해주세요" : undefined,
  },
  {
    key: "deposit",
    kind: "money" as const,
    defaultValue: "0",
  },
  {
    key: "monthlyRent",
    kind: "money" as const,
    defaultValue: "",
    validate: (v: string) =>
      !v || Number(v) <= 0 ? "월세를 입력해주세요" : undefined,
  },
  {
    key: "loanAmount",
    kind: "money" as const,
    defaultValue: "0",
  },
  {
    key: "loanRate",
    kind: "decimal" as const,
    defaultValue: "0",
    validate: (v: string) =>
      v && Number(v) > 30 ? "금리가 너무 높습니다" : undefined,
  },
  {
    key: "monthlyCost",
    kind: "money" as const,
    defaultValue: "0",
  },
];

function formatPercent(value: number) {
  if (!Number.isFinite(value)) return "-";
  return `${value.toFixed(2)}%`;
}

export default function PropertyYieldCalc() {
  const { state, setValue } = useCalcState(FIELDS);

  const result = useMemo(() => {
    const price = readNum(state, "purchasePrice");
    const dep   = readNum(state, "deposit");
    const rent  = readNum(state, "monthlyRent");
    const loan  = readNum(state, "loanAmount");
    const rate  = readNum(state, "loanRate");
    const cost  = readNum(state, "monthlyCost");

    if (!price || !rent) return null;
    return calcPropertyYield(price, dep, rent, loan, rate, cost);
  }, [state]);

  const isProfit = result ? result.monthlyNetIncome > 0 : false;

  return (
    <div className="space-y-5">
      {/* 부동산 조건 */}
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
          부동산 조건
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputField
            label="매입가"
            name="purchasePrice"
            suffix="만원"
            placeholder="예: 30,000"
            hint="단위: 만원 (3억 → 30,000)"
            value={state.purchasePrice?.value ?? ""}
            error={state.purchasePrice?.error}
            onChange={(v) => setValue("purchasePrice", v)}
          />
          <InputField
            label="임대 보증금"
            name="deposit"
            suffix="만원"
            placeholder="예: 5,000"
            hint="없으면 0 입력"
            value={state.deposit?.value ?? ""}
            onChange={(v) => setValue("deposit", v)}
          />
        </div>
      </div>

      {/* 임대 수입 */}
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
          임대 수입·비용
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputField
            label="월세"
            name="monthlyRent"
            suffix="만원"
            placeholder="예: 100"
            value={state.monthlyRent?.value ?? ""}
            error={state.monthlyRent?.error}
            onChange={(v) => setValue("monthlyRent", v)}
          />
          <InputField
            label="월 관리·기타비용"
            name="monthlyCost"
            suffix="만원"
            placeholder="예: 10"
            hint="임대인 부담분 (없으면 0)"
            value={state.monthlyCost?.value ?? ""}
            onChange={(v) => setValue("monthlyCost", v)}
          />
        </div>
      </div>

      {/* 대출 조건 */}
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
          대출 조건 (선택)
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputField
            label="대출금"
            name="loanAmount"
            suffix="만원"
            placeholder="예: 15,000"
            hint="없으면 0 입력"
            value={state.loanAmount?.value ?? ""}
            onChange={(v) => setValue("loanAmount", v)}
          />
          <InputField
            label="대출 연 금리"
            name="loanRate"
            suffix="%"
            step={0.1}
            placeholder="예: 4.5"
            hint="대출 없으면 0"
            value={state.loanRate?.value ?? ""}
            error={state.loanRate?.error}
            onChange={(v) => setValue("loanRate", v)}
          />
        </div>
      </div>

      {/* 결과 */}
      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-2 space-y-4 pt-2 duration-300">
          {/* 핵심 결론 배너 */}
          <div
            className={`rounded-2xl p-5 border-2 ${
              isProfit
                ? "bg-brand-50 border-brand-300"
                : "bg-orange-50 border-orange-300"
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-1 text-slate-500">
              분석 결과
            </p>
            <p className="text-xl font-black text-slate-900">
              {isProfit
                ? `✅ 월 ${formatKRW(result.monthlyNetIncome)} 순수익 발생`
                : `⚠️ 월 ${formatKRW(Math.abs(result.monthlyNetIncome))} 손실 예상`}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              연간 환산 약 {formatUnit(Math.abs(result.annualNetIncome))}
              {!isProfit && " 손실"}
            </p>
          </div>

          {/* 핵심 수치 */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ResultCard
              label="월 순수익"
              value={formatKRW(result.monthlyNetIncome)}
              sub="월세 − 대출 이자 − 비용"
              highlight={isProfit}
              danger={!isProfit}
            />
            <ResultCard
              label="자기자본 수익률"
              value={formatPercent(result.equityYield)}
              sub={
                result.isInvestedNegative
                  ? "실투자금 ≤ 0 (계산 불가)"
                  : "실투자금 대비 연 수익률"
              }
              highlight={isProfit && !result.isInvestedNegative}
            />
          </div>

          {/* 상세 수치 */}
          <div className="grid grid-cols-2 gap-3">
            <ResultCard
              label="월 대출 이자"
              value={formatKRW(result.monthlyInterest)}
            />
            <ResultCard
              label="연 순수익"
              value={formatKRW(result.annualNetIncome)}
            />
            <ResultCard
              label="실투자금"
              value={formatKRW(result.investedCapital)}
              sub="매입가 − 보증금 − 대출금"
            />
            <ResultCard
              label="매입가 기준 수익률"
              value={formatPercent(result.purchaseYield)}
              sub="연 임대수익 ÷ 매입가"
            />
          </div>

          {/* 실투자금 0 이하 경고 */}
          {result.isInvestedNegative && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              ⚠️ 보증금과 대출금의 합이 매입가 이상입니다. 실투자금이 0 이하이므로
              자기자본 수익률은 의미가 왜곡됩니다. 매입가 기준 수익률을 확인하세요.
            </div>
          )}

          {/* 판단 가이드 */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            ⚖️ 계산된 자기자본 수익률은 현재 예금금리나 다른 투자 대안과 비교해
            보세요. 다만 이 계산에는 공실·세금·수선비·가격 변동이 반영되지 않으므로,
            수익률 숫자만으로 투자 여부를 판단하면 안 됩니다.
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            ※ 이 계산은 공실, 취득세, 재산세, 종합부동산세, 양도소득세, 중개수수료,
            수선비를 포함하지 않습니다. 실제 투자 판단 시에는 전체 보유 사이클의
            세금과 비용을 함께 검토해야 합니다.
          </p>
        </div>
      )}
    </div>
  );
}
