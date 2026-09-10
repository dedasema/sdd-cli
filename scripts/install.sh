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

if command -v npm >/dev/null 2>&1; then
    npm install -g @dedasema/sdd-cli
elif command -v pnpm >/dev/null 2>&1; then
    pnpm add -g @dedasema/sdd-cli
else
    echo -e "\033[31m[ERROR] Neither npm nor pnpm was found.\033[0m"
    exit 1
fi

# 3. Resolve Home Directory
HOME_DIR="${HOME:-$USERPROFILE}"
ZED_DIR="$HOME_DIR/.config/zed"

# 4. Interactive Agent / IDE Selection Menu
echo -e "\n\033[36mSelect AI environments to configure:\033[0m"
echo "  [1] Antigravity 2.0         (~/.gemini/config/skills/sdd + /sdd)"
echo "  [2] Antigravity CLI (agy)   (~/.gemini/skills/sdd + /sdd)"
echo "  [3] OpenAI Codex            (~/.codex/AGENTS.md + skills)"
echo "  [4] GitHub Copilot (VS Code)(~/.copilot/copilot-instructions.md + skills)"
echo "  [5] OpenCode                (~/.config/opencode/AGENTS.md + skills)"
echo "  [6] Claude Code             (~/.claude/CLAUDE.md + /sdd command)"
echo "  [7] Cursor                  (~/.cursor/rules/sdd.mdc + skills)"
echo "  [8] Zed                     (~/.config/zed: rule + /sdd + skill)"
echo "  [A] All environments       (Default - press Enter)"

RAW_CHOICE=""
if [ -c /dev/tty ]; then
    printf "\nChoice(s) [e.g. 8 or 1,6,7 or A (Default)]: "
    read -r RAW_CHOICE < /dev/tty || true
elif [ -t 0 ]; then
    printf "\nChoice(s) [e.g. 8 or 1,6,7 or A (Default)]: "
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

# 5. Shared Protocol Definitions
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

RULE_BLOCK='# Spec-Driven Development (SDD) Autonomous Protocol

This project strictly adheres to Spec-Driven Development (SDD).
As an AI coding assistant, you MUST follow this protocol before writing or modifying any implementation code.

## Core Rules

1. NO VIBE-CODING: Never write implementation code directly from a casual prompt without an approved specification and task checklist.
2. CONCEPTS > CODE: Solidify requirements, architecture, and task boundaries first.
3. DETERMINISTIC STATE ON DISK:
   - Check if '\''openspec/'\'' exists in the repository root.
   - If '\''openspec/'\'' does NOT exist: autonomously run '\''sdd init'\'' in the background using your terminal tool before doing anything else.
   - If '\''openspec/'\'' already exists: NEVER re-run '\''sdd init\''. Proceed directly to '\''sdd new <feature-name>'\''.
4. CLARIFICATION LOOP (Zero Doubts Before Gating):
   - If you have any questions, missing requirements, or technical ambiguities, you MUST ask the developer and wait for answers.
   - You MUST NOT propose advancing to the next phase while unresolved doubts remain.
5. HUMAN-IN-THE-LOOP PHASE GATES:
   - You MUST enforce explicit checkpoints at the end of each phase.
   - You MUST NOT generate artifacts or code for the next phase until the user explicitly confirms and approves advancing.

## The 7-Phase Gated Lifecycle

1. Bootstrap & Scaffolding: Check '\''openspec/'\'' on disk. Run '\''sdd init'\'' if missing. For new features/fixes, run '\''sdd new <feature-name>'\''.
2. Proposal Phase ('\''proposal.md'\''): Draft scope and intent. GATE: Present summary and ask: "Proposal ready. Do you approve proceeding to Specifications?"
3. Specifications Phase ('\''specs.md'\''): Write RFC 2119 Given/When/Then scenarios. GATE: Present scenarios and ask: "Specifications ready. Do you approve proceeding to Technical Design?"
4. Design Phase ('\''design.md'\''): Formulate architecture decisions and tradeoffs. GATE: Present design and ask: "Design ready. Do you approve proceeding to the Tasks checklist?"
5. Tasks Phase ('\''tasks.md'\''): Break down atomic checklist. GATE: Present checklist and ask: "Tasks checklist ready. Do you approve starting Implementation?"
6. Apply Phase (Implementation): Implement code task by task, checking off '\''- [x]'\''.
7. Verify Phase (Quality Assurance): Run tests, type checks, and audit compliance against specs. Fix any errors. GATE: Ask: "All tests pass and specs verified. Do you approve archiving this change?"
8. Archive Phase (Sync & Finalization): Move change to '\''openspec/changes/archive/YYYY-MM-DD-<feature>/'\'' and update living specs in '\''openspec/specs/'\''.

## Supported Commands & Triggers: /sdd, /sdd-init, /sdd-new, /sdd-propose, /sdd-spec, /sdd-design, /sdd-tasks, /sdd-verify, /sdd-archive.'

inject_delimited_rule() {
    local file="$1"
    local content="$2"
    local dir
    dir="$(dirname "$file")"
    mkdir -p "$dir"
    node -e '
    const fs = require("fs");
    const filePath = process.argv[1];
    const content = process.argv[2];
    const startMarker = "<!-- >>> SDD PROTOCOL >>> -->";
    const endMarker = "<!-- <<< SDD PROTOCOL <<< -->";
    const block = startMarker + "\n" + content.trim() + "\n" + endMarker;
    let result = "";
    if (fs.existsSync(filePath)) {
        let existing = fs.readFileSync(filePath, "utf8");
        const regex = new RegExp(startMarker + "[\\s\\S]*?" + endMarker);
        if (regex.test(existing)) {
            result = existing.replace(regex, block);
        } else {
            result = existing.trimEnd() + "\n\n" + block + "\n";
        }
    } else {
        result = block + "\n";
    }
    fs.writeFileSync(filePath, result, "utf8");
    ' "$file" "$content"
}

inject_zed_slash_command() {
    local settings_path="$1"
    local dir
    dir="$(dirname "$settings_path")"
    mkdir -p "$dir"
    node - "$settings_path" << 'NODE_SCRIPT'
    const fs = require("fs");
    const filePath = process.argv[2];
    function stripJsonc(content) {
        return content
            .replace(/\/\*[\s\S]*?\*\//g, "")
            .replace(/\/\/.*/g, "")
            .replace(/,\s*([\]}])/g, "$1");
    }
    let settings = {};
    let leadingComments = "";
    if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf8");
        const firstBrace = raw.indexOf("{");
        if (firstBrace > 0) {
            leadingComments = raw.slice(0, firstBrace).trim();
        }
        try {
            settings = JSON.parse(stripJsonc(raw));
        } catch (e) {
            console.error("    [WARN] Unable to parse " + filePath + " as JSON/JSONC: " + e.message);
            console.error("    [WARN] Skipping slash command injection to protect existing settings.");
            process.exit(0);
        }
    }
    if (!settings.assistant) settings.assistant = {};
    if (!settings.assistant.slash_commands) settings.assistant.slash_commands = {};

    const commands = {
        "sdd": {
            description: "Execute Spec-Driven Development (SDD) smart orchestrator with interactive phase gates",
            text: "Execute the Spec-Driven Development (SDD) lifecycle in this project:\n1. Check if \"openspec/\" exists on disk. If not, run \"sdd init\".\n2. If no active change exists, ask for feature name and run \"sdd new <feature-name>\".\n3. If active change exists, identify current phase and resume.\n4. Resolve all clarifying questions before proposing phase progression.\n5. Enforce explicit user approval gates at each phase (Proposal -> Specs -> Design -> Tasks -> Apply -> Verify -> Archive)."
        },
        "sdd-init": {
            description: "Initialize Spec-Driven Development (SDD) / OpenSpec in current workspace",
            text: "Check if \"openspec/\" exists. If not, execute \"sdd init\" via the terminal tool to bootstrap directory hierarchy, config, and AGENTS.md guidelines."
        },
        "sdd-new": {
            description: "Scaffold a new SDD change workspace",
            text: "Prompt the user for the feature or fix name (kebab-case) and execute \"sdd new <feature-name>\" via the terminal tool to scaffold the change workspace."
        },
        "sdd-propose": {
            description: "Draft or refine the SDD change proposal (proposal.md)",
            text: "Help draft or refine proposal.md for the active change. Address intent, scope, and capabilities. Resolve any doubts with the user, then ask for explicit approval to advance to Specifications."
        },
        "sdd-spec": {
            description: "Draft or refine formal specifications (specs.md) with Given/When/Then scenarios",
            text: "Help draft or refine specs.md for the active change. Use RFC 2119 keywords and GIVEN/WHEN/THEN scenarios. When complete, ask for explicit approval to advance to Technical Design."
        },
        "sdd-design": {
            description: "Draft technical design (design.md) with architecture decisions and tradeoffs",
            text: "Help draft or refine design.md for the active change. Document technical approach, architecture decisions, tradeoffs, and target file changes. When complete, ask for approval to advance to Tasks checklist."
        },
        "sdd-tasks": {
            description: "Break down implementation tasks checklist (tasks.md)",
            text: "Help draft or refine tasks.md for the active change. Create atomic, verifiable checkboxes. When complete, ask for explicit approval to begin Implementation."
        },
        "sdd-verify": {
            description: "Verify implementation: execute tests, lint, and audit compliance against specs",
            text: "Verify the active change: run test suites, static analysis, and verify all requirements in specs.md. Remediate any failures. When green, ask: \"All tests pass and specs verified. Do you approve archiving this change?\""
        },
        "sdd-archive": {
            description: "Verify and archive completed SDD change, syncing living specs",
            text: "Ensure verification is complete and tests pass. Confirm with the user: \"Do you approve archiving this change?\". Upon confirmation, move the change to openspec/changes/archive/YYYY-MM-DD-<feature>/ and update living specs in openspec/specs/."
        }
    };

    for (const [name, def] of Object.entries(commands)) {
        settings.assistant.slash_commands[name] = def;
    }

    const output = (leadingComments ? leadingComments + "\n" : "") + JSON.stringify(settings, null, 2) + "\n";
    fs.writeFileSync(filePath, output, "utf8");
NODE_SCRIPT
}

echo -e "\n\033[32m--> Provisioning selected SDD skills & global rules...\033[0m"

for item in $SELECTED; do
    case "$item" in
        1)
            target="$HOME_DIR/.gemini/config/skills/sdd"
            mkdir -p "$target"
            echo "$SKILL_CONTENT" > "$target/SKILL.md"
            echo -e "\033[36m    [OK] Antigravity 2.0 (Skill + /sdd) -> $target/SKILL.md\033[0m"
            ;;
        2)
            target="$HOME_DIR/.gemini/skills/sdd"
            mkdir -p "$target"
            echo "$SKILL_CONTENT" > "$target/SKILL.md"
            echo -e "\033[36m    [OK] Antigravity CLI (Skill + /sdd) -> $target/SKILL.md\033[0m"
            ;;
        3)
            target="$HOME_DIR/.codex/skills/sdd"
            mkdir -p "$target"
            echo "$SKILL_CONTENT" > "$target/SKILL.md"
            echo -e "\033[36m    [OK] OpenAI Codex (Skill)          -> $target/SKILL.md\033[0m"
            codex_rule="$HOME_DIR/.codex/AGENTS.md"
            inject_delimited_rule "$codex_rule" "$RULE_BLOCK"
            echo -e "\033[36m    [OK] OpenAI Codex (Global Rule)    -> $codex_rule\033[0m"
            ;;
        4)
            target="$HOME_DIR/.copilot/skills/sdd"
            mkdir -p "$target"
            echo "$SKILL_CONTENT" > "$target/SKILL.md"
            echo -e "\033[36m    [OK] GitHub Copilot (Skill)        -> $target/SKILL.md\033[0m"
            copilot_rule="$HOME_DIR/.copilot/copilot-instructions.md"
            inject_delimited_rule "$copilot_rule" "$RULE_BLOCK"
            echo -e "\033[36m    [OK] GitHub Copilot (Global Rule)  -> $copilot_rule\033[0m"
            ;;
        5)
            target="$HOME_DIR/.config/opencode/skills/sdd"
            mkdir -p "$target"
            echo "$SKILL_CONTENT" > "$target/SKILL.md"
            echo -e "\033[36m    [OK] OpenCode (Skill)              -> $target/SKILL.md\033[0m"
            opencode_rule="$HOME_DIR/.config/opencode/AGENTS.md"
            inject_delimited_rule "$opencode_rule" "$RULE_BLOCK"
            echo -e "\033[36m    [OK] OpenCode (Global Rule)        -> $opencode_rule\033[0m"
            ;;
        6)
            target="$HOME_DIR/.claude/skills/sdd"
            mkdir -p "$target"
            echo "$SKILL_CONTENT" > "$target/SKILL.md"
            echo -e "\033[36m    [OK] Claude Code (Skill)           -> $target/SKILL.md\033[0m"
            claude_rule="$HOME_DIR/.claude/CLAUDE.md"
            inject_delimited_rule "$claude_rule" "$RULE_BLOCK"
            echo -e "\033[36m    [OK] Claude Code (Global Rule)     -> $claude_rule\033[0m"
            CLAUDE_DIR="$HOME_DIR/.claude/commands"
            mkdir -p "$CLAUDE_DIR"
            cat << 'EOF' > "$CLAUDE_DIR/sdd.md"
Execute the Spec-Driven Development (SDD) smart orchestrator in this project:
1. Check if 'openspec/' exists on disk. If not, run 'sdd init'.
2. If no active change, ask user for feature name and run 'sdd new "$@"'.
3. If active change exists, identify current phase and resume.
4. Resolve all clarifying questions before proposing phase progression.
5. Enforce explicit user approval gates at each phase (Proposal -> Specs -> Design -> Tasks -> Apply -> Verify -> Archive).
EOF
            cat << 'EOF' > "$CLAUDE_DIR/sdd-init.md"
Check if 'openspec/' exists in workspace. If not, run 'sdd init' via the terminal tool to bootstrap the environment.
EOF
            cat << 'EOF' > "$CLAUDE_DIR/sdd-new.md"
Prompt user for feature name (kebab-case) if not provided in arguments and execute 'sdd new "$@"' via the terminal tool.
EOF
            cat << 'EOF' > "$CLAUDE_DIR/sdd-propose.md"
Help draft or refine proposal.md for the active change. Address intent, scope, and capabilities. Resolve doubts with user, then ask for explicit approval to advance to Specifications.
EOF
            cat << 'EOF' > "$CLAUDE_DIR/sdd-spec.md"
Help draft or refine specs.md for the active change. Use RFC 2119 keywords and GIVEN/WHEN/THEN scenarios. When complete, ask for explicit approval to advance to Technical Design.
EOF
            cat << 'EOF' > "$CLAUDE_DIR/sdd-design.md"
Help draft or refine design.md for the active change. Document technical approach, architecture decisions, tradeoffs, and target files. When complete, ask for approval to advance to Tasks checklist.
EOF
            cat << 'EOF' > "$CLAUDE_DIR/sdd-tasks.md"
Help draft or refine tasks.md for the active change. Create atomic, verifiable checkboxes. When complete, ask for explicit approval to begin Implementation.
EOF
            cat << 'EOF' > "$CLAUDE_DIR/sdd-verify.md"
Verify active change: run test suites, static analysis, and verify all requirements in specs.md. Remediate any failures. When green, ask: 'All tests pass and specs verified. Do you approve archiving this change?'
EOF
            cat << 'EOF' > "$CLAUDE_DIR/sdd-archive.md"
Ensure verification is complete and tests pass. Confirm with user: 'Do you approve archiving this change?'. Upon confirmation, move change to openspec/changes/archive/YYYY-MM-DD-<feature>/ and update living specs in openspec/specs/.
EOF
            echo -e "\033[36m    [OK] Claude Code (9 Slash Commands) -> $CLAUDE_DIR\033[0m"
            ;;
        7)
            target="$HOME_DIR/.cursor/skills/sdd"
            mkdir -p "$target"
            echo "$SKILL_CONTENT" > "$target/SKILL.md"
            echo -e "\033[36m    [OK] Cursor (Skill)                -> $target/SKILL.md\033[0m"
            CURSOR_DIR="$HOME_DIR/.cursor/rules"
            mkdir -p "$CURSOR_DIR"
            cat << 'EOF' > "$CURSOR_DIR/sdd.mdc"
---
description: Spec-Driven Development (SDD) Autonomous AI Protocol with Interactive Phase Gates
globs: *
alwaysApply: true
---

# SDD Autonomous Assistant Protocol

This workspace strictly adheres to Spec-Driven Development (SDD).

## Core Rules:
1. NO VIBE-CODING: Never write code without approved specifications and tasks.
2. DETERMINISTIC STATE ON DISK: Check if 'openspec/' exists. If not, run 'sdd init'. If it exists, NEVER re-run 'sdd init'.
3. CLARIFICATION LOOP: Ask all clarifying questions until zero doubts remain before proposing phase progression.
4. HUMAN-IN-THE-LOOP PHASE GATES: Stop and obtain explicit user approval at each phase boundary.

## 7-Phase Lifecycle:
1. Bootstrap & Scaffolding ('sdd init' / 'sdd new <feature>')
2. Proposal ('proposal.md' -> GATE: ask user approval)
3. Specifications ('specs.md' -> GATE: ask user approval)
4. Design ('design.md' -> GATE: ask user approval)
5. Tasks ('tasks.md' -> GATE: ask user approval)
6. Apply (Implement code per tasks checklist)
7. Verify (Run tests & audit specs -> GATE: ask user approval to archive)
8. Archive (Move change to archive/ and update living specs)

## Supported Triggers:
/sdd, /sdd-init, /sdd-new, /sdd-propose, /sdd-spec, /sdd-design, /sdd-tasks, /sdd-verify, /sdd-archive.
EOF
            echo -e "\033[36m    [OK] Cursor (Global Rule)          -> $CURSOR_DIR/sdd.mdc\033[0m"
            ;;
        8)
            # Zed Skill
            target="$ZED_DIR/skills/sdd"
            mkdir -p "$target"
            echo "$SKILL_CONTENT" > "$target/SKILL.md"
            echo -e "\033[36m    [OK] Zed (Skill)                   -> $target/SKILL.md\033[0m"
            # Zed Global Rule
            zed_rule="$ZED_DIR/AGENTS.md"
            inject_delimited_rule "$zed_rule" "$RULE_BLOCK"
            echo -e "\033[36m    [OK] Zed (Global Rule)             -> $zed_rule\033[0m"
            # Zed Slash Command in settings.json
            zed_settings="$ZED_DIR/settings.json"
            inject_zed_slash_command "$zed_settings"
            echo -e "\033[36m    [OK] Zed (/sdd Slash Command)      -> $zed_settings\033[0m"
            ;;
    esac
done

# 8. Completion Banner
echo -e "\n\033[36m=========================================\033[0m"
echo -e "\033[32m   Installation complete! You're ready!  \033[0m"
echo -e "\033[36m=========================================\033[0m"
echo -e "\nGlobal rules & skills are now active across your chosen environment(s)."
echo -e "Open ANY project in your editor and your AI will automatically follow SDD."
echo -e "You can also use slash commands like /sdd where supported."
echo -e "\n\033[32mZero terminal required from now on!\033[0m\n"
