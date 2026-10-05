import { PersonFacts } from "@/lib/engine/natal";
import { GILSIN, POS, POS_LONG, relPlain, relTag, relTone, SINSAL, SINSAL_HANJA } from "@/lib/engine/plain";
import { PILLAR_KO, PILLAR_ORDER, PosKo, Sinsal } from "@/lib/engine/relations";
import { Badge, Jargon } from "./ui";

/** 원국 안의 끌림·부딪힘, 자리마다 타고난 기운(신살), 타고난 복(길신) */
export default function NatalDetails({ person }: { person: PersonFacts }) {
  const inner = [...person.internalHits].sort((a, b) => Number(b.rel.includes("충")) - Number(a.rel.includes("충")));

  return (
    <dl className="space-y-5 text-sm">
      <div>
        <dt className="text-xs font-medium text-white/50 mb-2">안에서 끌리고 부딪히는 곳</dt>
        <dd className="space-y-2">
          {inner.length === 0 && <p className="text-white/55">여덟 글자 사이에 크게 부딪히거나 묶이는 곳이 없습니다.</p>}
          {inner.map((h, i) => (
            <div key={i} className="flex gap-2 items-start">
              <Badge tone={relTone(h.rel)}>{h.rel.map((x) => x.split("(")[0]).join("·")}</Badge>
              <p className="text-white/70 leading-relaxed">
                {POS[PILLAR_KO[h.k1]]}({h.b1})과 {POS[PILLAR_KO[h.k2]]}({h.b2}): {relPlain(h.rel)}
                <Jargon>{relTag(h.b1, h.b2, h.rel)}</Jargon>
              </p>
            </div>
          ))}
        </dd>
      </div>

      <div>
        <dt className="text-xs font-medium text-white/50 mb-2">자리마다 타고난 기운 (태어난 해의 띠 기준)</dt>
        <dd className="grid sm:grid-cols-2 gap-2">
          {PILLAR_ORDER.filter((k) => person.pillars[k]).map((k) => {
            const s = person.natalSinsal[PILLAR_KO[k]] as Sinsal;
            return (
              <div key={k} className="rounded-lg bg-white/5 border border-white/10 px-3 py-2">
                <span className="text-xs text-white/40">
                  {POS_LONG[PILLAR_KO[k]][0]} · {POS[PILLAR_KO[k]]}
                </span>
                <p className="text-white/80">
                  {SINSAL[s]}
                  <Jargon>
                    {s} {SINSAL_HANJA[s]}
                  </Jargon>
                </p>
              </div>
            );
          })}
        </dd>
      </div>

      <div>
        <dt className="text-xs font-medium text-white/50 mb-2">타고난 복</dt>
        <dd className="space-y-1.5">
          {person.gilsin.length === 0 && (
            <p className="text-white/55">여덟 글자 안에는 없습니다. 다른 사람에게서 받는 복은 궁합에서 볼 수 있습니다.</p>
          )}
          {person.gilsin.map((g) => {
            const [pos, , name] = g.split(" ");
            return (
              <p key={g} className="text-white/75">
                {GILSIN[name]}
                <Jargon>{name}</Jargon> — {POS[pos[0] as PosKo]} 자리
              </p>
            );
          })}
        </dd>
      </div>
    </dl>
  );
}

