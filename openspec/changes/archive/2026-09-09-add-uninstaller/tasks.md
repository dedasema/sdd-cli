# Tasks: Add Automated Single-Line Uninstaller

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | ~80-120 lines |
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
| 1 | Automated Single-Line Uninstaller | PR 1 | PowerShell/Bash uninstallers, docs, and verification |

## Phase 1: Uninstaller Scripts

- [x] 1.1 Create `scripts/uninstall.ps1` with path purges for all 7 environments, rule/command deletion, and package uninstall.
- [x] 1.2 Create `scripts/uninstall.sh` with path purges for all 7 environments, rule/command deletion, and package uninstall.

## Phase 2: Documentation

- [x] 2.1 Update `README.md` to document the one-line uninstallation commands for Windows and Unix/macOS.

## Phase 3: Verification & SDD Closure

- [x] 3.1 Test PowerShell uninstall logic against an isolated mock filesystem and verify clean deletion of target files while preserving parents.
- [x] 3.2 Run test suite (`pnpm test`) and build verification (`pnpm build`).
- [x] 3.3 Create `verify-report.md` and archive the change to `openspec/changes/archive/2026-09-09-add-uninstaller/`.
