#!/bin/bash
# 11-brand-rename-v2.sh - General brand replacement for new packages
# Copyright (c) LinkU Labs. All rights reserved.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../utils.sh"
source "$SCRIPT_DIR/config-v2.sh"

log_step "General Brand Replacement for New Packages"

cd "$TARGET_ROOT"

# Define packages to process
PROCESS_PACKAGES=(
    "packages/kiosk"
    "packages/wallet-standard"
    "packages/window-wallet-core"
    "packages/slush-wallet"
    "packages/dapp-kit"
)

# Helper function to process files in new packages
process_new_packages() {
    local pattern="$1"
    local old="$2"
    local new="$3"

    for pkg in "${PROCESS_PACKAGES[@]}"; do
        if [[ -d "$pkg" ]]; then
            find "$pkg" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.json" -o -name "*.md" \) \
                -not -path "*/node_modules/*" \
                -not -path "*/dist/*" \
                -exec grep -l "$pattern" {} \; 2>/dev/null | while read -r file; do
                safe_sed_replace "$old" "$new" "$file"
            done
        fi
    done
}

# ============================================
# Phase 1: NPM Package Names
# ============================================
log_info "Phase 1: Replacing NPM package names..."

# Replace new package names
for i in "${!NPM_OLD_NAMES_V2[@]}"; do
    old="${NPM_OLD_NAMES_V2[$i]}"
    new="${NPM_NEW_NAMES_V2[$i]}"
    log_debug "  $old -> $new"
    process_new_packages "$old" "$old" "$new"
done

# Replace existing package names (dependencies)
for i in "${!NPM_OLD_NAMES[@]}"; do
    old="${NPM_OLD_NAMES[$i]}"
    new="${NPM_NEW_NAMES[$i]}"
    log_debug "  $old -> $new"
    process_new_packages "$old" "$old" "$new"
done

# Also replace internal references like rtd-typescript
process_new_packages "@mysten/sui" "@mysten/sui" "rtd-typescript"

log_success "Phase 1 complete"

# ============================================
# Phase 2: Organization Names
# ============================================
log_info "Phase 2: Replacing organization names..."

process_new_packages "$OLD_ORG" "$OLD_ORG" "$NEW_ORG"
process_new_packages "$OLD_ORG_FULL" "$OLD_ORG_FULL" "$NEW_ORG_FULL"
process_new_packages "$OLD_DOMAIN" "$OLD_DOMAIN" "$NEW_DOMAIN"

log_success "Phase 2 complete"

# ============================================
# Phase 3: Network Endpoints
# ============================================
log_info "Phase 3: Replacing network endpoints..."

for i in "${!ENDPOINT_OLD[@]}"; do
    old="${ENDPOINT_OLD[$i]}"
    new="${ENDPOINT_NEW[$i]}"
    log_debug "  $old -> $new"
    process_new_packages "$old" "$old" "$new"
done

log_success "Phase 3 complete"

# ============================================
# Phase 4: Type and Function Names
# ============================================
log_info "Phase 4: Replacing type and function names..."

for i in "${!TYPE_OLD[@]}"; do
    old="${TYPE_OLD[$i]}"
    new="${TYPE_NEW[$i]}"
    log_debug "  $old -> $new"
    process_new_packages "$old" "$old" "$new"
done

log_success "Phase 4 complete"

# ============================================
# Phase 5: Constants
# ============================================
log_info "Phase 5: Replacing constants..."

for i in "${!CONST_OLD[@]}"; do
    old="${CONST_OLD[$i]}"
    new="${CONST_NEW[$i]}"
    log_debug "  $old -> $new"
    process_new_packages "$old" "$old" "$new"
done

log_success "Phase 5 complete"

# ============================================
# Phase 6: Private Key Prefix
# ============================================
log_info "Phase 6: Replacing private key prefix..."

process_new_packages "$OLD_PRIVKEY_PREFIX" "$OLD_PRIVKEY_PREFIX" "$NEW_PRIVKEY_PREFIX"

log_success "Phase 6 complete"

# ============================================
# Phase 7: Move Type Paths
# ============================================
log_info "Phase 7: Replacing Move type paths..."

process_new_packages "$OLD_MOVE_COIN_TYPE" "$OLD_MOVE_COIN_TYPE" "$NEW_MOVE_COIN_TYPE"
process_new_packages "$OLD_SYSTEM_MODULE" "$OLD_SYSTEM_MODULE" "$NEW_SYSTEM_MODULE"

log_success "Phase 7 complete"

# ============================================
# Phase 8: Domain Suffix
# ============================================
log_info "Phase 8: Replacing domain suffix..."

# Be careful with .sui to avoid replacing file extensions incorrectly
for pkg in "${PROCESS_PACKAGES[@]}"; do
    if [[ -d "$pkg" ]]; then
        find "$pkg" -type f \( -name "*.ts" -o -name "*.tsx" \) \
            -not -path "*/node_modules/*" \
            -exec grep -l "\.sui" {} \; 2>/dev/null | while read -r file; do
            # Only replace .sui when it's a domain suffix (preceded by word character)
            safe_sed_replace_extended '\b([a-zA-Z0-9])\.sui\b' '\1.rtd' "$file"
        done
    fi
done

log_success "Phase 8 complete"

# ============================================
# Phase 9: General sui- prefix replacements
# ============================================
log_info "Phase 9: Replacing sui- prefixes..."

# Replace sui- prefix in identifiers (but not in paths or package names already handled)
for pkg in "${PROCESS_PACKAGES[@]}"; do
    if [[ -d "$pkg" ]]; then
        find "$pkg" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.css" -o -name "*.css.ts" \) \
            -not -path "*/node_modules/*" \
            -exec grep -l "sui-" {} \; 2>/dev/null | while read -r file; do
            # Replace CSS class prefixes and similar
            safe_sed_replace "sui-connect" "rtd-connect" "$file"
            safe_sed_replace "sui-wallet" "rtd-wallet" "$file"
            safe_sed_replace "sui-icon" "rtd-icon" "$file"
        done
    fi
done

log_success "Phase 9 complete"

# ============================================
# Phase 10: Copyright headers
# ============================================
log_info "Phase 10: Updating copyright headers..."

for pkg in "${PROCESS_PACKAGES[@]}"; do
    if [[ -d "$pkg" ]]; then
        find "$pkg" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" \) \
            -not -path "*/node_modules/*" \
            -exec grep -l "Mysten Labs" {} \; 2>/dev/null | while read -r file; do
            safe_sed_replace "Mysten Labs" "LinkU Labs" "$file"
        done
    fi
done

log_success "Phase 10 complete"

# ============================================
# Phase 11: Remaining Sui/SUI replacements
# ============================================
log_info "Phase 11: Final Sui/SUI replacements..."

# Replace remaining instances carefully
# SUI (uppercase, standalone)
for pkg in "${PROCESS_PACKAGES[@]}"; do
    if [[ -d "$pkg" ]]; then
        find "$pkg" -type f \( -name "*.ts" -o -name "*.tsx" \) \
            -not -path "*/node_modules/*" \
            -exec grep -l '\bSUI\b' {} \; 2>/dev/null | while read -r file; do
            safe_sed_replace_extended '\bSUI\b' 'RTD' "$file"
        done
    fi
done

# Sui (mixed case, standalone) - be careful with already replaced words
for pkg in "${PROCESS_PACKAGES[@]}"; do
    if [[ -d "$pkg" ]]; then
        find "$pkg" -type f \( -name "*.ts" -o -name "*.tsx" \) \
            -not -path "*/node_modules/*" \
            -exec grep -l '\bSui\b' {} \; 2>/dev/null | while read -r file; do
            # Skip if already replaced (RtdClient, etc.)
            safe_sed_replace_extended '\bSui\b' 'Rtd' "$file"
        done
    fi
done

log_success "Phase 11 complete"

log_step "General Brand Replacement Complete"

# Summary
echo ""
echo "Processed packages:"
for pkg in "${PROCESS_PACKAGES[@]}"; do
    if [[ -d "$pkg" ]]; then
        echo "  ✓ $(basename $pkg)"
    fi
done
