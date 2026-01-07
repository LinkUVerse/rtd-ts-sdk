#!/bin/bash
# 21-clean-wallet-features.sh - Remove DeepBook and Ledger features from wallet
# Copyright (c) LinkU Labs. All rights reserved.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config-apps.sh"

print_step "Step 2: Clean Wallet Features (DeepBook & Ledger)"

WALLET_DIR="$APPS_TARGET/wallet"

# ============================================
# Check wallet directory exists
# ============================================

if [[ ! -d "$WALLET_DIR" ]]; then
    print_error "Wallet directory does not exist: $WALLET_DIR"
    exit 1
fi

print_info "Wallet directory: $WALLET_DIR"

# ============================================
# Phase 1: Remove DeepBook directories and files
# ============================================

print_step "Phase 1: Removing DeepBook Files"

deepbook_removed=0
for path in "${DEEPBOOK_PATHS[@]}"; do
    full_path="$WALLET_DIR/$path"
    if [[ -e "$full_path" ]]; then
        print_info "Removing: $path"
        rm -rf "$full_path"
        deepbook_removed=$((deepbook_removed + 1))
    else
        print_warning "Not found (may have already been removed): $path"
    fi
done

print_success "DeepBook: Removed $deepbook_removed items"

# ============================================
# Phase 2: Remove Ledger directories and files
# ============================================

print_step "Phase 2: Removing Ledger Files"

ledger_removed=0
for path in "${LEDGER_PATHS[@]}"; do
    full_path="$WALLET_DIR/$path"
    if [[ -e "$full_path" ]]; then
        print_info "Removing: $path"
        rm -rf "$full_path"
        ledger_removed=$((ledger_removed + 1))
    else
        print_warning "Not found (may have already been removed): $path"
    fi
done

print_success "Ledger: Removed $ledger_removed items"

# ============================================
# Phase 3: Remove dependencies from package.json
# ============================================

print_step "Phase 3: Removing Dependencies from package.json"

PACKAGE_JSON="$WALLET_DIR/package.json"

if [[ ! -f "$PACKAGE_JSON" ]]; then
    print_error "package.json not found: $PACKAGE_JSON"
    exit 1
fi

# Use Node.js to safely remove dependencies
node -e "
const fs = require('fs');
const path = '$PACKAGE_JSON';
const pkg = JSON.parse(fs.readFileSync(path, 'utf8'));

const removeList = [
    '@mysten/deepbook',
    '@mysten/ledgerjs-hw-app-sui',
    '@ledgerhq/errors',
    '@ledgerhq/hw-transport',
    '@ledgerhq/hw-transport-webhid',
    '@ledgerhq/hw-transport-webusb'
];

let removed = [];

for (const dep of removeList) {
    if (pkg.dependencies && pkg.dependencies[dep]) {
        delete pkg.dependencies[dep];
        removed.push(dep + ' (dependencies)');
    }
    if (pkg.devDependencies && pkg.devDependencies[dep]) {
        delete pkg.devDependencies[dep];
        removed.push(dep + ' (devDependencies)');
    }
    if (pkg.peerDependencies && pkg.peerDependencies[dep]) {
        delete pkg.peerDependencies[dep];
        removed.push(dep + ' (peerDependencies)');
    }
}

fs.writeFileSync(path, JSON.stringify(pkg, null, '\t') + '\n');

console.log('Removed dependencies:');
removed.forEach(r => console.log('  - ' + r));
console.log('Total: ' + removed.length + ' dependencies removed');
"

print_success "Dependencies removed from package.json"

# ============================================
# Phase 4: Additional Ledger-related files search and remove
# ============================================

print_step "Phase 4: Searching for Additional Ledger Files"

# Find any additional ledger-related files that might have been missed
additional_ledger_files=$(find "$WALLET_DIR" -type f \( -name "*[Ll]edger*" -o -name "*LEDGER*" \) 2>/dev/null || true)

if [[ -n "$additional_ledger_files" ]]; then
    print_info "Found additional Ledger-related files:"
    echo "$additional_ledger_files" | while read -r file; do
        print_warning "  $file"
    done
    print_info "These files may need manual review."
else
    print_success "No additional Ledger files found."
fi

# ============================================
# Summary
# ============================================

print_step "Clean Summary"

echo ""
echo "Files/directories removed:"
echo "  - DeepBook items: $deepbook_removed"
echo "  - Ledger items: $ledger_removed"
echo ""
echo "Remaining verification needed:"
echo "  - Update routing configuration"
echo "  - Remove broken imports"
echo "  - Update account type definitions"

# Check for remaining references
deepbook_refs=$(grep -r "deepbook\|DeepBook" "$WALLET_DIR" --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
ledger_refs=$(grep -r "@ledgerhq\|ledgerjs-hw-app-sui" "$WALLET_DIR" --include="*.ts" --include="*.tsx" --include="*.json" 2>/dev/null | wc -l | tr -d ' ')

echo ""
echo "Remaining references (may need cleanup in next steps):"
echo "  - DeepBook references: $deepbook_refs"
echo "  - Ledger package references: $ledger_refs"

print_success "Step 2 completed: Wallet features cleaned!"
