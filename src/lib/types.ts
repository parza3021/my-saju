export type Wuxing = "목" | "화" | "토" | "금" | "수";
export type YinYang = "양" | "음";

export interface StemInfo {
  hanja: string;
  hangul: string;
  wuxing: Wuxing;
  yinYang: YinYang;
}

export interface BranchInfo {
  hanja: string;
  hangul: string;
  wuxing: Wuxing;
  yinYang: YinYang;
  animal: string;
}

export interface Pillar {
  label: "년주" | "월주" | "일주" | "시주";
  gan: StemInfo;
  zhi: BranchInfo;
  shiShen: string | null;
}

export interface SajuResult {
  solarBirth: { year: number; month: number; day: number; hour: number; minute: number };
  timeKnown: boolean;
  year: Pillar;
  month: Pillar;
  day: Pillar;
  time: Pillar | null;
  dayMaster: StemInfo;
  wuxingCount: Record<Wuxing, number>;
}

export interface ZodiacResult {
  name: string;
  hanja: string;
  dateRange: string;
  element: string;
  keyword: string;
  description: string;
}

export interface BirthInput {
  calendarType: "solar" | "lunar";
  year: number;
  month: number;
  day: number;
  isLeapMonth: boolean;
  hour: number | null;
  minute: number;
}
