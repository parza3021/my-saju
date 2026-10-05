// 한 사람의 원국 사실 — compute_group.py 의 person_facts · yearly · current_daewoon 이식.
// 문서(화면)의 모든 사주·별자리 사실(기둥, 합충형파해, 십신, 귀인, 대운, 세운, 황경)은 여기 출력만 근거로 쓴다.

import { dayFromYmd, dayToMs, fields, mod, Ms, MS_HOUR, MS_MIN } from "./clock";
import { pyRound } from "./num";
import {
  CHEONGAN,
  CHEONGAN_HANJA,
  daewoon,
  JIJI,
  JIJI_HANJA,
  lunarToSolar,
  RawSaju,
  saju,
  SajuOptions,
  solarLongitudeUtc,
} from "./manseryeok";
import {
  branchRelations,
  cgIndex,
  CHEONEUL,
  EL_ORDER,
  HONGYEOM,
  MUNCHANG,
  PILLAR_KO,
  PILLAR_ORDER,
  PillarFact,
  PillarKey,
  PosKo,
  round1,
  sinsal,
  Sinsal,
  Sipsin,
  sipsin,
  SIGN_EL,
  SIGN_MOD,
  SIGNS,
  stemRelation,
  STEM_EL,
  BRANCH_EL,
  unseong,
  Wuxing,
  YANGIN,
} from "./relations";

export interface BirthMember {
  name: string;
  gender?: "M" | "F" | null;
  year: number;
  month: number;
  day: number;
  /** null 이면 시각 모름 */
  hour: number | null;
  minute?: number;
  calendar?: "solar" | "lunar";
  leap?: boolean;
  longitude?: number;
}

export interface EngineOptions {
  lonCorrection: boolean;
  jasiMode: "unified" | "split";
}
export const DEFAULT_OPTIONS: EngineOptions = { lonCorrection: true, jasiMode: "unified" };

export interface SunFact {
  longitude: number;
  sign: string;
  degree: number;
  element: string;
  modality: string;
  cuspWarning: boolean;
}

export interface InternalHit {
  k1: PillarKey;
  k2: PillarKey;
  b1: string;
  b2: string;
  rel: string[];
}

export interface DaewoonFact {
  direction: "순행" | "역행";
  start: number;
  ageNow: number;
  current: { fromAge: number; ganzhi: string; sipsinStem: Sipsin } | null;
  next: { fromAge: number; ganzhi: string; sipsinStem: Sipsin } | null;
  /** 8칸 전체 (화면 타임라인용) */
  steps: { fromAge: number; toAge: number; ganzhi: string; sipsinStem: Sipsin; sipsinBranch: Sipsin }[];
}

export interface SeunItem {
  pos: string;
  kind: "cg" | "jj";
  a: string;
  b: string;
  rel: string[];
}

export interface SeunFact {
  year: number;
  ganzhi: string;
  sinsal: Sinsal;
  sipsin: Sipsin;
  items: SeunItem[];
}

/** pos 자리 지지(branch)가 일간 기준 길신(name) */
export interface NatalGilsin {
  pos: PosKo;
  branch: string;
  name: "천을귀인" | "문창귀인" | "양인" | "홍염";
}

export interface PersonFacts {
  name: string;
  gender: "M" | "F" | null;
  hasTime: boolean;
  warnings: string[];
  input: { year: number; month: number; day: number; hour: number | null; minute: number; calendar: "solar" | "lunar"; leap: boolean };
  solarDate: number;
  pillars: Partial<Record<PillarKey, PillarFact>>;
  ilgan: { cg: string; element: Wuxing; yinyang: "양" | "음" };
  ohaeng: Record<Wuxing, number>;
  natalSinsal: Record<string, Sinsal>;
  gilsin: NatalGilsin[];
  internalHits: InternalHit[];
  /** 기둥별 천간 십신(일간 자신은 null) · 지지 십신(지지의 본기 천간 기준이 아니라 일간과의 오행·음양 관계는 쓰지 않는다) */
  stemSipsin: Partial<Record<PillarKey, Sipsin | null>>;
  /** 기둥별 십이운성(일간 기준) */
  unseong: Partial<Record<PillarKey, string>>;
  sun: SunFact;
  daewoon: DaewoonFact | null;
  seun: SeunFact[];
  raw: RawSaju;
}

function birthMs(m: BirthMember, hasTime: boolean): Ms {
  const day = m.calendar === "lunar" ? lunarToSolar(m.year, m.month, m.day, m.leap ?? false) : dayFromYmd(m.year, m.month, m.day);
  return hasTime ? dayToMs(day, m.hour!, m.minute ?? 0) : dayToMs(day, 12);
}

export function personFacts(m: BirthMember, opts: EngineOptions = DEFAULT_OPTIONS): PersonFacts {
  const hasTime = m.hour !== null && m.hour !== undefined;
  const birth = birthMs(m, hasTime);
  const sOpts: SajuOptions = {
    calendar: "solar",
    longitude: m.longitude ?? 127.0,
    lonCorrection: opts.lonCorrection,
    jasiMode: opts.jasiMode,
  };
  const r = saju(birth, sOpts);
  const keys: PillarKey[] = hasTime ? ["year", "month", "day", "hour"] : ["year", "month", "day"];
  const pillars: Partial<Record<PillarKey, PillarFact>> = {};
  for (const k of keys) {
    const [cg, jj] = r[k];
    pillars[k] = { cg: CHEONGAN[cg], jj: JIJI[jj], hanja: CHEONGAN_HANJA[cg] + JIJI_HANJA[jj] };
  }

  const warnings: string[] = [];
  if (!hasTime) {
    // 시각 미상인데 출생일에 절입이 있으면 월주(와 입춘이면 년주)가 확정되지 않는다
    const d0 = birth - 12 * MS_HOUR; // 같은 날 00:00
    const r0 = saju(d0, sOpts);
    const r1 = saju(d0 + 23 * MS_HOUR + 59 * MS_MIN, sOpts);
    if (r0.month[0] !== r1.month[0] || r0.month[1] !== r1.month[1]) {
      warnings.push("출생일에 절입이 있어 시각 없이는 월주가 확정되지 않음");
    }
    if (r0.year[0] !== r1.year[0] || r0.year[1] !== r1.year[1]) {
      warnings.push("출생일이 입춘이라 시각 없이는 년주가 확정되지 않음");
    }
  }

  const ilganIdx = r.day[0];
  const ig = CHEONGAN[ilganIdx];
  const ohaeng = Object.fromEntries(EL_ORDER.map((e) => [e, 0])) as Record<Wuxing, number>;
  for (const k of keys) {
    ohaeng[STEM_EL[r[k][0]]]++;
    ohaeng[BRANCH_EL[r[k][1]]]++;
  }

  const yb = pillars.year!.jj;
  const natalSinsal: Record<string, Sinsal> = {};
  for (const k of keys) natalSinsal[PILLAR_KO[k]] = sinsal(yb, pillars[k]!.jj);

  const gilsin: NatalGilsin[] = [];
  const tables: [NatalGilsin["name"], Record<string, string>][] = [
    ["천을귀인", CHEONEUL],
    ["문창귀인", MUNCHANG],
    ["양인", YANGIN],
    ["홍염", HONGYEOM],
  ];
  for (const k of keys) {
    const b = pillars[k]!.jj;
    for (const [name, table] of tables) {
      if ((table[ig] ?? "").includes(b)) gilsin.push({ pos: PILLAR_KO[k], branch: b, name });
    }
  }

  const internalHits: InternalHit[] = [];
  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const [k1, k2] = [keys[i], keys[j]];
      const rel = branchRelations(pillars[k1]!.jj, pillars[k2]!.jj).filter((x) => x !== "동일");
      if (rel.length) internalHits.push({ k1, k2, b1: pillars[k1]!.jj, b2: pillars[k2]!.jj, rel });
    }
  }

  const stemSipsin: Partial<Record<PillarKey, Sipsin | null>> = {};
  const uns: Partial<Record<PillarKey, string>> = {};
  for (const k of keys) {
    stemSipsin[k] = k === "day" ? null : sipsin(ilganIdx, r[k][0]);
    uns[k] = unseong(ig, pillars[k]!.jj);
  }

  const lon = solarLongitudeUtc(r.utc);
  const si = Math.floor(lon / 30);
  const sun: SunFact = {
    longitude: pyRound(lon, 2),
    sign: SIGNS[si],
    degree: round1(lon % 30),
    element: SIGN_EL[si],
    modality: SIGN_MOD[si],
    cuspWarning: (lon % 30 < 1 || lon % 30 > 29) && !hasTime,
  };

  return {
    name: m.name,
    gender: m.gender ?? null,
    hasTime,
    warnings,
    input: {
      year: m.year,
      month: m.month,
      day: m.day,
      hour: hasTime ? m.hour! : null,
      minute: hasTime ? (m.minute ?? 0) : 0,
      calendar: m.calendar ?? "solar",
      leap: m.leap ?? false,
    },
    solarDate: r.solarDate,
    pillars,
    ilgan: { cg: ig, element: STEM_EL[ilganIdx], yinyang: ilganIdx % 2 === 0 ? "양" : "음" },
    ohaeng,
    natalSinsal,
    gilsin,
    internalHits,
    stemSipsin,
    unseong: uns,
    sun,
    daewoon: null,
    seun: [],
    raw: r,
  };
}

/** 그해(양력 연도)의 세운 — 세운 간지, 신살, 십신, 원국과의 반응. */
export function yearly(P: PersonFacts, year: number): SeunFact {
  const idx = mod(year - 1984, 60);
  const cg = CHEONGAN[idx % 10];
  const jj = JIJI[idx % 12];
  const ss = sipsin(cgIndex(P.ilgan.cg), idx % 10);
  const items: SeunItem[] = [];
  for (const k of PILLAR_ORDER) {
    const p = P.pillars[k];
    if (!p) continue;
    const sr = stemRelation(cg, p.cg).filter((x) => x !== "복음");
    if (sr.length) items.push({ pos: PILLAR_KO[k], kind: "cg", a: cg, b: p.cg, rel: [sr[0].startsWith("천간합") ? "천간합" : "천간충"] });
    let rel = branchRelations(jj, p.jj).filter((x) => x !== "동일");
    if (jj === p.jj) rel = ["복음", ...rel];
    if (rel.length) items.push({ pos: PILLAR_KO[k], kind: "jj", a: jj, b: p.jj, rel });
  }
  return { year, ganzhi: cg + jj, sinsal: sinsal(P.pillars.year!.jj, jj), sipsin: ss, items };
}

/** 지금 대운과 다음 대운. 성별을 받지 않았으면 null. */
export function currentDaewoon(P: PersonFacts, onYear: number): DaewoonFact | null {
  if (!P.gender) return null;
  const dw = daewoon(P.raw, P.gender);
  const age = onYear - fields(dayToMs(P.raw.solarDate)).year; // 대운수와 같은 '햇수' 기준
  const igIdx = cgIndex(P.ilgan.cg);
  const steps = dw.seq.map((s) => ({
    fromAge: s.startAge,
    toAge: s.startAge + 9,
    ganzhi: CHEONGAN[s.cg] + JIJI[s.jj],
    sipsinStem: sipsin(igIdx, s.cg),
    sipsinBranch: sipsin(igIdx, branchMainStem(JIJI[s.jj])),
  }));
  let cur: (typeof steps)[number] | null = null;
  for (const s of steps) if (s.fromAge <= age) cur = s;
  const nxt = steps.find((s) => s.fromAge > age) ?? null;
  const fmt = (s: (typeof steps)[number] | null) => (s ? { fromAge: s.fromAge, ganzhi: s.ganzhi, sipsinStem: s.sipsinStem } : null);
  return {
    direction: dw.forward ? "순행" : "역행",
    start: dw.startAge,
    ageNow: age,
    current: fmt(cur),
    next: fmt(nxt),
    steps,
  };
}

// 지지의 본기(주된 천간) — 지지를 십신으로 읽을 때 쓴다 (compute_iljin.py JJ_MAIN)
const JJ_MAIN: Record<string, string> = {
  자: "계", 축: "기", 인: "갑", 묘: "을", 진: "무", 사: "병", 오: "정", 미: "기", 신: "경", 유: "신", 술: "무", 해: "임",
};
export function branchMainStem(jj: string): number {
  return cgIndex(JJ_MAIN[jj]);
}

/** 원국 + 대운 + 올해·내년 세운까지 채운 완성본. onYear 는 보통 올해(KST). */
export function buildPerson(m: BirthMember, onYear: number, opts: EngineOptions = DEFAULT_OPTIONS): PersonFacts {
  const P = personFacts(m, opts);
  P.daewoon = currentDaewoon(P, onYear);
  P.seun = [yearly(P, onYear), yearly(P, onYear + 1)];
  return P;
}

