import { Wuxing } from "../types";

export interface WuxingContent {
  hanja: string;
  color: string;
  season: string;
  abundant: string;
  lacking: string;
}

export const WUXING_CONTENT: Record<Wuxing, WuxingContent> = {
  목: {
    hanja: "木",
    color: "청록색",
    season: "봄",
    abundant: "성장과 확장의 기운이 강해 추진력과 계획성이 돋보이지만, 지나치면 고집스러워질 수 있습니다.",
    lacking: "유연함과 성장 의지를 조금 더 의식적으로 챙기면 균형에 도움이 됩니다.",
  },
  화: {
    hanja: "火",
    color: "붉은색",
    season: "여름",
    abundant: "표현력과 열정이 넘쳐 활동적이고 사교적이지만, 감정 기복을 다스리는 것이 관건입니다.",
    lacking: "적극성과 자기 표현을 조금씩 늘려가면 대인관계에 도움이 됩니다.",
  },
  토: {
    hanja: "土",
    color: "황토색",
    season: "환절기",
    abundant: "안정감과 신뢰감이 강점이지만, 변화에 유연하게 대응하는 연습이 필요할 수 있습니다.",
    lacking: "꾸준함과 중심을 잡는 루틴을 만들면 안정감을 보완할 수 있습니다.",
  },
  금: {
    hanja: "金",
    color: "흰색",
    season: "가을",
    abundant: "결단력과 원칙이 뚜렷하지만, 너무 날카로워지지 않도록 유연함을 곁들이면 좋습니다.",
    lacking: "결단력과 마무리 짓는 힘을 의식적으로 키우면 도움이 됩니다.",
  },
  수: {
    hanja: "水",
    color: "검은색",
    season: "겨울",
    abundant: "지혜와 통찰이 뛰어나지만, 생각이 많아 실행이 늦어지지 않도록 주의가 필요합니다.",
    lacking: "정보를 모으고 차분히 성찰하는 시간을 늘리면 균형에 도움이 됩니다.",
  },
};
