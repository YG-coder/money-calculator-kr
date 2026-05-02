// src/app/prepayment-calculator/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { buildMetadata } from "@/lib/metadata";
import CalcShell, { type CalcExample } from "@/components/calculator/CalcShell";
import PrepaymentCalc from "@/components/calculator/PrepaymentCalc";

export const metadata: Metadata = buildMetadata({
  slug: "prepayment-calculator",
  title: "중도상환 계산기 — 수수료·실질 이득 계산",
  description:
    "잔여 원금, 중도상환 금액, 금리, 잔여 기간을 입력하면 중도상환 수수료와 실질 이득을 계산합니다.",
});

const EXAMPLES: CalcExample[] = [
  {
    title: "잔여 원금 2억, 일부 중도상환",
    desc: "잔여 원금 2억, 중도상환 5천만, 연 4.5%, 잔여 30개월",
    inputs: [
      { label: "잔여 원금", value: "20,000만원" },
      { label: "상환 금액", value: "5,000만원" },
      { label: "금리",      value: "연 4.5%" },
      { label: "잔여 기간", value: "30개월" },
      { label: "수수료율",  value: "1.2%" },
    ],
    results: [
      { label: "수수료",    value: "60만" },
      { label: "실질 이득", value: "계산값 기준 확인", highlight: true },
    ],
    note: "원리금균등상환 기준의 참고용 계산입니다.",
  },
  {
    title: "수수료 면제 시점 직전 비교",
    desc: "중도상환 수수료가 남아 있다면 절약 이자와 반드시 비교해야 합니다.",
    inputs: [{ label: "포인트", value: "수수료 > 절약 이자 여부 확인" }],
    results: [
      { label: "판단 기준", value: "실질 이득이 +인지 확인", highlight: true },
    ],
    note: "중도상환은 무조건 빠를수록 좋은 것이 아닙니다.",
  },
];

const FAQ = [
  {
    q: "중도상환은 무조건 이득인가요?",
    a: "아니요. 절약되는 이자보다 수수료가 크면 손해일 수 있습니다.",
  },
  {
    q: "중도상환 수수료는 언제까지 발생하나요?",
    a: "일반적으로 대출 실행 후 일정 기간 동안 발생하며, 상품마다 다릅니다. 보통 3년 이내 조건이 많습니다.",
  },
  {
    q: "이 계산기는 어떤 상환 방식을 기준으로 하나요?",
    a: "원리금균등상환 기준의 참고용 계산입니다. 실제 계약 조건과 상환 방식에 따라 결과가 달라질 수 있습니다.",
  },
];

export default function PrepaymentCalculatorPage() {
  return (
    <Suspense>
      <CalcShell
        title="중도상환 계산기"
        description="중도상환 수수료와 실질 이득을 확인해 지금 갚는 것이 유리한지 판단하세요."
        icon="💸"
        slug="prepayment-calculator"
        calculator={
          <>
            <PrepaymentCalc />
            <div className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
              <p className="mb-2 text-sm font-bold text-slate-800">
                ⚠️ 지금 갚으면 오히려 손해일 수 있습니다
              </p>
              <p className="mb-3 text-sm text-slate-600">
                중도상환 수수료와 절약 이자를 비교하지 않으면 손해를 볼 수
                있습니다.
              </p>
              <a
                href="/blog/prepayment-fee-timing"
                className="block rounded-xl bg-slate-900 py-3 text-center font-bold text-white hover:bg-slate-800"
              >
                👉 중도상환 타이밍 확인
              </a>
            </div>
          </>
        }
        guide={
          <>
            <h2 className="text-xl font-bold text-slate-900">
              중도상환 계산기란?
            </h2>

            <p>
              중도상환 계산기는 대출 만기 전에 일부 또는 전액을 미리 갚을 때 발생할 수 있는
              중도상환수수료와 이자 절감 효과를 비교하는 계산기입니다. 대출을 빨리 갚으면
              이자는 줄어들 수 있지만, 수수료가 발생하면 실제 이득이 예상보다 작아질 수 있습니다.
            </p>

            <h2 className="text-xl font-bold text-slate-900">
              중도상환 판단 기준
            </h2>

            <div className="rounded bg-slate-100 p-4">
              <strong>실질 이득 = 절약되는 이자 - 중도상환수수료</strong>
            </div>

            <p>
              계산 결과 실질 이득이 플러스라면 중도상환이 유리할 가능성이 높고,
              마이너스라면 수수료 부담 때문에 당장 상환하지 않는 편이 나을 수 있습니다.
            </p>

            <h2 className="text-xl font-bold text-slate-900">
              중도상환수수료 계산 방식
            </h2>

            <p>
              중도상환수수료는 보통 중도상환금액, 수수료율, 대출 경과 기간을 기준으로 계산됩니다.
              금융기관마다 방식은 다르지만 일반적으로 대출 실행 초기일수록 수수료 부담이 크고,
              시간이 지날수록 줄어드는 구조가 많습니다.
            </p>

            <div className="rounded bg-slate-100 p-4">
              <strong>수수료 = 중도상환금액 × 수수료율 × 잔여 수수료 기간 비율</strong>
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              실제 계산 예시
            </h2>

            <p>
              예를 들어 잔여 원금이 2억 원이고 이 중 5천만 원을 중도상환한다고 가정해보겠습니다.
              중도상환수수료율이 1.2%라면 단순 계산 수수료는 약 60만 원입니다.
              하지만 중도상환으로 앞으로 줄어드는 이자가 150만 원이라면 실질 이득은 약 90만 원입니다.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                <tr className="bg-slate-50">
                  <th className="border border-slate-200 p-3">구분</th>
                  <th className="border border-slate-200 p-3">금액</th>
                  <th className="border border-slate-200 p-3">의미</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                  <td className="border border-slate-200 p-3">중도상환금액</td>
                  <td className="border border-slate-200 p-3">5,000만 원</td>
                  <td className="border border-slate-200 p-3">미리 갚는 금액</td>
                </tr>
                <tr>
                  <td className="border border-slate-200 p-3">예상 수수료</td>
                  <td className="border border-slate-200 p-3">약 60만 원</td>
                  <td className="border border-slate-200 p-3">금융기관에 낼 수 있는 비용</td>
                </tr>
                <tr>
                  <td className="border border-slate-200 p-3">절약 이자</td>
                  <td className="border border-slate-200 p-3">약 150만 원</td>
                  <td className="border border-slate-200 p-3">상환으로 줄어드는 이자</td>
                </tr>
                <tr>
                  <td className="border border-slate-200 p-3">실질 이득</td>
                  <td className="border border-slate-200 p-3">약 90만 원</td>
                  <td className="border border-slate-200 p-3">절약 이자에서 수수료를 뺀 금액</td>
                </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              중도상환이 유리한 경우
            </h2>

            <ul className="list-disc space-y-2 pl-5">
              <li>절약되는 이자가 중도상환수수료보다 큰 경우</li>
              <li>대출 금리가 높고 잔여 기간이 많이 남아 있는 경우</li>
              <li>여유자금이 있고 다른 투자 수익률보다 대출 금리가 높은 경우</li>
              <li>대출 갈아타기 전에 기존 대출 비용을 비교해야 하는 경우</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900">
              계산 시 주의사항
            </h2>

            <ul className="list-disc space-y-2 pl-5">
              <li>실제 중도상환수수료율과 면제 조건은 금융기관 및 상품마다 다릅니다.</li>
              <li>일부 상품은 일정 기간 이후 중도상환수수료가 면제될 수 있습니다.</li>
              <li>대출 갈아타기 목적이라면 신규 대출 금리, 인지세, 보증료도 함께 비교해야 합니다.</li>
              <li>계산 결과는 참고용이며 실제 상환 전 금융기관의 상환 예정 금액을 확인해야 합니다.</li>
            </ul>

            <div className="rounded-2xl bg-blue-50 p-5 text-blue-900">
              <p className="font-bold">중도상환 판단 팁</p>
              <p className="mt-2">
                중도상환은 “빨리 갚는다”보다 “수수료를 내고도 이자가 더 줄어드는가”가 핵심입니다.
                위 계산기로 수수료와 절약 이자를 함께 비교한 뒤 결정하는 것이 좋습니다.
              </p>
            </div>
          </>
        }
        examples={EXAMPLES}
        faq={FAQ}
        relatedCalcs={[
          { label: "대출이자 계산기",  href: "/loan-interest-calculator", icon: "🏦" },
          { label: "원리금상환 계산기", href: "/amortization-calculator",  icon: "📊" },
          { label: "전세대출 계산기",  href: "/jeonse-loan-calculator",   icon: "🏠" },
        ]}
        relatedGuides={[
          { label: "중도상환 타이밍 완벽 가이드", href: "/blog/prepayment-fee-timing" },
          { label: "대출 갈아타기 전략",           href: "/blog/loan-refinancing-strategy" },
        ]}
      />
    </Suspense>
  );
}
