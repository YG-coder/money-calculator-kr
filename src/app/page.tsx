// src/app/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";
import { blogPosts } from "@/data/blogPosts";
import {
  CALC,
  PURPOSE_GROUPS,
  MONEY_FLOW,
  CATEGORY_HUBS,
  type CalcKey,
} from "@/data/homeNav";

export const metadata: Metadata = buildMetadata({
  title: "머니계산기 | DSR·LTV·실투자금·대출·부동산·예적금 계산기",
  description:
    "DSR·LTV로 대출 한도를, 실투자금·취득세로 주택 구입에 필요한 현금을, 임대수익률로 투자 결과를 계산합니다. 대출이자·전세와 월세·예금·적금·환전까지 다양한 계산기를 무료로 이용하세요.",
});

const latestPosts = blogPosts
  .filter((post) => post.published !== false)
  .slice(0, 3);

const HOME_FAQ = [
  {
    q: "무엇부터 계산해야 하나요?",
    a: "목적에 따라 다릅니다. 대출을 앞두고 있다면 DSR로 소득 기준 한도를, 주택 담보라면 LTV로 담보 기준 한도를 먼저 봅니다. DSR과 LTV 기준을 모두 충족해야 하며, 금융회사의 심사 결과에 따라 실제 한도는 더 낮을 수 있습니다. 매수를 검토 중이라면 실투자금 계산기로 매매가 외에 필요한 현금을 확인하는 편이 빠릅니다.",
  },
  {
    q: "계산 결과가 실제 은행과 다를 수 있나요?",
    a: "네. 이 사이트의 결과는 참고용 추정치입니다. 우대금리·가산금리·수수료와 금융회사 내부 심사 기준이 반영되지 않으므로 최종 결정 전 해당 금융기관에 확인하세요. 특히 대출 한도는 소득 인정 방식과 기존 부채 산정 방식에 따라 달라집니다.",
  },
  {
    q: "입력한 값이 저장되나요?",
    a: "서버로 전송되거나 저장되지 않습니다. 모든 계산은 브라우저에서 처리됩니다. 입력값은 주소창의 쿼리 파라미터에만 담기므로, 링크를 복사하면 같은 조건을 다시 열 수 있습니다.",
  },
  {
    q: "세율이나 규제 수치는 언제 기준인가요?",
    a: "정책을 쓰는 계산기는 결과 아래에 기준일·검증일·출처를 함께 표시합니다. 확인되지 않은 조건 조합은 임의로 계산하지 않고 '지원하지 않음'으로 알리며, 적용 기간이 끝난 정책값은 새 기준을 확인하기 전까지 계산하지 않습니다.",
  },
];

/**
 * 그룹당 하나뿐인 대표 시작 CTA.
 *
 * ⚠️ inline-flex 로 둔다. 블록으로 두면 카드 폭 전체를 채워 버튼이 아니라
 *    광고 배너처럼 보인다. 설명은 버튼 안이 아니라 위쪽 본문에 둔다.
 */
function PrimaryCta({ calc }: { calc: CalcKey }) {
  const c = CALC[calc];
  return (
    <Link
      href={c.href}
      className="group inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-700"
    >
      {c.title}로 시작
      <span
        aria-hidden="true"
        className="transition-transform group-hover:translate-x-0.5"
      >
        →
      </span>
    </Link>
  );
}

function CalcChip({ calc }: { calc: CalcKey }) {
  const c = CALC[calc];
  return (
    <Link
      href={c.href}
      className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 transition-colors hover:border-brand-300 hover:text-brand-700"
    >
      {c.title}
    </Link>
  );
}

export default function Page() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="border-b border-slate-200 bg-brand-700 px-4 py-14 text-white sm:py-16">
        <div className="mx-auto max-w-3xl">
          <p className="mb-3 text-sm font-semibold tracking-wide text-brand-200">
            무료 금융·부동산 계산기
          </p>
          <h1 className="mb-4 text-3xl font-black leading-tight md:text-4xl">
            금융 결정을 숫자로 먼저 확인하세요
          </h1>
          <p className="mb-7 max-w-2xl text-base leading-relaxed text-brand-100">
            빌릴 수 있는 금액, 집을 살 때 실제로 필요한 현금, 저축과 환전까지.
            조건을 입력하면 근거를 함께 보여 줍니다. 회원가입이 없고 입력값은
            브라우저에서만 처리됩니다.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="#start"
              className="rounded-xl bg-white px-5 py-3 font-bold text-brand-700 transition-colors hover:bg-brand-50"
            >
              목적부터 고르기 ↓
            </Link>
            <Link
              href="#flow"
              className="rounded-xl border border-brand-400 px-5 py-3 font-bold text-white transition-colors hover:bg-brand-600"
            >
              주택 구입 자금 흐름 보기
            </Link>
          </div>
        </div>
      </section>

      {/* ── 목적별 시작 ── */}
      <section id="start" className="scroll-mt-16 bg-slate-50 py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="text-2xl font-black text-slate-900">
            어떤 상황이신가요?
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            상황에 맞는 시작점을 골라 보세요. 각 묶음의 첫 계산기부터 쓰면
            나머지는 자연스럽게 이어집니다.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {PURPOSE_GROUPS.map((g) => (
              <div
                key={g.id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5"
              >
                <h3 className="text-base font-black text-slate-900">
                  {g.title}
                </h3>
                {/* grow: 설명 길이가 달라도 카드마다 CTA 위치를 맞춘다 */}
                <p className="mt-1.5 grow text-sm leading-relaxed text-slate-600">
                  {g.when}
                </p>

                <div className="mt-4">
                  <PrimaryCta calc={g.primary} />
                </div>
                {g.primaryNote && (
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    {g.primaryNote}
                  </p>
                )}

                <div className="mt-4 border-t border-slate-100 pt-3">
                  <div className="flex flex-wrap gap-1.5">
                    {g.secondary.map((k) => (
                      <CalcChip key={k} calc={k} />
                    ))}
                  </div>
                </div>

                <Link
                  href={g.hub.href}
                  className="mt-3 text-xs font-semibold text-brand-600 hover:text-brand-700"
                >
                  {g.hub.label} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 부동산 자금 흐름 ── */}
      <section
        id="flow"
        className="scroll-mt-16 border-t border-slate-200 py-14"
      >
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-2xl font-black text-slate-900">
            주택 구입은 네 단계로 나눠 계산합니다
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            한도 · 필요 현금 · 수익률은 서로 다른 질문입니다. 순서대로 확인하면
            어디서 막히는지 분명해집니다.
          </p>

          <ol className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-4">
            {MONEY_FLOW.map((s) => (
              <li
                key={s.step}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-black text-white">
                    {s.step}
                  </span>
                  <span className="text-sm font-bold text-slate-500">
                    {s.headline}
                  </span>
                </div>

                <Link
                  href={CALC[s.calc].href}
                  className="mt-3 font-black text-slate-900 underline-offset-4 hover:text-brand-700 hover:underline"
                >
                  {CALC[s.calc].title}
                </Link>
                <p className="mt-1.5 grow text-sm leading-relaxed text-slate-600">
                  {s.detail}
                </p>

                {s.handoff && (
                  <p className="mt-3 border-t border-slate-100 pt-3 text-xs leading-relaxed text-slate-500">
                    <span aria-hidden="true">↓ </span>
                    {s.handoff}
                  </p>
                )}
              </li>
            ))}
          </ol>

          <p className="mt-5 text-xs leading-relaxed text-slate-500">
            ※ 값이 이어지는 구간은 2→3, 3→4 입니다. 넘어온 값은 다음 화면에서
            수정할 수 있고, 방공제·등기비용처럼 직접 골라야 하는 항목은 자동으로
            선택되지 않습니다.
          </p>
        </div>
      </section>

      {/* ── 금융 가이드 ── */}
      <section className="border-t border-slate-200 bg-slate-50 py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900">
                금융 가이드
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                계산기가 내놓은 숫자를 어떻게 읽어야 하는지 정리했습니다.
              </p>
            </div>
            <Link
              href="/blog"
              className="shrink-0 text-sm font-bold text-brand-600 hover:text-brand-700"
            >
              전체 보기 →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {latestPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-brand-300"
              >
                <span className="text-xs font-bold text-brand-600">
                  {post.category}
                </span>
                <h3 className="mt-2 font-bold leading-snug text-slate-900 transition-colors group-hover:text-brand-700">
                  {post.title}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
                  {post.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 전체 계산기 찾기 ── */}
      <section className="border-t border-slate-200 py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-2xl font-black text-slate-900">
            전체 계산기 둘러보기
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            카테고리별 목록에서 나머지 계산기를 찾을 수 있습니다.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {CATEGORY_HUBS.map((h) => (
              <Link
                key={h.href}
                href={h.href}
                className="group rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-brand-300 hover:bg-brand-50/40"
              >
                <span className="block font-black text-slate-900 transition-colors group-hover:text-brand-700">
                  {h.title}
                </span>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  {h.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="border-t border-slate-200 py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="mb-6 text-2xl font-black text-slate-900">
            자주 묻는 질문
          </h2>
          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {HOME_FAQ.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-slate-900">
                  {f.q}
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-slate-400 transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── 신뢰·정책 안내 ── */}
      <section className="border-t border-slate-200 bg-slate-900 py-14 text-slate-300">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-2xl font-black text-white">
            숫자를 어떻게 관리하는지
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
            금융 계산은 근거가 없으면 의미가 없습니다. 이 사이트가 지키는
            원칙입니다.
          </p>

          <dl className="mt-8 grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2">
            <div>
              <dt className="font-bold text-white">1차 출처를 우선합니다</dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-slate-400">
                세율과 규제 수치는 법령·정부 부처 발표 원문을 우선 확인합니다.
                원문을 확인하지 못한 값은 근거 등급을 함께 밝힙니다.
              </dd>
            </div>
            <div>
              <dt className="font-bold text-white">
                기준일과 검증일을 밝힙니다
              </dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-slate-400">
                정책을 쓰는 계산기는 결과 아래에 적용 기준일, 마지막 확인 날짜,
                출처를 함께 표시합니다.
              </dd>
            </div>
            <div>
              <dt className="font-bold text-white">
                확인되지 않은 조건은 계산하지 않습니다
              </dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-slate-400">
                근거가 없는 조건 조합은 값을 추정하지 않고 지원하지 않는다고
                알립니다. 적용 기간이 끝난 정책값도 새 기준을 확인하기 전까지
                계산하지 않습니다.
              </dd>
            </div>
            <div>
              <dt className="font-bold text-white">
                입력값은 서버에 저장되지 않습니다
              </dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-slate-400">
                모든 계산은 브라우저에서 처리됩니다. 입력값은 주소창의 쿼리
                파라미터에만 담겨, 링크를 복사하면 같은 조건을 다시 열 수
                있습니다.
              </dd>
            </div>
          </dl>

          <p className="mt-8 border-t border-slate-700 pt-6 text-sm leading-relaxed text-slate-400">
            모든 결과는{" "}
            <strong className="text-slate-200">참고용 예상값</strong>
            입니다. 법률·세무·금융 판단을 대신하지 않으며, 실제 조건은
            금융기관·세무 전문가의 확인이 필요합니다.{" "}
            <Link
              href="/disclaimer"
              className="font-semibold text-brand-300 underline underline-offset-2 hover:text-brand-200"
            >
              면책 고지
            </Link>
            {" · "}
            <Link
              href="/about"
              className="font-semibold text-brand-300 underline underline-offset-2 hover:text-brand-200"
            >
              사이트 소개
            </Link>
            {" · "}
            <Link
              href="/contact"
              className="font-semibold text-brand-300 underline underline-offset-2 hover:text-brand-200"
            >
              문의
            </Link>
          </p>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: HOME_FAQ.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />
    </>
  );
}
