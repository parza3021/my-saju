import { birthLabel } from "@/lib/analysis";
import { hitText, isSameOnly, toneOfRel } from "@/lib/content/relationKind";
import { WUXING_CONTENT } from "@/lib/content/wuxing";
import { GunghapResult } from "@/lib/gunghap";
import { MatrixCell } from "@/lib/engine/group";
import { PersonFacts } from "@/lib/engine/natal";
import {
  ASPECT_PLAIN,
  GILSIN,
  ILGAN_IMAGE,
  OHAENG,
  OHAENG_HANJA,
  POS,
  REL,
  SIGN_ELEMENT_PLAIN,
  SIGN_MODALITY_PLAIN,
  SINSAL,
  SINSAL_HANJA,
  SIPSIN_LUCK,
  SIPSIN_PERSON,
  STARS,
  STRUCT_EL,
  TWO_SYSTEMS_PLAIN,
} from "@/lib/engine/plain";
import { EL_ORDER, gwa, josa, PILLAR_KO, PosKo, Sinsal, Sipsin } from "@/lib/engine/relations";
import { zodiacByName } from "@/lib/zodiac";
import { EL_VAR } from "./saju/colors";
import EightCharGrid from "./saju/EightCharGrid";
import ElementBalance from "./saju/ElementBalance";
import BasisFooter from "./saju/BasisFooter";
import Glossary from "./saju/Glossary";
import LuckTimeline, { SeunCard } from "./saju/LuckTimeline";
import NatalDetails from "./saju/NatalDetails";
import { Badge, Card, Disclosure, Jargon, Section, StarRating, TableWrap } from "./saju/ui";
import ZodiacCard from "./ZodiacCard";

const elName = (el: string) => (el === "공기" ? "바람" : el);
const TONE = { good: "good", warn: "warn", mixed: "amber", neutral: "neutral" } as const;

function PersonCard({ p }: { p: PersonFacts }) {
  const dominant = EL_ORDER.reduce((a, b) => (p.ohaeng[b] > p.ohaeng[a] ? b : a));
  const missing = EL_ORDER.filter((e) => p.ohaeng[e] === 0);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-sm font-medium text-amber-300">{p.name}</p>
      <p className="text-xs text-white/40 mb-3">{birthLabel(p)}</p>
      <EightCharGrid person={p} />
      <p className="mt-3 text-sm text-white/75 leading-relaxed">
        <b className="text-white/90">한마디로</b> {ILGAN_IMAGE[p.ilgan.cg]}에 비유되는 {p.ilgan.element}({OHAENG_HANJA[p.ilgan.element]}) 기운이 &lsquo;나&rsquo;이고,
        가장 많은 기운은 {dominant}({OHAENG[dominant]})
        {missing.length ? `, 보이지 않는 기운은 ${missing.map((m) => `${m}(${OHAENG[m]})`).join("·")}입니다.` : "입니다."}
      </p>
      <div className="mt-3 flex gap-1 text-xs">
        {EL_ORDER.map((e) => (
          <span key={e} className="flex-1 text-center border-t-[3px] pt-1 text-white/60" style={{ borderColor: EL_VAR[e] }}>
            <b className="text-white/90">
              {e} {p.ohaeng[e]}
            </b>
            <small className="block text-[10px] text-white/35">{OHAENG[e]}</small>
          </span>
        ))}
      </div>
      {p.warnings.map((w) => (
        <p key={w} className="mt-2 text-xs text-amber-300/80">⚠ {w}</p>
      ))}
      <Disclosure summary="신살·타고난 복·대운 더 보기">
        <div className="space-y-5">
          <NatalDetails person={p} />
          <LuckTimeline person={p} />
        </div>
      </Disclosure>
    </div>
  );
}

function DirectionCard({ from, to, cell }: { from: PersonFacts; to: PersonFacts; cell: MatrixCell }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs text-white/45">
        {josa(from.name, "이", "가")} {josa(to.name, "을", "를")} 볼 때
      </p>
      <p className="mt-1 text-amber-300 font-semibold">{SIPSIN_PERSON[cell.sipsin as Sipsin]}</p>
      <div className="mt-1 flex items-center gap-2">
        <StarRating stars={cell.stars} size="text-xl" />
        <span className="text-xs text-white/50">{STARS[cell.stars]}</span>
        <Jargon>{cell.sipsin}</Jargon>
      </div>
      <Disclosure summary="별점 근거 보기">
        <ul className="text-xs text-white/55 space-y-0.5">
          {cell.why.map((w) => (
            <li key={w}>· {w}</li>
          ))}
          <li className="text-white/35">합계 {cell.raw}점 → 반올림해 ★{cell.stars}</li>
        </ul>
      </Disclosure>
    </div>
  );
}

function parseGuiin(s: string) {
  const m = s.match(/^(\S+) (.)지 (\S) = (\S+)의 (천을귀인|문창귀인)$/);
  return m ? { giver: m[1], pos: m[2] as PosKo, branch: m[3], receiver: m[4], name: m[5] } : null;
}

function verdictText(v: string, avg: number): string {
  switch (v) {
    case "겹침(좋음)":
      return `사주(평균 ★${avg})도 별자리도 이 둘을 편하게 봅니다. 두 방법이 같은 말을 하니 조금 더 믿어도 좋습니다.`;
    case "겹침(긴장)":
      return `사주(평균 ★${avg})도 별자리도 이 둘 사이에 긴장이 있다고 봅니다. 의식적으로 조율하면 충분히 풀 수 있는 긴장입니다.`;
    case "갈림":
      return `사주(평균 ★${avg})와 별자리의 의견이 다릅니다. 어느 한쪽 말만 믿지 말고 실제로 겪어 보며 판단하세요.`;
    case "보류":
    case "보류(합)":
      return `사주(평균 ★${avg})와 별자리를 견줘도 한쪽으로 판단하기 어려워 판단을 보류합니다.`;
    default:
      return "두 사람의 태양 사이에는 뚜렷한 각도가 없어, 이 관계에 대해 별자리는 말하지 않습니다.";
  }
}

export default function GunghapResultView({ result }: { result: GunghapResult }) {
  const { a, b, ab, ba, pair, insight, facts } = result;
  const avg = pair.sajuStars.avg;
  const branchHits = pair.facts.xy.branch.filter((h) => !isSameOnly(h.rel)).map((h) => ({ h, tone: toneOfRel(h.rel), ...hitText(h, a, b) }));
  const stemHits = pair.facts.xy.stemHits;
  const goodN = branchHits.filter((x) => x.tone === "good").length + stemHits.filter((s) => s.kind === "합").length;
  const warnN = branchHits.filter((x) => x.tone === "warn").length + stemHits.filter((s) => s.kind === "충").length;
  const group = facts.groupAll;
  const guiin = [...ab.guiin, ...ba.guiin].map(parseGuiin).filter((x): x is NonNullable<typeof x> => !!x);
  const sa = pair.sunAngle;
  const zA = zodiacByName(a.sun.sign);
  const zB = zodiacByName(b.sun.sign);
  const asym = Math.abs(ab.stars - ba.stars);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      <Section title="총평">
        <Card className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <StarRating stars={Math.round(avg)} size="text-2xl" />
            <span className="text-sm text-white/60">두 방향 평균 ★{avg}</span>
            <Badge tone="amber">{insight.kind}</Badge>
          </div>
          <p className="text-sm text-white/80 leading-relaxed">
            여덟 글자를 맞대어 본 결과 <span className="text-emerald-300 font-medium">끌리고 묶이는 반응 {goodN}건</span>,{" "}
            <span className="text-red-300 font-medium">부딪히거나 어긋나는 반응 {warnN}건</span>이 있습니다.
            {asym >= 2 &&
              ` 방향에 따라 별점이 ${asym}점 차이 나므로, 별점이 높은 ${josa(ab.stars > ba.stars ? a.name : b.name, "이", "가")} 먼저 연다는 마음으로 접근하면 좋습니다.`}
          </p>
        </Card>
      </Section>

      <Section title={insight.title}>
        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/5 p-5 sm:p-6 space-y-3">
          <p className="text-sm text-white/80 leading-relaxed">{insight.summary}</p>
          {insight.bullets.length > 0 ? (
            <div className="space-y-2">
              {insight.bullets.map((bl, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <Badge tone={TONE[bl.tone]}>{bl.tone === "good" ? "끌림" : bl.tone === "warn" ? "부딪힘" : bl.tone === "mixed" ? "섞임" : "참고"}</Badge>
                  <p className="text-sm text-white/70 leading-relaxed">
                    {bl.text}
                    {bl.tag && <Jargon>{bl.tag}</Jargon>}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/55">이 관계에서 중요한 자리에는 눈에 띄는 끌림이나 부딪힘이 없어 무난하게 지낼 수 있습니다.</p>
          )}
          <p className="text-sm text-amber-300 leading-relaxed">{insight.tip}</p>
        </div>
      </Section>

      <Section title="두 사람의 사주팔자" lede="각자의 여덟 글자와 오행입니다. 설명은 글자 구조에서 읽히는 경향이며 성격을 단정하는 말이 아닙니다.">
        <div className="grid sm:grid-cols-2 gap-4">
          <PersonCard p={a} />
          <PersonCard p={b} />
        </div>
      </Section>

      <Section
        title="둘이 모인 기운"
        lede={`두 사람의 글자 ${Object.values(group.ohaeng).reduce((x, y) => x + y, 0)}개를 다섯 가지 기운으로 나눠 합친 것입니다.`}
      >
        <Card>
          <ElementBalance counts={group.ohaeng} />
          <p className="mt-3 text-xs text-white/45">
            {EL_ORDER.map((e) => `${e} ${a.name}${a.ohaeng[e]}·${b.name}${b.ohaeng[e]}`).join(" / ")}
          </p>
          {group.missing.length > 0 && (
            <p className="mt-2 text-sm text-white/65">
              둘이 합쳐도 {group.missing.map((m) => `${m}(${WUXING_CONTENT[m].hanja})`).join(", ")} 기운은 보이지 않습니다. {WUXING_CONTENT[group.missing[0]].lacking}
            </p>
          )}
          {group.structures.length > 0 ? (
            <div className="mt-4 space-y-2">
              <p className="text-xs text-white/45">서로 다른 사람이 가진 글자 세 개가 모이면, 혼자일 때는 없던 한 팀의 기운이 생깁니다.</p>
              {group.structures.map((s) => {
                const [head, who] = s.split(" — ");
                const m = head.match(/^(삼합|방합|삼형) (\S+?)(?:\((.)\))?$/);
                return (
                  <div key={s} className="flex gap-2 items-start">
                    <Badge tone={m?.[1] === "삼형" ? "warn" : "good"}>{m?.[1]}</Badge>
                    <p className="text-sm text-white/70">
                      {m?.[3] ? `${STRUCT_EL[m[3]]} 팀` : "서로 긁는 세 글자"}이 만들어집니다.
                      <Jargon>{head}</Jargon>
                      <span className="block text-xs text-white/40">{who.replace(/\//g, "·")}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-3 text-sm text-white/55">두 사람의 글자만으로 완성되는 삼합·방합은 없습니다.</p>
          )}
        </Card>
      </Section>

      <Section
        title="서로를 어떻게 느끼는가"
        lede="사주의 관계는 누가 누구를 보느냐에 따라 달라집니다. 같은 두 사람이라도 방향마다 별점이 다를 수 있습니다."
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <DirectionCard from={a} to={b} cell={ab} />
          <DirectionCard from={b} to={a} cell={ba} />
        </div>
        <p className="mt-3 text-xs text-white/40 leading-relaxed">
          {STARS[5] && [5, 4, 3, 2, 1].map((n) => `★${n} ${STARS[n]}`).join(" · ")}
        </p>
      </Section>

      <Section title="두 사람 사이에서 끌리고 부딪히는 곳" lede="어느 자리에서 생기는지가 중요합니다. 일상 자리에서 부딪히면 매일 만날 때, 일하는 방식 자리에서 부딪히면 함께 일할 때 드러납니다.">
        <Card className="space-y-3">
          {branchHits.length === 0 && stemHits.length === 0 && (
            <p className="text-sm text-white/60">두 사람의 아랫글자 사이에는 뚜렷한 합·충·형·파·해·원진이 나타나지 않았습니다. 극단적으로 끌리거나 부딪히는 요소가 적은, 무난하고 평탄한 조합입니다.</p>
          )}
          {stemHits.map((s, i) => (
            <div key={`s${i}`} className="flex gap-2 items-start">
              <Badge tone={s.kind === "합" ? "good" : "warn"}>{s.kind === "합" ? "윗글자 끌림" : "윗글자 부딪힘"}</Badge>
              <p className="text-sm text-white/70 leading-relaxed">
                {a.name}의 {POS[PILLAR_KO[s.xKey]]}({s.xCg}){gwa(s.xCg)} {b.name}의 {POS[PILLAR_KO[s.yKey]]}({s.yCg}): {s.kind === "합" ? REL["천간합"] : REL["천간충"]}
                <Jargon>
                  {s.xCg}
                  {s.yCg}
                  {s.kind}
                  {s.element ? `(${s.element})` : ""}
                </Jargon>
              </p>
            </div>
          ))}
          {branchHits.map((x, i) => (
            <div key={`b${i}`} className="flex gap-2 items-start">
              <Badge tone={TONE[x.tone]}>{x.h.rel.map((r) => r.split("(")[0]).join("·")}</Badge>
              <p className="text-sm text-white/70 leading-relaxed">
                {x.text}
                <Jargon>{x.tag}</Jargon>
              </p>
            </div>
          ))}
          <div className="pt-2 border-t border-white/10 text-xs text-white/45 space-y-1">
            {Object.entries(pair.crossSinsal).map(([k, v]) => (
              <p key={k}>
                {k}: {SINSAL[v as Sinsal]}
                <Jargon>
                  {v} {SINSAL_HANJA[v as Sinsal]}
                </Jargon>
              </p>
            ))}
          </div>
        </Card>
      </Section>

      <Section title="누가 누구를 돕는가" lede="사주에는 '이 글자를 가진 사람이 나를 돕는다'는 자리가 정해져 있습니다. 상대의 아랫글자가 그 자리에 있는지 찾았습니다.">
        <Card>
          {guiin.length === 0 ? (
            <p className="text-sm text-white/60">서로의 여덟 글자 안에 상대를 돕는 자리(천을귀인·문창귀인)에 해당하는 글자는 없습니다.</p>
          ) : (
            <TableWrap>
              <table className="w-full text-sm min-w-[320px]">
                <tbody>
                  {guiin.map((g, i) => (
                    <tr key={i} className="border-t border-white/5 first:border-0">
                      <td className="py-2 pr-3 text-white/80">
                        {josa(g.giver, "이", "가")} {g.receiver}에게
                      </td>
                      <td className="py-2 text-white/65">
                        {GILSIN[g.name]}
                        <Jargon>
                          {g.name} · {POS[g.pos]} 자리 {g.branch}
                        </Jargon>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          )}
        </Card>
      </Section>

      <Section title="서양 별자리로 다시 보기" lede="사주와는 완전히 다른 방법이라, 두 방법이 같은 말을 하면 조금 더 믿을 만하고 다른 말을 하면 둘 다 가볍게 읽는 것이 좋습니다.">
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <ZodiacCard zodiac={zA} />
          <ZodiacCard zodiac={zB} />
        </div>
        <Card className="space-y-2">
          <p className="text-xs text-white/45">
            {a.name}: {a.sun.sign} {a.sun.degree}° · {SIGN_ELEMENT_PLAIN[a.sun.element]}
            <Jargon>{elName(a.sun.element)}</Jargon> · {SIGN_MODALITY_PLAIN[a.sun.modality]}
            <br />
            {b.name}: {b.sun.sign} {b.sun.degree}° · {SIGN_ELEMENT_PLAIN[b.sun.element]}
            <Jargon>{elName(b.sun.element)}</Jargon> · {SIGN_MODALITY_PLAIN[b.sun.modality]}
          </p>
          <p className="text-sm text-white/80 leading-relaxed">
            두 사람의 태양은 {sa.deg}° 떨어져 있습니다.
            {sa.aspect ? ` ${ASPECT_PLAIN[sa.aspect]}(${sa.aspect}) — 오차 ${sa.orb}°.` : " 뚜렷한 각도는 없습니다."}
          </p>
          <p className="flex gap-2 items-start text-sm text-white/70 leading-relaxed">
            <Badge tone={pair.twoSystems === "갈림" ? "warn" : pair.twoSystems.startsWith("겹침") ? "good" : "neutral"}>{TWO_SYSTEMS_PLAIN[pair.twoSystems]}</Badge>
            <span>{verdictText(pair.twoSystems, avg)}</span>
          </p>
          <p className="text-sm text-white/65 leading-relaxed">{result.zodiacCompat}</p>
        </Card>
      </Section>

      <Section title="올해와 내년의 흐름" lede="해마다 새로 들어오는 두 글자가 각자의 여덟 글자와 반응합니다.">
        <div className="grid sm:grid-cols-2 gap-4">
          {[a, b].map((p) => (
            <div key={p.name} className="space-y-3">
              <p className="text-sm font-medium text-amber-300">
                {p.name}
                {p.daewoon?.current && (
                  <span className="ml-2 text-xs text-white/50 font-normal">
                    지금의 10년: {SIPSIN_LUCK[p.daewoon.current.sipsinStem]}
                    <Jargon>{p.daewoon.current.ganzhi}</Jargon>
                  </span>
                )}
              </p>
              {p.seun.map((s) => (
                <SeunCard key={s.year} s={s} />
              ))}
            </div>
          ))}
        </div>
      </Section>

      <Glossary />
      <BasisFooter withScore />
    </div>
  );
}
