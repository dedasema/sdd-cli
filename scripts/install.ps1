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

# 3. Resolve Home & Config Directories
$homeDir = $env:USERPROFILE
if (-not $homeDir) { $homeDir = $HOME }

$zedDir = if ($env:APPDATA) { Join-Path $env:APPDATA "Zed" } else { Join-Path $homeDir ".config\zed" }

# 4. Interactive Agent / IDE Selection Menu
Write-Host "`nSelect AI environments to configure:" -ForegroundColor Cyan
Write-Host "  [1] Antigravity 2.0         (~/.gemini/config/skills/sdd + /sdd)"
Write-Host "  [2] Antigravity CLI (agy)   (~/.gemini/skills/sdd + /sdd)"
Write-Host "  [3] OpenAI Codex            (~/.codex/AGENTS.md + skills)"
Write-Host "  [4] GitHub Copilot (VS Code)(~/.copilot/copilot-instructions.md + skills)"
Write-Host "  [5] OpenCode                (~/.config/opencode/AGENTS.md + skills)"
Write-Host "  [6] Claude Code             (~/.claude/CLAUDE.md + /sdd command)"
Write-Host "  [7] Cursor                  (~/.cursor/rules/sdd.mdc + skills)"
Write-Host "  [8] Zed                     (%APPDATA%/Zed: rule + /sdd + skill)"
Write-Host "  [A] All environments       (Default - press Enter)"

$rawChoice = Read-Host "`nChoice(s) [e.g. 8 or 1,6,7 or A (Default)]"

$tokens = $rawChoice -split '[, ]' | Where-Object { $_ -ne '' }
if (-not $tokens -or $tokens -contains 'A' -or $tokens -contains 'a') {
    $selected = @(1, 2, 3, 4, 5, 6, 7, 8)
} else {
    $selected = @($tokens | Where-Object { $_ -match '^[1-8]$' } | ForEach-Object { [int]$_ })
    if ($selected.Count -eq 0) {
        $selected = @(1, 2, 3, 4, 5, 6, 7, 8)
    }
}

# 5. Shared Protocol Definitions
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

$sddRuleBlock = @'
<!-- >>> SDD PROTOCOL >>> -->
# Spec-Driven Development (SDD) Autonomous Protocol

When the user asks to create a project, develop a feature, or use Spec-Driven Development:
1. Check if 'openspec/' exists in the root of the current workspace.
2. If 'openspec/' does NOT exist, autonomously execute 'sdd init' in the background using your terminal tool before writing code.
3. For any new feature or bug fix, autonomously execute 'sdd new <feature-name>' in the background to create the change workspace.
4. Fill in the proposal, specs (Given/When/Then), design, and tasks before implementing code.
5. Never vibe-code: wait for user approval on specifications before touching code.
<!-- <<< SDD PROTOCOL <<< -->
'@

function Inject-DelimitedRule([string]$filePath, [string]$content) {
    $dir = Split-Path $filePath -Parent
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    $startMarker = "<!-- >>> SDD PROTOCOL >>> -->"
    $endMarker = "<!-- <<< SDD PROTOCOL <<< -->"
    if (Test-Path $filePath) {
        $existing = Get-Content $filePath -Raw -Encoding UTF8
        if ($existing -match "(?s)$startMarker.*?$endMarker") {
            $newContent = $existing -replace "(?s)$startMarker.*?$endMarker", $content.Trim()
        } else {
            $newContent = $existing.TrimEnd() + "`n`n" + $content.Trim() + "`n"
        }
    } else {
        $newContent = $content.Trim() + "`n"
    }
    Set-Content -Path $filePath -Value $newContent -Encoding UTF8
}

function Inject-ZedSlashCommand([string]$settingsPath) {
    $dir = Split-Path $settingsPath -Parent
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    node -e '
    const fs = require("fs");
    const filePath = process.argv[1];
    let settings = {};
    if (fs.existsSync(filePath)) {
        try {
            settings = JSON.parse(fs.readFileSync(filePath, "utf8"));
        } catch (e) {
            settings = {};
        }
    }
    if (!settings.assistant) settings.assistant = {};
    if (!settings.assistant.slash_commands) settings.assistant.slash_commands = {};
    settings.assistant.slash_commands.sdd = {
        description: "Execute Spec-Driven Development (SDD) autonomous protocol",
        text: "Execute the Spec-Driven Development (SDD) lifecycle in this project:\n1. Check if \"openspec/\" exists in workspace. If not, run \"sdd init\".\n2. For new features or fixes, run \"sdd new <feature-name>\".\n3. Follow proposal, specs (Given/When/Then), design, and tasks before coding.\n4. Never vibe-code: wait for user approval on specifications."
    };
    fs.writeFileSync(filePath, JSON.stringify(settings, null, 2) + "\n", "utf8");
    ' "$settingsPath"
}

Write-Host "`n--> Provisioning selected SDD skills & global rules..." -ForegroundColor Green

# 6. Target Skills Provisioning
$envMap = @{
    1 = @{ Name = "Antigravity 2.0";  Path = (Join-Path $homeDir ".gemini\config\skills\sdd") }
    2 = @{ Name = "Antigravity CLI"; Path = (Join-Path $homeDir ".gemini\skills\sdd") }
    3 = @{ Name = "OpenAI Codex";    Path = (Join-Path $homeDir ".codex\skills\sdd") }
    4 = @{ Name = "GitHub Copilot";  Path = (Join-Path $homeDir ".copilot\skills\sdd") }
    5 = @{ Name = "OpenCode";        Path = (Join-Path $homeDir ".config\opencode\skills\sdd") }
    6 = @{ Name = "Claude Code";     Path = (Join-Path $homeDir ".claude\skills\sdd") }
    7 = @{ Name = "Cursor";          Path = (Join-Path $homeDir ".cursor\skills\sdd") }
    8 = @{ Name = "Zed";             Path = (Join-Path $zedDir "skills\sdd") }
}

foreach ($key in $selected) {
    if ($envMap.ContainsKey($key)) {
        $envInfo = $envMap[$key]
        $dir = $envInfo.Path
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
        $skillPath = Join-Path $dir "SKILL.md"
        Set-Content -Path $skillPath -Value $skillContent -Encoding UTF8
        Write-Host "    [OK] $($envInfo.Name) (Skill) -> $skillPath" -ForegroundColor DarkCyan
    }
}

# 7. Provision Global Rules & Commands per environment

# [3] Codex: ~/.codex/AGENTS.md
if ($selected -contains 3) {
    $codexRulePath = Join-Path $homeDir ".codex\AGENTS.md"
    Inject-DelimitedRule $codexRulePath $sddRuleBlock
    Write-Host "    [OK] OpenAI Codex (Global Rule)     -> $codexRulePath" -ForegroundColor DarkCyan
}

# [4] Copilot: ~/.copilot/copilot-instructions.md
if ($selected -contains 4) {
    $copilotRulePath = Join-Path $homeDir ".copilot\copilot-instructions.md"
    Inject-DelimitedRule $copilotRulePath $sddRuleBlock
    Write-Host "    [OK] GitHub Copilot (Global Rule)   -> $copilotRulePath" -ForegroundColor DarkCyan
}

# [5] OpenCode: ~/.config/opencode/AGENTS.md
if ($selected -contains 5) {
    $opencodeRulePath = Join-Path $homeDir ".config\opencode\AGENTS.md"
    Inject-DelimitedRule $opencodeRulePath $sddRuleBlock
    Write-Host "    [OK] OpenCode (Global Rule)         -> $opencodeRulePath" -ForegroundColor DarkCyan
}

# [6] Claude Code: ~/.claude/CLAUDE.md + commands/sdd.md
if ($selected -contains 6) {
    $claudeRulePath = Join-Path $homeDir ".claude\CLAUDE.md"
    Inject-DelimitedRule $claudeRulePath $sddRuleBlock
    Write-Host "    [OK] Claude Code (Global Rule)      -> $claudeRulePath" -ForegroundColor DarkCyan

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
    Write-Host "    [OK] Claude Code (Slash Command)    -> $claudeCmdPath" -ForegroundColor DarkCyan
}

# [7] Cursor: ~/.cursor/rules/sdd.mdc
if ($selected -contains 7) {
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
    Write-Host "    [OK] Cursor (Global Rule)           -> $cursorRulePath" -ForegroundColor DarkCyan
}

# [8] Zed: %APPDATA%/Zed/AGENTS.md + settings.json slash command
if ($selected -contains 8) {
    $zedRulePath = Join-Path $zedDir "AGENTS.md"
    Inject-DelimitedRule $zedRulePath $sddRuleBlock
    Write-Host "    [OK] Zed (Global Rule)              -> $zedRulePath" -ForegroundColor DarkCyan

    $zedSettingsPath = Join-Path $zedDir "settings.json"
    Inject-ZedSlashCommand $zedSettingsPath
    Write-Host "    [OK] Zed (/sdd Slash Command)       -> $zedSettingsPath" -ForegroundColor DarkCyan
}

# 8. Completion Banner
Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "   Installation complete! You're ready!  " -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "`nGlobal rules & skills are now active across your chosen environment(s)."
Write-Host "Open ANY project in your editor and your AI will automatically follow SDD."
Write-Host "You can also use slash commands like /sdd where supported."
Write-Host "`nZero terminal required from now on!`n" -ForegroundColor Green
