// src/components/layout/Footer.tsx

import Link from "next/link";

const LOAN_LINKS = [
  { label: "대출이자 계산기", href: "/loan-interest-calculator" },
  { label: "원리금상환 계산기", href: "/amortization-calculator" },
  { label: "전세대출 계산기", href: "/jeonse-loan-calculator" },
  { label: "중도상환 계산기", href: "/prepayment-calculator" },
  { label: "DSR 계산기", href: "/dsr-calculator" },
  { label: "LTV 계산기", href: "/ltv-calculator" },
  { label: "마이너스통장 계산기", href: "/minus-account-calculator" },
  { label: "대환대출 계산기", href: "/refinance-calculator" },
  { label: "금리변동 시뮬레이터", href: "/rate-change-simulator" },
  { label: "고정 vs 변동 계산기", href: "/fixed-vs-variable-calculator" },
];

const REALESTATE_LINKS = [
  { label: "취득세 계산기", href: "/real-estate/acquisition-tax-calculator" },
  { label: "실투자금 계산기", href: "/real-estate/initial-cost-calculator" },
  {
    label: "월세 vs 전세 계산기",
    href: "/real-estate/jeonse-vs-wolse-calculator",
  },
  {
    label: "부동산 수익률 계산기",
    href: "/real-estate/property-yield-calculator",
  },
  {
    label: "재건축 분담금 계산기",
    href: "/real-estate/reconstruction-contribution-calculator",
  },
  {
    label: "전월세 전환율 계산기",
    href: "/real-estate/jeonse-wolse-conversion",
  },
  { label: "공실률 영향 계산기", href: "/real-estate/vacancy-impact" },
];

const FINANCE_LINKS = [
  { label: "예금 이자 계산기", href: "/finance/deposit" },
  { label: "적금 이자 계산기", href: "/finance/installment-savings" },
  { label: "복리 계산기", href: "/finance/compound" },
  { label: "목표 저축 계산기", href: "/finance/goal-savings" },
  { label: "예금 vs 적금 계산기", href: "/finance/deposit-vs-savings" },
  { label: "CMA vs 예금 계산기", href: "/finance/cma-vs-deposit" },
  { label: "실질금리 계산기", href: "/finance/real-interest-rate" },
  { label: "인플레이션 계산기", href: "/finance/inflation" },
  { label: "단리 vs 복리 계산기", href: "/finance/simple-vs-compound" },
  { label: "환전 계산기", href: "/finance/exchange" },
];

const INFO_LINKS = [
  { label: "소개", href: "/about" },
  { label: "금융 가이드", href: "/blog" },
  { label: "면책 고지", href: "/disclaimer" },
  { label: "개인정보처리방침", href: "/privacy-policy" },
  { label: "이용약관", href: "/terms" },
  { label: "문의하기", href: "/contact" },
];

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-5">
          <div>
            <Link
              href="/"
              className="mb-3 flex items-center gap-2 text-lg font-black text-white"
            >
              <span>💰</span>
              머니<span className="text-brand-400">계산기</span>
            </Link>
            <p className="text-sm leading-relaxed">
              복잡한 금융 계산을 쉽고 빠르게.
              <br />
              입력값은 서버에 전송되지 않습니다.
            </p>
            <div className="mt-4 text-sm">
              <p className="mb-1 text-slate-500">운영 문의</p>
              <a
                href="mailto:support@머니계산기.kr"
                className="text-slate-300 transition-colors hover:text-white"
              >
                support@머니계산기.kr
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-200">
              대출 계산기
            </h3>
            <ul className="space-y-2">
              {LOAN_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-200">
              부동산 계산기
            </h3>
            <ul className="space-y-2">
              {REALESTATE_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-200">
              금융 계산기
            </h3>
            <ul className="space-y-2">
              {FINANCE_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-200">
              안내
            </h3>
            <ul className="space-y-2">
              {INFO_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-2 border-t border-slate-800 pt-6 text-xs sm:flex-row">
          <p>
            © {new Date().getFullYear()} 머니계산기 (머니계산기.kr). All rights
            reserved.
          </p>
          <p className="text-center text-slate-500">
            본 계산 결과는 참고용이며 실제 금융 상품과 차이가 있을 수 있습니다.
          </p>
        </div>
      </div>
    </footer>
  );
}
