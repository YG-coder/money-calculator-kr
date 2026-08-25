"use client";

import { useMemo, useState } from "react";
import { useCalcState } from "@/hooks/useCalcState";
import { readNum } from "@/lib/calcInput";
import { formatKRW, formatUnit } from "@/lib/loan";
import { calcAcquisitionTax, type OwnershipType } from "@/lib/realEstate";
import InputField from "@/components/calculator/InputField";
import ResultCard from "@/components/calculator/ResultCard";

const FIELDS = [
  {
    key: "price",
    kind: "money" as const,
    defaultValue: "",
    validate: (v: string) =>
      !v || Number(v) <= 0 ? "취득가액을 입력해주세요" : undefined,
  },
];

export default function AcquisitionTaxCalc() {
  const { state, setValue } = useCalcState(FIELDS);

  const [ownership, setOwnership] = useState<OwnershipType>("first");
  const [isAdjusted, setIsAdjusted] = useState(false);
  const [isOver85, setIsOver85] = useState(false);

  const result = useMemo(() => {
    const priceMan = readNum(state, "price");
    if (!priceMan || priceMan <= 0) return null;
    return calcAcquisitionTax(priceMan, ownership, isAdjusted, isOver85);
  }, [state, ownership, isAdjusted, isOver85]);

  const ownershipOptions: { value: OwnershipType; label: string }[] = [
    { value: "first",       label: "1주택 (무주택 → 첫 취득)" },
    { value: "second",      label: "2주택 (1주택 보유 중)" },
    { value: "third",       label: "3주택" },
    { value: "fourth_plus", label: "4주택 이상" },
  ];

  // 조정대상지역 구분은 2·3주택에서만 세율에 영향 (4주택 이상은 조정·비조정 모두 12%)
  const showAdjusted = ownership === "second" || ownership === "third";

  return (
    <div className="space-y-5">
      <InputField
        label="취득가액 (실거래가)"
        name="price"
        suffix="만원"
        placeholder="예: 50,000"
        hint="단위: 만원 (5억 → 50,000)"
        value={state.price?.value ?? ""}
        error={state.price?.error}
        onChange={(v) => setValue("price", v)}
      />

      {/* 전용면적 — 농어촌특별세 과세 기준 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-slate-600">
          전용면적 (농어촌특별세 기준)
        </label>
        <div className="flex gap-3">
          {[
            { value: false, label: "85㎡ 이하" },
            { value: true, label: "85㎡ 초과" },
          ].map((opt) => (
            <label
              key={String(opt.value)}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl border px-4 py-3 cursor-pointer transition-colors
                ${isOver85 === opt.value
                  ? "border-brand-400 bg-brand-50"
                  : "border-slate-200 bg-white hover:border-slate-300"}`}
            >
              <input
                type="radio"
                name="over85"
                checked={isOver85 === opt.value}
                onChange={() => setIsOver85(opt.value)}
                className="accent-brand-600"
              />
              <span className="text-sm font-semibold text-slate-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 주택 보유 수 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-slate-600">
          현재 주택 보유 수 (취득 후 기준)
        </label>
        <div className="flex flex-col gap-2">
          {ownershipOptions.map((o) => (
            <label
              key={o.value}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors
                ${ownership === o.value
                  ? "border-brand-400 bg-brand-50"
                  : "border-slate-200 bg-white hover:border-slate-300"}`}
            >
              <input
                type="radio"
                name="ownership"
                value={o.value}
                checked={ownership === o.value}
                onChange={() => setOwnership(o.value)}
                className="accent-brand-600"
              />
              <span className="text-sm font-semibold text-slate-700">{o.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 조정대상지역 — 2·3주택에서만 세율에 영향 */}
      {showAdjusted && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-600">
            조정대상지역 여부
          </label>
          <div className="flex gap-3">
            {[
              { value: true,  label: "조정대상지역" },
              { value: false, label: "비조정대상지역" },
            ].map((opt) => (
              <label
                key={String(opt.value)}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl border px-4 py-3 cursor-pointer transition-colors
                  ${isAdjusted === opt.value
                    ? "border-brand-400 bg-brand-50"
                    : "border-slate-200 bg-white hover:border-slate-300"}`}
              >
                <input
                  type="radio"
                  name="adjusted"
                  checked={isAdjusted === opt.value}
                  onChange={() => setIsAdjusted(opt.value)}
                  className="accent-brand-600"
                />
                <span className="text-sm font-semibold text-slate-700">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 결과 */}
      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-2 space-y-4 pt-2 duration-300">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ResultCard
              label="총 납부 세금"
              value={formatKRW(result.totalTax)}
              sub={`취득가액의 ${((result.totalTax / (readNum(state, "price") * 10_000)) * 100).toFixed(2)}%`}
              highlight
            />
            <ResultCard
              label="취득세"
              value={formatKRW(result.acquisitionTax)}
              sub={`세율 ${result.breakdown.acquisitionTaxRate}`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <ResultCard
              label="농어촌특별세"
              value={formatKRW(result.farmSpecialTax)}
              sub={result.breakdown.farmSpecialTaxRate}
            />
            <ResultCard
              label="지방교육세"
              value={formatKRW(result.localEduTax)}
              sub={result.breakdown.localEduTaxRate}
            />
          </div>

          {/* 세금 구성 요약 */}
          <div className="rounded-2xl bg-slate-50 border border-slate-100 px-5 py-4 text-sm text-slate-600">
            <p className="font-bold text-slate-800 mb-3">📋 세금 구성 요약</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>취득세 ({result.breakdown.acquisitionTaxRate})</span>
                <span className="font-semibold tabular-nums text-slate-800">
                  {formatKRW(result.acquisitionTax)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>농어촌특별세 ({result.breakdown.farmSpecialTaxRate})</span>
                <span className="font-semibold tabular-nums text-slate-800">
                  {formatKRW(result.farmSpecialTax)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>지방교육세 ({result.breakdown.localEduTaxRate})</span>
                <span className="font-semibold tabular-nums text-slate-800">
                  {formatKRW(result.localEduTax)}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex items-center justify-between font-bold text-slate-900">
                <span>합계</span>
                <span className="text-brand-600 tabular-nums">
                  {formatKRW(result.totalTax)}
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            ※ 2026-08-02 지방세법 기준 일반 주택 유상취득 세율입니다. 농어촌특별세는
            전용면적 85㎡ 초과 여부로 구분하며, 생애최초 감면·일시적 2주택·상속·증여·법인
            취득 등 특수 조건은 반영하지 않습니다. 정확한 세금은 관할 시·군·구청 또는
            세무사에게 확인하세요.
          </p>
        </div>
      )}
    </div>
  );
}
