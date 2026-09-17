# my-saju core

- 정통 명리학(사주팔자) + 서양 별자리 풀이 웹사이트. Next.js App Router, 전부 클라이언트 계산. 백엔드·DB·로그인 없음.
- Routes (both `"use client"`, state lives in page, lib does all computation):
  - `src/app/page.tsx` — 개인 사주 원국 + 일진/주간 운세 (selectedDate state, derived via `useMemo`)
  - `src/app/gunghap/page.tsx` — 두 사람 궁합
- Pipeline: `BirthInput` → `calculateSaju` (`src/lib/saju.ts`, wraps lunar-javascript) → `SajuResult`. Use `getPillars(saju)` for the pillar list (handles `time === null`).
- Domain libs in `src/lib/`: `ganzhi.ts` (한자↔한글 간지, 오행 생극 maps, `getShiShen`), `branchRelations.ts` (지지 관계 tables, `findPair`, cross-person matching), `iljin.ts` (daily/weekly fortune, date-input helpers), `gunghap.ts`, `zodiac.ts`.
- All interpretation text = static Korean content in `src/lib/content/*`; no AI/API calls.
- All shared types in `src/lib/types.ts`.
- 명리 계산 규칙·판정 기준(시간 미상 처리, 궁합 관계 인정 조건, 일진 등급 산출, 주간 범위): `mem:domain/saju_rules`
- Versions, lunar-javascript quirks, deploy target: `mem:tech_stack`
- Windows-specific commands (Node PATH, git push hang, Serena launch): `mem:suggested_commands`
- UI/code patterns to reuse (birth input component, badges, relation matching): `mem:conventions`
- Verification steps before calling a task done, incl. output-equivalence check for refactors: `mem:task_completion`
