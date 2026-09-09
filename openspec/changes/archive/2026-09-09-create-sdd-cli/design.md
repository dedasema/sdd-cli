# Design: Create SDD CLI

## Technical Approach

Develop a lightweight, zero-runtime-dependency CLI using Node.js, TypeScript (pure ESM), and `commander`. The CLI exposes commands `init`, `new`, and `status`. Templates are stored as pure TypeScript string constants to allow compilation by `tsup` into a self-contained executable under `dist/index.js` with shebang `#!/usr/bin/env node`.

## Architecture Decisions

| Decision | Choice | Alternatives Considered | Rationale |
|---|---|---|---|
| **CLI Framework** | `commander` + `@clack/prompts` | `yargs`, `cac`, raw `process.argv` | `commander` provides robust POSIX argument parsing; `@clack/prompts` gives a modern, beginner-friendly terminal UX. |
| **Bundling** | `tsup` (esbuild) | `tsc`, `rollup`, `webpack` | Extremely fast, tree-shakes dependencies, bundles into a single file with native Node shebang. |
| **Templates** | Embedded TypeScript strings | External `.md` template files | External asset files break or require complex file copying in `npx` / packaged bundles. Embedded strings are 100% type-safe and self-contained. |
| **Testing** | `vitest` | `jest`, `mocha` | Native ESM and TypeScript support with instant startup and clean mocking of filesystem modules. |

## Data Flow

```text
User Input: `sdd init` / `sdd new` / `sdd status`
                     │
                     ▼
             src/index.ts (CLI entry)
                     │
      ┌──────────────┼──────────────┐
      ▼              ▼              ▼
src/commands/  src/commands/  src/commands/
   init.ts        new.ts        status.ts
      │              │              │
      ├──────────────┴──────────────┤
      ▼                             ▼
src/templates/                node:fs / node:path
(Markdown & config assets)    (Filesystem I/O)
      │                             │
      ▼                             ▼
  `AGENTS.md` &               `openspec/`
`openspec/config.yaml`    changes & task tracking
```

## File Changes

| File | Action | Description |
|---|---|---|
| `package.json` | Create | Package metadata, dependencies, scripts, and `bin` definition |
| `tsconfig.json` | Create | Strict NodeNext TypeScript configuration |
| `tsup.config.ts` | Create | Bundler config targeting Node ESM with shebang injection |
| `src/index.ts` | Create | Main CLI program declaration and command routing |
| `src/commands/init.ts` | Create | Command handler for `sdd init` |
| `src/commands/new.ts` | Create | Command handler for `sdd new <change-name>` |
| `src/commands/status.ts` | Create | Command handler for `sdd status` |
| `src/templates/agents.ts` | Create | Standard `AGENTS.md` template enforcing SDD for LLMs |
| `src/templates/config.ts` | Create | Standard `openspec/config.yaml` template |
| `src/templates/change.ts` | Create | Templates for `proposal.md`, `specs.md`, `design.md`, `tasks.md` |
| `src/utils/fs.ts` | Create | Helper utilities for directory creation and safe file writing |
| `tests/commands.test.ts` | Create | Unit and integration tests for all commands |

## Interfaces / Contracts

```typescript
export interface ChangeTaskSummary {
  changeName: string;
  totalTasks: number;
  completedTasks: number;
  percentage: number;
  hasTasksFile: boolean;
}

export interface CommandOptions {
  cwd?: string;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | Template generators & kebab-case validator | Validate output strings and regex matching |
| Integration | `init`, `new`, and `status` command execution | Execute against a temporary directory (`node:os.tmpdir()`), verifying generated files, directory trees, and console metrics |

## Migration / Rollout

No migration required (greenfield project). Published to npm registry or executed directly via `pnpm dlx sdd` / `npx sdd`.

## Open Questions

None.
