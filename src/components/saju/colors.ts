import { CHEONGAN_HANJA, CHEONGAN, JIJI, JIJI_HANJA } from "@/lib/engine/manseryeok";
import { BRANCH_EL, STEM_EL, Wuxing } from "@/lib/engine/relations";

/** 오행 색 (globals.css 의 CSS 변수) */
export const EL_VAR: Record<Wuxing, string> = {
  목: "var(--mok)",
  화: "var(--hwa)",
  토: "var(--to)",
  금: "var(--geum)",
  수: "var(--su)",
};

export const elTint = (el: Wuxing, pct = 16) => `color-mix(in srgb, ${EL_VAR[el]} ${pct}%, transparent)`;

export const stemElOf = (hangul: string): Wuxing => STEM_EL[CHEONGAN.indexOf(hangul as (typeof CHEONGAN)[number])];
export const branchElOf = (hangul: string): Wuxing => BRANCH_EL[JIJI.indexOf(hangul as (typeof JIJI)[number])];
export const stemHanja = (hangul: string): string => CHEONGAN_HANJA[CHEONGAN.indexOf(hangul as (typeof CHEONGAN)[number])];
export const branchHanja = (hangul: string): string => JIJI_HANJA[JIJI.indexOf(hangul as (typeof JIJI)[number])];
