// src/app/ltv-calculator/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { buildMetadata } from "@/lib/metadata";
import CalcShell, { type CalcExample } from "@/components/calculator/CalcShell";
import LtvCalc from "@/components/calculator/LtvCalc";

export const metadata: Metadata = buildMetadata({
  slug: "ltv-calculator",
  title: "LTV 계산기 — 주택담보대출 담보 기준 한도",
  description:
    "주택 가격과 지역·주택 보유 상황을 입력하면 적용 LTV와 담보 기준 추정 한도를 계산합니다. 주택가격 구간별 절대한도(6억·4억·2억)와 선순위 채권·방공제 차감을 반영하며, 소득 기준 한도(DSR)는 반영하지 않습니다.",
  keywords: ["LTV계산기", "주택담보대출한도", "담보인정비율", "주담대한도계산", "LTV DSR"],
});

const EXAMPLES: CalcExample[] = [
  {
    title: "규제지역 무주택 · 20억 주택",
    desc: "서울 20억 아파트, 무주택, 선순위 없음, 방공제 5,500만원",
    inputs: [
      { label: "주택 가격", value: "200,000만원" },
      { label: "지역", value: "규제지역" },
      { label: "보유 상황", value: "무주택" },
      { label: "방공제", value: "5,500만원" },
    ],
    results: [
      { label: "적용 LTV", value: "40%" },
      { label: "담보인정액", value: "800,000,000원" },
      { label: "− 방공제", value: "55,000,000원" },
      { label: "차감 후", value: "745,000,000원" },
      { label: "절대한도 (15~25억 구간)", value: "400,000,000원" },
      { label: "담보 기준 한도", value: "4억", highlight: true },
      { label: "필요 자기자금", value: "16억" },
    ],
    note: "차감 후 금액(7.45억)보다 주택가격 구간별 절대한도(4억)가 낮아 한도를 결정합니다. 수도권·규제지역에서는 LTV보다 이 절대한도가 먼저 걸리는 경우가 많습니다.",
  },
  {
    title: "비수도권 생애최초 · 6억 주택",
    desc: "지방 6억 아파트, 생애최초, 선순위 없음, 방공제 2,500만원",
    inputs: [
      { label: "주택 가격", value: "60,000만원" },
      { label: "지역", value: "비수도권" },
      { label: "보유 상황", value: "생애최초" },
      { label: "방공제", value: "2,500만원" },
    ],
    results: [
      { label: "적용 LTV", value: "80%" },
      { label: "담보인정액", value: "480,000,000원" },
      { label: "− 방공제", value: "25,000,000원" },
      { label: "차감 후", value: "455,000,000원" },
      { label: "절대한도", value: "미적용" },
      { label: "담보 기준 한도", value: "4.6억", highlight: true },
      { label: "필요 자기자금", value: "1.5억" },
    ],
    note: "비수도권 비규제지역에는 주택가격 구간별 절대한도가 적용되지 않습니다. 생애최초 LTV도 수도권·규제지역(70%)보다 높은 80%입니다. 요약 카드는 억 단위로 반올림해 표시하며, 정확한 금액은 계산 과정에서 원 단위로 확인할 수 있습니다.",
  },
];

const FAQ = [
  {
    q: "LTV 한도와 DSR 한도 중 어느 것이 실제 한도인가요?",
    a: "둘 다 적용됩니다. LTV는 담보 기준, DSR은 소득 기준의 규제상 한도입니다. 두 기준을 모두 충족해야 하며 실제 승인 금액은 금융회사의 심사 결과에 따라 더 낮을 수 있습니다. 이 계산기는 담보 축만 계산하므로 소득 기준 한도는 DSR 계산기에서 함께 확인하세요. 승인 금액은 소득 인정 방식, 기존 부채 산정 방식, 담보 평가액, 상품별 한도에 따라서도 달라집니다.",
  },
  {
    q: "방공제 금액을 왜 직접 입력하나요?",
    a: "방공제(소액임차보증금 공제)의 지역별 법정 금액은 주택임대차보호법 시행령으로 정해져 있지만, 몇 건을 공제할지는 주택 유형과 금융회사 내규에 따라 달라집니다. 공동주택은 통상 1건이지만 단독·다가구는 다르고, 은행별로도 차이가 있습니다. 계산기가 확인되지 않은 규칙으로 건수를 정하면 틀린 한도를 보여주게 되므로, 금액을 직접 입력받고 법정 금액은 참고값으로만 제공합니다. MCI·MCG 가입 등으로 공제하지 않는 경우에는 '공제하지 않음'을 선택하세요.",
  },
  {
    q: "우리 지역이 규제지역인지 어떻게 확인하나요?",
    a: "규제지역(조정대상지역·투기과열지구) 지정은 국토교통부 고시로 정해지며, 고시 후 1~2일 만에 효력이 발생합니다. 2026년 7월 1일 기준으로는 서울 25개 자치구 전역과 경기 15곳(과천·광명·성남 분당수정중원·수원 영통장안팔달·안양 동안·용인 수지·의왕·하남·화성 동탄·용인 기흥·구리)이 지정되어 있습니다. 최신 현황은 국토교통부 실거래가 공개시스템의 규제지역 안내에서 확인하세요.",
  },
  {
    q: "주택가격 구간별 절대한도는 어디에 적용되나요?",
    a: "수도권과 규제지역에만 적용됩니다. 15억원 이하 6억원, 15억 초과 25억 이하 4억원, 25억 초과 2억원이며, LTV 한도와 중첩됩니다. 비수도권 비규제지역에는 이 한도가 없어 LTV 비율만 적용됩니다.",
  },
];

export default function Page() {
  return (
    <Suspense>
      <CalcShell
        title="LTV 계산기"
        description="주택 가격과 지역·보유 상황으로 담보 기준 대출 한도를 계산하세요."
        icon="📏"
        slug="ltv-calculator"
        calculator={<LtvCalc />}
        guide={
          <>
            <h2 className="text-xl font-bold text-slate-900">LTV란?</h2>
            <p>
              LTV(Loan To Value, 담보인정비율)는 주택 가격 대비 대출 가능 금액의 비율입니다.
              같은 소득이라도 주택 가격·지역·주택 보유 상황에 따라 받을 수 있는 금액이
              달라집니다. LTV가 <strong>담보 기준 한도</strong>라면, DSR은{" "}
              <strong>소득 기준 한도</strong>입니다. 두 기준을 모두 충족해야 하며, 실제
                  승인 한도는 금융회사 심사·담보평가·상품별 한도 등에 따라 두 계산
                  결과보다 낮을 수 있습니다.
            </p>

            <h2 className="text-xl font-bold text-slate-900">계산 공식</h2>
            <p>
              LTV는 대출금액만이 아니라 선순위채권과 임차보증금·최우선변제금을 모두 분자에
              놓고 계산합니다. 이를 대출금액에 대해 정리하면 다음과 같습니다.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>담보인정액 = 주택 가격 × 적용 LTV</li>
              <li>차감 후 = 담보인정액 − 선순위채권 − 방공제</li>
              <li>
                담보 기준 한도 = <strong>차감 후와 절대한도 중 낮은 값</strong> (최소 0)
              </li>
            </ul>
            <p>
              절대한도는 차감을 마친 <strong>실행 대출액</strong>에 걸립니다. 차감 전
              담보인정액에 먼저 씌우는 것이 아닙니다.
            </p>

            <h2 className="text-xl font-bold text-slate-900">지역·보유 상황별 LTV</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="border border-slate-200 p-3 text-left">구분</th>
                    <th className="border border-slate-200 p-3">규제지역</th>
                    <th className="border border-slate-200 p-3">수도권 비규제</th>
                    <th className="border border-slate-200 p-3">비수도권</th>
                  </tr>
                </thead>
                <tbody className="text-center">
                  <tr>
                    <td className="border border-slate-200 p-3 text-left font-semibold text-slate-800">
                      무주택 (처분조건부 1주택 포함)
                    </td>
                    <td className="border border-slate-200 p-3">40%</td>
                    <td className="border border-slate-200 p-3">70%</td>
                    <td className="border border-slate-200 p-3">70%</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 p-3 text-left font-semibold text-slate-800">
                      생애최초
                    </td>
                    <td className="border border-slate-200 p-3">70%</td>
                    <td className="border border-slate-200 p-3">70%</td>
                    <td className="border border-slate-200 p-3">80%</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 p-3 text-left font-semibold text-slate-800">
                      유주택 (1주택 비처분·다주택)
                    </td>
                    <td className="border border-slate-200 p-3">0%</td>
                    <td className="border border-slate-200 p-3">0%</td>
                    <td className="border border-slate-200 p-3">60%</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 p-3 text-left font-semibold text-slate-800">
                      주택가격 구간별 절대한도
                    </td>
                    <td className="border border-slate-200 p-3">적용</td>
                    <td className="border border-slate-200 p-3">적용</td>
                    <td className="border border-slate-200 p-3">미적용</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-xl font-bold text-slate-900">방공제</h2>
            <p>
              방공제는 소액임차인의 최우선변제금만큼 담보 여력에서 미리 빼두는 것입니다.
              지역별 법정 금액은 주택임대차보호법 시행령으로 정해져 있지만{" "}
              <strong>몇 건을 공제할지는 주택 유형과 금융회사 내규에 따라 다릅니다</strong>.
              그래서 이 계산기는 건수를 자동으로 정하지 않고 금액을 직접 입력받습니다.
            </p>

            <div className="rounded-2xl bg-blue-50 p-5 text-blue-900">
              <p className="font-bold">이 계산기가 반영하지 않는 것</p>
              <p className="mt-2">
                DSR·DTI, 서민·실수요자 우대, 정책대출(디딤돌·보금자리론), 생활안정자금 목적
                대출, 후순위·추가담보대출, 전세대출, 비주택 담보는 규제 체계가 달라 반영하지
                않습니다. 해당하는 경우 금융회사에 직접 확인하세요.
              </p>
            </div>
          </>
        }
        examples={EXAMPLES}
        faq={FAQ}
        relatedCalcs={[
          { label: "DSR 계산기 (소득 기준 한도)", href: "/dsr-calculator", icon: "📉" },
          { label: "원리금상환 계산기", href: "/amortization-calculator", icon: "📊" },
          { label: "대출이자 계산기", href: "/loan-interest-calculator", icon: "🏦" },
          { label: "전세대출 계산기", href: "/jeonse-loan-calculator", icon: "🏠" },
        ]}
        relatedGuides={[
          { label: "대출 이자 계산 방법 완벽 정리", href: "/blog/loan-interest-calculation" },
        ]}
      />
    </Suspense>
  );
}
