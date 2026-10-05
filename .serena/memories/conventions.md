# Conventions

- Engine (`src/lib/engine/`) mirrors the Python skill and must not import UI. Keep it a faithful port: behavior changes need Python-side agreement and regenerated fixtures.
- Time: always UTC-epoch ms (`Ms`) or integer day count (`Day`) from `clock.ts`; read fields with UTC getters only. Never use local `Date` getters (results would shift by machine timezone). KST "today" = `todayKst()`.
- Engine returns structured data only (`Structure`, `Guiin`, `NatalGilsin`, `InternalHit`, `StemHit`/`BranchHit`, `SeunItem`). Never build display sentences in the engine and never regex-parse engine output in the UI.
- Python sentence formats live only in `src/lib/engine/__fixtures__/pyFormat.ts`; parity tests map engine output through it before comparing with fixtures. New engine outputs that the Python facts contain need a formatter there.
- Reuse, don't redefine: `mod`, `pad2` (`clock`); `cgIndex`, `jjIndex`, `PILLAR_ORDER`, `STRUCTURE_GROUPS`, `canonOf` (`relations`); `relTone`, `elKo`, `relPlain`, `relTag` (`plain`); `Badge` tones incl. `mixed`; `StructureLine` for 삼합/방합/삼형.
- Engine uses sign element "공기"; display it via `elKo()` ("바람").
- UI text: plain Korean first, jargon only inside `<Jargon>` / `Disclosure`. Korean literal unions for domain values.
- Birth input: `PersonBirthFields` + `DEFAULT_PERSON` + `personFormToMember(state, fallbackName)` → `BirthMember` (gender optional; 대운 requires it).
- Codebase was reviewed for over-engineering: no unused exports/params/outputs, no single-use abstractions, comments only for non-obvious why.
- Commit messages in Korean, explain why; end with the Co-Authored-By line.
