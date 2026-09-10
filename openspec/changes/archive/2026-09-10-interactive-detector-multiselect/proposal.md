# Proposal: Interactive Editor Multiselect with Detection

## Intent

Replace the primitive numbered menu selection in the installer/setup flow with a standard interactive TUI multiselect (arrow keys, spacebar to toggle, enter to confirm). Automatically inspect the local machine to detect which of the 8 supported AI environments are installed, presenting detected environments as selectable and non-installed environments as visible but disabled with an unselectable `(not installed)` badge.

## Scope

### In Scope
- Cross-platform environment detector utility checking local presence for all 8 supported AI editors/agents (paths and PATH executables).
- Custom `@clack/prompts` multiselect component with disabled option support (visible in dim grey, blocked from spacebar toggling).
- New CLI command `sdd setup` executing the interactive detection and provisioning workflow natively in TypeScript.
- Update `install.ps1` and `install.sh` to delegate interactive configuration to `sdd setup` post global package install.
- Unit tests validating detector heuristics and prompt options formatting.

### Out of Scope
- Uninstaller interactive menu overhaul (deferred to a follow-up cycle).
- Installing third-party editors or CLI tools automatically.

## Capabilities

### New Capabilities
- `cli-setup`: Agnostic CLI command (`sdd setup`) that detects installed environments, runs the interactive multiselect prompt, and provisions selected editors.

### Modified Capabilities
- `installer`: Environment selection transitions from numbered console input to interactive checkbox TUI with presence detection and disabled uninstalled entries.

## Approach

1. Implement `src/utils/detector.ts` with cross-platform presence checks for:
   - Antigravity 2.0 (`~/.gemini/antigravity` / `agy`)
   - Antigravity CLI (`agy` executable / `~/.gemini`)
   - OpenAI Codex (`codex` executable / `~/.codex`)
   - VS Code / Copilot (`code` executable / VS Code app directories / `~/.copilot`)
   - OpenCode (`opencode` executable / `~/.config/opencode`)
   - Claude Code (`claude` executable / `~/.claude`)
   - Cursor (`cursor` executable / Cursor app directories / `~/.cursor`)
   - Zed (`zed` executable / `%APPDATA%/Zed` / `~/.config/zed` / Zed app directories)
2. Implement custom multiselect in `src/prompts/multiselect.ts` extending or wrapping `@clack` core to guard `toggleValue` and render disabled options with `color.dim('[-] Option (not installed)')`.
3. Create `src/commands/setup.ts` and register `sdd setup` in `src/index.ts`.
4. Update `scripts/install.ps1` and `scripts/install.sh` to run `sdd setup` after installing `@dedasema/sdd-cli`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/utils/detector.ts` | New | Environment presence detection |
| `src/prompts/multiselect.ts` | New | Gated multiselect with disabled option support |
| `src/commands/setup.ts` | New | `sdd setup` provisioning command |
| `src/index.ts` | Modified | Register `setup` command |
| `scripts/install.ps1` | Modified | Delegate selection to `sdd setup` |
| `scripts/install.sh` | Modified | Delegate selection to `sdd setup` |
| `tests/detector.test.ts` | New | Unit tests for detector |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Editor installed in custom non-PATH location not detected | Low | Check both executable in PATH and standard OS installation directories |
| Non-interactive CI environments failing on TUI | Low | Add `--all` / `--silent` flags to `sdd setup` for scripted execution |

## Rollback Plan

Revert Git commit to previous release tag `v0.1.4`. Restores numbered selection in `install.ps1` and `install.sh`.

## Dependencies

- `@clack/prompts` / `@clack/core` (existing)

## Success Criteria

- [ ] `sdd setup` presents an interactive multiselect navigable with arrow keys and toggleable with spacebar.
- [ ] Detected environments have active checkboxes; non-detected environments appear in grey as `(not installed)` and cannot be toggled.
- [ ] Submitting provisions only the selected environments.
- [ ] Automated Vitest suite passes 100%.
