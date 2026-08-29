// src/app/privacy-policy/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  slug: "privacy-policy",
  title: "개인정보처리방침",
  description:
    "머니계산기의 계산 입력값 처리, 접속 로그, Google AdSense 광고 쿠키, 맞춤 광고 설정과 문의 방법을 안내합니다.",
});

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="mb-1 text-3xl font-black text-slate-900">
        개인정보처리방침
      </h1>
      <p className="mb-8 text-sm text-slate-400">
        최종 수정일: 2026년 8월 29일
      </p>

      <div className="space-y-7 rounded-2xl border border-slate-100 bg-white p-8 text-sm leading-relaxed text-slate-600 shadow-sm">
        <section>
          <h2 className="mb-2 text-base font-bold text-slate-800">
            1. 개인정보 수집 여부
          </h2>
          <p>
            머니계산기(머니계산기.kr)는 계산기 이용 과정에서 사용자의 개인정보를
            직접 수집하지 않습니다. 사용자가 입력하는 대출 원금, 금리, 기간 등의
            수치는 서버에 저장되지 않으며 브라우저 내에서만 처리됩니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-slate-800">
            2. 입력 데이터 처리 방식
          </h2>
          <p>
            본 사이트의 계산 기능은 사용자의 브라우저에서 동작하도록 설계되어
            있습니다. 따라서 입력된 계산 값은 별도의 회원 데이터나 서버
            데이터베이스에 저장되지 않습니다. 다만 일부 계산기는 결과 공유를
            위해 입력값을 URL 쿼리 문자열에 담을 수 있습니다. 해당 URL을
            공유하면 입력값도 함께 전달될 수 있으므로 민감한 개인정보는 입력하지
            마세요.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-slate-800">
            3. 쿠키 및 로그 정보
          </h2>
          <p>
            호스팅·보안 서비스는 사이트 제공과 장애 대응을 위해 IP 주소, 요청
            URL, 브라우저 종류, 접속 시간 등의 기술 로그를 처리할 수 있습니다.
            쿠키와 유사 기술의 사용 여부는 적용 중인 광고·분석 서비스와 이용자의
            브라우저 설정에 따라 달라질 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-slate-800">
            4. 광고 서비스 이용
          </h2>
          <p>
            본 사이트는 Google AdSense를 통해 광고를 게재할 수 있습니다.
            Google을 포함한 제3자 광고 사업자는 사용자의 본 사이트 또는 다른
            사이트 방문 기록을 바탕으로 광고를 제공하기 위해 쿠키를 사용할 수
            있습니다. Google의 광고 쿠키 사용으로 맞춤 광고가 표시될 수 있으며,
            사용자는 Google 광고 설정에서 맞춤 광고를 관리하거나 해제할 수
            있습니다.
          </p>
          <p className="mt-2">
            <a
              href="https://adssettings.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand-600 hover:underline"
            >
              Google 광고 설정 →
            </a>
            <span className="mx-2 text-slate-300">·</span>
            <a
              href="https://policies.google.com/technologies/ads?hl=ko"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand-600 hover:underline"
            >
              Google 광고의 데이터 사용 방식 →
            </a>
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-slate-800">
            5. 제3자 제공
          </h2>
          <p>
            운영자는 계산 입력값을 수집해 판매하거나 임의로 제3자에게 제공하지
            않습니다. 다만 광고·호스팅 사업자는 각자의 개인정보처리방침에 따라
            쿠키, 기기 정보 또는 접속 정보를 처리할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-slate-800">
            6. 외부 링크
          </h2>
          <p>
            본 사이트는 참고용 정보 제공을 위해 외부 사이트로 연결되는 링크를
            포함할 수 있습니다. 외부 사이트의 개인정보처리방침 및 운영 방식은 본
            사이트와 무관하며, 해당 사이트의 정책을 별도로 확인하시기 바랍니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-slate-800">
            7. 이용자의 권리
          </h2>
          <p>
            사용자는 브라우저에서 쿠키를 차단·삭제하고 Google 광고 설정에서 맞춤
            광고를 관리할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-slate-800">8. 문의</h2>
          <p>
            개인정보 처리와 관련한 문의는 아래 이메일로 접수하실 수 있습니다.
          </p>
          <p className="mt-2">
            이메일:{" "}
            <a
              href="mailto:support@머니계산기.kr"
              className="font-semibold text-brand-600 underline-offset-2 hover:underline"
            >
              support@머니계산기.kr
            </a>
          </p>
        </section>

        <p className="border-t border-slate-100 pt-2 text-xs text-slate-400">
          본 개인정보처리방침은 관련 법령 및 서비스 운영 정책 변경에 따라 수정될
          수 있으며, 변경 사항은 본 페이지를 통해 공지됩니다.
        </p>
        <nav
          aria-label="관련 안내"
          className="flex flex-wrap gap-3 text-xs font-semibold text-brand-600"
        >
          <Link href="/about" className="hover:underline">
            사이트 소개
          </Link>
          <Link href="/disclaimer" className="hover:underline">
            면책 고지
          </Link>
          <Link href="/terms" className="hover:underline">
            이용약관
          </Link>
          <Link href="/contact" className="hover:underline">
            문의하기
          </Link>
        </nav>
      </div>
    </div>
  );
}
