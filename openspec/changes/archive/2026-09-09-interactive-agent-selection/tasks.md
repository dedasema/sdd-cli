# Tasks: Interactive Agent & IDE Selection

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | ~100-140 lines |
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
| 1 | Interactive Agent & IDE Selection | PR 1 | Installers, uninstallers, documentation, and verification |

## Phase 1: Interactive Installer Updates

- [x] 1.1 Update `scripts/install.ps1` to display an interactive menu (1-7, A) and conditionally provision only selected environments.
- [x] 1.2 Update `scripts/install.sh` to display an interactive menu (1-7, A) reading from `/dev/tty` and conditionally provision only selected environments.

## Phase 2: Interactive Uninstaller Updates

- [x] 2.1 Update `scripts/uninstall.ps1` to allow selecting specific environments to clean or choosing all.
- [x] 2.2 Update `scripts/uninstall.sh` to allow selecting specific environments to clean or choosing all.

## Phase 3: Documentation

- [x] 3.1 Update `README.md` to document the interactive selection prompt and syntax.

## Phase 4: Verification & SDD Closure

- [x] 4.1 Test input parsing logic with various inputs (`""`, `"A"`, `"1,7"`, `"6 7"`, `"invalid"`) in PowerShell.
- [x] 4.2 Verify selective provisioning in isolated temp directories (confirming only selected paths are created).
- [x] 4.3 Run test suite (`pnpm test`) and build verification (`pnpm build`).
- [x] 4.4 Create `verify-report.md` and archive the change to `openspec/changes/archive/2026-09-09-interactive-agent-selection/`.
