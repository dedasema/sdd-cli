# Specification: Omnipresent Global Rules Provisioning

## Purpose

Defines formal requirements for installing and cleanly uninstalling omnipresent global rules and system prompts across the 7 supported AI environments.

## Requirements

### Requirement: Omnipresent Global Rules Across Supported Environments

The installer MUST provision global rules that guide the AI agent in every project workspace, even before any project-level configuration exists.

#### Scenario: Claude Code Global Rule
- GIVEN Claude Code is selected during installation
- WHEN the installer runs
- THEN `~/.claude/CLAUDE.md` MUST contain the SDD autonomous protocol
- AND `~/.claude/commands/sdd.md` MUST be provisioned for `/sdd` slash command support

#### Scenario: Cursor Global Rule
- GIVEN Cursor is selected during installation
- WHEN the installer runs
- THEN `~/.cursor/rules/sdd.mdc` MUST be provisioned with `alwaysApply: true`

#### Scenario: VS Code Copilot Global Instructions
- GIVEN GitHub Copilot is selected during installation
- WHEN the installer runs
- THEN `~/.copilot/copilot-instructions.md` MUST contain the SDD autonomous protocol

#### Scenario: OpenAI Codex Global Rules
- GIVEN OpenAI Codex is selected during installation
- WHEN the installer runs
- THEN `~/.codex/AGENTS.md` MUST contain the SDD autonomous protocol

#### Scenario: OpenCode Global Rules
- GIVEN OpenCode is selected during installation
- WHEN the installer runs
- THEN `~/.config/opencode/AGENTS.md` MUST contain the SDD autonomous protocol

#### Scenario: Antigravity Global Skill & Slash Command
- GIVEN Antigravity 2.0 or Antigravity CLI is selected
- WHEN the installer runs
- THEN `~/.gemini/config/skills/sdd/SKILL.md` MUST be provisioned, automatically registering the `/sdd` slash command and semantic discovery across all workspaces

### Requirement: Non-Destructive Delimited Injection

The installer MUST preserve pre-existing user instructions in shared rule files.

#### Scenario: Ingestion into existing file
- GIVEN an existing `~/.claude/CLAUDE.md` or `~/.codex/AGENTS.md` containing prior user configuration
- WHEN the installer runs
- THEN the SDD protocol MUST be injected within `# >>> SDD PROTOCOL >>>` and `# <<< SDD PROTOCOL <<<` markers
- AND existing user instructions outside the markers MUST remain unaltered

### Requirement: Surgical Uninstallation

The uninstaller MUST cleanly remove the SDD protocol without destroying surrounding user instructions.

#### Scenario: Removal from shared rule file
- GIVEN a rule file with existing user instructions and the delimited SDD block
- WHEN the uninstaller runs
- THEN ONLY the content between the SDD delimiters MUST be excised
- AND if the file contains no other content after excision, the file MAY be safely deleted
