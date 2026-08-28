import { describe, it, expect } from "vitest";
import type { PolicyMeta } from "@/lib/policy/types";
import { validatePolicyMeta } from "@/lib/policy/types";
import {
  getPolicyFreshness,
  buildFreshnessReport,
  collectStalePolicies,
} from "@/lib/policy/freshness";

const base: PolicyMeta = {
  id: "test",
  version: "1.0.0",
  effectiveFrom: "2026-01-01",
  verifiedAt: "2026-01-01",
  sources: [{ name: "테스트 근거" }],
  supported: ["테스트"],
  unsupported: [],
};

describe("getPolicyFreshness — 기준일을 인자로 받는다", () => {
  it("reviewBy 가 없으면 언제나 fresh", () => {
    expect(getPolicyFreshness(base, "2099-12-31")).toBe("fresh");
  });

  it("검토 기한 당일까지는 fresh", () => {
    const m = { ...base, reviewBy: "2026-06-30" };
    expect(getPolicyFreshness(m, "2026-06-29")).toBe("fresh");
    expect(getPolicyFreshness(m, "2026-06-30")).toBe("fresh");
  });

  it("검토 기한을 넘기면 reviewDue", () => {
    const m = { ...base, reviewBy: "2026-06-30" };
    expect(getPolicyFreshness(m, "2026-07-01")).toBe("reviewDue");
  });

  it("적용 종료일 당일까지는 만료가 아니다", () => {
    const m = { ...base, effectiveUntil: "2026-12-31" };
    expect(getPolicyFreshness(m, "2026-12-31")).toBe("fresh");
    expect(getPolicyFreshness(m, "2027-01-01")).toBe("expired");
  });

  it("효력 만료가 검토 기한보다 우선한다", () => {
    const m = {
      ...base,
      reviewBy: "2026-06-30",
      effectiveUntil: "2026-12-31",
    };
    expect(getPolicyFreshness(m, "2026-07-01")).toBe("reviewDue");
    expect(getPolicyFreshness(m, "2027-01-01")).toBe("expired");
  });

  it("같은 메타라도 기준일에 따라 답이 달라진다 — 실행 날짜에 의존하지 않는다", () => {
    const m = { ...base, reviewBy: "2026-06-30" };
    expect(getPolicyFreshness(m, "2026-01-01")).toBe("fresh");
    expect(getPolicyFreshness(m, "2030-01-01")).toBe("reviewDue");
  });
});

describe("buildFreshnessReport — 개발 단계 메시지", () => {
  it("fresh 면 메시지가 없다", () => {
    expect(buildFreshnessReport(base, "2026-02-01").message).toBeNull();
  });

  it("reviewDue 메시지는 '틀렸다는 뜻이 아니다'를 명시한다", () => {
    const m = {
      ...base,
      reviewBy: "2026-06-30",
      nextReviewHint: "관리방안 발표 시",
    };
    const r = buildFreshnessReport(m, "2026-07-01");

    expect(r.status).toBe("reviewDue");
    expect(r.message).toContain("검토 기한 2026-06-30");
    expect(r.message).toContain("값이 틀렸다는 뜻은 아닙니다");
    expect(r.message).toContain("관리방안 발표 시");
  });

  it("expired 메시지는 런타임 차단 확인을 요구한다", () => {
    const m = { ...base, effectiveUntil: "2026-12-31" };
    const r = buildFreshnessReport(m, "2027-01-01");

    expect(r.status).toBe("expired");
    expect(r.message).toContain("런타임 차단");
  });
});

describe("collectStalePolicies", () => {
  it("fresh 인 항목은 빠진다", () => {
    const metas = [
      { ...base, id: "a", reviewBy: "2099-01-01" },
      { ...base, id: "b", reviewBy: "2026-01-01" },
      { ...base, id: "c", effectiveUntil: "2026-01-01" },
    ];
    const stale = collectStalePolicies(metas, "2026-06-01");

    expect(stale.map((s) => s.id)).toEqual(["b", "c"]);
    expect(stale.map((s) => s.status)).toEqual(["reviewDue", "expired"]);
  });

  it("전부 fresh 면 빈 배열", () => {
    expect(collectStalePolicies([base], "2026-06-01")).toEqual([]);
  });
});

describe("validatePolicyMeta — reviewBy 형식", () => {
  it("YYYY-MM-DD 가 아니면 문제로 잡는다", () => {
    expect(validatePolicyMeta({ ...base, reviewBy: "2026/12/01" })).toContain(
      "reviewBy 가 YYYY-MM-DD 형식이 아닙니다.",
    );
  });

  it("올바른 형식은 통과한다", () => {
    expect(validatePolicyMeta({ ...base, reviewBy: "2026-12-01" })).toEqual([]);
  });

  it("생략해도 된다", () => {
    expect(validatePolicyMeta(base)).toEqual([]);
  });
});
