# Tech stack

- Next.js 16.3.8 (App Router, Turbopack). `AGENTS.md`: APIs differ from training data — read `node_modules/next/dist/docs/` before using Next APIs. `next dev` rewrites the AGENTS.md block; commit it rather than reverting.
- React 19.2, TypeScript 5 strict, alias `@/*` → `src/*`. Tailwind CSS v4 (`@tailwindcss/postcss`, no config; 오행 색은 `globals.css` CSS 변수 `--mok/--hwa/--to/--geum/--su`). ESLint 9 flat config.
- Tests: vitest 5 (`npm test`, `src/**/*.test.ts`).
- Runtime deps are only Next/React. `lunar-javascript` was removed — 만세력은 자체 엔진(`src/lib/engine/`).
- Generated files — never hand-edit:
  - `src/lib/engine/vsop87.ts` ← `python3 scripts/gen-vsop87.py <saju-iljin-doc 스킬 폴더>`
  - `src/lib/engine/__fixtures__/*.json` (Python 정답값) ← `python3 scripts/gen-fixtures.py <스킬 폴더>`
- Repo: github.com/parza3021/my-saju (public, `master`). Deploy target Vercel — not connected yet (needs user login).
