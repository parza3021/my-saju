import { PersonFacts, SeunFact, SeunItem } from "@/lib/engine/natal";
import { POS, relPlain, relTag, SINSAL, SINSAL_HANJA, SIPSIN_LUCK } from "@/lib/engine/plain";
import { gwa, type PosKo } from "@/lib/engine/relations";
import { stemHanja, branchHanja } from "./colors";
import { Badge, Jargon, TableWrap } from "./ui";

function seunItemText(it: SeunItem): { plain: string; tag: string } {
  const where = POS[it.pos as PosKo];
  const part = it.kind === "cg" ? "윗글자" : "아랫글자";
  const rel = it.rel.filter((r) => r !== "복음");
  const tag =
    it.kind === "cg"
      ? `${it.a}${it.b}${it.rel[0] === "천간합" ? "합" : "충"}`
      : it.rel[0] === "복음" && rel.length === 0
        ? "복음"
        : relTag(it.a, it.b, rel);
  const text = it.rel[0] === "복음" && rel.length === 0 ? "같은 기운이 겹침" : relPlain(it.rel);
  return { plain: `${where}의 ${part}(${it.b})${gwa(it.b)} ${text}`, tag };
}

export function SeunCard({ s }: { s: SeunFact }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-baseline justify-between">
        <h4 className="font-semibold text-white">{s.year}년</h4>
        <span className="text-amber-300">
          {s.ganzhi}
          <span className="text-white/35 text-xs ml-1">
            {stemHanja(s.ganzhi[0])}
            {branchHanja(s.ganzhi[1])}
          </span>
        </span>
      </div>
      <p className="mt-2 text-sm text-white/70">
        늘어나는 것: {SIPSIN_LUCK[s.sipsin]}
        <Jargon>{s.sipsin}</Jargon>
      </p>
      <p className="text-sm text-white/70">
        그해의 성격: {SINSAL[s.sinsal]}
        <Jargon>
          {s.sinsal} {SINSAL_HANJA[s.sinsal]}
        </Jargon>
      </p>
      {s.items.length > 0 ? (
        <ul className="mt-2 space-y-1">
          {s.items.map((it, i) => {
            const t = seunItemText(it);
            return (
              <li key={i} className="text-xs text-white/55 leading-relaxed">
                · {t.plain}
                <Jargon>{t.tag}</Jargon>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-white/40">내 여덟 글자와 눈에 띄는 반응은 없습니다.</p>
      )}
    </div>
  );
}

/** 10년 단위 대운 8칸 + 올해·내년 세운 */
export default function LuckTimeline({ person }: { person: PersonFacts }) {
  const dw = person.daewoon;
  return (
    <div className="space-y-5">
      {dw ? (
        <div>
          <p className="text-sm text-white/65 mb-3">
            {dw.direction}으로 흐르는 대운이며 {dw.start}세 무렵부터 시작합니다. 올해 기준 {dw.ageNow}세(햇수)입니다.
          </p>
          <TableWrap>
            <div className="grid grid-flow-col auto-cols-[minmax(92px,1fr)] gap-2 min-w-[360px]">
              {dw.steps.map((s) => {
                const cur = dw.current?.fromAge === s.fromAge;
                return (
                  <div
                    key={s.fromAge}
                    className={`rounded-xl border p-2.5 text-center ${cur ? "border-amber-400/60 bg-amber-400/10" : "border-white/10 bg-white/5"}`}
                  >
                    <p className="text-[11px] text-white/45">
                      {s.fromAge}~{s.toAge}세
                    </p>
                    <p className="mt-1 text-lg font-bold text-white">{s.ganzhi}</p>
                    <p className="text-[11px] text-white/35">
                      {stemHanja(s.ganzhi[0])}
                      {branchHanja(s.ganzhi[1])}
                    </p>
                    <p className="mt-1 text-[11px] text-amber-300/80 leading-tight">{SIPSIN_LUCK[s.sipsinStem]}</p>
                    {cur && <Badge tone="amber">지금</Badge>}
                  </div>
                );
              })}
            </div>
          </TableWrap>
          <p className="text-xs text-white/35 mt-2">칸 아래 글은 그 10년 동안 윗글자로 들어오는 기운입니다(십신 기준).</p>
        </div>
      ) : (
        <p className="text-sm text-white/55">성별을 선택하지 않아 대운은 계산하지 않았습니다. 성별을 선택하면 10년 단위의 큰 흐름을 볼 수 있습니다.</p>
      )}
      <div className="grid sm:grid-cols-2 gap-3">
        {person.seun.map((s) => (
          <SeunCard key={s.year} s={s} />
        ))}
      </div>
    </div>
  );
}

