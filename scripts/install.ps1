# SDD CLI - Universal Windows Installer
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
$npmCmd = Get-Command npm -ErrorAction SilentlyContinue
$pnpmCmd = Get-Command pnpm -ErrorAction SilentlyContinue

Write-Host "`n--> Installing @dedasema/sdd-cli globally..." -ForegroundColor Green

if ($npmCmd) {
    npm install -g @dedasema/sdd-cli
} elseif ($pnpmCmd) {
    pnpm add -g @dedasema/sdd-cli
} else {
    Write-Host "[ERROR] Neither npm nor pnpm was found." -ForegroundColor Red
    exit 1
}

# 3. Launch interactive setup via SDD CLI
$sddCmd = Get-Command sdd -ErrorAction SilentlyContinue
$setupArgs = if ($args -contains "-All" -or $args -contains "--all" -or $env:SDD_INSTALL_ALL -eq "1") { @("--all") } else { @() }

if ($sddCmd) {
    & sdd setup @setupArgs
} else {
    npx -y @dedasema/sdd-cli setup @setupArgs
}
