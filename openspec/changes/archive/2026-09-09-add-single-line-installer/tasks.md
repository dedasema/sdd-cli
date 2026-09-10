# Tasks: Single-Line Installer and Global Editor Integration

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~200 lines |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: stacked-to-main
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Single-line installer scripts, global editor integration, and autonomous agent template | Single PR | Cross-platform scripts and template update |

## Phase 1: Core Template Enhancement

- [x] 1.1 Update `src/templates/agents.ts` so `AGENTS.md` explicitly mandates that AI agents run `sdd new` autonomously via background terminal tools.
- [x] 1.2 Update tests in `tests/commands.test.ts` to verify the autonomous AI behavior instructions in `AGENTS.md`.
- [x] 1.3 Run `pnpm test && pnpm build` to ensure all tests pass and `dist/` is regenerated.

## Phase 2: Windows PowerShell Installer

- [x] 2.1 Create `scripts/install.ps1` with Node.js verification, package manager resolution (`pnpm`/`npm`), `@dedasema/sdd-cli` installation, and provisioning of `~/.cursor/rules/sdd.mdc` and `~/.claude/commands/sdd.md`.
- [x] 2.2 Validate `scripts/install.ps1` syntax and directory resolution logic.

## Phase 3: Unix / macOS Shell Installer

- [x] 3.1 Create `scripts/install.sh` with Node.js check, package manager resolution, global CLI installation, and provisioning of `~/.cursor/rules/sdd.mdc` and `~/.claude/commands/sdd.md`.
- [x] 3.2 Ensure POSIX-compliant permissions and error handling.

## Phase 4: Documentation & Version Bump

- [x] 4.1 Update `README.md` adding the one-line install snippets for Windows (`irm ... | iex`) and macOS/Linux (`curl ... | bash`).
- [x] 4.2 Bump package version to `0.1.2` in `package.json`.
