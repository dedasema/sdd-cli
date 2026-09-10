# Proposal: Multi-Agent Editor Support for 7 Major AI Environments

## Intent

Developers use a variety of AI coding assistants. To ensure an agnostic, zero-terminal SDD experience, the installation scripts (`install.ps1` and `install.sh`) must provision global SDD skills and rules across exactly 7 target AI environments: Antigravity 2.0, Antigravity CLI (`agy`), Codex, VS Code Copilot, OpenCode, Claude Code, and Cursor.

## Scope

### In Scope
Automated provisioning of global skills and rules in both `install.ps1` and `install.sh` for:
1. **Antigravity 2.0** (`~/.gemini/config/skills/sdd/SKILL.md` and `~/.gemini/skills/sdd/SKILL.md`)
2. **Antigravity CLI (`agy`)** (`~/.gemini/config/skills/sdd/SKILL.md`)
3. **Codex** (`~/.codex/skills/sdd/SKILL.md`)
4. **VS Code Copilot** (`~/.copilot/skills/sdd/SKILL.md`)
5. **OpenCode** (`~/.config/opencode/skills/sdd/SKILL.md`)
6. **Claude Code** (`~/.claude/skills/sdd/SKILL.md` and `~/.claude/commands/sdd.md`)
7. **Cursor** (`~/.cursor/rules/sdd.mdc` and `~/.cursor/skills/sdd/SKILL.md`)

### Out of Scope
- Any editor or agent outside the designated 7 targets.

## Capabilities

### New Capabilities
- `multi-agent-provisioning`: Cross-platform discovery and provisioning of global SDD skills and rule configurations for the 7 designated AI environments.

### Modified Capabilities
None

## Approach

Use the open **Agent Skills specification** (`SKILL.md` with YAML frontmatter) as the universal skill format, shared natively by Antigravity, OpenCode, Codex, Copilot, Cursor, and Claude Code. Supplement with environment-specific rule formats where required (Cursor `.mdc` and Claude `/sdd` command).

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Non-existent parent configuration directories | Low | Use `mkdir -p` / `New-Item -Force` to ensure target paths exist safely |

## Rollback Plan

Revert `scripts/install.ps1` and `scripts/install.sh` to previous commit via `git checkout`.

## Success Criteria

- [ ] `install.ps1` provisions all 7 targeted AI environments on Windows.
- [ ] `install.sh` provisions all 7 targeted AI environments on Unix/macOS.
- [ ] Documentation updated to reflect native support for the 7 environments.
