# Tasks: phase-gates-and-granular-commands

## Phase 1: Protocol & Embedded Templates (`src/`)

- [x] 1.1 Update `src/commands/init.ts` embedded `AGENTS.md` template with the 7-phase gated protocol, question-clearing rule, and disk state inspection.
- [x] 1.2 Update `src/index.ts` to read version dynamically from `package.json`.

## Phase 2: Windows Installer & Uninstaller (`scripts/*.ps1`)

- [x] 2.1 Update `$sddRuleBlock` in `scripts/install.ps1` with the complete 7-phase gated protocol and clarification rules.
- [x] 2.2 Expand `Inject-ZedSlashCommand` in `scripts/install.ps1` to provision all 9 granular slash commands (`sdd`, `sdd-init`, `sdd-new`, `sdd-propose`, `sdd-spec`, `sdd-design`, `sdd-tasks`, `sdd-verify`, `sdd-archive`).
- [x] 2.3 Expand Claude Code provisioning in `scripts/install.ps1` to generate all 9 `~/.claude/commands/sdd-*.md` files.
- [x] 2.4 Update `scripts/uninstall.ps1` to cleanly remove all 9 commands from Zed `settings.json` and all 9 command files from `~/.claude/commands/`.

## Phase 3: Unix/macOS Installer & Uninstaller (`scripts/*.sh`)

- [x] 3.1 Update `sdd_rule_block` in `scripts/install.sh` with the 7-phase gated protocol.
- [x] 3.2 Expand `inject_zed_slash_command` in `scripts/install.sh` to provision all 9 granular slash commands.
- [x] 3.3 Expand Claude Code provisioning in `scripts/install.sh` to generate all 9 `~/.claude/commands/sdd-*.md` files.
- [x] 3.4 Update `scripts/uninstall.sh` to purge all 9 Zed slash commands and all 9 Claude Code command files.

## Phase 4: Living Specs & Documentation

- [x] 4.1 Update `openspec/specs/installer/spec.md` with multi-command provisioning and interactive phase gates.
- [x] 4.2 Update `README.md` documenting the 9 slash commands and the interactive gating lifecycle.

## Phase 5: Verification & Quality Assurance

- [x] 5.1 Run `pnpm test` (vitest) and verify all 6 existing tests pass.
- [x] 5.2 Run `pnpm build` (`tsup`) and verify error-free compilation.
- [x] 5.3 Verify multi-command injection and clean removal in isolated sandbox.
- [x] 5.4 Generate `verify-report.md` with verification matrix.
