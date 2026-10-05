# Conventions

- Engine (`src/lib/engine/`) mirrors the Python skill and must not import UI. Keep it a faithful port: behavior changes need Python-side agreement and regenerated fixtures.
- Time: always UTC-epoch ms (`Ms`) or integer day count (`Day`) from `clock.ts`; read fields with UTC getters only. Never use local `Date` getters (results would shift by machine timezone). KST "today" = `todayKst()`.
- Some engine outputs are Python-format sentences (structures `"삼합 해묘미(목) — 해:가/나, …"`, guiin, gilsin, internal) because parity tests compare them as strings. UI parses them (`StructureLine`, `parseGuiin` in `GunghapResultView`). Changing a format means updating tests/fixtures together.
- Reuse, don't redefine: `mod`, `pad2` (`clock`); `cgIndex`, `jjIndex`, `PILLAR_ORDER` (`relations`); `relTone`, `elKo`, `relPlain`, `relTag` (`plain`); `Badge` tones incl. `mixed`; `StructureLine` for 삼합/방합/삼형 lines.
- Engine uses sign element "공기"; display it via `elKo()` ("바람").
- UI text: plain Korean first, jargon only inside `<Jargon>` / `Disclosure`. Korean literal unions for domain values.
- Birth input: `PersonBirthFields` + `DEFAULT_PERSON` + `personFormToMember(state, fallbackName)` → `BirthMember` (gender optional; 대운 requires it).
- Codebase was reviewed for over-engineering: no unused exports/params/outputs, no single-use abstractions, comments only for non-obvious why.
- Commit messages in Korean, explain why; end with the Co-Authored-By line.
