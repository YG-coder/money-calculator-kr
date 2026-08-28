// src/app/finance/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  slug: "finance",
  title: "금융 계산기 — 예금·적금 이자와 복리 계산",
  description:
    "예금 이자 계산기, 적금 이자 계산기, 복리 계산기, 예금 vs 적금·CMA vs 예금·단리 vs 복리 비교 계산기, 실질금리·인플레이션 계산기, 환전 계산기를 무료로 이용하세요. 세전·세후 이자와 만기 수령액, 물가를 반영한 실질금리와 구매력 변화까지 한 곳에서 확인합니다.",
  keywords: [
    "금융계산기",
    "예금이자계산기",
    "적금이자계산기",
    "복리계산기",
    "저축계산기",
    "예금적금비교",
    "CMA예금비교",
    "실질금리계산기",
    "인플레이션계산기",
    "단리복리계산기",
    "환전계산기",
    "환율우대계산",
  ],
});

const FINANCE_CALCS = [
  {
    title: "예금 이자 계산기",
    desc: "예치금·금리·기간을 입력해 세전 이자, 세금, 세후 이자와 만기 수령액을 계산합니다.",
    href: "/finance/deposit",
    icon: "🏦",
    badge: "추천",
  },
  {
    title: "적금 이자 계산기",
    desc: "월 납입액·금리·기간으로 총 납입액, 예상 이자, 세금과 만기 수령액을 계산합니다.",
    href: "/finance/installment-savings",
    icon: "🪙",
    badge: "신규",
  },
  {
    title: "복리 계산기",
    desc: "초기 원금과 월 추가 납입을 기준으로 기간별 복리 증가액과 최종 예상 금액을 계산합니다.",
    href: "/finance/compound",
    icon: "📈",
    badge: null,
  },
  {
    title: "목표 저축 계산기",
    desc: "목표 금액·월 납입액·기간 중 둘을 정하면 나머지를 계산해 저축 계획을 세웁니다.",
    href: "/finance/goal-savings",
    icon: "🎯",
    badge: null,
  },
  {
    title: "예금 vs 적금 계산기",
    desc: "같은 금리인데 왜 적금 이자가 적은지, 세후 이자와 총 납입액 대비 이자율·이자 배수로 비교합니다.",
    href: "/finance/deposit-vs-savings",
    icon: "⚖️",
    badge: null,
  },
  {
    title: "CMA vs 예금 계산기",
    desc: "예금 금리와 CMA 예상수익률을 같은 조건으로 넣어 세후 수령액을 비교합니다. CMA는 확정금리 아님.",
    href: "/finance/cma-vs-deposit",
    icon: "⚖️",
    badge: null,
  },
  {
    title: "실질금리 계산기",
    desc: "예금 금리에서 물가상승률을 반영한 실질금리를 계산합니다. 구매력이 실제로 얼마나 느는지 확인.",
    href: "/finance/real-interest-rate",
    icon: "📉",
    badge: null,
  },
  {
    title: "인플레이션 계산기",
    desc: "물가가 오를 때 현재 금액의 미래 구매력과 감소율, 동일 구매력에 필요한 금액을 계산합니다.",
    href: "/finance/inflation",
    icon: "💸",
    badge: null,
  },
  {
    title: "단리 vs 복리 계산기",
    desc: "같은 원금·금리·기간에서 단리와 월복리의 최종 금액 차이를 연차별로 비교합니다.",
    href: "/finance/simple-vs-compound",
    icon: "📈",
    badge: null,
  },
  {
    title: "환전 계산기",
    desc: "매매기준율과 수수료율을 입력해 우대율 적용 전후의 환율과 절약액을 계산합니다. 실시간 환율은 연동하지 않습니다.",
    href: "/finance/exchange",
    icon: "💱",
    badge: "신규",
  },
];

const FAQ = [
  {
    q: "표시 금리가 같으면 예금과 적금 이자도 같나요?",
    a: "아닙니다. 예금은 목돈 전체가 예치 기간 내내 이자를 받지만, 적금은 매달 나눠 넣어 납입 회차마다 예치 기간이 다릅니다. 그래서 같은 표시 금리라도 적금의 총 이자는 예금보다 작게 느껴질 수 있습니다.",
  },
  {
    q: "적금 이자는 왜 생각보다 적나요?",
    a: "첫 달 납입금은 만기까지 오래 예치되어 이자를 많이 받지만, 마지막 달 납입금은 한 달치 이자만 받기 때문입니다. 모든 납입금이 처음부터 만기까지 예치되는 것이 아니라는 점이 핵심입니다.",
  },
  {
    q: "일반과세와 비과세는 어떻게 다른가요?",
    a: "일반과세는 이자에서 이자소득세 15.4%(소득세 14% + 지방소득세 1.4%)가 원천징수됩니다. 비과세는 비과세종합저축 등 법령이 정한 자격·상품 조건을 충족한 경우에만 적용되며, 누구나 임의로 선택하는 옵션이 아닙니다.",
  },
  {
    q: "계산 결과와 은행의 실제 만기 금액이 다른 이유는 무엇인가요?",
    a: "이 계산기들은 표준 공식에 따른 참고용 예상치입니다. 실제 지급액은 납입일·만기일·일수 계산, 우대금리 충족 여부, 중도해지, 세금의 원 단위 처리 방식에 따라 달라질 수 있습니다.",
  },
  {
    q: "복리 주기가 짧을수록 항상 유리한가요?",
    a: "같은 명목 금리라면 복리 횟수가 많을수록 최종 금액이 조금 더 커집니다. 다만 실제 상품에서는 명목 금리와 조건을 함께 봐야 하며, 복리 계산기는 월복리를 기준으로 합니다.",
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
            <span className="font-semibold text-white">금융 계산기</span>
          </nav>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-brand-200">
            무료 금융 계산기
          </p>
          <h1 className="mb-3 text-3xl font-black leading-tight md:text-4xl">
            금융 계산기
          </h1>
          <p className="max-w-xl text-base text-brand-100">
            예금·적금의 세전·세후 이자와 복리 효과를 계산하고, 저축 방식에 따른
            만기 수령액을 비교해 보세요.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-xl font-black text-slate-800">
          전체 금융 계산기
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FINANCE_CALCS.map((c) => (
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
            목돈을 한 번에 넣는다면 예금 계산기, 매달 일정 금액을 넣는다면 적금
            계산기, 장기간 재투자 효과를 보고 싶다면 복리 계산기를 이용하세요.
          </p>
          <Link
            href="/finance/deposit"
            className="inline-block rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
          >
            예금 이자 계산기 바로가기 →
          </Link>
        </div>
      </section>

      {/* ── 금융 가이드 본문 ── */}
      <section className="border-t border-slate-100 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-14 text-[15px] leading-relaxed text-slate-600 sm:px-6">
          <h2 className="mb-4 text-2xl font-black text-slate-900">
            예금·적금·복리, 무엇을 언제 쓸까
          </h2>
          <p className="mb-4">
            같은 금리라도 돈을 넣는 방식에 따라 실제 이자는 달라집니다. 이미
            목돈이 있다면 <strong className="text-slate-900">예금</strong>, 매달
            일정 금액을 모으는 중이라면{" "}
            <strong className="text-slate-900">적금</strong>, 이자를 다시 굴리는
            장기 효과가 궁금하다면{" "}
            <strong className="text-slate-900">복리</strong> 계산기가 맞습니다.
            아래 표로 내 상황에 맞는 계산기를 먼저 골라 보세요.
          </p>

          <div className="mb-8 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border border-slate-200 p-3 text-left">
                    구분
                  </th>
                  <th className="border border-slate-200 p-3 text-left">
                    예금
                  </th>
                  <th className="border border-slate-200 p-3 text-left">
                    적금
                  </th>
                  <th className="border border-slate-200 p-3 text-left">
                    복리
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-200 p-3 font-semibold text-slate-800">
                    넣는 방식
                  </td>
                  <td className="border border-slate-200 p-3">
                    목돈 일시 예치
                  </td>
                  <td className="border border-slate-200 p-3">
                    매월 일정 금액 납입
                  </td>
                  <td className="border border-slate-200 p-3">
                    원금·이자 반복 재투자
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-200 p-3 font-semibold text-slate-800">
                    적합한 상황
                  </td>
                  <td className="border border-slate-200 p-3">
                    이미 목돈이 있음
                  </td>
                  <td className="border border-slate-200 p-3">
                    매월 저축 가능
                  </td>
                  <td className="border border-slate-200 p-3">
                    장기간 자산 증식
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-200 p-3 font-semibold text-slate-800">
                    핵심 입력값
                  </td>
                  <td className="border border-slate-200 p-3">
                    원금·금리·기간
                  </td>
                  <td className="border border-slate-200 p-3">
                    월 납입액·금리·기간
                  </td>
                  <td className="border border-slate-200 p-3">
                    원금·금리·기간·추가 납입
                  </td>
                </tr>
                <tr>
                  <td className="border border-slate-200 p-3 font-semibold text-slate-800">
                    이자 특징
                  </td>
                  <td className="border border-slate-200 p-3">
                    전체 원금에 기간 적용
                  </td>
                  <td className="border border-slate-200 p-3">
                    회차별 예치기간이 다름
                  </td>
                  <td className="border border-slate-200 p-3">
                    이자에 다시 이자
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="mb-4 text-xl font-black text-slate-900">
            예금과 적금의 차이
          </h2>
          <p className="mb-6">
            예금은 목돈을 한 번에 넣어 전체 금액이 만기까지 이자를 받습니다.
            반면 적금은 매달 나눠 넣기 때문에, 표시 금리가 같아도 이자액은 같지
            않습니다. 첫 달 납입금만 전체 기간의 이자를 받고 마지막 달 납입금은
            한 달치 이자만 받으므로, 적금 이자는 ‘총 납입액 × 금리’로 단순
            계산한 값의 절반가량이 됩니다. 예를 들어 월 50만 원씩 1년, 연 4%라면
            이자는 24만 원이 아니라 약 13만 원입니다.
          </p>

          <h2 className="mb-4 text-xl font-black text-slate-900">
            세전 금리와 세후 수령액
          </h2>
          <p className="mb-6">
            은행에서 보는 연 3.5% 같은 금리는 보통 세전입니다. 일반과세 상품은
            이자에서 이자소득세 15.4%(소득세 14% + 지방소득세 1.4%)가
            원천징수되므로, 실제 손에 쥐는 금액은 세전보다 줄어듭니다. 그래서 각
            계산기는 세전 이자, 세금, 세후 이자, 만기 수령액을 분리해 보여
            줍니다. 비과세는 비과세종합저축 등 법령이 정한 자격·상품 조건을
            충족해야 적용되며, 누구나 임의로 선택하는 옵션이 아닙니다.
          </p>

          <h2 className="mb-4 text-xl font-black text-slate-900">
            단리와 복리
          </h2>
          <p className="mb-6">
            단리는 원금에만 이자가 붙고, 복리는 발생한 이자가 원금에 더해져 다음
            이자 계산에 포함됩니다. 기간이 짧거나 금리가 낮으면 둘의 차이는
            작지만, 기간이 길수록 복리 효과가 커집니다. 예금 계산기에서는
            기본적으로 단리를 사용하되 상품 조건에 따라 월복리를 비교할 수 있고,
            복리 계산기에서는 장기 재투자 효과를 세전 기준으로 가늠할 수
            있습니다.
          </p>

          <h2 className="mb-4 text-xl font-black text-slate-900">
            저축상품 선택 체크리스트
          </h2>
          <ul className="mb-8 list-disc space-y-2 pl-5">
            <li>
              <strong className="text-slate-800">기본금리 vs 우대금리</strong> —
              표시 금리가 기본금리인지, 급여이체·자동이체 등 조건을 채워야 받는
              우대금리 포함인지 확인하세요.
            </li>
            <li>
              <strong className="text-slate-800">세전 vs 세후</strong> — 광고
              금리는 세전인 경우가 많습니다. 세후 실수령 기준으로 비교하세요.
            </li>
            <li>
              <strong className="text-slate-800">중도해지 이율</strong> — 만기
              전 해지하면 약정 금리가 아닌 낮은 중도해지 이율이 적용됩니다.
            </li>
            <li>
              <strong className="text-slate-800">납입 한도·자동이체일</strong> —
              월 납입 한도가 있는지, 자동이체 날짜에 따라 적금 이자가 달라질 수
              있는지 확인하세요.
            </li>
            <li>
              <strong className="text-slate-800">예금자보호</strong> — 원금과
              소정의 이자를 합해 금융회사별 1인당 1억 원까지 보호되는 상품인지
              확인하세요.
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
              참고용이며, 개인 맞춤 금융 자문이 아닙니다. 금리·세율·예금자보호
              한도는 정책에 따라 바뀔 수 있으므로, 실제 상품 조건과 최신 기준은
              은행연합회 소비자포털, 저축은행중앙회, 한국은행, 국세청,
              예금보험공사 등 공식 자료와 금융기관 안내로 확인하시기 바랍니다.
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
        </div>
      </section>

      <section className="border-t border-slate-100 bg-slate-50 py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="mb-1 text-sm font-bold text-slate-800">
              💸 대출이나 부동산도 함께 계산해 보세요
            </p>
            <p className="mb-4 text-sm text-slate-500">
              대출이자·원리금 계산기와 취득세·전세 계산기도 한 곳에서 이용할 수
              있습니다.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/loan"
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800"
              >
                대출 계산기 →
              </Link>
              <Link
                href="/real-estate"
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                부동산 계산기 →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
