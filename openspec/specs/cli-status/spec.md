# CLI Status Specification

## Purpose

Defines the behavior of the `sdd status` command to report the current state of active SDD changes and their implementation checklist progress.

## Requirements

### Requirement: Discover Active Changes

The system MUST scan `openspec/changes/` and report all changes that are not archived.

#### Scenario: No active changes
- GIVEN `openspec/changes/` containing no subdirectories (or only `archive/`)
- WHEN the user executes `sdd status`
- THEN the system MUST display a message stating that no active changes were found

#### Scenario: Multiple active changes
- GIVEN one or more active change directories under `openspec/changes/`
- WHEN the user executes `sdd status`
- THEN the system MUST list each change by name along with its task progress

### Requirement: Calculate Task Progress

The system MUST parse `tasks.md` in each active change folder and calculate completed vs total tasks.

#### Scenario: Calculate completion metrics
- GIVEN a change folder with a `tasks.md` file containing markdown checkboxes (`- [x]` and `- [ ]`)
- WHEN the system calculates status
- THEN the system MUST count the number of completed tasks (`- [x]`) and total tasks
- AND the system MUST display the count and percentage of completion (e.g. `2/4 tasks completed (50%)`)

#### Scenario: Missing tasks file
- GIVEN an active change directory where `tasks.md` has not been generated yet
- WHEN `sdd status` runs
- THEN the system MUST report the change status as `tasks pending creation` without crashing
