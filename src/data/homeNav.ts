// src/data/homeNav.ts
// ─────────────────────────────────────────────
// 홈 화면의 탐색 데이터.
//
// ⚠️ 계산기 정보는 CALC 한 곳에만 둔다.
//    개편 전 홈은 QUICK_CALCS / POPULAR / LOAN_CALCS / REALESTATE_CALCS /
//    FINANCE_CALCS 다섯 배열에 같은 계산기를 중복 등록해, 설명 문구가 배열마다
//    다르고 '인기/추천/신규' 배지도 서로 어긋나 있었다.
//    아래 섹션들은 CALC 의 **키만** 참조한다.
//
// ⚠️ 배지는 두지 않는다. '인기·추천'을 뒷받침할 실측 데이터가 없고,
//    2년 된 계산기에 '신규'가 붙어 있는 상태였다.
// ─────────────────────────────────────────────

export interface CalcEntry {
  title: string;
  /** 카드에 쓰는 한 줄 설명. 무엇을 계산하는지만 적는다 */
  desc: string;
  href: string;
}

export const CALC = {
  dsr: {
    title: "DSR 계산기",
    desc: "연소득과 기존 부채로 소득 기준 대출 한도를 확인합니다. 스트레스 DSR 반영.",
    href: "/dsr-calculator",
  },
  ltv: {
    title: "LTV 계산기",
    desc: "지역·주택 수별 담보인정비율로 담보 기준 한도를 확인합니다.",
    href: "/ltv-calculator",
  },
  loanInterest: {
    title: "대출이자 계산기",
    desc: "원금·금리·기간으로 월 이자와 총 이자를 계산합니다.",
    href: "/loan-interest-calculator",
  },
  amortization: {
    title: "원리금상환 계산기",
    desc: "원리금균등·원금균등을 비교하고 월별 상환 스케줄을 봅니다.",
    href: "/amortization-calculator",
  },
  jeonseLoan: {
    title: "전세대출 계산기",
    desc: "보증금·금리로 한도와 월 이자, 자기 부담금을 계산합니다.",
    href: "/jeonse-loan-calculator",
  },
  prepayment: {
    title: "중도상환 계산기",
    desc: "수수료를 빼고도 실질 이득이 있는지 확인합니다.",
    href: "/prepayment-calculator",
  },
  refinance: {
    title: "대환대출 계산기",
    desc: "갈아탈 때 줄어드는 이자와 부대비용을 비교합니다.",
    href: "/refinance-calculator",
  },
  initialCost: {
    title: "실투자금 계산기",
    desc: "취득세·중개보수·등기비용까지 더해 실제로 필요한 현금을 계산합니다.",
    href: "/real-estate/initial-cost-calculator",
  },
  acquisitionTax: {
    title: "취득세 계산기",
    desc: "주택 수·취득가액별 취득세와 농특세·지방교육세를 계산합니다.",
    href: "/real-estate/acquisition-tax-calculator",
  },
  jeonseVsWolse: {
    title: "월세 vs 전세 계산기",
    desc: "보증금의 기회비용과 월세 총비용을 같은 기준으로 비교합니다.",
    href: "/real-estate/jeonse-vs-wolse-calculator",
  },
  propertyYield: {
    title: "임대수익률 계산기",
    desc: "월세·대출이자·부대비용을 반영해 매입가 기준·자기자본 수익률을 봅니다.",
    href: "/real-estate/property-yield-calculator",
  },
  jeonseWolseConversion: {
    title: "전월세 전환율 계산기",
    desc: "보증금을 월세로 돌릴 때의 전환율과 법정 상한을 비교합니다.",
    href: "/real-estate/jeonse-wolse-conversion",
  },
  vacancy: {
    title: "공실률 영향 계산기",
    desc: "공실이 임대수입과 순수익을 얼마나 줄이는지 계산합니다.",
    href: "/real-estate/vacancy-impact",
  },
  exchange: {
    title: "환전 계산기",
    desc: "매매기준율과 수수료율로 우대 전후 적용 환율과 절약액을 계산합니다.",
    href: "/finance/exchange",
  },
  deposit: {
    title: "예금 이자 계산기",
    desc: "예치금·금리·기간으로 세전·세후 이자와 만기 수령액을 계산합니다.",
    href: "/finance/deposit",
  },
  installmentSavings: {
    title: "적금 이자 계산기",
    desc: "월 납입액 기준 총 납입액과 예상 이자를 계산합니다.",
    href: "/finance/installment-savings",
  },
  compound: {
    title: "복리 계산기",
    desc: "원금과 월 추가 납입의 기간별 복리 증가액을 계산합니다.",
    href: "/finance/compound",
  },
  goalSavings: {
    title: "목표 저축 계산기",
    desc: "목표금액·월납입·기간 중 둘을 정하면 나머지를 역산합니다.",
    href: "/finance/goal-savings",
  },
} as const satisfies Record<string, CalcEntry>;

export type CalcKey = keyof typeof CALC;

// ─────────────────────────────────────────────
// 목적별 시작 영역 — 홈의 핵심
//
//   "계산기가 무엇이 있나"가 아니라
//   "내 상황에서는 무엇부터 계산해야 하나"에 답한다.
//
//   cards : 카드로 노출 (홈 전체에서 6개를 넘지 않는다)
//   more  : 같은 목적의 나머지 계산기. 칩 링크로만 노출한다
// ─────────────────────────────────────────────

export interface PurposeGroup {
  id: string;
  title: string;
  /** "이런 상황에서 시작하세요" 한 줄 */
  when: string;
  /**
   * 대표 시작 CTA. 그룹마다 **하나만** 둔다.
   *
   * ⚠️ 같은 크기 카드를 여러 개 두면 "무엇부터 눌러야 하나"를 사용자가 다시
   *    고민하게 된다. 홈의 목적은 그 고민을 없애는 것이다.
   */
  primary: CalcKey;
  /** 대표 CTA 아래 한 줄 보충. 함께 봐야 하는 것이 있을 때만 */
  primaryNote?: string;
  /** 보조 계산기. 작은 링크로만 노출한다 */
  secondary: CalcKey[];
}

export const PURPOSE_GROUPS: PurposeGroup[] = [
  {
    id: "limit",
    title: "얼마나 빌릴 수 있는지 알아보기",
    when: "대출을 앞두고 한도부터 가늠해야 할 때. 소득으로 감당되는 금액을 먼저 봅니다.",
    primary: "dsr",
    primaryNote:
      "주택담보대출이라면 LTV도 함께 확인하세요. DSR과 LTV 기준을 모두 충족해야 하며, 금융회사의 심사 결과에 따라 실제 한도는 더 낮을 수 있습니다.",
    secondary: [
      "ltv",
      "loanInterest",
      "amortization",
      "jeonseLoan",
      "prepayment",
      "refinance",
    ],
  },
  {
    id: "house",
    title: "집을 사거나 임대 투자 준비하기",
    when: "매수를 검토 중이거나 임대 수익을 따져 볼 때. 매매가 외에 세금·중개보수·등기비용이 함께 나갑니다.",
    primary: "initialCost",
    primaryNote:
      "매매가만 준비하면 부족합니다. 취득세·중개보수·등기비용을 더한 금액이 실제로 필요합니다.",
    secondary: [
      "acquisitionTax",
      "jeonseVsWolse",
      "propertyYield",
      "jeonseWolseConversion",
      "vacancy",
    ],
  },
  {
    id: "cash",
    title: "저축하고 현금 관리하기",
    when: "목돈을 모으거나 굴릴 때, 그리고 외화를 바꿔야 할 때.",
    // 저축의 출발점은 "얼마를 모아야 하나"이므로 목표 저축을 대표로 둔다.
    // 예·적금 이자 계산은 목표가 정해진 뒤의 단계다.
    primary: "goalSavings",
    primaryNote:
      "목표 금액과 기간을 정하면 매달 얼마를 넣어야 하는지 역산합니다.",
    secondary: ["deposit", "installmentSavings", "compound", "exchange"],
  },
];

// ─────────────────────────────────────────────
// 부동산 자금 흐름 — 이 사이트의 차별점
//
// ⚠️ 값 인계 범위를 정확히 적는다. 네 계산기가 자동으로 모두 이어지는 것처럼
//    보이면 안 된다. 실제 동작:
//      LTV      → 실투자금   주택가격·담보 기준 한도 인계
//      실투자금 → 수익률     매입가·대출·보증금·부대비용 인계
//      DSR     ↔ LTV        상호 링크만. 입력값은 이어지지 않는다
//                            (요구 입력이 겹치지 않아 넘길 값이 없다)
// ─────────────────────────────────────────────

export interface FlowStep {
  step: number;
  calc: CalcKey;
  headline: string;
  detail: string;
  /** 다음 단계로 넘어갈 때의 실제 동작 */
  handoff: string | null;
}

export const MONEY_FLOW: FlowStep[] = [
  {
    step: 1,
    calc: "dsr",
    headline: "소득 기준 한도",
    detail: "연소득과 기존 부채로 갚을 수 있는 한도를 봅니다.",
    handoff: "입력값은 이어지지 않습니다 — 두 계산기가 요구하는 값이 다릅니다.",
  },
  {
    step: 2,
    calc: "ltv",
    headline: "담보 기준 한도",
    detail:
      "주택가격과 지역·주택 수로 담보가 감당하는 한도를 봅니다. DSR과 LTV 기준을 모두 충족해야 하며, 금융회사의 심사 결과에 따라 실제 한도는 더 낮을 수 있습니다.",
    handoff: "주택가격과 한도가 다음 단계로 이어집니다.",
  },
  {
    step: 3,
    calc: "initialCost",
    headline: "실제 필요한 현금",
    detail:
      "매매가에 취득세·중개보수·등기비용을 더해 준비해야 할 금액을 봅니다.",
    handoff: "매입가·대출·보증금·부대비용이 다음 단계로 이어집니다.",
  },
  {
    step: 4,
    calc: "propertyYield",
    headline: "투자 결과",
    detail: "월세와 대출이자를 넣어 자기자본 수익률을 확인합니다.",
    handoff: null,
  },
];

// ─────────────────────────────────────────────
// 전체 계산기 찾기 — 허브로 보낸다.
//
// ⚠️ 계산기 전체 목록은 Footer 가 이미 담고 있다. 홈에서 같은 목록을 반복하면
//    스크롤만 길어지므로, 홈은 카테고리 진입점까지만 제공한다.
// ─────────────────────────────────────────────

// ⚠️ 계산기 개수를 적지 않는다. 중앙 레지스트리가 없어 하드코딩한 숫자는
//    계산기를 추가할 때마다 낡는다. 전체 목록을 한곳에서 산출할 수 있게 되면
//    그때 자동 계산해서 표기한다.
export const CATEGORY_HUBS = [
  {
    title: "대출 계산기",
    href: "/loan",
    desc: "이자·상환 방식·한도·갈아타기까지",
  },
  {
    title: "부동산 계산기",
    href: "/real-estate",
    desc: "세금·실투자금·수익률·전세와 월세",
  },
  {
    title: "금융 계산기",
    href: "/finance",
    desc: "예금·적금·복리·물가·환전",
  },
];
