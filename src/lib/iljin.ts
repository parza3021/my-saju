// 일진·주간 — 엔진의 하루 계산(dailyFacts)을 화면에 맞게 묶는다.

import { ILJIN_FORTUNE } from "./content/iljin";
import { WUXING_CONTENT } from "./content/wuxing";
import { Day, weekdayMon0 } from "./engine/clock";
import { DailyFacts, dailyFacts, Reaction } from "./engine/daily";
import { PersonFacts } from "./engine/natal";
import { relPlain, relTag } from "./engine/plain";
import { EL_ORDER, gwa, Sipsin, Wuxing } from "./engine/relations";
import { IljinFortune } from "./types";

export type Level = "순조" | "보통" | "주의";

export interface DayView {
  facts: DailyFacts;
  isToday: boolean;
  level: Level;
  fortune: IljinFortune;
}

export function levelOfStars(stars: number): Level {
  return stars >= 4 ? "순조" : stars <= 2 ? "주의" : "보통";
}

export function dayView(P: PersonFacts, day: Day, today: Day): DayView {
  const facts = dailyFacts(P, day);
  return {
    facts,
    isToday: day === today,
    level: levelOfStars(facts.dayScore.stars),
    fortune: ILJIN_FORTUNE[facts.sipsinToday[0]],
  };
}

/** 기준일이 속한 주(월~일) 7일 */
export function weekViews(P: PersonFacts, ref: Day, today: Day): DayView[] {
  const monday = ref - weekdayMon0(ref);
  return Array.from({ length: 7 }, (_, i) => dayView(P, monday + i, today));
}

/** 가장 부족한 오행 — 오늘 보완하면 좋은 기운 */
export function supplementWuxing(P: PersonFacts): { element: Wuxing; color: string } {
  const element = EL_ORDER.reduce((a, b) => (P.ohaeng[b] < P.ohaeng[a] ? b : a));
  return { element, color: WUXING_CONTENT[element].color };
}

export type ReactionTone = "good" | "warn" | "mixed" | "neutral";

const GOOD = ["육합", "천간합", "반합"];
const WARN = ["충", "천간충", "형", "파", "해", "원진", "자형"];

export function reactionTone(rel: string[]): ReactionTone {
  const names = rel.map((r) => r.split("(")[0]);
  const g = names.some((n) => GOOD.includes(n));
  const w = names.some((n) => WARN.includes(n));
  return g && w ? "mixed" : g ? "good" : w ? "warn" : "neutral";
}

/** 반응 한 건을 쉬운 말로 — 예: "일하는 방식 자리(사)와 정면으로 부딪힘" + 전문 표기 */
export function reactionText(r: Reaction, todayStem: string, todayBranch: string): { plain: string; tag: string } {
  const where = r.posKey === "day" && r.kind === "간" ? "나 자신" : POS_NAME[r.posKey];
  const part = r.kind === "간" ? "윗글자" : "아랫글자";
  if (r.rel.length === 1 && r.rel[0] === "복음") {
    return { plain: `${where}의 ${part}(${r.natal})${gwa(r.natal)} 오늘 글자가 같아 기운이 겹침`, tag: "복음" };
  }
  const tag = r.kind === "지"
    ? relTag(todayBranch, r.natal, r.rel.filter((x) => x !== "복음"))
    : `${todayStem}${r.natal}${r.rel[0].startsWith("천간합") ? "합" : "충"}`;
  return { plain: `${where}의 ${part}(${r.natal})${gwa(r.natal)} ${relPlain(r.rel.filter((x) => x !== "복음"))}`, tag };
}

const POS_NAME = { year: "배경 자리", month: "일하는 방식 자리", day: "일상 자리", hour: "사적인 시간 자리" } as const;

// ---- 주간 요약 -----------------------------------------------------------------

// 두 개씩 짝지어 계열을 이룹니다 (비견·겁재 = 비겁, 식신·상관 = 식상 …)
const SHI_SHEN_ORDER: Sipsin[] = ["비견", "겁재", "식신", "상관", "편재", "정재", "편관", "정관", "편인", "정인"];
const SHI_SHEN_GROUPS = ["비겁", "식상", "재성", "관성", "인성"];

const GROUP_TONE: Record<string, { title: string; description: string }> = {
  비겁: {
    title: "비겁(比劫)의 기운이 강한 주",
    description: "스스로 결정하고 밀고 나가는 힘이 강해지는 한 주입니다. 남에게 맡기기보다 주도적으로 움직일 일이 많으니, 고집으로 흐르지 않게만 유의하세요.",
  },
  식상: {
    title: "식상(食傷)의 기운이 강한 주",
    description: "생각과 재능을 밖으로 표현하기 좋은 한 주입니다. 새로운 시도나 창작, 사람들과 나누는 자리에 힘이 실립니다.",
  },
  재성: {
    title: "재성(財星)의 기운이 강한 주",
    description: "실속을 챙기고 기회를 잡기 좋은 한 주입니다. 금전과 거래에 움직임이 생기니 규모를 정해두고 움직이면 좋습니다.",
  },
  관성: {
    title: "관성(官星)의 기운이 강한 주",
    description: "책임과 규칙이 강조되는 한 주입니다. 공적인 일과 신뢰를 다지기에 유리하지만, 일정을 과하게 잡으면 부담이 커집니다.",
  },
  인성: {
    title: "인성(印星)의 기운이 강한 주",
    description: "배움과 정비에 어울리는 한 주입니다. 무리해서 나서기보다 채우고 준비하는 데 시간을 쓰면 좋습니다.",
  },
  혼재: {
    title: "여러 기운이 고르게 섞인 주",
    description: "한 가지 흐름이 크게 두드러지지 않는 한 주입니다. 날마다 기운의 결이 달라지니, 아래 일별 흐름을 보고 중요한 일정을 배치하면 좋습니다.",
  },
};

export interface WeekSummary {
  counts: Record<Level, number>;
  toneTitle: string;
  toneDescription: string;
  best: DayView | null;
  worst: DayView | null;
  avgStars: number;
}

export function summarizeWeek(days: DayView[]): WeekSummary {
  const counts: Record<Level, number> = { 순조: 0, 보통: 0, 주의: 0 };
  const groupCounts: Record<string, number> = {};

  for (const day of days) {
    counts[day.level]++;
    const group = SHI_SHEN_GROUPS[Math.floor(SHI_SHEN_ORDER.indexOf(day.facts.sipsinToday[0]) / 2)];
    groupCounts[group] = (groupCounts[group] ?? 0) + 1;
  }

  const ranked = Object.entries(groupCounts).sort((a, b) => b[1] - a[1]);
  const dominant = ranked.length > 1 && ranked[0][1] === ranked[1][1] ? "혼재" : ranked[0][0];
  const tone = GROUP_TONE[dominant];
  const byStars = [...days].sort((a, b) => b.facts.dayScore.stars - a.facts.dayScore.stars);

  return {
    counts,
    toneTitle: tone.title,
    toneDescription: tone.description,
    best: byStars[0].facts.dayScore.stars >= 4 ? byStars[0] : null,
    worst: byStars[byStars.length - 1].facts.dayScore.stars <= 2 ? byStars[byStars.length - 1] : null,
    avgStars: Math.round((days.reduce((s, d) => s + d.facts.dayScore.stars, 0) / days.length) * 10) / 10,
  };
}

export const WEEKDAY_LABEL = "월화수목금토일";
