// src/app/amortization-calculator/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { buildMetadata } from "@/lib/metadata";
import CalcShell, { type CalcExample } from "@/components/calculator/CalcShell";
import AmortizationCalc from "@/components/calculator/AmortizationCalc";

export const metadata: Metadata = buildMetadata({
  slug: "amortization-calculator",
  title: "원리금상환 계산기 — 원리금균등·원금균등 월 납입금 계산",
  description:
    "원리금균등상환과 원금균등상환의 월 납입금, 총 이자, 월별 상환 스케줄을 비교합니다. 내 소득에 맞는 상환 방식을 선택하세요.",
});

const EXAMPLES: CalcExample[] = [
  {
    title: "주택담보대출 30년 원리금균등",
    desc: "3억원, 연 4.5%, 360개월 원리금균등상환",
    inputs: [
      { label: "원금", value: "30,000만원" },
      { label: "금리", value: "연 4.5%" },
      { label: "기간", value: "360개월 (30년)" },
      { label: "방식", value: "원리금균등" },
    ],
    results: [
      { label: "월 납입액", value: "1,520,060원", highlight: true },
      { label: "총 납입액", value: "5억 4,722만원" },
      { label: "총 이자",   value: "2억 4,722만원" },
    ],
    note: "원금의 약 82% 수준의 이자를 30년간 부담할 수 있습니다.",
  },
  {
    title: "같은 조건 원금균등과 비교",
    desc: "3억원, 연 4.5%, 360개월 원금균등상환",
    inputs: [
      { label: "원금", value: "30,000만원" },
      { label: "금리", value: "연 4.5%" },
      { label: "기간", value: "360개월 (30년)" },
      { label: "방식", value: "원금균등" },
    ],
    results: [
      { label: "첫달 납입액", value: "1,958,333원", highlight: true },
      { label: "총 납입액",   value: "5억 306만원" },
      { label: "총 이자",     value: "2억 306만원" },
    ],
    note: "원리금균등 대비 총 이자를 크게 줄일 수 있지만 초반 부담은 더 큽니다.",
  },
];

const FAQ = [
  {
    q: "원리금균등과 원금균등 중 어떤 게 유리한가요?",
    a: "총 이자만 보면 원금균등 방식이 더 적습니다. 다만 초반 월 납입액이 크기 때문에 소득 여유가 있을 때 적합합니다. 매달 같은 금액으로 관리하려면 원리금균등이 편합니다.",
  },
  {
    q: "30년 주택담보대출 총 이자가 왜 이렇게 많나요?",
    a: "기간이 길수록 이자 누적 부담이 커지기 때문입니다. 같은 금리라도 10년보다 30년이 총 이자가 훨씬 많습니다.",
  },
  {
    q: "상환 기간을 줄이면 얼마나 절약되나요?",
    a: "같은 금리와 원금이라면 30년보다 20년이 총 이자를 크게 줄여줍니다. 대신 월 납입액은 올라갑니다.",
  },
];

export default function Page() {
  return (
    <Suspense>
      <CalcShell
        title="원리금상환 계산기"
        description="원리금균등·원금균등 방식별 월 납입액과 전체 상환 스케줄을 확인하세요."
        icon="📊"
        slug="amortization-calculator"
        calculator={
          <>
            <AmortizationCalc />
            <div className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
              <p className="mb-2 text-sm font-bold text-slate-800">
                ⚠️ 상환 방식 선택 잘못하면 수천만 원 차이
              </p>
              <p className="mb-3 text-sm text-slate-600">
                원리금균등과 원금균등 차이를 모르고 선택하면 불필요한 이자를 더
                낼 수 있습니다.
              </p>
              <a
                href="/blog/equal-payment-vs-equal-principal"
                className="block rounded-xl bg-slate-900 py-3 text-center font-bold text-white hover:bg-slate-800"
              >
                👉 상환 방식 완벽 비교
              </a>
            </div>
          </>
        }
        guide={
          <>
            <h2 className="text-xl font-bold text-slate-900">
              원리금상환 계산기란?
            </h2>

            <p>
              원리금상환 계산기는 대출 원금, 금리, 상환 기간을 입력하면
              <strong> 원리금균등상환</strong>과 <strong>원금균등상환</strong>의
              월 납입액, 총 이자, 총 상환액을 비교해 주는 계산기입니다.
              주택담보대출, 신용대출, 전세자금대출처럼 장기간 갚아야 하는 대출은
              상환 방식에 따라 실제 부담액이 크게 달라질 수 있습니다.
            </p>

            <h2 className="text-xl font-bold text-slate-900">
              원리금균등상환 방식
            </h2>

            <p>
              원리금균등상환은 매달 같은 금액을 납부하는 방식입니다.
              초기에는 월 납입액 중 이자 비중이 높고, 시간이 지날수록 원금 비중이
              커집니다. 매달 내는 금액이 일정하기 때문에 가계부 관리가 쉽고,
              월 고정 지출을 예측하기 좋다는 장점이 있습니다.
            </p>

            <h2 className="text-xl font-bold text-slate-900">
              원금균등상환 방식
            </h2>

            <p>
              원금균등상환은 매달 같은 금액의 원금을 갚고, 남은 대출 잔액에 따라
              이자가 줄어드는 방식입니다. 초반 월 납입액은 원리금균등보다 크지만
              시간이 지날수록 납입액이 줄어듭니다. 총 이자를 줄이고 싶다면
              원금균등 방식이 유리한 경우가 많습니다.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                <tr className="bg-slate-50">
                  <th className="border border-slate-200 p-3">구분</th>
                  <th className="border border-slate-200 p-3">원리금균등</th>
                  <th className="border border-slate-200 p-3">원금균등</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                  <td className="border border-slate-200 p-3 font-semibold">
                    월 납입액
                  </td>
                  <td className="border border-slate-200 p-3">
                    매월 동일
                  </td>
                  <td className="border border-slate-200 p-3">
                    초반 높고 점점 감소
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-200 p-3 font-semibold">
                    총 이자
                  </td>
                  <td className="border border-slate-200 p-3">
                    상대적으로 많음
                  </td>
                  <td className="border border-slate-200 p-3">
                    상대적으로 적음
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-200 p-3 font-semibold">
                    장점
                  </td>
                  <td className="border border-slate-200 p-3">
                    고정 지출 관리가 쉬움
                  </td>
                  <td className="border border-slate-200 p-3">
                    전체 이자 부담 감소
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-200 p-3 font-semibold">
                    단점
                  </td>
                  <td className="border border-slate-200 p-3">
                    총 이자가 더 많을 수 있음
                  </td>
                  <td className="border border-slate-200 p-3">
                    초기 상환 부담이 큼
                  </td>
                </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              실제 계산 예시
            </h2>

            <p>
              예를 들어 3억 원을 연 4.5% 금리로 30년 동안 빌린다고 가정하면,
              원리금균등 방식은 매달 약 152만 원을 납부하고 총 이자는 약
              2억 4,722만 원 수준입니다. 반면 원금균등 방식은 첫 달 납입액이
              약 195만 원으로 높지만 총 이자는 약 2억 306만 원 수준으로 줄어듭니다.
            </p>

            <p>
              같은 대출 조건이라도 상환 방식에 따라 총 이자가 약 4천만 원 이상
              차이 날 수 있습니다. 따라서 단순히 월 납입액만 볼 것이 아니라
              전체 상환 기간 동안 부담해야 하는 총 이자까지 함께 비교해야 합니다.
            </p>

            <h2 className="text-xl font-bold text-slate-900">
              어떤 방식을 선택해야 할까요?
            </h2>

            <p>
              매달 일정한 금액을 내면서 안정적으로 자금 계획을 세우고 싶다면
              원리금균등 방식이 적합합니다. 반대로 초반 상환 여력이 있고,
              장기적으로 이자 부담을 줄이고 싶다면 원금균등 방식이 더 유리할 수
              있습니다. 특히 주택담보대출처럼 금액이 크고 기간이 긴 대출은
              상환 방식 선택이 전체 비용에 큰 영향을 줍니다.
            </p>

            <h2 className="text-xl font-bold text-slate-900">
              계산 시 주의사항
            </h2>

            <ul className="list-disc space-y-2 pl-5">
              <li>실제 금융기관의 금리, 우대금리, 수수료 조건과 차이가 있을 수 있습니다.</li>
              <li>변동금리 대출은 향후 금리 변동에 따라 월 납입액이 달라질 수 있습니다.</li>
              <li>중도상환수수료, 인지세, 보증료 등 부대비용은 별도로 확인해야 합니다.</li>
              <li>계산 결과는 참고용이며 실제 대출 실행 전 금융기관 상담이 필요합니다.</li>
            </ul>

            <div className="rounded-2xl bg-blue-50 p-5 text-blue-900">
              <p className="font-bold">상환 방식 선택 팁</p>
              <p className="mt-2">
                월 납입액 안정성이 중요하면 원리금균등, 총 이자 절감이 중요하면
                원금균등을 우선 비교해 보세요. 위 계산기에 같은 조건을 입력한 뒤
                두 방식의 월 납입액과 총 이자를 함께 확인하는 것이 좋습니다.
              </p>
            </div>
          </>
        }
        examples={EXAMPLES}
        faq={FAQ}
        relatedCalcs={[
          { label: "대출이자 계산기", href: "/loan-interest-calculator", icon: "🏦" },
          { label: "중도상환 계산기", href: "/prepayment-calculator",    icon: "💸" },
          { label: "전세대출 계산기", href: "/jeonse-loan-calculator",   icon: "🏠" },
        ]}
        relatedGuides={[
          { label: "원리금균등 vs 원금균등 완벽 비교", href: "/blog/equal-payment-vs-equal-principal" },
          { label: "대출 이자 계산 방법 완벽 정리",   href: "/blog/loan-interest-calculation" },
        ]}
      />
    </Suspense>
  );
}
