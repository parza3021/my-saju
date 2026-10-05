// 합·충·형·파·해·원진·반합·삼합·방합 판정, 십신, 십이신살, 길신 기준, 별점 공식 —
// saju-iljin-doc/scripts/relations.py 의 TypeScript 이식. 사주·궁합·일진이 모두 이 파일만 쓴다.
//
// 판정 기준(스킬 확정):
//   - 술–미: 파(破)만. 형으로 세지 않는다. (축·술·미 세 글자가 모두 모이면 삼형은 따로 판정)
//   - 반합: 삼합의 가운데 글자(자·오·묘·유)가 들어간 두 글자만. 해미·인술·사축·신진은 반합이 아니다.
//   - 별점: reference/group/scoring.md 공식(score).

import { mod } from "./clock";
import { CHEONGAN, JIJI } from "./manseryeok";
import { pyRound } from "./num";

export type Wuxing = "목" | "화" | "토" | "금" | "수";
export type PillarKey = "year" | "month" | "day" | "hour";

// ---------------------------------------------------------------- 기본표
export const STEM_EL: Wuxing[] = ["목", "목", "화", "화", "토", "토", "금", "금", "수", "수"];
export const BRANCH_EL: Wuxing[] = ["수", "토", "목", "목", "토", "화", "화", "토", "금", "금", "토", "수"];
export const EL_ORDER: Wuxing[] = ["목", "화", "토", "금", "수"];
export const GEN: Record<Wuxing, Wuxing> = { 목: "화", 화: "토", 토: "금", 금: "수", 수: "목" }; // 생
export const CTRL: Record<Wuxing, Wuxing> = { 목: "토", 토: "수", 수: "화", 화: "금", 금: "목" }; // 극
export type PosKo = "년" | "월" | "일" | "시";
export const PILLAR_KO: Record<PillarKey, PosKo> = { year: "년", month: "월", day: "일", hour: "시" };

const pk = (a: string, b: string) => [a, b].sort().join("");
const pairSet = (s: string) => new Set(s.split(" ").map((x) => pk(x[0], x[2])));

export const STEM_HAP = new Map<string, Wuxing>([
  [pk("갑", "기"), "토"],
  [pk("을", "경"), "금"],
  [pk("병", "신"), "수"],
  [pk("정", "임"), "목"],
  [pk("무", "계"), "화"],
]);
export const STEM_CHUNG = new Set(["갑경", "을신", "병임", "정계"].map((s) => pk(s[0], s[1])));

export const YUKHAP = new Map<string, Wuxing>([
  [pk("자", "축"), "토"],
  [pk("인", "해"), "목"],
  [pk("묘", "술"), "화"],
  [pk("진", "유"), "금"],
  [pk("사", "신"), "수"],
  [pk("오", "미"), "화"],
]);
const CHUNG = pairSet("자-오 축-미 인-신 묘-유 진-술 사-해");
// 형(刑): 인사신·축술미 삼형의 두 글자 쌍 + 자묘 무례지형. ★ 술–미는 형으로 세지 않고 파(破)로만 본다.
const HYEONG = pairSet("인-사 사-신 인-신 축-술 축-미 자-묘");
const JAHYEONG = new Set(["진", "오", "유", "해"]);
const PA = pairSet("자-유 축-진 인-해 묘-오 사-신 술-미");
const HAE = pairSet("자-미 축-오 인-사 묘-진 신-해 유-술");
const WONJIN = pairSet("자-미 축-오 인-유 묘-신 진-해 사-술");

export const SAMHAP: { grp: ReadonlySet<string>; wang: string; el: Wuxing }[] = [
  { grp: new Set(["신", "자", "진"]), wang: "자", el: "수" },
  { grp: new Set(["해", "묘", "미"]), wang: "묘", el: "목" },
  { grp: new Set(["인", "오", "술"]), wang: "오", el: "화" },
  { grp: new Set(["사", "유", "축"]), wang: "유", el: "금" },
];
const canonKey = (chars: Iterable<string>) => [...chars].sort().join("");
const CANON_LIST = ["신자진", "해묘미", "인오술", "사유축", "인묘진", "사오미", "신유술", "해자축", "인사신", "축술미"];
export const CANON = new Map<string, string>(CANON_LIST.map((s) => [canonKey(s), s]));
export const BANGHAP: { grp: ReadonlySet<string>; el: Wuxing }[] = [
  { grp: new Set(["인", "묘", "진"]), el: "목" },
  { grp: new Set(["사", "오", "미"]), el: "화" },
  { grp: new Set(["신", "유", "술"]), el: "금" },
  { grp: new Set(["해", "자", "축"]), el: "수" },
];
export const SAMHYEONG: ReadonlySet<string>[] = [new Set(["인", "사", "신"]), new Set(["축", "술", "미"])];

export const CHEONEUL: Record<string, string> = {
  갑: "축미", 무: "축미", 경: "축미", 을: "자신", 기: "자신", 병: "해유", 정: "해유", 임: "사묘", 계: "사묘", 신: "인오",
};
export const MUNCHANG: Record<string, string> = {
  갑: "사", 을: "오", 병: "신", 정: "유", 무: "신", 기: "유", 경: "해", 신: "자", 임: "인", 계: "묘",
};
export const YANGIN: Record<string, string> = { 갑: "묘", 병: "오", 무: "오", 경: "유", 임: "자" };
export const HONGYEOM: Record<string, string> = {
  갑: "오", 을: "오", 병: "인", 정: "미", 무: "진", 기: "진", 경: "술", 신: "유", 임: "자", 계: "신",
};

export const SAMHAP_OF: Record<string, string> = {
  신: "신자진", 자: "신자진", 진: "신자진", 해: "해묘미", 묘: "해묘미", 미: "해묘미",
  인: "인오술", 오: "인오술", 술: "인오술", 사: "사유축", 유: "사유축", 축: "사유축",
};
const JISAL_OF: Record<string, string> = { 신자진: "신", 해묘미: "해", 인오술: "인", 사유축: "사" };

export const SIGNS = ["양자리", "황소자리", "쌍둥이자리", "게자리", "사자자리", "처녀자리", "천칭자리", "전갈자리", "사수자리", "염소자리", "물병자리", "물고기자리"];
export const SIGN_EL = ["불", "흙", "공기", "물", "불", "흙", "공기", "물", "불", "흙", "공기", "물"];
export const SIGN_MOD = ["활동궁", "고정궁", "변통궁", "활동궁", "고정궁", "변통궁", "활동궁", "고정궁", "변통궁", "활동궁", "고정궁", "변통궁"];
export const ASPECTS: readonly [number, string, number][] = [
  [0, "합", 8], [60, "육각", 6], [90, "사각", 8], [120, "삼각", 8], [180, "대립", 8],
];

/** 받침 유무에 따라 조사를 붙인다. */
export function josa(word: string, withBatchim: string, without: string): string {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  return word + (code >= 0 && code < 11172 && code % 28 !== 0 ? withBatchim : without);
}

/** 한 글자(또는 단어 끝 글자)에 받침이 있으면 과, 없으면 와 */
export function gwa(word: string): "과" | "와" {
  return josa(word, "과", "와").slice(-1) as "과" | "와";
}

export const cgIndex = (cg: string) => CHEONGAN.indexOf(cg as (typeof CHEONGAN)[number]);
export const jjIndex = (jj: string) => JIJI.indexOf(jj as (typeof JIJI)[number]);

export type Sipsin = "비견" | "겁재" | "식신" | "상관" | "편재" | "정재" | "편관" | "정관" | "편인" | "정인";

/** meCg 일간 기준으로 본 otherCg 의 십신. (둘 다 천간 인덱스) */
export function sipsin(meCg: number, otherCg: number): Sipsin {
  const me = STEM_EL[meCg];
  const ot = STEM_EL[otherCg];
  const same = meCg % 2 === otherCg % 2;
  if (me === ot) return same ? "비견" : "겁재";
  if (GEN[me] === ot) return same ? "식신" : "상관";
  if (CTRL[me] === ot) return same ? "편재" : "정재";
  if (CTRL[ot] === me) return same ? "편관" : "정관";
  return same ? "편인" : "정인"; // GEN[ot] === me
}

export const SINSAL_ORDER = ["지살", "도화", "월살", "망신", "장성", "반안", "역마", "육해", "화개", "겁살", "재살", "천살"] as const;
export type Sinsal = (typeof SINSAL_ORDER)[number];

export function sinsal(yearBranch: string, target: string): Sinsal {
  const guk = SAMHAP_OF[yearBranch];
  const start = jjIndex(JISAL_OF[guk]); // 지살 위치
  const k = mod(jjIndex(target) - start, 12);
  return SINSAL_ORDER[k];
}

/** 두 지지 사이 관계 목록. 같은 글자면 ['자형'?, '동일']. */
export function branchRelations(a: string, b: string): string[] {
  const out: string[] = [];
  const p = pk(a, b);
  if (a === b) {
    if (JAHYEONG.has(a)) out.push("자형");
    out.push("동일");
    return out;
  }
  const hap = YUKHAP.get(p);
  if (hap) out.push(`육합(${hap})`);
  if (CHUNG.has(p)) out.push("충");
  if (HYEONG.has(p)) out.push("형");
  if (PA.has(p)) out.push("파");
  if (HAE.has(p)) out.push("해");
  if (WONJIN.has(p)) out.push("원진");
  for (const { grp, wang, el } of SAMHAP) {
    if (grp.has(a) && grp.has(b) && (a === wang || b === wang)) out.push(`반합(${el})`);
  }
  return out;
}

/** 두 천간 사이 관계: '천간합(오행)', '천간충', '복음' 중 해당하는 것 목록. */
export function stemRelation(a: string, b: string): string[] {
  if (a === b) return ["복음"];
  const p = pk(a, b);
  const hap = STEM_HAP.get(p);
  if (hap) return [`천간합(${hap})`];
  if (STEM_CHUNG.has(p)) return ["천간충"];
  return [];
}

// ---------------------------------------------------------------- 사람 사실(별점 계산 입력)
export interface PillarFact {
  cg: string;
  jj: string;
  hanja: string;
}

/** relations 가 요구하는 최소한의 사람 표현. natal.ts 의 PersonFacts 가 이를 만족한다. */
export interface PersonLike {
  name: string;
  ilgan: { cg: string };
  pillars: Partial<Record<PillarKey, PillarFact>>;
}

export const PILLAR_ORDER: PillarKey[] = ["year", "month", "day", "hour"];
function keysOf(p: PersonLike): PillarKey[] {
  return PILLAR_ORDER.filter((k) => p.pillars[k]);
}

export interface StemHit {
  xKey: PillarKey;
  yKey: PillarKey;
  xCg: string;
  yCg: string;
  kind: "합" | "충";
  element: Wuxing | null;
}

export interface BranchHit {
  x: PillarKey;
  y: PillarKey;
  xb: string;
  yb: string;
  rel: string[];
}

export interface PairFacts {
  stemHits: StemHit[];
  branch: BranchHit[];
  ilganHap: boolean;
  ilganChung: boolean;
}

/** X가 Y를 볼 때(방향성) + 둘 사이 구조(대칭). */
export function pairFacts(X: PersonLike, Y: PersonLike): PairFacts {
  const stemHits: StemHit[] = [];
  for (const k1 of keysOf(X)) {
    const p1 = X.pillars[k1]!;
    for (const k2 of keysOf(Y)) {
      const p2 = Y.pillars[k2]!;
      const p = pk(p1.cg, p2.cg);
      const hap = STEM_HAP.get(p);
      if (hap) stemHits.push({ xKey: k1, yKey: k2, xCg: p1.cg, yCg: p2.cg, kind: "합", element: hap });
      else if (STEM_CHUNG.has(p)) stemHits.push({ xKey: k1, yKey: k2, xCg: p1.cg, yCg: p2.cg, kind: "충", element: null });
    }
  }
  const branch: BranchHit[] = [];
  for (const k1 of keysOf(X)) {
    const p1 = X.pillars[k1]!;
    for (const k2 of keysOf(Y)) {
      const p2 = Y.pillars[k2]!;
      const rel = branchRelations(p1.jj, p2.jj);
      if (rel.length) branch.push({ x: k1, y: k2, xb: p1.jj, yb: p2.jj, rel });
    }
  }
  const pr = pk(X.ilgan.cg, Y.ilgan.cg);
  return { stemHits, branch, ilganHap: STEM_HAP.has(pr), ilganChung: STEM_CHUNG.has(pr) };
}

/** giver의 pos 자리 지지(branch)가 receiver에게 귀인 자리다 */
export interface Guiin {
  giver: string;
  pos: PosKo;
  branch: string;
  receiver: string;
  name: "천을귀인" | "문창귀인";
}

/** Y의 지지가 X에게 어떤 길신 자리인가 (Y가 X의 귀인). */
export function guiinOf(X: PersonLike, Y: PersonLike): Guiin[] {
  const out: Guiin[] = [];
  const ig = X.ilgan.cg;
  for (const k of keysOf(Y)) {
    const { jj } = Y.pillars[k]!;
    const at = { giver: Y.name, pos: PILLAR_KO[k], branch: jj, receiver: X.name };
    if (CHEONEUL[ig].includes(jj)) out.push({ ...at, name: "천을귀인" });
    if (jj === MUNCHANG[ig]) out.push({ ...at, name: "문창귀인" });
  }
  return out;
}

export interface ScoreResult {
  sipsin: Sipsin;
  raw: number;
  stars: number;
  why: string[];
}

const SIPSIN_BASE: Record<Sipsin, number> = {
  정인: 1.0, 식신: 1.0, 정재: 0.5, 정관: 0.5, 편인: 0.5, 편재: 0.5, 비견: 0.5, 상관: -0.5, 겁재: -0.5, 편관: -1.0,
};
const NEG_RELS = ["형", "파", "해", "원진", "자형"];
const fmtSigned = (n: number) => (n >= 0 ? `+${n}` : `${n}`); // 파이썬 f"{x:+g}"

/** reference/scoring.md 공식. X가 Y를 볼 때의 별점(1~5). */
export function score(X: PersonLike, Y: PersonLike, pf: PairFacts, guiinXY: Guiin[]): ScoreResult {
  const ss = sipsin(cgIndex(X.ilgan.cg), cgIndex(Y.ilgan.cg));
  const base = SIPSIN_BASE[ss];
  let s = 3.0 + base;
  const why: string[] = [`십신 ${ss} ${fmtSigned(base)}`];
  if (pf.ilganHap) {
    s += 1;
    why.push("일간 천간합 +1");
  }
  if (pf.ilganChung) {
    s -= 1;
    why.push("일간 천간충 -1");
  }
  for (const b of pf.branch) {
    if (b.x === "day" && b.y === "day") {
      const r = b.rel;
      if (r.some((x) => x.startsWith("육합"))) {
        s += 1;
        why.push("일지 육합 +1");
      }
      if (r.some((x) => x.startsWith("반합"))) {
        s += 0.5;
        why.push("일지 반합 +0.5");
      }
      if (r.includes("충")) {
        s -= 1.5;
        why.push("일지 충 -1.5");
      }
      const neg = r.filter((x) => NEG_RELS.includes(x));
      if (neg.length) {
        s -= 0.5;
        why.push(`일지 ${neg.join("·")} -0.5`);
      }
    }
  }
  const others = pf.branch.filter((b) => !(b.x === "day" && b.y === "day"));
  const nHap = others.filter((b) => b.rel.some((x) => x.startsWith("육합") || x.startsWith("반합"))).length;
  const nChung = others.filter((b) => b.rel.includes("충")).length;
  const nNeg = others.filter((b) => b.rel.some((x) => NEG_RELS.includes(x)) && !b.rel.includes("충")).length;
  if (nHap) {
    const d = Math.min(0.25 * nHap, 0.75);
    s += d;
    why.push(`기타 합 ${nHap}건 ${fmtSigned(d)}`);
  }
  if (nChung) {
    const d = -Math.min(0.5 * nChung, 1.0);
    s += d;
    why.push(`기타 충 ${nChung}건 ${fmtSigned(d)}`);
  }
  if (nNeg) {
    const d = -Math.min(0.25 * nNeg, 0.75);
    s += d;
    why.push(`기타 형·파·해·원진 ${nNeg}건 ${fmtSigned(d)}`);
  }
  if (guiinXY.length) {
    s += 0.5;
    why.push("상대가 내 귀인 자리 +0.5");
  }
  const stars = Math.max(1, Math.min(5, Math.trunc(s + 0.5)));
  return { sipsin: ss, raw: pyRound(s, 2), stars, why };
}

/** 두 황경 사이 각도와 가장 가까운 주요 각 [각도, 이름, 오브]. 주요 각이 없으면 [각도, null, null]. */
export function aspect(l1: number, l2: number): [number, string | null, number | null] {
  let d = Math.abs(l1 - l2) % 360;
  d = Math.min(d, 360 - d);
  for (const [ang, name, orb] of ASPECTS) {
    if (Math.abs(d - ang) <= orb) return [round1(d), name, round1(Math.abs(d - ang))];
  }
  return [round1(d), null, null];
}

export function round1(x: number): number {
  return pyRound(x, 1);
}

/** 세 글자가 모여 생기는 판. owners 는 [글자, 그 글자를 가진 사람들] (canon 순서) */
export interface Structure {
  kind: "삼합" | "방합" | "삼형";
  canon: string;
  el: Wuxing | null;
  owners: [string, string[]][];
}

/** 삼합 → 방합 → 삼형 순서 (판정·표시 순서) */
export const STRUCTURE_GROUPS: { kind: Structure["kind"]; grp: ReadonlySet<string>; el: Wuxing | null }[] = [
  ...SAMHAP.map((s) => ({ kind: "삼합" as const, grp: s.grp, el: s.el })),
  ...BANGHAP.map((s) => ({ kind: "방합" as const, grp: s.grp, el: s.el })),
  ...SAMHYEONG.map((grp) => ({ kind: "삼형" as const, grp, el: null })),
];

export const canonOf = (grp: ReadonlySet<string>) => CANON.get(canonKey(grp))!;

/**
 * branch(오늘 지지)가 끼어 완성되는 삼합·방합·삼형.
 * owners: {지지: [가진 사람...]}. 오늘 글자 외 두 글자를 누군가 가져야 성립.
 */
export function structuresWith(branch: string, owners: Record<string, string[]>): Structure[] {
  const out: Structure[] = [];
  for (const { kind, grp, el } of STRUCTURE_GROUPS) {
    if (!grp.has(branch)) continue;
    const canon = canonOf(grp);
    const rest = [...canon].filter((b) => b !== branch);
    if (rest.every((b) => owners[b]?.length)) out.push({ kind, canon, el, owners: rest.map((b) => [b, owners[b]]) });
  }
  return out;
}

// 십이운성 — 일간 기준. 양간은 순행, 음간은 역행. 무·기는 화토동법(병·정과 같은 자리).
export const UNSEONG = ["장생", "목욕", "관대", "건록", "제왕", "쇠", "병", "사", "묘", "절", "태", "양"] as const;
const JANGSAENG: Record<string, string> = {
  갑: "해", 병: "인", 무: "인", 경: "사", 임: "신", 을: "오", 정: "유", 기: "유", 신: "자", 계: "묘",
};

export function unseong(stem: string, branch: string): (typeof UNSEONG)[number] {
  const start = jjIndex(JANGSAENG[stem]);
  let k = jjIndex(branch) - start;
  if (cgIndex(stem) % 2 === 1) k = -k; // 음간 역행
  return UNSEONG[mod(k, 12)];
}
