// 용어 풀이 — render_report.py 의 glossary() 이식. 화면 맨 아래에 접어 둔다.
import { GILSIN, OHAENG, SINSAL, SINSAL_HANJA, SIPSIN_LUCK, SIPSIN_PERSON } from "./plain";
import type { Sipsin } from "./relations";

export function glossaryRows(): [string, string][] {
  const rows: [string, string][] = [
    ["일간(日干)", "태어난 날 칸의 윗글자. 그 사람 자신"],
    ["오행(五行)", `목·화·토·금·수 다섯 가지 기운 — ${Object.entries(OHAENG).map(([k, v]) => `${k} ${v}`).join(" / ")}`],
  ];
  for (const k of Object.keys(SIPSIN_PERSON) as Sipsin[]) {
    rows.push([k, `관계에서: ${SIPSIN_PERSON[k]} / 운에서: ${SIPSIN_LUCK[k]}`]);
  }
  rows.push(
    ["육합·반합·삼합·방합", "글자끼리 끌려 묶이거나 한 팀이 되는 조합"],
    ["충(沖)", "정면으로 부딪히는 조합"],
    ["형(刑)", "서로 긁는 조합"],
    ["파(破)", "틈이 생기는 조합"],
    ["해(害)", "은근히 어긋나는 조합"],
    ["원진(怨嗔)", "이유 없이 서운해지는 조합"],
    ["자형(自刑)", "같은 글자끼리 예민해지는 조합"],
    ["천간합·천간충", "윗글자끼리 끌림·부딪힘"],
    ["복음(伏吟)", "그날·그해 글자가 내 글자와 같아 기운이 겹침"]
  );
  for (const [k, v] of Object.entries(GILSIN)) rows.push([k, v]);
  for (const [k, v] of Object.entries(SINSAL)) rows.push([`${k}(${SINSAL_HANJA[k as keyof typeof SINSAL_HANJA]})`, v]);
  rows.push(
    ["십이운성", "일간이 각 자리에서 얼마나 힘을 받는지 나타내는 열두 단계(장생·목욕·관대·건록·제왕·쇠·병·사·묘·절·태·양)"],
    ["대운(大運)", "10년 단위로 바뀌는 큰 흐름"],
    ["세운(歲運)", "그해의 흐름"],
    ["경도 보정", "한국 시계는 실제 해의 위치보다 약 30분 빠르므로, 태어난 시각에서 약 32분을 빼서 계산"],
    ["정자시 통합", "밤 11시 30분 무렵부터는 다음 날로 보고 계산하는 방식"]
  );
  return rows;
}
