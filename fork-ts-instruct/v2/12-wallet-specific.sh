#!/bin/bash
# 12-wallet-specific.sh - Wallet-standard specific brand replacements
# Copyright (c) LinkU Labs. All rights reserved.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../utils.sh"
source "$SCRIPT_DIR/config-v2.sh"

log_step "Wallet-Specific Brand Replacements"

cd "$TARGET_ROOT"

WALLET_PACKAGES=(
    "packages/wallet-standard"
    "packages/window-wallet-core"
    "packages/slush-wallet"
)

# ============================================
# Phase 1: Wallet-Standard Types
# ============================================
log_info "Phase 1: Replacing wallet-standard types..."

for i in "${!WALLET_TYPES_OLD[@]}"; do
    old="${WALLET_TYPES_OLD[$i]}"
    new="${WALLET_TYPES_NEW[$i]}"
    log_debug "  $old -> $new"

    for pkg in "${WALLET_PACKAGES[@]}"; do
        if [[ -d "$pkg" ]]; then
            find "$pkg" -type f \( -name "*.ts" -o -name "*.tsx" \) \
                -not -path "*/node_modules/*" \
                -exec grep -l "$old" {} \; 2>/dev/null | while read -r file; do
                safe_sed_replace "$old" "$new" "$file"
            done
        fi
    done
done

log_success "Phase 1 complete"

# ============================================
# Phase 2: Protocol Identifiers
# ============================================
log_info "Phase 2: Replacing protocol identifiers..."

for i in "${!PROTOCOL_OLD[@]}"; do
    old="${PROTOCOL_OLD[$i]}"
    new="${PROTOCOL_NEW[$i]}"
    log_debug "  $old -> $new"

    for pkg in "${WALLET_PACKAGES[@]}"; do
        if [[ -d "$pkg" ]]; then
            find "$pkg" -type f \( -name "*.ts" -o -name "*.tsx" \) \
                -not -path "*/node_modules/*" \
                -exec grep -l "$old" {} \; 2>/dev/null | while read -r file; do
                safe_sed_replace "$old" "$new" "$file"
            done
        fi
    done
done

log_success "Phase 2 complete"

# ============================================
# Phase 3: Chain Identifiers
# ============================================
log_info "Phase 3: Replacing chain identifiers..."

for i in "${!CHAIN_IDS_OLD[@]}"; do
    old="${CHAIN_IDS_OLD[$i]}"
    new="${CHAIN_IDS_NEW[$i]}"
    log_debug "  $old -> $new"

    for pkg in "${WALLET_PACKAGES[@]}"; do
        if [[ -d "$pkg" ]]; then
            find "$pkg" -type f \( -name "*.ts" -o -name "*.tsx" \) \
                -not -path "*/node_modules/*" \
                -exec grep -l "$old" {} \; 2>/dev/null | while read -r file; do
                safe_sed_replace "$old" "$new" "$file"
            done
        fi
    done
done

log_success "Phase 3 complete"

# ============================================
# Phase 4: File Renames (wallet-standard)
# ============================================
log_info "Phase 4: Renaming wallet-standard feature files..."

for i in "${!WALLET_FILES_OLD[@]}"; do
    old_name="${WALLET_FILES_OLD[$i]}"
    new_name="${WALLET_FILES_NEW[$i]}"

    # Find and rename files
    find packages/wallet-standard -type f -name "$old_name" 2>/dev/null | while read -r file; do
        dir_path=$(dirname "$file")
        new_path="$dir_path/$new_name"
        log_info "  Renaming: $old_name -> $new_name"
        mv "$file" "$new_path"
    done
done

log_success "Phase 4 complete"

# ============================================
# Phase 5: Update Import Paths
# ============================================
log_info "Phase 5: Updating import paths for renamed files..."

for pkg in "${WALLET_PACKAGES[@]}"; do
    if [[ -d "$pkg" ]]; then
        find "$pkg" -type f \( -name "*.ts" -o -name "*.tsx" \) \
            -not -path "*/node_modules/*" \
            -exec grep -l "suiSign\|suiReport\|suiGet" {} \; 2>/dev/null | while read -r file; do
            # Update import references
            safe_sed_replace "./suiSignTransaction" "./rtdSignTransaction" "$file"
            safe_sed_replace "./suiSignTransactionBlock" "./rtdSignTransactionBlock" "$file"
            safe_sed_replace "./suiSignAndExecuteTransactionBlock" "./rtdSignAndExecuteTransactionBlock" "$file"
            safe_sed_replace "./suiSignAndExecuteTransaction" "./rtdSignAndExecuteTransaction" "$file"
            safe_sed_replace "./suiSignPersonalMessage" "./rtdSignPersonalMessage" "$file"
            safe_sed_replace "./suiReportTransactionEffects" "./rtdReportTransactionEffects" "$file"
            safe_sed_replace "./suiGetCapabilities" "./rtdGetCapabilities" "$file"
            # Also handle without ./
            safe_sed_replace "from 'suiSign" "from 'rtdSign" "$file"
            safe_sed_replace "from \"suiSign" "from \"rtdSign" "$file"
            safe_sed_replace "from 'suiReport" "from 'rtdReport" "$file"
            safe_sed_replace "from \"suiReport" "from \"rtdReport" "$file"
            safe_sed_replace "from 'suiGet" "from 'rtdGet" "$file"
            safe_sed_replace "from \"suiGet" "from \"rtdGet" "$file"
        done
    fi
done

log_success "Phase 5 complete"

# ============================================
# Phase 6: Slush Wallet Specific
# ============================================
log_info "Phase 6: Slush wallet specific replacements..."

if [[ -d "packages/slush-wallet" ]]; then
    for i in "${!SLUSH_OLD[@]}"; do
        old="${SLUSH_OLD[$i]}"
        new="${SLUSH_NEW[$i]}"
        log_debug "  $old -> $new"

        find packages/slush-wallet -type f \( -name "*.ts" -o -name "*.tsx" \) \
            -not -path "*/node_modules/*" \
            -exec grep -l "$old" {} \; 2>/dev/null | while read -r file; do
            safe_sed_replace "$old" "$new" "$file"
        done
    done
fi

log_success "Phase 6 complete"

# ============================================
# Phase 7: Window Wallet Core Specific
# ============================================
log_info "Phase 7: Window wallet core specific replacements..."

if [[ -d "packages/window-wallet-core" ]]; then
    find packages/window-wallet-core -type f \( -name "*.ts" -o -name "*.tsx" \) \
        -not -path "*/node_modules/*" \
        -exec grep -l "sui" {} \; 2>/dev/null | while read -r file; do
        # Replace any remaining sui references
        safe_sed_replace "suiWallet" "rtdWallet" "$file"
        safe_sed_replace "SuiWallet" "RtdWallet" "$file"
    done
fi

log_success "Phase 7 complete"

# ============================================
# Phase 8: Update index.ts exports
# ============================================
log_info "Phase 8: Updating index.ts exports..."

for pkg in "${WALLET_PACKAGES[@]}"; do
    if [[ -d "$pkg" ]]; then
        find "$pkg" -name "index.ts" 2>/dev/null | while read -r file; do
            if grep -q "sui" "$file" 2>/dev/null; then
                # Update export references
                safe_sed_replace "export \* from './suiSign" "export * from './rtdSign" "$file"
                safe_sed_replace "export \* from './suiReport" "export * from './rtdReport" "$file"
                safe_sed_replace "export \* from './suiGet" "export * from './rtdGet" "$file"
                safe_sed_replace "export \* from \"./suiSign" "export * from \"./rtdSign" "$file"
                safe_sed_replace "export \* from \"./suiReport" "export * from \"./rtdReport" "$file"
                safe_sed_replace "export \* from \"./suiGet" "export * from \"./rtdGet" "$file"
            fi
        done
    fi
done

log_success "Phase 8 complete"

log_step "Wallet-Specific Replacements Complete"

# Summary
echo ""
echo "Processed packages:"
for pkg in "${WALLET_PACKAGES[@]}"; do
    if [[ -d "$pkg" ]]; then
        echo "  ✓ $(basename $pkg)"
    fi
done
