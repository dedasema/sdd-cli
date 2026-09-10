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

# 4. Ingest Global Cursor Rule (~/.cursor/rules/sdd.mdc)
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

echo -e "\033[32m--> Provisioned global Cursor rule: $CURSOR_DIR/sdd.mdc\033[0m"

# 5. Ingest Global Claude Code Command (~/.claude/commands/sdd.md)
CLAUDE_DIR="$HOME_DIR/.claude/commands"
mkdir -p "$CLAUDE_DIR"

cat << 'EOF' > "$CLAUDE_DIR/sdd.md"
Execute the Spec-Driven Development (SDD) lifecycle in this project.
If 'openspec/' does not exist, run 'sdd init' via the terminal tool to bootstrap the environment.
If a change name is given as an argument, run 'sdd new "$@"' in the background.
Always follow the proposal, specs, design, and tasks phases before writing code.
EOF

echo -e "\033[32m--> Provisioned global Claude Code command: $CLAUDE_DIR/sdd.md\033[0m"

# 6. Completion Banner
echo -e "\n\033[36m=========================================\033[0m"
echo -e "\033[32m   Installation complete! You're ready!  \033[0m"
echo -e "\033[36m=========================================\033[0m"
echo -e "\nYour AI assistant in Cursor and Claude Code is now trained to handle SDD."
echo -e "You can now open any project and type in the chat:"
echo -e "  \033[33m> 'Quiero iniciar un proyecto con SDD'\033[0m"
echo -e "  \033[33m> or use the slash command: /sdd <feature-name>\033[0m"
echo -e "\n\033[32mZero terminal required from now on!\033[0m\n"
