// 사주 용어를 처음 보는 사람도 읽을 수 있는 말로 바꾸는 사전 — saju-iljin-doc/scripts/plain.py 이식.
// 원칙: 화면에는 쉬운 말을 먼저 쓰고, 전문 용어는 괄호나 작은 글씨로만 둔다.

import type { PosKo, Sipsin, Sinsal } from "./relations";

export type { PosKo };

// 위치(기둥)
export const POS: Record<PosKo, string> = { 년: "배경", 월: "일하는 방식", 일: "일상", 시: "사적인 시간" };
export const POS_LONG: Record<PosKo, [string, string]> = {
  년: ["태어난 해", "뿌리·배경. 집안 분위기와 어린 시절"],
  월: ["태어난 달", "사회생활. 일하는 방식과 바깥에서의 모습"],
  일: ["태어난 날", "나 자신. 윗글자가 '나', 아랫글자는 가장 가까운 일상"],
  시: ["태어난 시각", "사적인 시간. 속마음, 늦은 시간, 앞으로의 모습"],
};

// 오행
export const OHAENG: Record<string, string> = { 목: "시작·성장", 화: "표현·열정", 토: "중재·안정", 금: "결단·정리", 수: "생각·휴식" };
export const OHAENG_HANJA: Record<string, string> = { 목: "木", 화: "火", 토: "土", 금: "金", 수: "水" };

// 일간 비유
export const ILGAN_IMAGE: Record<string, string> = {
  갑: "큰 나무", 을: "풀과 덩굴", 병: "태양", 정: "촛불", 무: "큰 산", 기: "논밭", 경: "바위·원석", 신: "다듬은 보석", 임: "큰 강", 계: "비와 이슬",
};

// 관계에서의 십신: "X가 볼 때 Y는 ○○인 사람"
export const SIPSIN_PERSON: Record<Sipsin, string> = {
  비견: "나란히 걷는 친구",
  겁재: "같은 것을 두고 겨루는 라이벌",
  식신: "편하게 속마음이 나오는 사람",
  상관: "나도 모르게 말이 앞서는 사람",
  편재: "부담 없이 대하게 되는 사람",
  정재: "꼼꼼하게 챙기게 되는 사람",
  편관: "괜히 긴장되는 사람",
  정관: "나를 바르게 이끌어 주는 사람",
  편인: "색다른 시각을 주는 사람",
  정인: "든든하게 챙겨 주는 사람",
};
// 운(대운·세운·일진)에서의 십신: "그 시기에 늘어나는 것"
export const SIPSIN_LUCK: Record<Sipsin, string> = {
  비견: "스스로 서려는 힘",
  겁재: "경쟁과 비교",
  식신: "즐기고 만들어 내는 일",
  상관: "표현하고 바꾸고 싶은 마음",
  편재: "넓은 활동 무대와 돈의 흐름",
  정재: "차곡차곡 쌓고 관리하는 일",
  편관: "책임과 압박",
  정관: "인정과 자리",
  편인: "새로운 공부와 생각",
  정인: "도움과 배움",
};

// 지지·천간 관계
export const REL: Record<string, string> = {
  육합: "서로 끌려 묶임",
  반합: "같은 편이 됨",
  충: "정면으로 부딪힘",
  형: "서로 긁힘",
  파: "틈이 생김",
  해: "은근히 어긋남",
  원진: "이유 없이 서운함",
  자형: "같은 글자라 예민해짐",
  동일: "같은 글자",
  천간합: "마음이 끌림",
  천간충: "생각이 부딪힘",
  복음: "같은 기운이 겹침",
};
export const REL_ORDER = ["충", "천간충", "육합", "천간합", "반합", "형", "원진", "파", "해", "자형", "복음", "동일"];

// 십이신살
export const SINSAL: Record<Sinsal, string> = {
  겁살: "갑작스러운 변화",
  재살: "묶이고 갇힘",
  천살: "내 힘 밖의 일",
  지살: "출발과 이동",
  도화: "사람을 끄는 매력",
  월살: "막히고 메마름",
  망신: "드러나고 노출됨",
  장성: "앞장서는 힘",
  반안: "안정과 자리 잡음",
  역마: "멀리 움직임",
  육해: "조금씩 새는 기운",
  화개: "혼자 깊이 파고듦",
};
export const SINSAL_HANJA: Record<Sinsal, string> = {
  겁살: "劫煞", 재살: "災煞", 천살: "天煞", 지살: "地煞", 도화: "桃花", 월살: "月煞",
  망신: "亡身", 장성: "將星", 반안: "攀鞍", 역마: "驛馬", 육해: "六害", 화개: "華蓋",
};

// 길신
export const GILSIN: Record<string, string> = {
  천을귀인: "돕는 사람이 나타나는 복",
  문창귀인: "배움과 글재주",
  양인: "밀어붙이는 힘",
  홍염: "은근한 매력",
};

// 별점
export const STARS: Record<number, string> = {
  5: "아주 편함",
  4: "편함",
  3: "무난함",
  2: "신경 쓰임",
  1: "조심해서 다가갈 관계",
};

// 별자리 (쉬운 말)
export const SIGN_ELEMENT_PLAIN: Record<string, string> = { 공기: "생각·말", 불: "열정·추진", 흙: "현실·실무", 물: "감정·공감" };
export const SIGN_MODALITY_PLAIN: Record<string, string> = {
  활동궁: "먼저 시작하는 유형",
  고정궁: "지키고 이어 가는 유형",
  변통궁: "상황에 맞춰 바꾸는 유형",
};
export const ASPECT_PLAIN: Record<string, string> = {
  합: "같은 자리",
  육각: "편하게 통하는 각도",
  사각: "부딪히는 각도",
  삼각: "잘 맞는 각도",
  대립: "마주 보는 각도",
};
export const TWO_SYSTEMS_PLAIN: Record<string, string> = {
  "겹침(좋음)": "둘 다 좋게 봄",
  "겹침(긴장)": "둘 다 긴장으로 봄",
  갈림: "두 방법의 의견이 다름",
  보류: "판단 보류",
  "보류(합)": "판단 보류",
  "해당 없음(주요 각 없음)": "별자리는 말하지 않음",
};
export const STRUCT_EL: Record<string, string> = {
  목: "키우고 넓히는",
  화: "드러내고 달아오르는",
  토: "묶어 두는",
  금: "정리하고 결정하는",
  수: "모이고 머무는",
};

/** 별자리 원소 표기 — 엔진의 '공기'를 화면에서는 '바람'으로 */
export const elKo = (el: string) => (el === "공기" ? "바람" : el);

/** 관계 목록의 성격: 끌림(good) · 부딪힘(warn) · 둘 다(mixed) · 그 외(neutral) */
export function relTone(rel: string[]): "good" | "warn" | "mixed" | "neutral" {
  const names = rel.map((r) => r.split("(")[0]);
  const g = names.some((n) => ["육합", "천간합", "반합"].includes(n));
  const w = names.some((n) => ["충", "천간충", "형", "파", "해", "원진", "자형"].includes(n));
  return g && w ? "mixed" : g ? "good" : w ? "warn" : "neutral";
}

/** ['육합(수)', '형', '파'] → '서로 끌려 묶임, 서로 긁힘, 틈이 생김' */
export function relPlain(relList: string[]): string {
  let names = relList.filter((r) => r !== "동일").map((r) => r.split("(")[0]);
  if (!names.length) names = ["동일"];
  names = [...new Set(names)].sort((a, b) => orderOf(a) - orderOf(b));
  return names.map((n) => REL[n]).join(", ");
}

function orderOf(n: string): number {
  const i = REL_ORDER.indexOf(n);
  return i === -1 ? 99 : i;
}

/** 괄호 안에 넣을 전문 표기: 사해충, 신사 합·형·파, 신해 해 */
export function relTag(a: string, b: string, relList: string[]): string {
  const names = [...new Set(relList.filter((r) => r !== "동일").map((r) => r.split("(")[0]))];
  const short: Record<string, string> = { 육합: "합", 반합: "반합", 충: "충", 형: "형", 파: "파", 해: "해", 원진: "원진", 자형: "자형" };
  const parts = names.map((n) => short[n] ?? n);
  if (parts.length === 1 && parts[0] === "충") return `${a}${b}충`;
  return `${a}${b} ${parts.join("·")}`;
}
