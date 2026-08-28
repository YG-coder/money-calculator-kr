"use client";

import { useMemo, useState } from "react";
import { useCalcState } from "@/hooks/useCalcState";
import { readWon } from "@/lib/calcInput";
import { formatKRW, formatUnit } from "@/lib/loan";
import type { OwnershipType } from "@/lib/realEstate";
import type { FirstHomeReduction } from "@/lib/policy/acquisitionTax";
import {
  calcInitialCost,
  type BrokerageChoice,
  type CostChoice,
} from "@/lib/initialCost";
import { VERIFIED_LOCAL_ORDINANCES } from "@/lib/policy/brokerage";
import InputField from "@/components/calculator/InputField";
import ResultCard from "@/components/calculator/ResultCard";
import ToggleGroup from "@/components/calculator/ToggleGroup";
import Link from "next/link";
import { initialCostToYieldUrl } from "@/lib/handoff";
import PolicyNote from "@/components/calculator/PolicyNote";

const FIELDS = [
  { key: "price", kind: "money" as const, defaultValue: "" },
  { key: "officialPrice", kind: "money" as const, defaultValue: "" },
  { key: "brokerageManual", kind: "money" as const, defaultValue: "" },
  { key: "registration", kind: "money" as const, defaultValue: "" },
  { key: "other", kind: "money" as const, defaultValue: "" },
  { key: "loan", kind: "money" as const, defaultValue: "" },
  { key: "deposit", kind: "money" as const, defaultValue: "" },
];

/** "" = 아직 고르지 않음. 조용히 0원으로 계산하지 않기 위해 기본값을 비워 둔다. */
type RegMode = "" | "amount" | "excluded";

export default function InitialCostCalc() {
  const { state, setValue } = useCalcState(FIELDS);

  const [ownership, setOwnership] = useState<OwnershipType>("first");
  const [isAdjustedArea, setIsAdjustedArea] = useState(false);
  const [isOver85, setIsOver85] = useState(false);
  const [firstHomeReduction, setFirstHomeReduction] =
    useState<FirstHomeReduction>("none");
  const [isTemporaryTwoHouse, setIsTemporaryTwoHouse] = useState(false);
  const [isMetroArea, setIsMetroArea] = useState<boolean | undefined>(
    undefined,
  );
  const [isRedevelopmentZone, setIsRedevelopmentZone] = useState(false);

  const [brokerageMode, setBrokerageMode] = useState<"auto" | "amount">("auto");
  const [includeVat, setIncludeVat] = useState(true);
  const [regMode, setRegMode] = useState<RegMode>("");

  const outcome = useMemo(() => {
    const brokerage: BrokerageChoice =
      brokerageMode === "amount"
        ? {
            kind: "amount",
            amountWon: readWon(state, "brokerageManual"),
            includeVat,
          }
        : { kind: "auto", includeVat };

    const registrationCost: CostChoice =
      regMode === "excluded"
        ? { kind: "excluded" }
        : regMode === "amount"
          ? { kind: "amount", amountWon: readWon(state, "registration") }
          : { kind: "unselected" };

    return calcInitialCost({
      housePriceWon: readWon(state, "price"),
      acquisition: {
        ownership,
        isAdjustedArea,
        isOver85,
        firstHomeReduction,
        isTemporaryTwoHouse,
        isMetroArea,
        officialPriceMan:
          isMetroArea === false
            ? readWon(state, "officialPrice") / 10_000
            : undefined,
        isRedevelopmentZone,
      },
      brokerage,
      registrationCost,
      otherCostWon: readWon(state, "other"),
      loanWon: readWon(state, "loan"),
      rentDepositWon: readWon(state, "deposit"),
    });
  }, [
    state,
    ownership,
    isAdjustedArea,
    isOver85,
    firstHomeReduction,
    isTemporaryTwoHouse,
    isMetroArea,
    isRedevelopmentZone,
    brokerageMode,
    includeVat,
    regMode,
  ]);

  const result = outcome.status === "ok" ? outcome.result : null;

  // 인계 링크용 — 엔진에 넘긴 값과 같은 출처를 쓴다
  const priceWon = readWon(state, "price");
  const loanWon = readWon(state, "loan");
  const rentDepositWon = readWon(state, "deposit");

  return (
    <div className="space-y-5">
      <InputField
        label="매매가"
        name="price"
        suffix="만원"
        placeholder="예: 50,000"
        hint="단위: 만원 (5억 → 50,000)"
        value={state.price?.value ?? ""}
        onChange={(v) => setValue("price", v)}
      />

      {/* ── 취득세 조건 ── */}
      <ToggleGroup<OwnershipType>
        label="취득 후 주택 보유 수"
        value={ownership}
        onChange={(v) => {
          setOwnership(v);
          if (v !== "first") setFirstHomeReduction("none");
          if (v !== "second") setIsTemporaryTwoHouse(false);
        }}
        gridClass="grid-cols-2 sm:grid-cols-4"
        options={[
          { value: "first", label: "1주택" },
          { value: "second", label: "2주택" },
          { value: "third", label: "3주택" },
          { value: "fourth_plus", label: "4주택+" },
        ]}
        hint="비수도권 시가표준액 2억원 이하 주택은 주택 수 산정에서 제외됩니다. 해당 주택은 빼고 세어주세요."
      />

      <ToggleGroup<string>
        label="전용면적"
        value={isOver85 ? "over" : "under"}
        onChange={(v) => setIsOver85(v === "over")}
        options={[
          { value: "under", label: "85㎡ 이하" },
          { value: "over", label: "85㎡ 초과" },
        ]}
        hint="농어촌특별세 과세 기준입니다."
      />

      {(ownership === "second" || ownership === "third") && (
        <ToggleGroup<string>
          label="조정대상지역"
          value={isAdjustedArea ? "yes" : "no"}
          onChange={(v) => setIsAdjustedArea(v === "yes")}
          options={[
            { value: "no", label: "비조정" },
            { value: "yes", label: "조정대상지역" },
          ]}
        />
      )}

      {ownership === "first" && (
        <div className="space-y-2 rounded-2xl border border-slate-200 p-4">
          <p className="text-sm font-bold text-slate-700">
            생애최초 취득세 감면
          </p>
          {[
            { value: "none" as const, label: "해당 없음" },
            { value: "standard" as const, label: "200만원 한도 요건 확인" },
            { value: "expanded" as const, label: "300만원 한도 요건 확인" },
          ].map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 text-sm text-slate-600"
            >
              <input
                type="radio"
                name="icFirstHome"
                checked={firstHomeReduction === opt.value}
                onChange={() => setFirstHomeReduction(opt.value)}
                className="accent-brand-600"
              />
              {opt.label}
            </label>
          ))}
          <p className="text-xs leading-relaxed text-slate-400">
            취득가액 12억원 이하에 적용됩니다. 자격을 자동 판정하지 않으므로
            관할 시·군·구청에서 확인하세요.
          </p>
        </div>
      )}

      {ownership === "second" && (
        <label className="flex items-start gap-2 rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={isTemporaryTwoHouse}
            onChange={(e) => setIsTemporaryTwoHouse(e.target.checked)}
            className="mt-0.5 accent-brand-600"
          />
          <span>
            일시적 2주택 — 신규주택 취득일(잔금청산일)로부터 3년 이내 종전주택을
            처분할 예정입니다.
          </span>
        </label>
      )}

      {ownership !== "first" && (
        <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
          <p className="text-sm font-bold text-slate-700">
            비수도권 저가주택 중과 배제
          </p>
          <ToggleGroup<string>
            label=""
            value={
              isMetroArea === undefined ? "" : isMetroArea ? "metro" : "non"
            }
            onChange={(v) => setIsMetroArea(v === "metro")}
            options={[
              { value: "metro", label: "수도권" },
              { value: "non", label: "비수도권" },
            ]}
          />
          {isMetroArea === false && (
            <>
              <InputField
                label="주택 시가표준액"
                name="officialPrice"
                suffix="만원"
                placeholder="예: 15,000"
                hint="매매가가 아닌 지방세법상 시가표준액입니다."
                value={state.officialPrice?.value ?? ""}
                onChange={(v) => setValue("officialPrice", v)}
              />
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={isRedevelopmentZone}
                  onChange={(e) => setIsRedevelopmentZone(e.target.checked)}
                  className="accent-brand-600"
                />
                정비구역·소규모주택정비 사업시행구역에 해당
              </label>
            </>
          )}
        </div>
      )}

      {/* ── 중개보수 ── */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <ToggleGroup<"auto" | "amount">
          label="중개보수"
          value={brokerageMode}
          onChange={setBrokerageMode}
          options={[
            { value: "auto", label: "상한요율로 계산" },
            { value: "amount", label: "금액 직접 입력" },
          ]}
          hint={`요율표는 상한이며 실제 보수는 그 범위 안에서 협의로 정합니다. 조례가 국토교통부 상한과 일치함을 확인한 지역: ${VERIFIED_LOCAL_ORDINANCES.join("·")}.`}
        />

        {brokerageMode === "amount" && (
          <InputField
            label="협의한 중개보수"
            name="brokerageManual"
            suffix="만원"
            placeholder="예: 200"
            hint="부가가치세 제외 금액을 입력하세요."
            value={state.brokerageManual?.value ?? ""}
            onChange={(v) => setValue("brokerageManual", v)}
          />
        )}

        <label className="flex items-start gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={includeVat}
            onChange={(e) => setIncludeVat(e.target.checked)}
            className="mt-0.5 accent-brand-600"
          />
          <span>
            부가가치세 10% 포함 (일반과세 중개사 기준). 간이과세 중개사는 다를
            수 있으니 확인이 필요합니다.
          </span>
        </label>
      </div>

      {/* ── 등기·법무 비용 — 명시 선택 ── */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <ToggleGroup<RegMode>
          label="등기·법무 비용"
          value={regMode}
          onChange={setRegMode}
          options={[
            { value: "amount", label: "금액 직접 입력" },
            { value: "excluded", label: "포함하지 않음" },
          ]}
          hint="국민주택채권 할인율이 매일 바뀌어 자동 계산하지 않습니다. 법무사 견적 금액을 넣거나, 별도로 확인할 경우 '포함하지 않음'을 고르세요."
        />

        {regMode === "amount" && (
          <InputField
            label="등기·법무 비용"
            name="registration"
            suffix="만원"
            placeholder="예: 150"
            hint="등록면허세·지방교육세·국민주택채권·법무사 수수료 등 합계"
            value={state.registration?.value ?? ""}
            onChange={(v) => setValue("registration", v)}
          />
        )}
      </div>

      <InputField
        label="기타 비용 (선택)"
        name="other"
        suffix="만원"
        placeholder="예: 0"
        hint="이사비·수리비·가전 구입비 등. 없으면 비워두세요."
        value={state.other?.value ?? ""}
        onChange={(v) => setValue("other", v)}
      />

      {/* ── 자금 조달 ── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <InputField
          label="대출금 (선택)"
          name="loan"
          suffix="만원"
          placeholder="예: 30,000"
          hint="LTV 계산기 결과를 넣어보세요."
          value={state.loan?.value ?? ""}
          onChange={(v) => setValue("loan", v)}
        />
        <InputField
          label="승계 임대보증금 (선택)"
          name="deposit"
          suffix="만원"
          placeholder="예: 0"
          hint="갭투자 등 임대차를 승계하는 경우"
          value={state.deposit?.value ?? ""}
          onChange={(v) => setValue("deposit", v)}
        />
      </div>

      {/* ── 결과 ── */}
      {outcome.status === "needsInput" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          <p className="font-bold">입력이 더 필요합니다</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {outcome.missing.includes("housePrice") && (
              <li>매매가를 입력하세요.</li>
            )}
            {outcome.missing.includes("registrationCost") && (
              <li>
                등기·법무 비용을 <strong>금액 직접 입력</strong> 또는{" "}
                <strong>포함하지 않음</strong> 중 하나로 선택하세요. 실제로는
                항상 발생하는 비용이므로 기본값 0원을 적용하지 않습니다.
              </li>
            )}
          </ul>
        </div>
      )}

      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-2 space-y-4 pt-2 duration-300">
          <ResultCard
            label="실투자금 (필요한 자기자금)"
            value={formatUnit(result.equityWon)}
            sub={
              result.isEquityNegative
                ? "대출금과 보증금 합이 총 필요자금을 넘습니다 — 입력을 확인하세요"
                : "총 필요자금 − 대출금 − 승계 보증금"
            }
            highlight={!result.isEquityNegative}
            danger={result.isEquityNegative}
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ResultCard
              label="총 필요자금"
              value={formatUnit(result.totalRequiredWon)}
              sub="매매가 + 부대비용"
            />
            <ResultCard
              label="총 부대비용"
              value={formatUnit(result.totalExtraCostWon)}
              sub={`매매가의 ${result.extraCostRatioPct.toFixed(2)}%`}
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
              부대비용 내역
            </p>
            <dl className="space-y-1.5">
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">
                  취득세 합계
                  {result.acquisitionDetail.reductionWon > 0 && (
                    <span className="ml-1 text-xs text-brand-600">
                      (감면 {formatKRW(result.acquisitionDetail.reductionWon)})
                    </span>
                  )}
                </dt>
                <dd className="font-semibold tabular-nums text-slate-800">
                  {formatKRW(result.acquisitionTaxWon)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">
                  {result.brokerageBandLabel
                    ? `최대 중개보수 (${result.brokerageBandLabel})`
                    : "중개보수 (직접 입력)"}
                </dt>
                <dd className="tabular-nums text-slate-700">
                  {formatKRW(result.brokerageFeeWon)}
                </dd>
              </div>
              {result.brokerageVatWon > 0 && (
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">중개보수 부가가치세</dt>
                  <dd className="tabular-nums text-slate-700">
                    {formatKRW(result.brokerageVatWon)}
                  </dd>
                </div>
              )}
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">등기·법무 비용</dt>
                <dd className="tabular-nums text-slate-700">
                  {formatKRW(result.registrationCostWon)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">기타 비용</dt>
                <dd className="tabular-nums text-slate-700">
                  {formatKRW(result.otherCostWon)}
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-1.5">
                <dt className="font-bold text-slate-700">= 총 부대비용</dt>
                <dd className="font-black tabular-nums text-brand-700">
                  {formatKRW(result.totalExtraCostWon)}
                </dd>
              </div>
            </dl>
          </div>

          {/* 다음 단계 — 값 인계 */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
            <p className="font-bold text-slate-900">
              이 매물의 임대수익률도 확인해 보세요
            </p>
            <p className="mt-2 leading-relaxed">
              매입가·대출금·보증금이 그대로 채워집니다. 월세와 대출 금리를
              입력하면 수익률이 계산되며, 옮겨진 값은 수정할 수 있습니다.
            </p>
            <Link
              href={initialCostToYieldUrl({
                purchasePriceWon: priceWon,
                loanWon,
                depositWon: rentDepositWon,
                extraCostWon: result.totalExtraCostWon,
              })}
              className="mt-3 inline-flex items-center gap-1 font-bold text-brand-700 underline underline-offset-2 hover:text-brand-900"
            >
              임대수익률 계산기로 이어서 계산 →
            </Link>
            <p className="mt-1 text-xs text-slate-500">
              취득 부대비용 {formatUnit(result.totalExtraCostWon)}도 함께
              전달되어, 수익률 계산기의 실투자금이 이 화면의 실투자금(
              {formatUnit(result.equityWon)})과 같은 정의로 계산됩니다.
            </p>
          </div>

          {result.notes.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
              <ul className="list-disc space-y-1 pl-5">
                {result.notes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-900">
            <p className="font-bold">대출 한도도 함께 확인하세요</p>
            <p className="mt-2 leading-relaxed">
              대출금은 담보 기준 한도(LTV)와 소득 기준 한도(DSR) 중 낮은 쪽으로
              정해집니다. LTV 계산기와 DSR 계산기에서 확인한 금액을 위 대출금
              칸에 넣어보세요.
            </p>
          </div>

          <PolicyNote
            metas={result.metas}
            extra={[
              "중개보수는 상한요율 기준 예상 최대 금액입니다. 실제 보수는 그 범위 안에서 협의로 정해지므로 이보다 낮을 수 있습니다.",
              `주택 중개보수는 시·도 조례로 정해집니다. 조례가 국토교통부 상한과 일치함을 확인한 지역은 ${VERIFIED_LOCAL_ORDINANCES.join("·")}이며, 그 외 지역은 해당 시·도 조례를 확인해야 합니다. 이 결과는 국토교통부 상한 기준 참고값입니다.`,
              "등기·법무 비용은 입력하신 금액으로 계산합니다. 국민주택채권 할인율이 매일 달라져 자동 계산하지 않습니다.",
            ]}
          />
        </div>
      )}
    </div>
  );
}
