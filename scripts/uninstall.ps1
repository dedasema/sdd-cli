# SDD CLI - Windows Uninstaller
# Run via: irm https://raw.githubusercontent.com/dedasema/sdd-cli/main/scripts/uninstall.ps1 | iex

$ErrorActionPreference = "Continue"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "    SDD CLI - Universal Uninstaller      " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 1. Resolve Home Directory
$homeDir = $env:USERPROFILE
if (-not $homeDir) { $homeDir = $HOME }

# 2. Skill directories to purge
$skillTargets = @(
    (Join-Path $homeDir ".gemini\config\skills\sdd"),  # Antigravity 2.0
    (Join-Path $homeDir ".gemini\skills\sdd"),         # Antigravity CLI
    (Join-Path $homeDir ".codex\skills\sdd"),          # Codex
    (Join-Path $homeDir ".copilot\skills\sdd"),        # VS Code Copilot
    (Join-Path $homeDir ".config\opencode\skills\sdd"),# OpenCode
    (Join-Path $homeDir ".claude\skills\sdd"),         # Claude Code
    (Join-Path $homeDir ".cursor\skills\sdd")          # Cursor
)

Write-Host "`n--> Removing global SDD skills across 7 AI environments..." -ForegroundColor Yellow

foreach ($target in $skillTargets) {
    if (Test-Path $target) {
        Remove-Item -Path $target -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "    [REMOVED] $target" -ForegroundColor DarkYellow
    }
}

# 3. Specialized rule and command files to purge
$fileTargets = @(
    (Join-Path $homeDir ".cursor\rules\sdd.mdc"),
    (Join-Path $homeDir ".claude\commands\sdd.md")
)

foreach ($file in $fileTargets) {
    if (Test-Path $file) {
        Remove-Item -Path $file -Force -ErrorAction SilentlyContinue
        Write-Host "    [REMOVED] $file" -ForegroundColor DarkYellow
    }
}

# 4. Uninstall global CLI package
Write-Host "`n--> Uninstalling @dedasema/sdd-cli package..." -ForegroundColor Yellow

$pnpmCmd = Get-Command pnpm -ErrorAction SilentlyContinue
$npmCmd = Get-Command npm -ErrorAction SilentlyContinue

if ($pnpmCmd) {
    pnpm rm -g @dedasema/sdd-cli 2>$null
} elseif ($npmCmd) {
    npm uninstall -g @dedasema/sdd-cli 2>$null
} else {
    Write-Host "    [NOTE] Neither pnpm nor npm was found to uninstall global package." -ForegroundColor DarkGray
}

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "   Uninstallation complete! Clean slate. " -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "All global SDD skills, rules, and commands have been removed.`n"
