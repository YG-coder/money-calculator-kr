// src/lib/policy/ltv.ts
// LTV 정책 테이블 — 2026-08-25 기준
//
// ⚠️ 이 파일은 정책값만 담습니다. 계산은 @/lib/ltv 에서 합니다.
//    값을 수정할 때는 반드시 같은 커밋에서 verifiedAt 과 sources 를 갱신하세요.
//
// 조사 근거: docs/policies/LTV-POLICY-2026-08.md (rev.4)

import type { PolicyMeta, PolicyTable } from "@/lib/policy/types";

// ─────────────────────────────────────────────
// 조건 축
//
// ⚠️ lib/dsr.ts 의 Region("metro" | "local")과 이름이 겹치지만 의미가 다릅니다.
//    DSR은 2분법, LTV는 3분법입니다. 두 타입을 서로 대입하지 마세요.
// ─────────────────────────────────────────────

/** 규제지역 / 수도권 비규제 / 비수도권 비규제 */
export type LtvRegion = "regulated" | "metroUnregulated" | "nonMetroUnregulated";

/** 무주택(처분조건부 1주택 포함) / 생애최초 / 유주택(1주택 비처분·다주택) */
export type BorrowerType = "noHouse" | "firstTime" | "owner";

export interface LtvCondition {
  region: LtvRegion;
  borrower: BorrowerType;
}

export const LTV_REGION_LABEL: Record<LtvRegion, string> = {
  regulated: "규제지역",
  metroUnregulated: "수도권 비규제",
  nonMetroUnregulated: "비수도권",
};

export const BORROWER_LABEL: Record<BorrowerType, string> = {
  noHouse: "무주택",
  firstTime: "생애최초",
  owner: "유주택",
};

// ─────────────────────────────────────────────
// LTV 비율 (%)
// ─────────────────────────────────────────────

const LTV_META: PolicyMeta = {
  id: "ltv",
  version: "1.0.0",
  effectiveFrom: "2025-10-16", // 10·15 대책 시행일
  verifiedAt: "2026-08-25",
  sources: [
    {
      name: "10·15 주택시장 안정화 대책 (부동산관계장관회의 의결안)",
      url: "https://www.molit.go.kr/USR/NEWS/m_71/dtl.jsp?id=95091308",
      publishedAt: "2025-10-15",
    },
    {
      name: "금융위원회 「2025년 가계부채 관리 강화 방안」 — 수도권 유주택 LTV 0%",
      url: "https://www.fsc.go.kr/po010101/84824",
    },
    {
      name: "금융위원회 「2026년도 가계부채 관리방안」",
      url: "https://www.fsc.go.kr/no010101/86606",
      publishedAt: "2026-04-01",
    },
    {
      name: "금융위원회 8·13 대책 브리핑 — 현행 수치 재확인",
      publishedAt: "2026-08-13",
    },
  ],
  supported: [
    "주택구입 목적 은행 주택담보대출",
    "규제지역 / 수도권 비규제 / 비수도권 비규제",
    "무주택(처분조건부 1주택 포함) / 생애최초 / 유주택",
  ],
  unsupported: [
    "DTI",
    "서민·실수요자 우대",
    "정책대출(디딤돌·보금자리론·신생아 특례)",
    "생활안정자금 목적 주택담보대출",
    "후순위·추가담보대출",
    "전세대출·전세퇴거자금·임대사업자대출·신탁대출",
    "비주택 담보(오피스텔·상가·토지)",
  ],
  note: "처분조건부 1주택자는 무주택자와 동일하게 적용합니다.",
  nextReviewHint: "가계부채 관리방안 발표 시 / 부동산 대책 발표 시",
};

/** 조건 → LTV 비율(%). 앞에 올수록 우선하지만 9개 조합이 모두 명시되어 있어 순서 의존이 없습니다. */
export const LTV_TABLE: PolicyTable<LtvCondition, number> = {
  meta: LTV_META,
  entries: [
    // 규제지역
    { conditions: { region: "regulated", borrower: "noHouse" }, value: 40 },
    { conditions: { region: "regulated", borrower: "firstTime" }, value: 70 },
    { conditions: { region: "regulated", borrower: "owner" }, value: 0 },
    // 수도권 비규제 — 유주택 0%는 금융위 2025년 가계부채 관리 강화 방안 근거
    { conditions: { region: "metroUnregulated", borrower: "noHouse" }, value: 70 },
    { conditions: { region: "metroUnregulated", borrower: "firstTime" }, value: 70 },
    { conditions: { region: "metroUnregulated", borrower: "owner" }, value: 0 },
    // 비수도권 비규제
    { conditions: { region: "nonMetroUnregulated", borrower: "noHouse" }, value: 70 },
    { conditions: { region: "nonMetroUnregulated", borrower: "firstTime" }, value: 80 },
    { conditions: { region: "nonMetroUnregulated", borrower: "owner" }, value: 60 },
  ],
};

// ─────────────────────────────────────────────
// 주택가격 구간별 절대한도
//   적용 범위: 수도권 · 규제지역. 비수도권 비규제는 미적용.
//   구간 조건이 "범위"라 lookupPolicy(동등 비교)를 쓰지 않고 전용 함수로 조회합니다.
// ─────────────────────────────────────────────

export const ABSOLUTE_CAP_META: PolicyMeta = {
  id: "ltv-absolute-cap",
  version: "1.0.0",
  effectiveFrom: "2025-10-16",
  verifiedAt: "2026-08-25",
  sources: [
    {
      name: "10·15 주택시장 안정화 대책 — “수도권·규제지역 내 주택가격 수준에 따라 차등 적용”",
      url: "https://www.molit.go.kr/USR/NEWS/m_71/dtl.jsp?id=95091308",
      publishedAt: "2025-10-15",
    },
    {
      name: "금융위원회 「10·15 대책 정책문답」",
      url: "https://www.fsc.go.kr/po020201/85518",
      publishedAt: "2025-10-15",
    },
  ],
  supported: ["수도권·규제지역의 주택구입 목적 주택담보대출"],
  unsupported: ["비수도권 비규제지역(절대한도 자체가 없음)", "생활안정자금 목적 대출"],
  note: "LTV 한도와 중첩 적용되며, 차감을 마친 대출 실행액에 걸립니다.",
  nextReviewHint: "대출한도 정책 변경 시",
};

/** 절대한도 구간 (원). 경계는 이하/초과 기준. */
const ABSOLUTE_CAP_BANDS: { maxPriceWon: number | null; capWon: number }[] = [
  { maxPriceWon: 1_500_000_000, capWon: 600_000_000 }, // 15억 이하 → 6억
  { maxPriceWon: 2_500_000_000, capWon: 400_000_000 }, // 15억 초과 25억 이하 → 4억
  { maxPriceWon: null, capWon: 200_000_000 }, // 25억 초과 → 2억
];

/** 절대한도가 적용되는 지역인지 */
export function hasAbsoluteCap(region: LtvRegion): boolean {
  return region === "regulated" || region === "metroUnregulated";
}

/** 해당 지역·주택가격의 절대한도(원). 적용되지 않는 지역이면 null. */
export function getAbsoluteCapWon(
  region: LtvRegion,
  housePriceWon: number,
): number | null {
  if (!hasAbsoluteCap(region)) return null;
  if (housePriceWon <= 0) return null;

  for (const band of ABSOLUTE_CAP_BANDS) {
    if (band.maxPriceWon === null || housePriceWon <= band.maxPriceWon) {
      return band.capWon;
    }
  }
  return null;
}

// ─────────────────────────────────────────────
// 방공제(소액임차보증금 최우선변제금) — 참고값
//
// ⚠️ 이 금액은 화면에 "참고값 / 입력 보조"로만 제공합니다.
//    공제 건수를 자동 산정하지 않습니다 — 일반 은행 주담대의 공제방수 내규를
//    확인하지 못했기 때문입니다(조사 문서 5.3절). 사용자가 금액을 직접 입력합니다.
// ─────────────────────────────────────────────

export type DepositArea = "seoul" | "overcrowded" | "metroCity" | "other";

export const ROOM_DEDUCTION_META: PolicyMeta = {
  id: "small-deposit-priority",
  version: "1.0.0",
  effectiveFrom: "2023-02-21", // ← 금액 조항의 적용 시작일 (법령 버전이 아님)
  verifiedAt: "2026-08-25",
  sources: [
    {
      name: "주택임대차보호법 시행령 제10조·제11조",
      url: "https://www.law.go.kr/LSW/lsLinkCommonInfo.do?chrClsCd=010202&lspttninfSeq=130113",
    },
    {
      name: "주택임대차보호법 제8조, 시행령 부칙 제2조",
      url: "https://www.law.go.kr/LSW/lsRvsDocListP.do?chrClsCd=010202&lsId=004950&lsRvsGubun=all",
    },
    {
      name: "한국주택금융공사 소액임차보증금 안내",
      url: "https://www.hf.go.kr/ko/sub02/sub02_02_02.do",
    },
  ],
  supported: ["지역별 법정 금액 4구간 (참고 제공용)"],
  unsupported: [
    "공제 건수 자동 산정(일반 은행 내규 미확인)",
    "임대차가 있는 경우",
    "후순위·추가담보대출의 과거 시행령 소급",
    "복합용도 건축물 상가 부분",
  ],
  note:
    "현행 시행령 버전은 대통령령 제36423호(시행 2026-07-01)이나, 제10조·제11조 금액은 " +
    "2023-02-21 개정값이 유지되고 있다. effectiveFrom 은 법령 버전이 아니라 금액의 적용 시작일이다.",
  nextReviewHint: "주택임대차보호법 시행령 제10조·제11조 금액 개정 시",
};

/** 지역별 최우선변제금(원) — 참고값 */
export const ROOM_DEDUCTION_REFERENCE: {
  area: DepositArea;
  label: string;
  amountWon: number;
}[] = [
  { area: "seoul", label: "서울특별시", amountWon: 55_000_000 },
  {
    area: "overcrowded",
    label: "과밀억제권역(서울 제외)·세종·용인·화성·김포",
    amountWon: 48_000_000,
  },
  {
    area: "metroCity",
    label: "광역시(군 제외)·안산·광주(경기)·파주·이천·평택",
    amountWon: 28_000_000,
  },
  { area: "other", label: "그 밖의 지역", amountWon: 25_000_000 },
];
