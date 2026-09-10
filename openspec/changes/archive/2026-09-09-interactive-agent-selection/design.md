# Design: Interactive Agent & IDE Selection

## Technical Approach

Introduce an interactive selection stage immediately after global CLI package installation and prior to file provisioning. The installer defines a lookup table mapping numbers 1 through 7 to the respective agent directories and specialized asset rules.

Input parsing handles comma and space delimiters, normalizes tokens, and safely falls back to "All" on empty input or non-interactive terminals.

## Target Mapping Specification

| ID | Environment | Skill Directory | Specialized File |
|---|---|---|---|
| **1** | Antigravity 2.0 | `~/.gemini/config/skills/sdd` | None |
| **2** | Antigravity CLI (`agy`) | `~/.gemini/skills/sdd` | None |
| **3** | OpenAI Codex | `~/.codex/skills/sdd` | None |
| **4** | GitHub Copilot (VS Code) | `~/.copilot/skills/sdd` | None |
| **5** | OpenCode | `~/.config/opencode/skills/sdd` | None |
| **6** | Claude Code | `~/.claude/skills/sdd` | `~/.claude/commands/sdd.md` |
| **7** | Cursor | `~/.cursor/skills/sdd` | `~/.cursor/rules/sdd.mdc` |

## Interactive Input Handling

### PowerShell (`install.ps1` & `uninstall.ps1`)
- Use `Read-Host` with prompt: `Choice(s) [e.g. 1,6,7 or A (Default)]: `
- Split input string by `[, ]+`
- Filter valid numeric values between 1 and 7.
- If input is empty, contains `A` or `a`, or yields no valid numbers, select all keys `1..7`.

### Bash (`install.sh` & `uninstall.sh`)
- Check if running attached to terminal (`[ -t 0 ]`), or if `/dev/tty` character device is accessible.
- If interactive, read from `/dev/tty`: `read -r raw_choice < /dev/tty`.
- If non-interactive (e.g. headless CI), default to `A`.
- Parse tokens, extracting matches `1..7`.

## File Changes

| File | Action | Description |
|---|---|---|
| `scripts/install.ps1` | Modify | Add interactive menu and conditional provisioning loop |
| `scripts/install.sh` | Modify | Add interactive menu with `/dev/tty` and conditional provisioning loop |
| `scripts/uninstall.ps1` | Modify | Add interactive selection to purge only chosen environments or all |
| `scripts/uninstall.sh` | Modify | Add interactive selection to purge only chosen environments or all |
| `README.md` | Modify | Document interactive selection feature |

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| PowerShell Parsing | Test input values: `""`, `"A"`, `"7"`, `"1,6"`, `"1 7"`, `"invalid"` | Unit test token parser in PowerShell |
| Selective File Writing | Verify only chosen folders are created | Execute against temp folder with `1,7` selected |
| Selective Deletion | Verify only chosen folders are deleted on uninstall | Execute uninstaller logic against temp folder |
