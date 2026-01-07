#!/bin/bash
# config-apps.sh - RTD Apps Migration Configuration
# Copyright (c) LinkU Labs. All rights reserved.

# Load base configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../../config.sh"
source "$SCRIPT_DIR/../config-v2.sh"

# ============================================
# Apps Source and Target Paths
# ============================================

APPS_SOURCE="/Users/changzechuan/WenchuanProjects/SuiTestProjects/suiAPP/sui/apps"
APPS_TARGET="/Users/changzechuan/WenchuanProjects/SuiTestProjects/rtd-typescript/rtd-apps"

# ============================================
# Apps to Copy
# ============================================

APPS_TO_COPY=(
    "wallet"
    "core"
    "icons"
    "sui-explorer"
)

# ============================================
# Wallet Features to Remove - DeepBook Paths
# ============================================

DEEPBOOK_PATHS=(
    "src/shared/deepBook"
    "src/ui/app/hooks/deepbook"
    "src/ui/app/pages/swap"
    "src/ui/app/hooks/useValidSwapTokensList.ts"
)

# ============================================
# Wallet Features to Remove - Ledger Paths
# ============================================

LEDGER_PATHS=(
    "src/background/accounts/LedgerAccount.ts"
    "src/ui/app/LedgerSigner.ts"
    "src/ui/app/components/ledger"
    "src/ui/app/pages/accounts/ImportLedgerAccountsPage.tsx"
    "src/ui/app/components/menu/content/VerifyLedgerConnectionStatus.tsx"
)

# ============================================
# Wallet Dependencies to Remove
# ============================================

WALLET_DEPS_TO_REMOVE=(
    "@mysten/deepbook"
    "@mysten/ledgerjs-hw-app-sui"
    "@ledgerhq/errors"
    "@ledgerhq/hw-transport"
    "@ledgerhq/hw-transport-webhid"
    "@ledgerhq/hw-transport-webusb"
)

# ============================================
# Apps Package Name Mappings
# ============================================

APPS_PKG_OLD=(
    "sui-wallet"
    "@mysten/core"
    "@mysten/icons"
    "sui-explorer"
    "sui-apps-workspace"
)

APPS_PKG_NEW=(
    "rtd-wallet"
    "rtd-core"
    "rtd-icons"
    "rtd-explorer"
    "rtd-apps-workspace"
)

# ============================================
# NPM Package Name Mappings for Apps
# (extends the base config mappings)
# ============================================

APPS_NPM_OLD=(
    "@mysten/sui"
    "@mysten/bcs"
    "@mysten/utils"
    "@mysten/kiosk"
    "@mysten/wallet-standard"
    "@mysten/dapp-kit"
    "@mysten/core"
    "@mysten/icons"
)

APPS_NPM_NEW=(
    "rtd-typescript"
    "rtd-bcs"
    "rtd-utils"
    "rtd-kiosk"
    "rtd-wallet-standard"
    "rtd-dapp-kit"
    "rtd-core"
    "rtd-icons"
)

# ============================================
# Directory Renames
# ============================================

DIR_RENAMES_OLD=(
    "sui-explorer"
)

DIR_RENAMES_NEW=(
    "rtd-explorer"
)

# ============================================
# Root Workspace Files to Copy
# ============================================

WORKSPACE_FILES=(
    "package.json"
    "pnpm-workspace.yaml"
    "turbo.json"
    "tsconfig.json"
    ".prettierrc"
    ".prettierignore"
    "eslint.config.mjs"
)

# ============================================
# Build Artifacts to Clean
# ============================================

CLEAN_DIRS=(
    "node_modules"
    "dist"
    ".turbo"
    "coverage"
    ".next"
    "build"
)

# ============================================
# File Extensions to Process
# ============================================

FILE_EXTENSIONS=(
    "*.ts"
    "*.tsx"
    "*.js"
    "*.jsx"
    "*.json"
    "*.md"
    "*.yaml"
    "*.yml"
    "*.html"
    "*.css"
    "*.scss"
)

# ============================================
# Patterns to Skip (in addition to base config)
# ============================================

SKIP_PATTERNS=(
    "node_modules"
    ".git"
    "dist"
    ".turbo"
    "coverage"
    ".next"
    "build"
    "*.lock"
    "*.svg"
    "*.png"
    "*.jpg"
    "*.jpeg"
    "*.gif"
    "*.ico"
    "*.woff"
    "*.woff2"
    "*.ttf"
    "*.eot"
)

# ============================================
# Utility Functions
# ============================================

# Print colored message
print_info() {
    echo -e "\033[0;34m[INFO]\033[0m $1"
}

print_success() {
    echo -e "\033[0;32m[SUCCESS]\033[0m $1"
}

print_warning() {
    echo -e "\033[0;33m[WARNING]\033[0m $1"
}

print_error() {
    echo -e "\033[0;31m[ERROR]\033[0m $1"
}

print_step() {
    echo -e "\n\033[1;36m=== $1 ===\033[0m"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Safe sed replacement (cross-platform)
safe_sed() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "$@"
    else
        sed -i "$@"
    fi
}

# Count occurrences of pattern in directory
count_pattern() {
    local pattern="$1"
    local dir="$2"
    grep -r "$pattern" "$dir" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.json" 2>/dev/null | wc -l | tr -d ' '
}
