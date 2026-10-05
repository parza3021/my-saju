// 여러 사람(2~6명)의 관계 계산 — compute_group.py 의 main 이식.
// 방향별 별점 행렬, 쌍별 구조, 모임 전체의 판(삼합·방합·삼형)을 구한다.

import {
  aspect,
  canonOf,
  EL_ORDER,
  Guiin,
  guiinOf,
  PersonLike,
  pairFacts,
  PairFacts,
  score,
  ScoreResult,
  sinsal,
  Structure,
  STRUCTURE_GROUPS,
  Wuxing,
} from "./relations";
import { BirthMember, buildPerson, DEFAULT_OPTIONS, EngineOptions, PersonFacts } from "./natal";

export interface MatrixCell extends ScoreResult {
  guiin: Guiin[];
}

export interface PairEntry {
  names: [string, string];
  sajuStars: { xToY: number; yToX: number; avg: number };
  twoSystems: string;
  sunAngle: { deg: number; aspect: string | null; orb: number | null };
  crossSinsal: Record<string, string>;
  /** 방향별 천간·지지 반응 */
  facts: { xy: PairFacts; yx: PairFacts };
}

export interface TrioFacts {
  members: string[];
  structures: Structure[];
  ohaeng: Record<Wuxing, number>;
  missing: Wuxing[];
}

export interface GroupFacts {
  group: string;
  reportDate: string;
  basis: { lonCorrection: boolean; longitudeDefault: number; jasiMode: string };
  people: PersonFacts[];
  matrix: Record<string, MatrixCell>;
  pairs: Record<string, PairEntry>;
  groupAll: TrioFacts;
}

export function trioFacts(members: PersonFacts[]): TrioFacts {
  const names = members.map((m) => m.name);
  const branches: { name: string; jj: string }[] = [];
  for (const m of members) for (const k of Object.keys(m.pillars) as (keyof typeof m.pillars)[]) {
    branches.push({ name: m.name, jj: m.pillars[k]!.jj });
  }
  const found: Structure[] = [];

  const ownersOf = (grp: ReadonlySet<string>): Record<string, string[]> => {
    const out: Record<string, string[]> = {};
    for (const b of grp) out[b] = [...new Set(branches.filter((x) => x.jj === b).map((x) => x.name))].sort();
    return out;
  };
  // 한 사람이 혼자 전부 가진 구조는 '그 사람의 원국' 이야기이므로 제외
  const crossPerson = (own: Record<string, string[]>) => {
    const people = new Set(Object.values(own).flat());
    return ![...people].some((p) => Object.keys(own).every((b) => own[b].includes(p)));
  };
  for (const { kind, grp, el } of STRUCTURE_GROUPS) {
    const own = ownersOf(grp);
    if (Object.values(own).some((ns) => !ns.length) || !crossPerson(own)) continue;
    const canon = canonOf(grp);
    found.push({ kind, canon, el, owners: [...canon].map((b) => [b, own[b]]) });
  }
  const oh = Object.fromEntries(EL_ORDER.map((e) => [e, members.reduce((s, m) => s + m.ohaeng[e], 0)])) as Record<Wuxing, number>;
  return { members: names, structures: found, ohaeng: oh, missing: EL_ORDER.filter((e) => oh[e] === 0) };
}

/** 사주 평균 별점과 태양 각도로 두 체계의 겹침/갈림을 판정한다 (reference/group/scoring.md). */
export function twoSystemsVerdict(aspectName: string | null, avg: number): string {
  if (aspectName === "삼각" || aspectName === "육각") return avg >= 3.5 ? "겹침(좋음)" : avg <= 2.5 ? "갈림" : "보류";
  if (aspectName === "사각" || aspectName === "대립") return avg <= 2.5 ? "겹침(긴장)" : avg >= 3.5 ? "갈림" : "보류";
  return aspectName === null ? "해당 없음(주요 각 없음)" : "보류(합)";
}

function* combinations<T>(arr: T[], n: number): Generator<T[]> {
  if (n === 0) {
    yield [];
    return;
  }
  for (let i = 0; i <= arr.length - n; i++) {
    for (const rest of combinations(arr.slice(i + 1), n - 1)) yield [arr[i], ...rest];
  }
}

function* permutations2<T>(arr: T[]): Generator<[T, T]> {
  for (const x of arr) for (const y of arr) if (x !== y) yield [x, y];
}

export function computeGroup(
  cfg: { group?: string; members: BirthMember[] },
  reportDate: string,
  opts: EngineOptions = DEFAULT_OPTIONS
): GroupFacts {
  const onYear = Number(reportDate.slice(0, 4));
  const P = cfg.members.map((m) => buildPerson(m, onYear, opts));
  if (P.length < 2 || P.length > 6) throw new Error("인원은 2~6명만 지원합니다.");

  const like = (p: PersonFacts): PersonLike => p;
  const matrix: Record<string, MatrixCell> = {};
  for (const [X, Y] of permutations2(P)) {
    const pf = pairFacts(like(X), like(Y));
    const g = guiinOf(like(X), like(Y));
    matrix[`${X.name}→${Y.name}`] = { ...score(like(X), like(Y), pf, g), guiin: g };
  }

  const pairs: Record<string, PairEntry> = {};
  for (const [X, Y] of combinations(P, 2) as Generator<[PersonFacts, PersonFacts]>) {
    const pf = pairFacts(like(X), like(Y));
    const pfYX = pairFacts(like(Y), like(X));
    const ang = aspect(X.sun.longitude, Y.sun.longitude);
    const sx = score(like(X), like(Y), pf, guiinOf(like(X), like(Y))).stars;
    const sy = score(like(Y), like(X), pfYX, guiinOf(like(Y), like(X))).stars;
    const avg = (sx + sy) / 2;
    pairs[`${X.name}–${Y.name}`] = {
      names: [X.name, Y.name],
      sajuStars: { xToY: sx, yToX: sy, avg },
      twoSystems: twoSystemsVerdict(ang[1], avg),
      sunAngle: { deg: ang[0], aspect: ang[1], orb: ang[2] },
      crossSinsal: {
        [`${Y.name} 일지 ${Y.pillars.day!.jj} → ${X.name}에게`]: sinsal(X.pillars.year!.jj, Y.pillars.day!.jj),
        [`${X.name} 일지 ${X.pillars.day!.jj} → ${Y.name}에게`]: sinsal(Y.pillars.year!.jj, X.pillars.day!.jj),
      },
      facts: { xy: pf, yx: pfYX },
    };
  }

  return {
    group: cfg.group ?? "",
    reportDate,
    basis: { lonCorrection: opts.lonCorrection, longitudeDefault: 127.0, jasiMode: opts.jasiMode },
    people: P,
    matrix,
    pairs,
    groupAll: trioFacts(P),
  };
}
