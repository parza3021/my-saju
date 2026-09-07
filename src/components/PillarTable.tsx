import { SajuResult } from "@/lib/types";

const WUXING_COLOR: Record<string, string> = {
  목: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  화: "bg-red-500/20 text-red-300 border-red-500/30",
  토: "bg-yellow-600/20 text-yellow-300 border-yellow-600/30",
  금: "bg-slate-300/20 text-slate-200 border-slate-300/30",
  수: "bg-sky-500/20 text-sky-300 border-sky-500/30",
};

export default function PillarTable({ result }: { result: SajuResult }) {
  const pillars = [result.time, result.day, result.month, result.year].filter(
    (p): p is NonNullable<typeof p> => p !== null
  );

  return (
    <div className="overflow-x-auto">
      <div className="grid grid-flow-col auto-cols-[minmax(80px,1fr)] gap-2 min-w-[340px]">
        {pillars.map((p) => (
          <div key={p.label} className="text-center">
            <div className="text-xs text-white/50 mb-2">{p.label}</div>
            <div
              className={`rounded-t-lg border px-2 py-3 text-2xl font-bold ${WUXING_COLOR[p.gan.wuxing]}`}
            >
              {p.gan.hanja}
            </div>
            <div
              className={`rounded-b-lg border-x border-b px-2 py-3 text-2xl font-bold ${WUXING_COLOR[p.zhi.wuxing]}`}
            >
              {p.zhi.hanja}
            </div>
            <div className="mt-2 text-xs text-white/60">
              {p.gan.hangul}{p.zhi.hangul}
            </div>
            <div className="mt-1 text-[11px] text-amber-300/80 h-4">
              {p.shiShen ?? (p.label === "일주" ? "일간(나)" : "")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
