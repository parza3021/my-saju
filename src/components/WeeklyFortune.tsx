import { IljinResult, WeekSummary } from "@/lib/types";

const LEVEL_STYLE: Record<IljinResult["level"], string> = {
  순조: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  보통: "bg-white/10 text-white/50 border-white/15",
  주의: "bg-red-500/20 text-red-300 border-red-500/30",
};

export default function WeeklyFortune({
  days,
  summary,
}: {
  days: IljinResult[];
  summary: WeekSummary;
}) {
  const { counts, best, worst } = summary;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div>
        <h3 className="text-lg font-semibold text-amber-300">{summary.toneTitle}</h3>
        <p className="mt-2 text-sm text-white/70 leading-relaxed">{summary.toneDescription}</p>
        <p className="mt-2 text-sm text-white/60">
          이번 주는 <span className="text-emerald-300">순조 {counts.순조}일</span> ·{" "}
          <span className="text-white/70">보통 {counts.보통}일</span> ·{" "}
          <span className="text-red-300">주의 {counts.주의}일</span>로 흘러갑니다.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {days.map((day) => (
          <div
            key={`${day.date.month}-${day.date.day}`}
            className={`rounded-lg border p-3 text-center ${
              day.date.isToday ? "border-amber-400/40 bg-amber-400/10" : "border-white/10 bg-white/5"
            }`}
          >
            <p className="text-xs text-white/50">
              {day.date.month}/{day.date.day} ({day.date.weekday})
            </p>
            <p className="mt-1 text-base font-semibold text-white">
              {day.gan.hangul}
              {day.zhi.hangul}
            </p>
            <p className="mt-0.5 text-xs text-white/60">{day.shiShen}</p>
            <span
              className={`mt-2 inline-block text-[11px] rounded-full border px-2 py-0.5 ${LEVEL_STYLE[day.level]}`}
            >
              {day.level}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-1 text-sm text-white/70">
        {best && (
          <p>
            이번 주 가장 흐름이 좋은 날은{" "}
            <span className="text-emerald-300 font-medium">
              {best.date.month}월 {best.date.day}일({best.date.weekday})
            </span>{" "}
            — {best.fortune.keyword}의 기운이 들어오니 중요한 일을 이날로 잡아보세요.
          </p>
        )}
        {worst && (
          <p>
            반대로{" "}
            <span className="text-red-300 font-medium">
              {worst.date.month}월 {worst.date.day}일({worst.date.weekday})
            </span>
            은 부딪히는 기운이 있으니, 무리한 일정이나 중요한 결정은 피하는 편이 좋습니다.
          </p>
        )}
        {!best && !worst && <p>특별히 튀는 날 없이 전반적으로 무난하게 흘러가는 한 주입니다.</p>}
      </div>
    </div>
  );
}
