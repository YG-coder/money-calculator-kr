"use client";

import { useMemo, useState } from "react";
import { useCalcState } from "@/hooks/useCalcState";
import { readNum, readWon, isFilled } from "@/lib/calcInput";
import { formatKRW, formatUnit } from "@/lib/loan";
import {
  calcDsr,
  estimatePrincipalFromDsr,
  DSR_VERIFIED_DATE,
  LOCAL_MORTGAGE_DEFERRAL_UNTIL,
  type Region,
  type RateType,
  type DsrRepayment,
  type NewLoanKind,
  type CreditRepaymentKind,
  type CreditFixedTerm,
  type JeonseInput,
  type NewLoanInput,
  type ExistingDebtInput,
} from "@/lib/dsr";
import InputField from "@/components/calculator/InputField";
import ResultCard from "@/components/calculator/ResultCard";
import ToggleGroup from "@/components/calculator/ToggleGroup";

type Mode = "check" | "estimate";
type JeonseChoice =
  "unselected" | "none" | "noHouse" | "oneHouseMetro" | "other";

const FIELDS = [
  { key: "income", kind: "money" as const, defaultValue: "" },
  { key: "existingDebt", kind: "money" as const, defaultValue: "" },
  { key: "creditBalance", kind: "money" as const, defaultValue: "" },
  { key: "creditLineLimit", kind: "money" as const, defaultValue: "" },
  { key: "creditRate", kind: "decimal" as const, defaultValue: "" },
  { key: "jeonseInterest", kind: "money" as const, defaultValue: "" },
  { key: "amount", kind: "money" as const, defaultValue: "" },
  { key: "rate", kind: "decimal" as const, defaultValue: "" },
  { key: "months", kind: "integer" as const, defaultValue: "" },
  { key: "installmentAnnual", kind: "money" as const, defaultValue: "" },
];

// 퍼센트 표기 시 부동소수점 잔여(예: 4.05000001) 정리
const trimPct = (n: number) => Number(n.toFixed(2));

export default function DsrCalc() {
  const { state, setValue } = useCalcState(FIELDS);

  const [mode, setMode] = useState<Mode>("check");
  const [loanKind, setLoanKind] = useState<NewLoanKind>("mortgage");
  const [region, setRegion] = useState<Region>("metro");
  const [rateType, setRateType] = useState<RateType>("variable");
  const [repayment, setRepayment] = useState<DsrRepayment>("equal_payment");
  const [creditKind, setCreditKind] = useState<CreditRepaymentKind>("lumpSum");
  const [fixedTerm, setFixedTerm] = useState<CreditFixedTerm>("other");
  const [jeonse, setJeonse] = useState<JeonseChoice>("unselected");
  const [limitPercent, setLimitPercent] = useState<40 | 50>(40);

  // 금리 0%는 유효한 입력이므로 truthy 검사 대신 빈 문자열 여부로 판정
  const rateFilled = isFilled(state, "rate");

  const existing: ExistingDebtInput = useMemo(() => {
    const jeonseInput: JeonseInput =
      jeonse === "oneHouseMetro"
        ? {
            status: "oneHouseMetro",
            annualInterest: readWon(state, "jeonseInterest"),
          }
        : { status: jeonse };

    return {
      otherAnnualDebt: readWon(state, "existingDebt"),
      creditBalance: readWon(state, "creditBalance"),
      creditLineLimit: readWon(state, "creditLineLimit"),
      creditRatePercent: readNum(state, "creditRate"),
      jeonse: jeonseInput,
    };
  }, [state, jeonse]);

  const newLoan: NewLoanInput = useMemo(() => {
    if (loanKind === "mortgage") {
      return {
        kind: "mortgage",
        principal: readWon(state, "amount"),
        ratePercent: readNum(state, "rate"),
        months: readNum(state, "months"),
        repayment,
        region,
        rateType,
      };
    }
    return {
      kind: "credit",
      amount: readWon(state, "amount"),
      ratePercent: readNum(state, "rate"),
      repaymentKind: creditKind,
      fixedTerm,
      installmentAnnualDebt: readWon(state, "installmentAnnual"),
    };
  }, [state, loanKind, repayment, region, rateType, creditKind, fixedTerm]);

  const checkResult = useMemo(() => {
    if (mode !== "check") return null;
    const income = readWon(state, "income");
    const amount = readWon(state, "amount");
    if (!income || !amount || !rateFilled) return null;
    if (loanKind === "mortgage" && !readNum(state, "months")) return null;

    return calcDsr({
      annualIncome: income,
      existing,
      newLoan,
      limitPercent,
    });
  }, [state, mode, existing, newLoan, limitPercent, rateFilled, loanKind]);

  const estimateResult = useMemo(() => {
    if (mode !== "estimate") return null;
    const income = readWon(state, "income");
    if (!income || !rateFilled) return null;
    if (loanKind === "mortgage" && !readNum(state, "months")) return null;

    return estimatePrincipalFromDsr({
      annualIncome: income,
      existing,
      limitPercent,
      newLoan,
    });
  }, [state, mode, existing, newLoan, limitPercent, rateFilled, loanKind]);

  // 정책 레이어가 값을 돌려주지 않는 조건(미선택·미지원·유예 만료)은
  // 임의 대체값 없이 사유를 그대로 화면에 노출한다.
  const active = mode === "check" ? checkResult : estimateResult;
  const blockedReason = active?.status === "unsupported" ? active.reason : null;
  const checkOk = checkResult?.status === "ok" ? checkResult.value : null;
  const estimateOk =
    estimateResult?.status === "ok" ? estimateResult.value : null;
  const shown = checkOk ?? estimateOk;

  return (
    <div className="space-y-5">
      {/* ── 모드 ── */}
      <ToggleGroup<Mode>
        label="계산 모드"
        value={mode}
        onChange={setMode}
        options={[
          { value: "check", label: "DSR 확인" },
          { value: "estimate", label: "추정 가능액" },
        ]}
      />
      <p className="-mt-3 text-xs text-slate-400">
        {mode === "check"
          ? "입력한 신규 대출 기준으로 현재 DSR과 스트레스 DSR을 확인합니다."
          : "소득과 목표 DSR로 DSR 기준 추정 가능 대출액을 역산합니다."}
      </p>

      {/* ── 소득 ── */}
      <InputField
        label="연 소득 (세전)"
        name="income"
        suffix="만원"
        placeholder="예: 5,000"
        hint="단위: 만원"
        value={state.income?.value ?? ""}
        onChange={(v) => setValue("income", v)}
      />

      {/* ── 기존 부채 ── */}
      <fieldset className="space-y-4 rounded-2xl border border-slate-200 p-4">
        <legend className="px-1 text-sm font-semibold text-slate-700">
          기존 부채
        </legend>

        <InputField
          label="기타 부채 연간 원리금 (선택)"
          name="existingDebt"
          suffix="만원"
          placeholder="예: 600"
          hint="아래에 따로 입력하는 신용대출·전세대출을 제외한 나머지 부채의 DSR 산정용 연간 원리금. 금융회사 앱·상담자료의 값이 가장 정확합니다."
          value={state.existingDebt?.value ?? ""}
          onChange={(v) => setValue("existingDebt", v)}
        />

        <div className="space-y-3 rounded-xl bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-600">
            기존 신용대출 · 마이너스통장
          </p>
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="일시상환 신용대출 잔액"
              name="creditBalance"
              suffix="만원"
              placeholder="예: 3,000"
              value={state.creditBalance?.value ?? ""}
              onChange={(v) => setValue("creditBalance", v)}
            />
            <InputField
              label="마이너스통장 약정한도"
              name="creditLineLimit"
              suffix="만원"
              placeholder="예: 2,000"
              hint="사용액이 아니라 한도 전액"
              value={state.creditLineLimit?.value ?? ""}
              onChange={(v) => setValue("creditLineLimit", v)}
            />
          </div>
          <InputField
            label="평균 금리"
            name="creditRate"
            suffix="%"
            step={0.1}
            placeholder="예: 5.5"
            hint="위 두 금액에 적용할 평균 금리. 산정만기 5년 기준입니다. 분할상환 신용대출은 실제 연간 원리금을 위의 '기타 부채'에 입력하세요."
            value={state.creditRate?.value ?? ""}
            onChange={(v) => setValue("creditRate", v)}
          />
        </div>

        <ToggleGroup<JeonseChoice>
          label="전세자금대출"
          value={jeonse}
          onChange={setJeonse}
          options={[
            { value: "unselected", label: "선택 안 함" },
            { value: "none", label: "없음" },
            { value: "noHouse", label: "무주택자" },
            { value: "oneHouseMetro", label: "1주택·수도권 규제" },
            { value: "other", label: "그 밖" },
          ]}
          hint="전세대출은 주택 보유 여부와 지역에 따라 DSR 반영 방식이 달라 반드시 선택해야 계산됩니다."
        />

        {jeonse === "oneHouseMetro" && (
          <InputField
            label="전세대출 연간 이자"
            name="jeonseInterest"
            suffix="만원"
            placeholder="예: 300"
            hint="1주택자가 수도권·규제지역에서 받는 전세대출은 이자상환분만 DSR에 반영됩니다."
            value={state.jeonseInterest?.value ?? ""}
            onChange={(v) => setValue("jeonseInterest", v)}
          />
        )}
      </fieldset>

      {/* ── 신규 대출 ── */}
      <fieldset className="space-y-4 rounded-2xl border border-slate-200 p-4">
        <legend className="px-1 text-sm font-semibold text-slate-700">
          신규 대출
        </legend>

        <ToggleGroup<NewLoanKind>
          label="대출 종류"
          value={loanKind}
          onChange={setLoanKind}
          options={[
            { value: "mortgage", label: "주택담보대출" },
            { value: "credit", label: "신용대출" },
          ]}
        />

        {loanKind === "mortgage" ? (
          <>
            <ToggleGroup<Region>
              label="지역"
              value={region}
              onChange={setRegion}
              options={[
                { value: "metro", label: "수도권·규제지역" },
                { value: "local", label: "지방(비규제)" },
              ]}
              hint={`지방 주담대는 ${LOCAL_MORTGAGE_DEFERRAL_UNTIL}까지 2단계(스트레스 0.75%)가 유예 적용됩니다.`}
            />
            <ToggleGroup<RateType>
              label="금리 유형"
              value={rateType}
              onChange={setRateType}
              options={[
                { value: "variable", label: "변동형" },
                { value: "fixed", label: "순수고정형" },
              ]}
              hint="혼합형·주기형은 고정기간·변동주기에 따라 적용비율이 달라 현재 간편 계산에서는 지원하지 않습니다."
            />
          </>
        ) : (
          <>
            <ToggleGroup<CreditRepaymentKind>
              label="상환 유형"
              value={creditKind}
              onChange={setCreditKind}
              options={[
                { value: "lumpSum", label: "일시상환" },
                { value: "creditLine", label: "마이너스통장" },
                { value: "installment", label: "분할상환" },
              ]}
              hint="일시상환·마이너스통장은 산정만기 5년으로 계산합니다. 분할상환은 실제만기 인정 요건이 확인되지 않아 직접 입력이 필요합니다."
            />
            <ToggleGroup<CreditFixedTerm>
              label="금리 유형 (고정금리 기간)"
              value={fixedTerm}
              onChange={setFixedTerm}
              options={[
                { value: "other", label: "변동 등 그 밖" },
                { value: "fixed3to5", label: "3~5년 고정" },
                { value: "fixed5plus", label: "5년 이상 고정" },
              ]}
              hint="신용대출 스트레스 금리는 5년 이상 고정 미적용, 3~5년 고정 60%, 그 밖 100%로 적용됩니다. 지역과는 무관합니다."
            />
          </>
        )}

        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="대출 금리"
            name="rate"
            suffix="%"
            step={0.1}
            placeholder="예: 4.5"
            value={state.rate?.value ?? ""}
            onChange={(v) => setValue("rate", v)}
          />
          {loanKind === "mortgage" ? (
            <InputField
              label="대출 기간"
              name="months"
              suffix="개월"
              placeholder="예: 360"
              value={state.months?.value ?? ""}
              onChange={(v) => setValue("months", v)}
            />
          ) : (
            <div className="flex items-end pb-2 text-xs leading-relaxed text-slate-400">
              신용대출은 산정만기 5년이 적용되어 대출 기간을 입력하지 않습니다.
            </div>
          )}
        </div>

        {mode === "check" && (
          <InputField
            label={
              loanKind === "credit" && creditKind === "creditLine"
                ? "신규 약정한도"
                : "신규 대출 금액"
            }
            name="amount"
            suffix="만원"
            placeholder="예: 30,000"
            hint={
              loanKind === "credit" && creditKind === "creditLine"
                ? "마이너스통장은 사용 예정액이 아니라 설정할 약정한도를 입력하세요."
                : "단위: 만원"
            }
            value={state.amount?.value ?? ""}
            onChange={(v) => setValue("amount", v)}
          />
        )}

        {loanKind === "mortgage" && mode === "check" && (
          <ToggleGroup<DsrRepayment>
            label="상환 방식"
            value={repayment}
            onChange={setRepayment}
            options={[
              { value: "equal_payment", label: "원리금균등" },
              { value: "equal_principal", label: "원금균등" },
            ]}
            hint="만기일시·거치식은 원금 인정만기 규정이 별도라 현재 지원하지 않습니다."
          />
        )}

        {loanKind === "credit" && creditKind === "installment" && (
          <InputField
            label="분할상환 신용대출 연간 원리금"
            name="installmentAnnual"
            suffix="만원"
            placeholder="예: 800"
            hint="금융회사에서 안내받은 DSR 산정용 연간 원리금을 입력하세요. 자동 계산하지 않습니다."
            value={state.installmentAnnual?.value ?? ""}
            onChange={(v) => setValue("installmentAnnual", v)}
          />
        )}
      </fieldset>

      <ToggleGroup<string>
        label={mode === "check" ? "선택한 DSR 기준" : "목표 DSR"}
        value={String(limitPercent)}
        onChange={(v) => setLimitPercent(Number(v) as 40 | 50)}
        options={[
          { value: "40", label: "은행권 40%" },
          { value: "50", label: "비은행 50%" },
        ]}
      />

      {/* ── 계산 차단 안내 ── */}
      {blockedReason && (
        <div className="animate-in fade-in slide-in-from-bottom-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800 duration-300">
          <p className="mb-1 font-semibold">이 조건은 계산하지 않습니다</p>
          <p>{blockedReason}</p>
        </div>
      )}

      {/* ── 중복 합산 경고 ── */}
      {shown?.warnings.map((w) => (
        <div
          key={w}
          className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm leading-relaxed text-orange-800"
        >
          <p className="mb-1 font-semibold">중복 합산 확인</p>
          <p>{w}</p>
        </div>
      ))}

      {/* ── 결과: DSR 확인 ── */}
      {mode === "check" && checkOk && (
        <div className="animate-in fade-in slide-in-from-bottom-2 space-y-4 pt-2 duration-300">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ResultCard
              label="일반 DSR"
              value={`${checkOk.dsrNormal.toFixed(1)}%`}
            />
            <ResultCard
              label="스트레스 DSR"
              value={`${checkOk.dsrStressed.toFixed(1)}%`}
              sub={
                checkOk.effectiveStressRate > 0
                  ? `적용금리 ${trimPct(
                      checkOk.stressedRatePercent,
                    )}% (명목 ${trimPct(
                      checkOk.stressedRatePercent - checkOk.effectiveStressRate,
                    )}% + 스트레스 ${trimPct(checkOk.effectiveStressRate)}%p)`
                  : "스트레스 금리 미적용"
              }
              highlight={!checkOk.exceeded}
              danger={checkOk.exceeded}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ResultCard
              label="기존 부채 연간 원리금"
              value={formatUnit(checkOk.existingAnnualDebt)}
              sub={
                checkOk.breakdown.creditAnnualDebt > 0
                  ? `신용대출 ${formatUnit(checkOk.breakdown.creditAnnualDebt)} 포함`
                  : undefined
              }
            />
            <ResultCard
              label="신규 대출 연간 원리금"
              value={formatUnit(checkOk.newAnnualDebtStressed)}
              sub="스트레스 기준"
            />
          </div>

          <div
            className={`rounded-2xl border p-4 text-sm ${
              checkOk.exceeded
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-slate-200 bg-slate-50 text-slate-700"
            }`}
          >
            {checkOk.exceeded ? (
              <p>
                스트레스 DSR이 선택한 기준({limitPercent}%)을{" "}
                <strong>{checkOk.exceedByPct.toFixed(1)}%p</strong> 초과합니다.
              </p>
            ) : (
              <p>
                선택한 기준({limitPercent}%)까지 남은 연간 상환여력은 약{" "}
                <strong>{formatUnit(checkOk.headroomAnnual)}</strong>입니다.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── 결과: 추정 가능액 ── */}
      {mode === "estimate" && estimateOk && (
        <div className="animate-in fade-in slide-in-from-bottom-2 space-y-4 pt-2 duration-300">
          {estimateOk.availableForNew <= 0 ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              기존 부채가 이미 목표 DSR({limitPercent}%) 한도에 도달해, DSR 기준
              추정 가능액이 없습니다.
            </div>
          ) : (
            <>
              <ResultCard
                label={
                  loanKind === "credit" && creditKind === "creditLine"
                    ? "DSR 기준 추정 가능 약정한도"
                    : "DSR 기준 추정 가능 대출액"
                }
                value={formatUnit(estimateOk.estimatedPrincipal)}
                sub={
                  loanKind === "mortgage"
                    ? `원리금균등 · 스트레스 금리 ${trimPct(estimateOk.stressedRatePercent)}% 기준`
                    : `산정만기 5년 · 적용금리 ${trimPct(estimateOk.stressedRatePercent)}% 기준`
                }
                highlight
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {loanKind === "mortgage" && (
                  <ResultCard
                    label="참고 · 월 상환액"
                    value={formatKRW(estimateOk.monthlyPaymentActual)}
                    sub="실제 금리 기준 원리금균등"
                  />
                )}
                <ResultCard
                  label="연간 상환여력"
                  value={formatUnit(estimateOk.availableForNew)}
                  sub="목표 DSR − 기존 부채"
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* ── 산정 근거 메모 ── */}
      {shown && (shown.notes.length > 0 || shown.breakdown.jeonseNote) && (
        <ul className="space-y-1.5 rounded-2xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-600">
          {shown.breakdown.jeonseNote && (
            <li>· {shown.breakdown.jeonseNote}</li>
          )}
          {shown.notes.map((n) => (
            <li key={n}>· {n}</li>
          ))}
        </ul>
      )}

      {/* ── 고지 ── */}
      <div className="space-y-2 border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-400">
        <p>
          ※ 스트레스 DSR 기준일: {DSR_VERIFIED_DATE}. 규제는 수시로 바뀌므로
          실제 적용 기준은 금융위원회·전국은행연합회 공시로 확인하세요.
        </p>
        <p>
          ※ DSR 분자(연간 원리금)는 실제 상환액과 다를 수 있으며,
          대출종류·상환방식에 따라 산정방식이 달라집니다. 이 계산기는 참고용
          추정치이며 금융회사의 심사 결과를 대신하지 않습니다.
        </p>
        <p>
          ※ 적격 분할상환 신용대출의 실제만기 인정 요건, 기타대출 종류별
          산정만기, 보증기관별 전세대출 취급 차이는 자동으로 판정하지 않습니다.
        </p>
        {mode === "estimate" && (
          <p>
            ※ &lsquo;DSR 기준 추정 가능액&rsquo;은 DSR만으로 역산한
            추정치입니다. 실제 금융회사 한도는 LTV·담보가치·방공제·소득
            인정방식·기존 부채 산정방식 및 금융회사 심사에 따라 달라질 수
            있으며, 최대 대출 가능액을 보장하지 않습니다.
          </p>
        )}
      </div>
    </div>
  );
}
