import { describe, it, expect } from "vitest";
import { calcLtv, type LtvInput, type RoomDeductionChoice } from "@/lib/ltv";
import {
  LTV_TABLE,
  getAbsoluteCapWon,
  hasAbsoluteCap,
  ROOM_DEDUCTION_REFERENCE,
} from "@/lib/policy/ltv";
import { lookupPolicy, validatePolicyMeta } from "@/lib/policy/types";

const 억 = 100_000_000;
const 만 = 10_000;

const amount = (won: number): RoomDeductionChoice => ({
  kind: "amount",
  amountWon: won,
});

function run(over: Partial<LtvInput>) {
  const base: LtvInput = {
    housePriceWon: 10 * 억,
    region: "regulated",
    borrower: "noHouse",
    seniorDebtWon: 0,
    roomDeduction: amount(5500 * 만),
  };
  return calcLtv({ ...base, ...over });
}

/** rev.1에서 잘못 쓰던 A안 — 회귀 비교용으로만 둔다. 구현에는 존재하지 않는다. */
function legacyA(
  priceWon: number,
  ltvPct: number,
  seniorWon: number,
  roomWon: number,
  capWon: number | null,
) {
  const ltvAmount = priceWon * (ltvPct / 100);
  const capped = capWon === null ? ltvAmount : Math.min(ltvAmount, capWon);
  return Math.max(0, capped - seniorWon - roomWon);
}

// ─────────────────────────────────────────────
describe("정책 테이블", () => {
  it("LTV 메타데이터 필수 필드가 갖춰져 있다", () => {
    expect(validatePolicyMeta(LTV_TABLE.meta)).toEqual([]);
  });

  it("9개 조합이 모두 조회된다", () => {
    const expected: [string, string, number][] = [
      ["regulated", "noHouse", 40],
      ["regulated", "firstTime", 70],
      ["regulated", "owner", 0],
      ["metroUnregulated", "noHouse", 70],
      ["metroUnregulated", "firstTime", 70],
      ["metroUnregulated", "owner", 0],
      ["nonMetroUnregulated", "noHouse", 70],
      ["nonMetroUnregulated", "firstTime", 80],
      ["nonMetroUnregulated", "owner", 60],
    ];
    for (const [region, borrower, pct] of expected) {
      const r = lookupPolicy(LTV_TABLE, {
        region: region as never,
        borrower: borrower as never,
      });
      expect(r.status, `${region}/${borrower}`).toBe("ok");
      if (r.status === "ok") expect(r.value, `${region}/${borrower}`).toBe(pct);
    }
  });

  it("수도권 비규제 유주택은 60%가 아니라 0%다", () => {
    const r = lookupPolicy(LTV_TABLE, {
      region: "metroUnregulated",
      borrower: "owner",
    });
    if (r.status === "ok") expect(r.value).toBe(0);
  });

  it("절대한도는 수도권·규제지역에만 적용된다", () => {
    expect(hasAbsoluteCap("regulated")).toBe(true);
    expect(hasAbsoluteCap("metroUnregulated")).toBe(true);
    expect(hasAbsoluteCap("nonMetroUnregulated")).toBe(false);
    expect(getAbsoluteCapWon("nonMetroUnregulated", 20 * 억)).toBeNull();
  });

  it("절대한도 구간 경계 — 15억·25억은 '이하'가 낮은 구간", () => {
    expect(getAbsoluteCapWon("regulated", 15 * 억)).toBe(6 * 억);
    expect(getAbsoluteCapWon("regulated", 15 * 억 + 1)).toBe(4 * 억);
    expect(getAbsoluteCapWon("regulated", 25 * 억)).toBe(4 * 억);
    expect(getAbsoluteCapWon("regulated", 25 * 억 + 1)).toBe(2 * 억);
  });

  it("방공제 참고 금액 4구간", () => {
    expect(ROOM_DEDUCTION_REFERENCE.map((r) => r.amountWon)).toEqual([
      5500 * 만,
      4800 * 만,
      2800 * 만,
      2500 * 만,
    ]);
  });
});

// ─────────────────────────────────────────────
describe("산식 B — A안과 결과가 갈리는 케이스 (회귀 방지 핵심)", () => {
  it("케이스 1 · 수도권 20억 / 40% / 선순위 0 / 방공제 5,500만 → 4억", () => {
    const r = run({ housePriceWon: 20 * 억 });
    expect(r.status).toBe("ok");
    if (r.status !== "ok") return;
    expect(r.result.limitWon).toBe(4 * 억);
    expect(r.result.capApplied).toBe(true);
    // A안이었다면 3.45억
    expect(legacyA(20 * 억, 40, 0, 5500 * 만, 4 * 억)).toBe(3.45 * 억);
    expect(r.result.limitWon).not.toBe(legacyA(20 * 억, 40, 0, 5500 * 만, 4 * 억));
  });

  it("케이스 2 · 수도권 30억 / 40% / 선순위 1억 / 방공제 5,500만 → 2억", () => {
    const r = run({ housePriceWon: 30 * 억, seniorDebtWon: 1 * 억 });
    if (r.status !== "ok") throw new Error("ok 여야 함");
    expect(r.result.limitWon).toBe(2 * 억);
    expect(r.result.capApplied).toBe(true);
    expect(legacyA(30 * 억, 40, 1 * 억, 5500 * 만, 2 * 억)).toBe(0.45 * 억);
  });
});

describe("산식 B — A안과 결과가 같은 케이스 (단독으로는 회귀를 못 잡음)", () => {
  it("케이스 3 · 비수도권 20억 / 70% / 방공제 2,500만 → 절대한도 미적용", () => {
    const r = run({
      housePriceWon: 20 * 억,
      region: "nonMetroUnregulated",
      roomDeduction: amount(2500 * 만),
    });
    if (r.status !== "ok") throw new Error("ok 여야 함");
    expect(r.result.absoluteCapWon).toBeNull();
    expect(r.result.capApplied).toBe(false);
    expect(r.result.limitWon).toBe(13.75 * 억);
    expect(legacyA(20 * 억, 70, 0, 2500 * 만, null)).toBe(r.result.limitWon);
  });

  it("케이스 4 · 수도권 10억 / 40% / 방공제 5,500만 → 절대한도 미도달", () => {
    const r = run({});
    if (r.status !== "ok") throw new Error("ok 여야 함");
    expect(r.result.absoluteCapWon).toBe(6 * 억);
    expect(r.result.capApplied).toBe(false);
    expect(r.result.limitWon).toBe(3.45 * 억);
    expect(legacyA(10 * 억, 40, 0, 5500 * 만, 6 * 억)).toBe(r.result.limitWon);
  });
});

describe("클램프", () => {
  it("케이스 5 · 차감이 담보인정액을 넘으면 음수가 아니라 0", () => {
    const r = run({ seniorDebtWon: 4 * 억 });
    if (r.status !== "ok") throw new Error("ok 여야 함");
    expect(r.result.afterDeductionWon).toBeLessThan(0);
    expect(r.result.limitWon).toBe(0);
    expect(r.result.requiredEquityWon).toBe(10 * 억);
  });

  it("LTV 0% 조합(규제지역 유주택)은 한도 0", () => {
    const r = run({ borrower: "owner" });
    if (r.status !== "ok") throw new Error("ok 여야 함");
    expect(r.result.appliedLtvPct).toBe(0);
    expect(r.result.limitWon).toBe(0);
  });
});

// ─────────────────────────────────────────────
describe("방공제 명시 선택 게이팅", () => {
  it("선택하지 않으면 계산하지 않고 입력 필요를 돌려준다", () => {
    const r = run({ roomDeduction: { kind: "unselected" } });
    expect(r.status).toBe("needsInput");
    if (r.status === "needsInput") expect(r.missing).toContain("roomDeduction");
  });

  it("'공제 없음'을 선택하면 0원으로 계산한다", () => {
    const r = run({ roomDeduction: { kind: "none" } });
    if (r.status !== "ok") throw new Error("ok 여야 함");
    expect(r.result.roomDeductionWon).toBe(0);
    expect(r.result.limitWon).toBe(4 * 억); // 10억 × 40% − 0 − 0
  });

  it("직접 입력에 0원을 넣는 것은 허용하지 않는다 ('공제 없음'을 선택해야 함)", () => {
    const r = run({ roomDeduction: amount(0) });
    expect(r.status).toBe("needsInput");
    if (r.status === "needsInput") expect(r.missing).toContain("roomDeduction");
  });

  it("주택가격이 없으면 입력 필요", () => {
    const r = run({ housePriceWon: 0 });
    expect(r.status).toBe("needsInput");
    if (r.status === "needsInput") expect(r.missing).toContain("housePrice");
  });
});

describe("결과 구성", () => {
  it("필요 자기자금 = 주택가격 − 최종 한도", () => {
    const r = run({});
    if (r.status !== "ok") throw new Error("ok 여야 함");
    expect(r.result.requiredEquityWon).toBe(10 * 억 - r.result.limitWon);
  });

  it("정책 메타데이터를 함께 돌려준다", () => {
    const r = run({});
    if (r.status !== "ok") throw new Error("ok 여야 함");
    expect(r.result.ltvMeta.id).toBe("ltv");
    expect(r.result.ltvMeta.verifiedAt).toBe("2026-08-25");
  });
});
