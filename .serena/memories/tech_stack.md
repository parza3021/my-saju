# Tech stack

- Next.js 16.3.4 (App Router, Turbopack). `AGENTS.md`: APIs differ from training data — read `node_modules/next/dist/docs/` before using Next APIs. `next dev` rewrites the AGENTS.md block; commit it rather than reverting.
- React 19.2, TypeScript 5 (strict), path alias `@/*` → `src/*`.
- Tailwind CSS v4 via `@tailwindcss/postcss` — no `tailwind.config`.
- ESLint 9 flat config (`eslint-config-next`). Package manager: npm.
- `lunar-javascript` 1.7.7 (only runtime dep besides Next/React):
  - Ships no types → loose `declare module` in `src/types/lunar-javascript.d.ts` (`Solar`, `Lunar` as `any`).
  - Returns 한자; 십신 strings are simplified Chinese (`劫财`, `伤官`, `七杀`…) → mapped by `shiShenToKr` in `ganzhi.ts` (both simplified/traditional keys).
  - Leap month = negative month in `Lunar.fromYmdHms`.
- Repo: github.com/parza3021/my-saju (public, branch `master`). Deploy target Vercel — not connected yet (needs user login).
