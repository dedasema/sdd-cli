# Specification: Installer & Agent Provisioning

## Purpose

Defines formal requirements for installing, provisioning, and cleanly uninstalling the SDD CLI and associated global skills, rules, and commands across supported AI environments.

## Requirements

### Requirement: Single-Line Installation
The project MUST provide single-line installation scripts for Windows (`install.ps1`) and Unix/macOS (`install.sh`) that verify Node.js prerequisites and install `@dedasema/sdd-cli` globally.

### Requirement: Target Supported AI Environments
The installer scripts MUST provision configurations for:
1. **Antigravity 2.0**: `~/.gemini/config/skills/sdd/SKILL.md` (Native `/sdd` and `/sdd-*` slash commands + skill)
2. **Antigravity CLI (`agy`)**: `~/.gemini/skills/sdd/SKILL.md` (Native `/sdd` and `/sdd-*` slash commands + skill)
3. **OpenAI Codex**: `~/.codex/AGENTS.md` (Global rule with phase gates) + `~/.codex/skills/sdd/SKILL.md`
4. **VS Code Copilot**: `~/.copilot/copilot-instructions.md` (Global rule with phase gates) + `~/.copilot/skills/sdd/SKILL.md`
5. **OpenCode**: `~/.config/opencode/AGENTS.md` (Global rule with phase gates) + `~/.config/opencode/skills/sdd/SKILL.md`
6. **Claude Code**: `~/.claude/CLAUDE.md` (Global rule) + 9 native commands in `~/.claude/commands/sdd*.md` + skill
7. **Cursor**: `~/.cursor/rules/sdd.mdc` (`alwaysApply: true`, 7-phase lifecycle) + `~/.cursor/skills/sdd/SKILL.md`
8. **Zed**: `%APPDATA%\Zed` or `~/.config/zed` (`AGENTS.md` + `settings.json` 9 slash commands under `assistant.slash_commands.*` + `skills/sdd/SKILL.md`)

### Requirement: Granular Slash Commands Suite
The system MUST support a 9-command suite across environments:
- `/sdd`: Smart orchestrator (audits repo state, inits if missing, creates change, or resumes active phase)
- `/sdd-init`: Project initialization and bootstrap
- `/sdd-new`: Change workspace scaffolding
- `/sdd-propose`: Proposal drafting and scope clarification
- `/sdd-spec`: Formal specification drafting (RFC 2119 + Given/When/Then)
- `/sdd-design`: Technical design and architecture decisions
- `/sdd-tasks`: Atomic implementation checklist breakdown
- `/sdd-verify`: Verification execution (tests, lint, spec compliance)
- `/sdd-archive`: Formal verification check, confirmation gate, and change archival

### Requirement: Interactive Phase Gates & Clarification Protocol
The provisioned assistant rules MUST strictly mandate:
1. Deterministic state on disk: inspect `openspec/` and never repeat `sdd init` if it already exists.
2. Zero doubts before gating: formulate clarifying questions to resolve any ambiguity before proposing phase transitions.
3. Explicit human-in-the-loop checkpoints: require user approval at the end of each phase before generating artifacts or code for the next phase.
4. Gated archival: verify tests and specs first, then request explicit approval before moving to `openspec/changes/archive/`.

### Requirement: Non-Destructive Delimited Injection & Excision
When injecting global rules into shared user files (`CLAUDE.md`, `copilot-instructions.md`, `AGENTS.md`, `settings.json`), the scripts MUST protect pre-existing configurations. Markdown files use comment markers (`<!-- >>> SDD PROTOCOL >>> -->` ... `<!-- <<< SDD PROTOCOL <<< -->`) and JSON configuration files surgically update only the SDD keys.

### Requirement: Interactive Environment Selection
The installation workflow MUST prompt the user with an interactive terminal UI to choose which AI environments to configure. The system MUST inspect the local machine and identify which environments are installed. Installed environments MUST be selectable and toggleable via standard multiselect controls (arrow keys to navigate, spacebar to toggle). Environments that are not detected on the machine MUST remain visible in the list but MUST be disabled and non-selectable, tagged with an unselectable status indicator `(not installed)`, preventing the user from toggling them.

#### Scenario: Interactive Selection with Detected Environments
- GIVEN the installer is executed on a machine where Zed is detected, but other editors are absent
- WHEN the interactive environment selector is displayed
- THEN Zed SHALL be rendered with an active toggleable checkbox
- AND undetected editors SHALL be rendered as disabled with `(not installed)`
- AND pressing Space on an undetected option SHALL NOT toggle its state

#### Scenario: Scripted Non-Interactive Execution
- GIVEN the installer is executed with a non-interactive flag (e.g., `--all` or `--silent`)
- WHEN the installation executes
- THEN it MUST bypass interactive prompts and provision detected environments automatically

### Requirement: Zero Terminal Intervention Post-Installation
The provisioned skills and rules MUST instruct each AI assistant to autonomously detect `openspec/`, run `sdd init` in the background when missing, and run `sdd new <feature>` for each new change without requiring manual developer terminal commands.

### Requirement: Single-Line Clean Uninstallation
The project MUST provide single-line uninstallation scripts for Windows (`uninstall.ps1`) and Unix/macOS (`uninstall.sh`) that cleanly purge all global `sdd/` skill directories, standalone rules, all 9 slash commands, and delimited rule blocks without affecting other user configurations, and remove `@dedasema/sdd-cli` globally.
