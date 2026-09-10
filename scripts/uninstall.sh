#!/usr/bin/env bash
# SDD CLI - Unix/macOS Uninstaller
# Run via: curl -fsSL https://raw.githubusercontent.com/dedasema/sdd-cli/main/scripts/uninstall.sh | bash

echo -e "\033[36m=========================================\033[0m"
echo -e "\033[36m    SDD CLI - Universal Uninstaller      \033[0m"
echo -e "\033[36m=========================================\033[0m"

# 1. Resolve Home Directory
HOME_DIR="${HOME:-$USERPROFILE}"
ZED_DIR="$HOME_DIR/.config/zed"

# 2. Interactive Selection Menu
echo -e "\n\033[36mSelect AI environments to clean up:\033[0m"
echo "  [1] Antigravity 2.0         (~/.gemini/config/skills/sdd + /sdd)"
echo "  [2] Antigravity CLI (agy)   (~/.gemini/skills/sdd + /sdd)"
echo "  [3] OpenAI Codex            (~/.codex/AGENTS.md + skills)"
echo "  [4] GitHub Copilot (VS Code)(~/.copilot/copilot-instructions.md + skills)"
echo "  [5] OpenCode                (~/.config/opencode/AGENTS.md + skills)"
echo "  [6] Claude Code             (~/.claude/CLAUDE.md + commands)"
echo "  [7] Cursor                  (~/.cursor/rules/sdd.mdc + skills)"
echo "  [8] Zed                     (~/.config/zed: rule + /sdd + skill)"
echo "  [A] All environments       (Default - press Enter)"

RAW_CHOICE=""
if [ -c /dev/tty ]; then
    printf "\nChoice(s) to remove [e.g. 8 or 1,6,7 or A (Default)]: "
    read -r RAW_CHOICE < /dev/tty || true
elif [ -t 0 ]; then
    printf "\nChoice(s) to remove [e.g. 8 or 1,6,7 or A (Default)]: "
    read -r RAW_CHOICE || true
fi

# Parse user choice
if [ -z "$RAW_CHOICE" ] || [ "$RAW_CHOICE" = "A" ] || [ "$RAW_CHOICE" = "a" ]; then
    SELECTED="1 2 3 4 5 6 7 8"
else
    CLEANED=$(echo "$RAW_CHOICE" | tr ',' ' ')
    SELECTED=""
    for num in $CLEANED; do
        case "$num" in
            1|2|3|4|5|6|7|8) SELECTED="$SELECTED $num" ;;
        esac
    done
    if [ -z "$SELECTED" ]; then
        SELECTED="1 2 3 4 5 6 7 8"
    fi
fi

remove_delimited_rule() {
    local file="$1"
    if [ -f "$file" ]; then
        node -e '
        const fs = require("fs");
        const filePath = process.argv[1];
        if (fs.existsSync(filePath)) {
            const startMarker = "<!-- >>> SDD PROTOCOL >>> -->";
            const endMarker = "<!-- <<< SDD PROTOCOL <<< -->";
            let existing = fs.readFileSync(filePath, "utf8");
            const regex = new RegExp(startMarker + "[\\s\\S]*?" + endMarker);
            if (regex.test(existing)) {
                let cleaned = existing.replace(regex, "").trim();
                if (!cleaned) {
                    fs.unlinkSync(filePath);
                    console.log("    \x1b[33m[REMOVED] " + filePath + "\x1b[0m");
                } else {
                    fs.writeFileSync(filePath, cleaned + "\n", "utf8");
                    console.log("    \x1b[33m[EXCISED] SDD block from " + filePath + " (user instructions preserved)\x1b[0m");
                }
            }
        }
        ' "$file"
    fi
}

remove_zed_slash_command() {
    local settings_path="$1"
    if [ -f "$settings_path" ]; then
        node - "$settings_path" << 'NODE_SCRIPT'
        const fs = require("fs");
        const filePath = process.argv[2];
        function stripJsonc(content) {
            return content
                .replace(/\/\*[\s\S]*?\*\//g, "")
                .replace(/\/\/.*/g, "")
                .replace(/,\s*([\]}])/g, "$1");
        }
        if (fs.existsSync(filePath)) {
            const raw = fs.readFileSync(filePath, "utf8");
            const firstBrace = raw.indexOf("{");
            const leadingComments = firstBrace > 0 ? raw.slice(0, firstBrace).trim() : "";
            try {
                const settings = JSON.parse(stripJsonc(raw));
                const sddCommands = ["sdd", "sdd-init", "sdd-new", "sdd-propose", "sdd-spec", "sdd-design", "sdd-tasks", "sdd-verify", "sdd-archive"];
                let modified = false;
                if (settings.assistant && settings.assistant.slash_commands) {
                    for (const cmd of sddCommands) {
                        if (settings.assistant.slash_commands[cmd]) {
                            delete settings.assistant.slash_commands[cmd];
                            modified = true;
                        }
                    }
                    if (Object.keys(settings.assistant.slash_commands).length === 0) {
                        delete settings.assistant.slash_commands;
                    }
                    if (Object.keys(settings.assistant).length === 0) {
                        delete settings.assistant;
                    }
                    if (modified) {
                        const output = (leadingComments ? leadingComments + "\n" : "") + JSON.stringify(settings, null, 2) + "\n";
                        fs.writeFileSync(filePath, output, "utf8");
                        console.log("    \x1b[33m[REMOVED] Zed SDD Slash Commands from " + filePath + "\x1b[0m");
                    }
                }
            } catch (e) {
                console.error("    [WARN] Unable to parse " + filePath + " during removal: " + e.message);
            }
        }
NODE_SCRIPT
    fi
}

echo -e "\n\033[33m--> Removing selected SDD skills & global rules...\033[0m"

for item in $SELECTED; do
    case "$item" in
        1)
            target="$HOME_DIR/.gemini/config/skills/sdd"
            if [ -d "$target" ]; then
                rm -rf "$target"
                echo -e "\033[33m    [REMOVED] Skill -> $target\033[0m"
            fi
            ;;
        2)
            target="$HOME_DIR/.gemini/skills/sdd"
            if [ -d "$target" ]; then
                rm -rf "$target"
                echo -e "\033[33m    [REMOVED] Skill -> $target\033[0m"
            fi
            ;;
        3)
            target="$HOME_DIR/.codex/skills/sdd"
            if [ -d "$target" ]; then
                rm -rf "$target"
                echo -e "\033[33m    [REMOVED] Skill -> $target\033[0m"
            fi
            remove_delimited_rule "$HOME_DIR/.codex/AGENTS.md"
            ;;
        4)
            target="$HOME_DIR/.copilot/skills/sdd"
            if [ -d "$target" ]; then
                rm -rf "$target"
                echo -e "\033[33m    [REMOVED] Skill -> $target\033[0m"
            fi
            remove_delimited_rule "$HOME_DIR/.copilot/copilot-instructions.md"
            ;;
        5)
            target="$HOME_DIR/.config/opencode/skills/sdd"
            if [ -d "$target" ]; then
                rm -rf "$target"
                echo -e "\033[33m    [REMOVED] Skill -> $target\033[0m"
            fi
            remove_delimited_rule "$HOME_DIR/.config/opencode/AGENTS.md"
            ;;
        6)
            target="$HOME_DIR/.claude/skills/sdd"
            if [ -d "$target" ]; then
                rm -rf "$target"
                echo -e "\033[33m    [REMOVED] Skill -> $target\033[0m"
            fi
            remove_delimited_rule "$HOME_DIR/.claude/CLAUDE.md"
            claude_cmds=("sdd.md" "sdd-init.md" "sdd-new.md" "sdd-propose.md" "sdd-spec.md" "sdd-design.md" "sdd-tasks.md" "sdd-verify.md" "sdd-archive.md")
            for c in "${claude_cmds[@]}"; do
                rm -f "$HOME_DIR/.claude/commands/$c"
            done
            echo -e "\033[33m    [REMOVED] Claude Commands (9 files) -> $HOME_DIR/.claude/commands\033[0m"
            ;;
        7)
            target="$HOME_DIR/.cursor/skills/sdd"
            if [ -d "$target" ]; then
                rm -rf "$target"
                echo -e "\033[33m    [REMOVED] Skill -> $target\033[0m"
            fi
            rule_target="$HOME_DIR/.cursor/rules/sdd.mdc"
            if [ -f "$rule_target" ]; then
                rm -f "$rule_target"
                echo -e "\033[33m    [REMOVED] Cursor Rule    -> $rule_target\033[0m"
            fi
            ;;
        8)
            target="$ZED_DIR/skills/sdd"
            if [ -d "$target" ]; then
                rm -rf "$target"
                echo -e "\033[33m    [REMOVED] Skill -> $target\033[0m"
            fi
            remove_delimited_rule "$ZED_DIR/AGENTS.md"
            remove_zed_slash_command "$ZED_DIR/settings.json"
            ;;
    esac
done

# If all environments uninstalled, also remove CLI package
if [ "$SELECTED" = "1 2 3 4 5 6 7 8" ]; then
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
