import { BranchInfo, StemInfo, Wuxing } from "./types";

const STEMS: Record<string, StemInfo> = {
  "갑": { hanja: "甲", hangul: "갑", wuxing: "목", yinYang: "양" },
  "을": { hanja: "乙", hangul: "을", wuxing: "목", yinYang: "음" },
  "병": { hanja: "丙", hangul: "병", wuxing: "화", yinYang: "양" },
  "정": { hanja: "丁", hangul: "정", wuxing: "화", yinYang: "음" },
  "무": { hanja: "戊", hangul: "무", wuxing: "토", yinYang: "양" },
  "기": { hanja: "己", hangul: "기", wuxing: "토", yinYang: "음" },
  "경": { hanja: "庚", hangul: "경", wuxing: "금", yinYang: "양" },
  "신": { hanja: "辛", hangul: "신", wuxing: "금", yinYang: "음" },
  "임": { hanja: "壬", hangul: "임", wuxing: "수", yinYang: "양" },
  "계": { hanja: "癸", hangul: "계", wuxing: "수", yinYang: "음" },
};

const BRANCHES: Record<string, BranchInfo> = {
  "자": { hanja: "子", hangul: "자", wuxing: "수", yinYang: "양", animal: "쥐" },
  "축": { hanja: "丑", hangul: "축", wuxing: "토", yinYang: "음", animal: "소" },
  "인": { hanja: "寅", hangul: "인", wuxing: "목", yinYang: "양", animal: "호랑이" },
  "묘": { hanja: "卯", hangul: "묘", wuxing: "목", yinYang: "음", animal: "토끼" },
  "진": { hanja: "辰", hangul: "진", wuxing: "토", yinYang: "양", animal: "용" },
  "사": { hanja: "巳", hangul: "사", wuxing: "화", yinYang: "음", animal: "뱀" },
  "오": { hanja: "午", hangul: "오", wuxing: "화", yinYang: "양", animal: "말" },
  "미": { hanja: "未", hangul: "미", wuxing: "토", yinYang: "음", animal: "양" },
  "신": { hanja: "申", hangul: "신", wuxing: "금", yinYang: "양", animal: "원숭이" },
  "유": { hanja: "酉", hangul: "유", wuxing: "금", yinYang: "음", animal: "닭" },
  "술": { hanja: "戌", hangul: "술", wuxing: "토", yinYang: "양", animal: "개" },
  "해": { hanja: "亥", hangul: "해", wuxing: "수", yinYang: "음", animal: "돼지" },
};

const STEM_BY_HANJA: Record<string, StemInfo> = Object.fromEntries(
  Object.values(STEMS).map((s) => [s.hanja, s])
);

const BRANCH_BY_HANJA: Record<string, BranchInfo> = Object.fromEntries(
  Object.values(BRANCHES).map((b) => [b.hanja, b])
);

const SHI_SHEN_KR: Record<string, string> = {
  "比肩": "비견",
  "劫财": "겁재",
  "劫財": "겁재",
  "食神": "식신",
  "伤官": "상관",
  "傷官": "상관",
  "偏财": "편재",
  "偏財": "편재",
  "正财": "정재",
  "正財": "정재",
  "七杀": "편관",
  "七殺": "편관",
  "正官": "정관",
  "偏印": "편인",
  "正印": "정인",
};

export function stemByHanja(hanja: string): StemInfo {
  const info = STEM_BY_HANJA[hanja];
  if (!info) throw new Error(`알 수 없는 천간: ${hanja}`);
  return info;
}

export function branchByHanja(hanja: string): BranchInfo {
  const info = BRANCH_BY_HANJA[hanja];
  if (!info) throw new Error(`알 수 없는 지지: ${hanja}`);
  return info;
}

export function shiShenToKr(hanja: string): string {
  return SHI_SHEN_KR[hanja] ?? hanja;
}

export const WUXING_LIST: Wuxing[] = ["목", "화", "토", "금", "수"];

export const WUXING_GENERATES: Record<Wuxing, Wuxing> = {
  목: "화",
  화: "토",
  토: "금",
  금: "수",
  수: "목",
};

export const WUXING_OVERCOMES: Record<Wuxing, Wuxing> = {
  목: "토",
  토: "수",
  수: "화",
  화: "금",
  금: "목",
};

export function getShiShen(dayMaster: StemInfo, target: StemInfo): string {
  const samePolarity = dayMaster.yinYang === target.yinYang;
  if (dayMaster.wuxing === target.wuxing) return samePolarity ? "비견" : "겁재";
  if (WUXING_GENERATES[dayMaster.wuxing] === target.wuxing) return samePolarity ? "식신" : "상관";
  if (WUXING_OVERCOMES[dayMaster.wuxing] === target.wuxing) return samePolarity ? "편재" : "정재";
  if (WUXING_OVERCOMES[target.wuxing] === dayMaster.wuxing) return samePolarity ? "편관" : "정관";
  return samePolarity ? "편인" : "정인";
}
