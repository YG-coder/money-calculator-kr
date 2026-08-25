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
} from "@/lib/dsr";
import InputField from "@/components/calculator/InputField";
import ResultCard from "@/components/calculator/ResultCard";
import ToggleGroup from "@/components/calculator/ToggleGroup";

type Mode = "check" | "estimate";

const FIELDS = [
  { key: "income", kind: "money" as const, defaultValue: "" },
  { key: "existingDebt", kind: "money" as const, defaultValue: "" },
  { key: "amount", kind: "money" as const, defaultValue: "" },
  { key: "rate", kind: "decimal" as const, defaultValue: "" },
  { key: "months", kind: "integer" as const, defaultValue: "" },
];

// 퍼센트 표기 시 부동소수점 잔여(예: 4.05000001) 정리
const trimPct = (n: number) => Number(n.toFixed(2));

export default function DsrCalc() {
  const { state, setValue } = useCalcState(FIELDS);

  const [mode, setMode] = useState<Mode>("check");
  const [region, setRegion] = useState<Region>("metro");
  const [rateType, setRateType] = useState<RateType>("variable");
  const [repayment, setRepayment] = useState<DsrRepayment>("equal_payment");
  const [limitPercent, setLimitPercent] = useState<40 | 50>(40);

  // 금리 0%는 유효한 입력이므로 truthy 검사 대신 빈 문자열 여부로 판정
  const rateFilled = isFilled(state, "rate");

  const checkResult = useMemo(() => {
    if (mode !== "check") return null;
    const income = readWon(state, "income");
    const amount = readWon(state, "amount");
    const months = readNum(state, "months");
    if (!income || !amount || !months || !rateFilled) return null;

    return calcDsr({
      annualIncome: income,
      existingAnnualDebt: readWon(state, "existingDebt"),
      newPrincipal: amount,
      ratePercent: readNum(state, "rate"),
      months,
      repayment,
      region,
      rateType,
      limitPercent,
    });
  }, [state, mode, region, rateType, repayment, limitPercent, rateFilled]);

  const estimateResult = useMemo(() => {
    if (mode !== "estimate") return null;
    const income = readWon(state, "income");
    const months = readNum(state, "months");
    if (!income || !months || !rateFilled) return null;

    return estimatePrincipalFromDsr({
      annualIncome: income,
      existingAnnualDebt: readWon(state, "existingDebt"),
      limitPercent,
      ratePercent: readNum(state, "rate"),
      months,
      region,
      rateType,
    });
  }, [state, mode, region, rateType, limitPercent, rateFilled]);

  // 정책 레이어가 값을 돌려주지 않는 조건(예: 지방 유예 만료)은
  // 임의 대체값 없이 사유를 그대로 화면에 노출한다.
  const active = mode === "check" ? checkResult : estimateResult;
  const blockedReason = active?.status === "unsupported" ? active.reason : null;
  const checkOk = checkResult?.status === "ok" ? checkResult.value : null;
  const estimateOk =
    estimateResult?.status === "ok" ? estimateResult.value : null;

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
          : "소득과 목표 DSR로 DSR 기준 추정 가능 대출액을 역산합니다. 추정 가능액은 원리금균등 상환 기준으로 역산합니다."}
      </p>

      {/* ── 공통 입력 ── */}
      <InputField
        label="연 소득 (세전)"
        name="income"
        suffix="만원"
        placeholder="예: 5,000"
        hint="단위: 만원"
        value={state.income?.value ?? ""}
        onChange={(v) => setValue("income", v)}
      />

      <InputField
        label="기존 대출 연간 원리금 (선택)"
        name="existingDebt"
        suffix="만원"
        placeholder="예: 600"
        hint="기존 대출의 DSR 산정용 연간 원리금 상환액. 금융회사 앱·상담자료에서 확인한 값이 가장 정확합니다. 없으면 비워두세요."
        value={state.existingDebt?.value ?? ""}
        onChange={(v) => setValue("existingDebt", v)}
      />

      {/* ── 대출 조건 (주택담보대출 기준) ── */}
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
        <InputField
          label="대출 기간"
          name="months"
          suffix="개월"
          placeholder="예: 360"
          value={state.months?.value ?? ""}
          onChange={(v) => setValue("months", v)}
        />
      </div>

      {mode === "check" && (
        <>
          <InputField
            label="신규 대출 금액"
            name="amount"
            suffix="만원"
            placeholder="예: 30,000"
            hint="단위: 만원"
            value={state.amount?.value ?? ""}
            onChange={(v) => setValue("amount", v)}
          />
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
        </>
      )}

      <ToggleGroup<string>
        label={mode === "check" ? "선택한 DSR 기준" : "목표 DSR"}
        value={String(limitPercent)}
        onChange={(v) => setLimitPercent(Number(v) as 40 | 50)}
        options={[
          { value: "40", label: "은행권 40%" },
          { value: "50", label: "비은행 50%" },
        ]}
      />

      {/* ── 정책 미확인 안내 ── */}
      {blockedReason && (
        <div className="animate-in fade-in slide-in-from-bottom-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800 duration-300">
          <p className="mb-1 font-semibold">이 조건은 계산하지 않습니다</p>
          <p>{blockedReason}</p>
        </div>
      )}

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
                  : "스트레스 금리 미적용 (순수고정)"
              }
              highlight={!checkOk.exceeded}
              danger={checkOk.exceeded}
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
                label="DSR 기준 추정 가능 대출액"
                value={formatUnit(estimateOk.estimatedPrincipal)}
                sub={`원리금균등 · 스트레스 금리 ${trimPct(estimateOk.stressedRatePercent)}% 기준`}
                highlight
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <ResultCard
                  label="참고 · 월 상환액"
                  value={formatKRW(estimateOk.monthlyPaymentActual)}
                  sub="실제 금리 기준 원리금균등"
                />
                <ResultCard
                  label="연간 상환여력"
                  value={formatUnit(estimateOk.availableForNew)}
                  sub="목표 DSR − 기존 원리금"
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* ── 고지 ── */}
      <div className="space-y-2 border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-400">
        <p>
          ※ 이 계산기는 주택담보대출 기준입니다. 스트레스 DSR 기준일:{" "}
          {DSR_VERIFIED_DATE}. 규제는 수시로 바뀌므로 실제 적용 기준은
          금융위원회·전국은행연합회 공시로 확인하세요.
        </p>
        <p>
          ※ DSR 분자(연간 원리금)는 실제 상환액과 다를 수 있으며,
          대출종류·상환방식에 따라 산정방식이 달라집니다. 이 계산기는 신규
          주택담보대출을 원리금균등·원금균등 기준으로 산정한 참고용
          추정치입니다.
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
