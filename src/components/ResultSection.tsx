import { DAY_MASTER_CONTENT } from "@/lib/content/dayMaster";
import { SHI_SHEN_CONTENT } from "@/lib/content/shishen";
import { SajuResult, ZodiacResult } from "@/lib/types";
import PillarTable from "./PillarTable";
import WuxingBars from "./WuxingBars";
import ZodiacCard from "./ZodiacCard";

export default function ResultSection({
  saju,
  zodiac,
}: {
  saju: SajuResult;
  zodiac: ZodiacResult;
}) {
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
