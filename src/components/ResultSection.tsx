import { DAY_MASTER_CONTENT } from "@/lib/content/dayMaster";
import { SHI_SHEN_CONTENT } from "@/lib/content/shishen";
import { getSupplementWuxing } from "@/lib/iljin";
import { IljinResult, SajuResult, WeekSummary, ZodiacResult } from "@/lib/types";
import IljinCard from "./IljinCard";
import PillarTable from "./PillarTable";
import WeeklyFortune from "./WeeklyFortune";
import WuxingBars from "./WuxingBars";
import ZodiacCard from "./ZodiacCard";

export default function ResultSection({
  saju,
  zodiac,
  iljin,
  weekly,
  weekSummary,
  selectedDate,
  onSelectedDateChange,
  onResetDate,
}: {
  saju: SajuResult;
  zodiac: ZodiacResult;
  iljin: IljinResult;
  weekly: IljinResult[];
  weekSummary: WeekSummary;
  selectedDate: string;
  onSelectedDateChange: (value: string) => void;
  onResetDate: () => void;
}) {
  const supplement = getSupplementWuxing(saju);
  const dayMaster = DAY_MASTER_CONTENT[saju.dayMaster.hangul];
  const shishenInPillars = Array.from(
    new Set(
      [saju.year.shiShen, saju.month.shiShen, saju.time?.shiShen].filter(
        (s): s is string => !!s
      )
    )
  );

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      <section>
        <h2 className="text-sm font-medium text-white/50 mb-3">사주팔자 원국</h2>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <PillarTable result={saju} />
          {!saju.timeKnown && (
            <p className="mt-4 text-xs text-white/40 text-center">
              태어난 시간이 입력되지 않아 시주는 표시되지 않았습니다.
            </p>
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <h2 className="text-sm font-medium text-white/50">
            {iljin.date.isToday ? "오늘의 일진(日辰)" : "선택한 날의 일진(日辰)"}
          </h2>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onSelectedDateChange(e.target.value)}
              className="rounded-lg bg-white/10 border border-white/10 px-3 py-1.5 text-sm text-white outline-none focus:border-amber-400 [color-scheme:dark]"
            />
            {!iljin.date.isToday && (
              <button
                type="button"
                onClick={onResetDate}
                className="rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1.5 text-sm text-white/70 transition-colors"
              >
                오늘로
              </button>
            )}
          </div>
        </div>
        <IljinCard iljin={iljin} supplement={supplement} />
      </section>

      <section>
        <h2 className="text-sm font-medium text-white/50 mb-3">
          주간 운세 — {weekSummary.start.month}월 {weekSummary.start.day}일({weekSummary.start.weekday}) ~{" "}
          {weekSummary.end.month}월 {weekSummary.end.day}일({weekSummary.end.weekday})
        </h2>
        <WeeklyFortune days={weekly} summary={weekSummary} />
      </section>

      <section>
        <h2 className="text-sm font-medium text-white/50 mb-3">일간(日干) — 나를 상징하는 기운</h2>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-xl font-semibold text-amber-300">{dayMaster.title}</h3>
          <p className="mt-2 text-sm text-white/70 leading-relaxed">{dayMaster.summary}</p>
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-white/50 mb-1">강점</p>
              <ul className="text-sm text-white/80 space-y-1 list-disc list-inside">
                {dayMaster.strengths.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs text-white/50 mb-1">주의할 점</p>
              <ul className="text-sm text-white/80 space-y-1 list-disc list-inside">
                {dayMaster.cautions.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium text-white/50 mb-3">오행(五行) 분포</h2>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <WuxingBars counts={saju.wuxingCount} />
        </div>
      </section>

      {shishenInPillars.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-white/50 mb-3">사주에 드러난 십신(十神)</h2>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-3">
            {shishenInPillars.map((s) => (
              <div key={s} className="text-sm">
                <span className="font-medium text-amber-300">{s}</span>
                <span className="text-white/70"> — {SHI_SHEN_CONTENT[s]}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-sm font-medium text-white/50 mb-3">서양 별자리</h2>
        <ZodiacCard zodiac={zodiac} />
      </section>
    </div>
  );
}
