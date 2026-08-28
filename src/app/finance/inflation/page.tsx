// src/app/finance/inflation/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { buildMetadata, BASE_URL } from "@/lib/metadata";
import CalcShell, { type CalcExample } from "@/components/calculator/CalcShell";
import InflationCalc from "@/components/calculator/InflationCalc";

export const metadata: Metadata = buildMetadata({
  slug: "finance/inflation",
  title: "인플레이션 계산기 — 내 돈의 미래 구매력",
  description:
    "물가상승률이 이어질 때 현재 금액의 미래 구매력과 감소율, 같은 구매력을 유지하는 데 필요한 미래 금액을 계산합니다. 현금·저축의 가치 변화 관점.",
  keywords: [
    "인플레이션계산기",
    "구매력계산",
    "화폐가치하락",
    "물가상승계산기",
  ],
});

const crumbs = [
  { name: "홈", url: BASE_URL },
  { name: "금융 계산기", url: `${BASE_URL}/finance` },
  { name: "인플레이션 계산기", url: `${BASE_URL}/finance/inflation` },
];

const EXAMPLES: CalcExample[] = [
  {
    title: "100만원 · 물가 3% · 10년",
    desc: "현재 100만원, 연 물가상승률 3%가 10년간 이어질 경우",
    inputs: [
      { label: "현재 금액", value: "100만원" },
      { label: "물가 상승률", value: "연 3.0%" },
      { label: "기간", value: "10년" },
    ],
    results: [
      { label: "10년 후 구매력", value: "744,094원", highlight: true },
      { label: "구매력 감소", value: "255,906원 (25.6%)" },
      { label: "동일 구매력 필요 금액", value: "1,343,916원" },
    ],
    note: "물가가 매년 3%씩 오르면, 지금의 100만원은 10년 뒤 약 74만원어치의 물건만 살 수 있게 됩니다. 10년 뒤에도 지금의 100만원과 같은 구매력을 가지려면 약 134만원이 필요합니다.",
  },
  {
    title: "1,000만원 · 물가 2.5% · 20년",
    desc: "현재 1,000만원, 연 물가상승률 2.5%가 20년간 이어질 경우",
    inputs: [
      { label: "현재 금액", value: "1,000만원" },
      { label: "물가 상승률", value: "연 2.5%" },
      { label: "기간", value: "20년" },
    ],
    results: [
      { label: "20년 후 구매력", value: "6,102,709원", highlight: true },
      { label: "구매력 감소", value: "3,897,291원 (39.0%)" },
      { label: "동일 구매력 필요 금액", value: "16,386,164원" },
    ],
    note: "낮아 보이는 2.5%도 20년이 쌓이면 구매력이 약 39% 줄어듭니다. 현금을 그대로 두면 시간이 지날수록 살 수 있는 양이 줄어든다는 뜻입니다.",
  },
];

const FAQ = [
  {
    q: "미래 구매력은 어떻게 계산하나요?",
    a: "현재 금액을 (1 + 물가상승률)의 기간 제곱으로 나눕니다. 예를 들어 물가가 매년 3%씩 10년간 오르면 (1.03)^10 ≈ 1.344로 나누게 되어, 100만원의 미래 구매력은 약 74만원이 됩니다. 이는 그 돈으로 살 수 있는 물건의 양을 현재 가치로 환산한 값입니다.",
  },
  {
    q: "'동일 구매력 필요 금액'은 무슨 뜻인가요?",
    a: "미래에도 지금과 똑같은 양의 물건을 사려면 그때 얼마가 필요한지를 나타냅니다. 현재 금액에 (1 + 물가상승률)의 기간 제곱을 곱해서 구합니다. 물가가 오른 만큼 명목 금액이 더 필요해집니다.",
  },
  {
    q: "이 계산기는 투자 수익을 반영하나요?",
    a: "아니요. 이 계산기는 이자나 투자 수익 없이 '돈을 그대로 두었을 때' 물가 때문에 구매력이 어떻게 변하는지만 보여줍니다. 이자를 함께 고려한 실질 수익률은 실질금리 계산기에서 확인할 수 있습니다.",
  },
];

export default function Page() {
  return (
    <Suspense>
      <CalcShell
        title="인플레이션 계산기"
        description="물가가 오를 때 내 돈의 미래 구매력이 얼마나 줄어드는지 확인하세요."
        icon="💸"
        slug="finance/inflation"
        breadcrumb={crumbs}
        calculator={<InflationCalc />}
        guide={
          <>
            <h2 className="text-xl font-bold text-slate-900">
              인플레이션과 구매력
            </h2>
            <p>
              인플레이션(물가 상승)은 시간이 지나면서 같은 돈으로 살 수 있는
              물건의 양이 줄어드는 현상입니다. 금액 자체는 그대로여도, 물가가
              오르면 그 돈의
              <strong>구매력</strong>은 떨어집니다. 이 계산기는 물가상승률이
              이어질 때 현재 금액의 미래 구매력이 얼마나 되는지를 보여줍니다.
            </p>

            <h2 className="text-xl font-bold text-slate-900">계산 방식</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>미래 구매력 = 현재 금액 ÷ (1 + 물가상승률)^기간</li>
              <li>동일 구매력 필요 금액 = 현재 금액 × (1 + 물가상승률)^기간</li>
              <li>구매력 감소율 = 1 − 1 ÷ (1 + 물가상승률)^기간</li>
            </ul>
            <p>
              앞의 값은 미래의 돈을 현재 가치로 환산한 것이고, 뒤의 값은 미래에
              같은 구매력을 가지려면 필요한 명목 금액입니다.
            </p>

            <h2 className="text-xl font-bold text-slate-900">
              작은 물가상승률도 오래 쌓이면 큽니다
            </h2>
            <p>
              연 2~3%는 작아 보이지만 복리처럼 누적됩니다. 예를 들어 매년 3%면
              10년 뒤 구매력은 약 26% 줄고, 2.5%라도 20년이면 약 39% 줄어듭니다.
              그래서 현금을 오래 그대로 두면 명목 금액은 같아도 실제 가치는 계속
              내려갑니다.
            </p>

            <div className="rounded-2xl bg-blue-50 p-5 text-blue-900">
              <p className="font-bold">함께 확인하면 좋은 것</p>
              <p className="mt-2">
                이자를 함께 고려해 물가 대비 실제 수익이 얼마인지는 실질금리
                계산기에서, 저축이 복리로 얼마나 불어나는지는 복리 계산기에서
                확인할 수 있습니다.
              </p>
            </div>
          </>
        }
        examples={EXAMPLES}
        faq={FAQ}
        relatedCalcs={[
          {
            label: "실질금리 계산기",
            href: "/finance/real-interest-rate",
            icon: "📉",
          },
          { label: "복리 계산기", href: "/finance/compound", icon: "📈" },
          { label: "예금 이자 계산기", href: "/finance/deposit", icon: "🏦" },
          { label: "환전 계산기", href: "/finance/exchange", icon: "💱" },
        ]}
        relatedGuides={[]}
      />
    </Suspense>
  );
}
