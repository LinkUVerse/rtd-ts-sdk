#!/bin/bash
# 13-dapp-kit-specific.sh - DApp-kit specific brand replacements
# Copyright (c) LinkU Labs. All rights reserved.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../utils.sh"
source "$SCRIPT_DIR/config-v2.sh"

log_step "DApp-Kit Specific Brand Replacements"

cd "$TARGET_ROOT"

DAPPKIT_PKG="packages/dapp-kit"

if [[ ! -d "$DAPPKIT_PKG" ]]; then
    log_warn "DApp-kit package not found: $DAPPKIT_PKG"
    exit 0
fi

# ============================================
# Phase 1: DApp-Kit Types
# ============================================
log_info "Phase 1: Replacing DApp-Kit types..."

for i in "${!DAPPKIT_TYPES_OLD[@]}"; do
    old="${DAPPKIT_TYPES_OLD[$i]}"
    new="${DAPPKIT_TYPES_NEW[$i]}"
    log_debug "  $old -> $new"

    find "$DAPPKIT_PKG" -type f \( -name "*.ts" -o -name "*.tsx" \) \
        -not -path "*/node_modules/*" \
        -exec grep -l "$old" {} \; 2>/dev/null | while read -r file; do
        safe_sed_replace "$old" "$new" "$file"
    done
done

log_success "Phase 1 complete"

# ============================================
# Phase 2: File Renames
# ============================================
log_info "Phase 2: Renaming DApp-Kit files..."

for i in "${!DAPPKIT_FILES_OLD[@]}"; do
    old_name="${DAPPKIT_FILES_OLD[$i]}"
    new_name="${DAPPKIT_FILES_NEW[$i]}"

    # Find and rename files
    find "$DAPPKIT_PKG" -type f -name "$old_name" 2>/dev/null | while read -r file; do
        dir_path=$(dirname "$file")
        new_path="$dir_path/$new_name"
        log_info "  Renaming: $old_name -> $new_name"
        mv "$file" "$new_path"
    done
done

log_success "Phase 2 complete"

# ============================================
# Phase 3: Update Import Paths
# ============================================
log_info "Phase 3: Updating import paths for renamed files..."

find "$DAPPKIT_PKG" -type f \( -name "*.ts" -o -name "*.tsx" \) \
    -not -path "*/node_modules/*" 2>/dev/null | while read -r file; do
    # Update SuiClientProvider references
    safe_sed_replace "./SuiClientProvider" "./RtdClientProvider" "$file"
    safe_sed_replace "'./SuiClientProvider'" "'./RtdClientProvider'" "$file"
    safe_sed_replace "\"./SuiClientProvider\"" "\"./RtdClientProvider\"" "$file"

    # Update hook imports
    safe_sed_replace "./useSuiClient" "./useRtdClient" "$file"
    safe_sed_replace "./useSuiClientQuery" "./useRtdClientQuery" "$file"
    safe_sed_replace "./useSuiClientQueries" "./useRtdClientQueries" "$file"
    safe_sed_replace "./useSuiClientInfiniteQuery" "./useRtdClientInfiniteQuery" "$file"
    safe_sed_replace "./useSuiClientMutation" "./useRtdClientMutation" "$file"
    safe_sed_replace "./useResolveSuiNSNames" "./useResolveRtdNSNames" "$file"

    # Update icon imports
    safe_sed_replace "/SuiIcon" "/RtdIcon" "$file"
    safe_sed_replace "./SuiIcon" "./RtdIcon" "$file"
    safe_sed_replace "'./icons/SuiIcon'" "'./icons/RtdIcon'" "$file"
    safe_sed_replace "\"./icons/SuiIcon\"" "\"./icons/RtdIcon\"" "$file"
done

log_success "Phase 3 complete"

# ============================================
# Phase 4: Update index.ts exports
# ============================================
log_info "Phase 4: Updating index.ts exports..."

find "$DAPPKIT_PKG" -name "index.ts" -o -name "index.tsx" 2>/dev/null | while read -r file; do
    if grep -q "Sui" "$file" 2>/dev/null; then
        # Update component exports
        safe_sed_replace "export { SuiClientProvider" "export { RtdClientProvider" "$file"
        safe_sed_replace "export { SuiIcon" "export { RtdIcon" "$file"

        # Update hook exports
        safe_sed_replace "export { useSuiClient" "export { useRtdClient" "$file"
        safe_sed_replace "export { useSuiClientQuery" "export { useRtdClientQuery" "$file"
        safe_sed_replace "export { useSuiClientQueries" "export { useRtdClientQueries" "$file"
        safe_sed_replace "export { useSuiClientInfiniteQuery" "export { useRtdClientInfiniteQuery" "$file"
        safe_sed_replace "export { useSuiClientMutation" "export { useRtdClientMutation" "$file"
        safe_sed_replace "export { useResolveSuiNSNames" "export { useResolveRtdNSNames" "$file"

        # Update file path exports
        safe_sed_replace "from './SuiClientProvider'" "from './RtdClientProvider'" "$file"
        safe_sed_replace "from './useSuiClient'" "from './useRtdClient'" "$file"
        safe_sed_replace "from './hooks/useSuiClient'" "from './hooks/useRtdClient'" "$file"
    fi
done

log_success "Phase 4 complete"

# ============================================
# Phase 5: CSS Class Names
# ============================================
log_info "Phase 5: Updating CSS class names..."

find "$DAPPKIT_PKG" -type f \( -name "*.css" -o -name "*.css.ts" -o -name "*.scss" \) \
    -not -path "*/node_modules/*" 2>/dev/null | while read -r file; do
    if grep -q "sui" "$file" 2>/dev/null; then
        safe_sed_replace "sui-connect" "rtd-connect" "$file"
        safe_sed_replace "sui-modal" "rtd-modal" "$file"
        safe_sed_replace "sui-button" "rtd-button" "$file"
        safe_sed_replace "sui-icon" "rtd-icon" "$file"
        safe_sed_replace "sui-wallet" "rtd-wallet" "$file"
    fi
done

# Also check TSX files for className references
find "$DAPPKIT_PKG" -type f -name "*.tsx" \
    -not -path "*/node_modules/*" 2>/dev/null | while read -r file; do
    if grep -q 'className.*sui' "$file" 2>/dev/null; then
        safe_sed_replace "sui-connect" "rtd-connect" "$file"
        safe_sed_replace "sui-modal" "rtd-modal" "$file"
        safe_sed_replace "sui-button" "rtd-button" "$file"
    fi
done

log_success "Phase 5 complete"

# ============================================
# Phase 6: Component Text Content
# ============================================
log_info "Phase 6: Updating component text content..."

find "$DAPPKIT_PKG" -type f \( -name "*.ts" -o -name "*.tsx" \) \
    -not -path "*/node_modules/*" 2>/dev/null | while read -r file; do
    # Update user-facing text
    safe_sed_replace "Sui Wallet" "Rtd Wallet" "$file"
    safe_sed_replace "Sui wallet" "Rtd wallet" "$file"
    safe_sed_replace "Connect to Sui" "Connect to Rtd" "$file"
done

log_success "Phase 6 complete"

# ============================================
# Phase 7: Test Files
# ============================================
log_info "Phase 7: Updating test files..."

find "$DAPPKIT_PKG" -type f -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" \
    -not -path "*/node_modules/*" 2>/dev/null | while read -r file; do
    if grep -q "Sui" "$file" 2>/dev/null; then
        # Update test descriptions
        safe_sed_replace "SuiClient" "RtdClient" "$file"
        safe_sed_replace "useSuiClient" "useRtdClient" "$file"
        safe_sed_replace "SuiClientProvider" "RtdClientProvider" "$file"
    fi
done

log_success "Phase 7 complete"

# ============================================
# Phase 8: Remaining Sui references
# ============================================
log_info "Phase 8: Final cleanup of remaining Sui references..."

find "$DAPPKIT_PKG" -type f \( -name "*.ts" -o -name "*.tsx" \) \
    -not -path "*/node_modules/*" \
    -exec grep -l "Sui\|sui" {} \; 2>/dev/null | while read -r file; do
    # Be careful not to break already-replaced content
    # Only replace standalone occurrences
    safe_sed_replace_extended '\bSui\b' 'Rtd' "$file"
    safe_sed_replace_extended '\bsui\b' 'rtd' "$file"
done

log_success "Phase 8 complete"

log_step "DApp-Kit Specific Replacements Complete"

# Summary
echo ""
echo "Processed: $DAPPKIT_PKG"
file_count=$(find "$DAPPKIT_PKG" -type f \( -name "*.ts" -o -name "*.tsx" \) | wc -l | tr -d ' ')
echo "  Total TypeScript files: $file_count"
