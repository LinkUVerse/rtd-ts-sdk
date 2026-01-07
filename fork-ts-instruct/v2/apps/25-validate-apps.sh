#!/bin/bash
# 25-validate-apps.sh - Validate migration results
# Copyright (c) LinkU Labs. All rights reserved.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config-apps.sh"

print_step "Step 6: Validation"

# ============================================
# Check target directory exists
# ============================================

if [[ ! -d "$APPS_TARGET" ]]; then
    print_error "Target directory does not exist: $APPS_TARGET"
    exit 1
fi

print_info "Validating: $APPS_TARGET"

# ============================================
# Initialize validation results
# ============================================

VALIDATION_PASSED=true
WARNINGS=0
ERRORS=0

check_pass() {
    echo -e "  \033[0;32m✓\033[0m $1"
}

check_fail() {
    echo -e "  \033[0;31m✗\033[0m $1"
    VALIDATION_PASSED=false
    ERRORS=$((ERRORS + 1))
}

check_warn() {
    echo -e "  \033[0;33m!\033[0m $1"
    WARNINGS=$((WARNINGS + 1))
}

# ============================================
# Check 1: Directory Structure
# ============================================

print_step "Check 1: Directory Structure"

expected_dirs=(
    "wallet"
    "core"
    "icons"
    "rtd-explorer"
)

for dir in "${expected_dirs[@]}"; do
    if [[ -d "$APPS_TARGET/$dir" ]]; then
        check_pass "Directory exists: $dir"
    else
        check_fail "Directory missing: $dir"
    fi
done

# Check old directory doesn't exist
if [[ -d "$APPS_TARGET/sui-explorer" ]]; then
    check_fail "Old directory still exists: sui-explorer (should be rtd-explorer)"
else
    check_pass "Old directory removed: sui-explorer"
fi

# ============================================
# Check 2: Package Names
# ============================================

print_step "Check 2: Package Names in package.json"

expected_packages=(
    "wallet:rtd-wallet"
    "core:rtd-apps-core"
    "icons:rtd-apps-icons"
    "rtd-explorer:rtd-explorer"
)

for entry in "${expected_packages[@]}"; do
    dir="${entry%%:*}"
    expected_name="${entry##*:}"
    pkg_file="$APPS_TARGET/$dir/package.json"

    if [[ -f "$pkg_file" ]]; then
        actual_name=$(node -e "console.log(require('$pkg_file').name)")
        if [[ "$actual_name" == "$expected_name" ]]; then
            check_pass "Package name correct: $dir -> $expected_name"
        else
            check_fail "Package name incorrect: $dir (expected: $expected_name, got: $actual_name)"
        fi
    else
        check_warn "Package.json not found: $pkg_file"
    fi
done

# ============================================
# Check 3: No @mysten References
# ============================================

print_step "Check 3: @mysten References"

mysten_count=$(grep -r "@mysten" "$APPS_TARGET" \
    --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.json" \
    2>/dev/null | grep -v "node_modules" | grep -v "\.git" | wc -l | tr -d ' ')

if [[ "$mysten_count" -eq "0" ]]; then
    check_pass "No @mysten references found"
else
    check_fail "Found $mysten_count @mysten references"
    grep -r "@mysten" "$APPS_TARGET" \
        --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.json" \
        2>/dev/null | grep -v "node_modules" | grep -v "\.git" | head -10 | while read -r line; do
        echo "      $line"
    done
fi

# ============================================
# Check 4: No MystenLabs References
# ============================================

print_step "Check 4: MystenLabs/mystenlabs References"

mystenlabs_count=$(grep -r "MystenLabs\|mystenlabs" "$APPS_TARGET" \
    --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.json" \
    2>/dev/null | grep -v "node_modules" | grep -v "\.git" | wc -l | tr -d ' ')

if [[ "$mystenlabs_count" -eq "0" ]]; then
    check_pass "No MystenLabs/mystenlabs references found"
else
    check_fail "Found $mystenlabs_count MystenLabs/mystenlabs references"
    grep -r "MystenLabs\|mystenlabs" "$APPS_TARGET" \
        --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.json" \
        2>/dev/null | grep -v "node_modules" | grep -v "\.git" | head -10 | while read -r line; do
        echo "      $line"
    done
fi

# ============================================
# Check 5: DeepBook References (Wallet only)
# ============================================

print_step "Check 5: DeepBook References in Wallet"

if [[ -d "$APPS_TARGET/wallet" ]]; then
    deepbook_count=$(grep -r "deepbook\|DeepBook" "$APPS_TARGET/wallet" \
        --include="*.ts" --include="*.tsx" \
        2>/dev/null | grep -v "node_modules" | wc -l | tr -d ' ')

    if [[ "$deepbook_count" -eq "0" ]]; then
        check_pass "No DeepBook references in wallet"
    else
        check_warn "Found $deepbook_count DeepBook references in wallet (may need review)"
        grep -r "deepbook\|DeepBook" "$APPS_TARGET/wallet" \
            --include="*.ts" --include="*.tsx" \
            2>/dev/null | grep -v "node_modules" | head -5 | while read -r line; do
            echo "      $line"
        done
    fi
fi

# ============================================
# Check 6: Ledger Package References (Wallet only)
# ============================================

print_step "Check 6: Ledger Package References in Wallet"

if [[ -d "$APPS_TARGET/wallet" ]]; then
    ledger_pkg_count=$(grep -r "@ledgerhq\|ledgerjs-hw-app" "$APPS_TARGET/wallet" \
        --include="*.ts" --include="*.tsx" --include="*.json" \
        2>/dev/null | grep -v "node_modules" | wc -l | tr -d ' ')

    if [[ "$ledger_pkg_count" -eq "0" ]]; then
        check_pass "No Ledger package references in wallet"
    else
        check_fail "Found $ledger_pkg_count Ledger package references in wallet"
        grep -r "@ledgerhq\|ledgerjs-hw-app" "$APPS_TARGET/wallet" \
            --include="*.ts" --include="*.tsx" --include="*.json" \
            2>/dev/null | grep -v "node_modules" | head -10 | while read -r line; do
            echo "      $line"
        done
    fi
fi

# ============================================
# Check 7: JSON Validity
# ============================================

print_step "Check 7: JSON File Validity"

json_errors=0
while IFS= read -r -d '' json_file; do
    # Skip tsconfig files (they allow comments which standard JSON doesn't support)
    if [[ "$json_file" == *"tsconfig"* ]]; then
        continue
    fi
    if ! node -e "JSON.parse(require('fs').readFileSync('$json_file', 'utf8'))" 2>/dev/null; then
        check_fail "Invalid JSON: $json_file"
        json_errors=$((json_errors + 1))
    fi
done < <(find "$APPS_TARGET" -name "*.json" -not -path "*/node_modules/*" -print0)

if [[ "$json_errors" -eq "0" ]]; then
    check_pass "All JSON files are valid"
fi

# ============================================
# Check 8: New Brand References Exist
# ============================================

print_step "Check 8: New Brand References"

# Check for rtd- prefixes
rtd_refs=$(grep -r "rtd-" "$APPS_TARGET" --include="*.json" 2>/dev/null | grep -v "node_modules" | wc -l | tr -d ' ')
if [[ "$rtd_refs" -gt "0" ]]; then
    check_pass "Found rtd- prefixed references ($rtd_refs occurrences)"
else
    check_warn "No rtd- prefixed references found"
fi

# Check for Rtd types
rtd_types=$(grep -r "Rtd[A-Z]" "$APPS_TARGET" --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules" | wc -l | tr -d ' ')
if [[ "$rtd_types" -gt "0" ]]; then
    check_pass "Found Rtd* type references ($rtd_types occurrences)"
else
    check_warn "No Rtd* type references found"
fi

# Check for LinkU/LinkUVerse
linku_refs=$(grep -r "LinkU" "$APPS_TARGET" --include="*.ts" --include="*.tsx" --include="*.json" 2>/dev/null | grep -v "node_modules" | wc -l | tr -d ' ')
if [[ "$linku_refs" -gt "0" ]]; then
    check_pass "Found LinkU references ($linku_refs occurrences)"
else
    check_warn "No LinkU references found"
fi

# ============================================
# Check 9: Removed Files Don't Exist
# ============================================

print_step "Check 9: Removed Files Verification"

removed_paths=(
    "wallet/src/shared/deepBook"
    "wallet/src/ui/app/hooks/deepbook"
    "wallet/src/ui/app/pages/swap"
    "wallet/src/ui/app/components/ledger"
    "wallet/src/background/accounts/LedgerAccount.ts"
)

for path in "${removed_paths[@]}"; do
    if [[ -e "$APPS_TARGET/$path" ]]; then
        check_fail "File/directory should be removed: $path"
    else
        check_pass "Removed: $path"
    fi
done

# ============================================
# Summary
# ============================================

print_step "Validation Summary"

echo ""
echo "Results:"
echo "  - Errors: $ERRORS"
echo "  - Warnings: $WARNINGS"
echo ""

if [[ "$VALIDATION_PASSED" == "true" && "$ERRORS" -eq "0" ]]; then
    print_success "All validation checks passed!"
    echo ""
    echo "Next steps:"
    echo "  1. cd $APPS_TARGET"
    echo "  2. pnpm install"
    echo "  3. pnpm build"
    echo "  4. pnpm test (optional)"
    exit 0
else
    print_error "Validation failed with $ERRORS error(s)"
    echo ""
    echo "Please review the errors above and fix them before proceeding."
    exit 1
fi
