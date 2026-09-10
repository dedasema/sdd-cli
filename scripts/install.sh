#!/usr/bin/env bash
# SDD CLI - Unix/macOS Installer
# Run via: curl -fsSL https://raw.githubusercontent.com/dedasema/sdd-cli/main/scripts/install.sh | bash

set -e

echo -e "\033[36m=========================================\033[0m"
echo -e "\033[36m    SDD CLI - Universal AI Installer     \033[0m"
echo -e "\033[36m=========================================\033[0m"

# 1. Verify Node.js
if ! command -v node >/dev/null 2>&1; then
    echo -e "\n\033[31m[ERROR] Node.js is required but was not found on your system.\033[0m"
    echo -e "\033[33mPlease download and install Node.js (>= 18) from https://nodejs.org\033[0m"
    exit 1
fi

# 2. Detect package manager and install
echo -e "\n\033[32m--> Installing @dedasema/sdd-cli globally...\033[0m"

if command -v pnpm >/dev/null 2>&1; then
    pnpm add -g @dedasema/sdd-cli
elif command -v npm >/dev/null 2>&1; then
    npm install -g @dedasema/sdd-cli
else
    echo -e "\033[31m[ERROR] Neither pnpm nor npm was found.\033[0m"
    exit 1
fi

# 3. Resolve Home Directory
HOME_DIR="${HOME:-$USERPROFILE}"

# 4. Interactive Agent / IDE Selection Menu
echo -e "\n\033[36mSelect AI environments to configure:\033[0m"
echo "  [1] Antigravity 2.0         (~/.gemini/config/skills/sdd)"
echo "  [2] Antigravity CLI (agy)   (~/.gemini/skills/sdd)"
echo "  [3] OpenAI Codex            (~/.codex/skills/sdd)"
echo "  [4] GitHub Copilot (VS Code)(~/.copilot/skills/sdd)"
echo "  [5] OpenCode                (~/.config/opencode/skills/sdd)"
echo "  [6] Claude Code             (~/.claude/skills/sdd + /sdd command)"
echo "  [7] Cursor                  (~/.cursor/skills/sdd + .mdc rule)"
echo "  [A] All environments       (Default - press Enter)"

RAW_CHOICE=""
if [ -c /dev/tty ]; then
    printf "\nChoice(s) [e.g. 1,6,7 or A (Default)]: "
    read -r RAW_CHOICE < /dev/tty || true
elif [ -t 0 ]; then
    printf "\nChoice(s) [e.g. 1,6,7 or A (Default)]: "
    read -r RAW_CHOICE || true
fi

# Parse user choice
if [ -z "$RAW_CHOICE" ] || [ "$RAW_CHOICE" = "A" ] || [ "$RAW_CHOICE" = "a" ]; then
    SELECTED="1 2 3 4 5 6 7"
else
    CLEANED=$(echo "$RAW_CHOICE" | tr ',' ' ')
    SELECTED=""
    for num in $CLEANED; do
        case "$num" in
            1|2|3|4|5|6|7) SELECTED="$SELECTED $num" ;;
        esac
    done
    if [ -z "$SELECTED" ]; then
        SELECTED="1 2 3 4 5 6 7"
    fi
fi

# 5. Universal Agent Skill Definition
SKILL_CONTENT='---
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
   - Run verification and tests (`sdd status` to check progress).'

echo -e "\n\033[32m--> Provisioning selected SDD skills...\033[0m"

for item in $SELECTED; do
    case "$item" in
        1)
            target="$HOME_DIR/.gemini/config/skills/sdd"
            mkdir -p "$target"
            echo "$SKILL_CONTENT" > "$target/SKILL.md"
            echo -e "\033[36m    [OK] Antigravity 2.0   -> $target/SKILL.md\033[0m"
            ;;
        2)
            target="$HOME_DIR/.gemini/skills/sdd"
            mkdir -p "$target"
            echo "$SKILL_CONTENT" > "$target/SKILL.md"
            echo -e "\033[36m    [OK] Antigravity CLI  -> $target/SKILL.md\033[0m"
            ;;
        3)
            target="$HOME_DIR/.codex/skills/sdd"
            mkdir -p "$target"
            echo "$SKILL_CONTENT" > "$target/SKILL.md"
            echo -e "\033[36m    [OK] OpenAI Codex     -> $target/SKILL.md\033[0m"
            ;;
        4)
            target="$HOME_DIR/.copilot/skills/sdd"
            mkdir -p "$target"
            echo "$SKILL_CONTENT" > "$target/SKILL.md"
            echo -e "\033[36m    [OK] GitHub Copilot   -> $target/SKILL.md\033[0m"
            ;;
        5)
            target="$HOME_DIR/.config/opencode/skills/sdd"
            mkdir -p "$target"
            echo "$SKILL_CONTENT" > "$target/SKILL.md"
            echo -e "\033[36m    [OK] OpenCode         -> $target/SKILL.md\033[0m"
            ;;
        6)
            target="$HOME_DIR/.claude/skills/sdd"
            mkdir -p "$target"
            echo "$SKILL_CONTENT" > "$target/SKILL.md"
            echo -e "\033[36m    [OK] Claude Code      -> $target/SKILL.md\033[0m"

            # Ingest Specialized Claude Code Command
            CLAUDE_DIR="$HOME_DIR/.claude/commands"
            mkdir -p "$CLAUDE_DIR"
            cat << 'EOF' > "$CLAUDE_DIR/sdd.md"
Execute the Spec-Driven Development (SDD) lifecycle in this project.
If 'openspec/' does not exist, run 'sdd init' via the terminal tool to bootstrap the environment.
If a change name is given as an argument, run 'sdd new "$@"' in the background.
Always follow the proposal, specs, design, and tasks phases before writing code.
EOF
            echo -e "\033[36m    [OK] Claude Command   -> $CLAUDE_DIR/sdd.md\033[0m"
            ;;
        7)
            target="$HOME_DIR/.cursor/skills/sdd"
            mkdir -p "$target"
            echo "$SKILL_CONTENT" > "$target/SKILL.md"
            echo -e "\033[36m    [OK] Cursor           -> $target/SKILL.md\033[0m"

            # Ingest Specialized Cursor Rule
            CURSOR_DIR="$HOME_DIR/.cursor/rules"
            mkdir -p "$CURSOR_DIR"
            cat << 'EOF' > "$CURSOR_DIR/sdd.mdc"
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
EOF
            echo -e "\033[36m    [OK] Cursor Rule      -> $CURSOR_DIR/sdd.mdc\033[0m"
            ;;
    esac
done

# 8. Completion Banner
echo -e "\n\033[36m=========================================\033[0m"
echo -e "\033[32m   Installation complete! You're ready!  \033[0m"
echo -e "\033[36m=========================================\033[0m"
echo -e "\nYour selected AI environment(s) are now trained to handle SDD."
echo -e "Open any project in your chosen editor and type in chat:"
echo -e "  \033[33m> 'Quiero iniciar un proyecto con SDD'\033[0m"
echo -e "  \033[33m> or use the slash command: /sdd <feature-name>\033[0m"
echo -e "\n\033[32mZero terminal required from now on!\033[0m\n"
