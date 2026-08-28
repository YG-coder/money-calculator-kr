// src/app/real-estate/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  slug: "real-estate",
  title: "부동산 계산기 — 취득세·전월세·수익률 등",
  description:
    "부동산 매매·임대 의사결정에 필요한 계산기를 모아뒀습니다. 취득세 계산기, 월세 vs 전세 비교 계산기, 부동산 수익률 계산기를 무료로 이용하세요. 거래 단계별 세금과 비용도 함께 정리했습니다.",
  keywords: [
    "부동산계산기",
    "취득세계산기",
    "전세월세비교",
    "부동산수익률계산기",
    "월세수익률",
  ],
});

const CALCS = [
  {
    title: "취득세 계산기",
    desc: "주택 취득가액과 보유 주택 수를 입력하면 취득세·농특세·지방교육세 합계를 계산합니다.",
    href: "/real-estate/acquisition-tax-calculator",
    icon: "🏠",
  },
  {
    title: "부동산 실투자금 계산기",
    desc: "매매가에 취득세·중개보수·등기비용을 더해 실제로 필요한 현금과 실투자금을 계산합니다.",
    href: "/real-estate/initial-cost-calculator",
    icon: "💰",
  },
  {
    title: "월세 vs 전세 계산기",
    desc: "전세 보증금의 기회비용과 월세 총 비용을 비교해 어떤 선택이 유리한지 계산합니다.",
    href: "/real-estate/jeonse-vs-wolse-calculator",
    icon: "⚖️",
  },
  {
    title: "부동산 수익률 계산기",
    desc: "매입가, 보증금, 월세, 대출 이자, 월 비용을 기준으로 예상 임대수익률을 계산합니다.",
    href: "/real-estate/property-yield-calculator",
    icon: "📈",
  },
  {
    title: "재건축 분담금 계산기",
    desc: "권리가액, 종후자산가액, 비례율 등을 기준으로 예상 재건축 조합원 분담금을 계산합니다.",
    href: "/real-estate/reconstruction-contribution-calculator",
    icon: "🏗️",
  },
  {
    title: "전월세 전환율 계산기",
    desc: "전세를 월세로 돌릴 때 적용된 전환율을 계산하고, 연 10%와 기준금리+2% 중 낮은 법정 상한(주택)과 비교합니다.",
    href: "/real-estate/jeonse-wolse-conversion",
    icon: "🔁",
  },
  {
    title: "공실률 영향 계산기",
    desc: "월세·공실률·운영비로 공실이 임대수입과 순수익을 얼마나 줄이는지, 만실 대비 감소율을 계산합니다.",
    href: "/real-estate/vacancy-impact",
    icon: "🏚️",
  },
];

const FAQ = [
  {
    q: "부동산을 살 때 매매가 외에 어떤 비용이 더 드나요?",
    a: "취득세(농특세·지방교육세 포함), 중개보수, 등기 비용(법무사 수수료·등록면허세), 인지세, 대출 시 근저당 설정비 등이 추가됩니다. 일반적으로 매매가의 수 %가 부대비용으로 발생하므로, 매수 전 취득세 계산기로 세금부터 확인하는 것이 좋습니다.",
  },
  {
    q: "전세와 월세 중 무엇이 유리한가요?",
    a: "전세는 목돈이 묶이는 대신 매달 나가는 비용이 적고, 월세는 보증금 부담이 작은 대신 매달 임대료가 나갑니다. 핵심은 전세 보증금을 다른 곳에 굴렸을 때의 기회비용(또는 전세대출 이자)과 월세를 비교하는 것입니다. 월세 vs 전세 계산기로 실질 비용을 직접 비교할 수 있습니다.",
  },
  {
    q: "임대 수익률은 어떻게 계산하나요?",
    a: "단순 수익률은 (연 임대수입 ÷ 매입가)로 구하지만, 실제로는 대출 이자, 관리비, 재산세 등 비용과 보증금을 반영한 순수익률·자기자본 수익률을 함께 봐야 합니다. 부동산 수익률 계산기는 이 변수들을 반영해 예상 수익률을 계산합니다.",
  },
];

export default function Page() {
  return (
    <>
      <section className="bg-gradient-to-br from-brand-600 via-brand-600 to-brand-700 px-4 py-14 text-white">
        <div className="mx-auto max-w-4xl">
          <nav className="mb-4 flex items-center gap-1.5 text-xs text-brand-300">
            <Link href="/" className="transition-colors hover:text-white">
              홈
            </Link>
            <span>›</span>
            <span className="font-semibold text-white">부동산 계산기</span>
          </nav>

          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-brand-200">
            부동산 의사결정 플랫폼
          </p>

          <h1 className="mb-3 text-3xl font-black leading-tight md:text-4xl">
            부동산 계산기
          </h1>

          <p className="max-w-xl text-base text-brand-100">
            매매·임대·수익률 관련 부동산 계산기를 한 곳에서 이용하세요.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-xl font-black text-slate-800">
          전체 부동산 계산기
        </h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CALCS.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-200 hover:border-brand-200 hover:shadow-md"
            >
              <span className="mb-3 block text-3xl">{c.icon}</span>

              <h2 className="mb-1.5 font-black text-slate-900 transition-colors group-hover:text-brand-600">
                {c.title}
              </h2>

              <p className="text-sm leading-relaxed text-slate-500">{c.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 부동산 자금 흐름 ── */}
      <section className="border-t border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
          <h2 className="mb-2 text-xl font-black text-slate-800">
            부동산 자금 흐름
          </h2>
          <p className="mb-6 text-sm leading-relaxed text-slate-600">
            한도 확인 → 필요 현금 계산 → 수익률 점검 순서로 이어집니다. 각
            계산기의 결과 화면에서 다음 단계로 값을 넘길 수 있습니다.
          </p>

          <ol className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "얼마나 빌릴 수 있나",
                desc: "담보 기준 한도(LTV)와 소득 기준 한도(DSR) 중 낮은 쪽이 실제 한도입니다.",
                href: "/ltv-calculator",
                label: "LTV 계산기",
              },
              {
                step: "2",
                title: "현금은 얼마나 필요한가",
                desc: "취득세·중개보수·등기비용까지 더한 총 필요자금과 실투자금을 계산합니다.",
                href: "/real-estate/initial-cost-calculator",
                label: "실투자금 계산기",
              },
              {
                step: "3",
                title: "수익은 나오나",
                desc: "월세·대출이자·관리비를 반영해 매입가 기준·자기자본 수익률을 봅니다.",
                href: "/real-estate/property-yield-calculator",
                label: "임대수익률 계산기",
              },
            ].map((s) => (
              <li
                key={s.href}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <span className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-sm font-black text-brand-700">
                  {s.step}
                </span>
                <h3 className="mb-1.5 font-black text-slate-900">{s.title}</h3>
                <p className="mb-3 text-sm leading-relaxed text-slate-600">
                  {s.desc}
                </p>
                <Link
                  href={s.href}
                  className="text-sm font-bold text-brand-600 underline underline-offset-2 hover:text-brand-700"
                >
                  {s.label} →
                </Link>
              </li>
            ))}
          </ol>

          <p className="mt-5 text-xs leading-relaxed text-slate-500">
            ※ 넘어온 값은 다음 화면에서 수정할 수 있습니다. 등기비용·방공제처럼
            직접 골라야 하는 항목은 자동으로 선택되지 않습니다.
          </p>
        </div>
      </section>

      {/* ── 부동산 가이드 본문 ── */}
      <section className="border-t border-slate-100 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-14 text-[15px] leading-relaxed text-slate-600 sm:px-6">
          <h2 className="mb-4 text-2xl font-black text-slate-900">
            부동산은 ‘사는 순간’부터 비용이 시작됩니다
          </h2>
          <p className="mb-4">
            부동산 거래에서 매매가만큼 중요한 것이{" "}
            <strong className="text-slate-900">세금과 부대비용</strong>입니다.
            집을 살 때(취득), 보유하는 동안, 팔 때(처분) 단계마다 서로 다른
            세금이 붙고, 임대를 놓는다면 수익률 계산까지 필요합니다. 단계별로
            어떤 비용이 발생하는지 미리 알아두면 예상치 못한 지출을 피할 수
            있습니다.
          </p>
          <p className="mb-8">
            아래 표와 설명은 부동산 거래에서 자주 마주치는 비용 구조를 정리한
            것입니다. 각 항목은 위 계산기와 연결되므로, 개념을 확인한 뒤 본인
            조건으로 바로 계산해 볼 수 있습니다.
          </p>

          <h2 className="mb-4 text-xl font-black text-slate-900">
            거래 단계별 주요 세금
          </h2>
          <div className="mb-8 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border border-slate-200 p-3 text-left">
                    단계
                  </th>
                  <th className="border border-slate-200 p-3 text-left">
                    주요 세금
                  </th>
                  <th className="border border-slate-200 p-3 text-left">
                    설명
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-200 p-3 font-semibold text-slate-800">
                    취득 시
                  </td>
                  <td className="border border-slate-200 p-3">
                    취득세, 농특세, 지방교육세
                  </td>
                  <td className="border border-slate-200 p-3">
                    주택 수·가격대·조정대상지역 여부에 따라 세율이 달라짐
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-200 p-3 font-semibold text-slate-800">
                    보유 시
                  </td>
                  <td className="border border-slate-200 p-3">
                    재산세, 종합부동산세
                  </td>
                  <td className="border border-slate-200 p-3">
                    매년 부과. 공시가격과 보유 주택 수가 기준
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-200 p-3 font-semibold text-slate-800">
                    처분 시
                  </td>
                  <td className="border border-slate-200 p-3">양도소득세</td>
                  <td className="border border-slate-200 p-3">
                    보유 기간·1주택 비과세·장기보유공제에 따라 크게 달라짐
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mb-8 rounded-2xl bg-blue-50 p-5 text-blue-900">
            <p className="font-bold">매수 전 가장 먼저 확인할 것</p>
            <p className="mt-2 text-sm leading-relaxed">
              취득세는 보유 주택 수와 가격대에 따라 세율이 크게 달라집니다. 매수
              결정 전에{" "}
              <Link
                href="/real-estate/acquisition-tax-calculator"
                className="font-bold underline underline-offset-2"
              >
                취득세 계산기
              </Link>
              로 1·2·3주택 기준 세금을 비교해 보세요.
            </p>
          </div>

          <h2 className="mb-4 text-xl font-black text-slate-900">
            전세 vs 월세, 기회비용으로 판단하기
          </h2>
          <p className="mb-8">
            전세와 월세를 단순히 “목돈이 드느냐, 매달 내느냐”로만 비교하면
            정확하지 않습니다. 전세 보증금을 예금·투자에 넣었을 때 얻을 수 있는{" "}
            <strong className="text-slate-900">기회비용</strong>, 또는
            전세대출을 받았을 때의{" "}
            <strong className="text-slate-900">이자 부담</strong>을 월세와
            나란히 놓고 비교해야 실질적인 우위를 알 수 있습니다. 같은 집이라도
            금리 수준에 따라 유리한 선택이 바뀌므로, 계산기로 직접 비교하는 것이
            가장 확실합니다.
          </p>

          <h2 className="mb-4 text-xl font-black text-slate-900">
            임대 수익률, 표면 수익률에 속지 않기
          </h2>
          <p className="mb-8">
            “연 수익률 ○%”라는 표면 숫자만 보면 실제 수익을 과대평가하기
            쉽습니다. 대출 이자, 재산세, 관리비, 공실 위험 등 비용을 빼고
            보증금을 반영한 <strong className="text-slate-900">순수익률</strong>
            과, 실제 투입한 자기자본 대비 수익을 보는{" "}
            <strong className="text-slate-900">
              자기자본 수익률(레버리지 효과)
            </strong>
            을 함께 확인해야 합니다. 부동산 수익률 계산기는 이 변수들을 반영해
            보다 현실적인 수익률을 보여줍니다.
          </p>

          <h2 className="mb-4 text-xl font-black text-slate-900">
            자주 묻는 질문
          </h2>
          <div className="mb-8 space-y-4">
            {FAQ.map((f) => (
              <div
                key={f.q}
                className="rounded-xl border border-slate-200 bg-slate-50 p-5"
              >
                <p className="mb-2 font-bold text-slate-800">Q. {f.q}</p>
                <p className="text-sm leading-relaxed text-slate-600">{f.a}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="mb-2 text-sm font-bold text-slate-800">
              📌 참고 안내
            </p>
            <p className="text-xs leading-relaxed text-slate-500">
              부동산 세제와 규제는 정책에 따라 자주 바뀌며, 조정대상지역
              지정·세율·공제 요건은 시점에 따라 달라질 수 있습니다. 본 페이지의
              설명과 계산 결과는 일반 정보 제공을 목적으로 한 참고용이며, 실제
              세액은 국세청, 한국부동산원 등 공식 기관 자료와 세무 전문가 상담을
              통해 확인하시기 바랍니다. 자세한 사항은{" "}
              <Link
                href="/disclaimer"
                className="text-brand-600 underline underline-offset-2 hover:text-brand-700"
              >
                면책 고지
              </Link>
              를 참고해주세요.
            </p>
          </div>

          <p className="mt-6 text-sm">
            관련 가이드는{" "}
            <Link
              href="/blog/acquisition-tax-guide"
              className="text-brand-600 underline underline-offset-2 hover:text-brand-700"
            >
              취득세 완벽 가이드
            </Link>
            ,{" "}
            <Link
              href="/blog/jeonse-vs-wolse"
              className="text-brand-600 underline underline-offset-2 hover:text-brand-700"
            >
              전세 vs 월세 완벽 분석
            </Link>
            ,{" "}
            <Link
              href="/blog/property-yield-guide"
              className="text-brand-600 underline underline-offset-2 hover:text-brand-700"
            >
              부동산 수익률 계산 방법
            </Link>
            에서 확인할 수 있습니다.
          </p>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-slate-50 py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="mb-1 text-sm font-bold text-slate-800">
              🏦 대출 관련 계산도 함께 확인하세요
            </p>

            <p className="mb-4 text-sm text-slate-500">
              부동산 매매 시 대출이자·원리금·전세대출 등 대출 계산기도 함께
              이용할 수 있습니다.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/loan-interest-calculator"
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800"
              >
                대출이자 계산기 →
              </Link>

              <Link
                href="/jeonse-loan-calculator"
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                전세대출 계산기 →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
