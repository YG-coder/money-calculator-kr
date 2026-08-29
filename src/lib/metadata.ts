import type { Metadata } from "next";

export const SITE_NAME = "머니계산기";

/**
 * 콘텐츠 작성 주체. 블로그 화면과 Article 구조화 데이터의 author 로 쓴다.
 *
 * 개인 실명이나 별도 운영사 브랜드를 전면에 내세우지 않고, 사이트 안에서
 * 일관되게 이해되는 편집 주체 명칭을 사용한다.
 */
export const SITE_AUTHOR = "머니계산기 편집팀";
export const BASE_URL = "https://머니계산기.kr";

/**
 * 공용 Open Graph 대표 이미지 (`public/og-default.png`, 1200×630).
 *
 * 페이지별로 다르게 만들지 않는다. 지금은 공유 미리보기에서 "어느 사이트인지"만
 * 알아보면 충분하고, 페이지마다 이미지를 생성하면 문구가 실제 화면과 어긋날 때
 * 관리가 안 된다. 필요해지면 그때 페이지별로 나눈다.
 *
 * 문구는 모바일 공유 미리보기의 가운데 크롭에서도 잘리지 않도록 중앙에 모아 두었다.
 */
export const OG_IMAGE = {
  url: `${BASE_URL}/og-default.png`,
  width: 1200,
  height: 630,
  alt: "머니계산기 - 금융 결정을 숫자로 먼저 확인하세요. 대출 · 부동산 · 저축 계산기",
} as const;

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
      images: [OG_IMAGE],
    },

    twitter: {
      card: "summary_large_image",
      title:
        typeof title === "string" ? title : `${SITE_NAME} | 무료 금융 계산기`,
      description: finalDescription,
      images: [OG_IMAGE.url],
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
