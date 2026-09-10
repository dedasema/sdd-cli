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

# 4. Ingest Global Cursor Rule (~/.cursor/rules/sdd.mdc)
$cursorDir = Join-Path $homeDir ".cursor\rules"
if (-not (Test-Path $cursorDir)) {
    New-Item -ItemType Directory -Path $cursorDir -Force | Out-Null
}

$cursorRulePath = Join-Path $cursorDir "sdd.mdc"
$cursorRuleContent = @"
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
"@

Set-Content -Path $cursorRulePath -Value $cursorRuleContent -Encoding UTF8
Write-Host "--> Provisioned global Cursor rule: $cursorRulePath" -ForegroundColor Green

# 5. Ingest Global Claude Code Command (~/.claude/commands/sdd.md)
$claudeDir = Join-Path $homeDir ".claude\commands"
if (-not (Test-Path $claudeDir)) {
    New-Item -ItemType Directory -Path $claudeDir -Force | Out-Null
}

$claudeCmdPath = Join-Path $claudeDir "sdd.md"
$claudeCmdContent = @"
Execute the Spec-Driven Development (SDD) lifecycle in this project.
If 'openspec/' does not exist, run 'sdd init' via the terminal tool to bootstrap the environment.
If a change name is given as an argument, run 'sdd new $ARGUMENTS'.
Always follow the proposal, specs, design, and tasks phases before writing code.
"@

Set-Content -Path $claudeCmdPath -Value $claudeCmdContent -Encoding UTF8
Write-Host "--> Provisioned global Claude Code command: $claudeCmdPath" -ForegroundColor Green

# 6. Completion Banner
Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "   Installation complete! You're ready!  " -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "`nYour AI assistant in Cursor and Claude Code is now trained to handle SDD."
Write-Host "You can now open any project and type in the chat:"
Write-Host "  > 'Quiero iniciar un proyecto con SDD'" -ForegroundColor Yellow
Write-Host "  > or use the slash command: /sdd <feature-name>" -ForegroundColor Yellow
Write-Host "`nZero terminal required from now on!" -ForegroundColor Green
