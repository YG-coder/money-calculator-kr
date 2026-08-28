// src/lib/policy/currency.ts
// 통화 고시 단위 메타데이터
//
// ⚠️ 이 파일에는 환율도 스프레드도 두지 않습니다.
//
//    당초 확장 계획에는 "통화별 현찰 스프레드 기본값"을 두기로 되어 있었으나,
//    스프레드는 은행·상품·시점마다 다르고 검증된 공통값이 없습니다.
//    기본값을 심으면 사용자가 손대지 않았을 때 근거 없는 수수료가 조용히
//    계산에 들어가므로, **스프레드는 상수화하지 않고 사용자에게 입력받습니다.**
//
//    여기 남기는 것은 "몇 단위로 고시되는가" 하나입니다. 이건 추정값이 아니라
//    국내 은행 고시 관행이며, 틀리면 결과가 100배 어긋나므로 코드로 고정합니다.

// 조사 근거: docs/policies/EXCHANGE-POLICY-2026-08.md (rev.1)

import type { PolicyMeta } from "@/lib/policy/types";

export const CURRENCY_META: PolicyMeta = {
  id: "currency-quote-unit",
  version: "1.0.0",
  effectiveFrom: "2026-08-28", // 고시 관행 확인일 (제도 시행일이 아님)
  verifiedAt: "2026-08-28",
  sources: [
    {
      name: "우리은행 고시환율 — 일본(JPY)·인도네시아(IDR)·베트남(VND)·캄보디아(KHR)는 100단위 고시",
    },
    { name: "서울외국환중개 매매기준율 고시" },
  ],
  supported: ["고시 단위(1단위 / 100단위) 구분", "통화별 표시 소수 자릿수"],
  unsupported: [
    "환율 값 자체 (실시간 연동 없음 — 사용자 입력)",
    "은행별 현찰 스프레드 (검증된 공통값 없음 — 사용자 입력)",
    "은행별 우대율 정책",
    "송금 보내실 때·받으실 때 환율",
    "여행자수표·외화수표 환율",
  ],
  note:
    "환율과 스프레드는 이 파일에 두지 않는다. 값이 매일 바뀌고 은행마다 달라, " +
    "빌드 시점 값을 심으면 오래된 수치가 조용히 쓰인다.",
  nextReviewHint:
    "고시 단위·계산 공식·지원 통화 변경 시. 환율을 저장하지 않으므로 정기 수치 갱신은 없다.",
  // 고시 단위는 거의 바뀌지 않는다. 그래도 영구불변은 아니므로 연 1회 확인.
  reviewBy: "2027-08-28",
};

export interface CurrencyInfo {
  /** ISO 4217 코드 */
  code: string;
  /** 한글 통화명 */
  name: string;
  /** 국가·지역 */
  region: string;
  /**
   * 고시 단위. 1 또는 100.
   *
   * ⚠️ JPY 매매기준율 "950원"은 1엔이 아니라 **100엔** 값입니다.
   *    단위를 무시하면 결과가 100배 어긋납니다.
   */
  quoteUnit: 1 | 100;
  /** 외화 금액 표시 소수 자릿수 */
  decimals: number;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: "USD", name: "미국 달러", region: "미국", quoteUnit: 1, decimals: 2 },
  { code: "JPY", name: "일본 엔", region: "일본", quoteUnit: 100, decimals: 0 },
  { code: "EUR", name: "유로", region: "유럽연합", quoteUnit: 1, decimals: 2 },
  { code: "CNY", name: "중국 위안", region: "중국", quoteUnit: 1, decimals: 2 },
  {
    code: "GBP",
    name: "영국 파운드",
    region: "영국",
    quoteUnit: 1,
    decimals: 2,
  },
  { code: "AUD", name: "호주 달러", region: "호주", quoteUnit: 1, decimals: 2 },
  {
    code: "CAD",
    name: "캐나다 달러",
    region: "캐나다",
    quoteUnit: 1,
    decimals: 2,
  },
  { code: "HKD", name: "홍콩 달러", region: "홍콩", quoteUnit: 1, decimals: 2 },
  {
    code: "SGD",
    name: "싱가포르 달러",
    region: "싱가포르",
    quoteUnit: 1,
    decimals: 2,
  },
  {
    code: "CHF",
    name: "스위스 프랑",
    region: "스위스",
    quoteUnit: 1,
    decimals: 2,
  },
  { code: "THB", name: "태국 바트", region: "태국", quoteUnit: 1, decimals: 2 },
  { code: "TWD", name: "대만 달러", region: "대만", quoteUnit: 1, decimals: 2 },
  {
    code: "VND",
    name: "베트남 동",
    region: "베트남",
    quoteUnit: 100,
    decimals: 0,
  },
  {
    code: "IDR",
    name: "인도네시아 루피아",
    region: "인도네시아",
    quoteUnit: 100,
    decimals: 0,
  },
  {
    code: "PHP",
    name: "필리핀 페소",
    region: "필리핀",
    quoteUnit: 1,
    decimals: 2,
  },
  {
    code: "KHR",
    name: "캄보디아 리엘",
    region: "캄보디아",
    quoteUnit: 100,
    decimals: 0,
  },
];

export function findCurrency(code: string): CurrencyInfo | undefined {
  return CURRENCIES.find((c) => c.code === code);
}

/** 100단위 고시 통화 코드 목록 — 화면 안내에 그대로 쓴다 */
export const HUNDRED_UNIT_CODES = CURRENCIES.filter(
  (c) => c.quoteUnit === 100,
).map((c) => c.code);
