"use client";

import { useMemo, useState } from "react";

function formatNumber(value: number) {
    if (!Number.isFinite(value)) return "-";
    return new Intl.NumberFormat("ko-KR").format(Math.round(value));
}

function toNumber(value: string) {
    return Number(value.replaceAll(",", ""));
}

export default function CapitalGainsTaxCalc() {
    const [sellPrice, setSellPrice] = useState("");
    const [buyPrice, setBuyPrice] = useState("");
    const [expense, setExpense] = useState("");
    const [deduction, setDeduction] = useState("2500000");
    const [taxRate, setTaxRate] = useState("22");

    const result = useMemo(() => {
        const sell = toNumber(sellPrice);
        const buy = toNumber(buyPrice);
        const cost = toNumber(expense);
        const basicDeduction = toNumber(deduction);
        const rate = Number(taxRate);

        if (!sell || !buy || rate < 0) return null;

        const gain = sell - buy - cost;
        const taxableIncome = Math.max(gain - basicDeduction, 0);
        const capitalGainsTax = taxableIncome * (rate / 100);
        const localTax = capitalGainsTax * 0.1;
        const totalTax = capitalGainsTax + localTax;
        const afterTaxGain = gain - totalTax;

        return {
            gain,
            taxableIncome,
            capitalGainsTax,
            localTax,
            totalTax,
            afterTaxGain,
        };
    }, [sellPrice, buyPrice, expense, deduction, taxRate]);

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                    <span className="text-sm font-bold text-slate-700">양도가액</span>
                    <input
                        value={sellPrice}
                        onChange={(e) => setSellPrice(e.target.value)}
                        placeholder="예: 800000000"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-400"
                        inputMode="numeric"
                    />
                </label>

                <label className="space-y-2">
                    <span className="text-sm font-bold text-slate-700">취득가액</span>
                    <input
                        value={buyPrice}
                        onChange={(e) => setBuyPrice(e.target.value)}
                        placeholder="예: 500000000"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-400"
                        inputMode="numeric"
                    />
                </label>

                <label className="space-y-2">
                    <span className="text-sm font-bold text-slate-700">필요경비</span>
                    <input
                        value={expense}
                        onChange={(e) => setExpense(e.target.value)}
                        placeholder="예: 10000000"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-400"
                        inputMode="numeric"
                    />
                </label>

                <label className="space-y-2">
                    <span className="text-sm font-bold text-slate-700">기본공제</span>
                    <input
                        value={deduction}
                        onChange={(e) => setDeduction(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-400"
                        inputMode="numeric"
                    />
                </label>

                <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-bold text-slate-700">예상 세율(%)</span>
                    <input
                        value={taxRate}
                        onChange={(e) => setTaxRate(e.target.value)}
                        placeholder="예: 22"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-400"
                        inputMode="decimal"
                    />
                </label>
            </div>

            {result && (
                <div className="rounded-2xl bg-slate-900 p-6 text-white">
                    <p className="mb-4 text-sm font-bold text-slate-300">계산 결과</p>

                    <div className="grid gap-3 md:grid-cols-2">
                        <Result label="양도차익" value={`${formatNumber(result.gain)}원`} />
                        <Result label="과세표준" value={`${formatNumber(result.taxableIncome)}원`} />
                        <Result label="양도소득세" value={`${formatNumber(result.capitalGainsTax)}원`} />
                        <Result label="지방소득세" value={`${formatNumber(result.localTax)}원`} />
                    </div>

                    <div className="mt-5 rounded-xl bg-white/10 p-4">
                        <p className="text-sm text-slate-300">예상 총 세금</p>
                        <p className="mt-1 text-2xl font-black">
                            {formatNumber(result.totalTax)}원
                        </p>
                    </div>

                    <p className="mt-4 text-xs leading-relaxed text-slate-400">
                        실제 양도소득세는 보유기간, 1세대 1주택 비과세, 장기보유특별공제,
                        다주택 중과 여부 등에 따라 달라질 수 있습니다.
                    </p>
                </div>
            )}
        </div>
    );
}

function Result({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl bg-white/10 p-4">
            <p className="text-xs text-slate-300">{label}</p>
            <p className="mt-1 text-lg font-black">{value}</p>
        </div>
    );
}