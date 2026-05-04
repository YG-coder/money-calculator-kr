// src/app/loan-interest-calculator/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { buildMetadata } from "@/lib/metadata";
import CalcShell, { type CalcExample } from "@/components/calculator/CalcShell";
import LoanInterestCalc from "@/components/calculator/LoanInterestCalc";

export const metadata: Metadata = buildMetadata({
  slug: "loan-interest-calculator",
  title: "대출이자 계산기 — 월 이자·총 이자 계산",
  description:
    "대출 금액, 금리, 기간을 입력하면 월 이자와 총 이자를 계산합니다. 만기일시상환 기준으로 빠르게 확인하세요.",
});

const EXAMPLES: CalcExample[] = [
  {
    title: "1억 원 1년 대출",
    desc: "1억원, 연 4.0%, 12개월",
    inputs: [
      { label: "원금", value: "10,000만원" },
      { label: "금리", value: "연 4.0%" },
      { label: "기간", value: "12개월" },
    ],
    results: [
      { label: "월 이자",      value: "333,333원", highlight: true },
      { label: "총 이자",      value: "400만" },
      { label: "만기 총 상환", value: "1억 400만" },
    ],
    note: "만기일시상환 기준으로, 원금은 만기에 한 번에 상환하고 매달 이자만 납부합니다.",
  },
  {
    title: "3억 원 2년 대출",
    desc: "3억원, 연 4.5%, 24개월",
    inputs: [
      { label: "원금", value: "30,000만원" },
      { label: "금리", value: "연 4.5%" },
      { label: "기간", value: "24개월" },
    ],
    results: [
      { label: "월 이자",      value: "1,125,000원", highlight: true },
      { label: "총 이자",      value: "2,700만" },
      { label: "만기 총 상환", value: "3억 2,700만" },
    ],
    note: "금리가 0.5%p만 낮아져도 총 이자 차이가 커질 수 있습니다.",
  },
];

const FAQ = [
  {
    q: "이 계산기는 어떤 상환 방식을 기준으로 하나요?",
    a: "이 계산기는 만기일시상환 기준입니다. 원금은 만기에 한 번에 상환하고, 기간 동안 매달 이자만 납부하는 구조입니다.",
  },
  {
    q: "원리금균등상환과 결과가 왜 다른가요?",
    a: "원리금균등상환은 원금과 이자를 함께 나누어 갚기 때문에 총 이자와 월 납입액이 달라집니다. 그 경우에는 원리금상환 계산기를 이용하세요.",
  },
  {
    q: "금리 차이가 정말 큰 영향을 주나요?",
    a: "네. 대출 금액이 크거나 기간이 길수록 0.5%p 차이도 수백만 원 이상 차이를 만들 수 있습니다.",
  },
];

export default function Page() {
  return (
    <Suspense>
      <CalcShell
        title="대출이자 계산기"
        description="대출 금액과 금리를 입력하면 월 이자와 총 이자를 바로 확인할 수 있습니다."
        icon="🏦"
        slug="loan-interest-calculator"
        calculator={
          <>
            <LoanInterestCalc />
            <div className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
              <p className="mb-2 text-sm font-bold text-slate-800">
                ⚠️ 금리 0.5% 차이로 수백만 원 손해 가능
              </p>
              <p className="mb-3 text-sm text-slate-600">
                같은 대출 금액이라도 금리에 따라 총 이자는 크게 달라집니다. 지금
                조건이 최선인지 꼭 비교해보세요.
              </p>
              <a
                href="/blog/loan-interest-calculation"
                className="block rounded-xl bg-slate-900 py-3 text-center font-bold text-white hover:bg-slate-800"
              >
                👉 대출 이자 계산 방법 완벽 정리
              </a>
            </div>
          </>
        }
        guide={
          <>
            <h2 className="text-xl font-bold text-slate-900">
              대출이자 계산기란?
            </h2>

            <p>
              대출이자 계산기는 대출 금액, 금리, 기간을 입력하면 매달 납부해야 하는
              이자와 전체 이자 비용을 계산하는 도구입니다. 특히 만기일시상환 방식에서는
              매달 이자만 납부하고 원금은 만기에 한 번에 상환하기 때문에,
              전체 이자 부담을 정확히 확인하는 것이 중요합니다.
            </p>

            <h2 className="text-xl font-bold text-slate-900">
              대출이자 계산 공식
            </h2>

            <div className="rounded bg-slate-100 p-4">
              <strong>월 이자 = 대출금액 × 연 금리 ÷ 12</strong>
              <br />
              <strong>총 이자 = 월 이자 × 기간</strong>
            </div>

            <p>
              예를 들어 1억 원을 연 4% 금리로 대출하면 매달 약 33만 원의 이자가 발생합니다.
            </p>

            <h2 className="text-xl font-bold text-slate-900">
              실제 계산 예시
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                <tr className="bg-slate-50">
                  <th className="border border-slate-200 p-3">대출금</th>
                  <th className="border border-slate-200 p-3">금리</th>
                  <th className="border border-slate-200 p-3">월 이자</th>
                  <th className="border border-slate-200 p-3">총 이자(1년)</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                  <td className="border border-slate-200 p-3">1억</td>
                  <td className="border border-slate-200 p-3">4%</td>
                  <td className="border border-slate-200 p-3">33만 원</td>
                  <td className="border border-slate-200 p-3">400만 원</td>
                </tr>
                <tr>
                  <td className="border border-slate-200 p-3">3억</td>
                  <td className="border border-slate-200 p-3">4.5%</td>
                  <td className="border border-slate-200 p-3">112만 원</td>
                  <td className="border border-slate-200 p-3">1,350만 원</td>
                </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              금리 차이의 영향
            </h2>

            <p>
              금리가 0.5%p만 차이 나도 총 이자는 크게 달라질 수 있습니다.
              특히 대출 금액이 크고 기간이 길수록 수백만 원에서 수천만 원까지 차이가 발생할 수 있습니다.
            </p>

            <h2 className="text-xl font-bold text-slate-900">
              계산 시 주의사항
            </h2>

            <ul className="list-disc space-y-2 pl-5">
              <li>이 계산기는 만기일시상환 기준입니다.</li>
              <li>실제 금리는 우대금리, 신용도 등에 따라 달라질 수 있습니다.</li>
              <li>대출 상품에 따라 수수료 및 기타 비용이 발생할 수 있습니다.</li>
              <li>계산 결과는 참고용이며 실제 조건은 금융기관을 통해 확인해야 합니다.</li>
            </ul>

            <div className="rounded-2xl bg-blue-50 p-5 text-blue-900">
              <p className="font-bold">대출이자 절약 팁</p>
              <p className="mt-2">
                금리를 낮추거나 대출 기간을 줄이면 총 이자를 크게 절약할 수 있습니다.
                위 계산기를 통해 다양한 조건을 입력해 보고 가장 유리한 조건을 확인해보세요.
              </p>
            </div>
          </>
        }
        examples={EXAMPLES}
        faq={FAQ}
        relatedCalcs={[
          { label: "원리금상환 계산기", href: "/amortization-calculator",  icon: "📊" },
          { label: "전세대출 계산기",   href: "/jeonse-loan-calculator",   icon: "🏠" },
          { label: "중도상환 계산기",   href: "/prepayment-calculator",    icon: "💸" },
        ]}
        relatedGuides={[
          { label: "대출 이자 계산 방법 완벽 정리",         href: "/blog/loan-interest-calculation" },
          { label: "원리금균등 vs 원금균등 — 같은 대출 다른 총이자", href: "/blog/equal-payment-vs-equal-principal" },
        ]}
      />
    </Suspense>
  );
}
