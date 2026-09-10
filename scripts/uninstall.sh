#!/usr/bin/env bash
# SDD CLI - Unix/macOS Uninstaller
# Run via: curl -fsSL https://raw.githubusercontent.com/dedasema/sdd-cli/main/scripts/uninstall.sh | bash

echo -e "\033[36m=========================================\033[0m"
echo -e "\033[36m    SDD CLI - Universal Uninstaller      \033[0m"
echo -e "\033[36m=========================================\033[0m"

# 1. Resolve Home Directory
HOME_DIR="${HOME:-$USERPROFILE}"

# 2. Interactive Selection Menu
echo -e "\n\033[36mSelect AI environments to clean up:\033[0m"
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
    printf "\nChoice(s) to remove [e.g. 1,6,7 or A (Default)]: "
    read -r RAW_CHOICE < /dev/tty || true
elif [ -t 0 ]; then
    printf "\nChoice(s) to remove [e.g. 1,6,7 or A (Default)]: "
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

echo -e "\n\033[33m--> Removing selected SDD skills...\033[0m"

for item in $SELECTED; do
    case "$item" in
        1)
            target="$HOME_DIR/.gemini/config/skills/sdd"
            if [ -d "$target" ]; then
                rm -rf "$target"
                echo -e "\033[33m    [REMOVED] Antigravity 2.0   -> $target\033[0m"
            fi
            ;;
        2)
            target="$HOME_DIR/.gemini/skills/sdd"
            if [ -d "$target" ]; then
                rm -rf "$target"
                echo -e "\033[33m    [REMOVED] Antigravity CLI  -> $target\033[0m"
            fi
            ;;
        3)
            target="$HOME_DIR/.codex/skills/sdd"
            if [ -d "$target" ]; then
                rm -rf "$target"
                echo -e "\033[33m    [REMOVED] OpenAI Codex     -> $target\033[0m"
            fi
            ;;
        4)
            target="$HOME_DIR/.copilot/skills/sdd"
            if [ -d "$target" ]; then
                rm -rf "$target"
                echo -e "\033[33m    [REMOVED] GitHub Copilot   -> $target\033[0m"
            fi
            ;;
        5)
            target="$HOME_DIR/.config/opencode/skills/sdd"
            if [ -d "$target" ]; then
                rm -rf "$target"
                echo -e "\033[33m    [REMOVED] OpenCode         -> $target\033[0m"
            fi
            ;;
        6)
            target="$HOME_DIR/.claude/skills/sdd"
            if [ -d "$target" ]; then
                rm -rf "$target"
                echo -e "\033[33m    [REMOVED] Claude Code      -> $target\033[0m"
            fi
            cmd_target="$HOME_DIR/.claude/commands/sdd.md"
            if [ -f "$cmd_target" ]; then
                rm -f "$cmd_target"
                echo -e "\033[33m    [REMOVED] Claude Command   -> $cmd_target\033[0m"
            fi
            ;;
        7)
            target="$HOME_DIR/.cursor/skills/sdd"
            if [ -d "$target" ]; then
                rm -rf "$target"
                echo -e "\033[33m    [REMOVED] Cursor           -> $target\033[0m"
            fi
            rule_target="$HOME_DIR/.cursor/rules/sdd.mdc"
            if [ -f "$rule_target" ]; then
                rm -f "$rule_target"
                echo -e "\033[33m    [REMOVED] Cursor Rule      -> $rule_target\033[0m"
            fi
            ;;
    esac
done

# If all environments uninstalled, also remove CLI package
if [ "$SELECTED" = "1 2 3 4 5 6 7" ]; then
    echo -e "\n\033[33m--> Uninstalling @dedasema/sdd-cli package...\033[0m"
    if command -v pnpm >/dev/null 2>&1; then
        pnpm rm -g @dedasema/sdd-cli >/dev/null 2>&1 || true
    elif command -v npm >/dev/null 2>&1; then
        npm uninstall -g @dedasema/sdd-cli >/dev/null 2>&1 || true
    fi
fi

echo -e "\n\033[36m=========================================\033[0m"
echo -e "\033[32m   Cleanup complete!                     \033[0m"
echo -e "\033[36m=========================================\033[0m"
echo -e "Selected SDD configurations have been removed.\n"
