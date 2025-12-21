#!/bin/bash
# 01-copy-sources.sh - Copy source files to target directory
# Copyright (c) LinkU Labs. All rights reserved.
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"
source "$SCRIPT_DIR/utils.sh"

log_step "Step 1: Copy Sources"

# ============================================
# Validation
# ============================================

# Check source directory exists
if [[ ! -d "$SOURCE_ROOT" ]]; then
    die "Source directory not found: $SOURCE_ROOT"
fi

log_info "Source: $SOURCE_ROOT"
log_info "Target: $TARGET_ROOT"

# ============================================
# Prepare Target Directory
# ============================================

# If target exists, ask for confirmation or create backup
if [[ -d "$TARGET_ROOT" ]]; then
    log_warn "Target directory already exists: $TARGET_ROOT"
    if [[ "${AUTO_CONFIRM:-}" == "true" ]] || [[ ! -t 0 ]]; then
        log_info "Auto-confirming removal of existing directory..."
        rm -rf "$TARGET_ROOT"
    else
        read -p "Do you want to remove it and continue? (y/N): " confirm
        if [[ "$confirm" =~ ^[Yy]$ ]]; then
            log_info "Removing existing target directory..."
            rm -rf "$TARGET_ROOT"
        else
            die "Aborted by user"
        fi
    fi
fi

# Create target directory structure
log_info "Creating target directory structure..."
mkdir -p "$TARGET_ROOT/packages"
mkdir -p "$TARGET_ROOT/fork-ts-instruct"

# ============================================
# Copy Root Configuration Files
# ============================================

log_info "Copying root configuration files..."

for file in "${ROOT_FILES[@]}"; do
    if [[ -f "$SOURCE_ROOT/$file" ]]; then
        cp "$SOURCE_ROOT/$file" "$TARGET_ROOT/$file"
        log_debug "Copied: $file"
    else
        log_warn "Required file not found: $file"
    fi
done

# Copy optional root files
for file in "${OPTIONAL_ROOT_FILES[@]}"; do
    if [[ -f "$SOURCE_ROOT/$file" ]]; then
        cp "$SOURCE_ROOT/$file" "$TARGET_ROOT/$file"
        log_debug "Copied (optional): $file"
    fi
done

# ============================================
# Copy .changeset Directory
# ============================================

if [[ -d "$SOURCE_ROOT/.changeset" ]]; then
    log_info "Copying .changeset directory..."
    cp -r "$SOURCE_ROOT/.changeset" "$TARGET_ROOT/.changeset"
fi

# ============================================
# Copy Packages
# ============================================

log_info "Copying packages..."

for pkg in "${PACKAGES[@]}"; do
    if [[ -d "$SOURCE_ROOT/$pkg" ]]; then
        pkg_name=$(basename "$pkg")
        target_pkg_dir="$TARGET_ROOT/$pkg"

        log_info "  Copying $pkg_name..."

        # Create parent directory if needed
        mkdir -p "$(dirname "$target_pkg_dir")"

        # Copy the package
        cp -r "$SOURCE_ROOT/$pkg" "$target_pkg_dir"

        # Clean up unwanted directories
        rm -rf "$target_pkg_dir/node_modules" 2>/dev/null || true
        rm -rf "$target_pkg_dir/dist" 2>/dev/null || true
        rm -rf "$target_pkg_dir/.turbo" 2>/dev/null || true
        rm -rf "$target_pkg_dir/coverage" 2>/dev/null || true

        # Count files
        file_count=$(find "$target_pkg_dir" -type f | wc -l | tr -d ' ')
        log_info "    -> $file_count files copied"
    else
        die "Package not found: $pkg"
    fi
done

# ============================================
# Copy Fork Scripts to Target
# ============================================

log_info "Copying fork scripts to target..."
cp "$SCRIPT_DIR"/*.sh "$TARGET_ROOT/fork-ts-instruct/"
chmod +x "$TARGET_ROOT/fork-ts-instruct/"*.sh

# ============================================
# Generate File Manifest
# ============================================

log_info "Generating file manifest..."
MANIFEST_FILE="$TARGET_ROOT/fork-ts-instruct/.file-manifest-original.txt"
find "$TARGET_ROOT" -type f -not -path "*/fork-ts-instruct/*" | sort > "$MANIFEST_FILE"
total_files=$(wc -l < "$MANIFEST_FILE" | tr -d ' ')

# ============================================
# Summary
# ============================================

log_step "Copy Complete"
log_success "Target directory: $TARGET_ROOT"
log_success "Total files copied: $total_files"
log_success "Packages copied: ${#PACKAGES[@]}"

echo ""
log_info "Next step: Run ./02-brand-rename.sh to perform brand replacements"
