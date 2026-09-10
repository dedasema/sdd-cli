# SDD CLI - Windows Uninstaller
# Run via: irm https://raw.githubusercontent.com/dedasema/sdd-cli/main/scripts/uninstall.ps1 | iex

$ErrorActionPreference = "Continue"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "    SDD CLI - Universal Uninstaller      " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 1. Resolve Home Directory
$homeDir = $env:USERPROFILE
if (-not $homeDir) { $homeDir = $HOME }

# 2. Interactive Selection Menu
Write-Host "`nSelect AI environments to clean up:" -ForegroundColor Cyan
Write-Host "  [1] Antigravity 2.0         (~/.gemini/config/skills/sdd)"
Write-Host "  [2] Antigravity CLI (agy)   (~/.gemini/skills/sdd)"
Write-Host "  [3] OpenAI Codex            (~/.codex/skills/sdd)"
Write-Host "  [4] GitHub Copilot (VS Code)(~/.copilot/skills/sdd)"
Write-Host "  [5] OpenCode                (~/.config/opencode/skills/sdd)"
Write-Host "  [6] Claude Code             (~/.claude/skills/sdd + /sdd command)"
Write-Host "  [7] Cursor                  (~/.cursor/skills/sdd + .mdc rule)"
Write-Host "  [A] All environments       (Default - press Enter)"

$rawChoice = Read-Host "`nChoice(s) to remove [e.g. 1,6,7 or A (Default)]"

$tokens = $rawChoice -split '[, ]' | Where-Object { $_ -ne '' }
if (-not $tokens -or $tokens -contains 'A' -or $tokens -contains 'a') {
    $selected = @(1, 2, 3, 4, 5, 6, 7)
} else {
    $selected = @($tokens | Where-Object { $_ -match '^[1-7]$' } | ForEach-Object { [int]$_ })
    if ($selected.Count -eq 0) {
        $selected = @(1, 2, 3, 4, 5, 6, 7)
    }
}

$envMap = @{
    1 = @{ Name = "Antigravity 2.0";  Path = (Join-Path $homeDir ".gemini\config\skills\sdd") }
    2 = @{ Name = "Antigravity CLI"; Path = (Join-Path $homeDir ".gemini\skills\sdd") }
    3 = @{ Name = "OpenAI Codex";    Path = (Join-Path $homeDir ".codex\skills\sdd") }
    4 = @{ Name = "GitHub Copilot";  Path = (Join-Path $homeDir ".copilot\skills\sdd") }
    5 = @{ Name = "OpenCode";        Path = (Join-Path $homeDir ".config\opencode\skills\sdd") }
    6 = @{ Name = "Claude Code";     Path = (Join-Path $homeDir ".claude\skills\sdd") }
    7 = @{ Name = "Cursor";          Path = (Join-Path $homeDir ".cursor\skills\sdd") }
}

Write-Host "`n--> Removing selected SDD skills..." -ForegroundColor Yellow

foreach ($key in $selected) {
    if ($envMap.ContainsKey($key)) {
        $envInfo = $envMap[$key]
        $dir = $envInfo.Path
        if (Test-Path $dir) {
            Remove-Item -Path $dir -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host "    [REMOVED] $($envInfo.Name) -> $dir" -ForegroundColor DarkYellow
        }
    }
}

# Remove Claude Code command if selected
if ($selected -contains 6) {
    $claudeCmd = Join-Path $homeDir ".claude\commands\sdd.md"
    if (Test-Path $claudeCmd) {
        Remove-Item -Path $claudeCmd -Force -ErrorAction SilentlyContinue
        Write-Host "    [REMOVED] Claude Command -> $claudeCmd" -ForegroundColor DarkYellow
    }
}

# Remove Cursor rule if selected
if ($selected -contains 7) {
    $cursorRule = Join-Path $homeDir ".cursor\rules\sdd.mdc"
    if (Test-Path $cursorRule) {
        Remove-Item -Path $cursorRule -Force -ErrorAction SilentlyContinue
        Write-Host "    [REMOVED] Cursor Rule    -> $cursorRule" -ForegroundColor DarkYellow
    }
}

# Uninstall package if all selected
if ($selected.Count -eq 7) {
    Write-Host "`n--> Uninstalling @dedasema/sdd-cli package..." -ForegroundColor Yellow
    $pnpmCmd = Get-Command pnpm -ErrorAction SilentlyContinue
    $npmCmd = Get-Command npm -ErrorAction SilentlyContinue

    if ($pnpmCmd) {
        pnpm rm -g @dedasema/sdd-cli 2>$null
    } elseif ($npmCmd) {
        npm uninstall -g @dedasema/sdd-cli 2>$null
    }
}

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "   Cleanup complete!                     " -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Selected SDD configurations have been removed.`n"
