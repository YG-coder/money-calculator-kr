// src/app/loan/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  slug: "loan",
  title: "대출 계산기 — 이자·원리금·전세대출·DSR·중도상환",
  description:
    "대출이자 계산기, 원리금균등·원금균등 상환 계산기, 전세대출 계산기, DSR 계산기, 마이너스통장 이자 계산기, 대환대출 계산기, 금리변동 시뮬레이터, 고정 vs 변동금리 계산기, 중도상환 계산기를 무료로 이용하세요. 상환 방식·금리 유형과 스트레스 DSR까지 한 번에 확인합니다.",
  keywords: [
    "대출계산기",
    "대출이자계산기",
    "원리금균등상환",
    "전세대출계산기",
    "DSR계산기",
    "마이너스통장계산기",
    "대환대출계산기",
    "금리변동계산기",
    "고정금리변동금리",
  ],
});

const LOAN_CALCS = [
  {
    title: "대출이자 계산기",
    desc: "원금·금리·기간을 입력하면 월 이자와 총 이자를 즉시 계산합니다. 만기일시상환 기준.",
    href: "/loan-interest-calculator",
    icon: "🏦",
    badge: "인기",
  },
  {
    title: "원리금상환 계산기",
    desc: "원리금균등·원금균등 방식별 월 납입금과 전체 상환 스케줄을 비교합니다.",
    href: "/amortization-calculator",
    icon: "📊",
    badge: null,
  },
  {
    title: "전세대출 계산기",
    desc: "전세 보증금·금리·LTV를 입력하면 대출 한도, 월 이자, 자기 부담금을 계산합니다.",
    href: "/jeonse-loan-calculator",
    icon: "🏠",
    badge: null,
  },
  {
    title: "중도상환 계산기",
    desc: "중도상환 수수료와 절약 이자를 비교해 지금 갚는 것이 실제로 이득인지 확인합니다.",
    href: "/prepayment-calculator",
    icon: "💸",
    badge: null,
  },
  {
    title: "DSR 계산기",
    desc: "스트레스 DSR을 반영해 현재 DSR과 DSR 기준 추정 가능 대출액을 확인합니다. 수도권·지방 구분 반영.",
    href: "/dsr-calculator",
    icon: "📐",
    badge: null,
  },
  {
    title: "LTV 계산기",
    desc: "주택 가격·지역·보유 상황으로 담보 기준 한도를 계산합니다. 구간별 절대한도와 방공제 차감 반영.",
    href: "/ltv-calculator",
    icon: "📏",
    badge: "신규",
  },
  {
    title: "마이너스통장 계산기",
    desc: "한도가 아니라 실제 사용금액 기준으로 일·월·연 이자와 사용률을 계산합니다.",
    href: "/minus-account-calculator",
    icon: "🟥",
    badge: null,
  },
  {
    title: "대환대출 계산기",
    desc: "대출을 갈아탈 때 총이자 절감액·순절감액·손익분기를 계산합니다. 중도상환수수료 반영.",
    href: "/refinance-calculator",
    icon: "🔄",
    badge: null,
  },
  {
    title: "금리변동 시뮬레이터",
    desc: "금리가 오르면 월 상환액과 총이자가 얼마나 늘어나는지 시나리오별로 계산합니다.",
    href: "/rate-change-simulator",
    icon: "📈",
    badge: null,
  },
  {
    title: "고정 vs 변동금리 계산기",
    desc: "고정과 변동의 총이자를 비교하고 손익분기 금리(교차 지점)를 확인합니다. 판정 없음.",
    href: "/fixed-vs-variable-calculator",
    icon: "⚖️",
    badge: "신규",
  },
];

const FAQ = [
  {
    q: "대출 계산기 결과와 실제 은행 대출액이 왜 다른가요?",
    a: "이 계산기는 표준 공식에 따른 참고용 시뮬레이션입니다. 실제 대출은 신용점수, 소득, DSR·LTV 한도, 우대금리, 부대비용(인지세·근저당 설정비 등)에 따라 달라집니다. 정확한 조건은 금융기관 상담을 통해 확인하세요.",
  },
  {
    q: "어떤 계산기부터 써야 하나요?",
    a: "대출 총비용이 궁금하면 대출이자 계산기, 매달 갚을 금액과 상환 방식이 궁금하면 원리금상환 계산기를 먼저 이용하세요. 소득 대비 대출 원리금 부담과 스트레스 DSR이 궁금하면 DSR 계산기, 한도 중 실제 쓴 금액의 이자가 궁금하면 마이너스통장 계산기, 더 낮은 금리로 갈아탈지 고민이라면 대환대출 계산기, 금리가 오르면 부담이 얼마나 늘지 궁금하면 금리변동 시뮬레이터, 고정과 변동 중 총이자 교차 지점이 궁금하면 고정 vs 변동금리 계산기, 전세 자금이 필요하면 전세대출 계산기, 이미 받은 대출을 미리 갚을지 고민이라면 중도상환 계산기가 적합합니다.",
  },
  {
    q: "고정금리와 변동금리 중 무엇이 유리한가요?",
    a: "정답은 없습니다. 변동금리는 보통 초기 금리가 낮지만 기준금리 변동에 따라 부담이 커질 수 있고, 고정금리는 초기 금리가 다소 높아도 상환액을 예측하기 쉽습니다. 금리 전망과 상환 기간, 본인의 위험 감내 수준을 함께 고려해야 합니다.",
  },
];

export default function Page() {
  return (
    <>
      <section className="bg-gradient-to-br from-brand-600 via-brand-600 to-brand-700 px-4 py-14 text-white">
        <div className="mx-auto max-w-4xl">
          <nav className="mb-4 flex items-center gap-1.5 text-xs text-brand-300">
            <Link href="/" className="hover:text-white transition-colors">
              홈
            </Link>
            <span>›</span>
            <span className="font-semibold text-white">대출 계산기</span>
          </nav>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-brand-200">
            무료 대출 계산기
          </p>
          <h1 className="mb-3 text-3xl font-black leading-tight md:text-4xl">
            대출 계산기
          </h1>
          <p className="max-w-xl text-base text-brand-100">
            이자·상환·전세·DSR·마이너스통장·대환·금리변동·고정vs변동·중도상환까지
            대출 관련 계산기를 한 곳에서 이용하세요.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-xl font-black text-slate-800">
          전체 대출 계산기
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {LOAN_CALCS.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-200 hover:border-brand-200 hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between">
                <span className="text-3xl">{c.icon}</span>
                {c.badge && (
                  <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-700">
                    {c.badge}
                  </span>
                )}
              </div>
              <h3 className="mb-1.5 font-black text-slate-900 transition-colors group-hover:text-brand-600">
                {c.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-500">{c.desc}</p>
            </Link>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-yellow-200 bg-yellow-50 p-5 text-center">
          <p className="mb-2 text-sm font-bold text-slate-800">
            💡 어떤 계산기부터 써야 할지 모르겠다면
          </p>
          <p className="mb-3 text-sm text-slate-600">
            대출 계획이 있다면 대출이자 계산기부터, 상환 방식이 궁금하다면
            원리금상환 계산기를 먼저 이용해보세요.
          </p>
          <Link
            href="/loan-interest-calculator"
            className="inline-block rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
          >
            대출이자 계산기 바로가기 →
          </Link>
        </div>
      </section>

      {/* ── 대출 가이드 본문 ── */}
      <section className="border-t border-slate-100 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-14 text-[15px] leading-relaxed text-slate-600 sm:px-6">
          <h2 className="mb-4 text-2xl font-black text-slate-900">
            대출, 계산부터 시작해야 하는 이유
          </h2>
          <p className="mb-4">
            같은 금액을 빌리더라도{" "}
            <strong className="text-slate-900">금리·상환 방식·기간</strong>에
            따라 매달 갚는 돈과 전체 이자 부담은 크게 달라집니다. 예를 들어 1억
            원을 30년간 빌릴 때, 금리가 0.5%p만 차이 나도 총 이자는 수백만 원
            단위로 벌어집니다. 대출은 한번 실행하면 수년에서 수십 년을 함께 가는
            결정이기 때문에, 계약 전에 숫자를 직접 확인해 보는 것이 가장 확실한
            절약 방법입니다.
          </p>
          <p className="mb-8">
            아래에서는 대출을 받기 전에 알아두면 좋은 핵심 개념을 정리했습니다.
            각 항목은 위 계산기와 직접 연결되므로, 개념을 읽은 뒤 본인 조건을
            넣어 바로 계산해 볼 수 있습니다.
          </p>

          <h2 className="mb-4 text-xl font-black text-slate-900">
            상환 방식 3가지, 무엇이 다를까
          </h2>
          <p className="mb-4">
            대출 상환 방식은 크게 세 가지로 나뉩니다. 같은 금액·금리·기간이라도
            방식에 따라 매달 내는 돈과 총이자가 달라지므로, 본인의 현금 흐름에
            맞는 방식을 고르는 것이 중요합니다.
          </p>

          <div className="mb-6 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border border-slate-200 p-3 text-left">
                    상환 방식
                  </th>
                  <th className="border border-slate-200 p-3 text-left">
                    월 납입액
                  </th>
                  <th className="border border-slate-200 p-3 text-left">
                    총 이자
                  </th>
                  <th className="border border-slate-200 p-3 text-left">
                    특징
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-200 p-3 font-semibold text-slate-800">
                    만기일시상환
                  </td>
                  <td className="border border-slate-200 p-3">매달 이자만</td>
                  <td className="border border-slate-200 p-3">가장 많음</td>
                  <td className="border border-slate-200 p-3">
                    원금은 만기에 한 번에 상환. 단기 자금에 적합
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-200 p-3 font-semibold text-slate-800">
                    원리금균등상환
                  </td>
                  <td className="border border-slate-200 p-3">매달 동일</td>
                  <td className="border border-slate-200 p-3">중간</td>
                  <td className="border border-slate-200 p-3">
                    매달 같은 금액이라 예산 관리가 쉬움. 가장 보편적
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-200 p-3 font-semibold text-slate-800">
                    원금균등상환
                  </td>
                  <td className="border border-slate-200 p-3">
                    초기 많고 점차 감소
                  </td>
                  <td className="border border-slate-200 p-3">가장 적음</td>
                  <td className="border border-slate-200 p-3">
                    초기 부담이 크지만 총이자를 가장 아낄 수 있음
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mb-8 rounded-2xl bg-blue-50 p-5 text-blue-900">
            <p className="font-bold">어떤 방식을 골라야 할까</p>
            <p className="mt-2 text-sm leading-relaxed">
              매달 부담을 일정하게 가져가고 싶다면 <strong>원리금균등</strong>,
              총이자를 최대한 아끼고 초기 부담을 감당할 수 있다면{" "}
              <strong>원금균등</strong>이 유리합니다. 두 방식의 실제 차이는{" "}
              <Link
                href="/amortization-calculator"
                className="font-bold underline underline-offset-2"
              >
                원리금상환 계산기
              </Link>
              에서 직접 비교할 수 있습니다.
            </p>
          </div>

          <h2 className="mb-4 text-xl font-black text-slate-900">
            고정금리 vs 변동금리
          </h2>
          <p className="mb-6">
            <strong className="text-slate-900">고정금리</strong>는 대출 기간
            동안 금리가 변하지 않아 상환액을 예측하기 쉽지만, 초기 금리가
            변동금리보다 다소 높은 경우가 많습니다.
            <strong className="text-slate-900"> 변동금리</strong>는
            기준금리(코픽스 등)에 연동되어 초기 금리가 낮을 수 있지만, 금리가
            오르면 상환 부담이 커집니다. 상환 기간이 길수록 금리 변동 위험에 더
            오래 노출되므로, 금리 전망과 본인의 위험 감내 수준을 함께 고려해야
            합니다.
          </p>

          <h2 className="mb-4 text-xl font-black text-slate-900">
            대출 받기 전 체크리스트
          </h2>
          <ul className="mb-8 list-disc space-y-2 pl-5">
            <li>
              <strong className="text-slate-800">총이자부터 확인</strong> — 월
              납입액만 보지 말고 만기까지의 전체 이자를 계산해 비교하세요.
            </li>
            <li>
              <strong className="text-slate-800">DSR·LTV 한도 확인</strong> —
              소득과 담보 가치에 따라 받을 수 있는 한도가 제한됩니다. 실제
              한도는{" "}
              <Link
                href="/dsr-calculator"
                className="font-semibold text-brand-600 underline underline-offset-2"
              >
                DSR(소득 기준)
              </Link>
              과{" "}
              <Link
                href="/ltv-calculator"
                className="font-semibold text-brand-600 underline underline-offset-2"
              >
                LTV(담보 기준)
              </Link>{" "}
              중 낮은 쪽으로 정해집니다.
            </li>
            <li>
              <strong className="text-slate-800">중도상환 수수료</strong> — 미리
              갚을 계획이 있다면 수수료 면제 시점과 조건을 확인하세요.
            </li>
            <li>
              <strong className="text-slate-800">부대비용</strong> — 인지세,
              근저당 설정비, 보증료 등 금리 외 비용도 총비용에 포함됩니다.
            </li>
            <li>
              <strong className="text-slate-800">우대금리 조건</strong> —
              급여이체·카드실적 등으로 받는 우대금리는 조건 유지 여부에 따라
              달라질 수 있습니다.
            </li>
          </ul>

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
              본 페이지의 계산 결과와 설명은 일반적인 정보 제공을 목적으로 한
              참고용이며, 개인 맞춤 금융 자문이 아닙니다. 대출 한도·금리·규제는
              정책에 따라 수시로 바뀌므로, 실제 대출 조건은 한국은행, 금융감독원
              등 공식 기관 자료와 금융기관 상담을 통해 확인하시기 바랍니다.
              자세한 사항은{" "}
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
            더 자세한 가이드는{" "}
            <Link
              href="/blog/loan-interest-calculation"
              className="text-brand-600 underline underline-offset-2 hover:text-brand-700"
            >
              대출 이자 계산 방법 완벽 정리
            </Link>
            ,{" "}
            <Link
              href="/blog/equal-payment-vs-equal-principal"
              className="text-brand-600 underline underline-offset-2 hover:text-brand-700"
            >
              원리금균등 vs 원금균등
            </Link>
            에서 확인할 수 있습니다.
          </p>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-slate-50 py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="mb-1 text-sm font-bold text-slate-800">
              🏠 부동산 매매 준비 중이신가요?
            </p>
            <p className="mb-4 text-sm text-slate-500">
              취득세 계산기와 월세 vs 전세 비교 계산기도 함께 이용해 보세요.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/real-estate/acquisition-tax-calculator"
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800"
              >
                취득세 계산기 →
              </Link>
              <Link
                href="/real-estate/jeonse-vs-wolse-calculator"
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                월세 vs 전세 계산기 →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
