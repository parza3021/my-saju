import { ZodiacResult } from "@/lib/types";

export default function ZodiacCard({ zodiac }: { zodiac: ZodiacResult }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-semibold text-white">
          {zodiac.name} <span className="text-white/40 text-sm">{zodiac.hanja}</span>
        </h3>
        <span className="text-xs text-white/50">{zodiac.dateRange}</span>
      </div>
      <div className="mt-2 flex gap-2">
        <span className="text-xs rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5">
          {zodiac.element}의 별자리
        </span>
        <span className="text-xs rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5">
          {zodiac.keyword}
        </span>
      </div>
      <p className="mt-3 text-sm text-white/70 leading-relaxed">{zodiac.description}</p>
    </div>
  );
}
