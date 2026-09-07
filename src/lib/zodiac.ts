import { ZodiacResult } from "./types";

interface ZodiacDef {
  name: string;
  hanja: string;
  dateRange: string;
  element: string;
  keyword: string;
  description: string;
  start: [number, number]; // [month, day] inclusive start
  end: [number, number]; // [month, day] inclusive end
}

const ZODIACS: ZodiacDef[] = [
  {
    name: "물병자리",
    hanja: "水瓶座",
    dateRange: "1/20 ~ 2/18",
    element: "바람",
    keyword: "독창성과 자유",
    description: "독립적인 사고와 개혁적인 아이디어를 중시하며, 틀에 얽매이지 않는 자유로운 기질을 지닙니다.",
    start: [1, 20],
    end: [2, 18],
  },
  {
    name: "물고기자리",
    hanja: "雙魚座",
    dateRange: "2/19 ~ 3/20",
    element: "물",
    keyword: "감수성과 상상력",
    description: "풍부한 감수성과 공감 능력을 지녔으며, 예술적 상상력과 직관이 뛰어난 편입니다.",
    start: [2, 19],
    end: [3, 20],
  },
  {
    name: "양자리",
    hanja: "牡羊座",
    dateRange: "3/21 ~ 4/19",
    element: "불",
    keyword: "추진력과 열정",
    description: "망설임 없이 행동으로 옮기는 추진력이 강점이며, 새로운 도전을 즐기는 열정적인 성향입니다.",
    start: [3, 21],
    end: [4, 19],
  },
  {
    name: "황소자리",
    hanja: "金牛座",
    dateRange: "4/20 ~ 5/20",
    element: "흙",
    keyword: "안정과 끈기",
    description: "차분하고 꾸준한 태도로 목표를 이루어가며, 안정과 편안함을 중요하게 여깁니다.",
    start: [4, 20],
    end: [5, 20],
  },
  {
    name: "쌍둥이자리",
    hanja: "雙子座",
    dateRange: "5/21 ~ 6/21",
    element: "바람",
    keyword: "호기심과 소통",
    description: "다방면에 호기심이 많고 언변이 뛰어나며, 새로운 정보와 사람을 만나는 것을 즐깁니다.",
    start: [5, 21],
    end: [6, 21],
  },
  {
    name: "게자리",
    hanja: "巨蟹座",
    dateRange: "6/22 ~ 7/22",
    element: "물",
    keyword: "보호본능과 정서",
    description: "가족이나 가까운 사람을 세심하게 챙기는 보호 본능이 강하며, 정서적으로 깊은 유대를 중시합니다.",
    start: [6, 22],
    end: [7, 22],
  },
  {
    name: "사자자리",
    hanja: "獅子座",
    dateRange: "7/23 ~ 8/22",
    element: "불",
    keyword: "자신감과 존재감",
    description: "뚜렷한 존재감과 자신감으로 주변을 이끄는 리더십을 지녔으며, 인정받는 것을 중요하게 여깁니다.",
    start: [7, 23],
    end: [8, 22],
  },
  {
    name: "처녀자리",
    hanja: "處女座",
    dateRange: "8/23 ~ 9/22",
    element: "흙",
    keyword: "분석력과 완벽주의",
    description: "꼼꼼한 분석력과 높은 기준을 지녔으며, 맡은 일을 완벽하게 마무리하려는 성향이 강합니다.",
    start: [8, 23],
    end: [9, 22],
  },
  {
    name: "천칭자리",
    hanja: "天秤座",
    dateRange: "9/23 ~ 10/23",
    element: "바람",
    keyword: "균형과 조화",
    description: "관계 속의 균형과 조화를 중시하며, 공정하고 세련된 감각으로 사람들과 어울립니다.",
    start: [9, 23],
    end: [10, 23],
  },
  {
    name: "전갈자리",
    hanja: "天蠍座",
    dateRange: "10/24 ~ 11/22",
    element: "물",
    keyword: "집중력과 통찰",
    description: "한번 몰입하면 끝까지 파고드는 집중력과 날카로운 통찰력을 지녔으며, 감정이 깊고 진지합니다.",
    start: [10, 24],
    end: [11, 22],
  },
  {
    name: "사수자리",
    hanja: "人馬座",
    dateRange: "11/23 ~ 12/21",
    element: "불",
    keyword: "모험심과 낙천",
    description: "낙천적이고 자유로운 기질로 새로운 경험과 모험을 즐기며, 넓은 시야로 세상을 바라봅니다.",
    start: [11, 23],
    end: [12, 21],
  },
  {
    name: "염소자리",
    hanja: "山羊座",
    dateRange: "12/22 ~ 1/19",
    element: "흙",
    keyword: "책임감과 성실",
    description: "현실적이고 성실한 태도로 목표를 향해 꾸준히 나아가며, 책임감이 강하고 신중합니다.",
    start: [12, 22],
    end: [1, 19],
  },
];

function inRange(month: number, day: number, def: ZodiacDef): boolean {
  const [sm, sd] = def.start;
  const [em, ed] = def.end;
  if (sm === em) {
    return month === sm && day >= sd && day <= ed;
  }
  if (sm > em) {
    // wraps around new year (e.g. 염소자리: 12/22 ~ 1/19)
    return (month === sm && day >= sd) || (month === em && day <= ed);
  }
  if (month === sm) return day >= sd;
  if (month === em) return day <= ed;
  return month > sm && month < em;
}

export function getZodiac(month: number, day: number): ZodiacResult {
  const def = ZODIACS.find((z) => inRange(month, day, z));
  if (!def) throw new Error(`별자리를 찾을 수 없습니다: ${month}/${day}`);
  const { start: _start, end: _end, ...rest } = def;
  return rest;
}
