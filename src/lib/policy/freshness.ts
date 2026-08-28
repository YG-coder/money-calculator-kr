// src/lib/policy/freshness.ts
// ─────────────────────────────────────────────
// 정책 검증일 노후화 판정
//
// 상태 3단계
//   fresh     검토 기한 전. 정상.
//   reviewDue 검토 기한 경과. **개발 단계 경고만.** 계산은 그대로 한다.
//   expired   효력 종료가 확인됨. 계산을 막는다.
//
// ⚠️ reviewDue 를 사용자 화면에 띄우지 않는다.
//    검증일이 오래됐다는 사실만으로 정책값이 틀렸다고 볼 수 없다.
//    "이 값은 오래됐을 수 있습니다" 같은 문구는 근거 없는 불안만 준다.
//    화면 차단은 효력이 실제로 만료됐거나 지원 불가가 확정된 경우에만 한다.
//
// ⚠️ expired 판정은 여기서 '알리는' 것이지 '막는' 것이 아니다.
//    실제 차단은 각 엔진의 런타임 unsupported 처리가 담당한다.
//    (예: getMortgageStressRatePct 가 지방 유예 만료 후 null 을 돌려주는 것)
//    이 모듈은 그 항목을 개발 단계에서 함께 훑기 위한 것이다.
//
// ⚠️ 날짜 판정 함수는 기준일을 **인자로 받는다.**
//    내부에서 new Date() 를 쓰면 테스트가 실행 날짜에 따라 깨진다.
// ─────────────────────────────────────────────

import type { PolicyMeta } from "@/lib/policy/types";

export type PolicyFreshness = "fresh" | "reviewDue" | "expired";

export interface FreshnessReport {
  id: string;
  status: PolicyFreshness;
  verifiedAt: string;
  reviewBy?: string;
  effectiveUntil?: string;
  /** 개발 단계에 출력할 한 줄. fresh 면 null */
  message: string | null;
}

/**
 * 기준일(asOf) 시점의 상태를 판정한다.
 *
 * 우선순위: effectiveUntil 경과(expired) > reviewBy 경과(reviewDue) > fresh
 * 두 날짜 모두 **그 날까지는 유효**하다. 즉 asOf === reviewBy 는 아직 fresh 다.
 */
export function getPolicyFreshness(
  meta: PolicyMeta,
  asOf: string,
): PolicyFreshness {
  if (meta.effectiveUntil !== undefined && asOf > meta.effectiveUntil) {
    return "expired";
  }
  if (meta.reviewBy !== undefined && asOf > meta.reviewBy) {
    return "reviewDue";
  }
  return "fresh";
}

export function buildFreshnessReport(
  meta: PolicyMeta,
  asOf: string,
): FreshnessReport {
  const status = getPolicyFreshness(meta, asOf);

  const message =
    status === "expired"
      ? `[${meta.id}] 적용 종료일 ${meta.effectiveUntil} 이 지났습니다 ` +
        `(기준일 ${asOf}). 런타임 차단이 걸려 있는지 확인하세요.` +
        (meta.nextReviewHint ? ` — ${meta.nextReviewHint}` : "")
      : status === "reviewDue"
        ? `[${meta.id}] 검토 기한 ${meta.reviewBy} 이 지났습니다 ` +
          `(마지막 검증 ${meta.verifiedAt}, 기준일 ${asOf}). 값이 틀렸다는 뜻은 아닙니다.` +
          (meta.nextReviewHint ? ` — ${meta.nextReviewHint}` : "")
        : null;

  return {
    id: meta.id,
    status,
    verifiedAt: meta.verifiedAt,
    reviewBy: meta.reviewBy,
    effectiveUntil: meta.effectiveUntil,
    message,
  };
}

/** 여러 정책을 한 번에 훑는다. fresh 인 항목은 빠진다. */
export function collectStalePolicies(
  metas: PolicyMeta[],
  asOf: string,
): FreshnessReport[] {
  return metas
    .map((m) => buildFreshnessReport(m, asOf))
    .filter((r) => r.status !== "fresh");
}
