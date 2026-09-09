export function getConfigTemplate(projectName = "project"): string {
  return `schema: spec-driven

context: |
  Project: ${projectName}
  Workflow: Spec-Driven Development with AI agents

rules:
  proposal:
    - Include intent, user impact, and scope
    - Identify affected modules and capabilities
  specs:
    - Use Given/When/Then format for scenarios
    - Use RFC 2119 keywords (MUST, SHALL, SHOULD, MAY)
  design:
    - Detail architecture decisions with rationale and tradeoffs
    - Include ASCII data flow diagrams when relevant
  tasks:
    - Group tasks hierarchically by phase (1.1, 1.2, etc.)
    - Keep tasks atomic and verifiable
  apply:
    - Follow strict TDD where tests exist
    - Verify code against all spec scenarios
  verify:
    - Execute automated test suite
    - Validate acceptance criteria
`;
}
