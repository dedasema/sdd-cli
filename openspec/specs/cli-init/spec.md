# CLI Init Specification

## Purpose

Defines the behavior of the `sdd init` command to bootstrap the Spec-Driven Development environment in any repository.

## Requirements

### Requirement: Initialize Directory Structure

The system MUST create the core OpenSpec directory hierarchy if it does not already exist.

#### Scenario: First-time initialization
- GIVEN an empty or existing project without an `openspec/` folder
- WHEN the user executes `sdd init`
- THEN the system MUST create `openspec/specs/`
- AND the system MUST create `openspec/changes/archive/`

#### Scenario: Idempotent execution
- GIVEN a project where `openspec/` already exists
- WHEN the user executes `sdd init`
- THEN the system MUST NOT overwrite existing specs or change folders
- AND the system MUST notify the user that SDD is already initialized

### Requirement: Generate Configuration and Agent Rules

The system MUST generate `openspec/config.yaml` and root `AGENTS.md` containing mandatory SDD enforcement guidelines for AI agents.

#### Scenario: Generate AGENTS.md
- GIVEN an initialized repository
- WHEN `sdd init` runs
- THEN the system MUST create or update `AGENTS.md` at the repository root
- AND `AGENTS.md` MUST explicitly instruct any AI agent to follow proposal, spec, design, and tasks before generating code

#### Scenario: Generate config.yaml
- GIVEN an initialized repository
- WHEN `sdd init` runs
- THEN the system MUST create `openspec/config.yaml` with schema `spec-driven` and default lifecycle rules
