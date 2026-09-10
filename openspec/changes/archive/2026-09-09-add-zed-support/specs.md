# Specification: Native Zed Editor Support

## Purpose

Defines formal requirements for installing and uninstalling SDD assets in the Zed editor across Windows and Unix/macOS environments.

## Requirements

### Requirement: Support Zed Editor in Interactive Installer Menu

The installer MUST include Zed as option `[8]` in its selection menu.

#### Scenario: Zed Selection
- GIVEN the installer presents the selection menu
- WHEN the user inputs `8`
- THEN ONLY Zed configuration paths MUST be modified
- AND no other editor directories (Cursor, Claude, Copilot, etc.) SHALL be touched

### Requirement: Provision All 3 Zed AI Capabilities

The installer MUST provision the Global Rule, Slash Command, and Agent Skill for Zed.

#### Scenario: Zed Global Rule Provisioning
- GIVEN Zed is selected
- WHEN the installer executes
- THEN `%APPDATA%\Zed\AGENTS.md` (Windows) or `~/.config/zed/AGENTS.md` (Unix/macOS) MUST be injected with the delimited SDD protocol block

#### Scenario: Zed Custom Slash Command Provisioning
- GIVEN Zed is selected
- WHEN the installer executes
- THEN `%APPDATA%\Zed\settings.json` (Windows) or `~/.config/zed/settings.json` (Unix/macOS) MUST be updated to include `assistant.slash_commands.sdd` with the command description and expanded prompt text
- AND all other existing user settings in `settings.json` MUST be preserved

#### Scenario: Zed Agent Skill Provisioning
- GIVEN Zed is selected
- WHEN the installer executes
- THEN `%APPDATA%\Zed\skills\sdd\SKILL.md` (Windows) or `~/.config/zed/skills/sdd/SKILL.md` (Unix/macOS) MUST be created with valid YAML frontmatter

### Requirement: Clean Zed Uninstallation

The uninstaller MUST cleanly purge all SDD assets from Zed.

#### Scenario: Uninstaller execution for Zed
- GIVEN Zed is selected for cleanup (or All selected)
- WHEN the uninstaller runs
- THEN `skills/sdd/` MUST be removed
- AND the delimited SDD block MUST be excised from `AGENTS.md`
- AND `assistant.slash_commands.sdd` MUST be removed from `settings.json` while preserving all other keys
