# my-saju core

- 정통 명리학(사주팔자) + 서양 별자리 웹사이트. Next.js App Router, 전부 브라우저에서 계산. 백엔드·DB·로그인 없음.
- Routes (both `"use client"`; page holds state, lib computes):
  - `src/app/page.tsx` — 1인 사주: `analyzePerson` → `PersonFacts`; 선택일 기준 `dayView`/`weekViews` (useMemo)
  - `src/app/gunghap/page.tsx` — 2인 궁합 + 관계 종류(연애·일·친구·가족): `analyzeGunghap(m1, m2, kind)`
- Layers:
  - `src/lib/engine/` — 사용자의 Python 스킬 `saju-iljin-doc`(manseryeok.py·relations.py·compute_group.py·compute_iljin.py·plain.py) TypeScript 이식. UI 비의존, "facts"만 출력.
    - `clock` 시간 표현 · `manseryeok` 절입·원국·음력·대운 · `relations` 관계표·십신·신살·별점 `score()` · `natal` 1인 facts · `daily` 일진 · `group` 다인 관계 · `astro` 달·하늘·시진표 · `plain` 쉬운 말 사전 + `relPlain/relTag/relTone/elKo` · `num` `pyRound`
  - Adapters: `src/lib/analysis.ts` (KST 오늘, 날짜 입력 변환), `src/lib/iljin.ts` (DayView·등급·주간 요약), `src/lib/gunghap.ts`, `src/lib/content/*` (정적 풀이 문구, 관계 종류 프로필)
  - UI: `ResultSection`, `GunghapResultView`, `src/components/saju/*` (격자·일진·오행·대운·구조 줄·ui 원시 컴포넌트·오행 색)
- 계산 규칙(원국 기준, 관계 판정, 별점·등급, 궁합 범위): `mem:domain/saju_rules`
- 버전, 생성 파일(VSOP87·픽스처), 배포 상태: `mem:tech_stack`
- Windows 전용 명령(Node PATH, git push 멈춤, Serena 실행): `mem:suggested_commands`
- 엔진/화면 작성 규칙과 재사용할 헬퍼: `mem:conventions`
- 완료 전 검증(파이썬 대조 테스트, 화면 출력 해시 비교): `mem:task_completion`
