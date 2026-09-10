# Proposal: Add Automated Single-Line Uninstaller

## Intent

When developers uninstall `@dedasema/sdd-cli`, global skills and configuration files previously provisioned across the 7 supported AI environments remain orphaned on their machine. This change provides automated, single-line uninstallation scripts (`uninstall.ps1` and `uninstall.sh`) to cleanly purge global SDD skills, rules, and commands, and remove the global NPM package.

## Scope

### In Scope
- Create `scripts/uninstall.ps1` for Windows PowerShell.
- Create `scripts/uninstall.sh` for Unix/macOS Bash.
- Cleanly remove global skills in the 7 target environments:
  1. Antigravity 2.0 (`~/.gemini/config/skills/sdd/`)
  2. Antigravity CLI (`~/.gemini/skills/sdd/`)
  3. OpenAI Codex (`~/.codex/skills/sdd/`)
  4. VS Code Copilot (`~/.copilot/skills/sdd/`)
  5. OpenCode (`~/.config/opencode/skills/sdd/`)
  6. Claude Code (`~/.claude/skills/sdd/` and `~/.claude/commands/sdd.md`)
  7. Cursor (`~/.cursor/skills/sdd/` and `~/.cursor/rules/sdd.mdc`)
- Remove global `@dedasema/sdd-cli` via `pnpm rm -g` or `npm rm -g`.
- Document uninstallation instructions in `README.md`.

### Out of Scope
- Modifying or deleting any local project `openspec/` folders (those are project assets).
- Touching non-SDD files inside editor directories.

## Capabilities

### Modified Capabilities
- `installer`: Extends the installer lifecycle to include safe, complete uninstallation and cleanup.

## Approach

Implement symmetrical uninstaller scripts:
- Windows: `irm https://raw.githubusercontent.com/dedasema/sdd-cli/main/scripts/uninstall.ps1 | iex`
- Unix/macOS: `curl -fsSL https://raw.githubusercontent.com/dedasema/sdd-cli/main/scripts/uninstall.sh | bash`

Each script iterates over the exact list of SDD target directories and files, checking existence before removing, and then executes package removal.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `scripts/uninstall.ps1` | New | Single-line PowerShell uninstaller |
| `scripts/uninstall.sh` | New | Single-line Bash uninstaller |
| `README.md` | Modified | Add Uninstallation section |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Accidentally deleting parent editor directories | Low | Target specifically the `sdd/` subfolder or exact filename, never parent folders |
| Package manager not found during uninstall | Low | Check `pnpm` and `npm` before attempting removal; log warning if neither is found |

## Rollback Plan

Delete `scripts/uninstall.ps1` and `scripts/uninstall.sh` and revert `README.md`.

## Success Criteria

- [ ] `uninstall.ps1` removes all SDD global skill folders and rule files on Windows.
- [ ] `uninstall.sh` removes all SDD global skill folders and rule files on Unix/macOS.
- [ ] Package removal is attempted via detected global package manager (`pnpm` or `npm`).
- [ ] `README.md` includes clear one-line uninstallation commands.
