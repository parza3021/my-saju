# Conventions

- UI text and content are Korean. Domain unions use Korean literals: `Wuxing` = "목"|"화"|"토"|"금"|"수", polarity "긍정"|"주의", day level "순조"|"보통"|"주의".
- 한자 is the join key (relation tables, lookups); 한글 is for display.
- Keep computation in `src/lib`; components only render. Pages hold state and derive results (no stored derived state).
- Birth input: always reuse `PersonBirthFields` + `DEFAULT_PERSON` + `personFormToBirthInput` (same file). `BirthForm` wraps it; `title`/`namePlaceholder` are optional and hide those fields when omitted; `children` render inside the card.
- 지지 pair checks go through `findPair(list, a, b)` (order-insensitive) — don't hand-roll pair comparisons.
- Positive/caution badge colors: `POLARITY_BADGE` in `src/components/polarity.ts`.
- Card style: `rounded-2xl border border-white/10 bg-white/5 p-6`; accent amber-300/400; dark theme only.
- Codebase was reviewed for over-engineering: no single-use abstractions, no unused params/fallbacks, comments only for non-obvious why.
- Commit messages in Korean, explain why; end with Co-Authored-By line.
