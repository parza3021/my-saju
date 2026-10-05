import { STRUCT_EL } from "@/lib/engine/plain";
import { Badge, Jargon } from "./ui";

/** '삼합 해묘미(목) — 해:가/나, …' 꼴의 엔진 문장을 배지 + 쉬운 말로 보여 준다 */
export default function StructureLine({
  text,
  lead = "",
  verb,
  whoLabel = "",
}: {
  text: string;
  lead?: string;
  verb: string;
  whoLabel?: string;
}) {
  const [head, who] = text.split(" — ");
  const m = head.match(/^(삼합|방합|삼형) (\S+?)(?:\((.)\))?$/);
  return (
    <div className="flex gap-2 items-start">
      <Badge tone={m?.[1] === "삼형" ? "warn" : "good"}>{m?.[1]}</Badge>
      <p className="text-sm text-white/70 leading-relaxed">
        {lead}
        {m?.[3] ? `${STRUCT_EL[m[3]]} 팀` : "서로 긁는 세 글자"}
        {verb}
        <Jargon>{head}</Jargon>
        <span className="block text-xs text-white/40">
          {whoLabel}
          {who.replace(/\//g, "·")}
        </span>
      </p>
    </div>
  );
}
