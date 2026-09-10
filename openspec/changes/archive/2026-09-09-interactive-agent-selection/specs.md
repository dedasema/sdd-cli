# Specification: Interactive Agent & IDE Selection

## Purpose

Defines formal requirements for interactive selection of target AI environments during single-line installation and uninstallation.

## Requirements

### Requirement: Interactive Environment Prompt

The installer MUST present an interactive menu allowing the developer to choose which of the 7 supported AI environments to configure.

#### Scenario: Default selection (All)
- GIVEN the installer displays the selection menu
- WHEN the user presses Enter with empty input OR enters `A` / `a`
- THEN all 7 environments MUST be selected for provisioning

#### Scenario: Specific selection
- GIVEN the installer displays the selection menu
- WHEN the user enters comma- or space-separated numbers (e.g., `1,7` or `6 7`)
- THEN ONLY the selected environments MUST be provisioned
- AND unselected environments MUST NOT be touched

#### Scenario: Sanitization of invalid tokens
- GIVEN the installer receives user input containing invalid tokens or out-of-range numbers (e.g., `9,abc`)
- WHEN parsing choices
- THEN valid numbers MUST be preserved
- AND if zero valid numbers are found, the installer MUST default to configuring all environments

### Requirement: TTY Redirection in Piped Execution

The Unix/macOS installer MUST read interactive user input from the terminal device rather than the piped standard input stream.

#### Scenario: Piped execution with active TTY
- GIVEN the script is piped to bash via `curl -fsSL ... | bash`
- WHEN the selection prompt is executed
- THEN input MUST be read from `/dev/tty` if available
- AND the script SHALL NOT hang or terminate prematurely

#### Scenario: Non-interactive execution (CI/CD)
- GIVEN the script runs in an automated environment without an interactive TTY
- WHEN the prompt is reached
- THEN the script MUST automatically default to configuring all environments without blocking

### Requirement: Selective Uninstallation

The uninstallation scripts MUST support removing all found SDD assets or allowing the user to select specific environments to purge.

#### Scenario: Default uninstallation
- GIVEN the uninstaller runs
- WHEN the user confirms removal
- THEN all existing SDD skills and rules found across the 7 environments MUST be purged
