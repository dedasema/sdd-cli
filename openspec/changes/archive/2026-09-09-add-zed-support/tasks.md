# Tasks: Native Zed Editor Support

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | ~120-160 lines |
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
| 1 | Native Zed Editor Support | PR 1 | Scripts, documentation, and verification |

## Phase 1: Installer Script Updates

- [x] 1.1 Update `scripts/install.ps1` to include `[8] Zed` in the menu and provision `AGENTS.md` (rule), `settings.json` (slash command), and `skills/sdd/SKILL.md` (skill).
- [x] 1.2 Update `scripts/install.sh` to include `[8] Zed` in the menu and provision `AGENTS.md` (rule), `settings.json` (slash command), and `skills/sdd/SKILL.md` (skill).

## Phase 2: Uninstaller Script Updates

- [x] 2.1 Update `scripts/uninstall.ps1` to support option `8` to clean up Zed rule, slash command, and skill.
- [x] 2.2 Update `scripts/uninstall.sh` to support option `8` to clean up Zed rule, slash command, and skill.

## Phase 3: Documentation Updates

- [x] 3.1 Update `README.md` to document Zed support across the installer and uninstaller options.

## Phase 4: Verification & SDD Closure

- [x] 4.1 Test isolated provisioning for option `8` to confirm all 3 assets are created and no other editor folders are touched.
- [x] 4.2 Test uninstallation for option `8` to confirm clean removal.
- [x] 4.3 Run test suite (`pnpm test`) and build verification (`pnpm build`).
- [x] 4.4 Create `verify-report.md` and archive the change to `openspec/changes/archive/2026-09-09-add-zed-support/`.
