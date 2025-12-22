#!/bin/bash
# 14-update-deps-v2.sh - Update dependencies for new packages
# Copyright (c) LinkU Labs. All rights reserved.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../utils.sh"
source "$SCRIPT_DIR/config-v2.sh"

log_step "Updating New Package Dependencies"

cd "$TARGET_ROOT"

# Process each new package
for pkg in "${NEW_PACKAGES[@]}"; do
    pkg_file="$pkg/package.json"

    if [[ -f "$pkg_file" ]]; then
        pkg_name=$(basename "$pkg")
        log_info "Processing: $pkg_name"

        # Use node with -e to avoid heredoc variable expansion issues
        node -e "
const fs = require('fs');

const pkgFile = '$pkg_file';

try {
    const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'));

    // Package name mapping
    const nameMap = {
        '@mysten/sui': 'rtd-typescript',
        '@mysten/bcs': 'rtd-bcs',
        '@mysten/utils': 'rtd-utils',
        '@mysten/build-scripts': 'rtd-build-scripts',
        '@mysten/kiosk': 'rtd-kiosk',
        '@mysten/wallet-standard': 'rtd-wallet-standard',
        '@mysten/window-wallet-core': 'rtd-window-wallet-core',
        '@mysten/slush-wallet': 'rtd-slush-wallet',
        '@mysten/dapp-kit': 'rtd-dapp-kit'
    };

    // Update package name
    if (nameMap[pkg.name]) {
        console.log('  Package name: ' + pkg.name + ' -> ' + nameMap[pkg.name]);
        pkg.name = nameMap[pkg.name];
    } else if (pkg.name && pkg.name.startsWith('@mysten/')) {
        const newName = 'rtd-' + pkg.name.replace('@mysten/', '');
        console.log('  Package name: ' + pkg.name + ' -> ' + newName);
        pkg.name = newName;
    }

    // Update dependencies helper
    const updateDeps = (deps, depType) => {
        if (!deps) return deps;
        const newDeps = {};
        for (const [name, version] of Object.entries(deps)) {
            let newName = nameMap[name] || name;
            if (newName === name && name.startsWith('@mysten/')) {
                newName = 'rtd-' + name.replace('@mysten/', '');
            }
            if (newName !== name) {
                console.log('  ' + depType + ': ' + name + ' -> ' + newName);
            }
            newDeps[newName] = version;
        }
        return newDeps;
    };

    // Update all dependency types
    pkg.dependencies = updateDeps(pkg.dependencies, 'dependencies');
    pkg.devDependencies = updateDeps(pkg.devDependencies, 'devDependencies');
    pkg.peerDependencies = updateDeps(pkg.peerDependencies, 'peerDependencies');

    // Update repository URL
    if (pkg.repository && pkg.repository.url) {
        pkg.repository.url = pkg.repository.url
            .replace('MystenLabs', 'LinkUVerse')
            .replace('mystenlabs', 'linkuverse')
            .replace('ts-sdks', 'rtd-ts-sdk');
    }

    // Update bugs URL
    if (pkg.bugs && pkg.bugs.url) {
        pkg.bugs.url = pkg.bugs.url
            .replace('MystenLabs', 'LinkUVerse')
            .replace('mystenlabs', 'linkuverse')
            .replace('ts-sdks', 'rtd-ts-sdk');
    }

    // Update homepage
    if (pkg.homepage) {
        pkg.homepage = pkg.homepage
            .replace('MystenLabs', 'LinkUVerse')
            .replace('mystenlabs.com', 'linkuverse.com')
            .replace('ts-sdks', 'rtd-ts-sdk')
            .replace('/sui', '/rtd');
    }

    // Update author
    if (typeof pkg.author === 'string') {
        pkg.author = pkg.author
            .replace('Mysten Labs', 'LinkU Labs')
            .replace('mystenlabs.com', 'linkuverse.com');
    } else if (pkg.author && typeof pkg.author === 'object') {
        if (pkg.author.name) {
            pkg.author.name = pkg.author.name.replace('Mysten Labs', 'LinkU Labs');
        }
        if (pkg.author.email) {
            pkg.author.email = pkg.author.email.replace('mystenlabs.com', 'linkuverse.com');
        }
    }

    // Update description
    if (pkg.description) {
        pkg.description = pkg.description
            .replace(/Sui/g, 'Rtd')
            .replace(/SUI/g, 'RTD')
            .replace(/@mysten/g, 'rtd');
    }

    // Write back
    fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, '\t') + '\n');
    console.log('  ✓ Updated: ' + pkgFile);

} catch (error) {
    console.error('Error processing ' + pkgFile + ': ' + error.message);
    process.exit(1);
}
"

        log_success "Updated $pkg_name"
    else
        log_warn "Package.json not found: $pkg_file"
    fi
done

# ============================================
# Update root package.json if needed
# ============================================
log_info "Checking root package.json for workspace references..."

ROOT_PKG="$TARGET_ROOT/package.json"
if [[ -f "$ROOT_PKG" ]]; then
    # Verify pnpm-workspace.yaml includes packages/*
    WORKSPACE_YAML="$TARGET_ROOT/pnpm-workspace.yaml"
    if [[ -f "$WORKSPACE_YAML" ]]; then
        if grep -q "packages/\*" "$WORKSPACE_YAML"; then
            log_success "Workspace configuration is correct (packages/* pattern)"
        else
            log_warn "pnpm-workspace.yaml may need updating to include new packages"
        fi
    fi
fi

log_step "Dependency Update Complete"

# Summary
echo ""
echo "Updated packages:"
for pkg in "${NEW_PACKAGES[@]}"; do
    pkg_name=$(basename "$pkg")
    if [[ -f "$pkg/package.json" ]]; then
        # Get the new package name from the file
        new_name=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$pkg/package.json', 'utf8')).name)")
        echo "  ✓ $pkg_name -> $new_name"
    fi
done
