import { describe, it, expect, afterEach } from "vitest";
import { validatePolicyMeta } from "@/lib/policy/types";
import {
  STRESS_RATE,
  DSR_APPLICATION_THRESHOLD_WON,
  CREDIT_STRESS_GATE_WON,
  METRO_MORTGAGE_MINIMUM_PCT,
  LOCAL_MORTGAGE_PHASE_RATIO,
  LOCAL_MORTGAGE_DEFERRAL_UNTIL,
  CREDIT_ASSESSMENT_TERM_YEARS,
  CREDIT_STRESS_RATIO_TABLE,
  DSR_POLICY_META,
  DSR_LIMIT,
  getCreditStressRatePct,
  getMortgageStressRatePct,
  isLocalDeferralActive,
} from "@/lib/policy/dsr";

const 억 = 100_000_000;

// STRESS_RATE.currentPct 를 흔들어 파생 전파를 확인하기 위한 헬퍼.
// as const 라 타입상 읽기전용이므로 캐스팅해서 임시 변경한다.
const mutable = STRESS_RATE as unknown as { currentPct: number };
const ORIGINAL = STRESS_RATE.currentPct;
afterEach(() => {
  mutable.currentPct = ORIGINAL;
});

describe("정책 메타데이터", () => {
  it("PolicyMeta 필수 필드를 모두 만족한다", () => {
    expect(validatePolicyMeta(DSR_POLICY_META)).toEqual([]);
  });

  it("재검증 트리거가 법 시행일이 아니라 반기 발표·관리방안이다", () => {
    expect(DSR_POLICY_META.nextReviewHint).toMatch(/반기 발표/);
    expect(DSR_POLICY_META.nextReviewHint).toMatch(/가계부채 관리방안/);
  });

  it("확인하지 못한 항목이 unsupported 에 남아 있다", () => {
    const joined = DSR_POLICY_META.unsupported.join(" ");
    expect(joined).toMatch(/분할상환/);
    expect(joined).toMatch(/4단계/);
    expect(joined).toMatch(/마이너스통장/);
  });
});

describe("두 개의 1억원", () => {
  it("값은 같지만 별도 상수로 분리되어 있다", () => {
    expect(DSR_APPLICATION_THRESHOLD_WON).toBe(1 * 억);
    expect(CREDIT_STRESS_GATE_WON).toBe(1 * 억);
  });
});

describe("신용대출 게이팅", () => {
  it("총잔액 1억원 이하면 스트레스 미적용", () => {
    expect(
      getCreditStressRatePct({ fixedTerm: "other", creditTotalWon: 1 * 억 }),
    ).toBe(0);
  });

  it("총잔액 1억원 초과면 스트레스 적용", () => {
    expect(
      getCreditStressRatePct({
        fixedTerm: "other",
        creditTotalWon: 1 * 억 + 1,
      }),
    ).toBe(1.5);
  });

  it("기존 8천 + 신규 3천 = 1.1억 → 합산 기준으로 적용", () => {
    const 기존 = 80_000_000;
    const 신규 = 30_000_000;
    expect(
      getCreditStressRatePct({
        fixedTerm: "other",
        creditTotalWon: 기존 + 신규,
      }),
    ).toBe(1.5);
  });
});

describe("신용대출 금리유형별 적용비율", () => {
  const 초과 = 1.5 * 억;

  it("5년 이상 고정 → 0% (1억 초과여도 가산 없음)", () => {
    expect(
      getCreditStressRatePct({ fixedTerm: "fixed5plus", creditTotalWon: 초과 }),
    ).toBe(0);
  });

  it("3~5년 고정 → 60% = 0.9%p", () => {
    expect(
      getCreditStressRatePct({ fixedTerm: "fixed3to5", creditTotalWon: 초과 }),
    ).toBe(0.9);
  });

  it("그 밖 → 100% = 1.5%p", () => {
    expect(
      getCreditStressRatePct({ fixedTerm: "other", creditTotalWon: 초과 }),
    ).toBe(1.5);
  });

  it("테이블 비율은 0 / 0.6 / 1 세 가지뿐이다", () => {
    expect(CREDIT_STRESS_RATIO_TABLE.entries.map((e) => e.value)).toEqual([
      0, 0.6, 1,
    ]);
  });
});

describe("지역 격리 — 지방 유예는 주담대 한정", () => {
  it("지방 주담대는 0.75%", () => {
    expect(
      getMortgageStressRatePct({ region: "local", asOf: "2026-08-25" }),
    ).toBe(0.75);
  });

  it("수도권·규제지역 주담대는 3.0%", () => {
    expect(
      getMortgageStressRatePct({ region: "metro", asOf: "2026-08-25" }),
    ).toBe(3.0);
  });

  it("신용대출은 지역 인자를 받지 않으며 전국 1.5%", () => {
    // getCreditStressRatePct 시그니처에 region 이 없다는 것이 핵심.
    // 지방이라고 0.75 로 깎이지 않는다.
    expect(
      getCreditStressRatePct({ fixedTerm: "other", creditTotalWon: 2 * 억 }),
    ).toBe(1.5);
    expect(
      getCreditStressRatePct({ fixedTerm: "other", creditTotalWon: 2 * 억 }),
    ).not.toBe(0.75);
  });
});

describe("지방 유예 만료", () => {
  it("2026-12-31 까지는 유효", () => {
    expect(isLocalDeferralActive("2026-12-31")).toBe(true);
    expect(LOCAL_MORTGAGE_DEFERRAL_UNTIL).toBe("2026-12-31");
  });

  it("만료 후에는 값을 추정하지 않고 null 을 돌려준다", () => {
    expect(isLocalDeferralActive("2027-01-01")).toBe(false);
    expect(
      getMortgageStressRatePct({ region: "local", asOf: "2027-01-01" }),
    ).toBeNull();
  });

  it("만료되어도 수도권은 영향 없다", () => {
    expect(
      getMortgageStressRatePct({ region: "metro", asOf: "2027-01-01" }),
    ).toBe(3.0);
  });
});

describe("단일 출처 파생 — 반기 스트레스 금리 변경 전파", () => {
  it("currentPct 를 2.0 으로 바꾸면 신용대출과 지방 주담대가 함께 움직인다", () => {
    mutable.currentPct = 2.0;

    expect(
      getCreditStressRatePct({ fixedTerm: "other", creditTotalWon: 2 * 억 }),
    ).toBe(2.0);
    expect(
      getCreditStressRatePct({
        fixedTerm: "fixed3to5",
        creditTotalWon: 2 * 억,
      }),
    ).toBe(1.2); // 2.0 × 60%
    expect(
      getMortgageStressRatePct({ region: "local", asOf: "2026-08-25" }),
    ).toBe(1.0); // 2.0 × 50%
  });

  it("수도권은 강화 하한 3.0 이 하한으로 동작한다", () => {
    mutable.currentPct = 2.0;
    expect(
      getMortgageStressRatePct({ region: "metro", asOf: "2026-08-25" }),
    ).toBe(3.0); // max(2.0, 3.0)

    mutable.currentPct = 3.5; // 이론적 상황 (현재 상한은 3.0)
    expect(
      getMortgageStressRatePct({ region: "metro", asOf: "2026-08-25" }),
    ).toBe(3.5); // 고정값 해석이었다면 3.0 이 나왔을 것
  });

  it("현재 값에서는 하한 해석과 고정값 해석이 구분되지 않는다", () => {
    // 이 사실을 테스트로 남겨 둔다 — 값이 바뀔 때만 갈린다.
    expect(STRESS_RATE.currentPct).toBeLessThan(METRO_MORTGAGE_MINIMUM_PCT);
    expect(STRESS_RATE.maxPct).toBeLessThanOrEqual(METRO_MORTGAGE_MINIMUM_PCT);
  });
});

describe("그 밖의 상수", () => {
  it("현재 스트레스 금리는 하한에 걸려 있다", () => {
    expect(STRESS_RATE.currentPct).toBe(STRESS_RATE.minPct);
    expect(STRESS_RATE.applicableHalf).toBe("2026-H2");
  });

  it("신용대출 산정만기 5년, 지방 적용비율 50%", () => {
    expect(CREDIT_ASSESSMENT_TERM_YEARS).toBe(5);
    expect(LOCAL_MORTGAGE_PHASE_RATIO).toBe(0.5);
  });

  it("DSR 한도 은행 40 / 비은행 50", () => {
    expect(DSR_LIMIT).toEqual({ bank: 40, nonbank: 50 });
  });
});
