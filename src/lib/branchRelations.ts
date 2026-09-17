import { BranchRef, Pillar, RelationHit, SajuResult, Wuxing } from "./types";

export const YUKHAP: [string, string, Wuxing | null][] = [
  ["子", "丑", "토"],
  ["寅", "亥", "목"],
  ["卯", "戌", "화"],
  ["辰", "酉", "금"],
  ["巳", "申", "수"],
  ["午", "未", null],
];

export const CHUNG: [string, string][] = [
  ["子", "午"],
  ["丑", "未"],
  ["寅", "申"],
  ["卯", "酉"],
  ["辰", "戌"],
  ["巳", "亥"],
];

export const WONJIN: [string, string][] = [
  ["子", "未"],
  ["丑", "午"],
  ["寅", "酉"],
  ["卯", "申"],
  ["辰", "亥"],
  ["巳", "戌"],
];

const JAMYO_HYUNG: [string, string] = ["子", "卯"];
const SELF_HYUNG_BRANCHES = ["辰", "午", "酉", "亥"];
const SAMHYUNG: [string, string, string][] = [
  ["寅", "巳", "申"],
  ["丑", "戌", "未"],
];
const SAMHAP: [string, string, string, Wuxing][] = [
  ["申", "子", "辰", "수"],
  ["亥", "卯", "未", "목"],
  ["寅", "午", "戌", "화"],
  ["巳", "酉", "丑", "금"],
];

function label(ref: BranchRef, name: string): string {
  return `${name}님의 ${ref.pillarLabel}(${ref.branch.hangul})`;
}

export function getBranchRefs(saju: SajuResult, person: 1 | 2): BranchRef[] {
  const pillars = [saju.year, saju.month, saju.day, saju.time].filter(
    (p): p is NonNullable<typeof p> => p !== null
  );
  return pillars.map((p) => ({ person, pillarLabel: p.label as Pillar["label"], branch: p.zhi }));
}

function pickInstances(hanjaList: readonly string[], pool: BranchRef[]): BranchRef[] | null {
  const chosen: BranchRef[] = [];
  for (const h of hanjaList) {
    const found = pool.find((p) => p.branch.hanja === h && !chosen.includes(p));
    if (!found) return null;
    chosen.push(found);
  }
  return chosen;
}

function hasBothPersons(refs: BranchRef[]): boolean {
  return refs.some((r) => r.person === 1) && refs.some((r) => r.person === 2);
}

export function findBranchRelations(
  name1: string,
  refs1: BranchRef[],
  name2: string,
  refs2: BranchRef[]
): RelationHit[] {
  const hits: RelationHit[] = [];
  const nameOf = (person: 1 | 2) => (person === 1 ? name1 : name2);

  for (const x of refs1) {
    for (const y of refs2) {
      const xh = x.branch.hanja;
      const yh = y.branch.hanja;

      const yukhap = YUKHAP.find(([a, b]) => (a === xh && b === yh) || (a === yh && b === xh));
      if (yukhap) {
        const elementNote = yukhap[2] ? ` 합쳐진 기운은 ${yukhap[2]}의 성질을 띱니다.` : "";
        hits.push({
          type: "육합",
          polarity: "긍정",
          branches: [x, y],
          description: `${label(x, name1)}와(과) ${label(y, name2)}가 육합을 이루어 서로를 자연스럽게 끌어당기는 친화적인 관계입니다.${elementNote}`,
        });
      }

      if (CHUNG.some(([a, b]) => (a === xh && b === yh) || (a === yh && b === xh))) {
        hits.push({
          type: "충",
          polarity: "주의",
          branches: [x, y],
          description: `${label(x, name1)}와(과) ${label(y, name2)}가 충을 이루어 서로 부딪히기 쉬운 긴장 관계입니다. 의견 차이를 조율하는 노력이 필요합니다.`,
        });
      }

      if (WONJIN.some(([a, b]) => (a === xh && b === yh) || (a === yh && b === xh))) {
        hits.push({
          type: "원진",
          polarity: "주의",
          branches: [x, y],
          description: `${label(x, name1)}와(과) ${label(y, name2)}가 원진살에 해당해 사소한 것에도 서운함이 쌓이기 쉬운 관계이니, 오해가 생기면 바로바로 대화로 풀어가는 것이 중요합니다.`,
        });
      }

      if ((JAMYO_HYUNG[0] === xh && JAMYO_HYUNG[1] === yh) || (JAMYO_HYUNG[0] === yh && JAMYO_HYUNG[1] === xh)) {
        hits.push({
          type: "형",
          polarity: "주의",
          branches: [x, y],
          description: `${label(x, name1)}와(과) ${label(y, name2)}가 무례지형(子卯刑)을 이루어, 서로 예의를 차리지 않고 편해진 나머지 말을 함부로 하게 되기 쉬운 조합입니다.`,
        });
      }

      if (xh === yh && SELF_HYUNG_BRANCHES.includes(xh)) {
        hits.push({
          type: "자형",
          polarity: "주의",
          branches: [x, y],
          description: `${label(x, name1)}와(과) ${label(y, name2)}가 같은 지지(${x.branch.hangul})로 자형을 이루어, 비슷한 고집이나 스트레스 포인트가 겹쳐 서로를 더 예민하게 만들 수 있는 조합입니다.`,
        });
      }
    }
  }

  const pool = [...refs1, ...refs2];

  for (const [a, b, c] of SAMHYUNG) {
    const full = pickInstances([a, b, c], pool);
    if (full && hasBothPersons(full)) {
      const names = full.map((r) => label(r, nameOf(r.person))).join(", ");
      hits.push({
        type: "삼형",
        polarity: "주의",
        branches: full,
        description: `${names}가 모여 삼형을 이루어, 둘 사이에 갈등이나 잔소리가 잦아지기 쉬운 조합입니다. 다만 함께 위기를 헤쳐나가는 과정에서 오히려 단단해지는 경우도 많으니 갈등 자체보다 대처 방식이 중요합니다.`,
      });
    }
  }

  for (const [a, b, c, elem] of SAMHAP) {
    const full = pickInstances([a, b, c], pool);
    if (full && hasBothPersons(full)) {
      const names = full.map((r) => label(r, nameOf(r.person))).join(", ");
      hits.push({
        type: "삼합",
        polarity: "긍정",
        branches: full,
        description: `${names}가 모여 삼합을 이루어 ${elem}의 기운으로 합쳐지는, 뜻이 잘 맞고 함께 일을 도모하기 좋은 조합입니다.`,
      });
      continue;
    }
    for (const pair of [[a, b], [b, c], [a, c]] as const) {
      const partial = pickInstances(pair, pool);
      if (partial && hasBothPersons(partial)) {
        const names = partial.map((r) => label(r, nameOf(r.person))).join(", ");
        hits.push({
          type: "반합",
          polarity: "긍정",
          branches: partial,
          description: `${names}가 반합을 이루어 ${elem} 기운으로 서로를 보완하는 조합입니다. 완전한 삼합은 아니지만 협력이 잘 되는 편입니다.`,
        });
        break;
      }
    }
  }

  return hits;
}
