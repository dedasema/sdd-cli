# Tasks: Multi-Agent Editor Support

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | ~60-90 lines |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|---|---|---|---|
| 1 | Multi-Agent Editor Support | PR 1 | Scripts, documentation, and verification |

## Phase 1: Installer Script Updates

- [x] 1.1 Update `scripts/install.ps1` with the universal `SKILL.md` content and loop through the 7 environments (Antigravity 2.0, Antigravity CLI, Codex, Copilot, OpenCode, Claude Code, Cursor) plus specialized files (`sdd.mdc`, `sdd.md`).
- [x] 1.2 Update `scripts/install.sh` with the universal `SKILL.md` content and loop through the 7 environments plus specialized files (`sdd.mdc`, `sdd.md`).

## Phase 2: Documentation

- [x] 2.1 Update `README.md` to document the 7 supported AI environments and how global provisioning works.

## Phase 3: Verification & SDD Closure

- [x] 3.1 Test PowerShell script syntax and verify target path creation.
- [x] 3.2 Run project test suite (`pnpm test`) and build (`pnpm build`) to ensure no regressions.
- [x] 3.3 Create `verify-report.md` and archive the change to `openspec/changes/archive/2026-09-09-multi-agent-editor-support/`.
