# Proposal: Interactive Agent & IDE Selection

## Intent

Currently, the single-line installer automatically provisions all 7 AI environments. Developers often use only one or two editors (e.g. Cursor or Claude Code) and do not want extraneous directories created for editors they do not have installed. This change adds an interactive selection menu allowing developers to choose which specific agents to configure, or select all with a single keystroke.

## Scope

### In Scope
- Add interactive selection prompt in `scripts/install.ps1`.
- Add interactive selection prompt in `scripts/install.sh` (using `/dev/tty` for piped input).
- Support options:
  - `[1]` Antigravity 2.0
  - `[2]` Antigravity CLI (`agy`)
  - `[3]` OpenAI Codex
  - `[4]` GitHub Copilot
  - `[5]` OpenCode
  - `[6]` Claude Code
  - `[7]` Cursor
  - `[A]` All (Default when pressing Enter)
- Support comma/space-delimited inputs (e.g. `1,6,7` or `1 7`).
- Update `scripts/uninstall.ps1` and `scripts/uninstall.sh` to allow selective or all-inclusive removal.
- Update `README.md`.

### Out of Scope
- Graphical user interfaces (GUI/dialog boxes).
- Changes to CLI core commands (`init`, `new`, `status`).

## Capabilities

### Modified Capabilities
- `installer`: Adds interactive environment filtering to the installation and uninstallation lifecycles.

## Approach

- Display a clear, color-coded menu of the 7 supported environments.
- Parse user choice string into active target set:
  - Empty input or `A`/`a` selects all 7 targets.
  - Comma/space separated numbers select only the chosen targets.
- For Unix/macOS: Read prompt directly from `/dev/tty` to ensure interactive input works when piped via `curl ... | bash`.
- In non-interactive CI environments (no TTY / `$Host.UI.RawUI` not attached), gracefully default to `All`.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `scripts/install.ps1` | Modified | Add interactive selection logic before provisioning |
| `scripts/install.sh` | Modified | Add interactive selection via `/dev/tty` before provisioning |
| `scripts/uninstall.ps1` | Modified | Add selective cleanup prompt (default to all found) |
| `scripts/uninstall.sh` | Modified | Add selective cleanup prompt (default to all found) |
| `README.md` | Modified | Document interactive prompt options |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| `curl | bash` hanging on `read` | Med | Explicitly redirect `read -r < /dev/tty` and check `[ -t 0 ]` / `/dev/tty` existence |
| Invalid input by user | Low | Sanitize tokens, filter invalid numbers, fallback to All if no valid choice parsed |

## Rollback Plan

Revert modified scripts via `git checkout`.

## Success Criteria

- [ ] Typing `7` in `install.ps1` installs only Cursor assets.
- [ ] Typing `1,6` installs only Antigravity 2.0 and Claude Code assets.
- [ ] Pressing Enter defaults to configuring all 7 environments.
- [ ] Unix/macOS `curl | bash` successfully accepts user input from terminal.
