# SDD CLI

> **Spec-Driven Development CLI for AI Agents** — Stop vibe-coding. Enforce architecture, specifications, and verifiable checklists before writing code.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![NPM Version](https://img.shields.io/npm/v/%40dedasema%2Fsdd-cli?color=cb3837&logo=npm)](https://www.npmjs.com/package/@dedasema/sdd-cli)
[![Built with TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-11.x-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)

---

## Why SDD?

When developers prompt AI agents (Cursor, Claude Code, Copilot, Antigravity, Windsurf) without structure, models often jump straight to generating code without architecture, tests, or contract verification.

**SDD CLI** solves this by scaffolding a deterministic specification workflow and injecting strict guidelines into `AGENTS.md` at the repository root. Any AI reading the repository is guided to follow the formal SDD lifecycle:
1. **Proposal** (`proposal.md`): Intent, scope, capabilities, and risks.
2. **Specifications** (`specs.md`): Formal requirements using RFC 2119 keywords and Given/When/Then scenarios.
3. **Design** (`design.md`): Technical approach, architectural tradeoffs, and data flow.
4. **Tasks** (`tasks.md`): Atomic, verifiable implementation checklist.

---

## Quick Start

### 🚀 Option 1: One-Line Universal Install (Recommended)

Installs the CLI globally **AND** interactively prompts you to choose which AI environments to configure (or install all with `A`):

- **[1] Antigravity 2.0** (`~/.gemini/config/skills/sdd/` + `/sdd`)
- **[2] Antigravity CLI (`agy`)** (`~/.gemini/skills/sdd/` + `/sdd`)
- **[3] OpenAI Codex** (`~/.codex/AGENTS.md` + skills)
- **[4] GitHub Copilot (VS Code)** (`~/.copilot/copilot-instructions.md` + skills)
- **[5] OpenCode** (`~/.config/opencode/AGENTS.md` + skills)
- **[6] Claude Code** (`~/.claude/CLAUDE.md` + `/sdd` command)
- **[7] Cursor** (`~/.cursor/rules/sdd.mdc` + skills)
- **[8] Zed** (`AGENTS.md` + `/sdd` command + skill)
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
- Or use the slash command: `/sdd <feature-name>`

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

### `sdd init`
Bootstraps the `openspec/` hierarchy in the current project:
- `openspec/specs/`: Source of truth for living specifications.
- `openspec/changes/`: Workspaces for active changes.
- `openspec/changes/archive/`: Completed changes.
- `openspec/config.yaml`: SDD lifecycle configuration.
- `AGENTS.md`: Strict rules instructing AI coding assistants to never write code without approved specifications.

### `sdd new <change-name>`
Creates a new change folder `openspec/changes/<change-name>/` with standardized starter templates:
- `proposal.md`
- `specs.md`
- `design.md`
- `tasks.md`

Enforces `kebab-case` naming to ensure consistency across operating systems.

### `sdd status`
Scans `openspec/changes/` and parses `tasks.md` files to display a visual completion percentage for every active change.

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
