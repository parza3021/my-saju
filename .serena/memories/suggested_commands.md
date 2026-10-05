# Suggested commands (Windows)

- Node was installed via winget (`C:\Program Files\nodejs`); agent-spawned shells may lack it on PATH. In PowerShell, prefix npm/npx calls with:
  `$env:Path = [Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [Environment]::GetEnvironmentVariable("Path","User")`
  Git Bash shells have no node — run node tooling from PowerShell.
- `npm run dev` (http://localhost:3000), `npm test`, `npm run build`, `npx tsc --noEmit`, `npx eslint src`.
- `git push`/`fetch` can hang on Windows Credential Manager. `gh` is authenticated:
  `git -c credential.helper='!gh auth git-credential' push origin master`
- Serena must pin Python: `uvx --python 3.12 --from serena-agent serena ...` (3.14 fails building pyyaml without MSVC).
- Fixture/VSOP87 regeneration needs the user's `saju-iljin-doc` skill folder and `python3` (see `mem:tech_stack`).
