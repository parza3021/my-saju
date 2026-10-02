// 콘텐츠(풀이 문구)와 화면이 함께 쓰는 단순 타입. 계산용 타입은 src/lib/engine/ 에 있다.

export type Wuxing = "목" | "화" | "토" | "금" | "수";

export interface ZodiacResult {
  name: string;
  hanja: string;
  dateRange: string;
  element: string;
  keyword: string;
  description: string;
}

export interface IljinFortune {
  keyword: string;
  summary: string;
  good: string;
  caution: string;
}
