// 화면이 쓰는 어댑터 — 엔진(src/lib/engine)의 사실을 한국 시간 기준으로 불러오는 얇은 층.

import { Day, dayFromYmd, ymdOfDay } from "./engine/clock";
import { todayKst } from "./engine/daily";
import { BirthMember, buildPerson, PersonFacts } from "./engine/natal";

export function currentYearKst(): number {
  return ymdOfDay(todayKst()).year;
}

export function analyzePerson(m: BirthMember): PersonFacts {
  return buildPerson(m, currentYearKst());
}

export function birthLabel(P: PersonFacts): string {
  const i = P.input;
  const date = `${i.year}년 ${i.month}월 ${i.day}일`;
  const time = i.hour === null ? "생 · 시각 모름" : ` ${String(i.hour).padStart(2, "0")}:${String(i.minute).padStart(2, "0")}생`;
  if (i.calendar === "lunar") {
    const s = ymdOfDay(P.solarDate);
    return `음력 ${date}${i.leap ? " (윤달)" : ""}${time} · 양력 ${s.year}.${s.month}.${s.day}`;
  }
  return date + time;
}

export function toDateInputValue(day: Day): string {
  const { year, month, day: d } = ymdOfDay(day);
  return `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function parseDateInput(value: string): Day {
  const [y, m, d] = value.split("-").map(Number);
  return dayFromYmd(y, m, d);
}

export { todayKst };
