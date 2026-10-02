import { describe, expect, it } from "vitest";
import {
  dayGanzhiIndex,
  daewoon,
  lunarToSolar,
  saju,
  solarLongitudeUtc,
  SajuOptions,
} from "./manseryeok";
import { MS_MIN } from "./clock";
import lunarFx from "./__fixtures__/lunar.json";
import sajuFx from "./__fixtures__/saju.json";
import sunFx from "./__fixtures__/sun.json";

// 파이썬 스킬 엔진(saju-iljin-doc/scripts/manseryeok.py)이 만든 정답과 대조한다.
// 픽스처 재생성: python3 scripts/gen-fixtures.py <스킬 폴더>

function parseBirth(s: string): number {
  const [d, t] = s.split(" ");
  const [y, mo, da] = d.split("-").map(Number);
  const [h, mi] = t.split(":").map(Number);
  return Date.UTC(y, mo - 1, da, h, mi);
}

describe("만세력 엔진 이식", () => {
  it("태양 황경이 파이썬과 0.001° 안에서 같다", () => {
    for (const c of sunFx.sun) {
      expect(Math.abs(solarLongitudeUtc(c.utcMs) - c.lon)).toBeLessThan(0.001);
    }
  });

  it("일 간지 인덱스가 파이썬과 같다", () => {
    for (const c of sunFx.dayGanzhi) expect(dayGanzhiIndex(c.day)).toBe(c.idx);
  });

  it("음력 → 양력 변환이 파이썬과 같다 (1954~61, 1980~2030, 윤달 포함)", () => {
    for (const c of lunarFx) {
      expect(lunarToSolar(c.y, c.m, c.d, c.leap), `${c.y}.${c.leap ? "윤" : ""}${c.m}.${c.d}`).toBe(c.solar);
    }
  });

  describe("원국 · 대운", () => {
    for (const [i, c] of sajuFx.entries()) {
      it(`#${i} ${c.birth} ${c.opts.calendar}${c.opts.leap ? "(윤)" : ""} ${c.opts.jasiMode}${c.opts.lonCorrection ? "" : " 보정없음"}`, () => {
        const opts: SajuOptions = c.opts as SajuOptions;
        const r = saju(parseBirth(c.birth), opts);
        expect([...r.year]).toEqual(c.year);
        expect([...r.month]).toEqual(c.month);
        expect([...r.day]).toEqual(c.day);
        expect([...r.hour]).toEqual(c.hour);
        expect(r.solarDate).toBe(c.solarDate);
        expect(r.dst).toBe(c.dst);
        expect(r.utcOffset / MS_MIN).toBe(c.utcOffsetMin);
        expect(Math.abs(r.utc - c.utcMs)).toBeLessThan(2);
        expect(Math.abs(r.ipchunKst - c.ipchunKstMs)).toBeLessThan(2 * MS_MIN);
        expect(r.jie[0]).toBe(c.jie[0]);
        expect(Math.abs(r.jie[1] - (c.jie[1] as number))).toBeLessThan(2 * MS_MIN);
        for (const g of ["M", "F"] as const) {
          const dw = daewoon(r, g);
          const want = c.daewoon[g];
          expect(dw.forward).toBe(want.forward);
          expect(dw.startAge).toBe(want.startAge);
          expect(Math.abs(dw.exactAge - want.exactAge)).toBeLessThan(0.01);
          expect(dw.seq.map((s) => [s.startAge, s.cg, s.jj])).toEqual(want.seq);
        }
      });
    }
  });
});
