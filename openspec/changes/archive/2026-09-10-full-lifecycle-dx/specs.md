# Specifications: Full Lifecycle & DX Enhancements

## 1. Status Command (`sdd status`)

### Requirements
- The status command MUST inspect all active change folders under `openspec/changes/` (excluding `archive`).
- The status command MUST determine the active phase for each change based on existing artifacts:
  - If `tasks.md` exists:
    - If task completion is 100% (total > 0): Phase is `Verify`.
    - If task completion > 0% and < 100%: Phase is `Apply`.
    - If task completion is 0%: Phase is `Tasks`.
  - If `design.md` exists and `tasks.md` does not: Phase is `Design`.
  - If `specs.md` exists and `design.md` does not: Phase is `Specs`.
  - If only `proposal.md` exists: Phase is `Proposal`.
- The status command MUST display a visual pipeline indicator for artifacts in each active change:
  - `✓` for existing artifacts.
  - `⏳` for the current phase artifact.
  - `·` for pending subsequent artifacts.
- The status command MUST return structured metadata containing `phase`, `artifacts`, and `taskProgress` in programmatic results.

### Scenarios

#### Scenario 1.1: Change in Design Phase
- **Given** an active change directory `openspec/changes/billing/` containing `proposal.md` and `specs.md`
- **When** the developer executes `sdd status`
- **Then** the output MUST display `billing` in phase `Design`
- **And** the visual artifact indicator MUST render `proposal.md ✓ | specs.md ✓ | design.md ⏳ | tasks.md ·`

#### Scenario 1.2: Change in Apply Phase with partial progress
- **Given** an active change `user-auth` containing all 4 documents and `tasks.md` with 2 of 4 tasks completed
- **When** the developer executes `sdd status`
- **Then** the output MUST display `user-auth` in phase `Apply` with `2/4 tasks (50%)`

---

## 2. New Command (`sdd new`)

### Requirements
- The change name argument MUST be optional.
- If the change name is omitted in an interactive terminal, the command MUST prompt the user for a kebab-case change name via `@clack/prompts`.
- If one or more active changes already exist in `openspec/changes/`, the command MUST display a warning indicating existing work-in-progress (WIP).
- In interactive mode, it MUST ask the user to confirm before creating an additional change when WIP exists.
- In silent mode, existing WIP MUST NOT block creation unless explicitly configured.
- The command MUST continue to generate `proposal.md` ONLY (Just-In-Time progressive creation).

### Scenarios

#### Scenario 2.1: Missing change name in interactive mode
- **Given** no change name is provided to `sdd new`
- **When** running in an interactive TTY
- **Then** `@clack/prompts` MUST prompt: "Enter change name (kebab-case)"
- **And** it MUST validate kebab-case before scaffolding `proposal.md`

#### Scenario 2.2: Existing WIP warning
- **Given** `openspec/changes/billing` is currently active
- **When** the developer runs `sdd new checkout` in interactive mode
- **Then** the CLI MUST display a warning indicating that `billing` is currently in progress
- **And** it MUST require developer confirmation to proceed

---

## 3. Verify Command (`sdd verify`)

### Requirements
- The verify command MUST inspect the target change folder.
- If no change name is specified:
  - If exactly 1 active change exists, it MUST automatically verify that change.
  - If multiple active changes exist in interactive mode, it MUST prompt the developer to select one.
  - If multiple active changes exist in silent mode, it MUST error requesting the change name.
- The command MUST verify that `proposal.md`, `specs.md`, `design.md`, and `tasks.md` exist and are non-empty.
- The command MUST verify that all tasks in `tasks.md` are marked completed (`- [x]` or `- [X]`).
- If any task is uncompleted (`- [ ]`), verification MUST fail with the list of pending tasks.

### Scenarios

#### Scenario 3.1: All tasks completed
- **Given** an active change `payment-gate` where all 4 documents exist and `tasks.md` has 5/5 tasks checked
- **When** `sdd verify payment-gate` is executed
- **Then** the command MUST exit with success and report all artifacts and tasks verified

#### Scenario 3.2: Incomplete tasks
- **Given** an active change `payment-gate` where 1 of 5 tasks is unchecked (`- [ ]`)
- **When** `sdd verify payment-gate` is executed
- **Then** the command MUST fail, output the pending task count, and report verification failure

---

## 4. Archive Command (`sdd archive`)

### Requirements
- The archive command MUST locate the target change in `openspec/changes/<change-name>`.
- If no change name is specified:
  - If exactly 1 active change exists, it MUST auto-select it.
  - If multiple active changes exist in interactive mode, it MUST prompt the user to select one.
- The command MUST verify task completion:
  - If incomplete tasks exist, it MUST warn and require `--force` or explicit interactive confirmation.
- The command MUST promote living specifications:
  - If `openspec/changes/<change-name>/specs.md` exists, it MUST copy or merge its contents into `openspec/specs/<change-name>.md`.
- The command MUST move the change folder to `openspec/changes/archive/YYYY-MM-DD-<change-name>/`.

### Scenarios

#### Scenario 4.1: Normal archiving with spec promotion
- **Given** completed change `auth-v2` with `specs.md`
- **When** `sdd archive auth-v2` is executed
- **Then** `openspec/specs/auth-v2.md` MUST be created or updated with the specs content
- **And** `openspec/changes/auth-v2/` MUST be moved to `openspec/changes/archive/YYYY-MM-DD-auth-v2/`

---

## 5. Init Command (`sdd init`)

### Requirements
- If `AGENTS.md` does not exist at the repository root, `sdd init` MUST create it using the standard SDD template.
- If `AGENTS.md` already exists, `sdd init` MUST NOT overwrite it.
- If `AGENTS.md` already exists and does not contain `<!-- sdd-rules:start -->`, it MUST inject the SDD rules block delimited by `<!-- sdd-rules:start -->` and `<!-- sdd-rules:end -->`.

### Scenarios

#### Scenario 5.1: Existing custom AGENTS.md
- **Given** a repository with an existing `AGENTS.md` containing custom project guidelines
- **When** `sdd init` is executed
- **Then** the custom project guidelines MUST be preserved
- **And** the SDD rules block MUST be appended between `<!-- sdd-rules:start -->` and `<!-- sdd-rules:end -->`

---

## 6. Root CLI Default Action

### Requirements
- When the `sdd` command is invoked with no arguments in an initialized repository, it MUST execute `sdd status`.
- When invoked in an uninitialized repository, it MUST display guidance suggesting `sdd init`.
