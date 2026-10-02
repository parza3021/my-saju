import type { Reaction } from "@/lib/engine/daily";
import { PersonFacts } from "@/lib/engine/natal";
import { POS, POS_LONG } from "@/lib/engine/plain";
import { PILLAR_KO, PillarKey } from "@/lib/engine/relations";
import { branchElOf, branchHanja, elTint, EL_VAR, stemElOf, stemHanja } from "./colors";

const COLS: PillarKey[] = ["hour", "day", "month", "year"];

/** 여덟 글자 격자 — 시·일·월·년 순서, '나'(일간) 칸 강조, 오늘과 반응한 글자는 테두리로 표시 */
export default function EightCharGrid({
  person,
  hits = [],
  showUnseong = true,
}: {
  person: PersonFacts;
  hits?: Reaction[];
  showUnseong?: boolean;
}) {
  const hit = (k: PillarKey, kind: "간" | "지") => hits.some((h) => h.posKey === k && h.kind === kind);

  return (
    <div className="overflow-x-auto">
      <div className="grid grid-cols-4 gap-2 min-w-[300px]">
        {COLS.map((k) => {
          const ko = PILLAR_KO[k];
          const p = person.pillars[k];
          const isMe = k === "day";
          return (
            <div key={k} className={`text-center rounded-xl p-1.5 ${isMe ? "bg-white/5 ring-1 ring-amber-400/30" : ""}`}>
              <div className="text-[11px] leading-tight text-white/45">
                {POS_LONG[ko][0]}
                <br />
                <span className={isMe ? "text-amber-300" : ""}>{isMe ? "나 · 일상" : POS[ko]}</span>
              </div>
              {p ? (
                <>
                  <div
                    className={`mt-2 rounded-t-lg border py-2 ${hit(k, "간") ? "outline outline-2 outline-amber-300" : ""}`}
                    style={{ color: EL_VAR[stemElOf(p.cg)], background: elTint(stemElOf(p.cg)), borderColor: elTint(stemElOf(p.cg), 40) }}
                  >
                    <div className="text-2xl font-bold leading-none">{stemHanja(p.cg)}</div>
                    <div className="text-xs mt-1 opacity-80">{p.cg}</div>
                  </div>
                  <div
                    className={`rounded-b-lg border-x border-b py-2 ${hit(k, "지") ? "outline outline-2 outline-amber-300" : ""}`}
                    style={{ color: EL_VAR[branchElOf(p.jj)], background: elTint(branchElOf(p.jj)), borderColor: elTint(branchElOf(p.jj), 40) }}
                  >
                    <div className="text-2xl font-bold leading-none">{branchHanja(p.jj)}</div>
                    <div className="text-xs mt-1 opacity-80">{p.jj}</div>
                  </div>
                  <div className="mt-1.5 text-[11px] text-amber-300/80 h-4">{isMe ? "일간(나)" : person.stemSipsin[k]}</div>
                  {showUnseong && <div className="text-[11px] text-white/35">{person.unseong[k]}</div>}
                </>
              ) : (
                <div className="mt-2 rounded-lg border border-dashed border-white/15 py-5 text-white/30">
                  <div className="text-2xl leading-none">?</div>
                  <div className="text-[11px] mt-2">시각 모름</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
