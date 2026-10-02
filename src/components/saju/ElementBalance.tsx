import { WUXING_CONTENT } from "@/lib/content/wuxing";
import { OhaengReport } from "@/lib/engine/daily";
import { OHAENG } from "@/lib/engine/plain";
import { EL_ORDER, Wuxing } from "@/lib/engine/relations";
import { EL_VAR } from "./colors";

/** 오행 개수 막대 — counts 만 주면 원국 분포, report 를 주면 '원국 + 오늘 두 글자'의 전후 비교 */
export default function ElementBalance({
  counts,
  report,
}: {
  counts: Record<Wuxing, number>;
  report?: OhaengReport;
}) {
  const shown = report ? Object.fromEntries(EL_ORDER.map((e) => [e, report.rows[e].today])) as Record<Wuxing, number> : counts;
  const max = Math.max(1, ...Object.values(shown));

  return (
    <div className="space-y-2.5">
      {EL_ORDER.map((e) => {
        const row = report?.rows[e];
        const diff = row ? row.today - row.prev : 0;
        return (
          <div key={e} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-sm text-white/70">
              <b style={{ color: EL_VAR[e] }}>
                {e}({WUXING_CONTENT[e].hanja})
              </b>{" "}
              <span className="text-[11px] text-white/35">{OHAENG[e]}</span>
            </span>
            <div className="flex-1 h-3 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${(shown[e] / max) * 100}%`, background: EL_VAR[e] }} />
            </div>
            <span className="w-5 text-right text-sm text-white/70">{shown[e]}</span>
            {row && (
              <span className="w-24 shrink-0 text-[11px] text-white/45 leading-tight">
                {diff > 0 && <span className="text-emerald-300">▲ +{diff} </span>}
                {diff < 0 && <span className="text-red-300">▼ {diff} </span>}
                {row.in.length > 0 && <span>들어옴 {row.in.join("")}</span>}
                {row.out.length > 0 && <span> 나감 {row.out.join("")}</span>}
              </span>
            )}
          </div>
        );
      })}
      {report && (
        <p className="text-xs text-white/40 pt-1">
          원국 {Object.values(report.natal).reduce((a, b) => a + b, 0)}글자 + 오늘 두 글자 = {report.total}. 어제와 비교해 달라진 칸만 화살표로 표시합니다.
        </p>
      )}
    </div>
  );
}
