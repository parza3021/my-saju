# Saju domain rules

- Unknown birth time: compute with hour 12 (avoids 자시 day-boundary shifts) and set `time = null`; every consumer must skip 시주.
- Day pillar for any calendar date (일진) = `calculateSaju` on that solar date at 12:00.
- Western zodiac always uses converted `solarBirth`, even for lunar input.
- 십신 = `getShiShen(dayMaster, stem)` from 오행 생극 + 음양 (same polarity → 비견/식신/편재/편관/편인). Matches lunar-javascript output.
- 궁합 (`branchRelations.ts`):
  - Pair relations only across people (person1 지지 × person2 지지): 육합, 충, 원진, 子卯 무례지형, 자형 (same branch in 辰午酉亥).
  - 삼합/삼형 count only if both people contribute ≥1 branch; 반합 only when the full 삼합 is absent.
  - 파(破) intentionally excluded — its classical pairs overlap/contradict 육합.
  - No numeric scores in UI; summary uses counts of 긍정/주의 hits.
- 일진 (`iljin.ts`):
  - Day 지지 vs each of my pillars: 육합/충/원진 only. Pillar → life area: 년=대외, 월=직장·사회, 일=나·가까운 사람, 시=아랫사람·개인 일과.
  - Internal score (never displayed): 십신 score + 육합 +2 / 충 −2 / 원진 −1; ≥2 순조, ≤−1 주의, else 보통.
  - Week = Monday–Sunday containing the selected date. Tone = dominant 십신 group (pairs in `SHI_SHEN_ORDER`); tie → "혼재".
  - Wording switches "오늘" / "이 날" by `isToday`.
