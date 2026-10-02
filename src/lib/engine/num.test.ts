import { describe, expect, it } from "vitest";
import { pyRound } from "./num";

describe("pyRound — 파이썬 round 와 같은 반올림", () => {
  it("이진 근사값이 반 아래인 경우 내림 (159.85 → 159.8)", () => {
    expect(pyRound(159.85, 1)).toBe(159.8);
  });
  it("정확히 반인 값은 짝수 쪽으로 (0.25 → 0.2, 0.75 → 0.8, 2.5 → 2)", () => {
    expect(pyRound(0.25, 1)).toBe(0.2);
    expect(pyRound(0.75, 1)).toBe(0.8);
    expect(pyRound(2.5)).toBe(2);
    expect(pyRound(3.5)).toBe(4);
  });
  it("일반 값", () => {
    expect(pyRound(323.3449, 2)).toBe(323.34);
    expect(pyRound(3.1259, 2)).toBe(3.13);
    expect(pyRound(-1.26, 1)).toBe(-1.3);
  });
});
