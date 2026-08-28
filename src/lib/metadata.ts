import type { Metadata } from "next";

export const SITE_NAME = "머니계산기";

/**
 * 콘텐츠 발행 주체. Article 구조화 데이터의 author·publisher 로 쓴다.
 *
 * ⚠️ About 페이지에 실제로 적혀 있는 운영자다. 개인 실명이 확인되지 않았으므로
 *    Organization 으로 둔다. 없는 사람을 만들어 넣지 않는다.
 */
export const SITE_AUTHOR = "Incomelab (인컴랩)";
export const BASE_URL = "https://머니계산기.kr";

type BuildMetadataOptions = Omit<Partial<Metadata>, "title"> & {
  slug?: string;
  title?: Metadata["title"];
};

export function buildMetadata({
  slug,
  title,
  description,
  ...rest
}: BuildMetadataOptions): Metadata {
  const canonical = slug ? `${BASE_URL}/${slug}` : BASE_URL;

  const finalDescription =
    description ??
    "대출이자 계산기, 원리금균등·원금균등 상환 계산기, 전세대출 계산기, 중도상환 계산기를 무료로 제공합니다.";

  return {
    metadataBase: new URL(BASE_URL),

    title:
      title ??
      ({
        default: `${SITE_NAME} | 무료 금융 계산기`,
        template: `%s | ${SITE_NAME}`,
      } as Metadata["title"]),

    description: finalDescription,

    openGraph: {
      title:
        typeof title === "string" ? title : `${SITE_NAME} | 무료 금융 계산기`,
      description: finalDescription,
      siteName: SITE_NAME,
      type: "website",
      locale: "ko_KR",
      url: canonical,
    },

    twitter: {
      card: "summary_large_image",
      title:
        typeof title === "string" ? title : `${SITE_NAME} | 무료 금융 계산기`,
      description: finalDescription,
    },

    robots: {
      index: true,
      follow: true,
    },

    alternates: {
      canonical,
    },

    ...rest,
  };
}
