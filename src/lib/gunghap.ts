// 궁합 — 두 사람의 사주를 엔진(computeGroup)으로 계산하고 관계 종류에 맞춘 풀이를 덧붙인다.

import { describeRelationInsight, RelationInsight, RelationKind } from "./content/relationKind";
import { describeZodiacCompat } from "./content/zodiacCompat";
import { currentYearKst } from "./analysis";
import { computeGroup, GroupFacts, MatrixCell, PairEntry } from "./engine/group";
import { BirthMember, PersonFacts } from "./engine/natal";

export interface GunghapResult {
  kind: RelationKind;
  facts: GroupFacts;
  a: PersonFacts;
  b: PersonFacts;
  ab: MatrixCell;
  ba: MatrixCell;
  pair: PairEntry;
  insight: RelationInsight;
  zodiacCompat: string;
}

const EL_PLAIN_TO_COMPAT: Record<string, string> = { 공기: "바람" };

export function analyzeGunghap(m1: BirthMember, m2: BirthMember, kind: RelationKind): GunghapResult {
  // 이름이 같으면 방향별 표의 키가 겹치므로 구분한다
  const members = m1.name === m2.name ? [m1, { ...m2, name: `${m2.name}(2)` }] : [m1, m2];
  const reportDate = `${currentYearKst()}-01-01`;
  const facts = computeGroup({ group: "", members }, reportDate);
  const [a, b] = facts.people;
  const ab = facts.matrix[`${a.name}→${b.name}`];
  const ba = facts.matrix[`${b.name}→${a.name}`];
  const pair = facts.pairs[`${a.name}–${b.name}`];
  const compat = (el: string) => EL_PLAIN_TO_COMPAT[el] ?? el;

  return {
    kind,
    facts,
    a,
    b,
    ab,
    ba,
    pair,
    insight: describeRelationInsight(kind, a, b, pair, ab.stars, ba.stars),
    zodiacCompat: describeZodiacCompat(compat(a.sun.element), compat(b.sun.element)),
  };
}
