// 천체 계산 보조 — compute_iljin.py 의 달 황경 · sky · 시진표 · 절기 이식.
// 달 황경은 Meeus 47장 주요항(오차 약 ±0.3°)이라 "정확해지는 시각"은 분 단위로 읽지 않는다.

import { Day, dayToMs, hhmm, KST, Ms, MS_DAY, MS_MIN } from "./clock";
import {
  CHEONGAN,
  dayGanzhiIndex,
  JIJI,
  julianDay,
  OSEODUN,
  saju,
  solarLongitudeUtc,
  solarTermUtc,
} from "./manseryeok";
import { ASPECTS, SIGNS } from "./relations";
import { pyRound } from "./num";

const mod = (a: number, b: number) => ((a % b) + b) % b;
const rad = (d: number) => (d * Math.PI) / 180;

/** 달 황경(저정밀, Meeus 47장 주요항). */
export function moonLongitudeUtc(tUtc: Ms): number {
  const jd = julianDay(tUtc);
  const T = (jd - 2451545.0) / 36525;
  const Lp = 218.3164477 + 481267.88123421 * T;
  const D = rad(297.8501921 + 445267.1114034 * T);
  const M = rad(357.5291092 + 35999.0502909 * T);
  const Mp = rad(134.9633964 + 477198.8675055 * T);
  const F = rad(93.272095 + 483202.0175233 * T);
  const s = Math.sin;
  const lon =
    Lp +
    6.288774 * s(Mp) +
    1.274027 * s(2 * D - Mp) +
    0.658314 * s(2 * D) +
    0.213618 * s(2 * Mp) -
    0.185116 * s(M) -
    0.114332 * s(2 * F) +
    0.058793 * s(2 * D - 2 * Mp) +
    0.057066 * s(2 * D - M - Mp) +
    0.053322 * s(2 * D + Mp) +
    0.045758 * s(2 * D - M) -
    0.040923 * s(M - Mp) -
    0.03472 * s(D) -
    0.030383 * s(M + Mp) +
    0.015327 * s(2 * D - 2 * F) -
    0.012528 * s(Mp + 2 * F) +
    0.01098 * s(Mp - 2 * F) +
    0.010675 * s(4 * D - Mp) +
    0.010034 * s(3 * Mp);
  return mod(lon, 360);
}

export function signOf(lon: number): [string, number] {
  return [SIGNS[Math.floor(lon / 30)], lon % 30];
}

export function angleDiff(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return Math.min(d, 360 - d);
}

export function aspectOfDiff(d: number): [string | null, number | null] {
  for (const [ang, name, orb] of ASPECTS) {
    if (Math.abs(d - ang) <= orb) return [name, pyRound(Math.abs(d - ang), 2)];
  }
  return [null, null];
}

// ---------------------------------------------------------------- 24절기
const TERM24: Record<number, string> = {
  0: "춘분", 15: "청명", 30: "곡우", 45: "입하", 60: "소만", 75: "망종", 90: "하지", 105: "소서",
  120: "대서", 135: "입추", 150: "처서", 165: "백로", 180: "추분", 195: "한로", 210: "상강",
  225: "입동", 240: "소설", 255: "대설", 270: "동지", 285: "소한", 300: "대한", 315: "입춘",
  330: "우수", 345: "경칩",
};

/** 그날 이후 가장 가까운 24절기 [이름, KST 순간]. */
export function nextTerm(day: Day): [string, Ms] {
  const t0 = dayToMs(day) - KST;
  const lon = solarLongitudeUtc(t0);
  const nxt = (((Math.floor(lon / 15) + 1) * 15) % 360);
  const inst = solarTermUtc(nxt, t0 + (mod(nxt - lon, 360) / 360) * 365.2422 * MS_DAY);
  return [TERM24[nxt], inst + KST];
}

/** 그날 정오(KST) 기준 세운·월운 기둥과 직전 절입. */
export function yearMonthPillars(day: Day): { year: string; month: string; jieName: string; jieKst: Ms } {
  const r = saju(dayToMs(day, 12, 0));
  return {
    year: CHEONGAN[r.year[0]] + JIJI[r.year[1]],
    month: CHEONGAN[r.month[0]] + JIJI[r.month[1]],
    jieName: r.jie[0],
    jieKst: r.jie[1],
  };
}

// ---------------------------------------------------------------- 시진표 (경도보정 127°E: 평균태양시 = KST − 32분)
export function hourTable(day: Day): { jiji: string; pillar: string; kst: string }[] {
  const dayCg = dayGanzhiIndex(day) % 10;
  const p2 = (n: number) => String(n).padStart(2, "0");
  return Array.from({ length: 12 }, (_, h) => {
    const cg = (OSEODUN[dayCg] + h) % 10;
    const start = (23 + 2 * h) % 24;
    return {
      jiji: JIJI[h],
      pillar: CHEONGAN[cg] + JIJI[h],
      kst: `${p2(start)}:32~${p2((start + 2) % 24)}:32` + (h === 0 ? " (전날 밤부터)" : ""),
    };
  });
}

// ---------------------------------------------------------------- 하늘 (태양·달과 내 태양궁 사이 각도)
export interface MoonEvent {
  aspect: string;
  from: string;
  to: string;
  exact: string | null;
  minOrb: number;
}

export interface SkyFacts {
  sun: number;
  moon: number;
  sunAspect: { diff: number; aspect: string | null; orb: number | null };
  moonEvents: MoonEvent[];
  sunEvents: string[];
  moon00: number;
  moon24: number;
  sun00: number;
  sun24: number;
  moonIngress: [string, string] | null;
  elong00: number;
  elong24: number;
}

export function sky(day: Day, natalSunLon: number, hourKst = 9.0): SkyFacts {
  const t = dayToMs(day) + hourKst * 3_600_000 - KST;
  const sun = solarLongitudeUtc(t);
  const moon = moonLongitudeUtc(t);
  const d0 = angleDiff(sun, natalSunLon);
  const [a0, e0] = aspectOfDiff(d0);
  const sunAspect = { diff: pyRound(d0, 2), aspect: a0, orb: e0 };

  const start = dayToMs(day) - KST;
  const steps = Array.from({ length: 145 }, (_, i) => start + 10 * MS_MIN * i);
  const moonDiffs = steps.map((s) => angleDiff(moonLongitudeUtc(s), natalSunLon));

  const moonEvents: MoonEvent[] = [];
  for (const [ang, name, orb] of ASPECTS) {
    const inside: number[] = [];
    let best: [number, number] | null = null; // [step index, err]
    steps.forEach((_, i) => {
      const err = Math.abs(moonDiffs[i] - ang);
      if (err <= orb) {
        inside.push(i);
        if (best === null || err < best[1]) best = [i, err];
      }
    });
    if (inside.length && best) {
      const [bi, berr] = best as [number, number];
      moonEvents.push({
        aspect: name,
        from: inside[0] === 0 ? "00:00" : hhmm(steps[inside[0]] + KST),
        to: inside[inside.length - 1] === steps.length - 1 ? "24:00" : hhmm(steps[inside[inside.length - 1]] + KST),
        exact: berr < 0.3 ? hhmm(steps[bi] + KST) : null,
        minOrb: pyRound(berr, 2),
      });
    }
  }

  const m0 = moonLongitudeUtc(start);
  const m24 = moonLongitudeUtc(start + MS_DAY);
  const s0 = solarLongitudeUtc(start);
  const s24 = solarLongitudeUtc(start + MS_DAY);

  // 태양 각의 오브 진입·이탈(그날 안에서)
  const sunEvents: string[] = [];
  let prev: string | null | "-" = "-";
  for (const s of steps) {
    const [a] = aspectOfDiff(angleDiff(solarLongitudeUtc(s), natalSunLon));
    if (prev !== "-" && a !== prev) sunEvents.push(`${hhmm(s + KST)} ` + (a ? `${a} 오브 진입` : `${prev} 오브 이탈`));
    prev = a;
  }

  // 달 궁 이동
  let ingress: [string, string] | null = null;
  for (let i = 1; i < steps.length; i++) {
    const a = Math.floor(moonLongitudeUtc(steps[i]) / 30);
    const b = Math.floor(moonLongitudeUtc(steps[i - 1]) / 30);
    if (a !== b) ingress = [hhmm(steps[i] + KST), signOf(moonLongitudeUtc(steps[i]))[0]];
  }

  return {
    sun,
    moon,
    sunAspect,
    moonEvents,
    sunEvents,
    moon00: m0,
    moon24: m24,
    sun00: s0,
    sun24: s24,
    moonIngress: ingress,
    elong00: mod(m0 - s0, 360),
    elong24: mod(m24 - s24, 360),
  };
}

