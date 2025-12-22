#!/bin/bash
# 10-copy-new-packages.sh - Copy new packages from Sui SDK to RTD SDK
# Copyright (c) LinkU Labs. All rights reserved.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../utils.sh"
source "$SCRIPT_DIR/config-v2.sh"

log_step "Copying New Packages"

# Verify source directory exists
if [[ ! -d "$SOURCE_ROOT" ]]; then
    die "Source directory not found: $SOURCE_ROOT"
fi

# Verify target directory exists
if [[ ! -d "$TARGET_ROOT" ]]; then
    die "Target directory not found: $TARGET_ROOT"
fi

# Copy each package
for pkg in "${NEW_PACKAGES[@]}"; do
    pkg_name=$(basename "$pkg")
    source_path="$SOURCE_ROOT/$pkg"
    target_path="$TARGET_ROOT/$pkg"

    if [[ -d "$source_path" ]]; then
        log_info "Copying $pkg_name..."

        # Remove existing target if exists
        if [[ -d "$target_path" ]]; then
            log_warn "Target exists, removing: $target_path"
            rm -rf "$target_path"
        fi

        # Create parent directory
        mkdir -p "$(dirname "$target_path")"

        # Copy package
        cp -r "$source_path" "$target_path"

        # Clean up unnecessary files
        rm -rf "$target_path/node_modules" 2>/dev/null || true
        rm -rf "$target_path/dist" 2>/dev/null || true
        rm -rf "$target_path/.turbo" 2>/dev/null || true
        rm -rf "$target_path/coverage" 2>/dev/null || true
        rm -f "$target_path/tsconfig.tsbuildinfo" 2>/dev/null || true

        # Count files copied
        file_count=$(find "$target_path" -type f | wc -l | tr -d ' ')
        log_success "Copied $pkg_name ($file_count files)"
    else
        log_warn "Source package not found: $source_path"
    fi
done

log_step "Copy Complete"

# Summary
echo ""
echo "Packages copied to: $TARGET_ROOT/packages/"
for pkg in "${NEW_PACKAGES[@]}"; do
    pkg_name=$(basename "$pkg")
    if [[ -d "$TARGET_ROOT/$pkg" ]]; then
        echo "  ✓ $pkg_name"
    else
        echo "  ✗ $pkg_name (not copied)"
    fi
done
