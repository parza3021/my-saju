# Task completion

- `npx tsc --noEmit`, then `npm run build` (also type-checks), then `npx eslint src`.
  - Known pre-existing lint warnings: `_start`/`_end` unused in `src/lib/zodiac.ts` — not a regression.
- UI changes: run `npm run dev` and exercise in the browser:
  - `/`: default submit, change date + "오늘로", invalid month (error text), 음력 + 시간 모름
  - `/gunghap`: two people incl. one with unknown time
- Refactors: capture `document.querySelector('main').innerText` (or its SHA-256) for those scenarios before and after; outputs must be identical.
- Browser-pane screenshots come back black when the app window is backgrounded — verify via page text / DOM queries instead.
- Controlled inputs in scripted tests: set value via the native `HTMLInputElement.prototype.value` setter, then dispatch `input` + `change`.
