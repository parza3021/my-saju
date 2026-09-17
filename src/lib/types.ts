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

export interface IljinFortune {
  keyword: string;
  summary: string;
  good: string;
  caution: string;
}

export interface DailyRelationNote {
  type: "육합" | "충" | "원진";
  polarity: "긍정" | "주의";
  description: string;
}

export interface IljinResult {
  date: { year: number; month: number; day: number; weekday: string; isToday: boolean };
  gan: StemInfo;
  zhi: BranchInfo;
  shiShen: string;
  fortune: IljinFortune;
  relations: DailyRelationNote[];
  elementNote: string;
  level: "순조" | "보통" | "주의";
}

export interface WeekSummary {
  counts: Record<IljinResult["level"], number>;
  toneTitle: string;
  toneDescription: string;
  best: IljinResult | null;
  worst: IljinResult | null;
}

export type BranchRelationType = "육합" | "삼합" | "반합" | "충" | "삼형" | "자형" | "형" | "원진";

export interface BranchRef {
  person: 1 | 2;
  pillarLabel: Pillar["label"];
  branch: BranchInfo;
}

export interface RelationHit {
  type: BranchRelationType;
  polarity: "긍정" | "주의";
  branches: BranchRef[];
  description: string;
}

export interface DayMasterRelation {
  type: "상생" | "상극" | "비화";
  description: string;
}

export interface GunghapResult {
  person1: { name: string; saju: SajuResult; zodiac: ZodiacResult };
  person2: { name: string; saju: SajuResult; zodiac: ZodiacResult };
  dayMasterRelation: DayMasterRelation;
  branchRelations: RelationHit[];
  zodiacCompat: string;
}
