// src/lib/date.ts

/**
 * 사이트에서 쓰는 날짜 문자열을 ISO(`YYYY-MM-DD`) 형태로 맞춘다.
 *
 * 블로그 글의 `date` 는 `2026.05.02` 처럼 점으로 구분돼 있고, `reviewedAt` 은
 * `2026-08-29` 처럼 이미 ISO 다. 두 값이 섞여서 `new Date()` 로 들어간다.
 *
 * ⚠️ 점으로 구분된 날짜는 ECMAScript 표준 형식이 아니다. 표준 밖 문자열의 해석은
 *    구현에 맡겨져 있어서 실행 환경에 따라 결과가 달라질 수 있고, 표준 ISO 로
 *    인식되면 UTC 자정, 아니면 로컬 자정으로 잡혀 하루가 어긋나기도 한다.
 *    지금 Node 에서 통한다고 해서 기대는 대상은 아니다.
 *
 *    그래서 `Date` 에 넣기 전에 반드시 이 함수를 거친다. 사이트맵의 `lastModified`
 *    와 블로그 `Article` 구조화 데이터가 같은 변환을 쓰게 하려고 공통으로 뺐다.
 *
 * 값을 검증하지는 않는다. 구분자만 바꾸고, 끝에 붙은 점(`2026.05.02.`)만 떼어낸다.
 */
export function toIsoDate(value: string): string {
  return value.trim().replace(/\./g, "-").replace(/-$/, "");
}
