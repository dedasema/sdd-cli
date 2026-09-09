export function getProposalTemplate(changeName: string): string {
  return `# Proposal: ${changeName}

## Intent

<!-- What problem are we solving? Why does this change need to happen? -->

## Scope

### In Scope
- 

### Out of Scope
- 

## Capabilities

### New Capabilities
- 

### Modified Capabilities
- 

## Approach

<!-- High-level technical approach and strategy -->

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| | Low / Med / High | |

## Rollback Plan

<!-- How to revert safely if needed -->

## Success Criteria

- [ ] 
`;
}

export function getSpecsTemplate(changeName: string): string {
  return `# Specification: ${changeName}

## Purpose

<!-- High-level description of what this change specifies -->

## Requirements

### Requirement: Core Requirement Name

The system MUST ...

#### Scenario: Happy path
- GIVEN ...
- WHEN ...
- THEN ...

#### Scenario: Edge case or failure condition
- GIVEN ...
- WHEN ...
- THEN ...
`;
}

export function getDesignTemplate(changeName: string): string {
  return `# Design: ${changeName}

## Technical Approach

<!-- Architectural strategy, module structure, and libraries chosen -->

## Architecture Decisions

| Decision | Choice | Alternatives Considered | Rationale |
|---|---|---|---|
| | | | |

## Data Flow

\`\`\`text
<!-- ASCII diagram showing data flow between components -->
\`\`\`

## File Changes

| File | Action | Description |
|---|---|---|
| | Create / Modify / Delete | |

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | | |
| Integration | | |
`;
}

export function getTasksTemplate(changeName: string): string {
  return `# Tasks: ${changeName}

## Phase 1: Setup & Scaffolding

- [ ] 1.1 Initial setup and configuration

## Phase 2: Core Implementation

- [ ] 2.1 Implement core functionality
- [ ] 2.2 Add error handling and validations

## Phase 3: Testing & Verification

- [ ] 3.1 Write automated unit tests
- [ ] 3.2 Verify all spec scenarios
`;
}
