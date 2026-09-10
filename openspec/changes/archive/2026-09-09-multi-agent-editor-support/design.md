# Design: Multi-Agent Editor Support for 7 Major AI Environments

## Technical Approach

Structure `scripts/install.ps1` and `scripts/install.sh` to define a single, authoritative `SKILL.md` string content adhering to the Agent Skills standard. The scripts iterate over a defined list of target paths for the 7 designated environments, creating directories if needed and deploying the skill. Specialized files (`.cursor/rules/sdd.mdc` and `.claude/commands/sdd.md`) are deployed alongside the universal skill.

## Architecture Decisions

| Decision | Choice | Alternatives Considered | Rationale |
|---|---|---|---|
| **Skill Format** | Universal `SKILL.md` (Agent Skills spec) | Separate custom prompt files per agent | The Agent Skills specification (YAML frontmatter + Markdown) is natively adopted by Antigravity, OpenCode, Codex, Copilot, Cursor, and Claude Code, reducing maintenance overhead and ensuring behavioral parity. |
| **Strict 7 Targets** | Exact 7 environments specified | Dynamic directory discovery of all possible editors | Strictly guarantees coverage of the exact environments requested without modifying unwanted folders. |

## Target Matrix

| Environment | Primary Path | Secondary / Specialized Path |
|---|---|---|
| **Antigravity 2.0** | `~/.gemini/config/skills/sdd/SKILL.md` | - |
| **Antigravity CLI (`agy`)** | `~/.gemini/skills/sdd/SKILL.md` | - |
| **Codex** | `~/.codex/skills/sdd/SKILL.md` | - |
| **VS Code Copilot** | `~/.copilot/skills/sdd/SKILL.md` | - |
| **OpenCode** | `~/.config/opencode/skills/sdd/SKILL.md` | - |
| **Claude Code** | `~/.claude/skills/sdd/SKILL.md` | `~/.claude/commands/sdd.md` |
| **Cursor** | `~/.cursor/skills/sdd/SKILL.md` | `~/.cursor/rules/sdd.mdc` |

## File Changes

| File | Action | Description |
|---|---|---|
| `scripts/install.ps1` | Modify | Expand provisioning loop to cover the 7 target AI environments |
| `scripts/install.sh` | Modify | Expand provisioning loop to cover the 7 target AI environments |
| `README.md` | Modify | Document the 7 natively supported AI environments |

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| PowerShell Provisioning | Execute `install.ps1` logic in isolation | Verify that files are created in the correct paths under temporary/user profile directory |
| Shell Provisioning | Validate `install.sh` loop syntax | Ensure proper quoting and POSIX directory creation |
