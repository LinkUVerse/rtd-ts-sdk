#!/bin/bash
# 15-validate-v2.sh - Validate new package migration
# Copyright (c) LinkU Labs. All rights reserved.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../utils.sh"
source "$SCRIPT_DIR/config-v2.sh"

log_step "Validating New Package Migration"

cd "$TARGET_ROOT"

errors=0
warnings=0

NEW_PKG_DIRS=(
    "packages/kiosk"
    "packages/wallet-standard"
    "packages/window-wallet-core"
    "packages/slush-wallet"
    "packages/dapp-kit"
)

# ============================================
# Check 1: Remaining @mysten references
# ============================================
log_info "Check 1: Looking for remaining @mysten references..."

for pkg in "${NEW_PKG_DIRS[@]}"; do
    if [[ -d "$pkg" ]]; then
        count=$(grep -r "@mysten" --include="*.ts" --include="*.tsx" --include="*.json" "$pkg" 2>/dev/null | grep -v "node_modules" | wc -l | tr -d ' ')
        if [[ $count -gt 0 ]]; then
            log_warn "Found $count @mysten references in $(basename $pkg)"
            grep -r "@mysten" --include="*.ts" --include="*.tsx" --include="*.json" "$pkg" 2>/dev/null | grep -v "node_modules" | head -5
            ((warnings++))
        else
            log_success "No @mysten references in $(basename $pkg)"
        fi
    fi
done

# ============================================
# Check 2: Remaining Sui* types
# ============================================
log_info "Check 2: Looking for remaining Sui* types..."

# Types that should have been replaced
check_types=(
    "SuiClient"
    "SuiChain"
    "SuiSignTransaction"
    "SuiWalletAccount"
    "SuiClientProvider"
    "useSuiClient"
)

for pkg in "${NEW_PKG_DIRS[@]}"; do
    if [[ -d "$pkg" ]]; then
        for type_name in "${check_types[@]}"; do
            count=$(grep -r "\b$type_name\b" --include="*.ts" --include="*.tsx" "$pkg" 2>/dev/null | grep -v "node_modules" | wc -l | tr -d ' ')
            if [[ $count -gt 0 ]]; then
                log_warn "Found $count '$type_name' references in $(basename $pkg)"
                ((warnings++))
            fi
        done
    fi
done

log_success "Check 2 complete"

# ============================================
# Check 3: Remaining MystenLabs references
# ============================================
log_info "Check 3: Looking for remaining MystenLabs references..."

for pkg in "${NEW_PKG_DIRS[@]}"; do
    if [[ -d "$pkg" ]]; then
        count=$(grep -ri "MystenLabs\|mystenlabs" --include="*.ts" --include="*.tsx" --include="*.json" "$pkg" 2>/dev/null | grep -v "node_modules" | wc -l | tr -d ' ')
        if [[ $count -gt 0 ]]; then
            log_warn "Found $count MystenLabs references in $(basename $pkg)"
            ((warnings++))
        else
            log_success "No MystenLabs references in $(basename $pkg)"
        fi
    fi
done

# ============================================
# Check 4: JSON file validation
# ============================================
log_info "Check 4: Validating JSON files..."

for pkg in "${NEW_PKG_DIRS[@]}"; do
    if [[ -f "$pkg/package.json" ]]; then
        if node -e "JSON.parse(require('fs').readFileSync('$pkg/package.json', 'utf8'))" 2>/dev/null; then
            log_success "Valid JSON: $pkg/package.json"
        else
            log_error "Invalid JSON: $pkg/package.json"
            ((errors++))
        fi
    fi
done

# ============================================
# Check 5: Package names are correct
# ============================================
log_info "Check 5: Verifying package names..."

# Use arrays instead of associative arrays for bash 3.x compatibility
EXPECTED_PKG_DIRS=(
    "packages/kiosk"
    "packages/wallet-standard"
    "packages/window-wallet-core"
    "packages/slush-wallet"
    "packages/dapp-kit"
)

EXPECTED_PKG_NAMES=(
    "rtd-kiosk"
    "rtd-wallet-standard"
    "rtd-window-wallet-core"
    "rtd-slush-wallet"
    "rtd-dapp-kit"
)

for i in "${!EXPECTED_PKG_DIRS[@]}"; do
    pkg="${EXPECTED_PKG_DIRS[$i]}"
    expected="${EXPECTED_PKG_NAMES[$i]}"
    if [[ -f "$pkg/package.json" ]]; then
        actual_name=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$pkg/package.json', 'utf8')).name)")
        if [[ "$actual_name" == "$expected" ]]; then
            log_success "Package name correct: $actual_name"
        else
            log_error "Package name mismatch: expected '$expected', got '$actual_name'"
            ((errors++))
        fi
    fi
done

# ============================================
# Check 6: File renames completed
# ============================================
log_info "Check 6: Verifying file renames..."

# Check wallet-standard file renames
if [[ -d "packages/wallet-standard" ]]; then
    old_files=(
        "packages/wallet-standard/src/features/suiSignTransaction.ts"
        "packages/wallet-standard/src/features/suiSignTransactionBlock.ts"
    )
    for old_file in "${old_files[@]}"; do
        if [[ -f "$old_file" ]]; then
            log_warn "Old file still exists: $old_file"
            ((warnings++))
        fi
    done

    new_files=(
        "packages/wallet-standard/src/features/rtdSignTransaction.ts"
        "packages/wallet-standard/src/features/rtdSignTransactionBlock.ts"
    )
    for new_file in "${new_files[@]}"; do
        if [[ -f "$new_file" ]]; then
            log_success "File renamed: $(basename $new_file)"
        fi
    done
fi

# Check dapp-kit file renames
if [[ -d "packages/dapp-kit" ]]; then
    # Check for old files that should be renamed
    old_dappkit_files=(
        "SuiClientProvider.tsx"
        "useSuiClient.ts"
        "SuiIcon.tsx"
    )
    for old_name in "${old_dappkit_files[@]}"; do
        found=$(find packages/dapp-kit -name "$old_name" -not -path "*/node_modules/*" 2>/dev/null | head -1)
        if [[ -n "$found" ]]; then
            log_warn "Old file still exists: $found"
            ((warnings++))
        fi
    done
fi

# ============================================
# Check 7: New brand references exist
# ============================================
log_info "Check 7: Verifying new brand references..."

# Count new brand references
rtd_client_count=$(grep -r "RtdClient" --include="*.ts" --include="*.tsx" "${NEW_PKG_DIRS[@]}" 2>/dev/null | grep -v "node_modules" | wc -l | tr -d ' ')
rtd_chain_count=$(grep -r "RtdChain" --include="*.ts" --include="*.tsx" "${NEW_PKG_DIRS[@]}" 2>/dev/null | grep -v "node_modules" | wc -l | tr -d ' ')
linku_count=$(grep -r "LinkU" --include="*.ts" --include="*.tsx" --include="*.json" "${NEW_PKG_DIRS[@]}" 2>/dev/null | grep -v "node_modules" | wc -l | tr -d ' ')

echo "  RtdClient references: $rtd_client_count"
echo "  RtdChain references: $rtd_chain_count"
echo "  LinkU references: $linku_count"

if [[ $rtd_client_count -eq 0 && $rtd_chain_count -eq 0 ]]; then
    log_warn "No Rtd* references found - brand replacement may not have run"
    ((warnings++))
else
    log_success "New brand references found"
fi

# ============================================
# Summary
# ============================================
log_step "Validation Complete"

echo ""
echo "=========================================="
echo "Validation Summary"
echo "=========================================="
echo "Errors:   $errors"
echo "Warnings: $warnings"
echo ""

if [[ $errors -gt 0 ]]; then
    log_error "Validation FAILED with $errors error(s)"
    echo ""
    echo "Please fix the errors before proceeding."
    exit 1
elif [[ $warnings -gt 0 ]]; then
    log_warn "Validation completed with $warnings warning(s)"
    echo ""
    echo "Review warnings and fix if necessary."
else
    log_success "All validations passed!"
fi

echo ""
echo "Next steps:"
echo "  1. cd $TARGET_ROOT"
echo "  2. pnpm install"
echo "  3. pnpm build"
echo "  4. Review any remaining warnings"
