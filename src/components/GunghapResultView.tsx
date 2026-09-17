import { GunghapResult, RelationHit } from "@/lib/types";
import PillarTable from "./PillarTable";
import ZodiacCard from "./ZodiacCard";

const RELATION_BADGE: Record<RelationHit["polarity"], string> = {
  긍정: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  주의: "bg-red-500/20 text-red-300 border-red-500/30",
};

function RelationCard({ hit }: { hit: RelationHit }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <span className={`inline-block text-xs rounded-full border px-2 py-0.5 mb-2 ${RELATION_BADGE[hit.polarity]}`}>
        {hit.type}
      </span>
      <p className="text-sm text-white/70 leading-relaxed">{hit.description}</p>
    </div>
  );
}

export default function GunghapResultView({ result }: { result: GunghapResult }) {
  const { person1, person2, dayMasterRelation, branchRelations, zodiacCompat, summary } = result;
  const positiveHits = branchRelations.filter((r) => r.polarity === "긍정");
  const cautionHits = branchRelations.filter((r) => r.polarity === "주의");

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      <section>
        <h2 className="text-sm font-medium text-white/50 mb-3">두 사람의 사주팔자</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-medium text-amber-300 mb-4">{person1.name}</p>
            <PillarTable result={person1.saju} />
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-medium text-amber-300 mb-4">{person2.name}</p>
            <PillarTable result={person2.saju} />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium text-white/50 mb-3">총평</h2>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/80">
            사주 원국을 대조한 결과{" "}
            <span className="text-emerald-300 font-medium">긍정적인 결합 {summary.positives}건</span>,{" "}
            <span className="text-red-300 font-medium">주의가 필요한 결합 {summary.cautions}건</span>이 확인되었습니다.
            {summary.positives > summary.cautions
              ? " 전반적으로 서로를 편안하게 해주는 요소가 더 많은 궁합입니다."
              : summary.cautions > summary.positives
                ? " 서로 다른 점이 도드라지는 궁합이니, 아래 주의 항목을 참고해 대화로 맞춰가면 좋습니다."
                : " 좋은 점과 신경 쓸 점이 고르게 섞여 있는 궁합입니다."}
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium text-white/50 mb-3">일간(日干) 궁합</h2>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <span className="inline-block text-xs rounded-full border px-2 py-0.5 mb-2 bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
            {dayMasterRelation.type}
          </span>
          <p className="text-sm text-white/80 leading-relaxed">{dayMasterRelation.description}</p>
        </div>
      </section>

      {positiveHits.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-white/50 mb-3">지지(地支)에 나타난 긍정적 결합</h2>
          <div className="space-y-3">
            {positiveHits.map((hit, i) => (
              <RelationCard key={`pos-${i}`} hit={hit} />
            ))}
          </div>
        </section>
      )}

      {cautionHits.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-white/50 mb-3">지지(地支)에 나타난 주의할 결합</h2>
          <div className="space-y-3">
            {cautionHits.map((hit, i) => (
              <RelationCard key={`caution-${i}`} hit={hit} />
            ))}
          </div>
        </section>
      )}

      {branchRelations.length === 0 && (
        <section>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-white/60">
              두 분의 사주에는 지지 사이의 뚜렷한 합충형파 관계가 나타나지 않았습니다. 극단적으로 끌리거나 부딪히는
              요소가 적은, 무난하고 평탄한 궁합으로 볼 수 있습니다.
            </p>
          </div>
        </section>
      )}

      <section>
        <h2 className="text-sm font-medium text-white/50 mb-3">서양 별자리 궁합</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <ZodiacCard zodiac={person1.zodiac} />
          <ZodiacCard zodiac={person2.zodiac} />
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-white/80 leading-relaxed">{zodiacCompat}</p>
        </div>
      </section>
    </div>
  );
}
