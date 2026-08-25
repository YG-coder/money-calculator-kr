"use client";

import { useMemo, useState } from "react";
import { useCalcState } from "@/hooks/useCalcState";
import { readNum } from "@/lib/calcInput";
import { formatKRW, formatUnit } from "@/lib/loan";
import { calcAcquisitionTax, type OwnershipType } from "@/lib/realEstate";
import type { FirstHomeReduction } from "@/lib/policy/acquisitionTax";
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
  { key: "officialPrice", kind: "money" as const, defaultValue: "" },
];

export default function AcquisitionTaxCalc() {
  const { state, setValue } = useCalcState(FIELDS);

  const [ownership, setOwnership] = useState<OwnershipType>("first");
  const [isAdjusted, setIsAdjusted] = useState(false);
  const [isOver85, setIsOver85] = useState(false);
  const [isMetroArea, setIsMetroArea] = useState(true);
  const [isRedevelopmentZone, setIsRedevelopmentZone] = useState(false);
  const [firstHomeReduction, setFirstHomeReduction] =
    useState<FirstHomeReduction>("none");
  const [isTemporaryTwoHouse, setIsTemporaryTwoHouse] = useState(false);

  const result = useMemo(() => {
    const priceMan = readNum(state, "price");
    if (!priceMan || priceMan <= 0) return null;
    return calcAcquisitionTax({
      priceMan,
      ownership,
      isAdjustedArea: isAdjusted,
      isOver85,
      isMetroArea,
      officialPriceMan: readNum(state, "officialPrice") || undefined,
      isRedevelopmentZone,
      firstHomeReduction,
      isTemporaryTwoHouse,
    });
  }, [
    state,
    ownership,
    isAdjusted,
    isOver85,
    isMetroArea,
    isRedevelopmentZone,
    firstHomeReduction,
    isTemporaryTwoHouse,
  ]);

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
        <p className="text-xs leading-relaxed text-slate-400">
          비수도권 시가표준액 2억원 이하 주택은 주택 수 산정에서도 제외됩니다.
          해당 주택은 빼고 세어주세요. 정비구역·소규모주택정비 사업시행구역 주택은
          제외 대상이 아닙니다.
        </p>
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

      {ownership !== "first" && (
        <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
          <p className="text-sm font-bold text-slate-700">비수도권 저가주택 중과 배제</p>
          <div className="flex gap-3">
            {[
              { value: true, label: "수도권" },
              { value: false, label: "비수도권" },
            ].map((opt) => (
              <button
                type="button"
                key={String(opt.value)}
                onClick={() => setIsMetroArea(opt.value)}
                className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold ${
                  isMetroArea === opt.value
                    ? "border-brand-400 bg-brand-50 text-brand-700"
                    : "border-slate-200 text-slate-600"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {!isMetroArea && (
            <>
              <InputField
                label="주택 시가표준액"
                name="officialPrice"
                suffix="만원"
                placeholder="예: 15,000"
                hint="매매가가 아닌 지방세법상 시가표준액입니다"
                value={state.officialPrice?.value ?? ""}
                onChange={(v) => setValue("officialPrice", v)}
              />
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={isRedevelopmentZone}
                  onChange={(e) => setIsRedevelopmentZone(e.target.checked)}
                  className="accent-brand-600"
                />
                정비구역·소규모주택정비 사업시행구역에 해당
              </label>
            </>
          )}
        </div>
      )}

      {ownership === "first" && (
        <div className="space-y-2 rounded-2xl border border-slate-200 p-4">
          <p className="text-sm font-bold text-slate-700">생애최초 취득세 감면</p>
          {[
            { value: "none" as const, label: "적용하지 않음" },
            { value: "standard" as const, label: "200만원 한도 요건 확인" },
            { value: "expanded" as const, label: "300만원 한도 요건 확인" },
          ].map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="radio"
                name="firstHomeReduction"
                checked={firstHomeReduction === opt.value}
                onChange={() => setFirstHomeReduction(opt.value)}
                className="accent-brand-600"
              />
              {opt.label}
            </label>
          ))}
          <p className="text-xs leading-relaxed text-slate-400">
            300만원은 인구감소지역 또는 법정 요건을 갖춘 소형 비아파트 등에 한합니다.
            자격을 자동 판정하지 않으므로 관할 시·군·구청에서 확인하세요.
          </p>
        </div>
      )}

      {ownership === "second" && (
        <label className="flex items-start gap-2 rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={isTemporaryTwoHouse}
            onChange={(e) => setIsTemporaryTwoHouse(e.target.checked)}
            className="mt-0.5 accent-brand-600"
          />
          <span>
            일시적 2주택 요건을 확인했습니다
            <span className="mt-1 block text-xs text-slate-400">
              신규주택 취득 후 3년 내 법정 처분 요건을 충족해야 합니다.
            </span>
          </span>
        </label>
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

          {(result.notes.length > 0 || result.unsupportedReason) && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-800">
              {result.unsupportedReason ?? result.notes.join(" · ")}
            </div>
          )}

          <p className="text-xs text-slate-400 leading-relaxed">
            ※ 2026-08-25 현행 법령 기준의 예상액입니다. 생애최초·일시적 2주택 자격과
            시가표준액은 사용자가 확인한 값으로 계산합니다. 상속·증여·법인 취득과 가산세는
            반영하지 않습니다. 정확한 세금은 관할 시·군·구청 또는 세무사에게 확인하세요.
          </p>
        </div>
      )}
    </div>
  );
}
