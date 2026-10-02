"use client";

import { useRef, useState } from "react";
import GunghapResultView from "@/components/GunghapResultView";
import PersonBirthFields, { DEFAULT_PERSON, personFormToMember } from "@/components/PersonBirthFields";
import SiteNav from "@/components/SiteNav";
import { RELATION_KINDS, RelationKind } from "@/lib/content/relationKind";
import { analyzeGunghap, GunghapResult } from "@/lib/gunghap";

export default function GunghapPage() {
  const [person1, setPerson1] = useState(DEFAULT_PERSON);
  const [person2, setPerson2] = useState(DEFAULT_PERSON);
  const [relationKind, setRelationKind] = useState<RelationKind>("연애");
  const [result, setResult] = useState<GunghapResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const m1 = personFormToMember(person1, "사람 1");
    const m2 = personFormToMember(person2, "사람 2");

    if (!m1 || !m2) {
      setError("두 분의 생년월일을 올바르게 입력해주세요. (음력은 해당 해에 있는 달·일인지도 확인해주세요.)");
      return;
    }

    try {
      const gunghap = analyzeGunghap(m1, m2, relationKind);
      setResult(gunghap);
      setError(null);
      requestAnimationFrame(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch {
      setError("입력하신 생년월일을 계산할 수 없습니다. 날짜를 다시 확인해주세요.");
      setResult(null);
    }
  }

  return (
    <main className="flex-1 px-4 py-16 sm:py-24">
      <SiteNav active="gunghap" />
      <div className="max-w-3xl mx-auto text-center mb-12">
        <p className="text-amber-400 text-sm font-medium tracking-wide mb-3">
          정통 명리학 × 서양 점성술
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          두 사람의 궁합, 사주와 별자리로 확인하세요
        </h1>
        <p className="text-white/60 leading-relaxed">
          두 분의 생년월일시를 입력하면 사주 원국의 합충형파 관계와 일간 궁합,
          서양 별자리 궁합까지 로그인 없이 바로 확인할 수 있습니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
        <fieldset>
          <legend className="text-sm font-medium text-white/50 mb-3">두 사람의 관계</legend>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {RELATION_KINDS.map((kind) => (
              <label
                key={kind.value}
                className={`cursor-pointer rounded-lg border px-3 py-3 text-center transition-colors ${
                  relationKind === kind.value
                    ? "border-amber-400 bg-amber-400/10 text-amber-300"
                    : "border-white/10 bg-white/5 text-white/70 hover:border-white/30"
                }`}
              >
                <input
                  type="radio"
                  name="relationKind"
                  value={kind.value}
                  checked={relationKind === kind.value}
                  onChange={() => setRelationKind(kind.value)}
                  className="sr-only"
                />
                <span className="block text-sm font-semibold">{kind.label}</span>
                <span className="block text-xs text-white/40 mt-1">{kind.hint}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid sm:grid-cols-2 gap-4">
          <PersonBirthFields
            title="사람 1"
            namePlaceholder="예: 민수"
            value={person1}
            onChange={setPerson1}
          />
          <PersonBirthFields
            title="사람 2"
            namePlaceholder="예: 지은"
            value={person2}
            onChange={setPerson2}
          />
        </div>

        {error && <p className="text-center text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          className="w-full rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-900 font-semibold py-3 transition-colors"
        >
          궁합 보기
        </button>
      </form>

      {result && (
        <div ref={resultRef} className="pt-16">
          <GunghapResultView result={result} />
        </div>
      )}

      <footer className="mt-24 text-center text-xs text-white/30">
        본 서비스의 풀이는 전통 명리학 및 서양 점성술 이론을 바탕으로 한 참고용 콘텐츠이며,
        의학적·법적·재정적 조언을 대체하지 않습니다.
      </footer>
    </main>
  );
}
