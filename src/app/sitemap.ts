// src/app/sitemap.ts
import type { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/metadata";
import { blogPosts } from "@/data/blogPosts";

type StaticPage = {
  path: string;
  priority: number;
  freq: MetadataRoute.Sitemap[0]["changeFrequency"];
};

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

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

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((p) => ({
    url: p.path ? `${BASE_URL}/${p.path}` : BASE_URL,
    lastModified: now,
    changeFrequency: p.freq,
    priority: p.priority,
  }));

  const blogEntries: MetadataRoute.Sitemap = blogPosts
    .filter((post) => post.published !== false)
    .map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  return [...staticEntries, ...blogEntries];
}
