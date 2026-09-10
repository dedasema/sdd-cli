# Design: Single-Line Installer and Global Editor Integration

## Technical Approach

Create standalone, POSIX-compliant (`install.sh`) and PowerShell (`install.ps1`) scripts hosted in the repository under `scripts/`. These scripts inspect the local system environment, execute global package installation via `pnpm` or `npm`, resolve the user's home directory across operating systems, and write global AI agent skill/rule definitions into the configuration directories of Cursor and Claude Code.

## Architecture Decisions

| Decision | Choice | Alternatives Considered | Rationale |
|---|---|---|---|
| **Script Dialects** | PowerShell (`.ps1`) for Windows, Shell (`.sh`) for macOS/Linux | Node.js script only, Python script | Windows users running `irm ... \| iex` have PowerShell natively; Unix users running `curl ... \| bash` have sh/bash natively. No compilation or initial runtime bootstrapping needed. |
| **Cursor Integration** | `~/.cursor/rules/sdd.mdc` | Project-only `.cursorrules` | Global rule directory applies to all workspaces opened in Cursor, allowing the AI to know about `sdd` before `AGENTS.md` exists. |
| **Claude Integration** | `~/.claude/commands/sdd.md` | Manual prompt copy | Standard slash-command folder for Claude Code CLI. Enables typing `/sdd` in the chat. |
| **Package Manager Order** | Prefer `pnpm`, fallback to `npm` | Force `npm` only | Respects developer tooling preference while ensuring universal compatibility. |

## Data Flow

```text
User executes: `irm ... | iex`  OR  `curl ... | bash`
                      │
                      ▼
               Check Node.js
             (abort if missing)
                      │
                      ▼
         Install @dedasema/sdd-cli
             (pnpm add -g / npm i -g)
                      │
                      ▼
          Resolve $HOME / $USERPROFILE
                      │
         ┌────────────┴────────────┐
         ▼                         ▼
~/.cursor/rules/sdd.mdc   ~/.claude/commands/sdd.md
 (Cursor Global Rule)     (Claude Slash Command)
```

## File Changes

| File | Action | Description |
|---|---|---|
| `scripts/install.ps1` | Create | Windows PowerShell installer script |
| `scripts/install.sh` | Create | macOS / Linux bash installer script |
| `src/templates/agents.ts` | Modify | Update `AGENTS.md` template so AI executes `sdd new` autonomously |
| `README.md` | Modify | Add one-line install snippets at the top of Quick Start |

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| PowerShell Syntax | `install.ps1` execution | Run in dry-run/verification mode or test function blocks |
| Shell Syntax | `install.sh` linting/check | Validate POSIX syntax and variable handling |
| Template Verification | `src/templates/agents.ts` | Vitest suite validating that the generated string instructs the AI to run `sdd new` |

## Open Questions

None.
