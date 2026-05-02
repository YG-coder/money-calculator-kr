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
                        <h2 className="text-xl font-bold text-slate-900">
                            양도소득세 계산기란?
                        </h2>

                        <p>
                            양도소득세 계산기는 부동산을 매도할 때 발생할 수 있는 예상 세금을 계산하는 도구입니다.
                            양도가액에서 취득가액과 필요경비를 뺀 양도차익을 기준으로 과세표준과 예상 세액을 확인할 수 있습니다.
                            실제 양도세는 보유기간, 주택 수, 비과세 요건, 장기보유특별공제 등에 따라 크게 달라질 수 있습니다.
                        </p>

                        <h2 className="text-xl font-bold text-slate-900">
                            기본 계산 구조
                        </h2>

                        <div className="rounded bg-slate-100 p-4">
                            <strong>양도차익 = 양도가액 - 취득가액 - 필요경비</strong>
                            <br />
                            <strong>과세표준 = 양도차익 - 기본공제 - 장기보유특별공제</strong>
                            <br />
                            <strong>예상 세금 = 과세표준 × 세율</strong>
                        </div>

                        <h2 className="text-xl font-bold text-slate-900">
                            양도소득세 계산 시 확인할 항목
                        </h2>

                        <ul className="list-disc space-y-2 pl-5">
                            <li>부동산을 얼마에 취득했고 얼마에 양도했는지</li>
                            <li>취득세, 중개수수료, 법무사 비용 등 필요경비가 얼마인지</li>
                            <li>보유기간이 1년 미만, 2년 미만, 2년 이상인지</li>
                            <li>1세대 1주택 비과세 요건을 충족하는지</li>
                            <li>조정대상지역, 다주택, 일시적 2주택 등 특수 조건이 있는지</li>
                        </ul>

                        <h2 className="text-xl font-bold text-slate-900">
                            보유기간별 세율 예시
                        </h2>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                <tr className="bg-slate-50">
                                    <th className="border border-slate-200 p-3">구분</th>
                                    <th className="border border-slate-200 p-3">과세 특징</th>
                                    <th className="border border-slate-200 p-3">주의사항</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td className="border border-slate-200 p-3">단기 보유</td>
                                    <td className="border border-slate-200 p-3">높은 세율이 적용될 수 있음</td>
                                    <td className="border border-slate-200 p-3">매도 시점 확인 필요</td>
                                </tr>
                                <tr>
                                    <td className="border border-slate-200 p-3">2년 이상 보유</td>
                                    <td className="border border-slate-200 p-3">일반 누진세율 적용 가능</td>
                                    <td className="border border-slate-200 p-3">비과세 요건 검토 필요</td>
                                </tr>
                                <tr>
                                    <td className="border border-slate-200 p-3">1세대 1주택</td>
                                    <td className="border border-slate-200 p-3">요건 충족 시 비과세 가능</td>
                                    <td className="border border-slate-200 p-3">고가주택은 일부 과세 가능</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>

                        <h2 className="text-xl font-bold text-slate-900">
                            실제 계산 예시
                        </h2>

                        <p>
                            예를 들어 5억 원에 취득한 주택을 8억 원에 매도하고 필요경비가 1천만 원이라면
                            단순 양도차익은 2억 9천만 원입니다. 여기에 기본공제와 장기보유특별공제,
                            보유기간별 세율을 반영하면 실제 납부할 양도소득세가 결정됩니다.
                        </p>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                <tr className="bg-slate-50">
                                    <th className="border border-slate-200 p-3">항목</th>
                                    <th className="border border-slate-200 p-3">예시 금액</th>
                                    <th className="border border-slate-200 p-3">설명</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td className="border border-slate-200 p-3">양도가액</td>
                                    <td className="border border-slate-200 p-3">8억 원</td>
                                    <td className="border border-slate-200 p-3">매도 금액</td>
                                </tr>
                                <tr>
                                    <td className="border border-slate-200 p-3">취득가액</td>
                                    <td className="border border-slate-200 p-3">5억 원</td>
                                    <td className="border border-slate-200 p-3">매수 금액</td>
                                </tr>
                                <tr>
                                    <td className="border border-slate-200 p-3">필요경비</td>
                                    <td className="border border-slate-200 p-3">1천만 원</td>
                                    <td className="border border-slate-200 p-3">취득세, 중개수수료 등</td>
                                </tr>
                                <tr>
                                    <td className="border border-slate-200 p-3">양도차익</td>
                                    <td className="border border-slate-200 p-3">2억 9천만 원</td>
                                    <td className="border border-slate-200 p-3">세금 계산의 기초</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>

                        <h2 className="text-xl font-bold text-slate-900">
                            1세대 1주택 비과세 확인
                        </h2>

                        <p>
                            주택 양도소득세에서 가장 중요한 부분은 1세대 1주택 비과세 여부입니다.
                            일반적으로 일정 기간 이상 보유하고 거주 요건을 충족하면 비과세가 가능할 수 있지만,
                            조정대상지역 여부, 취득 시점, 고가주택 여부에 따라 결과가 달라질 수 있습니다.
                        </p>

                        <h2 className="text-xl font-bold text-slate-900">
                            주의사항
                        </h2>

                        <ul className="list-disc space-y-2 pl-5">
                            <li>실제 세율과 공제는 세법 개정에 따라 달라질 수 있습니다.</li>
                            <li>고가주택, 다주택자, 조정대상지역 여부에 따라 계산 방식이 달라질 수 있습니다.</li>
                            <li>장기보유특별공제는 보유기간과 거주기간에 따라 적용률이 달라질 수 있습니다.</li>
                            <li>계산 결과는 참고용이며 실제 신고 전 세무 전문가 또는 국세청 자료 확인이 필요합니다.</li>
                        </ul>

                        <div className="rounded-2xl bg-blue-50 p-5 text-blue-900">
                            <p className="font-bold">양도세 계산 팁</p>
                            <p className="mt-2">
                                부동산을 매도하기 전에는 예상 양도차익뿐 아니라 보유기간, 비과세 요건,
                                필요경비 인정 여부를 함께 확인해야 합니다. 위 계산기로 1차 금액을 확인한 뒤,
                                실제 신고 전에는 세무 전문가에게 최종 검토를 받는 것이 안전합니다.
                            </p>
                        </div>
                    </>
                }
                examples={EXAMPLES}
                faq={FAQ}
                relatedCalcs={[
                    { label: "취득세 계산기", href: "/real-estate/acquisition-tax-calculator", icon: "🏠" },
                    { label: "전세 vs 월세 계산기", href: "/real-estate/jeonse-vs-wolse-calculator", icon: "⚖️" },
                    { label: "재건축 분담금 계산기", href: "/real-estate/reconstruction-contribution-calculator", icon: "🏗️" },
                ]}
                relatedGuides={[
                    { label: "양도세 절세 전략", href: "/blog/capital-gains-tax" },
                ]}
            />
        </Suspense>
    );
}