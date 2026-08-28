// src/lib/policy/registry.ts
// ─────────────────────────────────────────────
// 정책 목록 — 노후화 점검이 훑는 대상을 한곳에 모은다.
//
// 정책 테이블을 새로 만들면 **여기에 추가**한다.
// registry.test.ts 가 등록 누락을 잡아 준다.
// ─────────────────────────────────────────────

import type { PolicyMeta } from "@/lib/policy/types";
import {
  LTV_TABLE,
  ABSOLUTE_CAP_META,
  ROOM_DEDUCTION_META,
} from "@/lib/policy/ltv";
import { BROKERAGE_META } from "@/lib/policy/brokerage";
import { ACQUISITION_TAX_POLICY_META } from "@/lib/policy/acquisitionTax";
import { DSR_POLICY_META } from "@/lib/policy/dsr";
import { CURRENCY_META } from "@/lib/policy/currency";

export const ALL_POLICY_METAS: PolicyMeta[] = [
  LTV_TABLE.meta,
  ABSOLUTE_CAP_META,
  ROOM_DEDUCTION_META,
  BROKERAGE_META,
  ACQUISITION_TAX_POLICY_META,
  DSR_POLICY_META,
  CURRENCY_META,
];

// ─────────────────────────────────────────────
// PolicyMeta 로 표현되지 않는 개별 점검 항목
//
// 정책 테이블 전체가 아니라 "이 날짜에 이것 하나를 확인해야 한다"에 해당하는
// 것들이다. DSR 처럼 한 테이블 안에 만료 시점이 다른 항목이 섞여 있을 때
// 테이블의 reviewBy 하나로는 표현되지 않는다.
// ─────────────────────────────────────────────

export interface PolicyReviewItem {
  id: string;
  /** 무엇을 확인해야 하는지 */
  label: string;
  /** 기계 판독용 기한 (YYYY-MM-DD) */
  reviewBy: string;
  /** 어디를 고쳐야 하는지 */
  target: string;
  /**
   * 기한이 지나면 계산이 위험해지는 항목인가.
   *
   * true 면 런타임에 이미 차단 장치가 있어야 한다. 이 목록은 그 장치가
   * 있는지 개발 단계에서 함께 훑기 위한 것이지, 차단을 대신하지 않는다.
   */
  runtimeGuarded: boolean;
}

export const POLICY_REVIEW_ITEMS: PolicyReviewItem[] = [
  {
    id: "dsr-stress-rate-half",
    label:
      "스트레스 금리 반기 발표 (6월·12월). 발표값을 STRESS_RATE.currentPct 와 applicableHalf 에 반영",
    reviewBy: "2026-12-01",
    target: "src/lib/policy/dsr.ts — STRESS_RATE",
    runtimeGuarded: false,
  },
  {
    id: "dsr-local-deferral",
    label:
      "지방 주담대 스트레스 유예 만료. 연장 여부를 확인하고 LOCAL_MORTGAGE_DEFERRAL_UNTIL 갱신",
    reviewBy: "2026-12-31",
    target: "src/lib/policy/dsr.ts — LOCAL_MORTGAGE_DEFERRAL_UNTIL",
    // 만료 후 getMortgageStressRatePct 가 null 을 돌려주고 UI 가 계산을 막는다
    runtimeGuarded: true,
  },
  {
    id: "base-rate-mpc",
    label: "금통위 기준금리. 전월세 전환 법정 상한이 함께 움직인다",
    // ⚠️ 2026-10-22 는 2차 출처(일정 안내 자료) 기반이다.
    //    한국은행 공식 발표에서 1차로 확인되는 것은 "1·2·4·5·7·8·10·11월 개최"까지.
    reviewBy: "2026-10-22",
    target: "src/lib/realEstate.ts — CONVERSION_RATE_INFO.baseRatePct",
    runtimeGuarded: false,
  },
];
