# Design: Omnipresent Global Rules Provisioning

## Technical Approach

Augment the installation and uninstallation pipeline with a delimited rule injection engine. For each supported environment that utilizes global instruction files (`CLAUDE.md`, `copilot-instructions.md`, `AGENTS.md`), the scripts inject a marked block:
`<!-- >>> SDD PROTOCOL >>> -->` ... `<!-- <<< SDD PROTOCOL <<< -->`.

If the file already exists, only the delimited section is replaced or appended. On uninstallation, the delimited section is excised. If the file is empty after excision, it is safely deleted; otherwise, the pre-existing user instructions are preserved intact.

Node.js (already established as a hard prerequisite in Step 1 of both install and uninstall scripts) is leveraged where appropriate for safe multiline regex replacement across OS boundaries.

## Target Environment Architecture Matrix

| Environment | Global Rule File | Slash Command | Universal Skill (`SKILL.md`) |
|---|---|---|---|
| **Antigravity 2.0** | Semantic discovery across all workspaces | `/sdd` (native from skill) | `~/.gemini/config/skills/sdd/` |
| **Antigravity CLI** | Semantic discovery across all workspaces | `/sdd` (native from skill) | `~/.gemini/skills/sdd/` |
| **OpenAI Codex** | `~/.codex/AGENTS.md` | Via skill discovery | `~/.codex/skills/sdd/` |
| **VS Code Copilot** | `~/.copilot/copilot-instructions.md` | Via prompt/skills | `~/.copilot/skills/sdd/` |
| **OpenCode** | `~/.config/opencode/AGENTS.md` | Via skill discovery | `~/.config/opencode/skills/sdd/` |
| **Claude Code** | `~/.claude/CLAUDE.md` | `~/.claude/commands/sdd.md` (`/sdd`) | `~/.claude/skills/sdd/` |
| **Cursor** | `~/.cursor/rules/sdd.mdc` (`alwaysApply: true`) | Via prompt/rules | `~/.cursor/skills/sdd/` |

## File Changes

| File | Action | Description |
|---|---|---|
| `scripts/install.ps1` | Modify | Add delimited injection for Claude, Copilot, Codex, OpenCode, and Cursor |
| `scripts/install.sh` | Modify | Add delimited injection for Claude, Copilot, Codex, OpenCode, and Cursor |
| `scripts/uninstall.ps1` | Modify | Add delimited excision for rule files on cleanup |
| `scripts/uninstall.sh` | Modify | Add delimited excision for rule files on cleanup |
| `README.md` | Modify | Document comprehensive global rules coverage |

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Injection into fresh files | Verify rule file created with delimiters | Isolated temp directory test |
| Ingestion into pre-existing files | Verify existing user notes are preserved around delimiters | Isolated temp test with mock pre-existing notes |
| Uninstallation excision | Verify SDD block excised and original notes preserved | Isolated temp test running uninstallation logic |
