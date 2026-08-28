// src/app/sitemap.ts
import type { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/metadata";
import { blogPosts } from "@/data/blogPosts";
import { toIsoDate } from "@/lib/date";

type StaticPage = {
  path: string;
  priority: number;
  freq: MetadataRoute.Sitemap[0]["changeFrequency"];
};

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: StaticPage[] = [
    { path: "", priority: 1.0, freq: "daily" },

    // 대출 계산기
    { path: "loan-interest-calculator", priority: 0.9, freq: "monthly" },
    { path: "amortization-calculator", priority: 0.9, freq: "monthly" },
    { path: "jeonse-loan-calculator", priority: 0.9, freq: "monthly" },
    { path: "prepayment-calculator", priority: 0.9, freq: "monthly" },
    { path: "dsr-calculator", priority: 0.9, freq: "monthly" },
    { path: "ltv-calculator", priority: 0.9, freq: "monthly" },
    { path: "minus-account-calculator", priority: 0.9, freq: "monthly" },
    { path: "refinance-calculator", priority: 0.9, freq: "monthly" },
    { path: "rate-change-simulator", priority: 0.9, freq: "monthly" },
    { path: "fixed-vs-variable-calculator", priority: 0.9, freq: "monthly" },

    // 부동산 계산기
    {
      path: "real-estate/acquisition-tax-calculator",
      priority: 0.9,
      freq: "monthly",
    },
    {
      path: "real-estate/initial-cost-calculator",
      priority: 0.9,
      freq: "monthly",
    },
    {
      path: "real-estate/jeonse-vs-wolse-calculator",
      priority: 0.9,
      freq: "monthly",
    },
    {
      path: "real-estate/property-yield-calculator",
      priority: 0.9,
      freq: "monthly",
    },
    {
      path: "real-estate/reconstruction-contribution-calculator",
      priority: 0.9,
      freq: "monthly",
    },
    {
      path: "real-estate/jeonse-wolse-conversion",
      priority: 0.9,
      freq: "monthly",
    },
    {
      path: "real-estate/vacancy-impact",
      priority: 0.9,
      freq: "monthly",
    },

    // ── 허브 랜딩 (기존 누락 보완 · 별도 커밋 권장: fix(sitemap)) ──
    { path: "loan", priority: 0.8, freq: "weekly" },
    { path: "real-estate", priority: 0.8, freq: "weekly" },

    // ── 금융 계산기 (금융 확장 · 별도 커밋) ──
    { path: "finance", priority: 0.8, freq: "weekly" },
    { path: "finance/deposit", priority: 0.9, freq: "monthly" },
    { path: "finance/installment-savings", priority: 0.9, freq: "monthly" },
    { path: "finance/compound", priority: 0.9, freq: "monthly" },
    { path: "finance/goal-savings", priority: 0.9, freq: "monthly" },
    { path: "finance/deposit-vs-savings", priority: 0.9, freq: "monthly" },
    { path: "finance/cma-vs-deposit", priority: 0.9, freq: "monthly" },
    { path: "finance/real-interest-rate", priority: 0.9, freq: "monthly" },
    { path: "finance/inflation", priority: 0.9, freq: "monthly" },
    { path: "finance/simple-vs-compound", priority: 0.9, freq: "monthly" },
    { path: "finance/exchange", priority: 0.9, freq: "monthly" },

    // 기타
    { path: "blog", priority: 0.8, freq: "daily" },
    { path: "about", priority: 0.6, freq: "monthly" },
    { path: "contact", priority: 0.5, freq: "monthly" },
    { path: "terms", priority: 0.4, freq: "yearly" },
    { path: "privacy-policy", priority: 0.4, freq: "yearly" },
    { path: "disclaimer", priority: 0.4, freq: "yearly" },
  ];

  // ⚠️ 일반 페이지에는 lastModified 를 넣지 않는다.
  //
  //    전에는 new Date() 를 넣어, 빌드할 때마다 37개 페이지 전부가 "오늘 수정"
  //    으로 나갔다. 매번 전체가 갱신됐다는 신호를 보내면 검색엔진이 그 값을
  //    신뢰하지 않게 된다.
  //
  //    빌드 중 git log 로 파일별 최종 커밋일을 읽는 방법도 쓰지 않는다.
  //      · CI 의 shallow clone 에서 날짜가 부정확할 수 있다
  //      · git 이 없는 빌드 환경에서 실패한다
  //      · 파일 변경일과 페이지 콘텐츠 변경일이 늘 같지는 않다
  //      · 공통 컴포넌트를 고치면 여러 페이지가 바뀌는데 그건 잡히지 않는다
  //
  //    lastModified 는 선택 항목이다. 실제 수정일을 관리할 체계가 생기기 전까지는
  //    **없는 편이 매 빌드마다 거짓 날짜를 보내는 것보다 낫다.**
  const staticEntries: MetadataRoute.Sitemap = staticPages.map((p) => ({
    url: p.path ? `${BASE_URL}/${p.path}` : BASE_URL,
    changeFrequency: p.freq,
    priority: p.priority,
  }));

  const blogEntries: MetadataRoute.Sitemap = blogPosts
    .filter((post) => post.published !== false)
    .map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      // 블로그는 실제 날짜를 안다. 검토했으면 검토일, 아니면 작성일.
      //
      // post.date 는 `2026.05.02`, reviewedAt 은 `2026-08-29` 로 표기가 섞여 있다.
      // 점 표기는 표준 형식이 아니라 Date 해석이 환경에 따라 달라지므로,
      // Article 구조화 데이터와 같은 toIsoDate 로 맞춘 뒤 넣는다.
      lastModified: new Date(toIsoDate(post.reviewedAt ?? post.date)),
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  return [...staticEntries, ...blogEntries];
}
