#!/bin/bash
# 23-wallet-specific.sh - Wallet-specific processing after feature removal
# Copyright (c) LinkU Labs. All rights reserved.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config-apps.sh"

print_step "Step 4: Wallet-Specific Processing"

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
# Phase 1: Fix broken imports and exports using Node.js
# ============================================

print_step "Phase 1: Fixing Broken Imports and Exports"

# Create a Node.js script to fix imports
node << 'NODEJS_SCRIPT'
const fs = require('fs');
const path = require('path');

const WALLET_DIR = process.env.WALLET_DIR || '/Users/changzechuan/WenchuanProjects/SuiTestProjects/rtd-typescript/rtd-apps/wallet';

// Files that need import cleanup
const filesToFix = [
    // Hooks index - remove deepbook export
    {
        path: 'src/ui/app/hooks/index.ts',
        removals: [
            /export \* from ['"]\.\/deepbook['"];?\n?/g,
            /export \* from ['"]\.\/useValidSwapTokensList['"];?\n?/g,
        ]
    },
    // Background accounts index - remove LedgerAccount
    {
        path: 'src/background/accounts/index.ts',
        removals: [
            /export \* from ['"]\.\/LedgerAccount['"];?\n?/g,
            /export \{ LedgerAccount \} from ['"]\.\/LedgerAccount['"];?\n?/g,
            /import .* from ['"]\.\/LedgerAccount['"];?\n?/g,
        ]
    },
    // ApiProvider - remove Ledger-related imports
    {
        path: 'src/ui/app/ApiProvider.ts',
        removals: [
            /import .* from ['"].*[Ll]edger.*['"];?\n?/g,
        ]
    },
    // useSigner - remove Ledger signer
    {
        path: 'src/ui/app/hooks/useSigner.ts',
        removals: [
            /import .* from ['"].*[Ll]edger.*['"];?\n?/g,
            /import \{ LedgerSigner \} from ['"].*['"];?\n?/g,
        ]
    },
];

console.log('Fixing broken imports and exports...\n');

for (const file of filesToFix) {
    const fullPath = path.join(WALLET_DIR, file.path);

    if (!fs.existsSync(fullPath)) {
        console.log(`  [SKIP] File not found: ${file.path}`);
        continue;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    for (const pattern of file.removals) {
        if (pattern.test(content)) {
            content = content.replace(pattern, '');
            modified = true;
        }
    }

    if (modified) {
        fs.writeFileSync(fullPath, content);
        console.log(`  [FIXED] ${file.path}`);
    } else {
        console.log(`  [OK] ${file.path} (no changes needed)`);
    }
}

console.log('\nImport/export cleanup completed.');
NODEJS_SCRIPT

print_success "Import cleanup completed"

# ============================================
# Phase 2: Fix routing configuration
# ============================================

print_step "Phase 2: Fixing Routing Configuration"

# Run the Node.js routing fix script
node "$SCRIPT_DIR/fix-wallet-routing.js" "$WALLET_DIR" || {
    print_warning "Routing fix script failed or not found, attempting inline fix..."

    # Inline fix if the external script doesn't exist
    node << 'NODEJS_ROUTING'
const fs = require('fs');
const path = require('path');

const WALLET_DIR = process.env.WALLET_DIR || '/Users/changzechuan/WenchuanProjects/SuiTestProjects/rtd-typescript/rtd-apps/wallet';

// Main app routing file
const routingFiles = [
    'src/ui/app/index.tsx',
    'src/ui/app/App.tsx',
    'src/ui/app/routes.tsx',
];

const patternsToRemove = [
    // Swap-related imports and routes
    /import \{ SwapPage \} from ['"].*swap.*['"];?\n?/g,
    /import \{ CoinsSelectionPage \} from ['"].*swap.*['"];?\n?/g,
    /import SwapPage from ['"].*swap.*['"];?\n?/g,
    /<Route.*path=["']swap.*["'].*\/>\n?/g,
    /<Route.*path=["'].*swap.*["'].*>[\s\S]*?<\/Route>\n?/g,

    // Ledger-related imports and routes
    /import \{ ImportLedgerAccountsPage \} from ['"].*ImportLedgerAccountsPage.*['"];?\n?/g,
    /import ImportLedgerAccountsPage from ['"].*ImportLedgerAccountsPage.*['"];?\n?/g,
    /import \{ useSuiLedgerClient \} from ['"].*SuiLedgerClientProvider.*['"];?\n?/g,
    /import \{ useRtdLedgerClient \} from ['"].*RtdLedgerClientProvider.*['"];?\n?/g,
    /import \{ SuiLedgerClientProvider \} from ['"].*['"];?\n?/g,
    /import \{ RtdLedgerClientProvider \} from ['"].*['"];?\n?/g,
    /<Route.*path=["']import-ledger-accounts["'].*\/>\n?/g,
    /<Route.*path=["'].*ledger.*["'].*>[\s\S]*?<\/Route>\n?/g,

    // DeepBook context
    /import \{ DeepBookContextProvider \} from ['"].*deepBook.*['"];?\n?/g,
    /import \{ useDeepBookContext \} from ['"].*deepBook.*['"];?\n?/g,

    // Ledger provider wrapper (will be handled specially)
    /<SuiLedgerClientProvider>[\s\S]*?<\/SuiLedgerClientProvider>/g,
    /<RtdLedgerClientProvider>[\s\S]*?<\/RtdLedgerClientProvider>/g,
];

console.log('Fixing routing configuration...\n');

for (const relPath of routingFiles) {
    const fullPath = path.join(WALLET_DIR, relPath);

    if (!fs.existsSync(fullPath)) {
        console.log(`  [SKIP] ${relPath} not found`);
        continue;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    for (const pattern of patternsToRemove) {
        if (pattern.test(content)) {
            content = content.replace(pattern, '');
            modified = true;
        }
    }

    // Clean up empty lines
    content = content.replace(/\n{3,}/g, '\n\n');

    if (modified) {
        fs.writeFileSync(fullPath, content);
        console.log(`  [FIXED] ${relPath}`);
    } else {
        console.log(`  [OK] ${relPath}`);
    }
}

console.log('\nRouting configuration fixed.');
NODEJS_ROUTING
}

print_success "Routing configuration fixed"

# ============================================
# Phase 3: Update Account Types
# ============================================

print_step "Phase 3: Updating Account Types"

node << 'NODEJS_ACCOUNT'
const fs = require('fs');
const path = require('path');

const WALLET_DIR = process.env.WALLET_DIR || '/Users/changzechuan/WenchuanProjects/SuiTestProjects/rtd-typescript/rtd-apps/wallet';

// Files that might contain account type definitions
const accountTypeFiles = [
    'src/background/accounts/Account.ts',
    'src/shared/accounts/Account.ts',
    'src/background/accounts/index.ts',
    'src/ui/app/redux/slices/account/index.ts',
];

const patternsToRemove = [
    // Remove ledger from type unions
    /\|\s*['"]ledger['"]/g,
    /['"]ledger['"]\s*\|/g,
    // Remove isLedgerAccount checks
    /isLedgerAccount\([^)]*\)/g,
    // Remove LedgerAccount from imports
    /,?\s*LedgerAccount/g,
    /LedgerAccount,?\s*/g,
    // Remove ledger case in switch statements
    /case\s+['"]ledger['"]:\s*[\s\S]*?break;?\n?/g,
];

console.log('Updating account types...\n');

for (const relPath of accountTypeFiles) {
    const fullPath = path.join(WALLET_DIR, relPath);

    if (!fs.existsSync(fullPath)) {
        continue;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    for (const pattern of patternsToRemove) {
        if (pattern.test(content)) {
            content = content.replace(pattern, '');
            modified = true;
        }
    }

    if (modified) {
        fs.writeFileSync(fullPath, content);
        console.log(`  [FIXED] ${relPath}`);
    }
}

console.log('\nAccount types updated.');
NODEJS_ACCOUNT

print_success "Account types updated"

# ============================================
# Phase 4: Clean up empty directories
# ============================================

print_step "Phase 4: Cleaning Up Empty Directories"

# Find and remove empty directories
find "$WALLET_DIR" -type d -empty -delete 2>/dev/null || true

print_success "Empty directories cleaned"

# ============================================
# Phase 5: Fix remaining broken references
# ============================================

print_step "Phase 5: Scanning for Remaining Broken References"

# Check for remaining imports from deleted files
echo "Checking for remaining broken imports..."

broken_imports=$(grep -r "from ['\"].*\(deepBook\|deepbook\|ledger\|Ledger\|swap\|Swap\)" "$WALLET_DIR" \
    --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules" || true)

if [[ -n "$broken_imports" ]]; then
    print_warning "Found potentially broken imports:"
    echo "$broken_imports" | head -20
    echo ""
    print_info "These may need manual review."
else
    print_success "No broken imports found"
fi

# ============================================
# Summary
# ============================================

print_step "Wallet-Specific Processing Summary"

echo ""
echo "Completed tasks:"
echo "  1. Cleaned up broken imports/exports"
echo "  2. Fixed routing configuration"
echo "  3. Updated account type definitions"
echo "  4. Removed empty directories"
echo ""

# Final verification
deepbook_refs=$(grep -r "deepbook\|DeepBook" "$WALLET_DIR" --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules" | wc -l | tr -d ' ')
ledger_refs=$(grep -r "ledger\|Ledger" "$WALLET_DIR" --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules" | wc -l | tr -d ' ')
swap_refs=$(grep -r "swap\|Swap" "$WALLET_DIR" --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "node_modules" | grep -v "\.css" | wc -l | tr -d ' ')

echo "Remaining references (may need manual review):"
echo "  - DeepBook: $deepbook_refs"
echo "  - Ledger: $ledger_refs"
echo "  - Swap: $swap_refs"

print_success "Step 4 completed: Wallet-specific processing done!"
