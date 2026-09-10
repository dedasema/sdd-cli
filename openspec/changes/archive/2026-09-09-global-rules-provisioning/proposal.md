# Proposal: Omnipresent Global Rules Provisioning

## Intent

While global skills allow AI agents to load workflows on-demand, agents like Claude Code, VS Code Copilot, Codex, and OpenCode primarily rely on global instruction files (`CLAUDE.md`, `copilot-instructions.md`, `AGENTS.md`) to guide behavior across all project workspaces from the very first prompt. This change enhances the installer and uninstaller scripts to provision dedicated global rule files with surgical delimiters, guaranteeing that every supported AI agent automatically enforces the SDD lifecycle on day zero without requiring manual slash commands.

## Scope

### In Scope
- Provision omnipresent global rules for:
  - **Claude Code**: `~/.claude/CLAUDE.md` + slash command `~/.claude/commands/sdd.md`
  - **Cursor**: `~/.cursor/rules/sdd.mdc` (`alwaysApply: true`)
  - **VS Code Copilot**: `~/.copilot/copilot-instructions.md`
  - **OpenAI Codex**: `~/.codex/AGENTS.md`
  - **OpenCode**: `~/.config/opencode/AGENTS.md`
  - **Antigravity 2.0 & CLI**: `~/.gemini/config/skills/sdd/SKILL.md` (native slash command and semantic discovery)
- Safe delimited injection: Use markers (`# >>> SDD PROTOCOL >>>` ... `# <<< SDD PROTOCOL <<<`) to append without destroying existing user instructions.
- Symmetrical uninstallation: Cleanly remove only the delimited SDD blocks or standalone files during uninstallation.
- Update `scripts/install.ps1`, `scripts/install.sh`, `scripts/uninstall.ps1`, `scripts/uninstall.sh`, and `README.md`.

### Out of Scope
- Modifying repository-local project files.
- Overwriting existing user instructions outside the SDD delimiter.

## Capabilities

### Modified Capabilities
- `installer`: Expands provisioning and cleanup to encompass omnipresent global rule files across all supported agents.

## Approach

Define a standardized Markdown block containing the SDD Autonomous Assistant Protocol. In the installer, if a target rule file already exists, inject/replace the delimited block. If it does not exist, create the file. In the uninstaller, surgically excise the delimited block (or delete the file if it contains only SDD rules).

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `scripts/install.ps1` | Modified | Add global rule provisioning with delimiters for Claude, Copilot, Codex, OpenCode, Cursor |
| `scripts/install.sh` | Modified | Add global rule provisioning with delimiters for Unix/macOS |
| `scripts/uninstall.ps1` | Modified | Add surgical delimiter excision and standalone file deletion |
| `scripts/uninstall.sh` | Modified | Add surgical delimiter excision and standalone file deletion |
| `README.md` | Modified | Document global rules and slash commands across all 7 environments |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Corrupting existing user rules | Low | Wrap injected content with distinct start/end delimiters; never blindly overwrite existing `CLAUDE.md` |

## Rollback Plan

Revert modified scripts via `git checkout`.

## Success Criteria

- [ ] All 7 environments receive appropriate global rules and/or skills upon selection.
- [ ] Existing rule files retain non-SDD user content when injected or uninstalled.
- [ ] Isolated tests confirm clean injection and surgical uninstallation.
