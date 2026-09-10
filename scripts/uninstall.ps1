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
Write-Host "  [1] Antigravity 2.0         (~/.gemini/config/skills/sdd + /sdd)"
Write-Host "  [2] Antigravity CLI (agy)   (~/.gemini/skills/sdd + /sdd)"
Write-Host "  [3] OpenAI Codex            (~/.codex/AGENTS.md + skills)"
Write-Host "  [4] GitHub Copilot (VS Code)(~/.copilot/copilot-instructions.md + skills)"
Write-Host "  [5] OpenCode                (~/.config/opencode/AGENTS.md + skills)"
Write-Host "  [6] Claude Code             (~/.claude/CLAUDE.md + commands)"
Write-Host "  [7] Cursor                  (~/.cursor/rules/sdd.mdc + skills)"
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

function Remove-DelimitedRule([string]$filePath) {
    if (Test-Path $filePath) {
        $startMarker = "<!-- >>> SDD PROTOCOL >>> -->"
        $endMarker = "<!-- <<< SDD PROTOCOL <<< -->"
        $existing = Get-Content $filePath -Raw -Encoding UTF8
        if ($existing -match "(?s)$startMarker.*?$endMarker") {
            $newContent = ($existing -replace "(?s)$startMarker.*?$endMarker", "").Trim()
            if ([string]::IsNullOrWhiteSpace($newContent)) {
                Remove-Item -Path $filePath -Force -ErrorAction SilentlyContinue
                Write-Host "    [REMOVED] $filePath" -ForegroundColor DarkYellow
            } else {
                Set-Content -Path $filePath -Value ($newContent + "`n") -Encoding UTF8
                Write-Host "    [EXCISED] SDD block from $filePath (existing user instructions preserved)" -ForegroundColor DarkYellow
            }
        }
    }
}

Write-Host "`n--> Removing selected SDD skills & global rules..." -ForegroundColor Yellow

# Remove Skills
$envSkillMap = @{
    1 = @{ Name = "Antigravity 2.0";  Path = (Join-Path $homeDir ".gemini\config\skills\sdd") }
    2 = @{ Name = "Antigravity CLI"; Path = (Join-Path $homeDir ".gemini\skills\sdd") }
    3 = @{ Name = "OpenAI Codex";    Path = (Join-Path $homeDir ".codex\skills\sdd") }
    4 = @{ Name = "GitHub Copilot";  Path = (Join-Path $homeDir ".copilot\skills\sdd") }
    5 = @{ Name = "OpenCode";        Path = (Join-Path $homeDir ".config\opencode\skills\sdd") }
    6 = @{ Name = "Claude Code";     Path = (Join-Path $homeDir ".claude\skills\sdd") }
    7 = @{ Name = "Cursor";          Path = (Join-Path $homeDir ".cursor\skills\sdd") }
}

foreach ($key in $selected) {
    if ($envSkillMap.ContainsKey($key)) {
        $dir = $envSkillMap[$key].Path
        if (Test-Path $dir) {
            Remove-Item -Path $dir -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host "    [REMOVED] Skill -> $dir" -ForegroundColor DarkYellow
        }
    }
}

# Remove Global Rules & Commands per selected environment

# [3] Codex
if ($selected -contains 3) {
    Remove-DelimitedRule (Join-Path $homeDir ".codex\AGENTS.md")
}

# [4] Copilot
if ($selected -contains 4) {
    Remove-DelimitedRule (Join-Path $homeDir ".copilot\copilot-instructions.md")
}

# [5] OpenCode
if ($selected -contains 5) {
    Remove-DelimitedRule (Join-Path $homeDir ".config\opencode\AGENTS.md")
}

# [6] Claude Code
if ($selected -contains 6) {
    Remove-DelimitedRule (Join-Path $homeDir ".claude\CLAUDE.md")
    $claudeCmd = Join-Path $homeDir ".claude\commands\sdd.md"
    if (Test-Path $claudeCmd) {
        Remove-Item -Path $claudeCmd -Force -ErrorAction SilentlyContinue
        Write-Host "    [REMOVED] Claude Command -> $claudeCmd" -ForegroundColor DarkYellow
    }
}

# [7] Cursor
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
