import { signOf } from "@/lib/engine/astro";
import { PersonFacts } from "@/lib/engine/natal";
import { ASPECT_PLAIN, GILSIN, SIGN_ELEMENT_PLAIN, SINSAL, SINSAL_HANJA, SIPSIN_LUCK, STRUCT_EL } from "@/lib/engine/plain";
import { reactionText, reactionTone, DayView } from "@/lib/iljin";
import { Wuxing } from "@/lib/engine/relations";
import { Badge, Disclosure, Jargon, StarRating, TableWrap } from "./ui";
import ElementBalance from "./ElementBalance";
import EightCharGrid from "./EightCharGrid";

const TONE_BADGE = { good: "good", warn: "warn", mixed: "amber", neutral: "neutral" } as const;

function Structure({ text }: { text: string }) {
  const [head, who] = text.split(" — ");
  const m = head.match(/^(삼합|방합|삼형) (\S+?)(?:\((.)\))?$/);
  const kind = m?.[1] ?? "";
  const el = m?.[3];
  return (
    <div className="flex gap-2 items-start">
      <Badge tone={kind === "삼형" ? "warn" : "good"}>{kind}</Badge>
      <p className="text-sm text-white/70 leading-relaxed">
        오늘 글자가 들어와 {el ? `${STRUCT_EL[el]} 팀` : "서로 긁는 세 글자"}가 완성됩니다.
        <Jargon>{head}</Jargon>
        <span className="block text-xs text-white/40">가진 글자: {who}</span>
      </p>
    </div>
  );
}

export default function IljinPanel({
  view,
  person,
  supplement,
}: {
  view: DayView;
  person: PersonFacts;
  supplement: { element: Wuxing; color: string };
}) {
  const { facts, fortune, level } = view;
  const g = facts.ganzhi;
  const dayWord = view.isToday ? "오늘" : "이 날";
  const sk = facts.sky;
  const moonSign = signOf(sk.moon)[0];
  const sunSign = signOf(sk.sun)[0];

  return (
    <div className="rounded-2xl border border-amber-400/25 bg-amber-400/5 p-5 sm:p-6 space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs text-white/50">
            {facts.date.year}년 {facts.date.month}월 {facts.date.day}일 ({facts.date.weekday})
          </p>
          <p className="mt-1 text-2xl font-bold text-amber-300">
            {g.ganjiKr}일
            <span className="ml-2 text-lg text-white/40 font-normal">{g.ganjiHanja}</span>
          </p>
          <p className="mt-1 text-xs text-white/40">
            {facts.yearMonth.year}년 · {facts.yearMonth.month}월 흐름 · 다음 절기 {facts.nextTerm[0]}
          </p>
        </div>
        <div className="text-right">
          <Badge tone="info">{facts.sipsinToday[0]}의 날</Badge>
          <p className="mt-1 text-sm text-white/60">{fortune.keyword}</p>
          <div className="mt-1 flex items-center justify-end gap-2">
            <StarRating stars={facts.dayScore.stars} />
            <Badge tone={level === "순조" ? "good" : level === "주의" ? "warn" : "neutral"}>{level}</Badge>
          </div>
        </div>
      </div>

      <p className="text-sm text-white/80 leading-relaxed">{fortune.summary}</p>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-lg bg-white/5 border border-white/10 p-3">
          <p className="text-xs text-emerald-300 mb-1">이런 일에 좋은 날</p>
          <p className="text-sm text-white/70 leading-relaxed">{fortune.good}</p>
        </div>
        <div className="rounded-lg bg-white/5 border border-white/10 p-3">
          <p className="text-xs text-red-300 mb-1">이런 점은 주의</p>
          <p className="text-sm text-white/70 leading-relaxed">{fortune.caution}</p>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-medium text-white/50 mb-2">별점은 이렇게 나왔습니다</h3>
        <ul className="text-sm text-white/70 space-y-1">
          {facts.dayScore.why.map((w) => (
            <li key={w} className="flex gap-2">
              <span className="text-white/30">·</span>
              {w}
            </li>
          ))}
        </ul>
        <p className="text-xs text-white/35 mt-2">
          3점에서 시작해 {dayWord}의 글자가 나에게 어떤 사람(십신)인지, 내 여덟 글자와 부딪히거나 끌리는지를 더한 값입니다.
        </p>
      </div>

      <div>
        <h3 className="text-xs font-medium text-white/50 mb-2">{dayWord} 글자와 내 여덟 글자의 반응</h3>
        <EightCharGrid person={person} hits={facts.reactions} showUnseong={false} />
        <p className="text-xs text-white/35 mt-2">테두리가 쳐진 글자가 {dayWord}의 {g.cheongan}{g.jiji}와 반응한 글자입니다.</p>
        <div className="mt-3 space-y-2">
          {facts.reactions.length === 0 && (
            <p className="text-sm text-white/55">{dayWord}의 두 글자는 내 여덟 글자와 눈에 띄는 반응이 없는 무난한 날입니다.</p>
          )}
          {facts.reactions.map((r, i) => {
            const t = reactionText(r, g.cheongan, g.jiji);
            return (
              <div key={i} className="flex gap-2 items-start">
                <Badge tone={TONE_BADGE[reactionTone(r.rel)]}>{r.rel.map((x) => x.split("(")[0]).join("·")}</Badge>
                <p className="text-sm text-white/70 leading-relaxed">
                  {t.plain}
                  <Jargon>{t.tag}</Jargon>
                </p>
              </div>
            );
          })}
          {facts.structures.map((s) => (
            <Structure key={s} text={s} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-medium text-white/50 mb-3">오행이 이렇게 달라집니다</h3>
        <ElementBalance counts={person.ohaeng} report={facts.ohaeng} />
      </div>

      <dl className="grid sm:grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-white/5 border border-white/10 p-3">
          <dt className="text-xs text-white/45 mb-1">{dayWord}의 흐름</dt>
          <dd className="text-white/75">
            {SIPSIN_LUCK[facts.sipsinToday[0]]}
            <Jargon>{facts.sipsinToday[0]}</Jargon>
          </dd>
        </div>
        <div className="rounded-lg bg-white/5 border border-white/10 p-3">
          <dt className="text-xs text-white/45 mb-1">{dayWord}의 신살</dt>
          <dd className="text-white/75">
            {SINSAL[facts.sinsal]}
            <Jargon>
              {facts.sinsal} {SINSAL_HANJA[facts.sinsal]}
            </Jargon>
          </dd>
        </div>
        <div className="rounded-lg bg-white/5 border border-white/10 p-3">
          <dt className="text-xs text-white/45 mb-1">타고난 복과의 만남</dt>
          <dd className="text-white/75">
            {facts.gilsin.length ? (
              facts.gilsin.map((n) => (
                <span key={n} className="mr-2">
                  {GILSIN[n]}
                  <Jargon>{n}</Jargon>
                </span>
              ))
            ) : (
              "해당 없음"
            )}
          </dd>
        </div>
        <div className="rounded-lg bg-white/5 border border-white/10 p-3">
          <dt className="text-xs text-white/45 mb-1">보완하면 좋은 기운</dt>
          <dd className="text-amber-300 font-medium">
            {supplement.element} · {supplement.color}
          </dd>
        </div>
      </dl>

      <Disclosure summary="시간대별 흐름 (시진표)">
        <TableWrap>
          <table className="w-full text-sm min-w-[360px]">
            <thead>
              <tr className="text-left text-xs text-white/40">
                <th className="py-1 pr-3 font-normal">시진</th>
                <th className="py-1 pr-3 font-normal">시간</th>
                <th className="py-1 font-normal">그 시간의 간지</th>
              </tr>
            </thead>
            <tbody className="text-white/70">
              {facts.hours.map((h) => (
                <tr key={h.jiji} className="border-t border-white/5">
                  <td className="py-1 pr-3">{h.jiji}시</td>
                  <td className="py-1 pr-3 whitespace-nowrap">{h.kst}</td>
                  <td className="py-1">{h.pillar}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
        <p className="text-xs text-white/35 mt-2">한국 표준시보다 약 32분 늦은, 실제 해의 위치(동경 127°) 기준 시각입니다.</p>
      </Disclosure>

      <Disclosure summary="하늘의 모습 (태양·달과 내 별자리)">
        <div className="text-sm text-white/70 space-y-1.5 leading-relaxed">
          <p>
            {dayWord} 태양은 {sunSign}, 달은 {moonSign}에 있습니다.
            {sk.moonIngress && ` 달은 ${sk.moonIngress[0]}경 ${sk.moonIngress[1]}로 옮겨 갑니다.`}
          </p>
          <p>
            내 태양({person.sun.sign} {person.sun.degree}°)과 {dayWord}의 태양은 {sk.sunAspect.diff}° 떨어져 있어
            {sk.sunAspect.aspect
              ? ` ${ASPECT_PLAIN[sk.sunAspect.aspect]}(${sk.sunAspect.aspect})에 가깝습니다.`
              : " 뚜렷한 각도는 없습니다."}
          </p>
          {sk.moonEvents.map((e) => (
            <p key={e.aspect}>
              달이 내 태양과 {ASPECT_PLAIN[e.aspect]}({e.aspect})에 가까운 시간대: {e.from}~{e.to}
              {e.exact && ` (가장 가까운 때 ${e.exact} 무렵)`}
            </p>
          ))}
          <p className="text-xs text-white/35">
            나의 태양 별자리 기질: {SIGN_ELEMENT_PLAIN[person.sun.element]}({person.sun.element === "공기" ? "바람" : person.sun.element}). 달의 위치는 오차가 약 ±0.3°라 시각은 참고용입니다.
          </p>
        </div>
      </Disclosure>
    </div>
  );
}
