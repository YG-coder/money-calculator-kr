import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  slug: "contact",
  title: "문의하기",
  description:
    "머니계산기 계산 오류 제보, 정책값 정정 요청, 기능 개선 제안과 운영 문의 방법을 안내합니다.",
});

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="mb-2 text-3xl font-black text-slate-900">문의하기</h1>

      <p className="mb-8 text-sm text-slate-500">
        서비스 관련 문의, 오류 제보, 기능 개선 제안을 보내주세요.
      </p>

      <div className="space-y-5 rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
        {/* 이메일 */}
        <div className="flex items-start gap-4 rounded-xl bg-slate-50 p-4">
          <span className="shrink-0 text-2xl">📧</span>

          <div>
            <h2 className="mb-1 font-bold text-slate-800">이메일 문의</h2>

            <a
              href="mailto:support@머니계산기.kr"
              className="font-semibold text-brand-600 underline-offset-2 hover:underline"
            >
              support@머니계산기.kr
            </a>

            <p className="mt-1 text-xs text-slate-400">
              문의 내용에 따라 확인과 답변에 시간이 걸릴 수 있습니다.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 p-4">
          <h2 className="mb-2 font-bold text-slate-800">
            오류 제보에 포함하면 좋은 정보
          </h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>사용한 계산기 주소와 입력 조건</li>
            <li>표시된 결과와 예상한 결과</li>
            <li>근거가 되는 공식 기관 또는 법령 링크</li>
            <li>사용 기기·브라우저와 오류 화면</li>
          </ul>
          <p className="mt-3 text-xs leading-relaxed text-amber-700">
            주민등록번호, 계좌번호, 계약서 원본 등 민감한 개인정보는 보내지
            마세요.
          </p>
        </div>

        {/* 버그 */}
        <div className="flex items-start gap-4 rounded-xl bg-slate-50 p-4">
          <span className="shrink-0 text-2xl">🐛</span>

          <div>
            <h2 className="mb-1 font-bold text-slate-800">
              버그 제보 / 기능 제안
            </h2>

            <p className="text-sm text-slate-500">
              계산 오류, UI 문제, 새로운 계산기 요청 등 모든 피드백을
              환영합니다.
            </p>
          </div>
        </div>

        {/* 서비스 안내 */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            본 서비스는 무료로 제공되며, 금융 계산 결과는 참고용입니다. 실제
            금융 상품과 차이가 있을 수 있으므로 중요한 결정 전 반드시 금융기관을
            통해 확인하시기 바랍니다.
          </p>
        </div>

        {/* 안내 */}
        <p className="pt-2 text-center text-xs text-slate-400">
          문의 내용에 따라 답변이 지연될 수 있습니다.
        </p>
        <nav
          aria-label="관련 안내"
          className="flex flex-wrap justify-center gap-3 text-xs font-semibold text-brand-600"
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
        </nav>
      </div>
    </div>
  );
}
