import { IljinResult, Wuxing } from "@/lib/types";

const RELATION_BADGE: Record<IljinResult["relations"][number]["polarity"], string> = {
  긍정: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  주의: "bg-red-500/20 text-red-300 border-red-500/30",
};

export default function IljinCard({
  iljin,
  supplement,
}: {
  iljin: IljinResult;
  supplement: { element: Wuxing; color: string };
}) {
  const { date, gan, zhi, shiShen, fortune, relations, elementNote } = iljin;

  return (
    <div className="rounded-2xl border border-amber-400/25 bg-amber-400/5 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs text-white/50">
            {date.year}년 {date.month}월 {date.day}일 ({date.weekday})
          </p>
          <p className="mt-1 text-2xl font-bold text-amber-300">
            {gan.hangul}
            {zhi.hangul}일
            <span className="ml-2 text-lg text-white/40 font-normal">
              {gan.hanja}
              {zhi.hanja}
            </span>
          </p>
        </div>
        <div className="text-right">
          <span className="inline-block text-xs rounded-full border border-indigo-500/30 bg-indigo-500/20 text-indigo-300 px-2 py-0.5">
            {shiShen}의 날
          </span>
          <p className="mt-1 text-sm text-white/60">{fortune.keyword}</p>
        </div>
      </div>

      <p className="mt-4 text-sm text-white/80 leading-relaxed">{fortune.summary}</p>

      <div className="mt-4 grid sm:grid-cols-2 gap-4">
        <div className="rounded-lg bg-white/5 border border-white/10 p-3">
          <p className="text-xs text-emerald-300 mb-1">이런 일에 좋은 날</p>
          <p className="text-sm text-white/70 leading-relaxed">{fortune.good}</p>
        </div>
        <div className="rounded-lg bg-white/5 border border-white/10 p-3">
          <p className="text-xs text-red-300 mb-1">이런 점은 주의</p>
          <p className="text-sm text-white/70 leading-relaxed">{fortune.caution}</p>
        </div>
      </div>

      {relations.length > 0 && (
        <div className="mt-4 space-y-2">
          {relations.map((r, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span
                className={`shrink-0 text-xs rounded-full border px-2 py-0.5 ${RELATION_BADGE[r.polarity]}`}
              >
                {r.type}
              </span>
              <p className="text-sm text-white/70 leading-relaxed">{r.description}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-x-6 gap-y-2 items-center">
        <p className="text-sm text-white/70 flex-1 min-w-[240px] leading-relaxed">{elementNote}</p>
        <p className="text-sm text-white/50">
          {date.isToday ? "오늘" : "이 날"} 보완하면 좋은 기운{" "}
          <span className="text-amber-300 font-medium">
            {supplement.element} · {supplement.color}
          </span>
        </p>
      </div>
    </div>
  );
}
