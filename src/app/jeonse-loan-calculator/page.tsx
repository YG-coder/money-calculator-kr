// src/app/jeonse-loan-calculator/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { buildMetadata } from "@/lib/metadata";
import CalcShell, { type CalcExample } from "@/components/calculator/CalcShell";
import JeonseLoanCalc from "@/components/calculator/JeonseLoanCalc";

export const metadata: Metadata = buildMetadata({
  slug: "jeonse-loan-calculator",
  title: "전세대출 계산기 — 한도·월 이자·자기 부담금 계산",
  description:
    "전세 보증금, 금리, 기간을 입력하면 전세대출 가능 금액과 월 이자, 자기 부담금을 계산합니다.",
});

const EXAMPLES: CalcExample[] = [
  {
    title: "서울 소형 전세",
    desc: "보증금 3억, LTV 80%, 금리 3.5%, 24개월",
    inputs: [
      { label: "보증금", value: "30,000만원" },
      { label: "금리",   value: "연 3.5%" },
      { label: "기간",   value: "24개월" },
      { label: "LTV",    value: "80%" },
    ],
    results: [
      { label: "대출 금액", value: "2억 4,000만", highlight: true },
      { label: "월 이자",   value: "700,000원" },
      { label: "자기 부담", value: "6,000만" },
    ],
    note: "실제 상품은 보증기관, 소득, 주택 조건에 따라 달라질 수 있습니다.",
  },
  {
    title: "수도권 중형 전세",
    desc: "보증금 2억, LTV 80%, 금리 3.8%, 24개월",
    inputs: [
      { label: "보증금", value: "20,000만원" },
      { label: "금리",   value: "연 3.8%" },
      { label: "기간",   value: "24개월" },
      { label: "LTV",    value: "80%" },
    ],
    results: [
      { label: "대출 금액", value: "1억 6,000만", highlight: true },
      { label: "월 이자",   value: "506,667원" },
      { label: "자기 부담", value: "4,000만" },
    ],
    note: "보증금이 높아질수록 자기 자금과 이자 부담을 함께 고려해야 합니다.",
  },
];

const FAQ = [
  {
    q: "전세대출 한도는 어떻게 결정되나요?",
    a: "보증금, LTV 비율, 소득, 신용, 보증기관 조건 등에 따라 달라집니다. 이 계산기는 단순 참고용 시뮬레이터입니다.",
  },
  {
    q: "전세대출은 왜 월 이자만 계산되나요?",
    a: "전세자금대출은 보통 만기일시상환 방식으로 이자만 납부하고 만기에 원금을 상환하는 구조가 많기 때문입니다.",
  },
  {
    q: "HUG, HF, SGI 차이가 중요한가요?",
    a: "네. 보증기관에 따라 승인 가능 금액과 조건이 달라질 수 있습니다.",
  },
];

export default function Page() {
  return (
    <Suspense>
      <CalcShell
        title="전세대출 계산기"
        description="전세대출 가능 금액과 월 이자, 자기 부담금을 빠르게 계산하세요."
        icon="🏠"
        slug="jeonse-loan-calculator"
        calculator={
          <>
            <JeonseLoanCalc />
            <div className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
              <p className="mb-2 text-sm font-bold text-slate-800">
                ⚠️ 전세 보증금이 정말 유리한지 먼저 확인하세요
              </p>
              <p className="mb-3 text-sm text-slate-600">
                전세 보증금의 기회비용을 월세와 비교해보면 의외의 결과가 나올 수
                있습니다. 보증기관(HUG·HF·SGI) 차이도 함께 정리되어 있습니다.
              </p>
              <a
                href="/blog/jeonse-vs-wolse"
                className="block rounded-xl bg-slate-900 py-3 text-center font-bold text-white hover:bg-slate-800"
              >
                👉 전세 vs 월세 + 보증기관 가이드
              </a>
            </div>
          </>
        }
        guide={
          <>
            <h2 className="text-xl font-bold text-slate-900">
              전세대출 계산기란?
            </h2>

            <p>
              전세대출 계산기는 전세보증금, 대출 비율, 금리를 기준으로 예상
              대출금과 월 이자 부담을 계산하는 도구입니다. 전세 계약을 준비할
              때 필요한 자기자본 규모와 매월 부담해야 할 이자를 미리 확인하는
              데 도움이 됩니다.
            </p>

            <h2 className="text-xl font-bold text-slate-900">
              전세대출 계산 공식
            </h2>

            <div className="rounded bg-slate-100 p-4">
              <strong>대출금액 = 전세보증금 × 대출비율</strong>
              <br />
              <strong>월 이자 = 대출금액 × 연 금리 ÷ 12</strong>
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              실제 계산 예시
            </h2>

            <p>
              전세보증금 3억 원, 대출비율 80%, 연 금리 4% 조건이라면 예상
              대출금은 2억 4천만 원입니다. 이 경우 월 이자는 약 80만 원입니다.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="border border-slate-200 p-3">전세보증금</th>
                    <th className="border border-slate-200 p-3">대출비율</th>
                    <th className="border border-slate-200 p-3">예상 대출금</th>
                    <th className="border border-slate-200 p-3">연 4% 월 이자</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-200 p-3">2억 원</td>
                    <td className="border border-slate-200 p-3">80%</td>
                    <td className="border border-slate-200 p-3">1억 6천만 원</td>
                    <td className="border border-slate-200 p-3">약 53만 원</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 p-3">3억 원</td>
                    <td className="border border-slate-200 p-3">80%</td>
                    <td className="border border-slate-200 p-3">2억 4천만 원</td>
                    <td className="border border-slate-200 p-3">약 80만 원</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 p-3">4억 원</td>
                    <td className="border border-slate-200 p-3">80%</td>
                    <td className="border border-slate-200 p-3">3억 2천만 원</td>
                    <td className="border border-slate-200 p-3">약 107만 원</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              전세대출 이용 시 주의사항
            </h2>

            <ul className="list-disc space-y-2 pl-5">
              <li>실제 대출 한도는 소득, 신용점수, 보증기관 심사 결과에 따라 달라질 수 있습니다.</li>
              <li>변동금리 상품은 금리 상승 시 월 이자 부담이 커질 수 있습니다.</li>
              <li>보증료, 인지세, 중도상환수수료 등 부대비용은 별도로 확인해야 합니다.</li>
              <li>전세보증보험 가입 가능 여부와 임대차 계약 조건도 함께 확인하는 것이 좋습니다.</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900">
              전세대출과 월세 비교
            </h2>

            <p>
              전세대출을 이용할 때는 월 이자와 월세를 함께 비교해야 합니다.
              예를 들어 전세대출 월 이자가 80만 원이고 비슷한 주택의 월세가
              100만 원이라면 전세가 유리할 수 있습니다. 반대로 금리가 올라
              전세대출 이자가 월세와 비슷해지면 월세 선택이 더 합리적일 수도
              있습니다.
            </p>

            <div className="rounded-2xl bg-blue-50 p-5 text-blue-900">
              <p className="font-bold">전세대출 활용 팁</p>
              <p className="mt-2">
                위 계산기에 전세보증금과 금리를 입력해 월 이자 부담을 먼저
                확인해보세요. 보증기관(HUG·HF·SGI)별로 조건이 다르니 함께
                비교하는 것을 권장합니다.
              </p>
            </div>
          </>
        }
        examples={EXAMPLES}
        faq={FAQ}
        relatedCalcs={[
          { label: "월세 vs 전세 계산기",  href: "/real-estate/jeonse-vs-wolse-calculator", icon: "⚖️" },
          { label: "대출이자 계산기",       href: "/loan-interest-calculator",               icon: "🏦" },
          { label: "중도상환 계산기",       href: "/prepayment-calculator",                  icon: "💸" },
        ]}
        relatedGuides={[
          { label: "전세 vs 월세 + 보증기관(HUG·HF·SGI) 가이드", href: "/blog/jeonse-vs-wolse" },
        ]}
      />
    </Suspense>
  );
}
