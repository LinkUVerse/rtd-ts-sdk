#!/bin/bash
# 03-update-deps.sh - Update package dependencies and configurations
# Copyright (c) LinkU Labs. All rights reserved.
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"
source "$SCRIPT_DIR/utils.sh"

log_step "Step 3: Update Dependencies"

# ============================================
# Validation
# ============================================

if [[ ! -d "$TARGET_ROOT" ]]; then
    die "Target directory not found: $TARGET_ROOT"
fi

cd "$TARGET_ROOT"

# Check if node is available
if ! check_command "node"; then
    log_warn "Node.js not found, using sed for JSON updates (less safe)"
    USE_NODE=false
else
    USE_NODE=true
fi

# ============================================
# Update Root package.json
# ============================================

log_info "Updating root package.json..."

if [[ "$USE_NODE" == "true" && -f "package.json" ]]; then
    node << 'NODEJS_SCRIPT'
const fs = require('fs');
const pkgPath = './package.json';
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

// Update package name
pkg.name = '@linku/ts-sdks';

// Update scripts that reference @mysten
if (pkg.scripts) {
    for (const [key, value] of Object.entries(pkg.scripts)) {
        if (typeof value === 'string') {
            pkg.scripts[key] = value
                .replace(/@mysten\//g, '@linku/')
                .replace(/sui/g, 'rtd');
        }
    }
}

// Update pnpm overrides if present
if (pkg.pnpm && pkg.pnpm.overrides) {
    const newOverrides = {};
    for (const [key, value] of Object.entries(pkg.pnpm.overrides)) {
        const newKey = key.replace(/@mysten\//g, '@linku/');
        newOverrides[newKey] = value;
    }
    pkg.pnpm.overrides = newOverrides;
}

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, '\t') + '\n');
console.log('Updated root package.json');
NODEJS_SCRIPT
fi

# ============================================
# Update Each Package's package.json
# ============================================

log_info "Updating package dependencies..."

for pkg_dir in packages/*/; do
    pkg_file="${pkg_dir}package.json"

    if [[ -f "$pkg_file" && "$USE_NODE" == "true" ]]; then
        pkg_name=$(basename "$pkg_dir")
        log_info "  Processing: $pkg_name"

        node << NODEJS_SCRIPT
const fs = require('fs');
const pkgPath = '${pkg_file}';
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

// Package name mapping
const nameMap = {
    '@mysten/sui': '@linku/rtd',
    '@mysten/bcs': '@linku/bcs',
    '@mysten/utils': '@linku/utils',
    '@mysten/build-scripts': '@linku/build-scripts',
    '@mysten/ts-sdks': '@linku/ts-sdks'
};

// Update package name
if (nameMap[pkg.name]) {
    pkg.name = nameMap[pkg.name];
} else if (pkg.name && pkg.name.startsWith('@mysten/')) {
    pkg.name = pkg.name.replace('@mysten/', '@linku/');
}

// Function to update dependencies object
const updateDeps = (deps) => {
    if (!deps) return deps;
    const newDeps = {};
    for (const [name, version] of Object.entries(deps)) {
        let newName = nameMap[name] || name;
        if (newName.startsWith('@mysten/')) {
            newName = newName.replace('@mysten/', '@linku/');
        }
        newDeps[newName] = version;
    }
    return newDeps;
};

pkg.dependencies = updateDeps(pkg.dependencies);
pkg.devDependencies = updateDeps(pkg.devDependencies);
pkg.peerDependencies = updateDeps(pkg.peerDependencies);
pkg.optionalDependencies = updateDeps(pkg.optionalDependencies);

// Update repository URL
if (pkg.repository && pkg.repository.url) {
    pkg.repository.url = pkg.repository.url
        .replace('MystenLabs', 'LinkUVerse')
        .replace('ts-sdks', 'rtd-ts-sdk');
}

// Update bugs URL
if (pkg.bugs && pkg.bugs.url) {
    pkg.bugs.url = pkg.bugs.url
        .replace('MystenLabs', 'LinkUVerse')
        .replace('ts-sdks', 'rtd-ts-sdk');
}

// Update homepage
if (pkg.homepage) {
    pkg.homepage = pkg.homepage
        .replace('MystenLabs', 'LinkUVerse')
        .replace('mystenlabs.com', 'linkuverse.com')
        .replace('/sui', '/rtd');
}

// Update author
if (pkg.author) {
    if (typeof pkg.author === 'string') {
        pkg.author = pkg.author
            .replace('Mysten Labs', 'LinkU Labs')
            .replace('mystenlabs.com', 'linkuverse.com');
    } else if (typeof pkg.author === 'object') {
        if (pkg.author.name) {
            pkg.author.name = pkg.author.name.replace('Mysten Labs', 'LinkU Labs');
        }
        if (pkg.author.email) {
            pkg.author.email = pkg.author.email.replace('mystenlabs.com', 'linkuverse.com');
        }
    }
}

// Update description
if (pkg.description) {
    pkg.description = pkg.description
        .replace(/Sui/g, 'Rtd')
        .replace(/@mysten/g, '@linku');
}

// Update keywords
if (pkg.keywords && Array.isArray(pkg.keywords)) {
    pkg.keywords = pkg.keywords.map(kw =>
        kw.toLowerCase() === 'sui' ? 'rtd' : kw
    );
}

// Update exports if they reference sui paths
if (pkg.exports) {
    const updateExports = (exports) => {
        if (typeof exports === 'string') {
            return exports;
        }
        if (typeof exports === 'object') {
            const newExports = {};
            for (const [key, value] of Object.entries(exports)) {
                const newKey = key; // Keep export paths as is
                newExports[newKey] = updateExports(value);
            }
            return newExports;
        }
        return exports;
    };
    pkg.exports = updateExports(pkg.exports);
}

// Update size-limit if present
if (pkg['size-limit'] && Array.isArray(pkg['size-limit'])) {
    pkg['size-limit'] = pkg['size-limit'].map(item => {
        if (item.path) {
            item.path = item.path.replace(/sui/g, 'rtd');
        }
        return item;
    });
}

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, '\t') + '\n');
console.log('  Updated: ${pkg_file}');
NODEJS_SCRIPT
    fi
done

# ============================================
# Update pnpm-workspace.yaml
# ============================================

log_info "Checking pnpm-workspace.yaml..."
# Usually doesn't need changes since it uses relative paths

# ============================================
# Update turbo.json
# ============================================

log_info "Checking turbo.json..."
# Usually doesn't need changes

# ============================================
# Update .changeset/config.json
# ============================================

log_info "Updating .changeset/config.json..."

if [[ -f ".changeset/config.json" && "$USE_NODE" == "true" ]]; then
    node << 'NODEJS_SCRIPT'
const fs = require('fs');
const configPath = '.changeset/config.json';

if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    // Update ignore list
    if (config.ignore && Array.isArray(config.ignore)) {
        config.ignore = config.ignore.map(name =>
            name.replace('@mysten/', '@linku/')
        );
    }

    // Update linked if present
    if (config.linked && Array.isArray(config.linked)) {
        config.linked = config.linked.map(group => {
            if (Array.isArray(group)) {
                return group.map(name => name.replace('@mysten/', '@linku/'));
            }
            return group;
        });
    }

    fs.writeFileSync(configPath, JSON.stringify(config, null, '\t') + '\n');
    console.log('Updated .changeset/config.json');
}
NODEJS_SCRIPT
fi

# ============================================
# Update TypeScript References
# ============================================

log_info "Checking TypeScript configs..."

# tsconfig.json files usually use relative paths, but check for any @mysten references
find . -name "tsconfig*.json" -not -path "*/node_modules/*" 2>/dev/null | while read -r tsconfig; do
    if grep -q "@mysten" "$tsconfig" 2>/dev/null; then
        log_info "  Updating: $tsconfig"
        safe_sed_replace "@mysten/" "@linku/" "$tsconfig"
    fi
done

# ============================================
# Update vitest configs
# ============================================

log_info "Checking vitest configs..."

find . -name "vitest*.ts" -o -name "vitest*.mts" -not -path "*/node_modules/*" 2>/dev/null | while read -r vitestconfig; do
    if grep -q "@mysten" "$vitestconfig" 2>/dev/null; then
        log_info "  Updating: $vitestconfig"
        safe_sed_replace "@mysten/" "@linku/" "$vitestconfig"
    fi
done

# ============================================
# Update any .env.example files
# ============================================

log_info "Checking .env files..."

find . -name ".env*" -not -path "*/node_modules/*" 2>/dev/null | while read -r envfile; do
    if grep -q "sui" "$envfile" 2>/dev/null; then
        log_info "  Updating: $envfile"
        safe_sed_replace "sui" "rtd" "$envfile"
        safe_sed_replace "SUI" "RTD" "$envfile"
    fi
done

# ============================================
# Validate JSON Files
# ============================================

log_info "Validating JSON files..."

validation_errors=0
find . -name "package.json" -not -path "*/node_modules/*" 2>/dev/null | while read -r json_file; do
    if ! validate_json "$json_file"; then
        log_error "Invalid JSON: $json_file"
        ((validation_errors++))
    fi
done

if [[ $validation_errors -gt 0 ]]; then
    log_warn "Found $validation_errors JSON validation errors"
fi

# ============================================
# Summary
# ============================================

log_step "Dependency Update Complete"

log_success "All package.json files updated"
log_success "Workspace configuration updated"

echo ""
log_info "Next step: Run ./04-validate.sh to validate the fork"
