# CLI New Specification

## Purpose

Defines the behavior of the `sdd new <change-name>` command to scaffold a structured change workspace with all standard SDD phase templates.

## Requirements

### Requirement: Validate Change Name

The system MUST enforce kebab-case naming for all change identifiers.

#### Scenario: Valid change identifier
- GIVEN a valid kebab-case name such as `user-auth` or `add-dark-mode`
- WHEN the user executes `sdd new <change-name>`
- THEN the system MUST accept the name and create directory `openspec/changes/<change-name>/`

#### Scenario: Invalid change identifier
- GIVEN an invalid name containing uppercase letters, spaces, or special characters (e.g. `User Auth!` or `My_Feature`)
- WHEN the user executes `sdd new <change-name>`
- THEN the system MUST reject execution with a clear error message explaining the kebab-case requirement
- AND no directories or files SHALL be created

### Requirement: Scaffold Phase Templates

The system MUST populate the new change workspace with standard templates for proposal, specs, design, and tasks.

#### Scenario: Populate templates
- GIVEN a valid change name
- WHEN the change directory is created
- THEN the system MUST create `proposal.md` with sections Intent, Scope, and Risks
- AND the system MUST create `specs.md` with Given/When/Then scenario scaffolding
- AND the system MUST create `design.md` with Technical Approach and Tradeoffs
- AND the system MUST create `tasks.md` with numbered markdown checklist items

#### Scenario: Avoid collision with existing change
- GIVEN an existing change folder `openspec/changes/<change-name>/`
- WHEN the user executes `sdd new <change-name>` with the same name
- THEN the system MUST abort with an error indicating the change already exists
- AND existing files in that directory MUST NOT be modified
