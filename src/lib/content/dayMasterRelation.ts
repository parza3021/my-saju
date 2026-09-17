import { WUXING_GENERATES as GENERATES, WUXING_OVERCOMES as OVERCOMES } from "../ganzhi";
import { Wuxing } from "../types";

export function describeDayMasterRelation(
  elem1: Wuxing,
  elem2: Wuxing,
  name1: string,
  name2: string
): { type: "상생" | "상극" | "비화"; description: string } {
  if (elem1 === elem2) {
    return {
      type: "비화",
      description: `두 분 모두 ${elem1} 기운의 일간으로, 성향과 삶의 리듬이 비슷해 편안하게 통하는 사이입니다. 다만 같은 강점과 약점을 공유하는 만큼, 같은 지점에서 함께 부딪히거나 고집이 겹칠 수 있어 그 부분만 서로 배려하면 좋습니다.`,
    };
  }
  if (GENERATES[elem1] === elem2) {
    return {
      type: "상생",
      description: `${name1}님의 ${elem1} 기운이 ${name2}님의 ${elem2} 기운을 북돋아주는 관계입니다. ${name1}님이 ${name2}님을 이끌고 챙겨주는 흐름이 자연스럽게 만들어지는 궁합입니다.`,
    };
  }
  if (GENERATES[elem2] === elem1) {
    return {
      type: "상생",
      description: `${name2}님의 ${elem2} 기운이 ${name1}님의 ${elem1} 기운을 북돋아주는 관계입니다. ${name2}님이 ${name1}님을 이끌고 챙겨주는 흐름이 자연스럽게 만들어지는 궁합입니다.`,
    };
  }
  if (OVERCOMES[elem1] === elem2) {
    return {
      type: "상극",
      description: `${name1}님의 ${elem1} 기운이 ${name2}님의 ${elem2} 기운을 제어하는 관계입니다. ${name1}님이 다소 주도권을 쥐기 쉬운 구도라, 서로의 방식을 존중하려는 노력이 있으면 오히려 서로를 성장시키는 자극이 될 수 있습니다.`,
    };
  }
  return {
    type: "상극",
    description: `${name2}님의 ${elem2} 기운이 ${name1}님의 ${elem1} 기운을 제어하는 관계입니다. ${name2}님이 다소 주도권을 쥐기 쉬운 구도라, 서로의 방식을 존중하려는 노력이 있으면 오히려 서로를 성장시키는 자극이 될 수 있습니다.`,
  };
}
