import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://머니계산기.kr"),

  title: {
    default: "머니계산기 | 무료 금융 계산기",
    template: "%s | 머니계산기",
  },

  description:
    "대출이자 계산기, 원리금균등·원금균등 상환 계산기, 전세대출 계산기, 중도상환 계산기를 무료로 제공합니다.",

  keywords: [
    "대출이자계산기",
    "원리금균등상환",
    "원금균등상환",
    "전세대출계산기",
    "중도상환계산기",
    "금융계산기",
  ],

  openGraph: {
    title: "머니계산기 | 무료 금융 계산기",
    description: "대출이자, 원리금, 전세대출 계산기를 무료로 이용하세요.",
    url: "https://머니계산기.kr",
    siteName: "머니계산기",
    locale: "ko_KR",
    type: "website",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" data-scroll-behavior="smooth">
      <head>
        {/* 🔥 애드센스 코드 추가 */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6405509957088169"
          crossOrigin="anonymous"
        ></script>
      </head>

      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
