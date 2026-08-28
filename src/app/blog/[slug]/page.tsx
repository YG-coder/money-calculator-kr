// src/app/blog/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadata, BASE_URL, SITE_NAME, SITE_AUTHOR } from "@/lib/metadata";
import { blogPosts } from "@/data/blogPosts";
import BlogContent from "@/components/blog/BlogContent";

interface Props {
  params: Promise<{ slug: string }>;
}

/** "2026.05.03" → "2026-05-03". 구조화 데이터는 ISO 형식을 요구한다. */
function toIsoDate(date: string): string {
  return date.trim().replace(/\./g, "-").replace(/-$/, "");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((item) => item.slug === slug);

  if (!post) {
    return buildMetadata({
      slug: `blog/${slug}`,
      title: "금융 가이드",
      description: "머니계산기 금융 가이드",
    });
  }

  return buildMetadata({
    slug: `blog/${slug}`,
    title: post.title,
    description: post.description,
  });
}

export function generateStaticParams() {
  return blogPosts
    .filter((post) => post.published !== false)
    .map((post) => ({
      slug: post.slug,
    }));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = blogPosts.find((item) => item.slug === slug);

  if (!post || post.published === false) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/blog"
        className="mb-8 inline-flex items-center gap-1 text-sm text-brand-600 hover:underline"
      >
        ← 가이드 목록으로
      </Link>

      <article className="rounded-2xl border border-slate-100 bg-white p-8">
        <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-600">
            {post.category}
          </span>
          <span className="text-xs text-slate-400">{post.date} 작성</span>
          {post.reviewedAt && (
            <span className="text-xs text-slate-400">
              {post.reviewedAt.replace(/-/g, ".")} 검토
            </span>
          )}
          <span className="text-xs text-slate-400">{SITE_AUTHOR}</span>
        </div>

        <h1 className="mb-4 text-3xl font-black leading-tight text-slate-900">
          {post.title}
        </h1>

        <p className="mb-8 text-base leading-relaxed text-slate-500">
          {post.description}
        </p>

        <BlogContent content={post.content} />

        {/* 참고 근거 — 글이 실제로 근거로 삼은 것만 표시한다 */}
        {post.sources && post.sources.length > 0 && (
          <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-sm font-bold text-slate-800">참고 근거</h2>
            <ul className="mt-2.5 space-y-1.5">
              {post.sources.map((src) => (
                <li key={src.name} className="text-sm leading-relaxed text-slate-600">
                  ·{" "}
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-600 underline underline-offset-2 hover:text-brand-700"
                  >
                    {src.name}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              법령·제도는 개정될 수 있습니다. 실제 적용 시점의 원문을 확인하세요.
            </p>
          </div>
        )}

        {/* 마무리 면책 */}
        <div className="mt-12 border-t border-slate-100 pt-6">
          <p className="text-xs leading-relaxed text-slate-400">
            ※ 본 글은 일반적인 금융·세무 정보 전달을 목적으로 작성된 참고 자료이며,
            실제 금리·세율·대출 조건은 금융기관 정책과 개인 상황에 따라 달라질 수
            있습니다. 중요한 의사결정 전에는 반드시 해당 기관 또는 전문가의 확인을
            받으시기 바랍니다.
          </p>
        </div>
      </article>

      {/*
        Article 구조화 데이터.

        ⚠️ dateModified 는 reviewedAt 이 있을 때만 넣는다. 검토하지 않은 글에
           수정일을 붙이면 검색엔진에 잘못된 신선도 신호를 준다.
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.description,
            datePublished: toIsoDate(post.date),
            ...(post.reviewedAt ? { dateModified: post.reviewedAt } : {}),
            author: { "@type": "Organization", name: SITE_AUTHOR },
            publisher: { "@type": "Organization", name: SITE_NAME },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `${BASE_URL}/blog/${post.slug}`,
            },
            inLanguage: "ko-KR",
            ...(post.sources?.length
              ? { citation: post.sources.map((src) => src.name) }
              : {}),
          }),
        }}
      />
    </div>
  );
}
