// src/app/terms/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  slug: "terms",
  title: "이용약관",
  description:
    "머니계산기 계산 서비스와 금융 정보 콘텐츠의 이용 조건, 결과의 한계, 저작권, 광고 및 문의 방법을 안내합니다.",
});

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="mb-1 text-3xl font-black text-slate-900">이용약관</h1>
      <p className="mb-8 text-sm text-slate-400">
        최종 수정일: 2026년 8월 29일
      </p>

      <div className="space-y-7 rounded-2xl border border-slate-100 bg-white p-8 text-sm leading-relaxed text-slate-600 shadow-sm">
        <section>
          <h2 className="mb-2 text-base font-bold text-slate-800">1. 목적</h2>
          <p>
            본 약관은 머니계산기(머니계산기.kr)가 제공하는 금융 계산기 및 관련
            정보 서비스의 이용과 관련하여 사이트 운영자와 이용자 간의 권리, 의무
            및 책임사항을 규정하는 것을 목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-slate-800">
            2. 서비스 내용
          </h2>
          <p>
            본 사이트는 대출 한도·상환, 부동산 세금·실투자금·임대수익률,
            예·적금·복리·환전 계산기와 관련 금융 정보 콘텐츠를 무료로
            제공합니다. 서비스 내용은 운영상 필요에 따라 변경되거나 중단될 수
            있습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-slate-800">
            3. 서비스 이용
          </h2>
          <p>
            이용자는 별도의 회원가입 없이 본 사이트의 계산기 및 정보를 이용할 수
            있습니다. 단, 본 사이트에서 제공하는 서비스와 콘텐츠를 무단 복제,
            재배포, 상업적 목적으로 사용하는 행위는 금지됩니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-slate-800">
            4. 계산 결과의 성격
          </h2>
          <p>
            본 사이트에서 제공하는 계산 결과는 이용자의 입력값을 기준으로 산출된
            참고용 정보입니다. 실제 금융기관의 상품 조건, 우대금리, 수수료,
            심사기준 등에 따라 결과가 달라질 수 있으므로, 최종 금융 의사결정 전
            반드시 해당 금융기관의 공식 안내를 확인하시기 바랍니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-slate-800">
            5. 면책 조항
          </h2>
          <p>
            이용자는 본 사이트의 계산 결과와 정보를 자신의 책임 하에 활용해야
            합니다. 본 사이트 운영자는 계산 결과 또는 콘텐츠를 바탕으로 이루어진
            대출, 투자, 계약 등 금융 의사결정에 대해 책임을 지지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-slate-800">
            6. 지적재산권
          </h2>
          <p>
            본 사이트에 포함된 콘텐츠, 디자인, 문구, 코드 등 일체의 자료에 대한
            권리는 운영자에게 있으며, 사전 허가 없이 복제, 배포, 수정, 재사용할
            수 없습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-slate-800">
            7. 서비스 변경 및 중단
          </h2>
          <p>
            운영자는 사이트 운영상 필요하거나 기술적 사유가 있는 경우 서비스의
            일부 또는 전부를 변경하거나 중단할 수 있습니다. 이 경우 가능한 범위
            내에서 사전에 공지합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-slate-800">
            8. 광고 및 외부 서비스
          </h2>
          <p>
            본 사이트는 운영 비용을 위해 광고를 게재하거나 공식 기관의 외부
            페이지로 연결할 수 있습니다. 광고와 외부 사이트의 상품·서비스는 해당
            제공자의 책임으로 운영되며, 자세한 데이터 처리 방식은
            개인정보처리방침을 확인하시기 바랍니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-slate-800">
            9. 약관 변경
          </h2>
          <p>
            본 약관은 관련 법령, 정책 또는 서비스 운영상의 필요에 따라 변경될 수
            있으며, 변경 사항은 본 페이지를 통해 공지됩니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-bold text-slate-800">10. 문의</h2>
          <p>
            서비스 이용과 관련한 문의 사항은 아래 이메일로 접수할 수 있습니다.
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
          본 약관은 머니계산기(머니계산기.kr) 서비스 이용에 적용됩니다.
        </p>
        <nav
          aria-label="관련 안내"
          className="flex flex-wrap gap-3 text-xs font-semibold text-brand-600"
        >
          <Link href="/about" className="hover:underline">
            사이트 소개
          </Link>
          <Link href="/privacy-policy" className="hover:underline">
            개인정보처리방침
          </Link>
          <Link href="/disclaimer" className="hover:underline">
            면책 고지
          </Link>
          <Link href="/contact" className="hover:underline">
            문의하기
          </Link>
        </nav>
      </div>
    </div>
  );
}
