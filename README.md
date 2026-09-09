# SDD CLI

> **Spec-Driven Development CLI for AI Agents** — Stop vibe-coding. Enforce architecture, specifications, and verifiable checklists before writing code.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
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

You can run SDD directly with `npx` or `pnpm dlx` without installing:

```bash
# 1. Initialize SDD and inject AGENTS.md guidelines in your repository
npx sdd init

# 2. Create a new change workspace with phase templates
npx sdd new user-authentication

# 3. Check progress on active tasks
npx sdd status
```

Or install it globally:

```bash
pnpm add -g sdd
# or
npm install -g sdd
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
