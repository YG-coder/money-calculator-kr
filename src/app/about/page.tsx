// src/app/about/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  slug: "about",
  title: "머니계산기 소개 — 금융 결정을 숫자로 확인하는 계산기",
  description:
    "머니계산기의 대출·부동산·저축 계산 기능, 계산 원칙, 정책 검증 방식과 운영 정보를 안내합니다.",
});

export default function Page() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="mb-2 text-3xl font-black text-slate-900">
        머니계산기 소개
      </h1>
      <p className="mb-8 text-sm text-slate-400">
        금융 결정을 숫자로 먼저 확인하는 무료 계산 서비스
      </p>

      <div className="space-y-8 rounded-2xl border border-slate-100 bg-white p-8 text-[15px] leading-relaxed text-slate-600 shadow-sm">
        <section>
          <p>
            <strong className="text-slate-900">
              머니계산기(머니계산기.kr)
            </strong>
            는 대출 한도와 상환 부담, 주택 구입에 필요한 현금, 임대수익률,
            예·적금과 환전 비용처럼 서로 연결된 금융 결정을 숫자로 비교할 수
            있도록 만든 무료 계산 서비스입니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-slate-800">왜 만들었나</h2>
          <p className="mb-3">
            한국에서 주택을 매수하거나 대출을 받을 때 발생하는 비용은 매매가만큼
            중요한 의사결정 변수입니다. 금리, 상환 방식, 보유 비용, 임대 수익률
            차이만으로도 실제 부담과 수익은 크게 달라질 수 있습니다.
          </p>
          <p>
            머니계산기는 결과 하나만 보여주는 데서 그치지 않고, DSR에서 LTV로,
            취득세에서 실투자금과 임대수익률로 다음 판단을 이어갈 수 있도록
            돕습니다.
          </p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="mb-3 text-lg font-bold text-slate-800">운영자 정보</h2>
          <dl className="space-y-3 text-sm">
            <div className="grid grid-cols-[80px_1fr] gap-4">
              <dt className="font-semibold text-slate-500">운영</dt>
              <dd className="text-slate-700">
                <strong className="text-slate-900">Incomelab</strong> (인컴랩)
              </dd>
            </div>
            <div className="grid grid-cols-[80px_1fr] gap-4">
              <dt className="font-semibold text-slate-500">분야</dt>
              <dd className="text-slate-700">
                금융·부동산 계산기 개발 및 정보 콘텐츠 운영
              </dd>
            </div>
            <div className="grid grid-cols-[80px_1fr] gap-4">
              <dt className="font-semibold text-slate-500">문의</dt>
              <dd className="text-slate-700">
                <a
                  href="mailto:support@머니계산기.kr"
                  className="text-brand-600 underline underline-offset-2 hover:text-brand-700"
                >
                  support@머니계산기.kr
                </a>
              </dd>
            </div>
            <div className="grid grid-cols-[80px_1fr] gap-4">
              <dt className="font-semibold text-slate-500">개시일</dt>
              <dd className="text-slate-700">2026년 4월</dd>
            </div>
          </dl>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-slate-800">
            콘텐츠 작성·검증 원칙
          </h2>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="shrink-0 font-bold text-brand-600">①</span>
              <div>
                <strong className="text-slate-800">1차 출처 우선</strong> —
                세율·법령·금리 정보는 공식 기관 자료를 우선 참고합니다.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 font-bold text-brand-600">②</span>
              <div>
                <strong className="text-slate-800">시점 명시</strong> — 세제와
                금융 정책은 변경될 수 있으므로 작성 시점과 주의 문구를
                명시합니다.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 font-bold text-brand-600">③</span>
              <div>
                <strong className="text-slate-800">단정적 조언 회피</strong> —
                특정 선택을 권유하지 않고 시뮬레이션 결과를 참고용으로
                제공합니다.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0 font-bold text-brand-600">④</span>
              <div>
                <strong className="text-slate-800">계산 검증</strong> — 계산
                공식과 예시 수치를 직접 확인한 뒤 게시합니다.
              </div>
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="mb-3 text-base font-bold text-amber-900">
            ⚠️ 본 사이트의 한계
          </h2>
          <p className="text-sm leading-relaxed text-amber-900">
            머니계산기는 일반적인 금융·부동산 정보를 전달하는 정보 사이트이며,
            <strong> 개인 맞춤 금융 자문 서비스가 아닙니다</strong>. 제공되는
            계산 결과는 표준 공식에 기반한 참고용 시뮬레이션입니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-slate-800">제공 기능</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              [
                "대출 한도와 상환",
                "DSR·LTV, 이자와 상환 방식, 대환·중도상환을 비교합니다.",
                "/loan",
                "대출 계산기 전체",
              ],
              [
                "주택 구입과 임대",
                "취득세·중개보수·등기비용을 포함한 실투자금과 임대수익률을 확인합니다.",
                "/real-estate",
                "부동산 계산기 전체",
              ],
              [
                "저축과 현금 관리",
                "예금·적금의 세후 이자, 복리, 목표 저축액과 환전 비용을 계산합니다.",
                "/finance",
                "금융 계산기 전체",
              ],
            ].map(([title, desc, href, label]) => (
              <div
                key={title}
                className="rounded-xl border border-slate-200 p-4"
              >
                <h3 className="font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {desc}
                </p>
                <Link
                  href={href}
                  className="mt-3 inline-block text-sm font-semibold text-brand-600 hover:underline"
                >
                  {label} →
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm">
            상세 가이드는{" "}
            <Link
              href="/blog"
              className="text-brand-600 underline underline-offset-2 hover:text-brand-700"
            >
              금융 가이드
            </Link>
            에서, 자세한 면책 사항은{" "}
            <Link
              href="/disclaimer"
              className="text-brand-600 underline underline-offset-2 hover:text-brand-700"
            >
              면책 고지
            </Link>
            에서 확인하실 수 있습니다.
          </p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="mb-2 text-sm font-bold text-slate-800">
            🔒 개인정보 보호
          </h3>
          <p className="text-xs leading-relaxed text-slate-500">
            계산은 사용자의 브라우저에서 처리되며 입력값을 별도 회원
            데이터베이스에 저장하지 않습니다. 결과 공유 URL에는 입력값이 포함될
            수 있으므로 자세한 사항은{" "}
            <Link
              href="/privacy-policy"
              className="text-brand-600 underline underline-offset-2 hover:text-brand-700"
            >
              개인정보처리방침
            </Link>
            을 참고해주세요.
          </p>
        </section>
      </div>
    </div>
  );
}
