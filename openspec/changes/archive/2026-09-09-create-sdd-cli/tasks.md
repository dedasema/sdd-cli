# Tasks: Create SDD CLI

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~350 lines |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: stacked-to-main
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Complete functional SDD CLI with tests | Single PR | Greenfield implementation with tests and bundling |

## Phase 1: Setup & Scaffolding

- [x] 1.1 Create `package.json` with ESM type, `bin` definition, scripts, and runtime/dev dependencies (`commander`, `@clack/prompts`, `picocolors`, `tsup`, `vitest`, `@types/node`).
- [x] 1.2 Create `tsconfig.json` with strict typing and NodeNext module resolution.
- [x] 1.3 Create `tsup.config.ts` configured for ESM output with Node shebang.
- [x] 1.4 Run `pnpm install` to install and lock dependencies.

## Phase 2: Templates & Utilities

- [x] 2.1 Implement `src/utils/fs.ts` helper functions for directory creation, path resolution, and safe file writing.
- [x] 2.2 Implement `src/templates/agents.ts` providing the standard `AGENTS.md` instructions with strict SDD rules.
- [x] 2.3 Implement `src/templates/config.ts` providing the default `openspec/config.yaml` template.
- [x] 2.4 Implement `src/templates/change.ts` generating starter templates for `proposal.md`, `specs.md`, `design.md`, and `tasks.md`.

## Phase 3: CLI Commands & Routing

- [x] 3.1 Implement `src/commands/init.ts` to bootstrap `openspec/` hierarchy and root `AGENTS.md`.
- [x] 3.2 Implement `src/commands/new.ts` with kebab-case validation and change folder scaffolding.
- [x] 3.3 Implement `src/commands/status.ts` scanning active changes and reporting task checklist percentages.
- [x] 3.4 Implement `src/index.ts` declaring the Commander program, CLI flags, and subcommands.

## Phase 4: Automated Testing & Verification

- [x] 4.1 Implement `tests/commands.test.ts` with Vitest testing `init`, `new`, and `status` in isolated temporary directories.
- [x] 4.2 Execute `pnpm test` and verify that all test suites pass.
- [x] 4.3 Execute `pnpm build` and verify that `dist/index.js` is produced with executable permissions.
