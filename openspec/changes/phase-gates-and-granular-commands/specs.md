# Specification: phase-gates-and-granular-commands

## Purpose

This specification defines the formal behavioral requirements for the Spec-Driven Development (SDD) AI assistant protocol, including interactive human-in-the-loop phase gates, mandatory question resolution, deterministic state inspection, formal verification before archival, and the provisioning of a granular slash command suite across all 8 supported AI environments.

## Requirements

### Requirement: Interactive Phase Gates (Human-in-the-Loop Protocol)

The AI assistant MUST enforce strict phase boundaries across the 7-phase SDD lifecycle (Bootstrap -> Proposal -> Specs -> Design -> Tasks -> Apply -> Verify -> Archive). The AI assistant MUST NOT proceed to any subsequent phase without explicit user confirmation.

#### Scenario: Sequential phase progression with user approval
- GIVEN an active SDD change workspace in `openspec/changes/<change-name>/`
- WHEN the AI assistant completes the deliverables of a phase (e.g., `proposal.md`)
- THEN the AI assistant MUST present a concise summary of the deliverable
- AND the AI assistant MUST ask the user for explicit approval to advance to the next phase (e.g., `specs.md`)
- AND the AI assistant MUST NOT generate artifacts for the next phase until the user responds affirmatively.

#### Scenario: User requests revisions within current phase
- GIVEN the AI assistant has presented a phase deliverable and requested approval to proceed
- WHEN the user provides feedback or requests changes (e.g., "Change the scope to exclude feature Y")
- THEN the AI assistant MUST revise the current phase artifact
- AND the AI assistant MUST NOT advance to the next phase until the revised deliverable is approved.

---

### Requirement: Clarification Loop (Question Clearing)

When the AI assistant identifies any technical ambiguity, unstated requirement, or architectural tradeoff, it MUST ask the user as many clarifying questions as necessary.

#### Scenario: AI asks clarifying questions before phase progression
- GIVEN the AI assistant is working on any phase (e.g., Proposal or Specs)
- WHEN an ambiguity or design fork is encountered
- THEN the AI assistant MUST formulate clarifying questions and wait for user answers
- AND the AI assistant MUST NOT propose advancing to the next phase while unresolved questions remain.

---

### Requirement: Formal Verification and Gated Archival

The AI assistant MUST execute a formal verification step (`verify`) and MUST NOT archive any change without explicit user authorization following successful verification.

#### Scenario: Successful verification followed by gated archival
- GIVEN all tasks in `tasks.md` are completed
- WHEN the AI assistant runs verification (test suite, type checking, spec compliance check) and all checks pass
- THEN the AI assistant MUST report the verification results to the user
- AND the AI assistant MUST ask: "All tests pass and specifications are verified. Do you approve archiving this change?"
- AND the AI assistant MUST NOT move the change to `openspec/changes/archive/` until the user confirms.

#### Scenario: Verification failure prevents archival
- GIVEN tasks in `tasks.md` have been implemented
- WHEN tests fail or a requirement in `specs.md` is unmet
- THEN the AI assistant MUST report the failures and formulate remediation tasks
- AND the AI assistant MUST NOT offer or attempt to archive the change until all issues are resolved.

---

### Requirement: Deterministic State-on-Disk Inspection

The AI assistant MUST determine the initialization state of a repository strictly by inspecting the filesystem for `openspec/`.

#### Scenario: Initializing an uninitialized repository
- GIVEN a project workspace where `openspec/` does NOT exist
- WHEN the user triggers SDD (via `/sdd` or natural language)
- THEN the AI assistant MUST autonomously execute `sdd init` in the background
- AND proceed to prompt the user for the feature name.

#### Scenario: Re-entering an already initialized repository
- GIVEN a project workspace where `openspec/` already exists
- WHEN the user triggers SDD for a new feature
- THEN the AI assistant MUST NOT execute `sdd init`
- AND the AI assistant MUST immediately execute `sdd new <feature-name>`.

---

### Requirement: Granular Slash Commands Suite Provisioning

The installer and uninstaller MUST support individual phase commands across all supported environments.

#### Scenario: Provisioning in Zed editor
- GIVEN the Windows or Unix installer is executed with Zed selected (option 8 or All)
- WHEN the installer completes
- THEN `%APPDATA%/Zed/settings.json` (or `~/.config/zed/settings.json`) MUST contain slash commands for:
  - `sdd`: End-to-end orchestrator
  - `sdd-init`: Project initialization
  - `sdd-new`: Change scaffolding
  - `sdd-propose`: Proposal drafting
  - `sdd-spec`: Specification drafting
  - `sdd-design`: Technical design drafting
  - `sdd-tasks`: Checklist generation
  - `sdd-verify`: Quality & spec verification
  - `sdd-archive`: Change archival
- AND existing settings, comments, and formatting MUST be preserved.

#### Scenario: Provisioning in Claude Code
- GIVEN the installer is executed with Claude Code selected (option 6 or All)
- WHEN the installer completes
- THEN `~/.claude/commands/` MUST contain individual executable markdown files:
  - `sdd.md`, `sdd-init.md`, `sdd-new.md`, `sdd-propose.md`, `sdd-spec.md`, `sdd-design.md`, `sdd-tasks.md`, `sdd-verify.md`, `sdd-archive.md`.

#### Scenario: Clean uninstallation
- GIVEN the uninstaller is executed
- WHEN an environment is deselected or cleaned up
- THEN all granular slash command files and settings entries for SDD MUST be excised without leaving orphan commands.
