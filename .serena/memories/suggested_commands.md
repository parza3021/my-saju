# Suggested commands (Windows)

- Node was installed via winget (`C:\Program Files\nodejs`); agent-spawned shells may not have it on PATH. In PowerShell, prefix npm/npx calls with:
  `$env:Path = [Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [Environment]::GetEnvironmentVariable("Path","User")`
  Git Bash shells have no node at all — run node tooling from PowerShell.
- `npm run dev` (http://localhost:3000), `npm run build`, `npx tsc --noEmit`, `npx eslint src`.
- `git push` can hang waiting on Windows Credential Manager. `gh` is authenticated, so push with:
  `git -c credential.helper='!gh auth git-credential' push origin master`
- Serena CLI/MCP must pin Python: `uvx --python 3.12 --from serena-agent serena ...` (default 3.14 fails building pyyaml without MSVC).
