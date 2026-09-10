# Specification: Installer & Agent Provisioning

## Purpose

Defines formal requirements for installing, provisioning, and cleanly uninstalling the SDD CLI and associated global skills and rules across supported AI environments.

## Requirements

### Requirement: Single-Line Installation
The project MUST provide single-line installation scripts for Windows (`install.ps1`) and Unix/macOS (`install.sh`) that verify Node.js prerequisites and install `@dedasema/sdd-cli` globally.

### Requirement: Target Exactly 7 Designated AI Environments
The installer scripts MUST provision universal `SKILL.md` configurations exclusively for:
1. **Antigravity 2.0**: `~/.gemini/config/skills/sdd/SKILL.md`
2. **Antigravity CLI (`agy`)**: `~/.gemini/skills/sdd/SKILL.md`
3. **Codex**: `~/.codex/skills/sdd/SKILL.md`
4. **VS Code Copilot**: `~/.copilot/skills/sdd/SKILL.md`
5. **OpenCode**: `~/.config/opencode/skills/sdd/SKILL.md`
6. **Claude Code**: `~/.claude/skills/sdd/SKILL.md` and `~/.claude/commands/sdd.md`
7. **Cursor**: `~/.cursor/rules/sdd.mdc` and `~/.cursor/skills/sdd/SKILL.md`

### Requirement: Interactive Environment Selection
The installer and uninstaller scripts MUST prompt the user with an interactive menu to choose which of the 7 environments to configure or remove (supporting comma/space-separated numbers `1-7`), defaulting to configuring all environments if the user enters `A` or presses Enter without input.

### Requirement: Zero Terminal Intervention Post-Installation
The provisioned skills and rules MUST instruct each AI assistant to autonomously detect `openspec/`, run `sdd init` in the background when missing, and run `sdd new <feature>` for each new change without requiring manual developer terminal commands.

### Requirement: Single-Line Clean Uninstallation
The project MUST provide single-line uninstallation scripts for Windows (`uninstall.ps1`) and Unix/macOS (`uninstall.sh`) that cleanly purge all 7 global `sdd/` skill directories and standalone rules/commands without affecting other user configurations, and remove `@dedasema/sdd-cli` globally.
