# Tasks: Omnipresent Global Rules Provisioning

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | ~150-190 lines |
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
| 1 | Omnipresent Global Rules Provisioning | PR 1 | Scripts, documentation, and verification |

## Phase 1: Installer Script Updates

- [x] 1.1 Update `scripts/install.ps1` with delimited injection engine and provision global rules for Claude Code (`CLAUDE.md`), Copilot (`copilot-instructions.md`), Codex (`AGENTS.md`), OpenCode (`AGENTS.md`), Cursor (`sdd.mdc`), and Claude command (`sdd.md`).
- [x] 1.2 Update `scripts/install.sh` with delimited injection engine and provision the same global rules on Unix/macOS.

## Phase 2: Uninstaller Script Updates

- [x] 2.1 Update `scripts/uninstall.ps1` with delimited excision engine to surgically remove SDD blocks from shared files and delete standalone SDD files.
- [x] 2.2 Update `scripts/uninstall.sh` with delimited excision engine to surgically remove SDD blocks from shared files and delete standalone SDD files.

## Phase 3: Documentation Updates

- [x] 3.1 Update `README.md` to document the global rules and slash commands active in each of the 7 supported environments.

## Phase 4: Verification & SDD Closure

- [x] 4.1 Test fresh injection and delimited appending onto pre-existing files in isolated temp directories.
- [x] 4.2 Test surgical excision on uninstall in isolated temp directories.
- [x] 4.3 Run test suite (`pnpm test`) and build verification (`pnpm build`).
- [x] 4.4 Create `verify-report.md` and archive the change to `openspec/changes/archive/2026-09-09-global-rules-provisioning/`.
