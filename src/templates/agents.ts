export function getAgentsTemplate(): string {
  return `# Agent Guidelines: Spec-Driven Development (SDD)

This project strictly adheres to **Spec-Driven Development (SDD)**.
As an AI coding assistant, you MUST follow this protocol before writing or modifying any implementation code.

## Core Rules

1. **NO VIBE-CODING**: Never write implementation code directly from a casual prompt without an approved change proposal or specification.
2. **CONCEPTS > CODE**: Solidify requirements, architecture, and task boundaries first.
3. **DETERMINISTIC WORKFLOW**: Every non-trivial change follows the formal lifecycle:
   - \`proposal.md\`: Problem statement, scope, and capabilities.
   - \`specs.md\` / \`spec.md\`: Formal requirements with RFC 2119 keywords (MUST, SHALL, SHOULD) and Given/When/Then scenarios.
   - \`design.md\`: Technical architecture, tradeoffs, data flow, and file impacts.
   - \`tasks.md\`: Concrete, atomic checklist of implementation steps.
4. **HUMAN IN THE LOOP**: Present specifications and designs to the developer for review and approval before executing tasks.

## Directory Layout

- \`openspec/specs/<domain>/spec.md\`: Living, authoritative specifications of the system.
- \`openspec/changes/<change-name>/\`: Active changes being planned or implemented.
  - \`proposal.md\`
  - \`specs.md\`
  - \`design.md\`
  - \`tasks.md\`
- \`openspec/changes/archive/\`: Completed and merged changes.

## When Asked to Build a Feature or Fix a Bug

1. Check if an active change exists under \`openspec/changes/\`.
2. If not, instruct the user to run \`sdd new <feature-name>\` or offer to initialize the change directory.
3. Help the developer draft the proposal, specifications, design, and tasks in that order.
4. Only implement code when checking off items in \`tasks.md\`.
`;
}
