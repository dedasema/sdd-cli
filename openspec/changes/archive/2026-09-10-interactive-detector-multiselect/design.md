# Design: Interactive Editor Multiselect with Detection

## Technical Approach

Centralize editor presence detection and interactive multiselect provisioning in the TypeScript codebase (`sdd setup`). This replaces brittle, shell-specific terminal interaction with a robust, cross-platform terminal UI. Shell installers (`install.ps1` and `install.sh`) delegate environment selection directly to `sdd setup` after ensuring global package installation.

## Architecture Decisions

### Decision: TypeScript-First UI & Provisioning vs Pure Shell Scripts

| Option | Tradeoff | Decision |
|---|---|---|
| Pure PowerShell & Bash | Requires reimplementing raw keyboard events, ANSI escaping, and cross-platform detection twice with different shell behaviors. | Rejected |
| Subprocess Node script / `sdd setup` | Single source of truth, cross-platform, unit-testable via Vitest, consistent with `@clack/prompts`. | **Chosen** |

**Rationale**: Node.js is already verified in Step 1 of both `install.ps1` and `install.sh`. Delegating the interactive menu and provisioning to `sdd setup` eliminates shell duplication and guarantees identical UX across Windows, macOS, and Linux.

### Decision: Gated Multiselect Prompt via `@clack/core` Subclassing

| Option | Tradeoff | Decision |
|---|---|---|
| Standard `@clack/prompts` multiselect | Does not support disabling options; spacebar toggles any highlighted row regardless of installation status. | Rejected |
| External dependency (`@inquirer/checkbox`) | Introduces an extra dependency and inconsistent styling with the rest of the `@clack` CLI prompts. | Rejected |
| Subclassing `MultiSelectPrompt` from `@clack/core` | Extends existing dependency, intercepts `toggleValue()` and `toggleAll()` to lock disabled options, and styles disabled rows with `color.dim('[-] Option (not installed)')`. | **Chosen** |

**Rationale**: Minimal footprint, zero new dependencies, 100% visual consistency with `@clack/prompts`.

## Data Flow

```
[install.ps1 / install.sh]
        │
        ▼ (npm install -g @dedasema/sdd-cli)
[CLI: sdd setup]
        │
        ├──► [detector.ts: scan system for 8 environments]
        │         │
        │         ▼ (Map of EnvironmentId -> { installed: boolean })
        ├──► [gatedMultiselect: interactive TUI]
        │         │
        │         ▼ (User selects subset with Space / Enter)
        └──► [provisioner.ts: write rules, slash commands, skills]
                  │
                  ▼
              (Done!)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `package.json` | Modify | Explicitly include `@clack/core` in dependencies |
| `src/utils/detector.ts` | Create | System detection for 8 AI environments (PATH + standard dirs) |
| `src/prompts/multiselect.ts` | Create | Gated multiselect supporting disabled options |
| `src/commands/setup.ts` | Create | `sdd setup` command implementation |
| `src/index.ts` | Modify | Register `setup` command |
| `scripts/install.ps1` | Modify | Invoke `sdd setup` post-install |
| `scripts/install.sh` | Modify | Invoke `sdd setup` post-install |
| `tests/detector.test.ts` | Create | Unit tests for environment detection engine |
| `tests/multiselect.test.ts` | Create | Unit tests for disabled option blocking |

## Interfaces / Contracts

```typescript
export type EnvironmentId =
  | "antigravity_2"
  | "agy_cli"
  | "codex"
  | "copilot"
  | "opencode"
  | "claude"
  | "cursor"
  | "zed";

export interface EnvironmentInfo {
  id: EnvironmentId;
  name: string;
  configPathHint: string;
  installed: boolean;
}

export interface GatedOption<T> {
  value: T;
  label: string;
  hint?: string;
  disabled?: boolean;
}

export interface SetupOptions {
  all?: boolean;
  silent?: boolean;
  cwd?: string;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit (`detector.test.ts`) | PATH binary detection and filesystem fallback | Mock `process.env.PATH` and `fs.existsSync` |
| Unit (`multiselect.test.ts`) | Ensure `toggleValue()` ignores disabled items and `toggleAll()` only selects installed items | Vitest instantiation of `GatedMultiSelectPrompt` |
| Integration (`commands.test.ts`) | Non-interactive `sdd setup --all` creates expected rule files | Vitest in temporary test directory |

## Migration / Rollout

No migration required. Non-interactive scripted usage remains backward-compatible via `sdd setup --all`.

## Open Questions

None. Architecture and requirements are fully determined.
