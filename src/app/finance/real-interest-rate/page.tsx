// src/app/finance/real-interest-rate/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { buildMetadata, BASE_URL } from "@/lib/metadata";
import CalcShell, { type CalcExample } from "@/components/calculator/CalcShell";
import RealInterestCalc from "@/components/calculator/RealInterestCalc";

export const metadata: Metadata = buildMetadata({
  slug: "finance/real-interest-rate",
  title: "실질금리 계산기 — 물가 반영 후 진짜 이자",
  description:
    "예금 금리에서 물가상승률을 반영한 실질금리를 계산합니다. 피셔 정확식과 근사식을 함께 보여주고, 예치금액을 넣으면 실질 구매력 증감도 확인합니다.",
  keywords: ["실질금리계산기", "실질금리", "피셔방정식", "물가반영금리"],
});

const crumbs = [
  { name: "홈", url: BASE_URL },
  { name: "금융 계산기", url: `${BASE_URL}/finance` },
  { name: "실질금리 계산기", url: `${BASE_URL}/finance/real-interest-rate` },
];

const EXAMPLES: CalcExample[] = [
  {
    title: "예금 5% · 물가 3%",
    desc: "명목 예금 금리 5%, 물가상승률 3%, 예치금액 1,000만원",
    inputs: [
      { label: "예금 금리(명목)", value: "5.0%" },
      { label: "물가 상승률", value: "3.0%" },
      { label: "예치금액", value: "1,000만원" },
    ],
    results: [
      { label: "실질금리(정확식)", value: "1.94%", highlight: true },
      { label: "근사식(명목−물가)", value: "2.00%" },
      { label: "명목 이자(1년·세전)", value: "500,000원" },
      { label: "실질 가치 증가(1년)", value: "194,175원" },
    ],
    note: "이자로 5%를 받아도 물가가 3% 오르면 실제 구매력은 약 1.94%만 늘어납니다. 간단히 빼는 근사식은 2.00%로 나오지만, 물가를 반영한 정확식은 그보다 조금 낮습니다. 명목 이자는 세전 50만원이지만 실질 가치 증가는 약 19만원입니다.",
  },
  {
    title: "예금 3% · 물가 4% (구매력 감소)",
    desc: "명목 예금 금리 3%, 물가상승률 4%, 예치금액 1,000만원",
    inputs: [
      { label: "예금 금리(명목)", value: "3.0%" },
      { label: "물가 상승률", value: "4.0%" },
      { label: "예치금액", value: "1,000만원" },
    ],
    results: [
      { label: "실질금리(정확식)", value: "-0.96%", highlight: true },
      { label: "근사식(명목−물가)", value: "-1.00%" },
      { label: "명목 이자(1년·세전)", value: "300,000원" },
      { label: "실질 가치 증감(1년)", value: "-96,154원" },
    ],
    note: "물가상승률이 예금 금리보다 높으면 이자를 받아도 실질 구매력은 오히려 줄어듭니다. 명목 이자는 세전 30만원이지만, 물가를 반영하면 구매력은 약 9.6만원어치 감소한 셈입니다.",
  },
];

const FAQ = [
  {
    q: "실질금리는 왜 명목금리에서 물가를 빼는 것과 다른가요?",
    a: "간단히 명목금리에서 물가상승률을 빼는 것은 근사식입니다. 정확히는 피셔 방정식 (1+명목)÷(1+물가)−1로 계산해야 하며, 물가상승률이 높을수록 근사식과 정확식의 차이가 커집니다. 예를 들어 명목 5%·물가 3%면 근사식은 2.00%지만 정확식은 약 1.94%입니다.",
  },
  {
    q: "실질금리가 마이너스면 무슨 뜻인가요?",
    a: "물가상승률이 예금 금리보다 높다는 뜻입니다. 이 경우 이자를 받더라도 돈으로 살 수 있는 물건의 양, 즉 구매력이 오히려 줄어듭니다. 명목상 잔액은 늘지만 실질 가치는 감소하는 상태입니다.",
  },
  {
    q: "이 계산기는 투자 수익률을 계산하나요?",
    a: "아니요. 이 계산기는 예금·현금의 구매력이 물가를 반영했을 때 실제로 얼마나 늘거나 주는지를 보여줍니다. 투자 상품의 기대수익률이나 성과를 다루지 않습니다.",
  },
];

export default function Page() {
  return (
    <Suspense>
      <CalcShell
        title="실질금리 계산기"
        description="물가상승률을 반영한 실질금리로, 이자의 진짜 구매력 변화를 확인하세요."
        icon="📉"
        slug="finance/real-interest-rate"
        breadcrumb={crumbs}
        calculator={<RealInterestCalc />}
        guide={
          <>
            <h2 className="text-xl font-bold text-slate-900">실질금리란?</h2>
            <p>
              <strong>명목금리</strong>는 통장에 표시되는 금리이고,
              <strong>실질금리</strong>는 거기서 물가상승률을 반영해 &lsquo;돈의
              구매력이 실제로 얼마나 늘었는가&rsquo;를 나타낸 금리입니다. 이자를
              5% 받아도 물가가 5% 오르면, 살 수 있는 물건의 양은 그대로이므로
              실질 금리는 0에 가깝습니다.
            </p>

            <h2 className="text-xl font-bold text-slate-900">
              정확식(피셔)과 근사식
            </h2>
            <p>
              흔히 명목금리에서 물가상승률을 빼서 실질금리를 어림하지만, 이는
              근사식입니다. 정확한 값은 피셔 방정식으로 계산합니다.
            </p>

            <ul className="list-disc space-y-2 pl-5">
              <li>정확식(피셔) = (1 + 명목금리) ÷ (1 + 물가상승률) − 1</li>
              <li>근사식 = 명목금리 − 물가상승률</li>
              <li>물가상승률이 높을수록 근사식이 실질금리를 크게 보이게 함</li>
            </ul>

            <p>
              예를 들어 명목 5%·물가 3%면 근사식은 2.00%, 정확식은 약
              1.94%입니다. 이 계산기는 정확식을 메인으로 보여주고 근사식을 함께
              표시합니다.
            </p>

            <h2 className="text-xl font-bold text-slate-900">
              구매력 관점으로 읽기
            </h2>
            <p>
              실질금리가 양수면 이자가 물가를 앞질러 구매력이 늘어난 것이고,
              음수면 이자를 받아도 물가를 따라가지 못해 구매력이 줄어든
              것입니다. 예치금액을 입력하면 세전 명목 이자와, 물가를 반영한 실질
              가치 증감을 1년 기준 금액으로 비교해 볼 수 있습니다.
            </p>

            <div className="rounded-2xl bg-blue-50 p-5 text-blue-900">
              <p className="font-bold">함께 확인하면 좋은 것</p>
              <p className="mt-2">
                시간이 지날수록 물가가 돈의 가치를 얼마나 깎는지는 인플레이션
                계산기에서, 예금 자체의 이자·만기 수령액은 예금 이자 계산기에서
                확인할 수 있습니다.
              </p>
            </div>
          </>
        }
        examples={EXAMPLES}
        faq={FAQ}
        relatedCalcs={[
          { label: "예금 이자 계산기", href: "/finance/deposit", icon: "🏦" },
          {
            label: "예금 vs 적금 계산기",
            href: "/finance/deposit-vs-savings",
            icon: "⚖️",
          },
          {
            label: "CMA vs 예금 계산기",
            href: "/finance/cma-vs-deposit",
            icon: "⚖️",
          },
          { label: "환전 계산기", href: "/finance/exchange", icon: "💱" },
        ]}
        relatedGuides={[]}
      />
    </Suspense>
  );
}
