# Technical Design: Full Lifecycle & DX Enhancements

## Architecture & System Overview

The enhancements complete the Spec-Driven Development CLI lifecycle by transitioning it into a fully deterministic, self-healing command system.

```
                  ┌──────────────┐
                  │   sdd init   │ ── Injects AGENTS.md (idempotent)
                  └──────┬───────┘
                         │
                         ▼
                  ┌──────────────┐
                  │   sdd new    │ ── Interactive prompt + Anti-WIP guardrail
                  └──────┬───────┘    Scaffolds proposal.md ONLY (JIT)
                         │
                         ▼
                  ┌──────────────┐
                  │  sdd status  │ ── Real-time phase detector & visual artifact pipeline
                  └──────┬───────┘
                         │
                         ▼
                  ┌──────────────┐
                  │  sdd verify  │ ── Audits all 4 documents + 100% task completion
                  └──────┬───────┘
                         │
                         ▼
                  ┌──────────────┐
                  │ sdd archive  │ ── Promotes delta specs to living specs (openspec/specs/)
                  └──────────────┘    Moves folder to archive/YYYY-MM-DD-<change-name>/
```

---

## Component Designs

### 1. Phase Detection Engine (`src/commands/status.ts`)
We introduce a deterministic phase calculation state machine:
```ts
export type SDDPhase = "Proposal" | "Specs" | "Design" | "Tasks" | "Apply" | "Verify" | "Unknown";

export interface ArtifactStatus {
  proposal: boolean;
  specs: boolean;
  design: boolean;
  tasks: boolean;
}

export function computePhase(artifacts: ArtifactStatus, progress: { total: number; completed: number; percentage: number }): SDDPhase {
  if (artifacts.tasks) {
    if (progress.percentage === 100 && progress.total > 0) return "Verify";
    if (progress.completed > 0) return "Apply";
    return "Tasks";
  }
  if (artifacts.design) return "Design";
  if (artifacts.specs) return "Specs";
  if (artifacts.proposal) return "Proposal";
  return "Unknown";
}
```

Pipeline rendering visual logic:
```ts
function renderPipeline(phase: SDDPhase, artifacts: ArtifactStatus): string {
  const mark = (exists: boolean, isCurrent: boolean) =>
    exists ? pc.green("✓") : isCurrent ? pc.yellow("⏳") : pc.dim("·");

  return [
    `proposal.md ${mark(artifacts.proposal, phase === "Proposal")}`,
    `specs.md ${mark(artifacts.specs, phase === "Specs")}`,
    `design.md ${mark(artifacts.design, phase === "Design")}`,
    `tasks.md ${mark(artifacts.tasks, phase === "Tasks" || phase === "Apply" || phase === "Verify")}`
  ].join(pc.dim("  |  "));
}
```

### 2. Verification Command (`src/commands/verify.ts`)
- Resolves target change:
  - If omitted and 1 active change exists: selects automatically.
  - If omitted and multiple exist in interactive mode: prompts with `p.select()`.
- Verifies existence and non-zero byte size of:
  - `proposal.md`
  - `specs.md`
  - `design.md`
  - `tasks.md`
- Inspects `tasks.md`:
  - Parses total and completed tasks.
  - Verification fails if `completed < total` or `total === 0`.
- Outputs clean tabular or step status with picocolors.

### 3. Archive & Living Specs Promotion (`src/commands/archive.ts`)
- Resolves target change (auto-select or `p.select()`).
- Validates task completion. If uncompleted tasks remain and `--force` is false, asks confirmation or rejects.
- **Spec Promotion**:
  - Copies `openspec/changes/<change-name>/specs.md` to `openspec/specs/<change-name>.md`.
  - Ensures `openspec/specs/` directory exists.
- **Folder Archival**:
  - Computes `openspec/changes/archive/${dateStr}-${changeName}` where `dateStr` is `YYYY-MM-DD`.
  - Moves directory atomically using `fs.rename` (or directory copy & delete fallback if cross-device).

### 4. Zero-Crash UX & WIP Guardrail (`src/commands/new.ts`)
- If `changeName` is missing:
  - If non-silent, opens `@clack/prompts` `p.text()` with validator regex `^[a-z0-9]+(-[a-z0-9]+)*$`.
- Inspects active changes in `openspec/changes/`:
  - If active changes exist, logs warning with names and current phases.
  - Prompts `p.confirm()` before proceeding.

### 5. Non-Destructive Ingestion in `sdd init` (`src/commands/init.ts`)
- If `AGENTS.md` exists:
  - Checks if `<!-- sdd-rules:start -->` is present.
  - If missing, appends:
    ```markdown

    <!-- sdd-rules:start -->
    ## Spec-Driven Development (SDD) Guidelines
    ...
    <!-- sdd-rules:end -->
    ```
- Preserves all pre-existing project rules intact.

### 6. Universal Multi-Environment Provisioning (`src/utils/provisioner.ts`)
- Update instructions for Zed, Claude, Cursor, Antigravity, OpenCode, Codex, Copilot:
  - Add `/sdd-verify` instructions to run `sdd verify` or inspect all 4 documents and task checks.
  - Add `/sdd-archive` instructions to run `sdd archive` to persist living specs.
  - Re-verify language contract: Spanish communication with English technical terms.

---

## Tradeoffs & Design Decisions
1. **Interactive vs Non-Interactive**: All interactive prompts (`p.text`, `p.select`, `p.confirm`) are conditionally skipped when `options.silent` is set or when stdout is non-TTY, preventing CI and subagent deadlocks.
2. **Atomic Directory Move**: Using `node:fs` `rename` ensures fast, atomic archiving on POSIX and Windows.
