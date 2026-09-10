# Tasks: Full Lifecycle & DX Enhancements

## 1. Status Command Upgrades (`src/commands/status.ts`)
- [x] 1.1 Implement `computePhase` state machine function to determine phase from existing artifacts and task progress.
- [x] 1.2 Implement visual artifact pipeline rendering (`✓`, `⏳`, `·`).
- [x] 1.3 Update `ChangeStatusResult` interface and return structured phase and artifact metadata.
- [x] 1.4 Format console log output with bold change names, phases, visual pipelines, and task counts.

## 2. Interactive UX & Anti-WIP Guardrail (`src/commands/new.ts`)
- [x] 2.1 Allow optional `changeName` argument with `@clack/prompts` interactive text fallback.
- [x] 2.2 Detect active WIP changes in `openspec/changes/` and prompt confirmation warning when running interactively.
- [x] 2.3 Maintain silent mode execution for headless scripts and tests.

## 3. Verify Command Implementation (`src/commands/verify.ts`)
- [x] 3.1 Implement `verifyCommand` with change resolution (auto-select if single active, or interactive selection).
- [x] 3.2 Audit presence of `proposal.md`, `specs.md`, `design.md`, and `tasks.md`.
- [x] 3.3 Audit task completion in `tasks.md` (fail if any `- [ ]` remain).
- [x] 3.4 Return structured verification results and render formatted step indicators.

## 4. Archive Command & Living Specs Promotion (`src/commands/archive.ts`)
- [x] 4.1 Implement `archiveCommand` with target change auto-selection or interactive selection.
- [x] 4.2 Verify task completion before archiving (with `--force` or interactive confirmation).
- [x] 4.3 Promote `specs.md` to `openspec/specs/<change-name>.md`.
- [x] 4.4 Move change workspace to `openspec/changes/archive/YYYY-MM-DD-<change-name>/`.

## 5. Non-Destructive Init (`src/commands/init.ts`)
- [x] 5.1 Check for existing `AGENTS.md` and inject SDD guidelines inside `<!-- sdd-rules:start -->` and `<!-- sdd-rules:end -->` tags if not already present.
- [x] 5.2 Ensure clean preservation of all user-defined guidelines in `AGENTS.md`.

## 6. CLI Entrypoint & Default Action (`src/index.ts`)
- [x] 6.1 Register `verify [change-name]` command with optional arguments and options.
- [x] 6.2 Register `archive [change-name]` command with optional arguments and options.
- [x] 6.3 Update `new [change-name]` to make `change-name` optional in Commander.
- [x] 6.4 Implement default action to run `statusCommand()` when `sdd` is invoked with no arguments in an initialized project.

## 7. Multi-Environment Provisioning (`src/utils/provisioner.ts`)
- [x] 7.1 Update Zed, Cursor, Claude Code, Antigravity 2.0, agy, Codex, Copilot, and OpenCode instruction templates with `verify`, `archive`, and Living Specs documentation.
- [x] 7.2 Ensure universal consistency across all 8 supported environments.

## 8. Test Suite & Verification (`tests/commands.test.ts`)
- [x] 8.1 Add unit/integration tests for `statusCommand` with phase detection and pipeline visualization.
- [x] 8.2 Add integration tests for `verifyCommand` (success on 100% tasks, failure on incomplete tasks).
- [x] 8.3 Add integration tests for `archiveCommand` (verifying folder archival and living specs promotion).
- [x] 8.4 Add integration tests for `initCommand` safe injection into existing `AGENTS.md`.
- [x] 8.5 Add integration tests for `newCommand` anti-WIP warning logic.
- [x] 8.6 Run complete test suite (`pnpm test`), compile build (`pnpm build`), and provision local environment (`node dist/index.js setup --all --silent`).
