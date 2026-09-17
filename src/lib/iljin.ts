import { CHUNG, WONJIN, YUKHAP } from "./branchRelations";
import { ILJIN_FORTUNE } from "./content/iljin";
import { WUXING_CONTENT } from "./content/wuxing";
import { getShiShen, WUXING_LIST } from "./ganzhi";
import { calculateSaju } from "./saju";
import { DailyRelationNote, IljinResult, Pillar, SajuResult, WeekSummary, Wuxing } from "./types";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

// 자리별로 영향을 받는 생활 영역 — 명리학에서 각 주(柱)가 상징하는 범위
const PILLAR_AREA: Record<Pillar["label"], string> = {
  년주: "윗사람이나 대외적인 관계",
  월주: "직장과 사회생활",
  일주: "나 자신과 가장 가까운 사람",
  시주: "아랫사람이나 개인적인 일과",
};

const SHI_SHEN_SCORE: Record<string, number> = {
  식신: 2,
  정인: 2,
  정재: 2,
  정관: 2,
  비견: 1,
  편재: 1,
  편인: 0,
  상관: -1,
  겁재: -1,
  편관: -2,
};

function getPillars(saju: SajuResult): Pillar[] {
  return [saju.year, saju.month, saju.day, saju.time].filter(
    (p): p is Pillar => p !== null
  );
}

function findDayRelations(
  saju: SajuResult,
  dayBranch: string,
  dayWord: string
): DailyRelationNote[] {
  const notes: DailyRelationNote[] = [];

  for (const pillar of getPillars(saju)) {
    const mine = pillar.zhi.hanja;
    const area = PILLAR_AREA[pillar.label];

    if (YUKHAP.some(([a, b]) => (a === mine && b === dayBranch) || (a === dayBranch && b === mine))) {
      notes.push({
        type: "육합",
        polarity: "긍정",
        description: `${dayWord}의 일지가 내 ${pillar.label}(${pillar.zhi.hangul})와(과) 육합을 이루어, ${area}에서 이야기가 순조롭게 맞물리는 날입니다.`,
      });
    }

    if (CHUNG.some(([a, b]) => (a === mine && b === dayBranch) || (a === dayBranch && b === mine))) {
      notes.push({
        type: "충",
        polarity: "주의",
        description: `${dayWord}의 일지가 내 ${pillar.label}(${pillar.zhi.hangul})와(과) 충을 이루어, ${area}에서 변동이 생기거나 예정이 틀어지기 쉬운 날입니다.`,
      });
    }

    if (WONJIN.some(([a, b]) => (a === mine && b === dayBranch) || (a === dayBranch && b === mine))) {
      notes.push({
        type: "원진",
        polarity: "주의",
        description: `${dayWord}의 일지가 내 ${pillar.label}(${pillar.zhi.hangul})와(과) 원진에 해당해, ${area}에서 사소한 일에 신경이 예민해지기 쉬운 날입니다.`,
      });
    }
  }

  return notes;
}

function describeElementFlow(saju: SajuResult, dayElements: Wuxing[], dayWord: string): string {
  const counts = saju.wuxingCount;
  const min = Math.min(...WUXING_LIST.map((w) => counts[w]));
  const max = Math.max(...WUXING_LIST.map((w) => counts[w]));

  const lacking = dayElements.find((e) => counts[e] === min);
  if (lacking) {
    return `${dayWord}은 사주에 상대적으로 부족한 ${lacking} 기운이 들어오는 날이라, 평소 아쉬웠던 부분이 채워지는 흐름입니다.`;
  }

  const excessive = dayElements.find((e) => counts[e] === max);
  if (excessive) {
    return `${dayWord}은 이미 왕성한 ${excessive} 기운이 더해지는 날이라, 한쪽으로 치우치지 않도록 속도를 조절하는 것이 좋습니다.`;
  }

  const unique = Array.from(new Set(dayElements));
  return `${dayWord} 들어오는 ${unique.join("·")} 기운은 내 사주와 무난하게 어울리는 흐름입니다.`;
}

export function getSupplementWuxing(saju: SajuResult): { element: Wuxing; color: string } {
  const counts = saju.wuxingCount;
  const element = WUXING_LIST.reduce((a, b) => (counts[b] < counts[a] ? b : a));
  return { element, color: WUXING_CONTENT[element].color };
}

export function calculateDailyFortune(
  saju: SajuResult,
  date: Date,
  today: Date = new Date()
): IljinResult {
  const daySaju = calculateSaju({
    calendarType: "solar",
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    isLeapMonth: false,
    hour: 12,
    minute: 0,
  });

  const gan = daySaju.day.gan;
  const zhi = daySaju.day.zhi;
  const isToday = date.toDateString() === today.toDateString();
  const dayWord = isToday ? "오늘" : "이 날";
  const shiShen = getShiShen(saju.dayMaster, gan);
  const relations = findDayRelations(saju, zhi.hanja, dayWord);

  const relationScore = relations.reduce((sum, r) => {
    if (r.type === "육합") return sum + 2;
    if (r.type === "충") return sum - 2;
    return sum - 1;
  }, 0);
  const score = (SHI_SHEN_SCORE[shiShen] ?? 0) + relationScore;
  const level = score >= 2 ? "순조" : score <= -1 ? "주의" : "보통";

  return {
    date: {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      weekday: WEEKDAYS[date.getDay()],
      isToday,
    },
    gan,
    zhi,
    shiShen,
    fortune: ILJIN_FORTUNE[shiShen],
    relations,
    elementNote: describeElementFlow(saju, [gan.wuxing, zhi.wuxing], dayWord),
    level,
  };
}

// 기준일이 속한 주의 월요일 (한 주를 월~일로 봅니다)
function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const offset = d.getDay() === 0 ? -6 : 1 - d.getDay();
  d.setDate(d.getDate() + offset);
  return d;
}

export function calculateWeeklyFortune(
  saju: SajuResult,
  refDate: Date = new Date(),
  today: Date = new Date()
): IljinResult[] {
  const monday = startOfWeek(refDate);
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return calculateDailyFortune(saju, date, today);
  });
}

const SHI_SHEN_GROUP: Record<string, string> = {
  비견: "비겁",
  겁재: "비겁",
  식신: "식상",
  상관: "식상",
  편재: "재성",
  정재: "재성",
  편관: "관성",
  정관: "관성",
  편인: "인성",
  정인: "인성",
};

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

export function summarizeWeek(days: IljinResult[]): WeekSummary {
  const counts: Record<IljinResult["level"], number> = { 순조: 0, 보통: 0, 주의: 0 };
  const groupCounts: Record<string, number> = {};

  for (const day of days) {
    counts[day.level]++;
    const group = SHI_SHEN_GROUP[day.shiShen];
    groupCounts[group] = (groupCounts[group] ?? 0) + 1;
  }

  const ranked = Object.entries(groupCounts).sort((a, b) => b[1] - a[1]);
  const dominant = ranked.length > 1 && ranked[0][1] === ranked[1][1] ? "혼재" : ranked[0][0];
  const tone = GROUP_TONE[dominant];

  const first = days[0];
  const last = days[days.length - 1];

  return {
    start: { month: first.date.month, day: first.date.day, weekday: first.date.weekday },
    end: { month: last.date.month, day: last.date.day, weekday: last.date.weekday },
    counts,
    toneTitle: tone.title,
    toneDescription: tone.description,
    best: days.find((d) => d.level === "순조") ?? null,
    worst: days.find((d) => d.level === "주의") ?? null,
  };
}

export function toDateInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseDateInput(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}
