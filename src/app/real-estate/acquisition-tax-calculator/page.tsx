// src/app/real-estate/acquisition-tax-calculator/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { buildMetadata, BASE_URL } from "@/lib/metadata";
import CalcShell, { type CalcExample } from "@/components/calculator/CalcShell";
import AcquisitionTaxCalc from "@/components/calculator/AcquisitionTaxCalc";

export const metadata: Metadata = buildMetadata({
  slug: "real-estate/acquisition-tax-calculator",
  title: "취득세 계산기 — 주택 취득세·농특세·지방교육세 계산",
  description:
    "주택 취득가액과 보유 주택 수를 입력하면 취득세, 농어촌특별세, 지방교육세 합계를 계산합니다. 1주택·2주택·3주택 이상, 조정·비조정 구분.",
  keywords: [
    "취득세계산기",
    "주택취득세",
    "부동산세금",
    "농어촌특별세",
    "지방교육세",
  ],
});

const EXAMPLES: CalcExample[] = [
  {
    title: "5억 아파트 (1주택)",
    desc: "5억원, 무주택자 첫 취득",
    inputs: [
      { label: "취득가액", value: "5억원" },
      { label: "주택 보유", value: "1주택" },
      { label: "지역", value: "조정 무관" },
    ],
    results: [
      { label: "취득세 (1%)", value: "500만원" },
      { label: "농어촌특별세 (0%)", value: "0원" },
      { label: "지방교육세 (0.1%)", value: "50만원" },
      { label: "합계", value: "550만원", highlight: true },
    ],
    note: "6억 이하 1주택은 취득세율 1%가 적용됩니다.",
  },
  {
    title: "9억 아파트 (2주택, 조정)",
    desc: "9억원, 1주택 보유 중, 조정대상지역",
    inputs: [
      { label: "취득가액", value: "9억원" },
      { label: "주택 보유", value: "2주택" },
      { label: "지역", value: "조정대상지역" },
    ],
    results: [
      { label: "취득세 (8%)", value: "7,200만원" },
      { label: "농어촌특별세 (0.6%)", value: "540만원" },
      { label: "지방교육세 (0.4%)", value: "360만원" },
      { label: "합계", value: "8,100만원", highlight: true },
    ],
    note: "2주택 조정대상지역은 세율이 8%로 크게 높아집니다.",
  },
];

const FAQ = [
  {
    q: "취득세 외에 다른 세금도 내야 하나요?",
    a: "네. 취득세 외에 농어촌특별세와 지방교육세가 함께 부과됩니다. 이 계산기에서 세 가지를 모두 합산해 보여줍니다.",
  },
  {
    q: "생애 최초 주택 구입 시 감면이 있나요?",
    a: "생애최초 주택 구입 시 취득세 감면 혜택이 있을 수 있습니다. 적용 조건, 감면 한도, 신청 기준은 변경될 수 있으므로 관할 시·군·구청에서 확인하세요.",
  },
  {
    q: "조정대상지역이 무엇인가요?",
    a: "정부가 주택 가격 안정을 위해 지정한 지역으로, 다주택자에게 더 높은 취득세율이 적용됩니다. 현재 조정 여부는 국토교통부 또는 부동산 공시가격 알리미에서 확인할 수 있습니다.",
  },
  {
    q: "취득세는 언제 납부해야 하나요?",
    a: "부동산 취득일로부터 60일 이내에 신고·납부해야 합니다. 기한 내 미납 시 가산세가 부과됩니다.",
  },
];

export default function AcquisitionTaxCalculatorPage() {
  const crumbs = [
    { name: "홈", url: BASE_URL },
    { name: "부동산 계산기", url: `${BASE_URL}/real-estate` },
    {
      name: "취득세 계산기",
      url: `${BASE_URL}/real-estate/acquisition-tax-calculator`,
    },
  ];

  return (
    <Suspense>
      <CalcShell
        title="취득세 계산기"
        description="주택 취득가액과 보유 주택 수를 입력하면 취득세·농어촌특별세·지방교육세 합계를 즉시 계산합니다."
        icon="🏠"
        slug="real-estate/acquisition-tax-calculator"
        breadcrumb={crumbs}
        calculator={<AcquisitionTaxCalc />}
        guide={
          <>
            <h2 className="text-xl font-bold text-slate-900">
              취득세 계산기란?
            </h2>

            <p>
              취득세 계산기는 아파트, 빌라, 오피스텔 등 부동산을 취득할 때 예상되는
              취득세, 농어촌특별세, 지방교육세를 미리 계산하는 도구입니다.
            </p>

            <h2 className="text-xl font-bold text-slate-900">
              취득세 계산 공식
            </h2>

            <div className="rounded bg-slate-100 p-4">
              <strong>취득세 = 취득가액 × 취득세율</strong>
              <br />
              <strong>총 납부세액 = 취득세 + 농어촌특별세 + 지방교육세</strong>
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              취득세율 예시
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                <tr className="bg-slate-50">
                  <th className="border border-slate-200 p-3">구분</th>
                  <th className="border border-slate-200 p-3">기본 세율 예시</th>
                  <th className="border border-slate-200 p-3">특징</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                  <td className="border border-slate-200 p-3">1주택</td>
                  <td className="border border-slate-200 p-3">1~3%</td>
                  <td className="border border-slate-200 p-3">가격 구간에 따라 차등 적용</td>
                </tr>
                <tr>
                  <td className="border border-slate-200 p-3">2주택</td>
                  <td className="border border-slate-200 p-3">일반 또는 중과 가능</td>
                  <td className="border border-slate-200 p-3">조정대상지역 여부 중요</td>
                </tr>
                <tr>
                  <td className="border border-slate-200 p-3">3주택 이상</td>
                  <td className="border border-slate-200 p-3">중과 가능</td>
                  <td className="border border-slate-200 p-3">세금 부담이 크게 증가</td>
                </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              실제 계산 예시
            </h2>

            <p>
              예를 들어 5억 원 주택을 1주택 조건으로 취득하면 취득세 500만 원과
              지방교육세 50만 원을 합쳐 약 550만 원 수준이 될 수 있습니다.
              반면 9억 원 주택을 2주택 조정대상지역 조건으로 취득하면 취득세와
              부가세 항목을 합쳐 수천만 원 이상 차이가 날 수 있습니다.
            </p>

            <h2 className="text-xl font-bold text-slate-900">
              취득세 계산 시 확인할 항목
            </h2>

            <ul className="list-disc space-y-2 pl-5">
              <li>취득가액이 6억 이하, 6억 초과~9억 이하, 9억 초과 중 어디에 해당하는지</li>
              <li>현재 보유 주택 수가 몇 채인지</li>
              <li>취득 주택이 조정대상지역에 있는지</li>
              <li>생애 최초 주택 구입 감면 대상인지</li>
              <li>일시적 2주택, 상속, 증여 등 특수 조건이 있는지</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900">
              주의사항
            </h2>

            <ul className="list-disc space-y-2 pl-5">
              <li>취득세율과 감면 제도는 정책 변경에 따라 달라질 수 있습니다.</li>
              <li>실제 납부 금액은 관할 지자체 판단에 따라 달라질 수 있습니다.</li>
              <li>법인 취득, 증여, 상속, 농지 등은 일반 주택 매매와 계산 방식이 다를 수 있습니다.</li>
              <li>계산 결과는 참고용이며 신고 전 관할 시·군·구청 또는 세무 전문가 확인이 필요합니다.</li>
            </ul>

            <div className="rounded-2xl bg-blue-50 p-5 text-blue-900">
              <p className="font-bold">취득세 계산 팁</p>
              <p className="mt-2">
                주택 매매 계약 전에는 매매가뿐 아니라 취득세와 부대비용까지 함께 계산해야 합니다.
                위 계산기로 예상 세금을 먼저 확인하면 실제 필요한 현금 규모를 더 정확히 파악할 수 있습니다.
              </p>
            </div>
          </>
        }
        examples={EXAMPLES}
        faq={FAQ}
        relatedCalcs={[
          {
            label: "월세 vs 전세 계산기",
            href: "/real-estate/jeonse-vs-wolse-calculator",
            icon: "⚖️",
          },
          {
            label: "양도소득세 계산기",
            href: "/real-estate/capital-gains-tax-calculator",
            icon: "📐",
          },
          {
            label: "재건축 분담금 계산기",
            href: "/real-estate/reconstruction-contribution-calculator",
            icon: "🏗️",
          },
        ]}
        relatedGuides={[
          {
            label: "취득세 완벽 가이드 — 1·2·3주택 세율",
            href: "/blog/acquisition-tax-guide",
          },
          {
            label: "부동산 매매 시 내야 하는 세금 한눈에 정리",
            href: "/blog/real-estate-tax-summary",
          },
        ]}
      />
    </Suspense>
  );
}
