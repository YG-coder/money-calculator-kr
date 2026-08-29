// src/app/disclaimer/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  slug: "disclaimer",
  title: "면책 고지 — 머니계산기",
  description:
    "머니계산기에서 제공하는 계산 결과 및 정보의 사용 범위와 한계, 면책 사항을 안내합니다. 본 사이트는 일반 정보 제공을 목적으로 하며, 개인 맞춤 금융·세무 자문이 아닙니다.",
});

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="mb-2 text-3xl font-black text-slate-900">면책 고지</h1>
      <p className="mb-8 text-sm text-slate-400">
        Disclaimer · 최종 갱신: 2026년 8월 29일
      </p>

      <div className="space-y-8 rounded-2xl border border-slate-100 bg-white p-8 text-[15px] leading-relaxed text-slate-600 shadow-sm">
        {/* 도입 */}
        <section>
          <p>
            머니계산기(머니계산기.kr, 이하 &ldquo;본 사이트&rdquo;)에서 제공하는
            모든 계산기, 글, 표, 시뮬레이션 결과는 일반적인 금융·세무 정보를
            전달할 목적으로 작성된 <strong>참고용 자료</strong>입니다. 본 사이트
            이용 전에 다음 사항을 반드시 확인해주시기 바랍니다.
          </p>
        </section>

        {/* 1. 정보의 성격 */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-slate-800">
            1. 정보의 성격
          </h2>
          <ul className="space-y-2.5 text-sm">
            <li className="flex gap-3">
              <span className="shrink-0 text-brand-600">•</span>
              <span>
                본 사이트의 콘텐츠는 한국 금융 시장과 부동산 세제에 관한
                <strong> 일반적인 정보</strong>이며, 특정 개인이나 거래에 대한
                맞춤형 자문이 아닙니다.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 text-brand-600">•</span>
              <span>
                본 사이트는 공인된 금융 자문 기관, 세무사, 변호사가 아니며, 관련
                법령에 따른 <strong>금융투자업·세무대리업·법무 자문</strong>을
                수행하지 않습니다.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 text-brand-600">•</span>
              <span>
                특정 금융 상품, 부동산, 투자 대상을 추천하거나 거래를 권유하지
                않습니다.
              </span>
            </li>
          </ul>
        </section>

        {/* 2. 계산 결과의 한계 */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-slate-800">
            2. 계산 결과의 한계
          </h2>
          <p className="mb-3">
            본 사이트의 계산기는 대출 상환 공식과 공개된 금융·부동산 정책 기준을
            바탕으로 결과를 제공합니다. 그러나 다음 요인으로 인해 실제
            금융기관·세무 당국의 산정 결과와 차이가 있을 수 있습니다.
          </p>
          <ul className="space-y-2.5 text-sm">
            <li className="flex gap-3">
              <span className="shrink-0 text-brand-600">•</span>
              <span>금융기관별 우대금리·가산금리·신용가산료·취급수수료</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 text-brand-600">•</span>
              <span>
                개인 신용도, 소득 증빙, 거래 실적 등에 따른 한도·금리 차등
              </span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 text-brand-600">•</span>
              <span>
                보유 주택 수, 조정대상지역 지정 여부, 일시적 2주택·생애최초 감면
                등 세제상 개별 조건
              </span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 text-brand-600">•</span>
              <span>
                정부 정책 변경, 세법 개정, 한국은행 기준금리 조정 등 시점에 따른
                변동
              </span>
            </li>
          </ul>
          <p className="mt-3 text-sm">
            계산 결과는 의사결정의 시작점일 뿐이며, 실제 거래·신청·신고 전에는
            반드시 해당 금융기관 또는 세무 전문가의 확인을 받아야 합니다.
          </p>
        </section>

        {/* 3. 정보의 시점 */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-slate-800">
            3. 정보의 시점
          </h2>
          <p>
            세제, 금융 규제, 금리 환경은 정부 정책에 따라 자주 변경됩니다. 본
            사이트의 모든 글에는 <strong>작성·갱신 시점</strong>이 명시되어
            있으며, 이후 개정 사항이 반영되지 않은 경우가 있을 수 있습니다.
            중요한 의사결정 시점에서는 반드시 최신 법령과 정책을 직접 확인해
            주시기 바랍니다.
          </p>
        </section>

        {/* 4. 사용자의 책임 */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-slate-800">
            4. 사용자의 책임
          </h2>
          <ul className="space-y-2.5 text-sm">
            <li className="flex gap-3">
              <span className="shrink-0 text-brand-600">•</span>
              <span>
                본 사이트의 정보를 활용한 의사결정의 결과에 대한 모든 책임은
                <strong> 사용자 본인에게 귀속</strong>됩니다.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 text-brand-600">•</span>
              <span>
                본 사이트의 정보 사용으로 발생한 직접적·간접적·결과적 손해에
                대해 본 사이트 운영자는 <strong>책임을 지지 않습니다</strong>.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 text-brand-600">•</span>
              <span>
                중요한 금융·세무·법률 사항은 반드시 해당 분야의 자격을 갖춘
                전문가(은행 상담사, 세무사, 변호사 등)와 상담 후 진행해주시기
                바랍니다.
              </span>
            </li>
          </ul>
        </section>

        {/* 5. 권위 있는 외부 자료 */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-slate-800">
            5. 공식 정보 출처 (권장 확인처)
          </h2>
          <p className="mb-3 text-sm">
            본 사이트의 콘텐츠는 다음과 같은 공식 기관 자료를 1차 출처로
            참고하여 작성됩니다. 정확한 최신 정보는 해당 기관에서 직접
            확인하시기 바랍니다.
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-3">
              <span className="shrink-0 text-brand-600">•</span>
              <span>
                <strong className="text-slate-800">국세청</strong> (
                <a
                  href="https://www.nts.go.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-600 underline underline-offset-2 hover:text-brand-700"
                >
                  www.nts.go.kr
                </a>
                ) — 국세 신고와 세금 안내
              </span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 text-brand-600">•</span>
              <span>
                <strong className="text-slate-800">금융감독원</strong> (
                <a
                  href="https://www.fss.or.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-600 underline underline-offset-2 hover:text-brand-700"
                >
                  www.fss.or.kr
                </a>
                ) — 금융 상품 비교, 소비자 보호 안내
              </span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 text-brand-600">•</span>
              <span>
                <strong className="text-slate-800">한국은행</strong> (
                <a
                  href="https://www.bok.or.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-600 underline underline-offset-2 hover:text-brand-700"
                >
                  www.bok.or.kr
                </a>
                ) — 기준금리, 가계신용 통계
              </span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 text-brand-600">•</span>
              <span>
                <strong className="text-slate-800">한국부동산원</strong> (
                <a
                  href="https://www.reb.or.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-600 underline underline-offset-2 hover:text-brand-700"
                >
                  www.reb.or.kr
                </a>
                ) — 주택가격동향, 전월세 전환율
              </span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 text-brand-600">•</span>
              <span>
                <strong className="text-slate-800">
                  국토교통부 부동산공시가격알리미
                </strong>{" "}
                (
                <a
                  href="https://www.realtyprice.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-600 underline underline-offset-2 hover:text-brand-700"
                >
                  www.realtyprice.kr
                </a>
                ) — 공시가격, 시가표준액 조회
              </span>
            </li>
          </ul>
        </section>

        {/* 6. 광고 및 제휴 */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-slate-800">
            6. 광고 및 제휴 정책
          </h2>
          <p className="mb-3">
            본 사이트는 운영 비용 충당을 위해 Google AdSense 등 디스플레이
            광고를 게재할 수 있습니다. 광고 운영은 다음 원칙을 따릅니다.
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-3">
              <span className="shrink-0 text-brand-600">•</span>
              <span>광고는 콘텐츠와 명확히 구분되도록 표시합니다.</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 text-brand-600">•</span>
              <span>
                광고주 또는 제휴 관계가 콘텐츠 내용에 영향을 주지 않도록
                편집상의 독립성을 유지합니다.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 text-brand-600">•</span>
              <span>
                특정 금융 상품을 광고가 아닌 콘텐츠로 위장해 추천하지 않습니다.
              </span>
            </li>
          </ul>
        </section>

        {/* 7. 문의 */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-slate-800">7. 문의</h2>
          <p>
            본 면책 고지 또는 콘텐츠에 관한 문의·정정 요청·오류 제보는 운영자
            이메일로 보내주시기 바랍니다.
          </p>
          <p className="mt-2">
            <a
              href="mailto:support@머니계산기.kr"
              className="text-brand-600 underline underline-offset-2 hover:text-brand-700"
            >
              support@머니계산기.kr
            </a>
          </p>
          <p className="mt-3 text-xs text-slate-400">
            관련 페이지:{" "}
            <Link
              href="/about"
              className="hover:text-brand-600 hover:underline"
            >
              사이트 소개
            </Link>{" "}
            ·{" "}
            <Link
              href="/privacy-policy"
              className="hover:text-brand-600 hover:underline"
            >
              개인정보처리방침
            </Link>{" "}
            ·{" "}
            <Link
              href="/terms"
              className="hover:text-brand-600 hover:underline"
            >
              이용약관
            </Link>
          </p>
          <p className="mt-3 text-sm">
            계산기 이용은{" "}
            <Link
              href="/"
              className="font-semibold text-brand-600 hover:underline"
            >
              홈
            </Link>
            에서, 계산 기준과 활용법은{" "}
            <Link
              href="/blog"
              className="font-semibold text-brand-600 hover:underline"
            >
              금융 가이드
            </Link>
            에서 확인할 수 있습니다.
          </p>
        </section>
      </div>
    </div>
  );
}
