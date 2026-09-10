# Specification: Uninstaller & Cleanup Protocol

## Purpose

Defines formal requirements for the automated, single-line uninstallation and cleanup of SDD assets across supported operating systems and AI environments.

## Requirements

### Requirement: Purge SDD Global Skills Across 7 Environments

The uninstaller MUST cleanly remove the `sdd/` skill folder from all 7 designated AI environments without modifying any other user configuration.

#### Scenario: Clean skill removal on Windows
- GIVEN a Windows machine with SDD skills installed in any of the 7 target directories
- WHEN `uninstall.ps1` executes
- THEN all target `sdd/` subdirectories (`.gemini/config/skills/sdd`, `.gemini/skills/sdd`, `.codex/skills/sdd`, `.copilot/skills/sdd`, `.config/opencode/skills/sdd`, `.claude/skills/sdd`, `.cursor/skills/sdd`) MUST be removed if present
- AND non-existent paths MUST NOT cause script failure

#### Scenario: Clean skill removal on Unix/macOS
- GIVEN a Unix/macOS machine with SDD skills installed in any of the 7 target directories
- WHEN `uninstall.sh` executes
- THEN all target `sdd/` subdirectories under `$HOME` MUST be removed if present
- AND non-existent paths MUST NOT cause script failure

### Requirement: Purge Specialized Rule and Command Files

The uninstaller MUST remove standalone SDD configuration files for Cursor and Claude Code.

#### Scenario: Standalone rule removal
- GIVEN installed files `~/.cursor/rules/sdd.mdc` and `~/.claude/commands/sdd.md`
- WHEN the uninstaller executes
- THEN both files MUST be removed if present
- AND parent directories (`.cursor/rules`, `.claude/commands`) MUST NOT be deleted

### Requirement: Global Package Removal

The uninstaller MUST attempt removal of `@dedasema/sdd-cli` using available global package managers.

#### Scenario: Package uninstall via pnpm or npm
- GIVEN `@dedasema/sdd-cli` is installed globally
- WHEN the uninstaller runs
- THEN it MUST invoke `pnpm rm -g @dedasema/sdd-cli` if `pnpm` is available
- OR invoke `npm rm -g @dedasema/sdd-cli` if `npm` is available
- AND if neither is available, it MUST inform the user without throwing a fatal error
