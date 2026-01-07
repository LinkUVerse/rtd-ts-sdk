#!/bin/bash
# 24-update-apps-deps.sh - Update package.json dependencies for all apps
# Copyright (c) LinkU Labs. All rights reserved.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config-apps.sh"

print_step "Step 5: Update Dependencies"

# ============================================
# Check target directory exists
# ============================================

if [[ ! -d "$APPS_TARGET" ]]; then
    print_error "Target directory does not exist: $APPS_TARGET"
    exit 1
fi

print_info "Target directory: $APPS_TARGET"

# ============================================
# Find all package.json files
# ============================================

print_step "Finding package.json files"

package_files=$(find "$APPS_TARGET" -name "package.json" -not -path "*/node_modules/*" -not -path "*/.git/*")

echo "Found package.json files:"
echo "$package_files" | while read -r file; do
    echo "  - $file"
done

# ============================================
# Update each package.json using Node.js
# ============================================

print_step "Updating package.json files"

node << 'NODEJS_DEPS'
const fs = require('fs');
const path = require('path');

const APPS_TARGET = process.env.APPS_TARGET || '/Users/changzechuan/WenchuanProjects/SuiTestProjects/rtd-typescript/rtd-apps';

// Package name mapping
const nameMap = {
    // NPM dependencies
    '@mysten/sui': 'rtd-typescript',
    '@mysten/bcs': 'rtd-bcs',
    '@mysten/utils': 'rtd-utils',
    '@mysten/kiosk': 'rtd-kiosk',
    '@mysten/wallet-standard': 'rtd-wallet-standard',
    '@mysten/dapp-kit': 'rtd-dapp-kit',
    '@mysten/core': 'rtd-core',
    '@mysten/icons': 'rtd-icons',
    '@mysten/build-scripts': 'rtd-build-scripts',
    // App package names
    'sui-wallet': 'rtd-wallet',
    'sui-explorer': 'rtd-explorer',
    'sui-apps-workspace': 'rtd-apps-workspace',
};

// Organization replacements
const orgReplacements = {
    'MystenLabs': 'LinkUVerse',
    'Mysten Labs': 'LinkU Labs',
    'mystenlabs.com': 'linkuverse.com',
    'build@mystenlabs.com': 'build@linkuverse.com',
    'github.com:MystenLabs/sui.git': 'github.com:LinkUVerse/rtd.git',
};

// Update dependencies object
function updateDeps(deps) {
    if (!deps) return deps;

    const newDeps = {};
    for (const [name, version] of Object.entries(deps)) {
        const newName = nameMap[name] || name;
        newDeps[newName] = version;
    }
    return newDeps;
}

// Process a single package.json
function processPackageJson(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    let pkg;

    try {
        pkg = JSON.parse(content);
    } catch (e) {
        console.log(`  [ERROR] Invalid JSON: ${filePath}`);
        return false;
    }

    let modified = false;

    // Update package name
    if (pkg.name && nameMap[pkg.name]) {
        console.log(`  Renaming: ${pkg.name} -> ${nameMap[pkg.name]}`);
        pkg.name = nameMap[pkg.name];
        modified = true;
    }

    // Update dependencies
    if (pkg.dependencies) {
        const oldDeps = JSON.stringify(pkg.dependencies);
        pkg.dependencies = updateDeps(pkg.dependencies);
        if (JSON.stringify(pkg.dependencies) !== oldDeps) {
            modified = true;
        }
    }

    // Update devDependencies
    if (pkg.devDependencies) {
        const oldDeps = JSON.stringify(pkg.devDependencies);
        pkg.devDependencies = updateDeps(pkg.devDependencies);
        if (JSON.stringify(pkg.devDependencies) !== oldDeps) {
            modified = true;
        }
    }

    // Update peerDependencies
    if (pkg.peerDependencies) {
        const oldDeps = JSON.stringify(pkg.peerDependencies);
        pkg.peerDependencies = updateDeps(pkg.peerDependencies);
        if (JSON.stringify(pkg.peerDependencies) !== oldDeps) {
            modified = true;
        }
    }

    // Update optionalDependencies
    if (pkg.optionalDependencies) {
        const oldDeps = JSON.stringify(pkg.optionalDependencies);
        pkg.optionalDependencies = updateDeps(pkg.optionalDependencies);
        if (JSON.stringify(pkg.optionalDependencies) !== oldDeps) {
            modified = true;
        }
    }

    // Update repository URL
    if (pkg.repository) {
        const repoStr = JSON.stringify(pkg.repository);
        for (const [old, newVal] of Object.entries(orgReplacements)) {
            if (repoStr.includes(old)) {
                if (typeof pkg.repository === 'string') {
                    pkg.repository = pkg.repository.replace(old, newVal);
                } else if (pkg.repository.url) {
                    pkg.repository.url = pkg.repository.url.replace(old, newVal);
                }
                modified = true;
            }
        }
    }

    // Update author
    if (pkg.author) {
        const authorStr = typeof pkg.author === 'string' ? pkg.author : JSON.stringify(pkg.author);
        for (const [old, newVal] of Object.entries(orgReplacements)) {
            if (authorStr.includes(old)) {
                if (typeof pkg.author === 'string') {
                    pkg.author = pkg.author.replace(new RegExp(old, 'g'), newVal);
                } else if (pkg.author.name) {
                    pkg.author.name = pkg.author.name.replace(new RegExp(old, 'g'), newVal);
                }
                if (pkg.author.email) {
                    pkg.author.email = pkg.author.email.replace(new RegExp(old, 'g'), newVal);
                }
                modified = true;
            }
        }
    }

    // Update description
    if (pkg.description) {
        let newDesc = pkg.description;
        newDesc = newDesc.replace(/Sui/g, 'Rtd');
        newDesc = newDesc.replace(/SUI/g, 'RTD');
        if (newDesc !== pkg.description) {
            pkg.description = newDesc;
            modified = true;
        }
    }

    // Update keywords
    if (pkg.keywords && Array.isArray(pkg.keywords)) {
        const newKeywords = pkg.keywords.map(kw => {
            if (kw === 'sui') return 'rtd';
            if (kw === 'Sui') return 'Rtd';
            if (kw === 'SUI') return 'RTD';
            return kw;
        });
        if (JSON.stringify(newKeywords) !== JSON.stringify(pkg.keywords)) {
            pkg.keywords = newKeywords;
            modified = true;
        }
    }

    // Write back if modified
    if (modified) {
        fs.writeFileSync(filePath, JSON.stringify(pkg, null, '\t') + '\n');
        return true;
    }

    return false;
}

// Find and process all package.json files
function findPackageJsonFiles(dir) {
    const files = [];

    function walk(currentDir) {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);

            if (entry.isDirectory()) {
                if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'dist') {
                    walk(fullPath);
                }
            } else if (entry.name === 'package.json') {
                files.push(fullPath);
            }
        }
    }

    walk(dir);
    return files;
}

// Main
console.log('Updating package.json files...\n');

const packageFiles = findPackageJsonFiles(APPS_TARGET);
let updatedCount = 0;

for (const file of packageFiles) {
    const relativePath = path.relative(APPS_TARGET, file);
    const updated = processPackageJson(file);

    if (updated) {
        console.log(`[UPDATED] ${relativePath}`);
        updatedCount++;
    } else {
        console.log(`[OK] ${relativePath}`);
    }
}

console.log(`\nTotal: ${packageFiles.length} files processed, ${updatedCount} updated`);
NODEJS_DEPS

print_success "package.json files updated"

# ============================================
# Update pnpm-workspace.yaml
# ============================================

print_step "Updating pnpm-workspace.yaml"

WORKSPACE_YAML="$APPS_TARGET/pnpm-workspace.yaml"

if [[ -f "$WORKSPACE_YAML" ]]; then
    print_info "Updating workspace configuration..."

    # Replace sui-explorer with rtd-explorer in workspace config
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' 's/sui-explorer/rtd-explorer/g' "$WORKSPACE_YAML"
    else
        sed -i 's/sui-explorer/rtd-explorer/g' "$WORKSPACE_YAML"
    fi

    print_success "pnpm-workspace.yaml updated"
else
    print_warning "pnpm-workspace.yaml not found"
fi

# ============================================
# Update turbo.json
# ============================================

print_step "Updating turbo.json"

TURBO_JSON="$APPS_TARGET/turbo.json"

if [[ -f "$TURBO_JSON" ]]; then
    print_info "Updating turbo configuration..."

    node -e "
const fs = require('fs');
const path = '$TURBO_JSON';
let content = fs.readFileSync(path, 'utf8');

// Replace sui references
content = content.replace(/sui-wallet/g, 'rtd-wallet');
content = content.replace(/sui-explorer/g, 'rtd-explorer');
content = content.replace(/@mysten\/core/g, 'rtd-core');
content = content.replace(/@mysten\/icons/g, 'rtd-icons');

fs.writeFileSync(path, content);
console.log('turbo.json updated');
"

    print_success "turbo.json updated"
else
    print_warning "turbo.json not found"
fi

# ============================================
# Summary
# ============================================

print_step "Dependencies Update Summary"

echo ""
echo "Updated files:"
echo "  - All package.json files"
echo "  - pnpm-workspace.yaml"
echo "  - turbo.json"
echo ""

# Verify no @mysten references in package.json files
mysten_in_pkg=$(find "$APPS_TARGET" -name "package.json" -not -path "*/node_modules/*" -exec grep -l "@mysten" {} \; 2>/dev/null | wc -l | tr -d ' ')
echo "Remaining @mysten in package.json: $mysten_in_pkg"

print_success "Step 5 completed: Dependencies updated!"
