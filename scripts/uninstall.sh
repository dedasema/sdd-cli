#!/usr/bin/env bash
# SDD CLI - Unix/macOS Uninstaller
# Run via: curl -fsSL https://raw.githubusercontent.com/dedasema/sdd-cli/main/scripts/uninstall.sh | bash

echo -e "\033[36m=========================================\033[0m"
echo -e "\033[36m    SDD CLI - Universal Uninstaller      \033[0m"
echo -e "\033[36m=========================================\033[0m"

# 1. Resolve Home Directory
HOME_DIR="${HOME:-$USERPROFILE}"

# 2. Skill directories to purge
SKILL_TARGETS=(
    "$HOME_DIR/.gemini/config/skills/sdd"
    "$HOME_DIR/.gemini/skills/sdd"
    "$HOME_DIR/.codex/skills/sdd"
    "$HOME_DIR/.copilot/skills/sdd"
    "$HOME_DIR/.config/opencode/skills/sdd"
    "$HOME_DIR/.claude/skills/sdd"
    "$HOME_DIR/.cursor/skills/sdd"
)

echo -e "\n\033[33m--> Removing global SDD skills across 7 AI environments...\033[0m"

for target in "${SKILL_TARGETS[@]}"; do
    if [ -d "$target" ]; then
        rm -rf "$target"
        echo -e "\033[33m    [REMOVED] $target\033[0m"
    fi
done

# 3. Specialized rule and command files to purge
FILE_TARGETS=(
    "$HOME_DIR/.cursor/rules/sdd.mdc"
    "$HOME_DIR/.claude/commands/sdd.md"
)

for file in "${FILE_TARGETS[@]}"; do
    if [ -f "$file" ]; then
        rm -f "$file"
        echo -e "\033[33m    [REMOVED] $file\033[0m"
    fi
done

# 4. Uninstall global CLI package
echo -e "\n\033[33m--> Uninstalling @dedasema/sdd-cli package...\033[0m"

if command -v pnpm >/dev/null 2>&1; then
    pnpm rm -g @dedasema/sdd-cli >/dev/null 2>&1 || true
elif command -v npm >/dev/null 2>&1; then
    npm uninstall -g @dedasema/sdd-cli >/dev/null 2>&1 || true
else
    echo -e "    [NOTE] Neither pnpm nor npm was found to uninstall global package."
fi

echo -e "\n\033[36m=========================================\033[0m"
echo -e "\033[32m   Uninstallation complete! Clean slate. \033[0m"
echo -e "\033[36m=========================================\033[0m"
echo -e "All global SDD skills, rules, and commands have been removed.\n"
