#!/bin/bash
# 20-copy-apps.sh - Copy Sui apps to RTD apps directory
# Copyright (c) LinkU Labs. All rights reserved.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config-apps.sh"

print_step "Step 1: Copy Apps Source Code"

# ============================================
# Check source directory exists
# ============================================

if [[ ! -d "$APPS_SOURCE" ]]; then
    print_error "Source directory does not exist: $APPS_SOURCE"
    exit 1
fi

print_info "Source: $APPS_SOURCE"
print_info "Target: $APPS_TARGET"

# ============================================
# Create target directory
# ============================================

if [[ -d "$APPS_TARGET" ]]; then
    print_warning "Target directory already exists: $APPS_TARGET"
    read -p "Do you want to remove it and start fresh? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Removing existing target directory..."
        rm -rf "$APPS_TARGET"
    else
        print_error "Aborting. Please remove or rename the existing directory."
        exit 1
    fi
fi

print_info "Creating target directory..."
mkdir -p "$APPS_TARGET"

# ============================================
# Copy each app
# ============================================

print_step "Copying Apps"

for app in "${APPS_TO_COPY[@]}"; do
    if [[ -d "$APPS_SOURCE/$app" ]]; then
        print_info "Copying $app..."
        cp -r "$APPS_SOURCE/$app" "$APPS_TARGET/"
        print_success "Copied $app"
    else
        print_warning "App directory not found: $APPS_SOURCE/$app"
    fi
done

# ============================================
# Copy root workspace files
# ============================================

print_step "Copying Workspace Files"

for file in "${WORKSPACE_FILES[@]}"; do
    if [[ -f "$APPS_SOURCE/$file" ]]; then
        print_info "Copying $file..."
        cp "$APPS_SOURCE/$file" "$APPS_TARGET/"
        print_success "Copied $file"
    else
        print_warning "Workspace file not found: $APPS_SOURCE/$file"
    fi
done

# Also copy any dotfiles that might be needed
for dotfile in "$APPS_SOURCE"/.*; do
    if [[ -f "$dotfile" ]]; then
        filename=$(basename "$dotfile")
        # Skip .git and other special directories
        if [[ "$filename" != "." && "$filename" != ".." && "$filename" != ".git" ]]; then
            cp "$dotfile" "$APPS_TARGET/" 2>/dev/null || true
        fi
    fi
done

# ============================================
# Clean build artifacts
# ============================================

print_step "Cleaning Build Artifacts"

for app in "${APPS_TO_COPY[@]}"; do
    if [[ -d "$APPS_TARGET/$app" ]]; then
        for dir in "${CLEAN_DIRS[@]}"; do
            if [[ -d "$APPS_TARGET/$app/$dir" ]]; then
                print_info "Removing $app/$dir..."
                rm -rf "$APPS_TARGET/$app/$dir"
            fi
        done
    fi
done

# Clean root level artifacts
for dir in "${CLEAN_DIRS[@]}"; do
    if [[ -d "$APPS_TARGET/$dir" ]]; then
        print_info "Removing root $dir..."
        rm -rf "$APPS_TARGET/$dir"
    fi
done

# ============================================
# Summary
# ============================================

print_step "Copy Summary"

echo ""
echo "Apps copied:"
for app in "${APPS_TO_COPY[@]}"; do
    if [[ -d "$APPS_TARGET/$app" ]]; then
        file_count=$(find "$APPS_TARGET/$app" -type f | wc -l | tr -d ' ')
        echo "  - $app ($file_count files)"
    fi
done

total_files=$(find "$APPS_TARGET" -type f | wc -l | tr -d ' ')
echo ""
echo "Total files: $total_files"
echo "Target directory: $APPS_TARGET"

print_success "Step 1 completed: Apps copied successfully!"
