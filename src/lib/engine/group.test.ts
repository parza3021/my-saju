/* eslint-disable @typescript-eslint/no-explicit-any -- 파이썬이 만든 픽스처 JSON 을 느슨하게 다룬다 */
import { describe, expect, it } from "vitest";
import groupFx from "./__fixtures__/group.json";
import { computeGroup } from "./group";
import type { BirthMember } from "./natal";
import { aspect, branchRelations, sinsal, sipsin, structuresWith, unseong } from "./relations";
import { CHEONGAN } from "./manseryeok";

// compute_group.py 가 만든 facts.json 과 같은 결과가 나오는지 대조한다.
// 픽스처 재생성: python3 scripts/gen-fixtures.py <스킬 폴더>

type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

function camel(v: Json): Json {
  if (Array.isArray(v)) return v.map(camel);
  if (v && typeof v === "object") {
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k.replace(/_([a-z])/g, (_, c) => c.toUpperCase()), camel(x)]));
  }
  return v;
}

interface PyMember {
  name: string;
  gender?: "M" | "F";
  date: string;
  time: string | null;
  calendar?: "solar" | "lunar";
  leap?: boolean;
}

function toMember(m: PyMember): BirthMember {
  const [y, mo, d] = m.date.split("-").map(Number);
  const [h, mi] = m.time ? m.time.split(":").map(Number) : [null, 0];
  return { name: m.name, gender: m.gender ?? null, year: y, month: mo, day: d, hour: h, minute: mi, calendar: m.calendar ?? "solar", leap: m.leap ?? false };
}

describe("지지·십신·신살 표준표", () => {
  it("십신표 (갑·신 일간)", () => {
    const row = (me: string) => Array.from({ length: 10 }, (_, i) => sipsin(CHEONGAN.indexOf(me as never), i)).join(" ");
    expect(row("갑")).toBe("비견 겁재 식신 상관 편재 정재 편관 정관 편인 정인");
    expect(row("신")).toBe("정재 편재 정관 편관 정인 편인 겁재 비견 상관 식신");
  });
  it("십이신살 (해묘미국)", () => {
    expect([..."자축인묘진사오미신유술해"].map((b) => sinsal("해", b)).join(" ")).toBe(
      "도화 월살 망신 장성 반안 역마 육해 화개 겁살 재살 천살 지살"
    );
  });
  it("지지 관계 표본 — 술미는 파만, 해미·인술은 반합 아님", () => {
    const cases: [string, string, string[]][] = [
      ["자", "오", ["충"]], ["인", "해", ["육합(목)", "파"]], ["사", "신", ["육합(수)", "형", "파"]],
      ["술", "미", ["파"]], ["자", "미", ["해", "원진"]], ["해", "묘", ["반합(목)"]], ["해", "미", []],
      ["인", "술", []], ["오", "오", ["자형", "동일"]],
    ];
    for (const [a, b, exp] of cases) expect(branchRelations(a, b), `${a}${b}`).toEqual(exp);
  });
  it("완성되는 삼합·방합·삼형 찾기", () => {
    expect(structuresWith("자", { 신: ["가"], 진: ["나"] })).toEqual(["삼합 신자진(수) — 신: 가, 진: 나"]);
    expect(structuresWith("자", { 신: ["가"] })).toEqual([]);
  });
  it("십이운성 (갑목 장생=해, 을목 장생=오)", () => {
    expect(unseong("갑", "해")).toBe("장생");
    expect(unseong("갑", "인")).toBe("건록");
    expect(unseong("갑", "묘")).toBe("제왕");
    expect(unseong("을", "오")).toBe("장생");
  });
  it("별자리 각도", () => {
    expect(aspect(10, 130)).toEqual([120, "삼각", 0]);
    expect(aspect(10, 100)).toEqual([90, "사각", 0]);
    expect(aspect(0, 40)[1]).toBeNull();
  });
});

describe("그룹 계산이 compute_group.py 와 같다", () => {
  for (const [i, g] of groupFx.groups.entries()) {
    const names = g.cfg.members.map((m) => m.name).join("·");
    it(`#${i} ${names} (${g.cfg.members.length}명)`, () => {
      const got = computeGroup({ group: g.cfg.group, members: (g.cfg.members as PyMember[]).map(toMember) }, groupFx.reportDate);
      const exp = camel(g.facts as unknown as Json) as Record<string, any>;

      expect(got.people.length).toBe(exp.people.length);
      got.people.forEach((p, j) => {
        const e = exp.people[j];
        expect(p.pillars, `${p.name} 원국`).toEqual(e.pillars);
        expect(p.ilgan).toEqual(e.ilgan);
        expect(p.ohaeng).toEqual(e.ohaeng);
        expect(p.natalSinsal).toEqual(e.natalSinsal);
        expect(p.gilsin).toEqual(e.gilsin);
        expect(p.internal).toEqual(e.internal);
        expect(p.warnings).toEqual(e.warnings);
        expect(p.hasTime).toBe(e.hasTime);
        expect(p.sun).toEqual(e.sun);
        if (e.daewoon === null) expect(p.daewoon).toBeNull();
        else expect(p.daewoon).toMatchObject(e.daewoon);
        expect(p.seun).toMatchObject(e.seun);
      });
      expect(got.matrix).toMatchObject(exp.matrix);
      expect(Object.keys(got.matrix)).toEqual(Object.keys(exp.matrix));
      expect(got.matrixSummary).toEqual(exp.matrixSummary);
      expect(Object.keys(got.pairs)).toEqual(Object.keys(exp.pairs));
      for (const [k, ep] of Object.entries<any>(exp.pairs)) {
        const gp = got.pairs[k];
        expect({ sajuStars: gp.sajuStars, twoSystems: gp.twoSystems, stem: gp.stem, branch: gp.branch, sunAngle: gp.sunAngle, crossSinsal: gp.crossSinsal }, k).toEqual({
          sajuStars: ep.sajuStars, twoSystems: ep.twoSystems, stem: ep.stem, branch: ep.branch, sunAngle: ep.sunAngle, crossSinsal: ep.crossSinsal,
        });
      }
      expect(got.trios).toEqual(exp.trios);
      expect(got.groupAll).toEqual(exp.groupAll);
    });
  }
});
