// src/app/real-estate/jeonse-wolse-conversion/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { buildMetadata, BASE_URL } from "@/lib/metadata";
import CalcShell, { type CalcExample } from "@/components/calculator/CalcShell";
import JeonseWolseConversionCalc from "@/components/calculator/JeonseWolseConversionCalc";
import {
  CONVERSION_RATE_INFO,
  getLegalConversionCapPct,
} from "@/lib/realEstate";

export const metadata: Metadata = buildMetadata({
  slug: "real-estate/jeonse-wolse-conversion",
  title: "전월세 전환율 계산기 — 법정 상한 확인",
  description:
    "전세 보증금을 월세로 돌릴 때 적용된 전환율을 계산하고, 연 10%와 한국은행 기준금리 + 2% 중 낮은 값으로 정해지는 법정 상한(주택)과 비교합니다. 상한율로 환산한 월세도 함께 보여줍니다.",
  keywords: ["전월세전환율", "전월세전환율계산기", "전세월세전환", "법정전환율상한"],
});

const crumbs = [
  { name: "홈", url: BASE_URL },
  { name: "부동산 계산기", url: `${BASE_URL}/real-estate` },
  {
    name: "전월세 전환율 계산기",
    url: `${BASE_URL}/real-estate/jeonse-wolse-conversion`,
  },
];

// 예시 수치는 정책 상수에서 파생시킨다.
// 기준금리를 바꿀 때 상수 한 곳만 고치면 계산기와 예시가 함께 따라오게 하기 위함이다.
// (하드코딩하면 금통위 이후 예시만 옛 값으로 남는다)
const CAP_PCT = getLegalConversionCapPct();
const capLabel = `${CAP_PCT.toFixed(2)}%`;

/** 전환 대상 금액(만원)에 법정 상한을 적용했을 때의 월세(만원) */
function capMonthlyMan(convertedMan: number): number {
  return (convertedMan * (CAP_PCT / 100)) / 12;
}

const EX1_CONVERTED_MAN = 10_000; // 전세 3억 → 보증금 2억
const EX2_CONVERTED_MAN = 20_000; // 전세 4억 → 보증금 2억
const EX1_RATE_PCT = 6.0;
const EX2_RATE_PCT = 3.6;

const EXAMPLES: CalcExample[] = [
  {
    title: "전세 3억 → 보증금 2억 + 월세 50만",
    desc: "전세 보증금 3억원을, 보증금 2억원 + 월세 50만원으로 전환한 경우",
    inputs: [
      { label: "전세 보증금", value: "30,000만원" },
      { label: "전환 후 보증금", value: "20,000만원" },
      { label: "월세", value: "50만원" },
    ],
    results: [
      { label: "적용 전환율", value: `${EX1_RATE_PCT.toFixed(2)}%`, highlight: true },
      { label: "법정 상한(주택)", value: capLabel },
      { label: "상한 대비", value: EX1_RATE_PCT > CAP_PCT ? "초과" : "이하" },
      {
        label: "상한 적용 시 월세",
        value: `약 ${capMonthlyMan(EX1_CONVERTED_MAN).toFixed(1)}만원`,
      },
    ],
    note: `1억원을 월세로 돌리면서 월 50만원을 받으면 전환율은 ${EX1_RATE_PCT.toFixed(
      1,
    )}%로, 현재 법정 상한 ${capLabel}(연 ${CONVERSION_RATE_INFO.fixedCapPct}%와 기준금리 ${
      CONVERSION_RATE_INFO.baseRatePct
    }% + ${CONVERSION_RATE_INFO.legalAddPct}% 중 낮은 값)를 넘습니다. 같은 조건에서 법정 상한을 적용하면 월세는 약 ${capMonthlyMan(
      EX1_CONVERTED_MAN,
    ).toFixed(
      1,
    )}만원이 됩니다. 이 상한은 기존 임대차에서 보증금을 월세로 전환하는 경우에 적용되는 기준입니다.`,
  },
  {
    title: "전세 4억 → 보증금 2억 + 월세 60만",
    desc: "전세 보증금 4억원을, 보증금 2억원 + 월세 60만원으로 전환한 경우",
    inputs: [
      { label: "전세 보증금", value: "40,000만원" },
      { label: "전환 후 보증금", value: "20,000만원" },
      { label: "월세", value: "60만원" },
    ],
    results: [
      { label: "적용 전환율", value: `${EX2_RATE_PCT.toFixed(2)}%`, highlight: true },
      { label: "법정 상한(주택)", value: capLabel },
      { label: "상한 대비", value: EX2_RATE_PCT > CAP_PCT ? "초과" : "이하" },
      {
        label: "상한 적용 시 월세",
        value: `약 ${capMonthlyMan(EX2_CONVERTED_MAN).toFixed(1)}만원`,
      },
    ],
    note: `2억원을 월세로 돌리면서 월 60만원을 받으면 전환율은 ${EX2_RATE_PCT.toFixed(
      1,
    )}%로 법정 상한 이하입니다. 같은 조건에서 상한율(${capLabel})로 단순 환산하면 월세는 약 ${capMonthlyMan(
      EX2_CONVERTED_MAN,
    ).toFixed(1)}만원입니다.`,
  },
];

const FAQ = [
  {
    q: "전월세 전환율은 어떻게 계산하나요?",
    a: "전환율 = (월세 × 12) ÷ (전세 보증금 − 전환 후 보증금) × 100입니다. 예를 들어 전세 3억을 보증금 2억 + 월세 50만원으로 바꾸면, 월세로 돌린 1억원에 대해 (50만 × 12) ÷ 1억 × 100 = 6.0%가 됩니다.",
  },
  {
    q: "법정 전환율 상한은 얼마인가요?",
    a: "주택은 연 10%와 (한국은행 기준금리 + 연 2%) 중 낮은 값이 상한입니다(주택임대차보호법 제7조의2). 현재 기준금리에서는 기준금리 + 2%가 더 낮아 그 값이 상한이 되며, 기준금리가 바뀌면 상한도 함께 바뀝니다. 실제 적용 시에는 계약 시점의 기준금리를 확인해야 합니다.",
  },
  {
    q: "상한을 넘으면 무조건 위법인가요?",
    a: "이 상한은 기존 임대차에서 보증금의 전부 또는 일부를 월세로 전환하는 경우에 적용되는 기준입니다. 이 계산기는 위법 여부를 판단하지 않고, 전환율과 법정 상한을 비교한 사실만 보여주므로 구체적인 상황은 전문가와 확인하세요.",
  },
];

export default function Page() {
  return (
    <Suspense>
      <CalcShell
        title="전월세 전환율 계산기"
        description="전세를 월세로 돌릴 때의 전환율을 계산하고 법정 상한과 비교하세요."
        icon="🔁"
        slug="real-estate/jeonse-wolse-conversion"
        breadcrumb={crumbs}
        calculator={
          <>
            <JeonseWolseConversionCalc />
            <div className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
              <p className="mb-2 text-sm font-bold text-slate-800">
                ⚠️ 기존 임대차의 보증금→월세 전환 기준
              </p>
              <p className="text-sm text-slate-600">
                법정 상한(연 10%와 기준금리 + 2% 중 낮은 값)은 기존 임대차에서 보증금을
                월세로 전환하는 경우에 적용되는 기준입니다. 기준금리가 바뀌면 상한도
                달라지니 계약 시점 기준을 확인하세요.
              </p>
            </div>
          </>
        }
        guide={
          <>
            <h2 className="text-xl font-bold text-slate-900">
              전월세 전환율이란?
            </h2>
            <p>
              전월세 전환율은 전세 보증금의 일부를 월세로 돌릴 때, 그 보증금에 대해
              연 몇 %의 이율로 월세를 매기는지를 나타내는 값입니다. 전환율이 높을수록
              같은 보증금을 줄이는 대가로 내야 하는 월세가 커집니다.
            </p>

            <h2 className="text-xl font-bold text-slate-900">계산 공식</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>전환율 = (월세 × 12) ÷ (전세 보증금 − 전환 후 보증금) × 100</li>
              <li>전환 대상 금액 = 전세 보증금 − 전환 후 보증금 (월세로 돌린 금액)</li>
            </ul>
            <p>
              분모는 실제로 월세로 전환한 보증금이고, 분자는 그에 대한 1년치
              월세입니다. 이 계산기는 &lsquo;월세 vs 전세 계산기&rsquo;(기회비용으로
              어느 쪽이 유리한지 비교)와 달리, 전환에 적용된 이율 자체를 구합니다.
            </p>

            <h2 className="text-xl font-bold text-slate-900">
              법정 상한과의 비교
            </h2>
            <p>
              주택임대차보호법은 전세를 월세로 전환할 때의 이율 상한을{" "}
              <strong>연 10%와 (한국은행 기준금리 + 연 2%) 중 낮은 값</strong>으로 정하고
              있습니다(제7조의2 각 호 중 낮은 비율). 이 상한은 기존 임대차에서 보증금을
              월세로 전환하는 경우에 적용되는 기준입니다. 이 계산기는 계산된 전환율이
              상한을 넘는지 사실만 보여주고, 위법 여부나 유불리는 판단하지 않습니다.
            </p>

            <div className="rounded-2xl bg-blue-50 p-5 text-blue-900">
              <p className="font-bold">함께 확인하면 좋은 것</p>
              <p className="mt-2">
                전세와 월세 중 어느 쪽이 비용 면에서 유리한지는 월세 vs 전세
                계산기에서, 임대 수익률은 부동산 수익률 계산기에서 확인할 수
                있습니다.
              </p>
            </div>
          </>
        }
        examples={EXAMPLES}
        faq={FAQ}
        relatedCalcs={[
          { label: "월세 vs 전세 계산기", href: "/real-estate/jeonse-vs-wolse-calculator", icon: "🏠" },
          { label: "부동산 수익률 계산기", href: "/real-estate/property-yield-calculator", icon: "📊" },
          { label: "취득세 계산기", href: "/real-estate/acquisition-tax-calculator", icon: "🏛️" },
          { label: "전세대출 계산기", href: "/jeonse-loan-calculator", icon: "🏦" },
        ]}
        relatedGuides={[]}
      />
    </Suspense>
  );
}
