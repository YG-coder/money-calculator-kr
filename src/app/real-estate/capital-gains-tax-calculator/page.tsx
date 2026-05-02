import type { Metadata } from "next";
import { Suspense } from "react";
import { buildMetadata, BASE_URL } from "@/lib/metadata";
import CalcShell, { type CalcExample } from "@/components/calculator/CalcShell";
import CapitalGainsTaxCalc from "@/components/calculator/CapitalGainsTaxCalc";

export const metadata: Metadata = buildMetadata({
    slug: "real-estate/capital-gains-tax-calculator",
    title: "양도소득세 계산기 — 부동산 매도 세금 계산",
    description:
        "취득가액, 양도가액, 필요경비를 입력하면 예상 양도소득세를 계산합니다.",
});

const EXAMPLES: CalcExample[] = [
    {
        title: "5억에 사서 8억에 매도",
        desc: "취득 5억, 매도 8억",
        inputs: [
            { label: "취득가", value: "5억원" },
            { label: "양도가", value: "8억원" },
        ],
        results: [
            { label: "양도차익", value: "3억원", highlight: true },
        ],
        note: "세율 및 공제는 조건에 따라 달라집니다.",
    },
];

const FAQ = [
    {
        q: "양도소득세는 언제 발생하나요?",
        a: "부동산을 매도하여 차익이 발생할 경우 과세됩니다.",
    },
    {
        q: "세율은 고정인가요?",
        a: "보유기간, 주택 수, 지역에 따라 달라집니다.",
    },
];

export default function CapitalGainsTaxPage() {
    const crumbs = [
        { name: "홈", url: BASE_URL },
        { name: "부동산 계산기", url: `${BASE_URL}/real-estate` },
        { name: "양도소득세 계산기", url: `${BASE_URL}/real-estate/capital-gains-tax-calculator` },
    ];

    return (
        <Suspense>
            <CalcShell
                title="양도소득세 계산기"
                description="부동산 매도 시 발생하는 양도소득세를 간단히 계산합니다."
                icon="📐"
                slug="real-estate/capital-gains-tax-calculator"
                breadcrumb={crumbs}
                calculator={<CapitalGainsTaxCalc />}
                guide={
                    <>
                        <h2 className="text-xl font-bold">양도소득세란?</h2>
                        <p>
                            양도소득세는 부동산을 팔아서 발생한 차익에 대해 부과되는 세금입니다.
                        </p>

                        <h2 className="text-xl font-bold">기본 계산 구조</h2>
                        <div className="bg-slate-100 p-4 rounded">
                            양도차익 = 양도가액 - 취득가액 - 필요경비
                        </div>

                        <h2 className="text-xl font-bold">주의사항</h2>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>보유기간에 따라 세율이 달라집니다.</li>
                            <li>1주택 비과세 조건이 존재합니다.</li>
                            <li>다주택자는 중과세가 적용될 수 있습니다.</li>
                        </ul>
                    </>
                }
                examples={EXAMPLES}
                faq={FAQ}
                relatedCalcs={[
                    { label: "취득세 계산기", href: "/real-estate/acquisition-tax-calculator", icon: "🏠" },
                    { label: "전세 vs 월세", href: "/real-estate/jeonse-vs-wolse-calculator", icon: "⚖️" },
                ]}
                relatedGuides={[
                    { label: "양도세 절세 전략", href: "/blog/capital-gains-tax" },
                ]}
            />
        </Suspense>
    );
}