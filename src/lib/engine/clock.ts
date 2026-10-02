// 시각 도구 — 로컬 시간대에 흔들리지 않도록 모든 시각을 "UTC 기준 epoch 밀리초(number)"로만 다룬다.
// 파이썬의 naive datetime / date 에 대응한다.
//   Ms  : naive datetime. 필드(연·월·일·시…)를 UTC 게터로 읽는다. 소수 밀리초도 유지해 반올림 오차를 막는다.
//   Day : naive date. 1970-01-01 을 0으로 하는 정수 일수.

export type Ms = number;
export type Day = number;

export const MS_MIN = 60_000;
export const MS_HOUR = 3_600_000;
export const MS_DAY = 86_400_000;
export const KST: Ms = 9 * MS_HOUR;

/** 파이썬 % 처럼 항상 0 이상(제수가 양수일 때)을 돌려준다. */
export function mod(a: number, b: number): number {
  return ((a % b) + b) % b;
}

export function mk(y: number, mo: number, d: number, h = 0, mi = 0, s = 0): Ms {
  return Date.UTC(y, mo - 1, d, h, mi, s);
}

export function dayOf(ms: Ms): Day {
  return Math.floor(ms / MS_DAY);
}

export function dayFromYmd(y: number, mo: number, d: number): Day {
  return Math.round(Date.UTC(y, mo - 1, d) / MS_DAY);
}

export function dayToMs(day: Day, h = 0, mi = 0): Ms {
  return day * MS_DAY + h * MS_HOUR + mi * MS_MIN;
}

export interface Fields {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export function fields(ms: Ms): Fields {
  const d = new Date(Math.floor(ms));
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    hour: d.getUTCHours(),
    minute: d.getUTCMinutes(),
    second: d.getUTCSeconds(),
  };
}

export function ymdOfDay(day: Day): { year: number; month: number; day: number } {
  const f = fields(day * MS_DAY);
  return { year: f.year, month: f.month, day: f.day };
}

/** 파이썬 date.weekday(): 월요일 = 0 … 일요일 = 6. (1970-01-01 은 목요일) */
export function weekdayMon0(day: Day): number {
  return mod(day + 3, 7);
}

/** 그 해 1월 1일부터의 일수(1월 1일 = 1). 파이썬 timetuple().tm_yday. */
export function yday(day: Day): number {
  const y = ymdOfDay(day).year;
  return day - dayFromYmd(y, 1, 1) + 1;
}

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function hhmm(ms: Ms): string {
  const f = fields(ms);
  return `${pad2(f.hour)}:${pad2(f.minute)}`;
}
