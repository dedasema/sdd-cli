# Delta for Installer

## MODIFIED Requirements

### Requirement: Interactive Environment Selection

The installation workflow MUST prompt the user with an interactive terminal UI to choose which AI environments to configure. The system MUST inspect the local machine and identify which environments are installed. Installed environments MUST be selectable and toggleable via standard multiselect controls (arrow keys to navigate, spacebar to toggle). Environments that are not detected on the machine MUST remain visible in the list but MUST be disabled and non-selectable, tagged with an unselectable status indicator `(not installed)`, preventing the user from toggling them.
(Previously: Installer prompted with numbered 1-8 text inputs and defaulted to all on Enter).

#### Scenario: Interactive Selection with Detected Environments
- GIVEN the installer is executed on a machine where Zed is detected, but other editors are absent
- WHEN the interactive environment selector is displayed
- THEN Zed SHALL be rendered with an active toggleable checkbox
- AND undetected editors SHALL be rendered as disabled with `(not installed)`
- AND pressing Space on an undetected option SHALL NOT toggle its state

#### Scenario: Scripted Non-Interactive Execution
- GIVEN the installer is executed with a non-interactive flag (e.g., `--all` or `--silent`)
- WHEN the installation executes
- THEN it MUST bypass interactive prompts and provision detected environments automatically
