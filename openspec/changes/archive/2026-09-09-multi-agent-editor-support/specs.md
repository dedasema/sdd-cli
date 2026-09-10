# Specification: Multi-Agent Editor Support

## Purpose

Defines formal requirements for installing and provisioning global SDD skills and rules across exactly 7 target AI environments.

## Requirements

### Requirement: Provision Universal Agent Skill (SKILL.md)

The system MUST generate a universal `SKILL.md` file adhering to the Agent Skills standard and install it in the standard skill directories of the supported agents.

#### Scenario: Universal skill structure
- GIVEN the Agent Skills specification
- WHEN the installer runs
- THEN `SKILL.md` MUST include YAML frontmatter with `name: sdd` and triggers for initializing and managing SDD changes
- AND MUST instruct the agent to run `sdd init` when `openspec/` is absent and `sdd new` for new work

### Requirement: Target Exactly 7 Designated AI Environments

The installer scripts MUST provision configurations exclusively for:
1. **Antigravity 2.0**: `~/.gemini/config/skills/sdd/SKILL.md`
2. **Antigravity CLI (`agy`)**: `~/.gemini/skills/sdd/SKILL.md`
3. **Codex**: `~/.codex/skills/sdd/SKILL.md`
4. **VS Code Copilot**: `~/.copilot/skills/sdd/SKILL.md`
5. **OpenCode**: `~/.config/opencode/skills/sdd/SKILL.md`
6. **Claude Code**: `~/.claude/skills/sdd/SKILL.md` and `~/.claude/commands/sdd.md`
7. **Cursor**: `~/.cursor/rules/sdd.mdc` and `~/.cursor/skills/sdd/SKILL.md`

#### Scenario: Directory provisioning on Windows
- GIVEN a Windows system running `install.ps1`
- WHEN the script runs
- THEN all 7 agent target directories under `$env:USERPROFILE` MUST be provisioned with SDD skills/rules
- AND no errors SHALL be thrown if parent directories did not previously exist

#### Scenario: Directory provisioning on Unix / macOS
- GIVEN a macOS or Linux system running `install.sh`
- WHEN the script runs
- THEN all 7 agent target directories under `$HOME` MUST be provisioned with SDD skills/rules
