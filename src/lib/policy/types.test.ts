import { describe, it, expect } from "vitest";
import {
  lookupPolicy,
  validatePolicyMeta,
  formatPolicyStamp,
  type PolicyMeta,
  type PolicyTable,
} from "@/lib/policy/types";

// ⚠️ 아래는 구조 검증용 가상 데이터입니다. 실제 정책 수치가 아닙니다.
//    실제 값은 PR 1(LTV)에서 원문을 확인해 채웁니다.
const validMeta: PolicyMeta = {
  id: "test-policy",
  version: "1.0.0",
  effectiveFrom: "2026-01-01",
  verifiedAt: "2026-08-25",
  sources: [{ name: "테스트 기관 「테스트 고시」", publishedAt: "2025-12-20" }],
  supported: ["테스트 조건 A"],
  unsupported: ["테스트 조건 B"],
};

describe("validatePolicyMeta — 필수 필드", () => {
  it("올바른 메타는 문제가 없다", () => {
    expect(validatePolicyMeta(validMeta)).toEqual([]);
  });

  it("id 가 비면 걸러낸다", () => {
    expect(validatePolicyMeta({ ...validMeta, id: "  " })).toContain(
      "id 가 비어 있습니다.",
    );
  });

  it("version 은 MAJOR.MINOR.PATCH 형식이어야 한다", () => {
    expect(validatePolicyMeta({ ...validMeta, version: "1.0" }).length).toBe(1);
    expect(validatePolicyMeta({ ...validMeta, version: "v1" }).length).toBe(1);
  });

  it("기준일·검증일은 YYYY-MM-DD 형식이어야 한다", () => {
    expect(
      validatePolicyMeta({ ...validMeta, effectiveFrom: "2026/01/01" }).length,
    ).toBeGreaterThan(0);
    expect(
      validatePolicyMeta({ ...validMeta, verifiedAt: "2026-8-25" }).length,
    ).toBe(1);
  });

  it("검증일이 기준일보다 앞서면 걸러낸다", () => {
    expect(
      validatePolicyMeta({ ...validMeta, verifiedAt: "2025-01-01" }),
    ).toContain("verifiedAt 이 effectiveFrom 보다 앞섭니다.");
  });

  it("종료일이 기준일보다 앞서면 걸러낸다", () => {
    expect(
      validatePolicyMeta({ ...validMeta, effectiveUntil: "2025-06-30" }),
    ).toContain("effectiveUntil 이 effectiveFrom 보다 앞섭니다.");
  });

  it("종료일은 선택 항목이라 없어도 문제가 아니다", () => {
    expect(
      validatePolicyMeta({ ...validMeta, effectiveUntil: "2026-12-31" }),
    ).toEqual([]);
  });

  it("출처는 최소 1건이어야 하고 이름이 필요하다", () => {
    expect(validatePolicyMeta({ ...validMeta, sources: [] })).toContain(
      "sources 가 최소 1건 필요합니다.",
    );
    expect(
      validatePolicyMeta({ ...validMeta, sources: [{ name: "" }] }),
    ).toContain("sources[0].name 이 비어 있습니다.");
  });

  it("지원 범위는 비어 있으면 안 되고, 제외 범위는 빈 배열이어도 된다", () => {
    expect(validatePolicyMeta({ ...validMeta, supported: [] })).toContain(
      "supported 가 최소 1건 필요합니다.",
    );
    expect(validatePolicyMeta({ ...validMeta, unsupported: [] })).toEqual([]);
  });
});

// ── 조회 ──
type Cond = { region: "a" | "b"; houses: 1 | 2 };

const table: PolicyTable<Cond, number> = {
  meta: validMeta,
  entries: [
    { conditions: { region: "a", houses: 2 }, value: 30 }, // 구체적 조건이 앞
    { conditions: { region: "a" }, value: 70 }, // region 만 지정 (houses 와일드카드)
  ],
};

describe("lookupPolicy — 조건 조회", () => {
  it("구체적 조건이 먼저 매치된다", () => {
    const r = lookupPolicy(table, { region: "a", houses: 2 });
    expect(r.status).toBe("ok");
    if (r.status === "ok") expect(r.value).toBe(30);
  });

  it("생략한 조건 키는 와일드카드로 동작한다", () => {
    const r = lookupPolicy(table, { region: "a", houses: 1 });
    expect(r.status).toBe("ok");
    if (r.status === "ok") expect(r.value).toBe(70);
  });

  it("매치되는 항목이 없으면 값을 추정하지 않고 unsupported 를 돌려준다", () => {
    const r = lookupPolicy(table, { region: "b", houses: 1 });
    expect(r.status).toBe("unsupported");
    if (r.status === "unsupported") expect(r.reason).toBeTruthy();
  });

  it("어떤 결과든 메타데이터를 함께 돌려준다", () => {
    expect(lookupPolicy(table, { region: "a", houses: 1 }).meta.id).toBe(
      "test-policy",
    );
    expect(lookupPolicy(table, { region: "b", houses: 1 }).meta.id).toBe(
      "test-policy",
    );
  });
});

describe("formatPolicyStamp — 화면 고지 문구", () => {
  it("기준일·최종 확인일·출처를 담는다", () => {
    const s = formatPolicyStamp(validMeta);
    expect(s).toContain("기준일 2026-01-01");
    expect(s).toContain("최종 확인 2026-08-25");
    expect(s).toContain("테스트 기관");
  });

  it("적용 종료일이 있으면 함께 표시한다", () => {
    expect(
      formatPolicyStamp({ ...validMeta, effectiveUntil: "2026-12-31" }),
    ).toContain("적용 종료 2026-12-31");
  });
});
