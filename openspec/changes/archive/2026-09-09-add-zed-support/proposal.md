# Proposal: Native Zed Editor Support

## Intent

Developers using the high-performance Zed editor require seamless Spec-Driven Development (SDD) support. This change extends the single-line installer and uninstaller to natively configure Zed with all three foundational AI capabilities: an omnipresent Global Rule (`AGENTS.md`), a custom Slash Command (`/sdd` configured in `settings.json`), and an Agent Skill (`skills/sdd/SKILL.md`).

## Scope

### In Scope
- Add option `[8] Zed` to the interactive installer and uninstaller menus.
- Provision Global Rule:
  - Windows: `%APPDATA%\Zed\AGENTS.md`
  - Unix/macOS: `~/.config/zed/AGENTS.md`
- Provision Custom Slash Command (`/sdd`):
  - In `%APPDATA%\Zed\settings.json` (Windows) or `~/.config/zed/settings.json` (Unix/macOS) under `assistant.slash_commands.sdd`.
- Provision Agent Skill:
  - Windows: `%APPDATA%\Zed\skills\sdd\SKILL.md`
  - Unix/macOS: `~/.config/zed/skills/sdd/SKILL.md` (and macOS Application Support path)
- Symmetrical uninstallation: Safely excise `assistant.slash_commands.sdd`, delimited `AGENTS.md` block, and `skills/sdd/` directory.
- Update `README.md`.

### Out of Scope
- Modifying non-Zed editors when option `8` is selected.

## Capabilities

### Modified Capabilities
- `installer`: Adds Zed editor configuration (rules, slash command, and skill) to the supported environments matrix.

## Approach

Use existing delimited injection for `AGENTS.md`. For `settings.json`, use Node.js to safely read the existing JSON file (or initialize an empty object), add or update the `assistant.slash_commands.sdd` entry, and format with 2-space indentation, preserving all other user settings.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `scripts/install.ps1` | Modified | Add Zed option 8, paths, settings.json slash command injection |
| `scripts/install.sh` | Modified | Add Zed option 8, paths, settings.json slash command injection |
| `scripts/uninstall.ps1` | Modified | Add Zed option 8 cleanup logic |
| `scripts/uninstall.sh` | Modified | Add Zed option 8 cleanup logic |
| `README.md` | Modified | Add Zed to the supported AI environments list |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Corrupting Zed `settings.json` | Low | Safe parsing in Node.js with fallback initialization if file is missing or contains comments |

## Rollback Plan

Revert script changes via `git checkout`.

## Success Criteria

- [ ] Selecting `8` in `install.ps1` provisions only Zed files.
- [ ] Selecting `8` in `install.sh` provisions only Zed files.
- [ ] All 3 assets (rule, slash command, skill) are verified in place.
- [ ] Running uninstaller removes Zed SDD assets and restores `settings.json` cleanly.
