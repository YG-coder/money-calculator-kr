// src/lib/handoff.ts
// ─────────────────────────────────────────────
// 계산기 간 값 인계 (부동산 자금 동선)
//
//   LTV 계산기      → 실투자금 계산기   주택가격 · 담보 기준 한도
//   실투자금 계산기 → 임대수익률 계산기 매입가 · 대출금 · 보증금
//   DSR ↔ LTV                          링크만. 값은 인계하지 않는다
//
// 원칙
//   · 인계 대상은 **금액 필드뿐**이다. 방공제·등기비용처럼 사용자가 명시적으로
//     골라야 하는 상태는 쿼리로 자동 선택하지 않는다. 조용한 기본값 금지 원칙이
//     인계 경로로 우회되면 안 된다.
//   · 수신 페이지는 받은 값을 그대로 보여주고 사용자가 수정할 수 있다.
//   · 쿼리가 없으면 수신 페이지의 동작은 인계 이전과 완전히 동일하다.
//   · 유효하지 않은 값(음수·NaN·무한대)은 링크에서 제외한다. 링크를 손으로
//     고쳐 넣은 경우는 수신 측 useCalcState 의 readUrlValue 가 한 번 더 막는다.
//
// ⚠️ 단위
//   계산 엔진은 원 단위로 계산하지만 화면 입력은 만원 단위다.
//   인계 쿼리도 **만원 단위**로 넣어야 수신 필드가 그대로 읽는다.
// ─────────────────────────────────────────────

export const CALC_PATH = {
  ltv: "/ltv-calculator",
  dsr: "/dsr-calculator",
  initialCost: "/real-estate/initial-cost-calculator",
  propertyYield: "/real-estate/property-yield-calculator",
} as const;

/**
 * 원 → 만원. 인계 쿼리에 넣을 수 있는 값이면 정수 만원, 아니면 null.
 * 음수·NaN·무한대는 null 로 떨어져 링크에서 제외된다.
 */
export function toManwonParam(won: number | null | undefined): number | null {
  if (won == null || !Number.isFinite(won) || won < 0) return null;
  return Math.round(won / 10_000);
}

/**
 * 인계 URL 을 만든다. 값이 null 인 항목은 쿼리에서 빠지며,
 * 넣을 값이 하나도 없으면 경로만 돌려준다(수신 페이지는 빈 상태로 열린다).
 */
export function buildHandoffUrl(
  path: string,
  params: Record<string, number | null>,
): string {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === null) continue;
    query.set(key, String(value));
  }

  const qs = query.toString();
  return qs ? `${path}?${qs}` : path;
}

// ─────────────────────────────────────────────
// LTV → 실투자금
//   price : 주택가격 (LTV 의 담보가치와 같은 값)
//   loan  : 담보 기준 한도 — 수신 페이지의 '대출금' 입력을 채운다
//
//   ⚠️ 담보 기준 한도는 상한이지 확정 대출액이 아니다. 실제로는 DSR·심사로
//      더 낮아질 수 있으므로 수신 페이지에서 수정할 수 있어야 한다.
// ─────────────────────────────────────────────
export function ltvToInitialCostUrl(input: {
  housePriceWon: number;
  limitWon: number;
}): string {
  return buildHandoffUrl(CALC_PATH.initialCost, {
    price: toManwonParam(input.housePriceWon),
    loan: toManwonParam(input.limitWon),
  });
}

// ─────────────────────────────────────────────
// 실투자금 → 임대수익률
//   purchasePrice : 매매가
//   loanAmount    : 대출금
//   deposit       : 임대보증금
//
//   ⚠️ 실투자금 계산기의 '실투자금'(부대비용 포함)과 수익률 계산기의
//      '실투자금'(= 매입가 − 보증금 − 대출금, 부대비용 제외)은 정의가 다르다.
//      그래서 금액을 그대로 옮기지 않고 **입력 3개만** 넘긴다.
//      두 값의 차이는 수신 페이지에서 안내한다.
// ─────────────────────────────────────────────
export function initialCostToYieldUrl(input: {
  purchasePriceWon: number;
  loanWon: number;
  depositWon: number;
}): string {
  return buildHandoffUrl(CALC_PATH.propertyYield, {
    purchasePrice: toManwonParam(input.purchasePriceWon),
    loanAmount: toManwonParam(input.loanWon),
    deposit: toManwonParam(input.depositWon),
  });
}
