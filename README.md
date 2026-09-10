# SDD CLI

> **Spec-Driven Development CLI for AI Agents** — Stop vibe-coding. Enforce architecture, specifications, and verifiable checklists before writing code.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![NPM Version](https://img.shields.io/npm/v/%40dedasema%2Fsdd-cli?color=cb3837&logo=npm)](https://www.npmjs.com/package/@dedasema/sdd-cli)
[![Built with TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-11.x-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)

---

## Why SDD?

When developers prompt AI agents (Cursor, Claude Code, Copilot, Antigravity, OpenCode, Zed) without structure, models often jump straight to generating code without architecture, tests, or contract verification.

**SDD CLI** solves this by scaffolding a deterministic specification workflow and injecting strict guidelines into `AGENTS.md` at the repository root. Any AI reading the repository is guided through an interactive, human-in-the-loop lifecycle with mandatory checkpoints:

1. **Bootstrap & Inspection**: Deterministically checks if `openspec/` exists on disk. Automatically runs `sdd init` only once if missing.
2. **Clarification Loop**: If the AI has open questions, it must ask the developer and resolve all ambiguities before proposing phase progression.
3. **Proposal** (`proposal.md`): Intent, scope (in/out), and risks. *(Gate: requires explicit user approval before specs)*.
4. **Specifications** (`specs.md`): Formal requirements using RFC 2119 keywords and Given/When/Then test scenarios. *(Gate: requires explicit user approval before design)*.
5. **Design** (`design.md`): Technical approach, architectural tradeoffs, and target files. *(Gate: requires explicit user approval before tasks)*.
6. **Tasks** (`tasks.md`): Atomic, verifiable implementation checklist. *(Gate: requires explicit user approval before coding)*.
7. **Apply** (`sdd-apply`): Step-by-step implementation per `tasks.md`, marking `- [x]` as completed. *(Gate: requires explicit user approval before verification)*.
8. **Verify** (`sdd-verify`): Automated test execution, static analysis, and spec compliance audits. Remediates failures until green.
9. **Gated Archive** (`sdd-archive`): Change is archived to `openspec/changes/archive/` and living specs in `openspec/specs/` are updated only after explicit developer approval.

### 🌐 Language Contract
All generated AI assistants and skills enforce a strict language contract:
- **Developer Communication**: Spanish by default, ensuring natural collaboration with warm tone.
- **Technical Integrity**: Standard industry software engineering terms remain in English (`specs`, `tests`, `design`, `tasks`, `bug`, `refactor`, `commit`, `PR`, etc.).
- **Code & Artifacts**: Technical code and documentation artifacts are written in clean English.

---

## Quick Start

### 🚀 Option 1: One-Line Universal Install (Recommended)

Installs the CLI globally **AND** interactively prompts you to choose which AI environments to configure (or install all with `A`):

- **[1] Antigravity 2.0** (`~/.gemini/config/skills/sdd/` + `/sdd` and `/sdd-*` commands)
- **[2] Antigravity CLI (`agy`)** (`~/.gemini/skills/sdd/` + `/sdd` and `/sdd-*` commands)
- **[3] OpenAI Codex** (`~/.codex/AGENTS.md` + skills)
- **[4] GitHub Copilot (VS Code)** (`~/.copilot/copilot-instructions.md` + skills)
- **[5] OpenCode** (`~/.config/opencode/AGENTS.md` + skills)
- **[6] Claude Code** (`~/.claude/CLAUDE.md` + 10 native `/sdd*` commands)
- **[7] Cursor** (`~/.cursor/rules/sdd.mdc` + skills)
- **[8] Zed** (`AGENTS.md` + 10 slash commands under `~/.agents/skills/` and settings)
- **[A] All environments** (Default — just press Enter)

**Windows (PowerShell):**
```powershell
irm https://raw.githubusercontent.com/dedasema/sdd-cli/main/scripts/install.ps1 | iex
```

**macOS / Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/dedasema/sdd-cli/main/scripts/install.sh | bash
```

Once installed, open any project in your preferred editor/agent and type in chat:
- `"Quiero empezar este proyecto con SDD"`
- Or use any of the 10 slash commands:
  - `/sdd`: Smart orchestrator (audits repo state, inits if missing, creates change, or resumes active phase; strictly ONE phase per turn)
  - `/sdd-init`: Initialize OpenSpec structure and AGENTS.md
  - `/sdd-new <feature>`: Scaffold a new change workspace
  - `/sdd-propose`: Draft or refine proposal (`proposal.md`)
  - `/sdd-spec`: Draft Given/When/Then scenarios (`specs.md`)
  - `/sdd-design`: Draft technical architecture decisions (`design.md`)
  - `/sdd-tasks`: Break down implementation checklist (`tasks.md`)
  - `/sdd-apply`: Implement code per tasks checklist and check off `- [x]`
  - `/sdd-verify`: Run test suites and audit compliance against specs
  - `/sdd-archive`: Formally verify and archive change into `openspec/changes/archive/`

Your AI will handle initialization and scaffolding autonomously in the background. Zero terminal required!

---

### Option 2: Run directly with `npx` (No installation needed)

```bash
# 1. Initialize SDD and inject AGENTS.md guidelines in your repository
npx @dedasema/sdd-cli init

# 2. Create a new change workspace with phase templates
npx @dedasema/sdd-cli new user-authentication

# 3. Check progress on active tasks
npx @dedasema/sdd-cli status
```

### Option 3: Install globally via npm/pnpm

```bash
# Install once globally
npm install -g @dedasema/sdd-cli
# or with pnpm:
pnpm add -g @dedasema/sdd-cli

# Now use the short `sdd` command anywhere:
sdd init
sdd new user-authentication
sdd status
```

---

## Commands

### `sdd` (Default)
When run without subcommands in an initialized repository, `sdd` automatically runs `sdd status`.

### `sdd init`
Bootstraps the `openspec/` hierarchy in the current project:
- `openspec/specs/`: Source of truth for living specifications.
- `openspec/changes/`: Workspaces for active changes.
- `openspec/changes/archive/`: Completed changes.
- `openspec/config.yaml`: SDD lifecycle configuration.
- `AGENTS.md`: Non-destructively injected with strict SDD guidelines using delimiter tags (`<!-- sdd-rules:start -->`).

### `sdd new [change-name]`
Creates a new change folder `openspec/changes/<change-name>/` with initial `proposal.md` only (subsequent artifacts are created Just-In-Time per phase).
- If `<change-name>` is omitted, prompts interactively for a kebab-case name.
- If active work-in-progress changes exist, displays a warning to prevent accumulating unmanaged WIP.

### `sdd status`
Scans `openspec/changes/`, deterministically detects the current active phase (`Proposal`, `Specs`, `Design`, `Tasks`, `Apply`, `Verify`), renders a visual artifact pipeline (`proposal.md ✓ | specs.md ✓ | design.md ⏳ | tasks.md ·`), and calculates task progress.

### `sdd verify [change-name]`
Audits target change (auto-selects if single active):
- Verifies that all 4 artifacts exist and are non-empty.
- Verifies that 100% of task checklist items in `tasks.md` are marked completed (`- [x]`).

### `sdd archive [change-name]`
Closes the change lifecycle (auto-selects if single active):
- Verifies task completion (requires confirmation or `-f, --force` if incomplete).
- Promotes delta specs to living specifications in `openspec/specs/<change-name>.md`.
- Moves the change directory to `openspec/changes/archive/YYYY-MM-DD-<change-name>/`.

---

## Uninstallation

To remove the SDD CLI and selectively or completely purge globally provisioned skills, rules, and commands:

**Windows (PowerShell):**
```powershell
irm https://raw.githubusercontent.com/dedasema/sdd-cli/main/scripts/uninstall.ps1 | iex
```

**macOS / Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/dedasema/sdd-cli/main/scripts/uninstall.sh | bash
```

---

## Development

```bash
# Clone repository
git clone https://github.com/dedasema/sdd-cli.git
cd sdd-cli

# Install dependencies
pnpm install

# Run tests
pnpm test

# Build executable bundle
pnpm build
```

---

## License

MIT © [dedasema](https://github.com/dedasema)
