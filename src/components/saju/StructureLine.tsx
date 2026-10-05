import { STRUCT_EL } from "@/lib/engine/plain";
import type { Structure } from "@/lib/engine/relations";
import { Badge, Jargon } from "./ui";

/** 세 글자가 모여 생기는 판(삼합·방합·삼형)을 배지 + 쉬운 말로 보여 준다 */
export default function StructureLine({
  s,
  lead = "",
  verb,
  whoLabel = "",
}: {
  s: Structure;
  lead?: string;
  verb: string;
  whoLabel?: string;
}) {
  return (
    <div className="flex gap-2 items-start">
      <Badge tone={s.kind === "삼형" ? "warn" : "good"}>{s.kind}</Badge>
      <p className="text-sm text-white/70 leading-relaxed">
        {lead}
        {s.el ? `${STRUCT_EL[s.el]} 팀` : "서로 긁는 세 글자"}
        {verb}
        <Jargon>
          {s.kind} {s.canon}
          {s.el && `(${s.el})`}
        </Jargon>
        <span className="block text-xs text-white/40">
          {whoLabel}
          {s.owners.map(([b, names]) => `${b}: ${names.join("·")}`).join(", ")}
        </span>
      </p>
    </div>
  );
}
