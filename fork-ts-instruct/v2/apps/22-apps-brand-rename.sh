#!/bin/bash
# 22-apps-brand-rename.sh - General brand replacement for all apps (Optimized)
# Copyright (c) LinkU Labs. All rights reserved.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config-apps.sh"

print_step "Step 3: Brand Replacement"

# ============================================
# Check target directory exists
# ============================================

if [[ ! -d "$APPS_TARGET" ]]; then
    print_error "Target directory does not exist: $APPS_TARGET"
    exit 1
fi

print_info "Target directory: $APPS_TARGET"

# ============================================
# Helper: Build sed script for batch replacement
# ============================================

build_sed_script() {
    local sed_script=""
    local old new
    for i in "$@"; do
        IFS='|' read -r old new <<< "$i"
        sed_script+="s|$old|$new|g;"
    done
    echo "$sed_script"
}

# ============================================
# Helper: Batch replace in all files (single pass)
# ============================================

batch_replace() {
    local sed_script="$1"
    local dir="$2"
    local count=0

    while IFS= read -r -d '' file; do
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "$sed_script" "$file" 2>/dev/null && ((count++)) || true
        else
            sed -i "$sed_script" "$file" 2>/dev/null && ((count++)) || true
        fi
    done < <(find "$dir" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.md" -o -name "*.yaml" -o -name "*.yml" -o -name "*.html" -o -name "*.css" -o -name "*.scss" -o -name "*.mjs" -o -name "*.cjs" \) -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/dist/*" -print0 2>/dev/null)

    echo "$count"
}

# ============================================
# Phase 1: NPM Package Name Replacements
# ============================================

print_step "Phase 1: NPM Package Names"

npm_replacements=()
for i in "${!APPS_NPM_OLD[@]}"; do
    npm_replacements+=("${APPS_NPM_OLD[$i]}|${APPS_NPM_NEW[$i]}")
done

sed_script=$(build_sed_script "${npm_replacements[@]}")
count=$(batch_replace "$sed_script" "$APPS_TARGET")
print_success "NPM packages replaced in $count files"
echo "  ${APPS_NPM_OLD[*]} -> ${APPS_NPM_NEW[*]}"

# ============================================
# Phase 2: Organization Names
# ============================================

print_step "Phase 2: Organization Names"

org_replacements=(
    "MystenLabs|LinkUVerse"
    "Mysten Labs|LinkU Labs"
    "mystenlabs.com|linkuverse.com"
    "mysten|linku"
)

sed_script=$(build_sed_script "${org_replacements[@]}")
count=$(batch_replace "$sed_script" "$APPS_TARGET")
print_success "Organization names replaced in $count files"

# ============================================
# Phase 3: Network Endpoints
# ============================================

print_step "Phase 3: Network Endpoints"

endpoint_replacements=(
    "fullnode\.mainnet\.sui\.io|fullnode.mainnet.rtd.io"
    "fullnode\.testnet\.sui\.io|fullnode.testnet.rtd.io"
    "fullnode\.devnet\.sui\.io|fullnode.devnet.rtd.io"
    "suins|rtdns"
)

sed_script=$(build_sed_script "${endpoint_replacements[@]}")
count=$(batch_replace "$sed_script" "$APPS_TARGET")
print_success "Endpoints replaced in $count files"

# ============================================
# Phase 4: Type/Class Names (Batch)
# ============================================

print_step "Phase 4: Type/Class Names"

type_replacements=()

# Add WALLET_TYPES if defined
if [[ ${#WALLET_TYPES_OLD[@]} -gt 0 ]]; then
    for i in "${!WALLET_TYPES_OLD[@]}"; do
        type_replacements+=("${WALLET_TYPES_OLD[$i]}|${WALLET_TYPES_NEW[$i]}")
    done
fi

# Add DAPPKIT_TYPES if defined
if [[ ${#DAPPKIT_TYPES_OLD[@]} -gt 0 ]]; then
    for i in "${!DAPPKIT_TYPES_OLD[@]}"; do
        type_replacements+=("${DAPPKIT_TYPES_OLD[$i]}|${DAPPKIT_TYPES_NEW[$i]}")
    done
fi

if [[ ${#type_replacements[@]} -gt 0 ]]; then
    sed_script=$(build_sed_script "${type_replacements[@]}")
    count=$(batch_replace "$sed_script" "$APPS_TARGET")
    print_success "Type names replaced in $count files (${#type_replacements[@]} patterns)"
else
    print_warning "No type replacements defined"
fi

# ============================================
# Phase 5: Protocol Identifiers
# ============================================

print_step "Phase 5: Protocol Identifiers"

protocol_replacements=()

# Add PROTOCOL if defined
if [[ ${#PROTOCOL_OLD[@]} -gt 0 ]]; then
    for i in "${!PROTOCOL_OLD[@]}"; do
        protocol_replacements+=("${PROTOCOL_OLD[$i]}|${PROTOCOL_NEW[$i]}")
    done
fi

# Add CHAIN_IDS if defined
if [[ ${#CHAIN_IDS_OLD[@]} -gt 0 ]]; then
    for i in "${!CHAIN_IDS_OLD[@]}"; do
        protocol_replacements+=("${CHAIN_IDS_OLD[$i]}|${CHAIN_IDS_NEW[$i]}")
    done
fi

if [[ ${#protocol_replacements[@]} -gt 0 ]]; then
    sed_script=$(build_sed_script "${protocol_replacements[@]}")
    count=$(batch_replace "$sed_script" "$APPS_TARGET")
    print_success "Protocol identifiers replaced in $count files (${#protocol_replacements[@]} patterns)"
else
    print_warning "No protocol replacements defined"
fi

# ============================================
# Phase 6: General Brand (SUI -> RTD)
# ============================================

print_step "Phase 6: General Brand (SUI -> RTD)"

brand_replacements=(
    "SUI|RTD"
    "Sui|Rtd"
    "sui|rtd"
)

sed_script=$(build_sed_script "${brand_replacements[@]}")
count=$(batch_replace "$sed_script" "$APPS_TARGET")
print_success "Brand names replaced in $count files"

# ============================================
# Phase 7: Package JSON Names
# ============================================

print_step "Phase 7: Package Names"

pkg_replacements=()
for i in "${!APPS_PKG_OLD[@]}"; do
    pkg_replacements+=("${APPS_PKG_OLD[$i]}|${APPS_PKG_NEW[$i]}")
done

sed_script=$(build_sed_script "${pkg_replacements[@]}")
count=$(batch_replace "$sed_script" "$APPS_TARGET")
print_success "Package names replaced in $count files"

# ============================================
# Phase 8: Directory Renames
# ============================================

print_step "Phase 8: Directory Renames"

renamed=0
for i in "${!DIR_RENAMES_OLD[@]}"; do
    old_dir="$APPS_TARGET/${DIR_RENAMES_OLD[$i]}"
    new_dir="$APPS_TARGET/${DIR_RENAMES_NEW[$i]}"

    if [[ -d "$old_dir" ]]; then
        mv "$old_dir" "$new_dir"
        print_info "${DIR_RENAMES_OLD[$i]} -> ${DIR_RENAMES_NEW[$i]}"
        renamed=$((renamed + 1))
    fi
done
print_success "Renamed $renamed directories"

# ============================================
# Phase 9: File Renames
# ============================================

print_step "Phase 9: File Renames"

renamed=0
if [[ -d "$APPS_TARGET/wallet" ]] && [[ ${#WALLET_FILES_OLD[@]} -gt 0 ]]; then
    for i in "${!WALLET_FILES_OLD[@]}"; do
        old_file="${WALLET_FILES_OLD[$i]}"
        new_file="${WALLET_FILES_NEW[$i]}"

        while IFS= read -r -d '' file; do
            dir=$(dirname "$file")
            mv "$file" "$dir/$new_file"
            renamed=$((renamed + 1))
        done < <(find "$APPS_TARGET" -type f -name "$old_file" -print0 2>/dev/null)
    done
fi
print_success "Renamed $renamed files"

# ============================================
# Summary
# ============================================

print_step "Summary"

# Quick count of remaining references
mysten_refs=$(grep -rl "@mysten" "$APPS_TARGET" --include="*.ts" --include="*.tsx" --include="*.json" 2>/dev/null | grep -v node_modules | wc -l | tr -d ' ')
sui_refs=$(grep -rl "\\bSui\\b" "$APPS_TARGET" --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v node_modules | wc -l | tr -d ' ')

echo "Remaining references (may need review):"
echo "  @mysten: $mysten_refs files | Sui: $sui_refs files"

print_success "Step 3 completed: Brand replacement done!"
