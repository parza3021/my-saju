import type { ReactNode } from "react";

/** 섹션 제목 + 카드 한 덩어리 */
export function Section({
  title,
  lede,
  children,
  right,
}: {
  title: string;
  lede?: ReactNode;
  children: ReactNode;
  right?: ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <h2 className="text-sm font-medium text-white/50">{title}</h2>
        {right}
      </div>
      {lede && <p className="text-sm text-white/55 leading-relaxed mb-3">{lede}</p>}
      {children}
    </section>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6 ${className}`}>{children}</div>;
}

/** 전문 용어는 쉬운 말 옆에 작은 글씨로 */
export function Jargon({ children }: { children: ReactNode }) {
  return <span className="text-white/40 text-[0.85em] ml-1">({children})</span>;
}

const AMBER = "bg-amber-400/20 text-amber-300 border-amber-400/30";

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "good" | "warn" | "info" | "neutral" | "amber" | "mixed" }) {
  const cls = {
    good: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    warn: "bg-red-500/20 text-red-300 border-red-500/30",
    info: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    amber: AMBER,
    mixed: AMBER,
    neutral: "bg-white/10 text-white/60 border-white/15",
  }[tone];
  return <span className={`inline-block shrink-0 whitespace-nowrap text-xs rounded-full border px-2 py-0.5 ${cls}`}>{children}</span>;
}

export function Disclosure({ summary, children }: { summary: ReactNode; children: ReactNode }) {
  return (
    <details className="group mt-2">
      <summary className="cursor-pointer text-xs text-white/45 hover:text-white/70 select-none">{summary}</summary>
      <div className="mt-2">{children}</div>
    </details>
  );
}

/** 가로로 넘칠 수 있는 표 */
export function TableWrap({ children }: { children: ReactNode }) {
  return <div className="overflow-x-auto -mx-1 px-1">{children}</div>;
}

export function StarRating({ stars, size = "text-base" }: { stars: number; size?: string }) {
  return (
    <span className={`${size} tracking-wider text-amber-300`} role="img" aria-label={`별 ${stars}개`}>
      {"★".repeat(stars)}
      <span className="text-white/20">{"★".repeat(5 - stars)}</span>
    </span>
  );
}
