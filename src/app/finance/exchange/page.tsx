// src/app/finance/exchange/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { buildMetadata, BASE_URL } from "@/lib/metadata";
import CalcShell, { type CalcExample } from "@/components/calculator/CalcShell";
import ExchangeCalc from "@/components/calculator/ExchangeCalc";

export const metadata: Metadata = buildMetadata({
  slug: "finance/exchange",
  title: "환전 계산기 — 우대율 적용 환율과 절약액",
  description:
    "매매기준율과 환전 수수료율을 입력하면 우대율 적용 전후의 적용 환율, 필요 원화, 절약 금액과 실질 환율을 계산합니다. 엔화처럼 100단위로 고시되는 통화도 단위를 반영합니다. 실시간 환율은 연동하지 않습니다.",
  keywords: [
    "환전계산기",
    "환율우대계산",
    "환전수수료계산",
    "매매기준율",
    "엔화환전계산기",
    "달러환전계산기",
  ],
});

const crumbs = [
  { name: "홈", url: BASE_URL },
  { name: "금융 계산기", url: `${BASE_URL}/finance` },
  { name: "환전 계산기", url: `${BASE_URL}/finance/exchange` },
];

const EXAMPLES: CalcExample[] = [
  {
    title: "달러 1,000 · 우대율 90%",
    desc: "매매기준율 1,380원, 환전 수수료율 1.75%, 우대율 90%로 1,000달러를 살 때",
    inputs: [
      { label: "통화·방향", value: "USD · 살 때" },
      { label: "매매기준율", value: "1,380원" },
      { label: "수수료율", value: "1.75%" },
      { label: "우대율", value: "90%" },
    ],
    results: [
      { label: "필요한 원화", value: "1,382,415원", highlight: true },
      { label: "우대 적용 전", value: "1,404,150원" },
      { label: "아낀 금액", value: "21,735원" },
    ],
    note: "우대율 90%는 환율을 90% 깎아주는 것이 아니라 수수료를 90% 깎아주는 것입니다. 수수료율 1.75%가 0.175%로 줄어 적용 환율이 1,404.15원에서 1,382.415원이 됩니다. 매매기준율 1,380원과의 차이 2,415원이 우대 후에도 남는 수수료입니다.",
  },
  {
    title: "엔화 100,000 · 100단위 고시",
    desc: "매매기준율 950원(100엔당), 환전 수수료율 1.75%, 우대율 80%로 10만 엔을 살 때",
    inputs: [
      { label: "통화·방향", value: "JPY · 살 때" },
      { label: "매매기준율", value: "950원 / 100엔" },
      { label: "수수료율", value: "1.75%" },
      { label: "우대율", value: "80%" },
    ],
    results: [
      { label: "필요한 원화", value: "953,325원", highlight: true },
      { label: "실질 환율", value: "9.53325원 / 1엔" },
      { label: "아낀 금액", value: "13,300원" },
    ],
    note: "엔화 매매기준율 950원은 1엔이 아니라 100엔 기준입니다. 고시표의 값을 그대로 입력하면 계산기가 단위를 반영합니다. 이 값을 1엔당 환율로 착각해 9.5원으로 넣으면 결과가 100분의 1로 나옵니다.",
  },
];

const FAQ = [
  {
    q: "왜 환율을 직접 입력해야 하나요?",
    a: "이 계산기는 실시간 환율을 연동하지 않기 때문입니다. 환율은 하루에도 여러 번 바뀌므로 화면에 미리 넣어둔 값은 곧 과거 값이 됩니다. 근거 없는 기본 환율로 계산해 실제와 다른 금액을 보여주는 것보다, 거래하려는 은행이 고시한 오늘의 매매기준율을 직접 입력받는 편이 정확합니다. 매매기준율은 각 은행 앱이나 홈페이지의 고시환율 화면에서 확인할 수 있습니다.",
  },
  {
    q: "환전 수수료율은 왜 미리 채워져 있지 않나요?",
    a: "수수료율(스프레드)은 은행·통화·상품·거래 채널에 따라 다르고, 모든 은행에 공통으로 적용되는 검증된 값이 없기 때문입니다. 대략적인 평균값을 기본으로 넣으면 사용자가 손대지 않았을 때 근거 없는 수수료가 조용히 계산에 들어갑니다. 고시환율표의 '환전 수수료율'을 확인해 입력하거나, 수수료율 대신 '현찰 살 때' 환율을 알고 있다면 입력 방식을 바꿔 그 값으로 넣으면 됩니다.",
  },
  {
    q: "환율 우대 90%면 환율이 90% 싸지는 건가요?",
    a: "아닙니다. 우대율은 환율이 아니라 환전 수수료를 깎아주는 비율입니다. 매매기준율 1,380원에 수수료율 1.75%인 경우 현찰 살 때 환율은 1,404.15원인데, 우대율 90%를 받으면 수수료율이 0.175%로 줄어 적용 환율이 1,382.415원이 됩니다. 우대율 100%를 받아야 매매기준율 그대로 환전하게 되며, 그 아래로는 항상 일부 수수료가 남습니다.",
  },
  {
    q: "엔화나 베트남 동은 왜 단위가 다른가요?",
    a: "일본 엔(JPY), 인도네시아 루피아(IDR), 베트남 동(VND), 캄보디아 리엘(KHR)은 국내 은행에서 100단위로 고시됩니다. 화폐 단위당 원화 금액이 작아 100단위로 묶어 표시하는 관행입니다. 이 계산기는 고시표에 적힌 값을 그대로 입력받아 단위를 자동으로 반영하므로, 1단위 환율로 직접 환산해 넣지 마세요.",
  },
  {
    q: "계산 결과와 은행에서 실제로 환전한 금액이 다른 이유는?",
    a: "환율은 거래 시점에 계속 바뀌고, 은행마다 최소 환전 금액·통화별 우대 한도·채널별 우대율 차이가 있기 때문입니다. 또 이 계산기는 현찰 환전을 기준으로 하며, 송금 보내실 때·받으실 때 환율, 여행자수표, 카드 해외결제 환율은 다루지 않습니다. 결과는 입력값 기준의 예상 금액으로만 참고하세요.",
  },
];

export default function Page() {
  return (
    <Suspense>
      <CalcShell
        title="환전 계산기"
        description="매매기준율과 수수료율을 입력하면 우대율 적용 전후의 환율과 절약 금액을 확인할 수 있습니다."
        icon="💱"
        slug="finance/exchange"
        breadcrumb={crumbs}
        calculator={<ExchangeCalc />}
        examples={EXAMPLES}
        faq={FAQ}
        guide={
          <>
            <h2 className="text-xl font-bold text-slate-900">
              고시환율의 세 가지 숫자
            </h2>
            <p>
              은행 고시환율표에는 보통 세 종류의 숫자가 함께 나옵니다.
              <strong> 매매기준율</strong>은 은행이 수수료를 붙이기 전의 기준
              환율이고, <strong>현찰 살 때</strong>는 여기에 수수료를 더한 값,
              <strong> 현찰 파실 때</strong>는 수수료를 뺀 값입니다. 살 때가
              비싸고 팔 때가 싼 이유가 이것이며, 그 차이가 곧 환전 수수료입니다.
            </p>

            <div className="my-4 overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full min-w-[420px] text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">구분</th>
                    <th className="px-4 py-3 text-right font-semibold">
                      계산식
                    </th>
                    <th className="px-4 py-3 text-right font-semibold">
                      예 (1,200원 · 1.75%)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-4 py-3">매매기준율</td>
                    <td className="px-4 py-3 text-right text-slate-500">
                      기준
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      1,200원
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">현찰 살 때</td>
                    <td className="px-4 py-3 text-right text-slate-500">
                      기준 × (1 + 수수료율)
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      1,221원
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">현찰 파실 때</td>
                    <td className="px-4 py-3 text-right text-slate-500">
                      기준 × (1 − 수수료율)
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      1,179원
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              우대율은 환율이 아니라 수수료를 깎는다
            </h2>
            <p>
              환율 우대율은 <strong>수수료에 적용되는 할인율</strong>입니다. 위
              예에서 수수료는 21원인데, 우대율 50%를 받으면 수수료가 10.5원으로
              줄어 적용 환율이 1,210.5원이 됩니다. 우대율 100%를 받으면 수수료가
              0이 되어 매매기준율 1,200원 그대로 환전합니다. 우대율이 아무리
              높아도 매매기준율보다 유리해지지는 않습니다.
            </p>

            <h2 className="text-xl font-bold text-slate-900">
              100단위로 고시되는 통화
            </h2>
            <p>
              일본 엔(JPY), 인도네시아 루피아(IDR), 베트남 동(VND), 캄보디아
              리엘(KHR)은 <strong>100단위</strong>로 고시됩니다. 엔화 고시환율
              &lsquo;950원&rsquo;은 1엔이 아니라 100엔 값입니다. 이 계산기는
              고시표의 값을 그대로 입력받아 단위를 반영하므로 직접 100으로 나눠
              넣을 필요가 없습니다.
            </p>

            <h2 className="text-xl font-bold text-slate-900">
              이 계산기가 하지 않는 것
            </h2>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <strong>실시간 환율 연동</strong> — 환율은 사용자가 입력한 값만
                사용합니다. 기본 환율을 심어두지 않습니다.
              </li>
              <li>
                <strong>은행별 수수료율·우대율 자동 적용</strong> —
                은행·통화·상품마다 달라 공통값을 두지 않습니다.
              </li>
              <li>
                <strong>송금·카드 결제 환율</strong> — 현찰 환전 기준입니다.
              </li>
            </ul>
            <p>
              결과는 입력값을 기준으로 한 예상 금액입니다. 실제 환전 금액은 거래
              시점의 고시환율과 은행 조건에 따라 달라집니다.
            </p>
          </>
        }
        relatedCalcs={[
          {
            label: "실질금리 계산기",
            href: "/finance/real-interest-rate",
            icon: "📉",
          },
          {
            label: "인플레이션 계산기",
            href: "/finance/inflation",
            icon: "💸",
          },
          { label: "예금 이자 계산기", href: "/finance/deposit", icon: "🏦" },
          { label: "복리 계산기", href: "/finance/compound", icon: "📈" },
        ]}
        relatedGuides={[]}
      />
    </Suspense>
  );
}
