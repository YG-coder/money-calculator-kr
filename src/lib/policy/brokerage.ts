// src/lib/policy/brokerage.ts
// 중개보수 상한요율 정책 — 2026-08-25 기준
//
// ⚠️ 정책값만 담습니다. 계산은 @/lib/initialCost 에서 합니다.
//    값 수정 시 반드시 같은 커밋에서 verifiedAt 과 sources 를 갱신하세요.
//
// 조사 근거: docs/policies/BROKERAGE-POLICY-2026-08.md (rev.2)

import type { PolicyMeta } from "@/lib/policy/types";

// ─────────────────────────────────────────────
// 적용 기준
//
// 주택 중개보수는 국토교통부령이 정하는 범위 안에서 시·도 조례로 정합니다
// (공인중개사법 제32조 제4항). 즉 부령의 표는 상한이고 실제 적용은 조례입니다.
//
// 서울·경기는 조례가 국토부 상한과 일치함을 확인했으나, 나머지 15개 시·도는
// 확인하지 못했습니다. 미확인 지역에 서울 표를 조용히 반환하면 확인하지 않은
// 조례를 확정값처럼 보여주게 되므로, 지역 분기를 만들지 않고 국토부 상한
// 하나로 계산한 뒤 그 사실을 화면에 고지합니다.
// ─────────────────────────────────────────────

export const BROKERAGE_BASIS = "nationalCeiling" as const;

/** 조례가 국토부 상한과 일치함을 확인한 시·도 */
export const VERIFIED_LOCAL_ORDINANCES = ["서울특별시", "경기도"] as const;

export const BROKERAGE_META: PolicyMeta = {
  id: "brokerage-fee",
  version: "1.0.0",
  // 요율의 적용 시작일. 조례 버전(2022-12-30 시행, 서울특별시조례 제8585호)과 다릅니다.
  effectiveFrom: "2021-12-30",
  verifiedAt: "2026-08-28",
  sources: [
    { name: "공인중개사법 제32조 제4항, 같은 법 시행규칙 제20조 [별표 1]" },
    { name: "서울특별시 주택 중개보수 등에 관한 조례 제2조 별표1" },
    { name: "경기부동산포털 중개보수 요율 안내" },
    { name: "한국공인중개사협회 중개보수 요율표" },
    {
      name: "국토교통부 「공인중개사법 시행령·시행규칙 개정」 (2026-08-28 시행) — 주택 상한요율 불변 확인",
      publishedAt: "2026-08-11",
    },
  ],
  supported: ["주택 매매·교환 6구간 상한요율과 한도액", "국토교통부 상한 기준"],
  unsupported: [
    "시·도별 조례 요율차(서울·경기 외 미확인)",
    "주택 임대차 중개보수",
    "오피스텔·상가·토지 중개보수",
    "간이과세 중개사 부가가치세",
    "복합용도 건축물 면적 판정",
    "동일 당사자 복수 거래 산정",
  ],
  note:
    "현행 서울 조례 버전은 2022-12-30 시행(서울특별시조례 제8585호)이나 별표1의 요율 숫자는 " +
    "2021-12-30 개정값이 유지된다. 표의 값은 상한이며 실제 보수는 이 범위 안에서 협의로 정한다. " +
    "부가가치세는 별도(일반과세 10%). " +
    "2026-08-28 시행 개정(2026-08-11 공포)은 한국공인중개사협회 법정화, 공동관리비 확인·설명 의무, " +
    "주거용 오피스텔 중개보수 결정방식 명확화가 내용이며 주택 상한요율 [별표 1] 변경은 확인되지 않았다. " +
    "(근거 등급 2차 — 국토교통부 보도자료를 인용한 기사 2건. 국가법령정보센터 원문 대조는 하지 못했다)",
  nextReviewHint:
    "공인중개사법 시행규칙 [별표 1] 개정 시 / 시·도 조례 개정 시.",
};

// ─────────────────────────────────────────────
// 주택 매매·교환 상한요율
//   구간 경계는 "미만 / 이상" 기준입니다.
//   예: 5천만원 "미만" 0.6% → 정확히 5천만원이면 다음 구간(0.5%)
// ─────────────────────────────────────────────

export interface BrokerageBand {
  /** 이 값 "미만"이면 이 구간. null 이면 상한 없음(마지막 구간) */
  belowWon: number | null;
  /** 상한요율 (소수, 0.006 = 0.6%) */
  rate: number;
  /** 한도액(원). 없으면 null */
  capWon: number | null;
  label: string;
}

export const SALE_BROKERAGE_BANDS: BrokerageBand[] = [
  { belowWon: 50_000_000, rate: 0.006, capWon: 250_000, label: "5천만원 미만" },
  {
    belowWon: 200_000_000,
    rate: 0.005,
    capWon: 800_000,
    label: "5천만원 이상 2억원 미만",
  },
  {
    belowWon: 900_000_000,
    rate: 0.004,
    capWon: null,
    label: "2억원 이상 9억원 미만",
  },
  {
    belowWon: 1_200_000_000,
    rate: 0.005,
    capWon: null,
    label: "9억원 이상 12억원 미만",
  },
  {
    belowWon: 1_500_000_000,
    rate: 0.006,
    capWon: null,
    label: "12억원 이상 15억원 미만",
  },
  { belowWon: null, rate: 0.007, capWon: null, label: "15억원 이상" },
];

/** 부가가치세율 — 일반과세 기준. 간이과세는 다를 수 있어 지원하지 않습니다. */
export const BROKERAGE_VAT_RATE = 0.1;

export interface BrokerageBandResult {
  band: BrokerageBand;
  /** 요율만 적용한 금액 (한도 적용 전) */
  rawFeeWon: number;
  /** 한도 적용 후 최대 중개보수 (VAT 제외) */
  maxFeeWon: number;
  /** 한도액이 실제로 금액을 결정했는지 */
  capApplied: boolean;
}

/**
 * 거래금액(원) → 상한요율 기준 최대 중개보수.
 * 매매의 거래금액은 매매가격 그대로입니다.
 */
export function calcMaxBrokerageFee(
  dealAmountWon: number,
): BrokerageBandResult | null {
  if (!(dealAmountWon > 0)) return null;

  const band =
    SALE_BROKERAGE_BANDS.find(
      (b) => b.belowWon === null || dealAmountWon < b.belowWon,
    ) ?? SALE_BROKERAGE_BANDS[SALE_BROKERAGE_BANDS.length - 1];

  const rawFeeWon = Math.floor(dealAmountWon * band.rate);
  const maxFeeWon =
    band.capWon === null ? rawFeeWon : Math.min(rawFeeWon, band.capWon);

  return {
    band,
    rawFeeWon,
    maxFeeWon,
    capApplied: band.capWon !== null && rawFeeWon > band.capWon,
  };
}
