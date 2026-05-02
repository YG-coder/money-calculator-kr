"use client";

import { useMemo, useState } from "react";

function formatNumber(value: number) {
    if (!Number.isFinite(value)) return "-";
    return new Intl.NumberFormat("ko-KR").format(Math.round(value));
}

function toNumber(value: string) {
    return Number(value.replaceAll(",", ""));
}

export default function ReconstructionContributionCalc() {
    const [previousAssetValue, setPreviousAssetValue] = useState("");
    const [ratio, setRatio] = useState("100");
    const [futureAssetValue, setFutureAssetValue] = useState("");

    const result = useMemo(() => {
        const previous = toNumber(previousAssetValue);
        const proportionalRatio = Number(ratio);
        const future = toNumber(futureAssetValue);

        if (!previous || !future || proportionalRatio < 0) return null;

        const rightValue = previous * (proportionalRatio / 100);
        const contribution = Math.max(future - rightValue, 0);
        const refund = Math.max(rightValue - future, 0);

        return {
            rightValue,
            contribution,
            refund,
        };
    }, [previousAssetValue, ratio, futureAssetValue]);

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                    <span className="text-sm font-bold text-slate-700">종전자산평가액</span>
                    <input
                        value={previousAssetValue}
                        onChange={(e) => setPreviousAssetValue(e.target.value)}
                        placeholder="예: 600000000"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-400"
                        inputMode="numeric"
                    />
                </label>

                <label className="space-y-2">
                    <span className="text-sm font-bold text-slate-700">비례율(%)</span>
                    <input
                        value={ratio}
                        onChange={(e) => setRatio(e.target.value)}
                        placeholder="예: 100"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-400"
                        inputMode="decimal"
                    />
                </label>

                <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-bold text-slate-700">종후자산가액</span>
                    <input
                        value={futureAssetValue}
                        onChange={(e) => setFutureAssetValue(e.target.value)}
                        placeholder="예: 900000000"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-400"
                        inputMode="numeric"
                    />
                </label>
            </div>

            {result && (
                <div className="rounded-2xl bg-slate-900 p-6 text-white">
                    <p className="mb-4 text-sm font-bold text-slate-300">계산 결과</p>

                    <div className="grid gap-3 md:grid-cols-3">
                        <Result label="권리가액" value={`${formatNumber(result.rightValue)}원`} />
                        <Result label="예상 분담금" value={`${formatNumber(result.contribution)}원`} />
                        <Result label="예상 환급금" value={`${formatNumber(result.refund)}원`} />
                    </div>

                    <p className="mt-4 text-xs leading-relaxed text-slate-400">
                        예상 분담금은 종후자산가액에서 권리가액을 뺀 단순 추정값입니다.
                        실제 금액은 공사비, 일반분양가, 사업비, 조합원 분양가 등에 따라 달라질 수 있습니다.
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