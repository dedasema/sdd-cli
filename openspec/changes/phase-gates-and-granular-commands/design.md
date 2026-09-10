# Design: phase-gates-and-granular-commands

## Technical Approach

We establish a unified, structured SDD Assistant Protocol across all 8 supported AI environments, featuring deterministic state inspection, human-in-the-loop phase gates, exhaustive question resolution, and a 9-command granular slash suite (`sdd`, `sdd-init`, `sdd-new`, `sdd-propose`, `sdd-spec`, `sdd-design`, `sdd-tasks`, `sdd-verify`, `sdd-archive`).

### The 7-Phase Gated Lifecycle

```text
[Disk State Check: openspec/?]
       │
       ├─ No  ──> [sdd init] ──> [openspec/ created]
       │                                │
       └─ Yes ──────────────────────────┤
                                        ▼
                                 [sdd new <feature>]
                                        │
                                        ▼
  ┌─────────────────────────── [1. Proposal Phase] ──────────────────────────┐
  │ 1. AI resolves ambiguities (asks clarifying questions until doubts = 0)  │
  │ 2. AI writes proposal.md                                                 │
  │ 3. GATE: "Proposal ready. Do you approve proceeding to Specifications?"  │
  └─────────────────────────────────────┬────────────────────────────────────┘
                                        ▼ (User: Yes)
  ┌─────────────────────────── [2. Specs Phase] ─────────────────────────────┐
  │ 1. AI writes specs.md (RFC 2119 + Given/When/Then scenarios)             │
  │ 2. GATE: "Specifications ready. Do you approve proceeding to Design?"    │
  └─────────────────────────────────────┬────────────────────────────────────┘
                                        ▼ (User: Yes)
  ┌─────────────────────────── [3. Design Phase] ────────────────────────────┐
  │ 1. AI writes design.md (Architecture, Tradeoffs, File Changes)           │
  │ 2. GATE: "Design ready. Do you approve proceeding to Tasks checklist?"   │
  └─────────────────────────────────────┬────────────────────────────────────┘
                                        ▼ (User: Yes)
  ┌─────────────────────────── [4. Tasks Phase] ─────────────────────────────┐
  │ 1. AI writes tasks.md (Atomic, verifiable checkbox checklist)            │
  │ 2. GATE: "Tasks checklist ready. Do you approve starting Implementation?"│
  └─────────────────────────────────────┬────────────────────────────────────┘
                                        ▼ (User: Yes)
  ┌─────────────────────────── [5. Apply Phase] ─────────────────────────────┐
  │ 1. AI implements code task by task, marking [x] in tasks.md              │
  └─────────────────────────────────────┬────────────────────────────────────┘
                                        ▼
  ┌─────────────────────────── [6. Verify Phase] ────────────────────────────┐
  │ 1. AI runs test suite, static type checks, and spec compliance audit     │
  │ 2. If failures exist -> AI remediates until green                        │
  │ 3. GATE: "All tests pass and specs verified. Do you approve archiving?"  │
  └─────────────────────────────────────┬────────────────────────────────────┘
                                        ▼ (User: Yes)
  ┌─────────────────────────── [7. Archive Phase] ───────────────────────────┐
  │ 1. AI moves change to openspec/changes/archive/YYYY-MM-DD-<feature>/     │
  │ 2. AI updates main living specs in openspec/specs/                       │
  └──────────────────────────────────────────────────────────────────────────┘
```

## Architecture Decisions

| Decision | Choice | Alternatives Considered | Rationale |
|---|---|---|---|
| Command Suite Topology | 9 distinct slash commands (`sdd`, `sdd-init`, `sdd-new`, `sdd-propose`, `sdd-spec`, `sdd-design`, `sdd-tasks`, `sdd-verify`, `sdd-archive`) | Single monolithic `/sdd` command only | Allows developers to trigger specific phases directly when iterating or resuming, while `/sdd` remains the smart orchestrator. |
| Zed Slash Commands Provisioning | Inject all 9 commands under `assistant.slash_commands` in `settings.json` via Node.js stdin stream | Multiple regex replacements or full file rewrites | Preserves existing user settings, comments, and handles JSONC trailing commas safely. |
| Claude Code Slash Commands Provisioning | Generate individual markdown command files in `~/.claude/commands/sdd-*.md` | Single file with parameter passing | Claude Code parses each `.md` file in `commands/` as a distinct native `/command`. |
| Antigravity & agy Provisioning | Provision skills/commands in `~/.gemini/config/skills/` and `~/.gemini/skills/` | Single skill only | Antigravity natively exposes skills as slash commands in the chat UI. |
| Cursor Provisioning | `~/.cursor/rules/sdd.mdc` with `alwaysApply: true` and trigger mapping | Workspace-only `.cursorrules` | Applies universally across all repositories on the developer machine. |
| Codex, Copilot, OpenCode Provisioning | Unified delimited `AGENTS.md` and `copilot-instructions.md` with explicit phase directives | Per-project setup only | Gives every agent omnipresent knowledge of the 7 gated phases and slash triggers. |
| State-on-Disk Authority | Filesystem presence of `openspec/` dictates bootstrap | Session memory or environment variables | Filesystem state is persistent across chat resets, editor restarts, and team collaboration. |
| Archival Gate | Mandatory user approval following verification | Automatic archival upon task completion | Prevents accidental premature archival of unverified or broken changes. |

## Support Matrix Across All 8 AI Environments

| Environment | Global Rule File | Slash Commands / Triggers | Skills Path |
|---|---|---|---|
| **[1] Antigravity 2.0** | Handled via global skills | `/sdd`, `/sdd-*` exposed via skill catalog | `~/.gemini/config/skills/sdd/` |
| **[2] Antigravity CLI (`agy`)** | Handled via global skills | `/sdd`, `/sdd-*` exposed via CLI skills | `~/.gemini/skills/sdd/` |
| **[3] OpenAI Codex** | `~/.codex/AGENTS.md` (Delimited) | Directives recognize `/sdd` & `/sdd-*` | `~/.codex/skills/sdd/` |
| **[4] GitHub Copilot** | `~/.copilot/copilot-instructions.md` (Delimited) | Directives recognize `/sdd` & `/sdd-*` | `~/.copilot/skills/sdd/` |
| **[5] OpenCode** | `~/.config/opencode/AGENTS.md` (Delimited) | Directives recognize `/sdd` & `/sdd-*` | `~/.config/opencode/skills/sdd/` |
| **[6] Claude Code** | `~/.claude/CLAUDE.md` (Delimited) | Native files `~/.claude/commands/sdd-*.md` | `~/.claude/skills/sdd/` |
| **[7] Cursor** | `~/.cursor/rules/sdd.mdc` (`alwaysApply: true`) | Directives recognize `/sdd` & `/sdd-*` | `~/.cursor/skills/sdd/` |
| **[8] Zed** | `%APPDATA%/Zed/AGENTS.md` (Delimited) | `settings.json` (`assistant.slash_commands.*`) | `%APPDATA%/Zed/skills/sdd/` |

## File Changes

| File | Action | Description |
|---|---|---|
| `src/commands/init.ts` | Modify | Update embedded `AGENTS.md` template with the 7-phase gated protocol and clarification rules. |
| `scripts/install.ps1` | Modify | Provision the 9 granular slash commands in Zed and Claude Code; update global rule blocks for all 8 environments. |
| `scripts/install.sh` | Modify | Bash counterpart provisioning 9 granular commands in Zed and Claude Code with updated rules. |
| `scripts/uninstall.ps1` | Modify | Purge all 9 slash commands from Zed `settings.json` and all `sdd-*.md` files from Claude Code. |
| `scripts/uninstall.sh` | Modify | Bash counterpart removing all 9 slash commands from Zed and Claude Code cleanly. |
| `openspec/specs/installer/spec.md` | Modify | Update main installer living spec with the multi-command suite and interactive gates. |

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit / CLI | `sdd init`, `sdd new`, `sdd status` | Vitest test suite (`tests/commands.test.ts`). |
| JSONC Manipulation | Zed multi-command injection & removal | Test with mocks containing comments, trailing commas, and verify clean addition and symmetrical removal. |
| PowerShell Execution | `install.ps1` & `uninstall.ps1` syntax | Validate in PowerShell with `-DryRun` or isolated sandbox paths. |
