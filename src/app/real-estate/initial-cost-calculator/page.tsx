// src/app/real-estate/initial-cost-calculator/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { buildMetadata, BASE_URL } from "@/lib/metadata";
import CalcShell, { type CalcExample } from "@/components/calculator/CalcShell";
import InitialCostCalc from "@/components/calculator/InitialCostCalc";

export const metadata: Metadata = buildMetadata({
  slug: "real-estate/initial-cost-calculator",
  title: "부동산 실투자금 계산기 — 취득세·중개보수 포함 총 필요자금",
  description:
    "매매가에 취득세·중개보수·등기비용을 더해 실제로 필요한 현금이 얼마인지 계산합니다. 생애최초 감면과 저가주택 중과 배제를 반영하고, 대출금과 승계 보증금을 빼 실투자금을 보여줍니다.",
  keywords: [
    "부동산실투자금",
    "실투자금계산기",
    "총필요자금",
    "부동산부대비용",
    "중개보수계산",
  ],
});

const crumbs = [
  { name: "홈", url: BASE_URL },
  { name: "부동산 계산기", url: `${BASE_URL}/real-estate` },
  {
    name: "부동산 실투자금 계산기",
    url: `${BASE_URL}/real-estate/initial-cost-calculator`,
  },
];

const EXAMPLES: CalcExample[] = [
  {
    title: "무주택 첫 매수 · 5억 아파트",
    desc: "매매 5억, 85㎡ 이하, 생애최초 감면(200만원), 등기·법무 150만원, 대출 3억",
    inputs: [
      { label: "매매가", value: "50,000만원" },
      { label: "보유 상황", value: "1주택 · 생애최초" },
      { label: "등기·법무", value: "150만원" },
      { label: "대출금", value: "30,000만원" },
    ],
    results: [
      { label: "취득세 합계 (감면 200만 반영)", value: "3,300,000원" },
      { label: "최대 중개보수 (0.4%)", value: "2,000,000원" },
      { label: "중개보수 부가세", value: "200,000원" },
      { label: "등기·법무", value: "1,500,000원" },
      { label: "총 부대비용", value: "7,000,000원 (매매가의 1.40%)" },
      { label: "총 필요자금", value: "5.1억 (507,000,000원)" },
      { label: "실투자금", value: "2.1억 (207,000,000원)", highlight: true },
    ],
    note: "생애최초 감면으로 취득세가 550만원에서 330만원으로 줄었습니다. 지방교육세도 감면율에 따라 함께 줄어듭니다. 매매가만 보고 3억을 대출받으면 2억이면 된다고 생각하기 쉽지만, 부대비용 700만원이 더 필요합니다.",
  },
  {
    title: "임대 승계 매수 · 3억 빌라",
    desc: "매매 3억, 2주택(비조정), 85㎡ 이하, 보증금 2억 승계, 대출 없음, 등기·법무 100만원",
    inputs: [
      { label: "매매가", value: "30,000만원" },
      { label: "보유 상황", value: "2주택 · 비조정" },
      { label: "승계 보증금", value: "20,000만원" },
      { label: "등기·법무", value: "100만원" },
    ],
    results: [
      { label: "취득세 합계", value: "3,300,000원" },
      { label: "최대 중개보수 (0.4%)", value: "1,200,000원" },
      { label: "중개보수 부가세", value: "120,000원" },
      { label: "총 부대비용", value: "5,620,000원 (매매가의 1.87%)" },
      { label: "총 필요자금", value: "3.1억 (305,620,000원)" },
      { label: "실투자금", value: "1.1억 (105,620,000원)", highlight: true },
    ],
    note: "비조정지역 2주택은 중과 없이 1주택 구간 세율(1%)이 적용됩니다. 승계한 보증금 2억이 자기자금을 대신하므로 실투자금은 약 1.06억(105,620,000원)입니다. 요약 카드는 억 단위로 반올림해 표시하며 정확한 금액은 부대비용 내역에서 확인할 수 있습니다.",
  },
];

const FAQ = [
  {
    q: "실투자금과 총 필요자금은 무엇이 다른가요?",
    a: "총 필요자금은 매매가에 취득세·중개보수·등기비용 등 부대비용을 모두 더한 금액입니다. 실투자금은 여기서 대출금과 승계하는 임대보증금을 뺀, 실제로 준비해야 하는 자기자금입니다. 매매가만 보고 자금 계획을 세우면 부대비용만큼 부족해집니다.",
  },
  {
    q: "등기·법무 비용은 왜 자동으로 계산하지 않나요?",
    a: "등기 비용의 큰 축인 국민주택채권 매입·즉시매도 할인율이 매일 바뀌기 때문입니다. 계산기에 고정값으로 넣으면 그날부터 틀린 금액을 보여주게 됩니다. 그래서 법무사 견적 금액을 직접 입력받고, 별도로 확인할 경우에는 '포함하지 않음'을 선택하도록 했습니다. 기본값 0원을 조용히 적용하지 않습니다.",
  },
  {
    q: "중개보수가 실제로 낸 금액과 다릅니다.",
    a: "요율표의 값은 상한이고 실제 보수는 그 범위 안에서 협의로 정합니다. 그래서 이 계산기는 '예상 최대 중개보수'로 표시합니다. 협의한 금액을 알고 있다면 '금액 직접 입력'을 선택하세요. 또한 주택 중개보수는 시·도 조례로 정해지는데, 조례가 국토교통부 상한과 일치함을 확인한 지역은 서울특별시·경기도입니다. 그 외 지역은 해당 시·도 조례를 확인해야 하며 이 결과는 국토교통부 상한 기준 참고값입니다.",
  },
  {
    q: "중개보수 부가가치세는 꼭 내야 하나요?",
    a: "중개보수는 부가가치세가 별도입니다. 일반과세 중개사는 10%를 별도로 청구하며, 이 계산기는 이를 기본 포함합니다. 간이과세 중개사는 실무가 다를 수 있으므로 사전에 확인하시고, 필요하면 체크를 해제해 계산할 수 있습니다.",
  },
];

export default function Page() {
  return (
    <Suspense>
      <CalcShell
        title="부동산 실투자금 계산기"
        description="매매가에 취득세·중개보수·등기비용을 더해 실제로 필요한 현금을 계산하세요."
        icon="💰"
        slug="real-estate/initial-cost-calculator"
        breadcrumb={crumbs}
        calculator={<InitialCostCalc />}
        guide={
          <>
            <h2 className="text-xl font-bold text-slate-900">
              매매가만 보면 자금이 모자랍니다
            </h2>
            <p>
              집을 살 때 나가는 돈은 매매가만이 아닙니다. 취득세와 부가세목, 중개보수와
              그 부가가치세, 등기·법무 비용이 더해집니다. 이 계산기는 그것을 모두 합쳐
              <strong>총 필요자금</strong>을 구하고, 대출금과 승계 보증금을 빼서 실제로
              준비해야 할 <strong>실투자금</strong>을 보여줍니다.
            </p>

            <h2 className="text-xl font-bold text-slate-900">계산 구조</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>총 부대비용 = 취득세 합계 + 중개보수(+부가세) + 등기·법무 + 기타</li>
              <li>총 필요자금 = 매매가 + 총 부대비용</li>
              <li>실투자금 = 총 필요자금 − 대출금 − 승계 임대보증금</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900">중개보수 상한요율</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="border border-slate-200 p-3 text-left">거래금액</th>
                    <th className="border border-slate-200 p-3">상한요율</th>
                    <th className="border border-slate-200 p-3">한도액</th>
                  </tr>
                </thead>
                <tbody className="text-center">
                  <tr>
                    <td className="border border-slate-200 p-3 text-left">5천만원 미만</td>
                    <td className="border border-slate-200 p-3">0.6%</td>
                    <td className="border border-slate-200 p-3">25만원</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 p-3 text-left">5천만원 ~ 2억원 미만</td>
                    <td className="border border-slate-200 p-3">0.5%</td>
                    <td className="border border-slate-200 p-3">80만원</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 p-3 text-left">2억원 ~ 9억원 미만</td>
                    <td className="border border-slate-200 p-3">0.4%</td>
                    <td className="border border-slate-200 p-3">—</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 p-3 text-left">9억원 ~ 12억원 미만</td>
                    <td className="border border-slate-200 p-3">0.5%</td>
                    <td className="border border-slate-200 p-3">—</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 p-3 text-left">12억원 ~ 15억원 미만</td>
                    <td className="border border-slate-200 p-3">0.6%</td>
                    <td className="border border-slate-200 p-3">—</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 p-3 text-left">15억원 이상</td>
                    <td className="border border-slate-200 p-3">0.7%</td>
                    <td className="border border-slate-200 p-3">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              주택 중개보수는 국토교통부령이 정한 범위 안에서 시·도 조례로 정합니다. 위 표는
              국토교통부 상한이며, 조례가 이와 일치함을 확인한 지역은 서울특별시·경기도입니다.
              부가가치세는 별도입니다.
            </p>

            <div className="rounded-2xl bg-blue-50 p-5 text-blue-900">
              <p className="font-bold">이 계산기가 반영하지 않는 것</p>
              <p className="mt-2">
                임대차 중개보수, 오피스텔·상가·토지 중개보수, 간이과세 중개사의 부가가치세,
                등기 비용 자동 산정, 무상취득(증여·상속)은 반영하지 않습니다. 서울·경기 외
                지역의 조례 요율차도 확인하지 못해 국토교통부 상한으로 계산합니다.
              </p>
            </div>
          </>
        }
        examples={EXAMPLES}
        faq={FAQ}
        relatedCalcs={[
          { label: "취득세 계산기", href: "/real-estate/acquisition-tax-calculator", icon: "🏠" },
          { label: "LTV 계산기 (담보 기준 한도)", href: "/ltv-calculator", icon: "📏" },
          { label: "DSR 계산기 (소득 기준 한도)", href: "/dsr-calculator", icon: "📐" },
          { label: "부동산 수익률 계산기", href: "/real-estate/property-yield-calculator", icon: "📈" },
        ]}
        relatedGuides={[
          { label: "취득세 완벽 가이드", href: "/blog/acquisition-tax-guide" },
          { label: "부동산 수익률 계산 방법", href: "/blog/property-yield-guide" },
        ]}
      />
    </Suspense>
  );
}
