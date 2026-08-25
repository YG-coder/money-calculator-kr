// src/app/real-estate/property-yield-calculator/page.tsx

import type { Metadata } from "next";
import { Suspense } from "react";
import { buildMetadata, BASE_URL } from "@/lib/metadata";
import CalcShell, { type CalcExample } from "@/components/calculator/CalcShell";
import PropertyYieldCalc from "@/components/calculator/PropertyYieldCalc";

export const metadata: Metadata = buildMetadata({
    slug: "real-estate/property-yield-calculator",
    title: "부동산 수익률 계산기 — 월세 수익률·대출 이자·순수익 계산",
    description:
        "매입가, 보증금, 월세, 대출금, 금리를 입력하면 월 순수익, 연 순수익, 자기자본 수익률, 매입가 기준 수익률을 계산합니다.",
    keywords: [
        "부동산 수익률 계산기",
        "월세 수익률 계산기",
        "임대수익률 계산기",
        "부동산 투자 수익률",
        "갭투자 수익률",
        "월세 순수익 계산",
    ],
});

const EXAMPLES: CalcExample[] = [
    {
        title: "월세 투자 수익률 계산",
        desc: "매입가 3억 원, 보증금 5천만 원, 월세 100만 원인 경우",
        inputs: [
            { label: "매입가", value: "30,000만원" },
            { label: "보증금", value: "5,000만원" },
            { label: "월세", value: "100만원" },
            { label: "월 비용", value: "10만원" },
        ],
        results: [
            { label: "월 순수익", value: "90만원", highlight: true },
            { label: "연 순수익", value: "1,080만원" },
            { label: "매입가 기준 수익률", value: "4.00%" },
        ],
    },
    {
        title: "대출 포함 수익률 계산",
        desc: "대출 1억 5천만 원, 연 금리 4.5%를 반영한 경우",
        inputs: [
            { label: "매입가", value: "30,000만원" },
            { label: "보증금", value: "5,000만원" },
            { label: "월세", value: "100만원" },
            { label: "월 비용", value: "10만원" },
            { label: "대출금", value: "15,000만원" },
            { label: "연 금리", value: "4.5%" },
        ],
        results: [
            { label: "월 대출 이자", value: "약 56만원" },
            { label: "월 순수익", value: "약 33.8만원", highlight: true },
            { label: "자기자본 수익률", value: "약 4.05%" },
        ],
    },
];

const GUIDE = (
    <section className="space-y-8">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">
                부동산 수익률 계산기란?
            </h2>
            <p className="mt-3 text-slate-600 leading-7">
                부동산 수익률 계산기는 매입가, 임대보증금, 월세, 월 관리·기타비용,
                대출 조건을 입력하면 <strong>매입가 기준 수익률</strong>과{" "}
                <strong>자기자본 수익률</strong>을 함께 계산해 주는 도구입니다. 같은
                매물이라도 대출을 얼마나 쓰느냐에 따라 대출이자를 반영한 자기자본
                수익률이 크게 달라지므로, 두 수익률을 나눠 보는 것이 임대용 부동산
                판단의 출발점입니다. 이 계산기는 취득세·중개보수 같은 취득비용은
                반영하지 않습니다.
            </p>
        </div>

        <div>
            <h2 className="text-2xl font-bold tracking-tight">
                수익률 계산 공식
            </h2>
            <p className="mt-3 text-slate-600 leading-7">
                매입가 기준 수익률은 자금조달과 무관하게 매물 자체의 임대수익 수준을
                보는 지표로, 연 임대수익(월세 × 12)을 매입가로 나눠 계산합니다.
                자기자본 수익률은 실제 투입한 현금 대비 수익률로, 월세에서 월
                대출이자와 월 관리·기타비용을 뺀 순수익을 연으로 환산해 실투자금으로
                나눕니다. 실투자금은 매입가에서 임대보증금과 대출금을 뺀 금액이며, 월
                대출이자는 대출금 × 연 금리 ÷ 12(단리)로 계산합니다.
            </p>
            <p className="mt-2 font-mono text-sm text-slate-500 leading-6">
                매입가 기준 수익률 = (월세 × 12) ÷ 매입가 × 100
                <br />
                자기자본 수익률 = (월 순수익 × 12) ÷ 실투자금 × 100
                <br />
                월 순수익 = 월세 − 월 대출이자 − 월 관리·기타비용
                <br />
                실투자금 = 매입가 − 임대보증금 − 대출금
            </p>
        </div>

        <div>
            <h2 className="text-2xl font-bold tracking-tight">
                매입가 기준 수익률 vs 자기자본 수익률
            </h2>
            <p className="mt-3 text-slate-600 leading-7">
                <strong>매입가 기준 수익률</strong>은 부동산 전체 가격 대비 연
                임대수익을 계산한 값으로, 레버리지 효과를 배제한 자산 자체의 수익성을
                보여줍니다. <strong>자기자본 수익률</strong>은 실제로 투입한
                현금(매입가 − 보증금 − 대출금) 대비 순수익을 계산한 값입니다. 핵심은
                레버리지 효과입니다. 대출금리가 대출을 쓰지 않았을 때의 자기자본
                수익률보다 낮으면 대출을 늘릴수록 자기자본 수익률이 올라가고, 높으면
                오히려 낮아집니다. 월 관리·기타비용을 입력하면 손익분기 대출금리도
                그만큼 낮아지며, 공실과 계산기에 포함되지 않는 비용까지 고려할 때는 더
                보수적으로 판단해야 합니다.
            </p>
        </div>

        <div>
            <h2 className="text-2xl font-bold tracking-tight">
                결과를 해석할 때 주의할 점
            </h2>
            <p className="mt-3 text-slate-600 leading-7">
                이 계산기가 반영하는 것은 대출이자와 월 관리·기타비용입니다. 반대로
                공실, 취득세·재산세·종합부동산세·양도소득세, 중개수수료, 수선비는
                반영하지 않으므로 실제 순수익률은 이보다 낮은 것이 일반적입니다. 예를
                들어 연 1개월가량(약 8%) 공실만 잡아도 연 임대수익이 눈에 띄게 줄어
                자기자본 수익률이 함께 내려갑니다. 또한 이 계산기는 임대수익률만
                다루며, 매각 시 시세차익이나 양도소득세는 별도로 따져야 합니다. 대출
                비중이 높을수록 금리 상승 시 월 순수익이 빠르게 줄어드니 금리 민감도도
                함께 확인하세요.
            </p>
        </div>

        <div>
            <h2 className="text-2xl font-bold tracking-tight">주의사항</h2>
            <p className="mt-3 text-slate-600 leading-7">
                매입가 기준 수익률은 취득비용을 제외한 매입가 기준이라 매물을 빠르게
                비교할 때 적합하고, 실제 투자 판단은 자기자본 수익률과 함께 봐야
                합니다. 이 계산기는 취득세·중개보수를 반영하지 않으므로(실투자금 계산기에서 확인하세요) 실제 초기
                투자금은 계산된 실투자금보다 큽니다. 입력한 월세·보증금은 시세
                가정치이므로 인근 실거래 임대료를 확인하고, 임대보증금은 반환해야 할
                채무라는 점도 함께 고려하세요. 지역별 임대 시세·수익률 동향은
                한국부동산원(부동산테크·R-ONE) 통계를 참고하면 정확합니다.
            </p>
        </div>
    </section>
);

const FAQ = [
    {
        q: "매입가 기준 수익률과 자기자본 수익률, 뭘 봐야 하나요?",
        a: "매물끼리 빠르게 비교할 땐 매입가 기준 수익률(월세 × 12 ÷ 매입가), 대출을 낀 실제 투자 결정을 내릴 땐 자기자본 수익률을 봅니다. 둘을 함께 보면 레버리지가 도움이 되는지 부담이 되는지 판단할 수 있습니다.",
    },
    {
        q: "대출을 많이 받을수록 수익률이 오르나요?",
        a: "대출금리가 대출을 쓰지 않았을 때의 자기자본 수익률보다 낮을 때만 그렇습니다. 이 조건이면 대출을 늘릴수록 자기자본 수익률이 올라가지만, 공실·운영비·금리 상승까지 반영하면 결과가 달라질 수 있습니다. 레버리지는 수익과 위험을 동시에 키웁니다.",
    },
    {
        q: "대출금과 보증금 합이 매입가보다 크면 어떻게 되나요?",
        a: "이 경우 실투자금(매입가 − 보증금 − 대출금)이 0 이하가 되어 자기자본 수익률을 계산할 수 없습니다. 계산기는 이때 자기자본 수익률을 0으로 표시하며, 대출·보증금 조건을 조정해 실투자금이 0보다 크도록 입력해야 합니다.",
    },
    {
        q: "관리비·수선비 같은 비용도 반영되나요?",
        a: "월 관리비나 월평균 기타비용은 입력한 금액만큼 차감됩니다. 수선비도 월평균 예상액으로 환산해 직접 입력할 수 있지만, 계산기가 별도로 추정해 주지는 않습니다. 공실과 각종 세금·중개수수료도 자동 반영되지 않습니다.",
    },
    {
        q: "공실률은 어떻게 반영하나요?",
        a: "이 계산기는 만실 기준입니다. 보수적으로 보려면 예상 공실 개월 수만큼 월세를 줄여서 다시 계산하세요(예: 연 1개월 공실 → 월세 × 11 ÷ 12).",
    },
    {
        q: "계산 결과가 실제 수익률과 같나요?",
        a: "참고용 예상치입니다. 공실·보유세·수선비 등 실비용이 빠져 있어, 실제 순수익률은 이보다 낮은 것이 일반적입니다.",
    },
];

export default function Page() {
    return (
        <Suspense>
            <CalcShell
                title="부동산 수익률 계산기"
                description="매입가, 보증금, 월세, 대출금, 금리를 입력하면 월 순수익과 연 수익률을 간편하게 계산할 수 있습니다."
                icon="🏠"
                slug="real-estate/property-yield-calculator"
                calculator={<PropertyYieldCalc />}
                guide={GUIDE}
                faq={FAQ}
                examples={EXAMPLES}
                breadcrumb={[
                    { name: "홈", url: BASE_URL },
                    { name: "부동산 계산기", url: `${BASE_URL}/real-estate` },
                    {
                        name: "부동산 수익률 계산기",
                        url: `${BASE_URL}/real-estate/property-yield-calculator`,
                    },
                ]}
                relatedCalcs={[
                    {
                        label: "취득세 계산기",
                        href: "/real-estate/acquisition-tax-calculator",
                        icon: "🏠",
                    },
                    {
                        label: "월세 vs 전세 계산기",
                        href: "/real-estate/jeonse-vs-wolse-calculator",
                        icon: "⚖️",
                    },
                    {
                        label: "대출이자 계산기",
                        href: "/loan-interest-calculator",
                        icon: "🏦",
                    },
                ]}
                relatedGuides={[
                    {
                        label: "부동산 수익률 계산 방법 완벽 정리",
                        href: "/blog/property-yield-guide",
                    },
                    {
                        label: "취득세 완벽 가이드",
                        href: "/blog/acquisition-tax-guide",
                    },
                ]}
            />
        </Suspense>
    );
}