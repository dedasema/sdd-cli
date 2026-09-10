export function getAgentsTemplate(): string {
  return `# Agent Guidelines: Spec-Driven Development (SDD)

This project strictly adheres to **Spec-Driven Development (SDD)**.
As an AI coding assistant, you MUST follow this protocol before writing or modifying any implementation code.

## Core Rules

1. **NO VIBE-CODING**: Never write implementation code directly from a casual prompt without an approved specification and task breakdown.
2. **CONCEPTS > CODE**: Solidify requirements, architecture, and task boundaries first.
3. **DETERMINISTIC STATE ON DISK**:
   - Check if \`openspec/\` exists in the repository root.
   - If \`openspec/\` does NOT exist: autonomously execute \`sdd init\` in the background using your terminal tool before doing anything else.
   - If \`openspec/\` already exists: NEVER re-run \`sdd init\`. Proceed directly to \`sdd new <feature-name>\`.
4. **CLARIFICATION LOOP (Zero Doubts Before Gating)**:
   - If you have any questions, missing requirements, or technical ambiguities, you MUST ask the developer and wait for answers.
   - You MUST NOT propose advancing to the next phase while unresolved doubts remain.
5. **HUMAN-IN-THE-LOOP PHASE GATES**:
   - You MUST enforce explicit checkpoints at the end of each phase.
   - You MUST NOT generate artifacts or code for the next phase until the user explicitly confirms and approves advancing.

## The 7-Phase Gated Lifecycle

1. **Bootstrap & Scaffolding**:
   - Verify \`openspec/\` on disk. Run \`sdd init\` if missing.
   - For any new feature or fix, autonomously execute \`sdd new <feature-name>\` in the background.
2. **Proposal Phase (\`proposal.md\`)**:
   - Resolve requirements and scope with the user.
   - Draft \`proposal.md\`.
   - **GATE**: Present a concise summary and ask: *"Proposal ready. Do you approve proceeding to Specifications?"*
3. **Specifications Phase (\`specs.md\`)**:
   - Write testable requirements with RFC 2119 keywords (MUST, SHALL, SHOULD) and Given/When/Then scenarios.
   - **GATE**: Present the scenarios and ask: *"Specifications ready. Do you approve proceeding to Technical Design?"*
4. **Design Phase (\`design.md\`)**:
   - Formulate architectural decisions, tradeoffs, and file impacts.
   - **GATE**: Present the design summary and ask: *"Design ready. Do you approve proceeding to the Tasks checklist?"*
5. **Tasks Phase (\`tasks.md\`)**:
   - Break down implementation into an atomic, verifiable checklist with checkboxes.
   - **GATE**: Present the checklist and ask: *"Tasks checklist ready. Do you approve starting Implementation?"*
6. **Apply Phase (Implementation)**:
   - Implement code task by task, marking checkboxes \`- [x]\` as work is completed.
7. **Verify Phase (Quality Assurance)**:
   - Run automated test suites, type checking, and audit compliance against \`specs.md\`.
   - If failures occur, fix them until all checks are green.
   - **GATE**: Present the verification results and ask: *"All tests pass and specifications are verified. Do you approve archiving this change?"*
8. **Archive Phase (Sync & Finalization)**:
   - Only after explicit user approval, move the change folder to \`openspec/changes/archive/YYYY-MM-DD-<feature>/\`.
   - Consolidate new capabilities into main living specs in \`openspec/specs/\`.

## Supported Slash Commands

- \`/sdd\`: Smart orchestrator (audits repo state, inits if missing, creates change, or resumes active phase).
- \`/sdd-init\`: Initialize SDD / OpenSpec structure in workspace.
- \`/sdd-new <name>\`: Scaffold a new change workspace.
- \`/sdd-propose\`: Draft or refine proposal.
- \`/sdd-spec\`: Draft or refine specifications (Given/When/Then).
- \`/sdd-design\`: Draft technical architecture decisions.
- \`/sdd-tasks\`: Break down tasks checklist.
- \`/sdd-verify\`: Run verification and audit compliance.
- \`/sdd-archive\`: Verify gate and archive completed change.
`;
}
