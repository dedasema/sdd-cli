# Proposal: Full Lifecycle & DX Enhancements

## Intent
Elevate the developer experience (DX) and complete the Spec-Driven Development lifecycle across all supported editors and AI environments by providing:
1. Phase-aware status reporting with a visual artifact pipeline.
2. An interactive, zero-crash CLI experience for commands when arguments are omitted.
3. Anti-WIP guardrail to prevent accumulating unmanaged, incomplete changes.
4. Deterministic `sdd verify` and `sdd archive` commands with automatic promotion of living specs to `openspec/specs/`.
5. Safe, non-destructive injection into existing `AGENTS.md` files upon `sdd init`.
6. Default execution of `sdd status` when `sdd` is run without arguments in an initialized repository.

## Scope
### In Scope
- `sdd status`: Detect active phase (`Proposal`, `Specs`, `Design`, `Tasks`, `Apply`, `Verify`) and render artifact status pipeline (`✓`, `⏳`, `·`).
- `sdd new [change-name]`: Make argument optional with `@clack/prompts` interactive fallback; check for active changes and warn if WIP exists.
- `sdd verify [change-name]`: Audit presence of all 4 artifacts, verify 100% completion of checklist in `tasks.md`, and report structured validation results.
- `sdd archive [change-name]`: Validate task completion (with `--force` override), promote `specs.md` to `openspec/specs/<change-name>.md`, and move change folder to `openspec/changes/archive/YYYY-MM-DD-<change-name>/`.
- `sdd init`: Check if `AGENTS.md` already exists; if so, inject SDD rules delimited by `<!-- sdd-rules:start -->` and `<!-- sdd-rules:end -->` instead of skipping.
- `sdd` default command: If run without arguments in an initialized project, execute `statusCommand()`.
- Update provisioning (`src/utils/provisioner.ts`) across all 8 supported AI environments (Zed, Cursor, Claude Code, Antigravity 2.0, agy, OpenAI Codex, GitHub Copilot, OpenCode) to support these capabilities.
- Add test coverage in `tests/commands.test.ts`.

### Out of Scope
- Remote or cloud synchronization of specs (local repository is the source of truth).
- Terminal graphical TUI / dashboard (keep output clean, fast, and ANSI-colored via picocolors and clack).

## Affected Capabilities & Target Files
- CLI Entrypoint: `src/index.ts`
- Status Command: `src/commands/status.ts`
- New Command: `src/commands/new.ts`
- Init Command: `src/commands/init.ts`
- Verify Command: `src/commands/verify.ts` [NEW]
- Archive Command: `src/commands/archive.ts` [NEW]
- Multi-environment Provisioner: `src/utils/provisioner.ts`
- Test Suite: `tests/commands.test.ts`

## Risks & Tradeoffs
- **Interactive vs Automated/CI Usage**: Commands must support non-interactive / silent execution (`--silent` or flags) without blocking for input when used in scripts or automated pipelines.
- **Spec Name Collisions in `openspec/specs/`**: When archiving, if `openspec/specs/<change-name>.md` already exists (e.g. updating an existing capability), archive should overwrite/update living specs with delta specs.
