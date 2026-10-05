// 하루의 일진을 한 사람의 원국에 비춰 계산한다 — compute_iljin.py 의 1인 버전 이식.
//   오늘 두 글자(일진)와 내 여덟 글자의 반응, 오늘 글자가 끼어 완성되는 삼합·방합·삼형,
//   오행 전후 비교(원국 + 오늘 2글자), 신살·길신·십이운성·십신, 시진표, 달·태양 각도,
//   그리고 오늘을 "일 기둥 하나뿐인 가상 인물"로 두고 같은 별점 공식(score)으로 매긴 하루 별점.

import { Day, dayOf, KST, weekdayMon0, ymdOfDay } from "./clock";
import { hourTable, nextTerm, sky, SkyFacts, yearMonthPillars } from "./astro";
import { CHEONGAN, CHEONGAN_HANJA, dayGanzhiIndex, JIJI, JIJI_HANJA } from "./manseryeok";
import { PersonFacts } from "./natal";
import {
  branchRelations,
  BRANCH_EL,
  cgIndex,
  CHEONEUL,
  EL_ORDER,
  guiinOf,
  MUNCHANG,
  PersonLike,
  pairFacts,
  PILLAR_KO,
  PILLAR_ORDER,
  PillarKey,
  score,
  ScoreResult,
  sinsal,
  Sinsal,
  Sipsin,
  sipsin,
  stemRelation,
  STEM_EL,
  structuresWith,
  unseong,
  Wuxing,
  YANGIN,
} from "./relations";
import { branchMainStem } from "./natal";

export const WEEKDAYS_MON0 = "월화수목금토일";

export interface DayGanzhi {
  n: number;
  cg: number;
  jj: number;
  cheongan: string;
  cheonganHanja: string;
  cheonganOhaeng: Wuxing;
  cheonganEumyang: "양" | "음";
  jiji: string;
  jijiHanja: string;
  jijiOhaeng: Wuxing;
  jijiEumyang: "양" | "음";
  ganjiKr: string;
  ganjiHanja: string;
}

export function ganzhiForDate(day: Day): DayGanzhi {
  const n = dayGanzhiIndex(day);
  const cg = n % 10;
  const jj = n % 12;
  return {
    n,
    cg,
    jj,
    cheongan: CHEONGAN[cg],
    cheonganHanja: CHEONGAN_HANJA[cg],
    cheonganOhaeng: STEM_EL[cg],
    cheonganEumyang: cg % 2 === 0 ? "양" : "음",
    jiji: JIJI[jj],
    jijiHanja: JIJI_HANJA[jj],
    jijiOhaeng: BRANCH_EL[jj],
    jijiEumyang: jj % 2 === 0 ? "양" : "음",
    ganjiKr: CHEONGAN[cg] + JIJI[jj],
    ganjiHanja: CHEONGAN_HANJA[cg] + JIJI_HANJA[jj],
  };
}

export interface Reaction {
  pos: string;
  posKey: PillarKey;
  kind: "간" | "지";
  natal: string;
  rel: string[];
}

/** 오늘 두 글자와 내 원국 글자들의 관계(자동 판정). 년·월·일·시 순서, 각 기둥에서 간 → 지. */
export function reactions(P: PersonFacts, g: DayGanzhi): Reaction[] {
  const out: Reaction[] = [];
  for (const k of PILLAR_ORDER) {
    const p = P.pillars[k];
    if (!p) continue;
    const sr = stemRelation(g.cheongan, p.cg);
    if (sr.length) out.push({ pos: PILLAR_KO[k], posKey: k, kind: "간", natal: p.cg, rel: sr });
    let jr = branchRelations(g.jiji, p.jj).filter((x) => x !== "동일");
    if (g.jiji === p.jj) jr = ["복음", ...jr];
    if (jr.length) out.push({ pos: PILLAR_KO[k], posKey: k, kind: "지", natal: p.jj, rel: jr });
  }
  return out;
}

export interface OhaengRow {
  prev: number;
  today: number;
  out: string[];
  in: string[];
}

export interface OhaengReport {
  rows: Record<Wuxing, OhaengRow>;
  total: number;
  natal: Record<Wuxing, number>;
}

function ohaengOn(P: PersonFacts, day: Day): Record<Wuxing, number> {
  const g = ganzhiForDate(day);
  const oh = { ...P.ohaeng };
  oh[g.cheonganOhaeng]++;
  oh[g.jijiOhaeng]++;
  return oh;
}

/** 원국 + 그날 두 글자의 오행 개수와 어제 대비 증감. */
export function ohaengReport(P: PersonFacts, day: Day): OhaengReport {
  const today = ohaengOn(P, day);
  const prev = ohaengOn(P, day - 1);
  const g = ganzhiForDate(day);
  const pg = ganzhiForDate(day - 1);
  const rows = {} as Record<Wuxing, OhaengRow>;
  for (const e of EL_ORDER) {
    const outs = [
      [pg.cheongan, pg.cheonganOhaeng],
      [pg.jiji, pg.jijiOhaeng],
    ].filter(([, el]) => el === e).map(([c]) => c);
    const ins = [
      [g.cheongan, g.cheonganOhaeng],
      [g.jiji, g.jijiOhaeng],
    ].filter(([, el]) => el === e).map(([c]) => c);
    rows[e] = { prev: prev[e], today: today[e], out: outs, in: ins };
  }
  return { rows, total: Object.values(today).reduce((a, b) => a + b, 0), natal: { ...P.ohaeng } };
}

export interface DailyFacts {
  day: Day;
  date: { year: number; month: number; day: number; weekday: string };
  ganzhi: DayGanzhi;
  yearMonth: { year: string; month: string; jieName: string; jieKst: number };
  nextTerm: [string, number];
  sinsal: Sinsal;
  gilsin: string[];
  reactions: Reaction[];
  structures: string[];
  ohaeng: OhaengReport;
  hours: { jiji: string; pillar: string; kst: string }[];
  sky: SkyFacts;
  unseong: string;
  sipsinToday: [Sipsin, Sipsin];
  /** 오늘을 가상 인물로 두고 같은 별점 공식으로 매긴 하루 별점 */
  dayScore: ScoreResult;
  guiinToday: string[];
}

/** 오늘을 '일 기둥 하나뿐인 가상 인물'로 만든다. */
export function dayAsPerson(g: DayGanzhi): PersonLike {
  return {
    name: "오늘",
    ilgan: { cg: g.cheongan },
    pillars: { day: { cg: g.cheongan, jj: g.jiji, hanja: g.ganjiHanja } },
  };
}

export function dailyFacts(P: PersonFacts, day: Day): DailyFacts {
  const g = ganzhiForDate(day);
  const ym = yearMonthPillars(day);
  const igIdx = cgIndex(P.ilgan.cg);

  // 원국 지지 + 세운·월운 → 오늘 글자가 끼어 완성되는 판
  const owners: Record<string, string[]> = {};
  for (const k of PILLAR_ORDER) {
    const p = P.pillars[k];
    if (!p) continue;
    owners[p.jj] ??= [];
    if (!owners[p.jj].includes(P.name)) owners[p.jj].push(P.name);
  }
  for (const [label, b] of [
    [`세운(${ym.year})`, ym.year[1]],
    [`월운(${ym.month})`, ym.month[1]],
  ]) {
    owners[b] ??= [];
    owners[b].push(label);
  }

  const gil: string[] = [];
  if (CHEONEUL[P.ilgan.cg].includes(g.jiji)) gil.push("천을귀인");
  if (MUNCHANG[P.ilgan.cg] === g.jiji) gil.push("문창귀인");
  if (YANGIN[P.ilgan.cg] === g.jiji) gil.push("양인");

  const today = dayAsPerson(g);
  const guiinToday = guiinOf(P, today);
  const [y, m, d] = [ymdOfDay(day).year, ymdOfDay(day).month, ymdOfDay(day).day];

  return {
    day,
    date: { year: y, month: m, day: d, weekday: WEEKDAYS_MON0[weekdayMon0(day)] },
    ganzhi: g,
    yearMonth: ym,
    nextTerm: nextTerm(day),
    sinsal: sinsal(P.pillars.year!.jj, g.jiji),
    gilsin: gil,
    reactions: reactions(P, g),
    structures: structuresWith(g.jiji, owners),
    ohaeng: ohaengReport(P, day),
    hours: hourTable(day),
    sky: sky(day, P.sun.longitude),
    unseong: unseong(P.ilgan.cg, g.jiji),
    sipsinToday: [sipsin(igIdx, g.cg), sipsin(igIdx, branchMainStem(g.jiji))],
    dayScore: score(P, today, pairFacts(P, today), guiinToday),
    guiinToday,
  };
}

/** 지금 한국(KST) 기준 오늘 날짜. */
export function todayKst(now: number = Date.now()): Day {
  return dayOf(now + KST);
}

