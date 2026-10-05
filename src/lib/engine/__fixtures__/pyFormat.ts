// 테스트 전용 — 엔진의 구조화된 출력을 파이썬 스킬이 쓰는 문장 형식으로 바꿔 픽스처와 대조한다.
// 앱은 이 형식을 쓰지 않는다.
import type { PairEntry } from "../group";
import type { NatalGilsin, PersonFacts, SeunFact } from "../natal";
import { Guiin, josa, PILLAR_KO, stemRelation, Structure } from "../relations";

const head = (s: Structure) => `${s.kind} ${s.canon}${s.el ? `(${s.el})` : ""}`;

/** compute_iljin.py: '삼합 신자진(수) — 신: 가, 진: 나' */
export const dailyStructure = (s: Structure) => `${head(s)} — ${s.owners.map(([b, ns]) => `${b}: ${ns.join("·")}`).join(", ")}`;

/** compute_group.py: '삼합 해묘미(목) — 해:가/나, 묘:다, 미:라' */
export const groupStructure = (s: Structure) => `${head(s)} — ${s.owners.map(([b, ns]) => `${b}:${ns.join("/")}`).join(", ")}`;

export const guiin = (g: Guiin) => `${g.giver} ${g.pos}지 ${g.branch} = ${g.receiver}의 ${g.name}`;

export const gilsin = (g: NatalGilsin) => `${g.pos}지 ${g.branch} ${g.name}`;

export const internal = (P: PersonFacts) =>
  P.internalHits.map((h) => `${PILLAR_KO[h.k1]}지 ${h.b1}–${PILLAR_KO[h.k2]}지 ${h.b2}: ${h.rel.join(", ")}`);

export function pairStem(p: PairEntry): string[] {
  const [X, Y] = p.names;
  return p.facts.xy.stemHits.map(
    (h) => `${X} ${PILLAR_KO[h.xKey]}간 ${h.xCg} – ${Y} ${PILLAR_KO[h.yKey]}간 ${h.yCg}: ${h.kind === "합" ? `천간합(${h.element})` : "천간충"}`
  );
}

export function pairBranch(p: PairEntry): string[] {
  const [X, Y] = p.names;
  return p.facts.xy.branch.map((b) => `${X} ${PILLAR_KO[b.x]}지 ${b.xb} – ${Y} ${PILLAR_KO[b.y]}지 ${b.yb}: ${b.rel.join(", ")}`);
}

export function seunNotes(P: PersonFacts, s: SeunFact): string[] {
  return [
    `세운 천간 ${josa(s.ganzhi[0], "은", "는")} ${P.name}에게 ${s.sipsin}`,
    ...s.items.map((it) =>
      it.kind === "cg"
        ? `${it.pos}간 ${josa(it.b, "과", "와")} ${stemRelation(it.a, it.b)[0]}`
        : `${it.pos}지 ${josa(it.b, "과", "와")} ${it.rel.join(", ")}`
    ),
  ];
}
