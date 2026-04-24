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
            <p>
              <strong>취득세</strong>는 아파트, 빌라, 오피스텔 등 부동산을
              취득할 때 납부하는 지방세입니다. 단순히 매매가에 일정 세율을
              곱하는 방식처럼 보이지만, 실제로는 주택 가격, 보유 주택 수,
              조정대상지역 여부에 따라 세율이 달라질 수 있습니다.
            </p>

            <p>
              특히 주택을 처음 구입하는 경우와 기존 주택을 보유한 상태에서
              추가로 매수하는 경우의 세금 차이가 큽니다. 1주택자는 상대적으로
              낮은 세율이 적용되지만, 2주택 이상부터는 취득세 부담이 크게 증가할
              수 있습니다.
            </p>

            <p>
              취득세를 계산할 때는 취득세 본세뿐 아니라
              <strong> 농어촌특별세</strong>와 <strong>지방교육세</strong>도
              함께 확인해야 합니다. 실제 납부 금액은 이 세 가지 항목을 합산한
              금액입니다.
            </p>

            <p>
              예를 들어 같은 5억 원 주택이라도 무주택자가 처음 구입하는 경우와,
              이미 주택을 보유한 사람이 추가로 구입하는 경우에는 예상 세금이
              달라질 수 있습니다. 따라서 부동산 매매 전에는 취득세를 미리 계산해
              총 필요 자금을 확인하는 것이 중요합니다.
            </p>

            <p>
              이 계산기는 주택 취득가액과 보유 주택 수, 지역 조건을 입력하면
              예상 취득세와 부가세 항목을 빠르게 확인할 수 있도록 만든 참고용
              계산기입니다. 실제 신고·납부 금액은 감면 조건, 과세 기준, 지자체
              판단 등에 따라 달라질 수 있습니다.
            </p>

            <hr className="border-slate-100" />

            <p className="text-slate-400">
              본 계산 결과는 참고용입니다. 생애 최초 주택 구입, 법인 취득, 증여,
              상속, 일시적 2주택 등 특수 조건은 관할 시·군·구청 또는 세무
              전문가에게 확인하는 것이 안전합니다.
            </p>
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
            label: "전세대출 계산기",
            href: "/jeonse-loan-calculator",
            icon: "🏠",
          },
          {
            label: "대출이자 계산기",
            href: "/loan-interest-calculator",
            icon: "🏦",
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
