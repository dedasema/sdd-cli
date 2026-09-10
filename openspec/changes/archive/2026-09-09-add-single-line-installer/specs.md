# Specification: Single-Line Installer & Global Editor Integration

## Purpose

Defines requirements and scenarios for automated installation scripts and global AI editor integrations that enable a zero-terminal SDD workflow.

## Requirements

### Requirement: Verify Environment Prerequisites

The installer scripts MUST verify that Node.js and a package manager (pnpm or npm) are available on the user's system before attempting installation.

#### Scenario: Node.js is present
- GIVEN a system with Node.js installed and on PATH
- WHEN the user executes `install.ps1` or `install.sh`
- THEN the script MUST proceed to package installation

#### Scenario: Node.js is missing
- GIVEN a system without Node.js installed
- WHEN the user executes the installer script
- THEN the script MUST abort with an exit code 1
- AND display a helpful message instructing the user to install Node.js from https://nodejs.org

### Requirement: Global Package Installation

The installer scripts MUST install `@dedasema/sdd-cli` globally using the best available package manager (preferring `pnpm` if available, falling back to `npm`).

#### Scenario: Install package
- GIVEN valid Node.js and npm/pnpm environment
- WHEN the installer runs
- THEN the script MUST execute global installation of `@dedasema/sdd-cli`
- AND verify that the `sdd` binary is available on PATH

### Requirement: Provision Global AI Editor Rules & Skills

The installer scripts MUST detect the user's home directory and provision global rule/skill files for Cursor and Claude Code.

#### Scenario: Cursor integration
- GIVEN the user's home directory
- WHEN the installer provisions editor rules
- THEN it MUST ensure `~/.cursor/rules/` exists
- AND write `~/.cursor/rules/sdd.mdc` instructing Cursor's AI to automatically run `sdd init` and `sdd new` when SDD is requested

#### Scenario: Claude Code integration
- GIVEN the user's home directory
- WHEN the installer provisions editor rules
- THEN it MUST ensure `~/.claude/commands/` exists
- AND write `~/.claude/commands/sdd.md` enabling the `/sdd` slash command

### Requirement: Autonomous AI Action in AGENTS.md (MODIFIED)

The system MUST instruct AI agents in `AGENTS.md` to execute CLI lifecycle commands (`sdd new`, `sdd status`) autonomously using background terminal tools, rather than prompting the developer to run them manually.
(Previously: instructed the AI to tell the user to run `sdd new`).

#### Scenario: AI handles change creation autonomously
- GIVEN an initialized repository with `AGENTS.md`
- WHEN the developer requests a new feature or bug fix in the chat
- THEN the AI agent MUST execute `sdd new <change-name>` using its terminal tool
- AND MUST NOT instruct the user to open a terminal to execute the command manually
