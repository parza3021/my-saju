import { CHEONGAN_HANJA, JIJI_HANJA } from "@/lib/engine/manseryeok";
import { BRANCH_EL, cgIndex, jjIndex, STEM_EL, Wuxing } from "@/lib/engine/relations";

/** 오행 색 (globals.css 의 CSS 변수) */
export const EL_VAR: Record<Wuxing, string> = {
  목: "var(--mok)",
  화: "var(--hwa)",
  토: "var(--to)",
  금: "var(--geum)",
  수: "var(--su)",
};

export const elTint = (el: Wuxing, pct = 16) => `color-mix(in srgb, ${EL_VAR[el]} ${pct}%, transparent)`;

export const stemElOf = (hangul: string): Wuxing => STEM_EL[cgIndex(hangul)];
export const branchElOf = (hangul: string): Wuxing => BRANCH_EL[jjIndex(hangul)];
export const stemHanja = (hangul: string): string => CHEONGAN_HANJA[cgIndex(hangul)];
export const branchHanja = (hangul: string): string => JIJI_HANJA[jjIndex(hangul)];
