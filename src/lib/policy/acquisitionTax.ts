import type { PolicyMeta } from "./types";

export const ACQUISITION_TAX_POLICY_META: PolicyMeta = {
  id: "acquisition-tax",
  version: "1.1.0",
  effectiveFrom: "2026-01-01",
  verifiedAt: "2026-08-25",
  sources: [
    {
      name: "지방세법 제11조·제13조의2·제151조",
      url: "https://www.law.go.kr/법령/지방세법",
    },
    {
      name: "지방세법 시행령 제28조의2·제28조의4·제28조의5",
      url: "https://www.law.go.kr/법령/지방세법시행령",
    },
    {
      name: "지방세특례제한법 제36조의3",
      url: "https://www.law.go.kr/법령/지방세특례제한법",
    },
  ],
  supported: [
    "주택 유상취득 표준·중과세율",
    "비수도권 저가주택 중과 배제",
    "생애최초 취득세 감면",
    "일시적 2주택",
  ],
  unsupported: [
    "무상취득",
    "가산세 자동 계산",
    "생애최초 자격 자동 판정",
    "출산·양육 및 미분양주택 감면",
  ],
  note: "생애최초 200만원·300만원 트랙은 사용자가 자격을 확인해 명시 선택한다.",
  nextReviewHint: "지방세법·지방세특례제한법 개정 또는 2026년 정기국회 처리 후",
};

export const NON_METRO_LOW_PRICE_LIMIT_WON = 200_000_000;
export const FIRST_HOME_REDUCTION_WON = 2_000_000;
export const FIRST_HOME_EXPANDED_REDUCTION_WON = 3_000_000;

export type FirstHomeReduction = "none" | "standard" | "expanded";

export function firstHomeReductionLimit(kind: FirstHomeReduction): number {
  if (kind === "standard") return FIRST_HOME_REDUCTION_WON;
  if (kind === "expanded") return FIRST_HOME_EXPANDED_REDUCTION_WON;
  return 0;
}
