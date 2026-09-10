# cli-setup Specification

## Purpose

Defines requirements for the agnostic `sdd setup` command that performs cross-platform environment presence detection and interactive multi-select provisioning for AI agents and editors.

## Requirements

### Requirement: Cross-Platform Environment Detection
The system MUST provide a detection engine that inspects the local operating system to identify the presence of all 8 supported AI environments:
1. Antigravity 2.0
2. Antigravity CLI (`agy`)
3. OpenAI Codex
4. VS Code Copilot
5. OpenCode
6. Claude Code
7. Cursor
8. Zed
Detection MUST verify both PATH executables and standard operating system installation directories.

#### Scenario: Detecting Installed Executable in PATH
- GIVEN `zed` is available in the user's system PATH
- WHEN the environment detector scans for Zed
- THEN Zed MUST be reported as installed (`installed: true`)

#### Scenario: Detecting Installed Application via Standard Directory
- GIVEN `cursor` is not in PATH but the Cursor application directory exists in `%LOCALAPPDATA%\Programs\cursor` or `/Applications/Cursor.app`
- WHEN the environment detector scans for Cursor
- THEN Cursor MUST be reported as installed (`installed: true`)

#### Scenario: Uninstalled Environment
- GIVEN Claude Code executable is absent from PATH and its home configuration directory `~/.claude` does not exist
- WHEN the environment detector scans for Claude Code
- THEN Claude Code MUST be reported as not installed (`installed: false`)

### Requirement: Interactive Multiselect with Disabled Items
The `sdd setup` command MUST display an interactive checkbox prompt where non-installed environments are visible but disabled.

#### Scenario: User Navigates and Toggles Options
- GIVEN the user is presented with the environment selection prompt
- WHEN the user presses the Up/Down arrow keys
- THEN the cursor MUST move across the options
- AND pressing Space on an installed environment MUST toggle its checked status
- AND pressing Space on a disabled environment MUST NOT change its selection state

### Requirement: Provisioning Selected Environments
The `sdd setup` command MUST provision global rules, skills, and slash commands only for the environments selected by the user.

#### Scenario: Provisioning Selected Subset
- GIVEN the user selected Zed in the prompt
- WHEN the user presses Enter to confirm
- THEN the system MUST configure Zed
- AND it MUST NOT write or modify configurations for unselected environments
