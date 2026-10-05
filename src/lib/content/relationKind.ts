// 관계별(연애·일·친구·가족) 풀이 — 엔진이 계산한 별점·십신·자리별 반응을 그 관계의 눈으로 읽는다.
// 문장은 계산 결과에서만 만든다(별점과 어긋나는 평가를 쓰지 않는다).

import type { PairEntry } from "../engine/group";
import { PersonFacts } from "../engine/natal";
import { POS, relPlain, relTag, relTone } from "../engine/plain";
import { BranchHit, gwa, josa, PILLAR_KO, PillarKey } from "../engine/relations";

export type RelationKind = "연애" | "일" | "친구" | "가족";

export const RELATION_KINDS: { value: RelationKind; label: string; hint: string }[] = [
  { value: "연애", label: "연애", hint: "연인·썸" },
  { value: "일", label: "일", hint: "직장·사업 파트너" },
  { value: "친구", label: "친구", hint: "친구·지인" },
  { value: "가족", label: "가족", hint: "부모·형제·친척" },
];

export interface InsightBullet {
  tone: "good" | "warn" | "mixed" | "neutral";
  text: string;
  tag?: string;
}

export interface RelationInsight {
  kind: RelationKind;
  title: string;
  summary: string;
  /** 이 관계에서 특히 중요한 자리에서 일어나는 반응 */
  bullets: InsightBullet[];
  tip: string;
}

interface KindProfile {
  title: string;
  /** 이 관계에서 무게가 실리는 자리 */
  keyPlaces: PillarKey[];
  placeWhy: string;
  calm: string; // 평균 ★≥3.5
  mixed: string; // 2.5<★<3.5
  tense: string; // ★≤2.5
  tipFirst: string; // 한쪽이 먼저 열어야 할 때
  tipCalm: string;
  tipTense: string;
}

const PROFILE: Record<RelationKind, KindProfile> = {
  연애: {
    title: "연애 관점의 풀이",
    keyPlaces: ["day", "hour"],
    placeWhy: "연인 사이에서는 함께 보내는 일상 자리와 둘만의 사적인 시간 자리가 가장 크게 작용합니다.",
    calm: "서로를 편하게 느끼는 힘이 커서 가까워지기 쉬운 편입니다.",
    mixed: "끌림과 신경 쓰임이 함께 있어, 서로의 속도를 맞추는 만큼 깊어지는 관계입니다.",
    tense: "서로 신경 쓰이는 지점이 많은 편이라, 마음을 확인하는 대화를 자주 가질수록 안정됩니다.",
    tipFirst: "별점이 높은 쪽이 먼저 마음을 열고 표현하면 상대도 편하게 따라옵니다.",
    tipCalm: "편안함에 익숙해지기 쉬우니 함께 새로운 경험을 쌓으며 신선함을 유지해 보세요.",
    tipTense: "서운함은 쌓아 두지 말고 그날 말로 풀고, 부딪히기 쉬운 시간대보다 여유 있는 때에 이야기하세요.",
  },
  일: {
    title: "일·직장 관점의 풀이",
    keyPlaces: ["month", "day"],
    placeWhy: "함께 일할 때는 일하는 방식 자리와 매일 마주하는 일상 자리가 가장 크게 작용합니다.",
    calm: "손발이 맞는 편이라 역할만 정하면 시너지가 큽니다.",
    mixed: "잘 맞는 면과 어긋나는 면이 섞여 있어, 업무 방식을 미리 맞추는 것이 중요합니다.",
    tense: "일하는 방식에서 부딪히기 쉬우니, 결정권과 업무 범위를 먼저 정해 두면 마찰이 줄어듭니다.",
    tipFirst: "별점이 높은 쪽이 먼저 의견을 묻고 조율하면 협업의 속도가 붙습니다.",
    tipCalm: "편한 사이일수록 역할과 책임을 글로 남겨 두면 오래 갑니다.",
    tipTense: "중요한 사항은 글로 남겨 확인하고, 의견이 갈릴 때는 순서를 정해 한 번에 한 가지씩 풀어가세요.",
  },
  친구: {
    title: "친구 관점의 풀이",
    keyPlaces: ["day", "month"],
    placeWhy: "친구 사이에서는 자주 만나는 일상 자리와 함께 무언가를 할 때의 방식 자리가 가장 크게 작용합니다.",
    calm: "함께 있으면 편하고 오래 이어지기 좋은 인연입니다.",
    mixed: "취향이 겹치는 면과 다른 면이 함께 있어, 서로를 고치려 하지 않을 때 오래갑니다.",
    tense: "가까워질수록 말이 거칠어지기 쉬운 조합이니, 친할수록 예의를 지키는 것이 좋습니다.",
    tipFirst: "별점이 높은 쪽이 먼저 연락하고 약속을 잡으면 관계가 자연스럽게 이어집니다.",
    tipCalm: "당연하다고 여기지 말고 고마움을 가끔 말로 전하세요.",
    tipTense: "만남은 짧고 자주보다 목적이 분명한 자리로 잡으면 부딪힘이 줄어듭니다.",
  },
  가족: {
    title: "가족 관점의 풀이",
    keyPlaces: ["year", "day"],
    placeWhy: "가족 사이에서는 집안과 뿌리를 뜻하는 배경 자리와 매일의 일상 자리가 가장 크게 작용합니다.",
    calm: "정서적 유대가 깊고 서로에게 든든한 버팀목이 되기 쉬운 인연입니다.",
    mixed: "기질이 닮은 면과 다른 면이 섞여 있어, 다름을 인정하는 대화가 관계를 단단하게 합니다.",
    tense: "가까운 사이일수록 말이 날카로워지기 쉬우니, 서운함은 쌓아 두지 말고 풀어 주세요.",
    tipFirst: "별점이 높은 쪽이 먼저 안부를 묻고 이야기를 꺼내면 대화가 부드럽게 열립니다.",
    tipCalm: "일상의 짧은 대화가 관계를 단단하게 하니, 고마움은 말로 전하세요.",
    tipTense: "옳고 그름보다 다름을 먼저 인정하고, 감정이 격해질 땐 잠시 거리를 두었다가 이야기하세요.",
  },
};

/** 같은 글자일 뿐 합·충 등 관계가 없는 경우 */
export function isSameOnly(rel: string[]): boolean {
  return rel.every((r) => r === "동일");
}

export function hitText(h: BranchHit, a: PersonFacts, b: PersonFacts): { text: string; tag: string } {
  const same = h.x === h.y;
  const where = same
    ? `두 사람의 ${POS[PILLAR_KO[h.x]]} 자리끼리`
    : `${a.name}의 ${POS[PILLAR_KO[h.x]]}(${h.xb})${gwa(h.xb)} ${b.name}의 ${POS[PILLAR_KO[h.y]]}(${h.yb})`;
  return { text: `${where}: ${relPlain(h.rel)}`, tag: relTag(h.xb, h.yb, h.rel) };
}

export function describeRelationInsight(
  kind: RelationKind,
  a: PersonFacts,
  b: PersonFacts,
  pair: PairEntry,
  starsAB: number,
  starsBA: number
): RelationInsight {
  const p = PROFILE[kind];
  const avg = (starsAB + starsBA) / 2;
  const level = avg >= 3.5 ? p.calm : avg <= 2.5 ? p.tense : p.mixed;
  const high = starsAB === starsBA ? null : starsAB > starsBA ? a : b;
  const lowName = high ? (high === a ? b : a).name : null;

  const summary =
    `두 방향 별점은 ${a.name}→${b.name} ★${starsAB}, ${b.name}→${a.name} ★${starsBA}(평균 ★${avg}). ${level}` +
    (high && lowName && Math.abs(starsAB - starsBA) >= 2 ? ` 특히 ${josa(lowName, "이", "가")} 상대를 어렵게 느끼는 쪽입니다.` : "");

  const bullets: InsightBullet[] = pair.facts.xy.branch
    .filter((h) => !isSameOnly(h.rel))
    .filter((h) => p.keyPlaces.includes(h.x) || p.keyPlaces.includes(h.y))
    .map((h) => {
      const t = hitText(h, a, b);
      return { tone: relTone(h.rel), text: t.text, tag: t.tag };
    });
  if (pair.facts.xy.ilganHap) bullets.unshift({ tone: "good", text: "두 사람의 '나' 글자끼리 서로 끌립니다.", tag: "일간합" });
  if (pair.facts.xy.ilganChung) bullets.unshift({ tone: "warn", text: "두 사람의 '나' 글자끼리 생각이 부딪힙니다.", tag: "일간충" });

  const tip = high && Math.abs(starsAB - starsBA) >= 2 ? p.tipFirst : avg >= 3.5 ? p.tipCalm : avg <= 2.5 ? p.tipTense : p.tipCalm;

  return { kind, title: p.title, summary: `${summary} ${p.placeWhy}`, bullets, tip };
}

