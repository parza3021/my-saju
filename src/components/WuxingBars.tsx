import { WUXING_CONTENT } from "@/lib/content/wuxing";
import { WUXING_LIST } from "@/lib/ganzhi";
import { Wuxing } from "@/lib/types";

const BAR_COLOR: Record<Wuxing, string> = {
  목: "bg-emerald-400",
  화: "bg-red-400",
  토: "bg-yellow-500",
  금: "bg-slate-300",
  수: "bg-sky-400",
};

export default function WuxingBars({ counts }: { counts: Record<Wuxing, number> }) {
  const max = Math.max(1, ...Object.values(counts));
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const dominant = WUXING_LIST.reduce((a, b) => (counts[b] > counts[a] ? b : a));
  const missing = WUXING_LIST.filter((w) => counts[w] === 0);

  return (
    <div>
      <div className="space-y-2">
        {WUXING_LIST.map((w) => (
          <div key={w} className="flex items-center gap-3">
            <span className="w-10 text-sm text-white/70">
              {w}({WUXING_CONTENT[w].hanja})
            </span>
            <div className="flex-1 h-3 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full ${BAR_COLOR[w]}`}
                style={{ width: `${(counts[w] / max) * 100}%` }}
              />
            </div>
            <span className="w-5 text-right text-sm text-white/60">{counts[w]}</span>
          </div>
        ))}
      </div>

      {total > 0 && (
        <div className="mt-4 space-y-2 text-sm text-white/70">
          <p>
            <span className="text-amber-300 font-medium">
              {dominant}({WUXING_CONTENT[dominant].hanja})
            </span>{" "}
            기운이 가장 강합니다. {WUXING_CONTENT[dominant].abundant}
          </p>
          {missing.length > 0 && (
            <p>
              <span className="text-white/50">
                {missing.map((w) => `${w}(${WUXING_CONTENT[w].hanja})`).join(", ")}
              </span>{" "}
              기운은 사주 원국에 보이지 않습니다. {WUXING_CONTENT[missing[0]].lacking}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
