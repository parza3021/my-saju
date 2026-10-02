import { DayView, Level, WeekSummary } from "@/lib/iljin";
import { StarRating } from "./saju/ui";

const LEVEL_STYLE: Record<Level, string> = {
  순조: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  보통: "bg-white/10 text-white/50 border-white/15",
  주의: "bg-red-500/20 text-red-300 border-red-500/30",
};
const BAR: Record<Level, string> = { 순조: "bg-emerald-400", 보통: "bg-white/40", 주의: "bg-red-400" };

export default function WeeklyFortune({ days, summary }: { days: DayView[]; summary: WeekSummary }) {
  const { counts, best, worst } = summary;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
      <div>
        <h3 className="text-lg font-semibold text-amber-300">{summary.toneTitle}</h3>
        <p className="mt-2 text-sm text-white/70 leading-relaxed">{summary.toneDescription}</p>
        <p className="mt-2 text-sm text-white/60">
          이번 주는 <span className="text-emerald-300">순조 {counts.순조}일</span> ·{" "}
          <span className="text-white/70">보통 {counts.보통}일</span> ·{" "}
          <span className="text-red-300">주의 {counts.주의}일</span>로 흘러갑니다. 평균 ★{summary.avgStars}
        </p>
      </div>

      <div className="mt-5 flex items-end gap-2 h-28" role="img" aria-label="요일별 별점 막대 차트">
        {days.map((d) => (
          <div key={d.facts.day} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
            <span className="text-[11px] text-white/50">★{d.facts.dayScore.stars}</span>
            <div
              className={`w-full max-w-9 rounded-t ${BAR[d.level]} ${d.isToday ? "ring-2 ring-amber-300/70" : ""}`}
              style={{ height: `${(d.facts.dayScore.stars / 5) * 70}%` }}
            />
          </div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-2 text-center">
        {days.map((d) => (
          <div key={d.facts.day} className={`rounded-lg border px-1 py-2 ${d.isToday ? "border-amber-400/40 bg-amber-400/10" : "border-white/10 bg-white/5"}`}>
            <p className="text-[11px] text-white/50">
              {d.facts.date.month}/{d.facts.date.day}
              <br />({d.facts.date.weekday})
            </p>
            <p className="mt-1 text-sm font-semibold text-white">{d.facts.ganzhi.ganjiKr}</p>
            <p className="text-[11px] text-amber-300/80">{d.facts.sipsinToday[0]}</p>
            <span className={`mt-1 inline-block text-[10px] rounded-full border px-1.5 ${LEVEL_STYLE[d.level]}`}>{d.level}</span>
          </div>
        ))}
      </div>

      {(best || worst) && (
        <div className="mt-4 text-sm text-white/65 space-y-1">
          {best && (
            <p>
              <span className="text-emerald-300">가장 순조로운 날</span> — {best.facts.date.month}월 {best.facts.date.day}일({best.facts.date.weekday}){" "}
              <StarRating stars={best.facts.dayScore.stars} size="text-sm" /> {best.fortune.keyword}
            </p>
          )}
          {worst && (
            <p>
              <span className="text-red-300">조심할 날</span> — {worst.facts.date.month}월 {worst.facts.date.day}일({worst.facts.date.weekday}){" "}
              <StarRating stars={worst.facts.dayScore.stars} size="text-sm" /> {worst.fortune.keyword}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
