/* eslint-disable @typescript-eslint/no-explicit-any -- 파이썬이 만든 픽스처 JSON 을 느슨하게 다룬다 */
import { describe, expect, it } from "vitest";
import dailyFx from "./__fixtures__/daily.json";
import { dayFromYmd } from "./clock";
import { dailyFacts, ganzhiForDate } from "./daily";
import { MS_MIN } from "./clock";
import { personFacts } from "./natal";
import * as py from "./__fixtures__/pyFormat";

// compute_iljin.py 의 함수들이 만든 값과 대조한다 (가상 인물 6명 × 16일).
// 픽스처 재생성: python3 scripts/gen-fixtures.py <스킬 폴더>

const norm = (s: string | null) => (s === null ? s : s.replace("궁수자리", "사수자리"));

describe("일진 계산이 compute_iljin.py 와 같다", () => {
  for (const [i, c] of dailyFx.entries()) {
    it(`#${i} ${c.birth} → ${c.date}`, () => {
      const [dy, dm, dd] = c.date.split("-").map(Number);
      const [by, bm, bd] = c.birth.split(" ")[0].split("-").map(Number);
      const [bh, bmi] = c.birth.split(" ")[1].split(":").map(Number);
      const P = personFacts({ name: "X", gender: "M", year: by, month: bm, day: bd, hour: bh, minute: bmi });
      const f = dailyFacts(P, dayFromYmd(dy, dm, dd));

      expect(f.ganzhi.n).toBe(c.ganzhi.n);
      expect(f.ganzhi.ganjiKr).toBe(c.ganzhi.ganjiKr);
      expect(ganzhiForDate(dayFromYmd(dy, dm, dd)).ganjiKr).toBe(c.ganzhi.ganjiKr);
      expect({ year: f.yearMonth.year, month: f.yearMonth.month, jieName: f.yearMonth.jieName }).toEqual({
        year: c.yearMonth.year, month: c.yearMonth.month, jieName: c.yearMonth.jieName,
      });
      expect(Math.abs(f.yearMonth.jieKst - c.yearMonth.jieKstMs)).toBeLessThan(2 * MS_MIN);
      expect(f.nextTerm[0]).toBe(c.nextTerm[0]);
      expect(Math.abs(f.nextTerm[1] - (c.nextTerm[1] as number))).toBeLessThan(2 * MS_MIN);
      expect(f.sinsal).toBe(c.sinsal);
      expect(f.gilsin).toEqual(c.gilsin);
      expect(f.reactions.map((r) => ({ pos: r.pos, kind: r.kind, natal: r.natal, rel: r.rel }))).toEqual(c.reactions);
      expect(f.structures.map(py.dailyStructure)).toEqual(c.structures);
      expect(f.unseong).toBe(c.unseong);
      expect(f.sipsinToday).toEqual(c.sipsinToday);
      expect(f.hours).toEqual(c.hours);

      expect(f.ohaeng.total).toBe(c.ohaeng.total);
      for (const [el, row] of Object.entries<any>(c.ohaeng.rows)) {
        const got = f.ohaeng.rows[el as "목"];
        expect(got, el).toEqual({ prev: row.prev, today: row.today, out: row.out, in: row.in });
      }

      expect(f.dayScore).toEqual(c.dayScore);

      const s = f.sky;
      expect(Math.abs(s.sun - c.sky.sun)).toBeLessThan(1e-6);
      expect(Math.abs(s.moon - c.sky.moon)).toBeLessThan(1e-6);
      expect(s.sunAspect).toEqual(c.sky.sunAspect);
      expect(s.moonEvents.map((e) => ({ aspect: e.aspect, from: e.from, to: e.to, exact: e.exact, minOrb: e.minOrb }))).toEqual(
        c.sky.moonEvents.map((e: any) => ({ aspect: e.aspect, from: e.from, to: e.to, exact: e.exact, minOrb: e.min_orb }))
      );
      expect(s.moonIngress?.map(norm) ?? null).toEqual(c.sky.moonIngress?.map(norm) ?? null);
    });
  }
});
