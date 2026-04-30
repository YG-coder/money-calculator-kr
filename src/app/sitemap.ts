// src/app/sitemap.ts
import type { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/metadata";
import { blogPosts } from "@/data/blogPosts";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages = [
    { path: "", priority: 1.0, freq: "daily" },
    { path: "loan-interest-calculator", priority: 0.9, freq: "monthly" },
    { path: "amortization-calculator", priority: 0.9, freq: "monthly" },
    { path: "jeonse-loan-calculator", priority: 0.9, freq: "monthly" },
    { path: "prepayment-calculator", priority: 0.9, freq: "monthly" },
    { path: "real-estate/acquisition-tax-calculator", priority: 0.9, freq: "monthly" },
    { path: "real-estate/rent-vs-jeonse-calculator", priority: 0.9, freq: "monthly" },
    { path: "blog", priority: 0.8, freq: "daily" },
    { path: "about", priority: 0.6, freq: "monthly" },
    { path: "contact", priority: 0.5, freq: "monthly" },
    { path: "terms", priority: 0.4, freq: "yearly" },
    { path: "privacy-policy", priority: 0.4, freq: "yearly" },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((p) => ({
    url: p.path ? `${BASE_URL}/${p.path}` : BASE_URL,
    lastModified: now,
    changeFrequency: p.freq,
    priority: p.priority,
  }));

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticEntries, ...blogEntries];
}