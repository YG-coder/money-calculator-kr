// src/app/dsr-calculator/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { buildMetadata, BASE_URL } from "@/lib/metadata";
import CalcShell, { type CalcExample } from "@/components/calculator/CalcShell";
import DsrCalc from "@/components/calculator/DsrCalc";

export const metadata: Metadata = buildMetadata({
  slug: "dsr-calculator",
  title: "DSR 계산기 — 스트레스 DSR·추정 가능 대출액 계산",
  description:
    "연소득과 대출 조건을 입력하면 일반 DSR과 스트레스 DSR을 계산하고, DSR 기준 추정 가능 대출액을 확인합니다. 주택담보대출과 신용대출, 마이너스통장·전세자금대출 반영 방식을 구분합니다.",
  keywords: [
    "DSR계산기",
    "스트레스DSR",
    "대출한도계산",
    "DSR추정가능액",
    "신용대출DSR",
    "마이너스통장DSR",
  ],
});

const EXAMPLES: CalcExample[] = [
  {
    title: "DSR 확인 · 수도권 주담대 변동금리",
    desc: "연소득 5,000만원, 신규 3억원, 연 4.5% 변동, 360개월 원리금균등, 기준 40%",
    inputs: [
      { label: "연소득", value: "5,000만원" },
      { label: "신규 대출", value: "30,000만원" },
      { label: "금리·기간", value: "연 4.5% · 360개월" },
      { label: "조건", value: "수도권·변동형" },
    ],
    results: [
      { label: "일반 DSR", value: "36.5%" },
      { label: "스트레스 DSR", value: "50.3%", highlight: true },
      { label: "기준 40% 대비", value: "10.3%p 초과" },
    ],
    note: "변동형이라 스트레스 금리 3.0%p가 더해져(7.5% 기준) 심사상 DSR이 크게 오릅니다. 일반 DSR만 보면 통과처럼 보여도 스트레스 기준으로는 한도를 넘습니다.",
  },
  {
    title: "추정 가능액 · 같은 소득·조건",
    desc: "연소득 5,000만원, 목표 40%, 연 4.5% 변동, 360개월, 수도권 주담대",
    inputs: [
      { label: "연소득", value: "5,000만원" },
      { label: "목표 DSR", value: "40%" },
      { label: "금리·기간", value: "연 4.5% · 360개월" },
      { label: "조건", value: "수도권·변동형" },
    ],
    results: [
      { label: "추정 가능액", value: "약 2.38억", highlight: true },
      { label: "(명목 금리로 역산 시)", value: "약 3.29억" },
    ],
    note: "역산도 스트레스 금리(7.5%) 기준으로 계산합니다. 명목 4.5%로 역산하면 3.29억이 나오지만, 실제 규제 한도는 스트레스 기준이라 이보다 낮은 2.38억이 추정치입니다.",
  },
  {
    title: "신용대출 · 1억원 경계와 금리유형",
    desc: "연소득 6,000만원, 신규 신용대출 1억 5,000만원, 연 5.5% 일시상환, 기준 40%",
    inputs: [
      { label: "연소득", value: "6,000만원" },
      { label: "신규 신용대출", value: "15,000만원" },
      { label: "금리", value: "연 5.5%" },
      { label: "산정만기", value: "5년 (일시상환)" },
    ],
    results: [
      { label: "일반 DSR", value: "62.5%" },
      { label: "스트레스 DSR (변동)", value: "65.9%", highlight: true },
      { label: "5년 이상 고정이라면", value: "62.5%" },
    ],
    note: "신용대출은 총잔액(기존+신규)이 1억원을 넘을 때만 스트레스 금리가 붙습니다. 같은 조건이라도 만기 5년 이상 고정금리면 스트레스가 적용되지 않아 62.5%에 머뭅니다. 신용대출은 실제 약정 기간과 무관하게 산정만기 5년으로 원리금을 계산하므로 DSR이 크게 오릅니다.",
  },
];

const FAQ = [
  {
    q: "일반 DSR과 스트레스 DSR은 무엇이 다른가요?",
    a: "일반 DSR은 실제 대출 금리로 계산한 연간 원리금 비율입니다. 스트레스 DSR은 미래 금리 상승 위험을 반영해 실제 금리에 스트레스 금리(가산금리)를 더한 뒤 계산합니다. 은행이 한도를 산정할 때 보는 기준은 스트레스 DSR이므로, 일반 DSR이 기준 이내여도 스트레스 DSR이 기준을 넘으면 한도가 줄어듭니다.",
  },
  {
    q: "추정 가능액이 실제 은행 한도와 다른 이유는?",
    a: "이 계산기의 추정 가능액은 DSR만을 기준으로 역산한 값입니다. 실제 대출 한도는 LTV(담보인정비율), 담보 가치, 방공제(소액임차보증금 공제), 소득 인정 방식, 기존 부채 산정 방식, 금융회사 내부 심사 기준에 따라 더 낮아질 수 있습니다. 최대 대출 가능액을 보장하는 값이 아니라 DSR 상한 추정치로 이해하세요.",
  },
  {
    q: "지방 주택담보대출은 왜 스트레스 금리가 낮게 나오나요?",
    a: "수도권·규제지역 주담대는 3단계 스트레스 DSR(변동형 기준 3.0%)이 적용되지만, 지방(비규제) 주담대는 지방 주택시장 상황을 고려해 2단계 수준(0.75%)이 유예 적용되고 있습니다. 이 유예는 2026년 12월 31일까지로, 이후 기준이 바뀔 수 있으니 실제 신청 시점의 공시를 확인하세요.",
  },
  {
    q: "신용대출도 DSR에 포함되나요?",
    a: "네, 신용대출도 DSR 산정에 포함되며 주택담보대출과 산정 규칙이 다릅니다. 총잔액(기존+신규)이 1억원을 초과할 때만 스트레스 금리가 적용되고, 적용 비율도 고정금리 기간에 따라 달라집니다(만기 5년 이상 고정은 미적용, 3년 이상 5년 미만 고정은 60%, 그 밖은 100%). 원리금은 일시상환·마이너스통장의 경우 5년 만기를 기준으로 산정하지만, 요건을 갖춘 분할상환 신용대출은 실제 만기를 인정받을 수 있어 모든 신용대출이 5년으로 계산되는 것은 아닙니다. 기존 일시상환 신용대출과 마이너스통장은 잔액과 약정한도를 입력해 게이팅 판정에 합산하고, 적격 분할상환 대출은 금융회사에서 확인한 실제 연간 원리금을 '기타 부채'에 입력하세요.",
  },
  {
    q: "전세자금대출도 DSR에 포함되나요?",
    a: "조건에 따라 다릅니다. 무주택자가 받는 전세자금대출은 원칙적으로 DSR 산정에서 제외됩니다. 1주택자가 수도권·규제지역에서 임차인으로 받는 전세대출은 이자상환분만 DSR에 반영됩니다. 기존 전세대출의 단순 만기연장은 신규 적용 대상이 아니지만, 만기연장 시 증액하는 부분은 신규 대출로 보아 적용됩니다. 그 밖의 조건은 이 계산기가 자동으로 판정하지 않으므로 금융회사에 확인하세요.",
  },
  {
    q: "마이너스통장은 얼마로 잡히나요?",
    a: "마이너스통장은 실제 사용한 금액이 아니라 약정한도 전액을 대출금액으로 보는 것이 일반적인 DSR 산정 기준입니다. 지금 사용액이 0원이어도 한도가 열려 있으면 DSR에 영향을 줄 수 있습니다. 한도를 줄이거나 해지하면 DSR 부담이 낮아질 수 있으므로, 대출을 앞두고 있다면 금융회사에 확인해 보세요.",
  },
];

export default function Page() {
  return (
    <Suspense>
      <CalcShell
        title="DSR 계산기"
        description="스트레스 DSR을 반영해 현재 DSR과 DSR 기준 추정 가능 대출액을 확인하세요."
        icon="📐"
        slug="dsr-calculator"
        breadcrumb={[
          { name: "홈", url: BASE_URL },
          { name: "대출 계산기", url: `${BASE_URL}/loan` },
          { name: "DSR 계산기", url: `${BASE_URL}/dsr-calculator` },
        ]}
        calculator={
          <>
            <DsrCalc />
            <div className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
              <p className="mb-2 text-sm font-bold text-slate-800">
                ⚠️ 일반 DSR만 보면 한도를 잘못 판단할 수 있습니다
              </p>
              <p className="text-sm text-slate-600">
                은행이 실제로 보는 기준은 스트레스 DSR입니다. 변동금리 대출은
                스트레스 금리가 더해져 심사상 DSR이 크게 오르므로, 두 값을 함께
                확인하세요.
              </p>
            </div>
          </>
        }
        guide={
          <>
            <h2 className="text-xl font-bold text-slate-900">DSR이란?</h2>
            <p>
              DSR(총부채원리금상환비율)은 연소득 대비 DSR 적용 대상 가계대출의
              연간 원리금 상환부담을 합산해 계산한 비율입니다.
              주택담보대출·신용대출 등이 포함되며, 대출 종류에 따라 DSR 적용
              여부와 연간 원리금 산정 방식이 다를 수 있습니다. 현재 차주 단위
              규제 한도는 은행권 40%, 비은행권 50%입니다.
            </p>
            <p>
              이 계산기는 신규 주택담보대출을 기준으로 스트레스 DSR을
              계산합니다.
            </p>

            <h2 className="text-xl font-bold text-slate-900">
              스트레스 DSR — 지역·금리유형에 따라 달라집니다
            </h2>
            <p>
              스트레스 DSR은 미래 금리 상승 위험을 반영해 실제 대출 금리에
              스트레스 금리(가산금리)를 더한 뒤 한도를 산정하는 제도입니다.
              변동형처럼 금리 변동 위험이 큰 대출일수록 스트레스 금리가 높게
              적용되고, 순수고정형은 스트레스 금리가 적용되지 않습니다.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="border border-slate-200 p-3 text-left">
                      구분
                    </th>
                    <th className="border border-slate-200 p-3 text-left">
                      변동형 스트레스 금리
                    </th>
                    <th className="border border-slate-200 p-3 text-left">
                      비고
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-200 p-3 font-semibold">
                      수도권·규제지역 주담대
                    </td>
                    <td className="border border-slate-200 p-3">3.0%</td>
                    <td className="border border-slate-200 p-3">3단계 하한</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 p-3 font-semibold">
                      지방(비규제) 주담대
                    </td>
                    <td className="border border-slate-200 p-3">0.75%</td>
                    <td className="border border-slate-200 p-3">
                      2단계 유예 (~2026-12-31)
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 p-3 font-semibold">
                      순수고정형
                    </td>
                    <td className="border border-slate-200 p-3">0%</td>
                    <td className="border border-slate-200 p-3">
                      만기까지 고정 시 미적용
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-slate-500">
              ※ 기준일 2026-08-08. 혼합형·주기형은 고정기간·변동주기 비중에 따라
              적용비율이 달라, 현재 간편 계산에서는 변동형·순수고정형만
              지원합니다.
            </p>

            <h2 className="text-xl font-bold text-slate-900">
              두 가지 계산 모드
            </h2>
            <p>
              <strong>DSR 확인</strong> 모드는 신규 대출 조건을 입력하면 일반
              DSR과 스트레스 DSR을 함께 보여주고, 선택한 기준까지 남은 상환여력
              또는 초과분을 알려줍니다. <strong>추정 가능액</strong> 모드는
              소득과 목표 DSR로 DSR 기준 추정 가능 대출액을 역산합니다. 이때
              역산도 스트레스 금리 기준으로 계산하므로, 명목 금리로 계산한
              값보다 보수적으로 나옵니다.
            </p>

            <h2 className="text-xl font-bold text-slate-900">
              계산 시 주의사항
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                기존 부채는 DSR 산정용 연간 원리금을 직접 입력합니다. 금융회사
                앱·상담자료에서 확인한 값이 가장 정확합니다.
              </li>
              <li>
                DSR 분자(연간 원리금)는 실제 상환액과 다를 수 있으며,
                대출종류·상환방식에 따라 산정방식이 달라집니다.
              </li>
              <li>
                추정 가능액은 DSR 상한 추정치이며, LTV·방공제·금융회사 심사에
                따라 실제 한도는 더 낮아질 수 있습니다.
              </li>
              <li>
                스트레스 DSR 기준은 정책에 따라 바뀌므로 실제 신청 시점의
                금융위원회·전국은행연합회 공시를 확인하세요.
              </li>
            </ul>

            <div className="rounded-2xl bg-blue-50 p-5 text-blue-900">
              <p className="font-bold">DSR과 함께 확인하면 좋은 것</p>
              <p className="mt-2">
                DSR로 소득 대비 한도를 확인했다면, 실제 월 상환액과 상환 방식은{" "}
                원리금상환 계산기에서, 담보 기준 한도는 LTV 계산기에서 함께
                검토하세요. 실제 한도는 두 값 중 낮은 쪽입니다.
              </p>
            </div>
          </>
        }
        examples={EXAMPLES}
        faq={FAQ}
        relatedCalcs={[
          {
            label: "LTV 계산기 (담보 기준 한도)",
            href: "/ltv-calculator",
            icon: "📏",
          },
          {
            label: "대출이자 계산기",
            href: "/loan-interest-calculator",
            icon: "🏦",
          },
          {
            label: "원리금상환 계산기",
            href: "/amortization-calculator",
            icon: "📊",
          },
          {
            label: "전세대출 계산기",
            href: "/jeonse-loan-calculator",
            icon: "🏠",
          },
          {
            label: "중도상환 계산기",
            href: "/prepayment-calculator",
            icon: "💸",
          },
        ]}
        relatedGuides={[
          {
            label: "대출 이자 계산 방법 완벽 정리",
            href: "/blog/loan-interest-calculation",
          },
          {
            label: "원리금균등 vs 원금균등 완벽 비교",
            href: "/blog/equal-payment-vs-equal-principal",
          },
        ]}
      />
    </Suspense>
  );
}
