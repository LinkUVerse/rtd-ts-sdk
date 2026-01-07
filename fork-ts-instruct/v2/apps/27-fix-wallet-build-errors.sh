#!/bin/bash
# 27-fix-wallet-build-errors.sh - Fix all wallet build errors
# Copyright (c) LinkU Labs. All rights reserved.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config-apps.sh"

print_step "Step 7: Fix Wallet Build Errors"

WALLET_DIR="$APPS_TARGET/wallet"
CORE_DIR="$APPS_TARGET/core"

if [[ ! -d "$WALLET_DIR" ]]; then
    print_error "Wallet directory does not exist: $WALLET_DIR"
    exit 1
fi

# ============================================
# Phase 1: Fix @scure/bip39 wordlist import
# ============================================

print_step "Phase 1: Fix @scure/bip39 wordlist import"

# Fix bip39.ts to use correct import path
BIP39_FILE="$WALLET_DIR/src/shared/utils/bip39.ts"
if [[ -f "$BIP39_FILE" ]]; then
    # @scure/bip39 v2.x uses different export structure
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|from '@scure/bip39/wordlists/english'|from '@scure/bip39/wordlists/english.js'|g" "$BIP39_FILE"
    else
        sed -i "s|from '@scure/bip39/wordlists/english'|from '@scure/bip39/wordlists/english.js'|g" "$BIP39_FILE"
    fi
    print_success "Fixed bip39.ts wordlist import"
fi

# ============================================
# Phase 2: Remove ALL Ledger-related code
# ============================================

print_step "Phase 2: Remove ALL Ledger-related code"

# Files with Ledger imports that need cleanup
LEDGER_CLEANUP_FILES=(
    "src/background/accounts/index.ts"
    "src/background/legacy-accounts/storage-migration.ts"
    "src/ui/index.tsx"
    "src/ui/app/index.tsx"
    "src/ui/app/ApiProvider.ts"
    "src/ui/app/hooks/useSigner.ts"
    "src/ui/app/components/AccountBadge.tsx"
    "src/ui/app/components/accounts/AccountIcon.tsx"
    "src/ui/app/helpers/accounts.ts"
    "src/ui/app/pages/accounts/AddAccountPage.tsx"
    "src/ui/app/pages/accounts/manage/AccountGroup.tsx"
)

node << 'NODEJS_LEDGER_FIX'
const fs = require('fs');
const path = require('path');

const WALLET_DIR = '/Users/changzechuan/WenchuanProjects/SuiTestProjects/rtd-typescript/rtd-apps/wallet';

// Comprehensive patterns to remove Ledger references
const ledgerPatterns = [
    // Import statements
    /^import.*LedgerAccount.*from.*['"].*['"];?\s*\n/gm,
    /^import.*LedgerSigner.*from.*['"].*['"];?\s*\n/gm,
    /^import.*[Ll]edger.*[Pp]rovider.*from.*['"].*['"];?\s*\n/gm,
    /^import.*useRtdLedgerClient.*from.*['"].*['"];?\s*\n/gm,
    /^import.*useSuiLedgerClient.*from.*['"].*['"];?\s*\n/gm,
    /^import.*ConnectLedgerModal.*from.*['"].*['"];?\s*\n/gm,
    /^import.*ImportLedgerAccountsPage.*from.*['"].*['"];?\s*\n/gm,
    /^import.*isLedgerAccountSerializedUI.*from.*['"].*['"];?\s*\n/gm,
    /^import \{ LedgerAccount \} from ['"]\.\.\/accounts\/LedgerAccount['"];?\s*\n/gm,
    /^import type \{ LedgerAccount \} from ['"].*['"];?\s*\n/gm,

    // Export statements
    /^export.*LedgerAccount.*from.*['"].*['"];?\s*\n/gm,
    /^export \* from ['"]\.\/LedgerAccount['"];?\s*\n/gm,

    // Function calls and usages
    /const rtdLedgerClient = useRtdLedgerClient\(\);?\s*\n?/g,
    /const suiLedgerClient = useSuiLedgerClient\(\);?\s*\n?/g,

    // JSX Components
    /<RtdLedgerClientProvider[^>]*>[\s\S]*?<\/RtdLedgerClientProvider>/g,
    /<SuiLedgerClientProvider[^>]*>[\s\S]*?<\/SuiLedgerClientProvider>/g,

    // Type definitions with ledger
    /ledger:\s*['"][^'"]*['"],?\s*\n?/g,

    // Conditional checks for ledger
    /if\s*\(.*isLedgerAccountSerializedUI.*\)[\s\S]*?(?=\n\s*(?:if|else|return|const|let|var|\/\/|\}|$))/gm,
    /if\s*\(.*\.type\s*===\s*['"]ledger['"].*\)[\s\S]*?(?=\n\s*(?:if|else|return|const|let|var|\/\/|\}|$))/gm,
];

// Files to process
const files = [
    'src/background/accounts/index.ts',
    'src/background/legacy-accounts/storage-migration.ts',
    'src/ui/index.tsx',
    'src/ui/app/index.tsx',
    'src/ui/app/ApiProvider.ts',
    'src/ui/app/hooks/useSigner.ts',
    'src/ui/app/components/AccountBadge.tsx',
    'src/ui/app/components/accounts/AccountIcon.tsx',
    'src/ui/app/helpers/accounts.ts',
    'src/ui/app/pages/accounts/AddAccountPage.tsx',
    'src/ui/app/pages/accounts/manage/AccountGroup.tsx',
];

console.log('Cleaning Ledger references...\n');

for (const relPath of files) {
    const fullPath = path.join(WALLET_DIR, relPath);

    if (!fs.existsSync(fullPath)) {
        console.log(`  [SKIP] ${relPath} not found`);
        continue;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;

    for (const pattern of ledgerPatterns) {
        content = content.replace(pattern, '');
    }

    // Clean up multiple empty lines
    content = content.replace(/\n{3,}/g, '\n\n');

    if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
        console.log(`  [FIXED] ${relPath}`);
    } else {
        console.log(`  [OK] ${relPath}`);
    }
}

console.log('\nLedger cleanup completed.');
NODEJS_LEDGER_FIX

print_success "Ledger code removed"

# ============================================
# Phase 3: Fix background/accounts/index.ts specifically
# ============================================

print_step "Phase 3: Fix background/accounts/index.ts"

ACCOUNTS_INDEX="$WALLET_DIR/src/background/accounts/index.ts"
if [[ -f "$ACCOUNTS_INDEX" ]]; then
    node << 'NODEJS_ACCOUNTS_FIX'
const fs = require('fs');

const filePath = '/Users/changzechuan/WenchuanProjects/SuiTestProjects/rtd-typescript/rtd-apps/wallet/src/background/accounts/index.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Remove LedgerAccount import and related code blocks
// Pattern 1: Remove the if block that checks for LedgerAccount.isOfType
content = content.replace(/\tif \(\.isOfType\(account\)\) \{\s*\n\s*return new \(\{ id: account\.id, cachedData: account \}\);\s*\n\s*\}\n/g, '');
content = content.replace(/if \(LedgerAccount\.isOfType\(account\)\) \{\s*\n\s*return new LedgerAccount\(\{ id: account\.id, cachedData: account \}\);\s*\n\s*\}\n?/g, '');

// Remove empty if statements
content = content.replace(/if\s*\(\s*\.\s*isOfType\s*\(\s*account\s*\)\s*\)\s*\{\s*\n\s*return\s+new\s+\(\s*\{\s*id:\s*account\.id,\s*cachedData:\s*account\s*\}\s*\)\s*;\s*\n\s*\}/g, '');

// Remove storesPublicKeys and publicKeysToStore references if orphaned
// Remove lines with empty class references like "return new ({ id: ..."
content = content.replace(/return new \(\{ id: account\.id, cachedData: account \}\);/g, '// Ledger account removed');

// Clean up any remaining broken syntax
content = content.replace(/if \(\.isOfType\(account\)\)/g, '// Ledger check removed');

fs.writeFileSync(filePath, content);
console.log('Fixed background/accounts/index.ts');
NODEJS_ACCOUNTS_FIX
    print_success "Fixed accounts/index.ts"
fi

# ============================================
# Phase 4: Remove Swap/DeepBook references
# ============================================

print_step "Phase 4: Remove Swap/DeepBook references"

# Fix filterAndSortTokenBalances.ts
FILTER_FILE="$WALLET_DIR/src/ui/app/helpers/filterAndSortTokenBalances.ts"
if [[ -f "$FILTER_FILE" ]]; then
    node << 'NODEJS_SWAP_FIX'
const fs = require('fs');

const filePath = '/Users/changzechuan/WenchuanProjects/SuiTestProjects/rtd-typescript/rtd-apps/wallet/src/ui/app/helpers/filterAndSortTokenBalances.ts';

if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove swap utils import
    content = content.replace(/^import.*from\s+['"]_pages\/swap\/utils['"];?\s*\n/gm, '');
    content = content.replace(/^import \{ USDC_TYPE_ARG \} from ['"]_pages\/swap\/utils['"];?\s*\n/gm, '');

    // Define USDC_TYPE_ARG locally if it was imported
    if (content.includes('USDC_TYPE_ARG') && !content.includes('const USDC_TYPE_ARG')) {
        content = "// USDC type - previously imported from swap/utils\nconst USDC_TYPE_ARG = '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN';\n\n" + content;
    }

    fs.writeFileSync(filePath, content);
    console.log('Fixed filterAndSortTokenBalances.ts');
}
NODEJS_SWAP_FIX
    print_success "Fixed filterAndSortTokenBalances.ts"
fi

# Fix UsdcPromo.tsx
USDC_PROMO="$WALLET_DIR/src/ui/app/pages/home/usdc-promo/UsdcPromo.tsx"
if [[ -f "$USDC_PROMO" ]]; then
    node << 'NODEJS_USDC_FIX'
const fs = require('fs');

const filePath = '/Users/changzechuan/WenchuanProjects/SuiTestProjects/rtd-typescript/rtd-apps/wallet/src/ui/app/pages/home/usdc-promo/UsdcPromo.tsx';

if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove swap utils import
    content = content.replace(/^import.*from\s+['"]_pages\/swap\/utils['"];?\s*\n/gm, '');

    // Add local definition
    if (content.includes('USDC_TYPE_ARG') && !content.includes('const USDC_TYPE_ARG')) {
        const insertPos = content.indexOf("import");
        const lastImportEnd = content.lastIndexOf("';") + 2;
        content = content.slice(0, lastImportEnd) + "\n\n// USDC type - previously imported from swap/utils\nconst USDC_TYPE_ARG = '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN';" + content.slice(lastImportEnd);
    }

    fs.writeFileSync(filePath, content);
    console.log('Fixed UsdcPromo.tsx');
}
NODEJS_USDC_FIX
    print_success "Fixed UsdcPromo.tsx"
fi

# ============================================
# Phase 5: Fix rtd-apps-core missing exports
# ============================================

print_step "Phase 5: Fix rtd-apps-core missing exports"

# Check if rtd-apps-core has the exports
CORE_INDEX="$CORE_DIR/src/index.ts"
if [[ -f "$CORE_INDEX" ]]; then
    # Check if exports exist
    if ! grep -q "SentryHttpTransport" "$CORE_INDEX"; then
        print_warning "SentryHttpTransport not exported from rtd-apps-core"
        print_info "Creating stub exports..."

        # Create stub exports file
        cat >> "$CORE_INDEX" << 'EOF'

// Stub exports for removed features
export class SentryHttpTransport {
    constructor(_options?: any) {}
}

export interface PersistableStorage<T = string> {
    getItem(key: string): T | null | Promise<T | null>;
    setItem(key: string, value: T): void | Promise<void>;
    removeItem(key: string): void | Promise<void>;
}
EOF
        print_success "Added stub exports to rtd-apps-core"
    fi
fi

# ============================================
# Phase 6: Fix remaining broken imports in wallet
# ============================================

print_step "Phase 6: Fix remaining broken imports"

node << 'NODEJS_FINAL_FIX'
const fs = require('fs');
const path = require('path');

const WALLET_DIR = '/Users/changzechuan/WenchuanProjects/SuiTestProjects/rtd-typescript/rtd-apps/wallet';

// Fix ui/index.tsx - remove RtdLedgerClientProvider
const uiIndex = path.join(WALLET_DIR, 'src/ui/index.tsx');
if (fs.existsSync(uiIndex)) {
    let content = fs.readFileSync(uiIndex, 'utf8');

    // Remove import
    content = content.replace(/^import.*RtdLedgerClientProvider.*from.*['"].*['"];?\s*\n/gm, '');

    // Remove JSX wrapper - need to preserve children
    content = content.replace(/<RtdLedgerClientProvider>/g, '');
    content = content.replace(/<\/RtdLedgerClientProvider>/g, '');

    fs.writeFileSync(uiIndex, content);
    console.log('Fixed src/ui/index.tsx');
}

// Fix ui/app/index.tsx - remove Ledger imports and usage
const appIndex = path.join(WALLET_DIR, 'src/ui/app/index.tsx');
if (fs.existsSync(appIndex)) {
    let content = fs.readFileSync(appIndex, 'utf8');

    // Remove imports
    content = content.replace(/^import.*LedgerAccount.*from.*['"].*['"];?\s*\n/gm, '');
    content = content.replace(/^import.*useRtdLedgerClient.*['"];?\s*\n/gm, '');

    // Remove usage
    content = content.replace(/const rtdLedgerClient = useRtdLedgerClient\(\);?\s*\n?/g, '');
    content = content.replace(/rtdLedgerClient,?\s*/g, '');

    // Fix derivationPath access - remove the whole conditional if possible
    content = content.replace(/account\.derivationPath/g, '""');

    fs.writeFileSync(appIndex, content);
    console.log('Fixed src/ui/app/index.tsx');
}

// Fix useSigner.ts
const useSigner = path.join(WALLET_DIR, 'src/ui/app/hooks/useSigner.ts');
if (fs.existsSync(useSigner)) {
    let content = fs.readFileSync(useSigner, 'utf8');

    // Remove Ledger imports
    content = content.replace(/^import.*LedgerSigner.*from.*['"].*['"];?\s*\n/gm, '');
    content = content.replace(/^import.*useRtdLedgerClient.*from.*['"].*['"];?\s*\n/gm, '');
    content = content.replace(/^import.*isLedgerAccountSerializedUI.*from.*['"].*['"];?\s*\n/gm, '');

    // Remove Ledger client usage
    content = content.replace(/const rtdLedgerClient = useRtdLedgerClient\(\);?\s*\n?/g, '');

    // Remove Ledger signer block
    content = content.replace(/if\s*\(isLedgerAccountSerializedUI\(account\)\)\s*\{[\s\S]*?return new LedgerSigner[\s\S]*?\}\s*\n?/g, '');

    fs.writeFileSync(useSigner, content);
    console.log('Fixed src/ui/app/hooks/useSigner.ts');
}

// Fix storage-migration.ts - remove LedgerAccount import
const storageMigration = path.join(WALLET_DIR, 'src/background/legacy-accounts/storage-migration.ts');
if (fs.existsSync(storageMigration)) {
    let content = fs.readFileSync(storageMigration, 'utf8');

    // Remove LedgerAccount import
    content = content.replace(/^import.*LedgerAccount.*from.*['"].*['"];?\s*\n/gm, '');
    content = content.replace(/^import type.*LedgerAccount.*from.*['"].*['"];?\s*\n/gm, '');

    // Remove LedgerAccount from type unions
    content = content.replace(/\|\s*typeof LedgerAccount/g, '');
    content = content.replace(/typeof LedgerAccount\s*\|/g, '');
    content = content.replace(/,?\s*LedgerAccount/g, '');
    content = content.replace(/LedgerAccount,?\s*/g, '');

    fs.writeFileSync(storageMigration, content);
    console.log('Fixed src/background/legacy-accounts/storage-migration.ts');
}

// Fix AddAccountPage.tsx
const addAccountPage = path.join(WALLET_DIR, 'src/ui/app/pages/accounts/AddAccountPage.tsx');
if (fs.existsSync(addAccountPage)) {
    let content = fs.readFileSync(addAccountPage, 'utf8');

    // Remove ConnectLedgerModal import
    content = content.replace(/^import.*ConnectLedgerModal.*from.*['"].*['"];?\s*\n/gm, '');

    // Remove ConnectLedgerModal usage
    content = content.replace(/<ConnectLedgerModal[^>]*\/>/g, '');
    content = content.replace(/<ConnectLedgerModal[^>]*>[\s\S]*?<\/ConnectLedgerModal>/g, '');

    fs.writeFileSync(addAccountPage, content);
    console.log('Fixed AddAccountPage.tsx');
}

console.log('\nAll remaining imports fixed.');
NODEJS_FINAL_FIX

print_success "Remaining imports fixed"

# ============================================
# Phase 7: Lock @scure/bip39 version
# ============================================

print_step "Phase 7: Lock @scure/bip39 version"

# Fix @scure/bip39 version in package.json
PACKAGE_JSON="$WALLET_DIR/package.json"
if [[ -f "$PACKAGE_JSON" ]]; then
    node << 'NODEJS_BIP39_FIX'
const fs = require('fs');

const pkgPath = '/Users/changzechuan/WenchuanProjects/SuiTestProjects/rtd-typescript/rtd-apps/wallet/package.json';
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

// Lock @scure/bip39 to version that has wordlists export
if (pkg.dependencies && pkg.dependencies['@scure/bip39']) {
    pkg.dependencies['@scure/bip39'] = '1.4.0';
    console.log('Locked @scure/bip39 to 1.4.0');
}

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, '\t') + '\n');
NODEJS_BIP39_FIX
    print_success "Locked @scure/bip39 version"
fi

# ============================================
# Summary
# ============================================

print_step "Summary"

echo "Fixed issues:"
echo "  1. @scure/bip39 wordlist import path"
echo "  2. Removed Ledger-related code and imports"
echo "  3. Fixed background/accounts/index.ts syntax"
echo "  4. Removed Swap/DeepBook references"
echo "  5. Added stub exports to rtd-apps-core"
echo "  6. Fixed remaining broken imports"
echo "  7. Locked @scure/bip39 version"
echo ""
echo "Next steps:"
echo "  1. Run 'pnpm install' to update dependencies"
echo "  2. Run 'pnpm build' to verify fixes"

print_success "Step 7 completed: Wallet build errors fixed!"
