// src/lib/calcInput.ts
// 계산기 입력값 파싱과 "현재 렌더 기준" 상태 읽기 유틸 — 순수 함수만. React/Next 의존 없음.
//
// useCalcState 에서 분리한 이유
//   1) 훅은 react·next/navigation 을 import 하므로 단위 테스트에서 다루기 번거롭다.
//   2) 파싱 규칙(쉼표·소수점·빈 값·잘못된 입력)은 훅과 무관한 순수 규칙이라 따로 검증하는 편이 낫다.
//
// ⚠️ sanitize / toDisplay 는 useCalcState 에 있던 구현을 그대로 옮긴 것이다. 동작 변경 없음.
//    훅은 이 모듈을 import 해 쓰고, 기존 공개 타입은 훅에서 계속 re-export 한다.

export type FieldKind = "money" | "integer" | "decimal";

export type FieldState = {
  value: string; // 화면 표시용 (천 단위 콤마 포함)
  raw: string; // 계산용 원본 문자열 (콤마 없음)
  error: string;
};

export type CalcState = Record<string, FieldState>;

// ─────────────────────────────────────────────
// 입력 파싱
// ─────────────────────────────────────────────

/** 사용자 입력 → 계산용 raw 문자열. money/integer 는 숫자만, decimal 은 소수점 1개까지 허용. */
export function sanitize(input: string, kind: FieldKind): string {
  const value = input.replace(/,/g, "").trim();

  if (!value) return "";

  if (kind === "money" || kind === "integer") {
    return value.replace(/[^\d]/g, "");
  }

  const cleaned = value.replace(/[^\d.]/g, "");
  const parts = cleaned.split(".");

  if (parts.length <= 1) return cleaned;

  return `${parts[0]}.${parts.slice(1).join("")}`;
}

/**
 * URL 쿼리로 들어온 값이 이 필드에 넣어도 되는 값인지 판정한다.
 *
 * ⚠️ sanitize() 는 "입력 도중"을 다루는 함수라서 허용 문자만 남긴다.
 *    그래서 URL 로 "-5000" 이 들어오면 부호가 떨어져 나가 5000 이 된다.
 *    사용자가 타이핑으로는 만들 수 없는 값이지만 URL 로는 만들 수 있고,
 *    음수를 양수로 바꿔 계산하는 것은 조용한 오답이다.
 *
 *    따라서 URL 에서 읽을 때는 sanitize 전에 이 검사를 먼저 통과시키고,
 *    통과하지 못하면 그 파라미터를 **무시**한다(=필드 기본값을 쓴다).
 *
 * 허용: "5000", "5,000", " 5000 ", 소수 필드의 "4.5"
 * 무시: "-5000", "abc", "1e5", "NaN", "Infinity", "4.5"(정수 필드), ""
 */
export function isValidUrlValue(input: string, kind: FieldKind): boolean {
  const value = input.replace(/,/g, "").trim();
  if (!value) return false;

  const pattern = kind === "decimal" ? /^\d+(\.\d+)?$/ : /^\d+$/;
  if (!pattern.test(value)) return false;

  return Number.isFinite(Number(value));
}

/**
 * URL 파라미터 하나를 읽는다. 값이 없거나 유효하지 않으면 fallback 을 돌려준다.
 * 반환값은 아직 sanitize 전 문자열이다.
 */
export function readUrlValue(
  urlValue: string | null | undefined,
  fallback: string,
  kind: FieldKind,
): string {
  if (urlValue == null) return fallback;
  return isValidUrlValue(urlValue, kind) ? urlValue : fallback;
}

/** raw 문자열 → 화면 표시 문자열. 입력 도중의 "1234." / "1234.50" 형태를 보존한다. */
export function toDisplay(raw: string, kind: FieldKind): string {
  if (!raw) return "";

  if (kind === "money" || kind === "integer") {
    if (isNaN(Number(raw))) return raw;
    return Number(raw).toLocaleString("ko-KR");
  }

  if (/\.$/.test(raw) || /\.\d*0$/.test(raw)) {
    const [intPart, decPart = ""] = raw.split(".");
    const formattedInt =
      intPart === "" || isNaN(Number(intPart))
        ? intPart
        : Number(intPart).toLocaleString("ko-KR");

    return raw.endsWith(".")
      ? `${formattedInt}.`
      : `${formattedInt}.${decPart}`;
  }

  if (raw.includes(".")) {
    const [intPart, decPart = ""] = raw.split(".");
    const formattedInt =
      intPart === "" || isNaN(Number(intPart))
        ? intPart
        : Number(intPart).toLocaleString("ko-KR");

    return `${formattedInt}.${decPart}`;
  }

  if (isNaN(Number(raw))) return raw;
  return Number(raw).toLocaleString("ko-KR");
}

// ─────────────────────────────────────────────
// 현재 렌더의 상태를 읽는 유틸
//
// ⚠️ 왜 필요한가
//   useCalcState 가 돌려주는 getWon()/getNum() 은 useEffect 로 갱신되는 latestStateRef 를
//   읽는다. useMemo 는 렌더 중에 실행되고 effect 는 커밋 후에 실행되므로, 입력 직후의
//   렌더에서는 ref 가 아직 이전 상태를 들고 있다 → 마지막 입력이 결과에 반영되지 않는다.
//   (같은 버그로 fix(dsr)/fix(calc) 커밋이 세 번 나갔다.)
//
//   아래 유틸은 ref 가 아니라 인자로 받은 state 를 읽으므로 렌더 시점 값과 항상 일치한다.
//   신규·수정 계산기는 useMemo 안에서 getWon/getNum 대신 반드시 이 유틸을 사용할 것.
// ─────────────────────────────────────────────

/** 현재 렌더 기준 raw 문자열. 미입력이면 "". */
export function readRaw(state: CalcState, key: string): string {
  return state[key]?.raw ?? "";
}

/** 현재 렌더 기준 숫자. 빈 값·파싱 불가는 0. */
export function readNum(state: CalcState, key: string): number {
  const n = Number(readRaw(state, key) || "0");
  return isNaN(n) ? 0 : n;
}

/** 현재 렌더 기준 원 단위 금액. 입력 단위(만원) × 10,000. */
export function readWon(state: CalcState, key: string): number {
  return readNum(state, key) * 10_000;
}

/**
 * 값이 입력되었는지 여부.
 * 0 은 유효한 입력이므로(금리 0%, 수수료 0%) truthy 검사 대신 이 함수를 쓸 것.
 */
export function isFilled(state: CalcState, key: string): boolean {
  return readRaw(state, key) !== "";
}
