// src/components/calculator/PolicyNote.tsx
// 정책 기반 계산기의 하단 고지 블록.
// PolicyMeta 의 기준일·최종 확인일·출처와 제외 범위를 화면에 드러낸다.
// 정책값을 쓰는 계산기는 이 블록을 반드시 포함한다.

import { formatPolicyStamp, type PolicyMeta } from "@/lib/policy/types";

interface PolicyNoteProps {
  /** 이 계산기가 사용한 정책 테이블들 */
  metas: PolicyMeta[];
  /** 계산기별 추가 고지 문구 */
  extra?: string[];
  /** 제외 범위를 펼쳐 보여줄지 (기본 true) */
  showUnsupported?: boolean;
}

export default function PolicyNote({
  metas,
  extra,
  showUnsupported = true,
}: PolicyNoteProps) {
  const unsupported = showUnsupported
    ? Array.from(new Set(metas.flatMap((m) => m.unsupported)))
    : [];

  return (
    <div className="space-y-2 border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-400">
      {extra?.map((line, i) => (
        <p key={`extra-${i}`}>※ {line}</p>
      ))}

      {metas.map((m) => (
        <p key={m.id}>※ {formatPolicyStamp(m)}</p>
      ))}

      {metas.some((m) => m.note) && (
        <>
          {metas
            .filter((m) => m.note)
            .map((m) => (
              <p key={`note-${m.id}`}>※ {m.note}</p>
            ))}
        </>
      )}

      {unsupported.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer select-none font-semibold text-slate-500 hover:text-slate-700">
            이 계산기가 반영하지 않는 것 ({unsupported.length})
          </summary>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {unsupported.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
        </details>
      )}

      <p>
        ※ 정책은 수시로 바뀝니다. 실제 적용 기준은 신청 시점의 금융위원회·국토교통부 공시와
        금융회사 안내로 확인하세요.
      </p>
    </div>
  );
}
