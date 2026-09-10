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

# 3. Launch interactive setup via SDD CLI
SETUP_ARGS=()
if [ "$1" = "--all" ] || [ "$1" = "-All" ] || [ "${SDD_INSTALL_ALL:-0}" = "1" ]; then
    SETUP_ARGS+=("--all")
fi

if command -v sdd >/dev/null 2>&1; then
    if [ -c /dev/tty ]; then
        sdd setup "${SETUP_ARGS[@]}" < /dev/tty
    else
        sdd setup "${SETUP_ARGS[@]}"
    fi
else
    if [ -c /dev/tty ]; then
        npx -y @dedasema/sdd-cli setup "${SETUP_ARGS[@]}" < /dev/tty
    else
        npx -y @dedasema/sdd-cli setup "${SETUP_ARGS[@]}"
    fi
fi
