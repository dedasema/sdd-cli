# Tasks: Interactive Editor Multiselect with Detection

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~250 lines |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

## Phase 1: Foundation (Detector & Gated Prompt)

- [x] 1.1 Add `@clack/core` explicitly to `package.json` dependencies and install
- [x] 1.2 Implement `src/utils/detector.ts` with synchronous presence checks (PATH executables + OS install directories) for all 8 AI environments
- [x] 1.3 Implement `src/prompts/multiselect.ts` subclassing `MultiSelectPrompt` from `@clack/core` to block disabled options and style them with `[-] Option (not installed)`

## Phase 2: Setup Command & CLI Integration

- [x] 2.1 Implement `src/commands/setup.ts` coordinating detection, interactive multiselect prompt, and provisioning
- [x] 2.2 Register `sdd setup` command in `src/index.ts` with `--all` and `--silent` options

## Phase 3: Shell Installers Integration

- [x] 3.1 Update `scripts/install.ps1` to delegate interactive configuration to `sdd setup` post-installation
- [x] 3.2 Update `scripts/install.sh` to delegate interactive configuration to `sdd setup` post-installation

## Phase 4: Testing & Verification

- [x] 4.1 Create `tests/detector.test.ts` covering positive and negative detection paths with mocks
- [x] 4.2 Create `tests/multiselect.test.ts` verifying that disabled options are blocked from toggling
- [x] 4.3 Run full test suite (`pnpm test`) and build verification (`pnpm build`)
