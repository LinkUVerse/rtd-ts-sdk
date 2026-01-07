#!/bin/bash
# 26-rename-sui-files-dirs.sh - Rename all files and directories containing Sui/sui
# Copyright (c) LinkU Labs. All rights reserved.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config-apps.sh"

print_step "Step 6: Rename Sui/sui Files and Directories"

# ============================================
# Check target directory exists
# ============================================

if [[ ! -d "$APPS_TARGET" ]]; then
    print_error "Target directory does not exist: $APPS_TARGET"
    exit 1
fi

print_info "Target directory: $APPS_TARGET"

# ============================================
# Build exclusion pattern for find
# ============================================

EXCLUDE_PATTERN=""
for skip in "node_modules" ".git" "dist" ".turbo" "coverage" ".next" "build"; do
    EXCLUDE_PATTERN="$EXCLUDE_PATTERN -not -path '*/$skip/*'"
done

# ============================================
# Phase 1: Rename Directories (deepest first)
# ============================================

print_step "Phase 1: Rename Directories Containing Sui/sui"

rename_dirs() {
    local pattern="$1"
    local replacement="$2"
    local count=0

    # Find directories matching pattern, sorted by depth (deepest first)
    while IFS= read -r dir; do
        if [[ -d "$dir" ]]; then
            local dirname=$(basename "$dir")
            local parent=$(dirname "$dir")
            local newname="${dirname//$pattern/$replacement}"

            if [[ "$dirname" != "$newname" ]]; then
                local newpath="$parent/$newname"
                if [[ ! -e "$newpath" ]]; then
                    mv "$dir" "$newpath"
                    print_info "Dir: $dirname -> $newname" >&2
                    ((count++))
                else
                    print_warning "Skip (exists): $newpath" >&2
                fi
            fi
        fi
    done < <(find "$APPS_TARGET" -type d -name "*${pattern}*" \
        -not -path "*/node_modules/*" \
        -not -path "*/.git/*" \
        -not -path "*/dist/*" \
        -not -path "*/.turbo/*" \
        -not -path "*/coverage/*" \
        -not -path "*/.next/*" \
        -not -path "*/build/*" \
        2>/dev/null | awk '{print length, $0}' | sort -rn | cut -d' ' -f2-)

    echo "$count"
}

# Rename directories with Sui -> Rtd (CamelCase)
sui_dirs=$(rename_dirs "Sui" "Rtd")
print_success "Renamed $sui_dirs directories (Sui -> Rtd)"

# Rename directories with sui -> rtd (lowercase)
sui_lower_dirs=$(rename_dirs "sui" "rtd")
print_success "Renamed $sui_lower_dirs directories (sui -> rtd)"

# ============================================
# Phase 2: Rename Files
# ============================================

print_step "Phase 2: Rename Files Containing Sui/sui"

rename_files() {
    local pattern="$1"
    local replacement="$2"
    local count=0

    while IFS= read -r file; do
        if [[ -f "$file" ]]; then
            local filename=$(basename "$file")
            local parent=$(dirname "$file")
            local newname="${filename//$pattern/$replacement}"

            if [[ "$filename" != "$newname" ]]; then
                local newpath="$parent/$newname"
                if [[ ! -e "$newpath" ]]; then
                    mv "$file" "$newpath"
                    print_info "File: $filename -> $newname" >&2
                    ((count++))
                else
                    print_warning "Skip (exists): $newpath" >&2
                fi
            fi
        fi
    done < <(find "$APPS_TARGET" -type f -name "*${pattern}*" \
        -not -path "*/node_modules/*" \
        -not -path "*/.git/*" \
        -not -path "*/dist/*" \
        -not -path "*/.turbo/*" \
        -not -path "*/coverage/*" \
        -not -path "*/.next/*" \
        -not -path "*/build/*" \
        2>/dev/null)

    echo "$count"
}

# Rename files with Sui -> Rtd (CamelCase)
sui_files=$(rename_files "Sui" "Rtd")
print_success "Renamed $sui_files files (Sui -> Rtd)"

# Rename files with sui -> rtd (lowercase)
sui_lower_files=$(rename_files "sui" "rtd")
print_success "Renamed $sui_lower_files files (sui -> rtd)"

# ============================================
# Phase 3: Update Import References
# ============================================

print_step "Phase 3: Update Import References"

# Define file name mapping patterns for imports
# Format: "old_pattern|new_pattern"
FILE_MAPPINGS=(
    # CamelCase patterns (Sui -> Rtd)
    "SuiLogoTxt|RtdLogoTxt"
    "SuiTestnet|RtdTestnet"
    "SuiDevnet|RtdDevnet"
    "SuiMainnet|RtdMainnet"
    "SuiLocal|RtdLocal"
    "SuiCustomRpc|RtdCustomRpc"
    "SuiTokensStack|RtdTokensStack"
    "SuiTokenCard|RtdTokenCard"
    "SuiAmount|RtdAmount"
    "SuiWordmark|RtdWordmark"
    "SuiSymbol|RtdSymbol"
    "SuiAppEmpty|RtdAppEmpty"
    "SuiApp|RtdApp"
    "SuiCoinData|RtdCoinData"
    "TransferSui|TransferRtd"
    # Lowercase patterns (sui -> rtd)
    "sui-client|rtd-client"
    "sui-apps|rtd-apps"
    "sui-objects|rtd-objects"
    "suins|rtdns"
    # SVG files
    "sui_mainnet|rtd_mainnet"
    "sui_testnet|rtd_testnet"
    "sui_devnet|rtd_devnet"
    "sui_local|rtd_local"
    "sui_customRPC|rtd_customRPC"
    "sui_tokens_stack|rtd_tokens_stack"
    "sui-logo-txt|rtd-logo-txt"
    "transfer_sui_16|transfer_rtd_16"
    "transferSui|transferRtd"
    "sui-icon|rtd-icon"
    # Explorer assets
    "explorer-suiscan|explorer-rtdscan"
    "explorer-suivision|explorer-rtdvision"
    # Hook names
    "useSuiCoinData|useRtdCoinData"
    "useAppResolveSuinsName|useAppResolveRtdnsName"
    # Staking functions
    "getAllStakeSui|getAllStakeRtd"
    "getTokenStakeSuiForValidator|getTokenStakeRtdForValidator"
    "getStakeSuiBySuiId|getStakeRtdByRtdId"
)

# Build sed script for all mappings
build_import_sed_script() {
    local sed_script=""
    for mapping in "${FILE_MAPPINGS[@]}"; do
        IFS='|' read -r old new <<< "$mapping"
        # Replace in import/export statements and file references
        sed_script+="s|$old|$new|g;"
    done
    echo "$sed_script"
}

sed_script=$(build_import_sed_script)

# Apply replacements to all source files
update_count=0
while IFS= read -r -d '' file; do
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "$sed_script" "$file" 2>/dev/null && ((update_count++)) || true
    else
        sed -i "$sed_script" "$file" 2>/dev/null && ((update_count++)) || true
    fi
done < <(find "$APPS_TARGET" -type f \( \
    -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \
    -o -name "*.json" -o -name "*.md" -o -name "*.yaml" -o -name "*.yml" \
    -o -name "*.html" -o -name "*.css" -o -name "*.scss" \
    \) \
    -not -path "*/node_modules/*" \
    -not -path "*/.git/*" \
    -not -path "*/dist/*" \
    -print0 2>/dev/null)

print_success "Updated import references in $update_count files"

# ============================================
# Summary
# ============================================

print_step "Summary"

total_dirs=$((sui_dirs + sui_lower_dirs))
total_files=$((sui_files + sui_lower_files))

echo "Directories renamed: $total_dirs"
echo "Files renamed: $total_files"
echo "Files with updated imports: $update_count"

# Check for remaining Sui references in filenames
remaining_sui=$(find "$APPS_TARGET" \( -name "*Sui*" -o -name "*sui*" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/.git/*" \
    -not -path "*/dist/*" \
    2>/dev/null | wc -l | tr -d ' ')

if [[ "$remaining_sui" -gt 0 ]]; then
    print_warning "Remaining files/dirs with Sui/sui in name: $remaining_sui"
    echo "Run this to see them:"
    echo "  find \"$APPS_TARGET\" \\( -name '*Sui*' -o -name '*sui*' \\) -not -path '*/node_modules/*' -not -path '*/.git/*'"
else
    print_success "All Sui/sui file/directory names have been replaced!"
fi

print_success "Step 6 completed: File and directory renaming done!"
