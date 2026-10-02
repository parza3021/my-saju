// 파이썬 round(x, nd) 와 같은 반올림.
//  - 이진 부동소수 값의 실제 크기를 기준으로 가장 가까운 자리로 (toFixed 는 정확한 값으로 반올림한다)
//  - 정확히 반의 중간이면 짝수 쪽으로 (round-half-even)
export function pyRound(x: number, nd = 0): number {
  const s = x.toFixed(nd + 30);
  const dot = s.indexOf(".");
  const tail = s.slice(dot + 1 + nd); // nd 자리 뒤의 나머지 자릿수
  if (/^50*$/.test(tail)) {
    const kept = s.slice(0, dot + 1 + nd).replace(/\.$/, "");
    const lastDigit = Number(kept.replace(".", "").slice(-1)) % 2; // 마지막으로 남기는 자리의 홀짝
    const down = Number(kept);
    return lastDigit === 0 ? down : Number(x.toFixed(nd));
  }
  return Number(x.toFixed(nd));
}
