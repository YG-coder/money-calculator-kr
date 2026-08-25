"use client";

import { useMemo, useState } from "react";
import { useCalcState } from "@/hooks/useCalcState";
import { readWon } from "@/lib/calcInput";
import { formatKRW, formatUnit } from "@/lib/loan";
import { calcLtv, type RoomDeductionChoice } from "@/lib/ltv";
import {
  ROOM_DEDUCTION_REFERENCE,
  ROOM_DEDUCTION_META,
  type BorrowerType,
  type LtvRegion,
} from "@/lib/policy/ltv";
import InputField from "@/components/calculator/InputField";
import ResultCard from "@/components/calculator/ResultCard";
import ToggleGroup from "@/components/calculator/ToggleGroup";
import PolicyNote from "@/components/calculator/PolicyNote";

const FIELDS = [
  { key: "price", kind: "money" as const, defaultValue: "" },
  { key: "senior", kind: "money" as const, defaultValue: "" },
  { key: "room", kind: "money" as const, defaultValue: "" },
];

/**
 * 방공제 입력 모드.
 * "" = 아직 고르지 않음. 조용히 0원으로 계산하지 않기 위해 기본값을 비워 둔다.
 */
type RoomMode = "" | "amount" | "none";

export default function LtvCalc() {
  const { state, setValue } = useCalcState(FIELDS);

  const [region, setRegion] = useState<LtvRegion>("regulated");
  const [borrower, setBorrower] = useState<BorrowerType>("noHouse");
  const [roomMode, setRoomMode] = useState<RoomMode>("");

  const outcome = useMemo(() => {
    const roomDeduction: RoomDeductionChoice =
      roomMode === "none"
        ? { kind: "none" }
        : roomMode === "amount"
          ? { kind: "amount", amountWon: readWon(state, "room") }
          : { kind: "unselected" };

    return calcLtv({
      housePriceWon: readWon(state, "price"),
      region,
      borrower,
      seniorDebtWon: readWon(state, "senior"),
      roomDeduction,
    });
  }, [state, region, borrower, roomMode]);

  const result = outcome.status === "ok" ? outcome.result : null;

  return (
    <div className="space-y-5">
      {/* ── 주택 조건 ── */}
      <InputField
        label="주택 가격 (담보 평가액)"
        name="price"
        suffix="만원"
        placeholder="예: 100,000"
        hint="단위: 만원 (10억 → 100,000)"
        value={state.price?.value ?? ""}
        onChange={(v) => setValue("price", v)}
      />

      <ToggleGroup<LtvRegion>
        label="지역 구분"
        value={region}
        onChange={setRegion}
        gridClass="grid-cols-1 sm:grid-cols-3"
        options={[
          { value: "regulated", label: "규제지역" },
          { value: "metroUnregulated", label: "수도권 비규제" },
          { value: "nonMetroUnregulated", label: "비수도권" },
        ]}
        hint="규제지역은 2026-07-01 기준 서울 25개 자치구 전역과 경기 15곳입니다. 아래 안내에서 확인하세요."
      />

      <ToggleGroup<BorrowerType>
        label="주택 보유 상황"
        value={borrower}
        onChange={setBorrower}
        gridClass="grid-cols-1 sm:grid-cols-3"
        options={[
          { value: "noHouse", label: "무주택" },
          { value: "firstTime", label: "생애최초" },
          { value: "owner", label: "유주택" },
        ]}
        hint="처분조건부 1주택자는 '무주택'과 동일하게 적용됩니다. 기존 주택을 처분하지 않는 1주택자와 다주택자는 '유주택'입니다."
      />

      <InputField
        label="선순위 채권 (선택)"
        name="senior"
        suffix="만원"
        placeholder="예: 0"
        hint="기존 근저당 등 선순위 채권액. 없으면 비워두세요."
        value={state.senior?.value ?? ""}
        onChange={(v) => setValue("senior", v)}
      />

      {/* ── 방공제 — 명시적으로 선택해야 계산한다 ── */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <ToggleGroup<RoomMode>
          label="방공제 (소액임차보증금 공제)"
          value={roomMode}
          onChange={setRoomMode}
          options={[
            { value: "amount", label: "금액 직접 입력" },
            { value: "none", label: "공제하지 않음" },
          ]}
          hint="둘 중 하나를 선택해야 계산합니다. MCI·MCG 가입 등으로 공제하지 않는 경우에만 '공제하지 않음'을 고르세요."
        />

        {roomMode === "amount" && (
          <div className="mt-4 space-y-3">
            <InputField
              label="방공제액"
              name="room"
              suffix="만원"
              placeholder="예: 5,500"
              hint="금융회사가 적용한 공제액을 입력하세요. 0원이면 '공제하지 않음'을 선택하세요."
              value={state.room?.value ?? ""}
              onChange={(v) => setValue("room", v)}
            />

            <div>
              <p className="mb-2 text-xs font-semibold text-slate-500">
                참고 · 지역별 최우선변제금 (1건 기준)
              </p>
              <div className="grid grid-cols-2 gap-2">
                {ROOM_DEDUCTION_REFERENCE.map((r) => (
                  <button
                    key={r.area}
                    type="button"
                    onClick={() => setValue("room", String(r.amountWon / 10_000))}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs
                               transition-colors hover:border-brand-300 hover:bg-brand-50"
                  >
                    <span className="block font-bold text-slate-700">
                      {(r.amountWon / 10_000).toLocaleString("ko-KR")}만원
                    </span>
                    <span className="mt-0.5 block leading-snug text-slate-400">
                      {r.label}
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-400">
                법정 금액이며 공제 건수는 주택 유형·금융회사 내규에 따라 달라집니다. 위 값은
                입력 보조용 참고값입니다.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── 결과 ── */}
      {outcome.status === "needsInput" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          <p className="font-bold">입력이 더 필요합니다</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {outcome.missing.includes("housePrice") && (
              <li>주택 가격을 입력하세요.</li>
            )}
            {outcome.missing.includes("roomDeduction") && (
              <li>
                방공제를 <strong>금액 직접 입력</strong> 또는{" "}
                <strong>공제하지 않음</strong> 중 하나로 선택하세요. 방공제는 담보 기준
                한도를 크게 좌우하므로 기본값으로 0원을 적용하지 않습니다.
              </li>
            )}
          </ul>
        </div>
      )}

      {outcome.status === "unsupported" && (
        <div className="rounded-2xl border border-slate-300 bg-slate-50 p-5 text-sm text-slate-700">
          <p className="font-bold">이 조건은 지원하지 않습니다</p>
          <p className="mt-2">{outcome.reason} 금융회사에 직접 확인하세요.</p>
        </div>
      )}

      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-2 space-y-4 pt-2 duration-300">
          <ResultCard
            label="담보 기준 추정 한도"
            value={formatUnit(result.limitWon)}
            sub={
              result.appliedLtvPct === 0
                ? "적용 LTV 0% — 담보대출 취급이 제한되는 조건입니다"
                : result.capApplied
                  ? `주택가격 구간별 절대한도(${formatUnit(result.absoluteCapWon ?? 0)})가 적용되었습니다`
                  : "LTV 기준 한도에서 차감한 금액입니다"
            }
            highlight={result.limitWon > 0}
            danger={result.limitWon === 0}
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ResultCard
              label="적용 LTV"
              value={`${result.appliedLtvPct}%`}
              sub="지역·주택 보유 상황 기준"
            />
            <ResultCard
              label="필요 자기자금"
              value={formatUnit(result.requiredEquityWon)}
              sub="주택가격 − 담보 기준 한도"
            />
          </div>

          {/* 계산 과정 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
              계산 과정
            </p>
            <dl className="space-y-1.5">
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">담보인정액 (가격 × LTV)</dt>
                <dd className="font-semibold tabular-nums text-slate-800">
                  {formatKRW(result.ltvAmountWon)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">− 선순위 채권</dt>
                <dd className="tabular-nums text-slate-700">
                  {formatKRW(result.seniorDebtWon)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">− 방공제</dt>
                <dd className="tabular-nums text-slate-700">
                  {formatKRW(result.roomDeductionWon)}
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-1.5">
                <dt className="text-slate-500">차감 후</dt>
                <dd className="font-semibold tabular-nums text-slate-800">
                  {formatKRW(result.afterDeductionWon)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">주택가격 구간별 절대한도</dt>
                <dd className="tabular-nums text-slate-700">
                  {result.absoluteCapWon === null
                    ? "미적용 (비수도권 비규제)"
                    : formatKRW(result.absoluteCapWon)}
                </dd>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-1.5">
                <dt className="font-bold text-slate-700">
                  = 담보 기준 한도 (둘 중 낮은 값, 최소 0)
                </dt>
                <dd className="font-black tabular-nums text-brand-700">
                  {formatKRW(result.limitWon)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-900">
            <p className="font-bold">소득 기준 한도도 함께 확인하세요</p>
            <p className="mt-2 leading-relaxed">
              실제 대출 한도는 담보 기준 한도와 <strong>DSR 기준 한도 중 낮은 쪽</strong>으로
              정해집니다. 이 계산기는 담보 축만 계산합니다.
            </p>
          </div>

          <PolicyNote
            metas={[result.ltvMeta, result.capMeta, ROOM_DEDUCTION_META]}
            extra={[
              "이 결과는 담보 기준 추정치입니다. 실제 한도는 DSR·소득 인정방식·기존 부채 산정방식 및 금융회사 심사에 따라 더 낮아질 수 있으며, 최대 대출 가능액을 보장하지 않습니다.",
              "방공제 금액과 공제 건수는 주택 유형과 금융회사 내규에 따라 달라집니다. 입력하신 금액으로 계산합니다.",
            ]}
          />
        </div>
      )}

      {!result && outcome.status === "needsInput" && (
        <PolicyNote
          metas={[ROOM_DEDUCTION_META]}
          showUnsupported={false}
          extra={[
            "이 계산기는 담보 기준 한도만 계산합니다. 실제 한도는 DSR·금융회사 심사에 따라 더 낮아질 수 있습니다.",
          ]}
        />
      )}
    </div>
  );
}
