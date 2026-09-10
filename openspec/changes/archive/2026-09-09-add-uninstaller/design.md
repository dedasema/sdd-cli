# Design: Automated Single-Line Uninstaller

## Technical Approach

Provide two dedicated cleanup scripts: `scripts/uninstall.ps1` (PowerShell) and `scripts/uninstall.sh` (POSIX Bash). Both scripts mirror the directory structure of the installer scripts. They verify path existence before deletion, remove only the specific `sdd` skills and rule files, and invoke the detected package manager (`pnpm rm -g` or `npm rm -g`) to cleanly remove the CLI binary.

## Architecture Decisions

| Decision | Choice | Alternatives Considered | Rationale |
|---|---|---|---|
| **Dedicated Remote Script** | Remote `uninstall.ps1` / `uninstall.sh` | Built-in `sdd uninstall` command only | A running node process cannot reliably delete its own running binary on Windows (file lock), and if a user removes the npm package first, they would lose access to the CLI uninstaller. Remote scripts are fully self-contained. |
| **Surgical Path Deletion** | Remove only `.../skills/sdd` directory and specific files | Deleting parent folders | Prevents accidental deletion of any other user skills or rules existing in the same agent config directories. |

## Target Deletion Matrix

| Target Type | Path | Action |
|---|---|---|
| Antigravity 2.0 Skill | `~/.gemini/config/skills/sdd` | Remove Directory |
| Antigravity CLI Skill | `~/.gemini/skills/sdd` | Remove Directory |
| OpenAI Codex Skill | `~/.codex/skills/sdd` | Remove Directory |
| VS Code Copilot Skill | `~/.copilot/skills/sdd` | Remove Directory |
| OpenCode Skill | `~/.config/opencode/skills/sdd` | Remove Directory |
| Claude Code Skill | `~/.claude/skills/sdd` | Remove Directory |
| Claude Code Command | `~/.claude/commands/sdd.md` | Remove File |
| Cursor Skill | `~/.cursor/skills/sdd` | Remove Directory |
| Cursor Rule | `~/.cursor/rules/sdd.mdc` | Remove File |

## File Changes

| File | Action | Description |
|---|---|---|
| `scripts/uninstall.ps1` | New | PowerShell uninstallation and cleanup script |
| `scripts/uninstall.sh` | New | Bash uninstallation and cleanup script |
| `README.md` | Modify | Document uninstallation command |

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| PowerShell Isolated Cleanup | Run cleanup logic on isolated temp directory with mock targets | Verify all 7 paths and files are removed, while parent directories remain intact |
| Package Removal Logic | Check command detection (`pnpm`/`npm`) | Verify graceful handling without unexpected crashes |
