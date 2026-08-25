// src/lib/policy/types.ts
// 정책 기반 계산기(LTV·중개보수 등)가 공유하는 최소 공통 구조.
//
// 왜 필요한가
//   현재 정책값은 두 가지 서로 다른 형태로 흩어져 있다.
//     · lib/dsr.ts        — 상수 + 파일 상단 주석 (DSR_VERIFIED_DATE, 스트레스 금리 Record)
//     · lib/realEstate.ts — CONVERSION_RATE_INFO 객체 (verifiedAt, source 필드)
//   기존 두 곳을 전면 이전하면 동작이 검증된 계산기를 건드리게 되므로 옮기지 않는다.
//   대신 신규 계산기가 쓸 형태를 여기서 하나로 정하고, 기존 값은 해당 파일을 다음에
//   손볼 때 자연스럽게 이전한다.
//
// 설계 원칙
//   · 정책 "값"과 계산 "함수"를 분리한다. 계산 함수는 이 테이블을 조회만 한다.
//   · 테이블에 없는 조건 조합은 임의 보간하지 않고 unsupported 로 되돌린다.
//     (dsr.ts 가 혼합형·주기형을 명시적으로 미지원 처리한 방식과 동일)
//   · 추상화는 여기까지. 도메인별 조건 타입은 각 정책 파일이 직접 정의한다.

// ─────────────────────────────────────────────
// 출처
// ─────────────────────────────────────────────

export interface PolicySource {
  /** 기관 + 문서명. 예: "금융위원회 「가계부채 관리방안」" */
  name: string;
  /** 원문 URL (있으면) */
  url?: string;
  /**
   * 원문 발표일 (YYYY-MM-DD).
   *
   * ⚠️ 기재 규칙
   *   원문에서 직접 확인한 발표일만 기록한다.
   *   기사 작성일·검색 결과 추정일·인접 문서 날짜는 사용하지 않는다.
   *   확인하지 못하면 필드를 생략한다.
   */
  publishedAt?: string;
}

// ─────────────────────────────────────────────
// 메타데이터
// ─────────────────────────────────────────────

export interface PolicyMeta {
  /** 테이블 식별자. 예: "ltv", "brokerage-fee" */
  id: string;

  /** 테이블 버전. 값이나 구조가 바뀌면 올린다. "MAJOR.MINOR.PATCH" */
  version: string;

  /** 기준일 — 이 값들이 실제로 적용되기 시작한 날 (YYYY-MM-DD) */
  effectiveFrom: string;

  /** 적용 종료(예정)일. 유예·한시 조치가 있을 때만 (YYYY-MM-DD) */
  effectiveUntil?: string;

  /** 마지막 검증일 — 원문을 사람이 직접 확인한 날 (YYYY-MM-DD) */
  verifiedAt: string;

  /** 출처. 최소 1건 필수 */
  sources: PolicySource[];

  /** 지원 범위 — 이 테이블이 다루는 것 */
  supported: string[];

  /** 제외 범위 — 의도적으로 다루지 않는 것. 화면 고지에 그대로 쓴다 */
  unsupported: string[];

  /** 보충 설명 */
  note?: string;

  /** 재검증 트리거. 예: "가계부채 관리방안 발표 시", "금통위 후" */
  nextReviewHint?: string;
}

// ─────────────────────────────────────────────
// 조건 → 값
// ─────────────────────────────────────────────

/**
 * 조건 한 건과 그에 대응하는 값.
 * conditions 에서 생략한 키는 와일드카드로 취급한다(모든 값에 매치).
 */
export interface PolicyEntry<TCondition extends object, TValue> {
  conditions: Partial<TCondition>;
  value: TValue;
  note?: string;
}

export interface PolicyTable<TCondition extends object, TValue> {
  meta: PolicyMeta;
  /** 앞에 올수록 우선. 구체적인 조건을 먼저 둘 것 */
  entries: PolicyEntry<TCondition, TValue>[];
}

// ─────────────────────────────────────────────
// 조회
// ─────────────────────────────────────────────

export type PolicyLookup<TCondition extends object, TValue> =
  | {
      status: "ok";
      value: TValue;
      entry: PolicyEntry<TCondition, TValue>;
      meta: PolicyMeta;
    }
  | {
      status: "unsupported";
      /** 화면에 그대로 보여줄 수 있는 사유 */
      reason: string;
      meta: PolicyMeta;
    };

/**
 * 조건에 맞는 정책값을 찾는다.
 * 매치되는 항목이 없으면 값을 추정하지 않고 unsupported 를 돌려준다.
 */
export function lookupPolicy<TCondition extends object, TValue>(
  table: PolicyTable<TCondition, TValue>,
  conditions: TCondition,
): PolicyLookup<TCondition, TValue> {
  for (const entry of table.entries) {
    const matched = (
      Object.keys(entry.conditions) as (keyof TCondition)[]
    ).every((key) => entry.conditions[key] === conditions[key]);

    if (matched) {
      return { status: "ok", value: entry.value, entry, meta: table.meta };
    }
  }

  return {
    status: "unsupported",
    reason: "이 조건 조합은 현재 지원하지 않습니다.",
    meta: table.meta,
  };
}

// ─────────────────────────────────────────────
// 검증
// ─────────────────────────────────────────────

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const SEMVER = /^\d+\.\d+\.\d+$/;

/**
 * PolicyMeta 필수 필드 검증. 문제 목록을 돌려준다(빈 배열 = 정상).
 * 정책 테이블을 추가·수정할 때 단위 테스트에서 호출해 누락을 막는다.
 */
export function validatePolicyMeta(meta: PolicyMeta): string[] {
  const problems: string[] = [];

  if (!meta.id?.trim()) problems.push("id 가 비어 있습니다.");
  if (!SEMVER.test(meta.version ?? ""))
    problems.push("version 이 MAJOR.MINOR.PATCH 형식이 아닙니다.");

  if (!ISO_DATE.test(meta.effectiveFrom ?? ""))
    problems.push("effectiveFrom 이 YYYY-MM-DD 형식이 아닙니다.");
  if (!ISO_DATE.test(meta.verifiedAt ?? ""))
    problems.push("verifiedAt 이 YYYY-MM-DD 형식이 아닙니다.");

  if (meta.effectiveUntil !== undefined) {
    if (!ISO_DATE.test(meta.effectiveUntil))
      problems.push("effectiveUntil 이 YYYY-MM-DD 형식이 아닙니다.");
    else if (meta.effectiveUntil < meta.effectiveFrom)
      problems.push("effectiveUntil 이 effectiveFrom 보다 앞섭니다.");
  }

  if (
    ISO_DATE.test(meta.verifiedAt ?? "") &&
    ISO_DATE.test(meta.effectiveFrom ?? "") &&
    meta.verifiedAt < meta.effectiveFrom
  ) {
    problems.push("verifiedAt 이 effectiveFrom 보다 앞섭니다.");
  }

  if (!meta.sources?.length) problems.push("sources 가 최소 1건 필요합니다.");
  else
    meta.sources.forEach((s, i) => {
      if (!s.name?.trim()) problems.push(`sources[${i}].name 이 비어 있습니다.`);
      if (s.publishedAt !== undefined && !ISO_DATE.test(s.publishedAt))
        problems.push(`sources[${i}].publishedAt 이 YYYY-MM-DD 형식이 아닙니다.`);
    });

  if (!meta.supported?.length)
    problems.push("supported 가 최소 1건 필요합니다.");
  if (!Array.isArray(meta.unsupported))
    problems.push("unsupported 는 배열이어야 합니다. 없으면 빈 배열로 두세요.");

  return problems;
}

/** 화면 고지용 한 줄. 예: "기준일 2026-08-08 · 최종 확인 2026-08-25 · 출처 금융위원회" */
export function formatPolicyStamp(meta: PolicyMeta): string {
  const parts = [
    `기준일 ${meta.effectiveFrom}`,
    `최종 확인 ${meta.verifiedAt}`,
    `출처 ${meta.sources.map((s) => s.name).join(", ")}`,
  ];
  if (meta.effectiveUntil) parts.splice(1, 0, `적용 종료 ${meta.effectiveUntil}`);
  return parts.join(" · ");
}
