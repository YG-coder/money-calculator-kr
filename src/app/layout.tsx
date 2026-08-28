// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { OG_IMAGE } from "@/lib/metadata";

export const metadata: Metadata = {
  metadataBase: new URL("https://머니계산기.kr"),

  title: {
    default: "머니계산기 | 무료 금융·부동산 계산기",
    template: "%s | 머니계산기",
  },

  description:
    "대출이자·원리금·전세대출·중도상환·취득세·월세 vs 전세 계산기를 무료로 제공합니다. 복잡한 금융·부동산 계산을 쉽고 빠르게.",

  keywords: [
    "대출이자계산기",
    "원리금균등상환",
    "원금균등상환",
    "전세대출계산기",
    "중도상환계산기",
    "취득세계산기",
    "월세전세비교",
    "부동산계산기",
    "금융계산기",
    "머니계산기",
  ],

  // 🔥 구글 + 네이버 인증 (핵심)
  verification: {
    google: "esF2Zr1HJuwM5slp-24iq4uYhUHTAeTz49oERjMm73k",
    other: {
      "naver-site-verification": "bc4843cbf5606163e8d5e3a5433f37cfdb974828",
    },
  },

  authors: [{ name: "머니계산기", url: "https://머니계산기.kr" }],
  creator: "머니계산기",
  publisher: "머니계산기",

  openGraph: {
    title: "머니계산기 | 무료 금융·부동산 계산기",
    description: "대출이자·원리금·취득세·월세 vs 전세 계산기를 무료로 이용하세요.",
    url: "https://머니계산기.kr",
    siteName: "머니계산기",
    locale: "ko_KR",
    type: "website",
    // 각 페이지는 buildMetadata 로 자기 openGraph 를 만들어 덮어쓴다.
    // 여기는 그걸 빠뜨린 페이지가 생겼을 때의 기본값이다.
    images: [OG_IMAGE],
  },

  twitter: {
    card: "summary_large_image",
    title: "머니계산기 | 무료 금융·부동산 계산기",
    description: "대출이자·원리금·취득세·월세 vs 전세 계산기를 무료로 이용하세요.",
    images: [OG_IMAGE.url],
  },

  robots: { index: true, follow: true },

  alternates: { canonical: "https://머니계산기.kr" },

  category: "finance",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" data-scroll-behavior="smooth">
      <head>
        {/* 🔥 애드센스 */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6405509957088169"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
