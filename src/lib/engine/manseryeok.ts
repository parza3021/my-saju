// 시각(분) 단위 만세력 계산 엔진 — saju-iljin-doc/scripts/manseryeok.py 의 TypeScript 이식.
//
// 계산 기준
//   - 태양 겉보기 황경: VSOP87 절단급수 + 장동 + 광행차, ΔT 보정. 절입 시각 오차는 수십 초~1분 수준.
//   - 연주: 입춘(황경 315°) '순간'과 출생 순간(UTC)을 비교.
//   - 월주: 출생 순간의 태양 황경이 속한 절(節) 구간으로 월지, 오호둔으로 월간.
//   - 한국 시간대 이력: 1954-03-21~1961-08-09 UTC+8:30(그 외 UTC+9), 서머타임 1948~1951·1955~1960·1987~1988.
//   - 시주·일주 경계: 경도 보정(평균태양시, 기본 동경 127°) 적용 여부 선택.
//     자시 모드 'unified'(23시부터 다음 날 일주, 기본값) / 'split'(야자시).
//   - 음력: 합삭 + 중기 기준 한국 음력(KST)을 계산해 양력으로 변환.
//   - 대운: 양남음녀 순행 / 음남양녀 역행, 출생~절입 시간차(일)/3 반올림(최소 1).

import { Day, dayFromYmd, dayOf, dayToMs, fields, KST, mk, mod, Ms, MS_DAY, MS_HOUR, MS_MIN, weekdayMon0, yday } from "./clock";
import { L0, L1, L2, L3, L4, L5, Term } from "./vsop87";

export const CHEONGAN = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"] as const;
export const CHEONGAN_HANJA = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
export const JIJI = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"] as const;
export const JIJI_HANJA = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;
const WOHODUN: Record<number, number> = { 0: 2, 5: 2, 1: 4, 6: 4, 2: 6, 7: 6, 3: 8, 8: 8, 4: 0, 9: 0 }; // 년간 -> 인월 월간
export const OSEODUN: Record<number, number> = { 0: 0, 5: 0, 1: 2, 6: 2, 2: 4, 7: 4, 3: 6, 8: 6, 4: 8, 9: 8 }; // 일간 -> 자시 시간
export const JIE_NAMES = ["입춘", "경칩", "청명", "입하", "망종", "소서", "입추", "백로", "한로", "입동", "대설", "소한"] as const;

const rad = (deg: number) => (deg * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

// ---------------------------------------------------------------- 시간 척도
export function julianDay(t: Ms): number {
  const f = fields(t);
  let y = f.year;
  let m = f.month;
  const msOfDay = mod(t, MS_DAY);
  const d = f.day + msOfDay / MS_HOUR / 24;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.trunc(365.25 * (y + 4716)) + Math.trunc(30.6001 * (m + 1)) + d + b - 1524.5;
}

export function jdToMs(jd: number): Ms {
  return mk(2000, 1, 1, 12) + (jd - 2451545.0) * MS_DAY;
}

/** ΔT = TT - UT (Espenak & Meeus 다항식), 초 단위. */
export function deltaTSeconds(y: number): number {
  if (y >= 2005 && y < 2150) {
    const t = y - 2000;
    return 62.92 + 0.32217 * t + 0.005589 * t * t;
  }
  if (y >= 1986 && y < 2005) {
    const t = y - 2000;
    return 63.86 + 0.3345 * t - 0.060374 * t ** 2 + 0.0017275 * t ** 3 + 0.000651814 * t ** 4 + 0.00002373599 * t ** 5;
  }
  if (y >= 1961 && y < 1986) {
    const t = y - 1975;
    return 45.45 + 1.067 * t - (t * t) / 260 - t ** 3 / 718;
  }
  if (y >= 1941 && y < 1961) {
    const t = y - 1950;
    return 29.07 + 0.407 * t - (t * t) / 233 + t ** 3 / 2547;
  }
  if (y >= 1920 && y < 1941) {
    const t = y - 1920;
    return 21.2 + 0.84493 * t - 0.0761 * t * t + 0.0020936 * t ** 3;
  }
  if (y >= 1900 && y < 1920) {
    const t = y - 1900;
    return -2.79 + 1.494119 * t - 0.0598939 * t ** 2 + 0.0061966 * t ** 3 - 0.000197 * t ** 4;
  }
  const u = (y - 1820) / 100;
  return -20 + 32 * u * u;
}

// ---------------------------------------------------------------- 태양 황경 (VSOP87 절단)
function series(terms: readonly Term[], tau: number): number {
  let s = 0;
  for (const [a, b, c] of terms) s += a * Math.cos(b + c * tau);
  return s;
}

/** UTC 순간의 태양 겉보기 황경(도). */
export function solarLongitudeUtc(tUtc: Ms): number {
  const f = fields(tUtc);
  const jdUt = julianDay(tUtc);
  const jde = jdUt + deltaTSeconds(f.year + (f.month - 0.5) / 12) / 86400;
  const tau = (jde - 2451545.0) / 365250;
  const L =
    (series(L0, tau) +
      series(L1, tau) * tau +
      series(L2, tau) * tau ** 2 +
      series(L3, tau) * tau ** 3 +
      series(L4, tau) * tau ** 4 +
      series(L5, tau) * tau ** 5) /
    1e8;
  const theta = deg(L) + 180.0;
  const T = tau * 10;
  const omega = rad(125.04452 - 1934.136261 * T);
  const Ls = rad(280.4665 + 36000.7698 * T);
  const Lm = rad(218.3165 + 481267.8813 * T);
  const dpsi =
    -17.2 * Math.sin(omega) - 1.32 * Math.sin(2 * Ls) - 0.23 * Math.sin(2 * Lm) + 0.21 * Math.sin(2 * omega);
  const e = 0.016708634 - 0.000042037 * T;
  const M = rad(357.52911 + 35999.05029 * T);
  const C = rad((1.914602 - 0.004817 * T) * Math.sin(M) + 0.019993 * Math.sin(2 * M));
  const R = (1.000001018 * (1 - e * e)) / (1 + e * Math.cos(M + C));
  const lam = theta + (-0.09033 + dpsi - 20.4898 / R) / 3600;
  return mod(lam, 360.0);
}

/** nearUtc 근처(±반년 이내)에서 태양 황경이 targetLon이 되는 UTC 순간. */
export function solarTermUtc(targetLon: number, nearUtc: Ms): Ms {
  let t = nearUtc;
  for (let i = 0; i < 30; i++) {
    const diff = mod(targetLon - solarLongitudeUtc(t) + 180, 360) - 180;
    const step = (diff / 360) * 365.2422;
    t = t + step * MS_DAY;
    if (Math.abs(step) < 1e-6) break;
  }
  return t;
}

/** tUtc 직전(같거나 이전)의 절 [월 offset(0=인월), 이름, 순간]. */
export function jieBefore(tUtc: Ms): [number, string, Ms] {
  const lon = solarLongitudeUtc(tUtc);
  let k = Math.floor(mod(lon - 315, 360) / 30);
  let target = (315 + 30 * k) % 360;
  const back = (mod(lon - target, 360) / 360) * 365.2422;
  let inst = solarTermUtc(target, tUtc - back * MS_DAY);
  if (inst > tUtc) {
    // 경계 바로 위 수치 흔들림 보정
    k = mod(k - 1, 12);
    target = (315 + 30 * k) % 360;
    inst = solarTermUtc(target, inst - 30 * MS_DAY);
  }
  return [k, JIE_NAMES[k], inst];
}

export function jieAfter(tUtc: Ms): [number, string, Ms] {
  const [k, , inst] = jieBefore(tUtc);
  const k2 = (k + 1) % 12;
  const nxt = solarTermUtc((315 + 30 * k2) % 360, inst + 30.4 * MS_DAY);
  return [k2, JIE_NAMES[k2], nxt];
}

// ---------------------------------------------------------------- 한국 시간대 이력
/** day(Day) 이후 처음 나오는 weekday(월=0 … 일=6) 날짜. */
function nthWeekdayOnOrAfter(year: number, month: number, d: number, weekday: number): Day {
  const day = dayFromYmd(year, month, d);
  return day + mod(weekday - weekdayMon0(day), 7);
}

/** 서머타임 (시작, 끝) 벽시계 기준 naive Ms. IANA tz DB 'ROK' 규칙과 동일. */
function krDstPeriod(year: number): [Ms, Ms] | null {
  const SAT = 5;
  const SUN = 6;
  if (year === 1948) return [mk(1948, 6, 1), mk(1948, 9, 13)];
  if (year >= 1949 && year <= 1951) {
    const start = year === 1949 ? mk(1949, 4, 3) : year === 1950 ? mk(1950, 4, 1) : mk(1951, 5, 6);
    return [start, dayToMs(nthWeekdayOnOrAfter(year, 9, 7, SAT) + 1)];
  }
  if (year === 1955) return [mk(1955, 5, 5), mk(1955, 9, 9)];
  if (year === 1956) return [mk(1956, 5, 20), mk(1956, 9, 30)];
  if (year >= 1957 && year <= 1960) {
    return [dayToMs(nthWeekdayOnOrAfter(year, 5, 1, SUN)), dayToMs(nthWeekdayOnOrAfter(year, 9, 17, SAT) + 1)];
  }
  if (year === 1987 || year === 1988) {
    return [dayToMs(nthWeekdayOnOrAfter(year, 5, 8, SUN), 2), dayToMs(nthWeekdayOnOrAfter(year, 10, 8, SUN), 3)];
  }
  return null;
}

export function krStandardOffset(local: Ms): Ms {
  if (local >= mk(1954, 3, 21) && local < mk(1961, 8, 10)) return 8 * MS_HOUR + 30 * MS_MIN;
  if (local >= mk(1908, 4, 1) && local < mk(1912, 1, 1)) return 8 * MS_HOUR + 30 * MS_MIN;
  return 9 * MS_HOUR;
}

/** 벽시계 시각 -> [UTC 오프셋, 서머타임 여부]. */
export function krUtcOffset(local: Ms): [Ms, boolean] {
  const std = krStandardOffset(local);
  const p = krDstPeriod(fields(local).year);
  if (p && p[0] <= local && local < p[1]) return [std + MS_HOUR, true];
  return [std, false];
}

// ---------------------------------------------------------------- 일진 / 간지 유틸
/** 0 = 갑자. */
export function dayGanzhiIndex(d: Day): number {
  const jdn = d + 2440588; // 1970-01-01 의 율리우스 적일수
  return mod(jdn + 49, 60);
}

export function gz(cg: number, jj: number): string {
  return `${CHEONGAN[cg]}${JIJI[jj]}(${CHEONGAN_HANJA[cg]}${JIJI_HANJA[jj]})`;
}

export function gzIndex(cg: number, jj: number): number {
  for (let n = 0; n < 60; n++) {
    if (n % 10 === cg && n % 12 === jj) return n;
  }
  throw new Error("간지 조합이 올바르지 않습니다");
}

// ---------------------------------------------------------------- 음력 (한국, KST 기준)
function newMoonJde(k: number): number {
  const T = k / 1236.85;
  const jde = 2451550.09766 + 29.530588861 * k + 0.00015437 * T ** 2 - 0.00000015 * T ** 3 + 0.00000000073 * T ** 4;
  const E = 1 - 0.002516 * T - 0.0000074 * T * T;
  const M = rad(2.5534 + 29.1053567 * k - 0.0000014 * T ** 2 - 0.00000011 * T ** 3);
  const Mp = rad(201.5643 + 385.81693528 * k + 0.0107582 * T ** 2 + 0.00001238 * T ** 3 - 0.000000058 * T ** 4);
  const F = rad(160.7108 + 390.67050284 * k - 0.0016118 * T ** 2 - 0.00000227 * T ** 3 + 0.000000011 * T ** 4);
  const O = rad(124.7746 - 1.56375588 * k + 0.0020672 * T ** 2 + 0.00000215 * T ** 3);
  const s = Math.sin;
  const corr =
    -0.4072 * s(Mp) +
    0.17241 * E * s(M) +
    0.01608 * s(2 * Mp) +
    0.01039 * s(2 * F) +
    0.00739 * E * s(Mp - M) -
    0.00514 * E * s(Mp + M) +
    0.00208 * E * E * s(2 * M) -
    0.00111 * s(Mp - 2 * F) -
    0.00057 * s(Mp + 2 * F) +
    0.00056 * E * s(2 * Mp + M) -
    0.00042 * s(3 * Mp) +
    0.00042 * E * s(M + 2 * F) +
    0.00038 * E * s(M - 2 * F) -
    0.00024 * E * s(2 * Mp - M) -
    0.00017 * s(O) -
    0.00007 * s(Mp + 2 * M) +
    0.00004 * s(2 * Mp - 2 * F) +
    0.00004 * s(3 * M) +
    0.00003 * s(Mp + M - 2 * F) +
    0.00003 * s(2 * Mp + 2 * F) -
    0.00003 * s(Mp + M + 2 * F) +
    0.00003 * s(Mp - M + 2 * F) -
    0.00002 * s(Mp - M - 2 * F) -
    0.00002 * s(3 * Mp + M) +
    0.00002 * s(4 * Mp);
  const A: [number, number][] = [
    [299.77 + 0.107408 * k - 0.009173 * T * T, 0.000325],
    [251.88 + 0.016321 * k, 0.000165],
    [251.83 + 26.651886 * k, 0.000164],
    [349.42 + 36.412478 * k, 0.000126],
    [84.66 + 18.206239 * k, 0.00011],
    [141.74 + 53.303771 * k, 0.000062],
    [207.14 + 2.453732 * k, 0.00006],
    [154.84 + 7.30686 * k, 0.000056],
    [34.52 + 27.261239 * k, 0.000047],
    [207.19 + 0.121824 * k, 0.000042],
    [291.34 + 1.844379 * k, 0.00004],
    [161.72 + 24.198154 * k, 0.000037],
    [239.56 + 25.513099 * k, 0.000035],
    [331.55 + 3.592518 * k, 0.000023],
  ];
  let extra = 0;
  for (const [a, c] of A) extra += c * Math.sin(rad(a));
  return jde + corr + extra;
}

function newMoonUtc(k: number): Ms {
  const t = jdToMs(newMoonJde(k));
  const f = fields(t);
  return t - deltaTSeconds(f.year + (f.month - 0.5) / 12) * 1000;
}

function kstDate(tUtc: Ms): Day {
  return dayOf(tUtc + KST);
}

/** KST 날짜 d1~d2 사이(포함)에 시작하는 삭(朔)일 목록. */
function monthStartsBetween(d1: Day, d2: Day): Day[] {
  const y = fields(d1 * MS_DAY).year;
  let k = Math.floor((y + (yday(d1) - 1) / 365.25 - 2000) * 12.3685) - 2;
  const out: Day[] = [];
  for (;;) {
    const d = kstDate(newMoonUtc(k));
    if (d > d2) break;
    if (d >= d1) out.push(d);
    k += 1;
  }
  return out;
}

function zhongqiDates(yearFrom: number, yearTo: number): Day[] {
  const out = new Set<Day>();
  for (let y = yearFrom; y <= yearTo; y++) {
    for (let i = 0; i < 12; i++) {
      const lon = (270 + 30 * i) % 360; // 동지부터
      const approx = mk(y, 12, 21) + 30.44 * i * MS_DAY - 365.24 * MS_DAY;
      out.add(kstDate(solarTermUtc(lon, approx)));
    }
  }
  return [...out].sort((a, b) => a - b);
}

function winterSolsticeKst(year: number): Day {
  return kstDate(solarTermUtc(270, mk(year, 12, 21)));
}

export interface LunarMonth {
  month: number;
  leap: boolean;
  start: Day;
  days: number;
}

/** lunarYear 음력 해의 월 목록. */
export function lunarMonths(lunarYear: number): LunarMonth[] {
  const zq = zhongqiDates(lunarYear - 1, lunarYear + 1);
  const table: { y: number; m: number; leap: boolean; start: Day; days: number }[] = [];
  for (const base of [lunarYear - 1, lunarYear]) {
    const ws1 = winterSolsticeKst(base);
    const ws2 = winterSolsticeKst(base + 1);
    let starts = monthStartsBetween(ws1 - 30, ws2);
    const beforeWs1 = starts.filter((s) => s <= ws1);
    starts = [...beforeWs1.slice(-1), ...starts.filter((s) => s > ws1)];
    const m11Next = starts.filter((s) => s <= ws2).slice(-1)[0];
    const cycle = starts.filter((s) => s < m11Next);
    const bounds = [...cycle, m11Next];
    const leapNeeded = cycle.length === 13;
    let num = 11;
    let yr = base;
    let leapUsed = false;
    cycle.forEach((s, i) => {
      const e = bounds[i + 1];
      const hasZq = zq.some((z) => s <= z && z < e);
      const isLeap = leapNeeded && !leapUsed && !hasZq && i > 0;
      if (isLeap) {
        leapUsed = true;
        table.push({ y: yr, m: num, leap: true, start: s, days: e - s });
        return;
      }
      if (i > 0) {
        num += 1;
        if (num === 13) {
          num = 1;
          yr += 1;
        }
      }
      table.push({ y: yr, m: num, leap: false, start: s, days: e - s });
    });
  }
  return table
    .filter((r) => r.y === lunarYear)
    .map((r) => ({ month: r.m, leap: r.leap, start: r.start, days: r.days }));
}

export function lunarToSolar(year: number, month: number, day: number, leap = false): Day {
  for (const lm of lunarMonths(year)) {
    if (lm.month === month && lm.leap === leap) {
      if (day < 1 || day > lm.days) {
        throw new Error(`음력 ${year}년 ${leap ? "윤" : ""}${month}월은 ${lm.days}일까지입니다`);
      }
      return lm.start + day - 1;
    }
  }
  throw new Error(`음력 ${year}년에 ${leap ? "윤" : ""}${month}월이 없습니다`);
}

// ---------------------------------------------------------------- 사주 원국
export type Pair = readonly [number, number];

export interface RawSaju {
  year: Pair;
  month: Pair;
  day: Pair;
  hour: Pair;
  solarDate: Day;
  utc: Ms;
  utcOffset: Ms;
  dst: boolean;
  pillarTime: Ms;
  ipchunKst: Ms;
  jie: readonly [string, Ms];
  options: { longitude: number; lonCorrection: boolean; jasiMode: "unified" | "split" };
}

export interface SajuOptions {
  calendar?: "solar" | "lunar";
  leap?: boolean;
  longitude?: number;
  lonCorrection?: boolean;
  jasiMode?: "unified" | "split";
}

/**
 * birthLocal: 벽시계 출생 시각(naive Ms). calendar='lunar'이면 날짜를 음력으로 해석한다.
 */
export function saju(birthLocalIn: Ms, opts: SajuOptions = {}): RawSaju {
  const { calendar = "solar", leap = false, longitude = 127.0, lonCorrection = true, jasiMode = "unified" } = opts;
  let birthLocal = birthLocalIn;
  if (calendar === "lunar") {
    const f = fields(birthLocal);
    const sd = lunarToSolar(f.year, f.month, f.day, leap);
    birthLocal = dayToMs(sd) + mod(birthLocal, MS_DAY);
  }
  const [offset, isDst] = krUtcOffset(birthLocal);
  const utc = birthLocal - offset;
  const uf = fields(utc);

  // 연주: 입춘 순간 비교
  const ip = solarTermUtc(315, mk(uf.year, 2, 4));
  const y = utc >= ip ? uf.year : uf.year - 1;
  const yi = mod(y - 1984, 60);
  const yCg = yi % 10;
  const yJj = yi % 12;

  // 월주: 출생 순간의 절 구간
  const [k, jieName, jieInst] = jieBefore(utc);
  const mJj = (2 + k) % 12;
  const mCg = (WOHODUN[yCg] + k) % 10;

  // 일주·시주 기준 시각
  const t = lonCorrection ? utc + 4 * longitude * MS_MIN : utc + krStandardOffset(birthLocal);
  const tf = fields(t);
  const h = tf.hour + tf.minute / 60 + tf.second / 3600;
  const hJj = Math.floor(mod(h + 1, 24) / 2);
  let day = dayOf(t);
  const lateJasi = tf.hour >= 23;
  if (lateJasi && jasiMode === "unified") day += 1;
  const di = dayGanzhiIndex(day);
  const dCg = di % 10;
  const dJj = di % 12;
  let stemDayCg = dCg;
  if (lateJasi && jasiMode === "split") stemDayCg = dayGanzhiIndex(day + 1) % 10; // 야자시: 다음 날 일간 기준
  const hCg = (OSEODUN[stemDayCg] + hJj) % 10;

  return {
    year: [yCg, yJj],
    month: [mCg, mJj],
    day: [dCg, dJj],
    hour: [hCg, hJj],
    solarDate: dayOf(birthLocal),
    utc,
    utcOffset: offset,
    dst: isDst,
    pillarTime: t,
    ipchunKst: ip + KST,
    jie: [jieName, jieInst + KST],
    options: { longitude, lonCorrection, jasiMode },
  };
}

export interface DaewoonStep {
  startAge: number;
  cg: number;
  jj: number;
}

export interface DaewoonResult {
  forward: boolean;
  /** 대운수(만 나이로 쓰는 시작 나이) */
  startAge: number;
  /** 소수점 포함 정확한 시작 나이(년) */
  exactAge: number;
  seq: DaewoonStep[];
}

/** gender: 'M' 또는 'F'. */
export function daewoon(result: RawSaju, gender: "M" | "F", count = 8): DaewoonResult {
  const yCg = result.year[0];
  const yangYear = yCg % 2 === 0;
  const forward = (yangYear && gender === "M") || (!yangYear && gender === "F");
  const utc = result.utc;
  let days: number;
  if (forward) {
    const [, , inst] = jieAfter(utc);
    days = (inst - utc) / MS_DAY;
  } else {
    const [, , inst] = jieBefore(utc);
    days = (utc - inst) / MS_DAY;
  }
  const su = Math.max(1, Math.trunc(days / 3 + 0.5));
  const base = gzIndex(result.month[0], result.month[1]);
  const step = forward ? 1 : -1;
  const seq: DaewoonStep[] = [];
  for (let i = 1; i <= count; i++) {
    const n = mod(base + step * i, 60);
    seq.push({ startAge: su + 10 * (i - 1), cg: n % 10, jj: n % 12 });
  }
  return { forward, startAge: su, exactAge: days / 3, seq };
}
