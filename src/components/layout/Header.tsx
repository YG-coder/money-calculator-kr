// src/components/layout/Header.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const NAV_GROUPS = [
  {
    label: "대출 계산기",
    baseHref: "/loan",
    items: [
      { href: "/loan-interest-calculator", label: "대출이자 계산기" },
      { href: "/amortization-calculator", label: "원리금상환 계산기" },
      { href: "/jeonse-loan-calculator", label: "전세대출 계산기" },
      { href: "/prepayment-calculator", label: "중도상환 계산기" },
      { href: "/dsr-calculator", label: "DSR 계산기" },
      { href: "/ltv-calculator", label: "LTV 계산기" },
      { href: "/minus-account-calculator", label: "마이너스통장 계산기" },
      { href: "/refinance-calculator", label: "대환대출 계산기" },
      { href: "/rate-change-simulator", label: "금리변동 시뮬레이터" },
      { href: "/fixed-vs-variable-calculator", label: "고정 vs 변동금리 계산기" },
    ],
  },
  {
    label: "부동산 계산기",
    baseHref: "/real-estate",
    items: [
      { href: "/real-estate/acquisition-tax-calculator", label: "취득세 계산기" },
      { href: "/real-estate/initial-cost-calculator", label: "실투자금 계산기" },
      { href: "/real-estate/jeonse-vs-wolse-calculator", label: "월세 vs 전세 계산기" },
      { href: "/real-estate/property-yield-calculator", label: "부동산 수익률 계산기" },
      { href: "/real-estate/reconstruction-contribution-calculator", label: "재건축 분담금 계산기" },
      { href: "/real-estate/jeonse-wolse-conversion", label: "전월세 전환율 계산기" },
      { href: "/real-estate/vacancy-impact", label: "공실률 영향 계산기" },
    ],
  },
  {
    label: "금융 계산기",
    baseHref: "/finance",
    items: [
      { href: "/finance/deposit", label: "예금 이자 계산기" },
      { href: "/finance/installment-savings", label: "적금 이자 계산기" },
      { href: "/finance/compound", label: "복리 계산기" },
      { href: "/finance/goal-savings", label: "목표 저축 계산기" },
      { href: "/finance/deposit-vs-savings", label: "예금 vs 적금 계산기" },
      { href: "/finance/cma-vs-deposit", label: "CMA vs 예금 계산기" },
      { href: "/finance/real-interest-rate", label: "실질금리 계산기" },
      { href: "/finance/inflation", label: "인플레이션 계산기" },
      { href: "/finance/simple-vs-compound", label: "단리 vs 복리 계산기" },
    ],
  },
  {
    label: "금융 가이드",
    baseHref: "/blog",
    items: [],
  },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [mobileGroup, setMobileGroup] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenGroup(null);
      }
    }

    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  // 경로가 바뀌면 렌더 중에 메뉴 상태를 초기화한다.
  // (effect 안에서 setState 하면 불필요한 리렌더가 한 번 더 발생)
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
    setMobileGroup(null);
    setOpenGroup(null);
  }

  function isGroupActive(group: (typeof NAV_GROUPS)[0]) {
    if (group.items.length === 0) return pathname.startsWith(group.baseHref);

    return (
        group.items.some((i) => pathname === i.href) ||
        pathname === group.baseHref
    );
  }

  return (
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 shadow-sm backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-15 items-center justify-between py-3">
            <Link
                href="/"
                className="flex shrink-0 items-center gap-2"
                onClick={() => setMobileOpen(false)}
            >
              <span className="text-2xl">💰</span>
              <span className="text-lg font-black tracking-tight text-slate-900">
              머니<span className="text-brand-600">계산기</span>
            </span>
            </Link>

            <nav ref={navRef} className="hidden items-center gap-1 md:flex">
              {NAV_GROUPS.map((group) => {
                const active = isGroupActive(group);

                if (group.items.length === 0) {
                  return (
                      <Link
                          key={group.label}
                          href={group.baseHref}
                          className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                              active
                                  ? "bg-brand-50 text-brand-700"
                                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                      >
                        {group.label}
                      </Link>
                  );
                }

                const isOpen = openGroup === group.label;

                return (
                    <div key={group.label} className="relative">
                      <button
                          onClick={() => setOpenGroup(isOpen ? null : group.label)}
                          aria-haspopup="true"
                          aria-expanded={isOpen}
                          className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                              active || isOpen
                                  ? "bg-brand-50 text-brand-700"
                                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                      >
                        {group.label}
                        <svg
                            className={`h-3.5 w-3.5 transition-transform ${
                                isOpen ? "rotate-180" : ""
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {isOpen && (
                          <div className="absolute left-0 top-full z-50 mt-1.5 w-48 rounded-xl border border-slate-100 bg-white py-1.5 shadow-lg">
                            <Link
                                href={group.baseHref}
                                className={`block px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                                    pathname === group.baseHref
                                        ? "bg-brand-50 text-brand-700"
                                        : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                                }`}
                            >
                              전체 보기
                            </Link>
                            <div className="my-1 border-t border-slate-100" />
                            {group.items.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`block px-4 py-2.5 text-sm font-medium transition-colors ${
                                        pathname === item.href
                                            ? "bg-brand-50 text-brand-700"
                                            : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                                    }`}
                                >
                                  {item.label}
                                </Link>
                            ))}
                          </div>
                      )}
                    </div>
                );
              })}
            </nav>

            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="메뉴"
                className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 md:hidden"
            >
              {mobileOpen ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
              ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
              )}
            </button>
          </div>

          {mobileOpen && (
              <nav className="space-y-0.5 border-t border-slate-100 py-2 pb-3 md:hidden">
                {NAV_GROUPS.map((group) => {
                  if (group.items.length === 0) {
                    return (
                        <Link
                            key={group.label}
                            href={group.baseHref}
                            className={`block rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                                pathname.startsWith(group.baseHref)
                                    ? "bg-brand-50 text-brand-700"
                                    : "text-slate-700 hover:bg-slate-50"
                            }`}
                        >
                          {group.label}
                        </Link>
                    );
                  }

                  const isExpanded = mobileGroup === group.label;

                  return (
                      <div key={group.label}>
                        <button
                            onClick={() => setMobileGroup(isExpanded ? null : group.label)}
                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                                isGroupActive(group)
                                    ? "bg-brand-50 text-brand-700"
                                    : "text-slate-700 hover:bg-slate-50"
                            }`}
                        >
                          <span>{group.label}</span>
                          <svg
                              className={`h-3.5 w-3.5 transition-transform ${
                                  isExpanded ? "rotate-180" : ""
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2.5}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {isExpanded && (
                            <div className="ml-3 mt-0.5 space-y-0.5 border-l-2 border-brand-100 pl-3">
                              <Link
                                  href={group.baseHref}
                                  className="block rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-widest text-slate-400 transition-colors hover:text-slate-600"
                              >
                                전체 보기
                              </Link>
                              {group.items.map((item) => (
                                  <Link
                                      key={item.href}
                                      href={item.href}
                                      className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                          pathname === item.href
                                              ? "bg-brand-50 text-brand-700"
                                              : "text-slate-600 hover:bg-slate-50"
                                      }`}
                                  >
                                    {item.label}
                                  </Link>
                              ))}
                            </div>
                        )}
                      </div>
                  );
                })}
              </nav>
          )}
        </div>
      </header>
  );
}