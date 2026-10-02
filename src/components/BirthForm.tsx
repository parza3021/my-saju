"use client";

import { useState } from "react";
import { BirthMember } from "@/lib/engine/natal";
import PersonBirthFields, { DEFAULT_PERSON, personFormToMember } from "./PersonBirthFields";

export default function BirthForm({ onSubmit }: { onSubmit: (input: BirthMember) => void }) {
  const [value, setValue] = useState(DEFAULT_PERSON);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const input = personFormToMember(value, "나");
    setError(input ? null : "생년월일을 올바르게 입력해주세요. (음력은 해당 해에 있는 달·일인지도 확인해주세요.)");
    if (input) onSubmit(input);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
      <PersonBirthFields value={value} onChange={setValue}>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-900 font-semibold py-3 transition-colors"
        >
          사주 풀이 보기
        </button>
      </PersonBirthFields>
    </form>
  );
}
