# Task completion

- `npx tsc --noEmit`, `npm test` (vitest; engine parity tests vs Python fixtures, ~718 cases), `npm run build`, `npx eslint src` (expected clean).
- If an engine change intentionally alters output: regenerate fixtures with `python3 scripts/gen-fixtures.py <saju-iljin-doc 스킬 폴더>` — never edit fixture JSON by hand.
- UI changes: run `npm run dev` and exercise:
  - `/`: default submit, with 성별(대운), date change + "오늘로", invalid month (error), 음력 + 시간 모름
  - `/gunghap`: two people (one with unknown time), switch 관계 종류
- Refactors: before/after compare SHA-256 of `document.querySelector('main').innerText` after opening every `<details>` (`d.open = true`) — collapsed content is otherwise excluded. Outputs must be identical.
- Browser-pane screenshots come back black when the app window is backgrounded — verify via page text / DOM.
- Scripted inputs: set value via native `HTMLInputElement.prototype.value` setter, then dispatch `input` + `change`.
