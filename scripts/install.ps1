# SDD CLI - Windows Installer
# Run via: irm https://raw.githubusercontent.com/dedasema/sdd-cli/main/scripts/install.ps1 | iex

$ErrorActionPreference = "Stop"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "    SDD CLI - Universal AI Installer     " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 1. Verify Node.js prerequisite
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCmd) {
    Write-Host "`n[ERROR] Node.js is required but was not found on your system." -ForegroundColor Red
    Write-Host "Please download and install Node.js (>= 18) from https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

# 2. Detect package manager and install CLI
$pnpmCmd = Get-Command pnpm -ErrorAction SilentlyContinue
$npmCmd = Get-Command npm -ErrorAction SilentlyContinue

Write-Host "`n--> Installing @dedasema/sdd-cli globally..." -ForegroundColor Green

if ($pnpmCmd) {
    pnpm add -g @dedasema/sdd-cli
} elseif ($npmCmd) {
    npm install -g @dedasema/sdd-cli
} else {
    Write-Host "[ERROR] Neither pnpm nor npm was found." -ForegroundColor Red
    exit 1
}

# 3. Resolve Home Directory
$homeDir = $env:USERPROFILE
if (-not $homeDir) { $homeDir = $HOME }

# 4. Universal Agent Skill Definition
$skillContent = @'
---
name: sdd
description: "Spec-Driven Development (SDD) autonomous lifecycle. Triggers on project creation, feature development, bug fixes, or when SDD is mentioned."
---

# Spec-Driven Development (SDD) Autonomous AI Protocol

You are an expert software architect practicing Spec-Driven Development (SDD).

## Lifecycle Rules

1. **Bootstrap & Inspection**:
   - Check if `openspec/` exists in the root of the workspace.
   - If `openspec/` does NOT exist, autonomously execute `sdd init` in the background using your terminal tool before writing any project code.

2. **Feature & Change Initialization**:
   - When the user asks for a new feature, bug fix, or refactor, autonomously run:
     `sdd new <feature-hyphenated-name>`
   - This scaffolds the change directory under `openspec/changes/<feature-hyphenated-name>/`.

3. **Phase Progression (Spec-First)**:
   - **Proposal**: Fill `proposal.md` with intent, scope, capabilities, and risks.
   - **Specs**: Write testable scenarios in `specs.md` using GIVEN/WHEN/THEN format.
   - **Design**: Define architecture decisions and target file modifications in `design.md`.
   - **Tasks**: Create clear checklists in `tasks.md`.
   - NEVER start coding before specifications and tasks are defined.

4. **Implementation & Verification**:
   - Write code according to `tasks.md`.
   - Run verification and tests (`sdd status` to check progress).
'@

# 5. Provision Universal Skills across 7 Target AI Environments
$skillTargets = @(
    (Join-Path $homeDir ".gemini\config\skills\sdd"),  # Antigravity 2.0
    (Join-Path $homeDir ".gemini\skills\sdd"),         # Antigravity CLI (agy)
    (Join-Path $homeDir ".codex\skills\sdd"),          # Codex
    (Join-Path $homeDir ".copilot\skills\sdd"),        # VS Code Copilot
    (Join-Path $homeDir ".config\opencode\skills\sdd"),# OpenCode
    (Join-Path $homeDir ".claude\skills\sdd"),         # Claude Code
    (Join-Path $homeDir ".cursor\skills\sdd")          # Cursor
)

Write-Host "`n--> Provisioning global SDD skills across 7 AI environments..." -ForegroundColor Green

foreach ($target in $skillTargets) {
    if (-not (Test-Path $target)) {
        New-Item -ItemType Directory -Path $target -Force | Out-Null
    }
    $skillPath = Join-Path $target "SKILL.md"
    Set-Content -Path $skillPath -Value $skillContent -Encoding UTF8
}

Write-Host "    [OK] Antigravity 2.0   (~/.gemini/config/skills/sdd/SKILL.md)" -ForegroundColor DarkCyan
Write-Host "    [OK] Antigravity CLI  (~/.gemini/skills/sdd/SKILL.md)" -ForegroundColor DarkCyan
Write-Host "    [OK] Codex            (~/.codex/skills/sdd/SKILL.md)" -ForegroundColor DarkCyan
Write-Host "    [OK] VS Code Copilot  (~/.copilot/skills/sdd/SKILL.md)" -ForegroundColor DarkCyan
Write-Host "    [OK] OpenCode         (~/.config/opencode/skills/sdd/SKILL.md)" -ForegroundColor DarkCyan
Write-Host "    [OK] Claude Code      (~/.claude/skills/sdd/SKILL.md)" -ForegroundColor DarkCyan
Write-Host "    [OK] Cursor           (~/.cursor/skills/sdd/SKILL.md)" -ForegroundColor DarkCyan

# 6. Ingest Specialized Cursor Rule (~/.cursor/rules/sdd.mdc)
$cursorDir = Join-Path $homeDir ".cursor\rules"
if (-not (Test-Path $cursorDir)) {
    New-Item -ItemType Directory -Path $cursorDir -Force | Out-Null
}

$cursorRulePath = Join-Path $cursorDir "sdd.mdc"
$cursorRuleContent = @'
---
description: Spec-Driven Development (SDD) Autonomous AI Protocol
globs: *
alwaysApply: true
---

# SDD Autonomous Assistant Protocol

When the user asks to create a project, develop a feature, or use Spec-Driven Development:
1. Check if 'openspec/' exists in the root of the current project workspace.
2. If 'openspec/' does NOT exist, autonomously execute 'sdd init' in the background using your terminal tool.
3. For any new feature or bug fix, autonomously execute 'sdd new <feature-name>' in the background to create the change workspace.
4. Fill in the proposal, specs (Given/When/Then), design, and tasks before implementing code.
5. Never vibe-code: wait for user approval on specifications before touching code.
'@

Set-Content -Path $cursorRulePath -Value $cursorRuleContent -Encoding UTF8
Write-Host "    [OK] Cursor Rule      (~/.cursor/rules/sdd.mdc)" -ForegroundColor DarkCyan

# 7. Ingest Specialized Claude Code Command (~/.claude/commands/sdd.md)
$claudeDir = Join-Path $homeDir ".claude\commands"
if (-not (Test-Path $claudeDir)) {
    New-Item -ItemType Directory -Path $claudeDir -Force | Out-Null
}

$claudeCmdPath = Join-Path $claudeDir "sdd.md"
$claudeCmdContent = @'
Execute the Spec-Driven Development (SDD) lifecycle in this project.
If 'openspec/' does not exist, run 'sdd init' via the terminal tool to bootstrap the environment.
If a change name is given as an argument, run 'sdd new $ARGUMENTS'.
Always follow the proposal, specs, design, and tasks phases before writing code.
'@

Set-Content -Path $claudeCmdPath -Value $claudeCmdContent -Encoding UTF8
Write-Host "    [OK] Claude Command   (~/.claude/commands/sdd.md)" -ForegroundColor DarkCyan

# 8. Completion Banner
Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "   Installation complete! You're ready!  " -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "`nNatively configured for:"
Write-Host "  - Antigravity 2.0 & Antigravity CLI"
Write-Host "  - OpenAI Codex"
Write-Host "  - GitHub Copilot (VS Code)"
Write-Host "  - OpenCode"
Write-Host "  - Claude Code"
Write-Host "  - Cursor"
Write-Host "`nYou can now open any project in your preferred editor and type in the chat:"
Write-Host "  > 'Quiero iniciar un proyecto con SDD'" -ForegroundColor Yellow
Write-Host "  > or use the slash command: /sdd <feature-name>" -ForegroundColor Yellow
Write-Host "`nZero terminal required from now on!" -ForegroundColor Green
