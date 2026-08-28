// src/lib/date.test.ts

import { describe, expect, it } from "vitest";
import { toIsoDate } from "./date";

describe("toIsoDate", () => {
  it("점으로 구분된 날짜를 ISO 로 바꾼다", () => {
    expect(toIsoDate("2026.05.02")).toBe("2026-05-02");
  });

  it("이미 ISO 인 값은 그대로 둔다", () => {
    expect(toIsoDate("2026-08-29")).toBe("2026-08-29");
  });

  it("끝에 붙은 점을 떼어낸다", () => {
    expect(toIsoDate("2026.05.02.")).toBe("2026-05-02");
  });

  it("앞뒤 공백을 없앤다", () => {
    expect(toIsoDate("  2026.05.02  ")).toBe("2026-05-02");
  });

  it("변환한 값은 UTC 자정으로 파싱된다", () => {
    // 점 표기를 그대로 넣으면 로컬 자정으로 잡혀 시간대에 따라 하루가 밀린다.
    expect(new Date(toIsoDate("2026.05.02")).toISOString()).toBe(
      "2026-05-02T00:00:00.000Z",
    );
  });
});
