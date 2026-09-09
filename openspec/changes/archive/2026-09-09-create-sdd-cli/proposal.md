# Proposal: Create SDD CLI

## Intent

Developers unfamiliar with Spec-Driven Development (SDD) often let AI assistants jump straight to code generation ("vibe coding") without architectural planning or verifiable requirements. This change creates an agnostic CLI tool in TypeScript (using `pnpm`) that scaffolds project specifications and injects standard `AGENTS.md` instructions so any AI assistant guides the developer through the SDD lifecycle.

## Scope

### In Scope
- Project setup with TypeScript, ESM, `pnpm`, and `tsup` bundler.
- Command `sdd init`: scaffolds `openspec/` directories, `config.yaml`, and agent contract `AGENTS.md`.
- Command `sdd new <change-name>`: scaffolds change directory with `proposal.md`, `specs.md`, `design.md`, and `tasks.md`.
- Command `sdd status`: reports active changes and checklist progress.
- Unit and integration tests with `vitest`.

### Out of Scope
- GUI/Web dashboard (strictly CLI).
- Proprietary IDE extensions (agnostic markdown/agent standards only).
- Remote cloud synchronization or Git hosting integrations.

## Capabilities

### New Capabilities
- `cli-init`: Scaffolding of project structure, SDD configuration, and root `AGENTS.md` agent contract.
- `cli-new`: Generation of structured change workspaces with standardized phase templates.
- `cli-status`: Inspection of local change states and parsing of completed markdown tasks.

### Modified Capabilities
None

## Approach

Build a modular Node.js CLI executable via `commander` and styled with `@clack/prompts` and `picocolors`. Templates will be embedded as pure ESM string constants or text templates. Bundling will use `tsup` to generate a single zero-dependency executable with a shebang for direct execution or `npx` consumption.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `package.json`, `tsconfig.json`, `tsup.config.ts` | New | Project scaffolding, build, and script configuration |
| `src/index.ts` | New | CLI entry point and command registration |
| `src/commands/` | New | Command implementations (`init.ts`, `new.ts`, `status.ts`) |
| `src/templates/` | New | Standardized templates for SDD phases and `AGENTS.md` |
| `tests/` | New | Automated test suite using Vitest |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| AI agents ignoring `AGENTS.md` rules | Med | Use strict, concise prompt conventions with RFC 2119 keywords |
| OS path incompatibilities (Windows/POSIX) | Low | Use `node:path` and normalize paths across all file operations |

## Rollback Plan

Delete `openspec/changes/create-sdd-cli/` and remove generated source files via `git clean -fd`.

## Dependencies

- Node.js >= 18
- `pnpm` >= 9
- `commander`, `@clack/prompts`, `picocolors`, `tsup`, `vitest`

## Success Criteria

- [ ] `sdd init` creates valid `openspec/` hierarchy and `AGENTS.md`.
- [ ] `sdd new <name>` creates complete change directory with valid phase templates.
- [ ] `sdd status` accurately calculates task checklist completion percentage.
- [ ] 100% of automated tests pass in `vitest`.
