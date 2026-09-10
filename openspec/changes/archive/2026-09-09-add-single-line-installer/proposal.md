# Proposal: Single-Line Installer and Global Editor Integration

## Intent

Installing `@dedasema/sdd-cli` via `npm install -g` places the CLI on the system `PATH`, but package managers cannot safely configure a developer's global editor environments (like Cursor and Claude Code). This change introduces cross-platform, one-line installer scripts (`install.ps1` for Windows and `install.sh` for Unix/macOS) hosted on GitHub. These scripts install the CLI and automatically inject global SDD skills and slash commands into the user's AI editors, enabling a zero-terminal conversational experience from day one.

## Scope

### In Scope
- PowerShell installer script (`scripts/install.ps1`) for Windows.
- Shell installer script (`scripts/install.sh`) for macOS and Linux.
- Automatic detection of Cursor (`~/.cursor/`) and Claude Code (`~/.claude/`).
- Injection of global SDD agent skill/rules so the AI knows how to execute `sdd init` and `sdd new` autonomously.
- Enhancement of `src/templates/agents.ts` to instruct the AI to run `sdd new` in the background rather than asking the user to open a terminal.
- Update of `README.md` with one-line installation instructions via `irm` and `curl`.

### Out of Scope
- Custom C++ native binary builds.
- Proprietary IDE closed-source plugins.

## Capabilities

### New Capabilities
- `single-line-installer`: Scripts that verify prerequisites (Node.js, npm/pnpm), install `@dedasema/sdd-cli`, and report status.
- `global-editor-integration`: Discovery of local AI editors and provisioning of global SDD skills and `/sdd` commands.

### Modified Capabilities
- `cli-init`: Update the `AGENTS.md` template to explicitly mandate that the AI executes `sdd new` via its terminal tool autonomously.

## Approach

Host `install.ps1` and `install.sh` under `scripts/` in the repository, accessible via `raw.githubusercontent.com`.
When executed, the script:
1. Verifies that Node.js and a package manager (pnpm, npm) are available.
2. Installs `@dedasema/sdd-cli` globally.
3. Resolves the user's home directory across platforms (`$HOME` or `$env:USERPROFILE`).
4. Creates global rule/skill files in `~/.cursor/rules/sdd.mdc` and `~/.claude/commands/sdd.md`.
5. Prints a success banner explaining that SDD is ready to use in the editor chat.

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Missing Node.js runtime on target machine | Med | Check for `node` before running; display clear, friendly error if missing |
| ExecutionPolicy restrictions on Windows PowerShell | Med | Provide command using `-ExecutionPolicy Bypass` or standard `irm ... \| iex` |

## Rollback Plan

Delete `scripts/install.ps1` and `scripts/install.sh`. Revert changes to `src/templates/agents.ts` via Git.

## Success Criteria

- [ ] `install.ps1` successfully installs CLI and provisions Cursor/Claude global rules on Windows.
- [ ] `install.sh` successfully installs CLI and provisions Cursor/Claude global rules on POSIX systems.
- [ ] `AGENTS.md` template instructs AI to run `sdd new` autonomously without manual developer intervention.
- [ ] Documentation updated with one-line install snippets.
