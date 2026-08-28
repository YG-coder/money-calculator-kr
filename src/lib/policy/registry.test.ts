import { describe, it, expect } from "vitest";
import { validatePolicyMeta } from "@/lib/policy/types";
import { ALL_POLICY_METAS, POLICY_REVIEW_ITEMS } from "@/lib/policy/registry";
import {
  collectStalePolicies,
  getPolicyFreshness,
} from "@/lib/policy/freshness";

const ISO = /^\d{4}-\d{2}-\d{2}$/;

/** 오늘(Asia/Seoul). 경고 출력에만 쓰고 단정에는 쓰지 않는다. */
function todayKst(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

// ─────────────────────────────────────────────
// 구조 검사 — 실패할 수 있다
// ─────────────────────────────────────────────

describe("정책 목록 구조", () => {
  it("모든 정책 메타가 유효하다", () => {
    for (const meta of ALL_POLICY_METAS) {
      expect(validatePolicyMeta(meta), meta.id).toEqual([]);
    }
  });

  it("id 가 중복되지 않는다", () => {
    const ids = ALL_POLICY_METAS.map((m) => m.id);
    expect(new Set(ids).size, ids.join(", ")).toBe(ids.length);
  });

  it("모든 정책에 reviewBy 가 있다 — 자동 점검 대상에서 빠지지 않도록", () => {
    const missing = ALL_POLICY_METAS.filter((m) => !m.reviewBy).map(
      (m) => m.id,
    );
    expect(missing).toEqual([]);
  });

  it("reviewBy 는 verifiedAt 보다 뒤다", () => {
    for (const m of ALL_POLICY_METAS) {
      expect(
        m.reviewBy! > m.verifiedAt,
        `${m.id}: ${m.reviewBy} vs ${m.verifiedAt}`,
      ).toBe(true);
    }
  });

  it("개별 점검 항목의 날짜 형식과 id 가 올바르다", () => {
    const ids = POLICY_REVIEW_ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const item of POLICY_REVIEW_ITEMS) {
      expect(ISO.test(item.reviewBy), item.id).toBe(true);
      expect(item.label.length, item.id).toBeGreaterThan(0);
      expect(item.target.length, item.id).toBeGreaterThan(0);
    }
  });

  it("지방 주담대 유예는 런타임 차단이 있는 항목으로 표시돼 있다", () => {
    const item = POLICY_REVIEW_ITEMS.find((i) => i.id === "dsr-local-deferral");
    expect(item?.runtimeGuarded).toBe(true);
  });

  it("스트레스 금리 반기 발표와 지방 유예 만료는 별도 항목이다", () => {
    const ids = POLICY_REVIEW_ITEMS.map((i) => i.id);
    expect(ids).toContain("dsr-stress-rate-half");
    expect(ids).toContain("dsr-local-deferral");

    const half = POLICY_REVIEW_ITEMS.find(
      (i) => i.id === "dsr-stress-rate-half",
    );
    const deferral = POLICY_REVIEW_ITEMS.find(
      (i) => i.id === "dsr-local-deferral",
    );
    expect(half!.reviewBy).not.toBe(deferral!.reviewBy);
  });
});

// ─────────────────────────────────────────────
// 노후화 점검 — 경고만. 단순 노후화로 실패시키지 않는다
//
// ⚠️ 여기서 expect 를 걸면 어느 날 갑자기 빌드가 깨진다.
//    검증일이 지났다는 사실은 "확인하라"는 신호이지 오류가 아니다.
// ─────────────────────────────────────────────

describe("노후화 점검 (경고 전용)", () => {
  it("검토 기한이 지난 정책을 보고한다", () => {
    const asOf = todayKst();
    const stale = collectStalePolicies(ALL_POLICY_METAS, asOf);

    if (stale.length > 0) {
      console.warn(
        `\n⚠️  정책 검토 기한 경과 ${stale.length}건 (기준일 ${asOf})\n` +
          stale.map((s) => `   · ${s.message}`).join("\n") +
          "\n   → 원문을 다시 확인하고 verifiedAt·reviewBy 를 갱신하세요." +
          "\n   → 이 경고만으로 계산이 틀린 것은 아닙니다.\n",
      );
    }

    // 단정하지 않는다. 보고만 한다.
    expect(Array.isArray(stale)).toBe(true);
  });

  it("검토 기한이 지난 개별 항목을 보고한다", () => {
    const asOf = todayKst();
    const due = POLICY_REVIEW_ITEMS.filter((i) => asOf > i.reviewBy);

    if (due.length > 0) {
      console.warn(
        `\n⚠️  개별 점검 기한 경과 ${due.length}건 (기준일 ${asOf})\n` +
          due
            .map(
              (i) =>
                `   · [${i.id}] ${i.label}\n     기한 ${i.reviewBy} · ${i.target}` +
                (i.runtimeGuarded
                  ? "\n     (만료 시 런타임 차단이 걸려 있는 항목)"
                  : ""),
            )
            .join("\n") +
          "\n",
      );
    }

    expect(Array.isArray(due)).toBe(true);
  });
});

// ─────────────────────────────────────────────
// 회귀 — 판정이 실행 날짜에 의존하지 않는다
// ─────────────────────────────────────────────

describe("고정 기준일 회귀", () => {
  it("2026-08-28 시점에는 모든 정책이 fresh 다", () => {
    for (const m of ALL_POLICY_METAS) {
      expect(getPolicyFreshness(m, "2026-08-28"), m.id).toBe("fresh");
    }
  });

  it("2026-12-02 시점에는 DSR 이 검토 대상이 된다", () => {
    const dsr = ALL_POLICY_METAS.find((m) => m.id === "dsr-stress")!;
    expect(getPolicyFreshness(dsr, "2026-12-02")).toBe("reviewDue");
  });

  it("2027-01-01 시점에는 DSR 이 효력 만료로 잡힌다", () => {
    const dsr = ALL_POLICY_METAS.find((m) => m.id === "dsr-stress")!;
    expect(getPolicyFreshness(dsr, "2027-01-01")).toBe("expired");
  });
});
