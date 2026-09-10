# Proposal: phase-gates-and-granular-commands

## Intent

Currently, the SDD AI assistant protocol provides a general directive to follow the SDD workflow, but lacks explicit, mandatory human-in-the-loop phase gates, granular phase slash commands, and a formalized verification-before-archive boundary.

This change transforms the protocol across all 8 supported AI environments (Antigravity 2.0, agy CLI, OpenAI Codex, GitHub Copilot, OpenCode, Claude Code, Cursor, and Zed) so that:
1. **Interactive Phase Gates (Human-in-the-Loop)**: The AI is strictly prohibited from advancing across phase boundaries without explicit user approval.
2. **Clarification Protocol**: When the AI has technical or requirement ambiguities, it must ask as many clarifying questions as necessary, waiting for answers before asking to advance to the next phase.
3. **Formal Verification & Gated Archival**: Verification (`verify`) is established as a formal gate before Archival (`archive`). Archiving requires explicit user confirmation after verifying that tests pass and specs are satisfied.
4. **Granular Slash Commands**: Each phase (`/sdd`, `/sdd-init`, `/sdd-new`, `/sdd-propose`, `/sdd-spec`, `/sdd-design`, `/sdd-tasks`, `/sdd-verify`, `/sdd-archive`) is exposed as an accessible command or trigger across environments.
5. **Deterministic State on Disk**: The assistant inspects disk state (`openspec/` existence) to ensure `sdd init` is only ever executed once per repository.

## Scope

### In Scope
- **Protocol Definition (`AGENTS.md` & Rules)**:
  - Codify the 7-phase lifecycle: Bootstrap -> Proposal -> Specs -> Design -> Tasks -> Apply (Implementation) -> Verify -> Archive.
  - Codify interactive checkpoints: AI must stop at the end of each phase, present deliverables, and ask for user confirmation.
  - Codify clarification behavior: ask questions until all ambiguities are resolved before proposing phase progression.
  - Formalize verification gate before archive.
- **CLI Template Updates**:
  - Update `src/commands/init.ts` embedded `AGENTS.md` content to match the new interactive phase-gate protocol.
- **Installer & Provisioning Scripts (`scripts/install.*`, `scripts/uninstall.*`)**:
  - Provision granular slash commands in Zed (`settings.json` under `assistant.slash_commands.*`).
  - Provision individual command files in Claude Code (`~/.claude/commands/sdd-*.md`).
  - Provision skills/rules for Antigravity, agy, Cursor, Copilot, Codex, and OpenCode with granular phase triggers.
  - Symmetrical removal of all granular commands in uninstaller scripts.
- **Living Spec Updates**:
  - Update `openspec/specs/installer/spec.md` and add `openspec/specs/protocol/spec.md` documenting the interactive gates and command suite.

### Out of Scope
- Adding network telemetry or external server communication.
- Modifying underlying OpenSpec file formats (`proposal.md`, `specs.md`, etc.).

## Capabilities

### New Capabilities
- `phase-gates`: Enforced human-in-the-loop checkpoints at each phase transition.
- `granular-slash-commands`: Individual phase commands (`/sdd-init`, `/sdd-new`, `/sdd-propose`, `/sdd-spec`, `/sdd-design`, `/sdd-tasks`, `/sdd-verify`, `/sdd-archive`) alongside the overarching `/sdd` orchestrator.
- `clarification-loop`: Explicit instructions requiring AI to resolve all open questions before prompting for phase transition.
- `verification-gate`: Required test execution and spec-compliance verification before requesting permission to archive.

### Modified Capabilities
- `installer`: Updated to provision multi-command suite and enhanced interactive protocol across all 8 environments.
- `uninstaller`: Updated to cleanly purge all granular command files and settings entries without residual traces.

## Approach

1. **Protocol Specification**:
   - Formulate unambiguous instructions for AI agents regarding phase boundaries and checkpoints.
   - Emphasize the question-clearing rule (ask N questions until doubts are 0, then gate).
2. **Environment Adapters**:
   - **Zed**: Register individual commands in `settings.json` (`sdd`, `sdd-init`, `sdd-new`, `sdd-propose`, `sdd-spec`, `sdd-design`, `sdd-tasks`, `sdd-verify`, `sdd-archive`) via safe JSONC manipulation.
   - **Claude Code**: Generate individual markdown files under `~/.claude/commands/sdd-*.md`.
   - **Cursor**: Configure `sdd.mdc` with explicit trigger keywords and rule directives.
   - **Antigravity / agy**: Provide phase skills and root slash command mappings.
   - **Codex / Copilot / OpenCode**: Embed granular command patterns in `AGENTS.md` and instruction files.
3. **CLI Template Sync**:
   - Synchronize `src/commands/init.ts` with the enhanced `AGENTS.md` protocol so any new project initialized with `sdd init` gets the updated rules.
4. **Verification**:
   - Verify unit tests and build.
   - Test JSONC multi-command injection and removal in isolated sandbox.

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Cluttered slash command dropdown in Zed | Low | Commands are strictly prefixed with `sdd-` for clean grouping. |
| Incomplete command cleanup on uninstall | Low | Test uninstaller thoroughly to ensure symmetric excision of all added commands. |
| AI hallucinating phases | Low | Explicit phase list with concrete file deliverables and Given/When/Then requirements. |

## Rollback Plan

If regressions occur, revert git commit on `main`, reinstall previous 0.1.3 scripts, and run `uninstall` script to restore prior editor state.

## Success Criteria

- [ ] `proposal.md`, `specs.md`, `design.md`, and `tasks.md` completed and verified.
- [ ] `AGENTS.md` embedded template and global rule blocks enforce human-in-the-loop phase gates and clarification rules.
- [ ] Granular commands (`/sdd`, `/sdd-init`, `/sdd-new`, `/sdd-propose`, `/sdd-spec`, `/sdd-design`, `/sdd-tasks`, `/sdd-verify`, `/sdd-archive`) provisioned in Zed and Claude Code, and mapped across all 8 environments.
- [ ] Verification gate formalized before archive.
- [ ] Uninstaller cleanly removes all granular commands.
- [ ] 100% vitest suite passes and `tsup` build succeeds.
