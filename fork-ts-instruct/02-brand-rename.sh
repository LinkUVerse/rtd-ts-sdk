#!/bin/bash
# 02-brand-rename.sh - Perform brand renaming
# Copyright (c) LinkU Labs. All rights reserved.
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"
source "$SCRIPT_DIR/utils.sh"

log_step "Step 2: Brand Rename"

# ============================================
# Validation
# ============================================

if [[ ! -d "$TARGET_ROOT" ]]; then
    die "Target directory not found: $TARGET_ROOT. Run 01-copy-sources.sh first."
fi

cd "$TARGET_ROOT"

# Create replacement log
REPLACE_LOG="$TARGET_ROOT/fork-ts-instruct/.replace-log.txt"
echo "Replacement Log - $(date)" > "$REPLACE_LOG"
echo "========================================" >> "$REPLACE_LOG"

# ============================================
# Phase 1: NPM Package Names (Highest Priority)
# ============================================

log_info "Phase 1: Replacing NPM package names..."

# Replace in order from config arrays
for i in "${!NPM_OLD_NAMES[@]}"; do
    old_name="${NPM_OLD_NAMES[$i]}"
    new_name="${NPM_NEW_NAMES[$i]}"

    log_info "  $old_name -> $new_name"
    find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.mjs" -o -name "*.json" -o -name "*.md" \) \
        -not -path "*/node_modules/*" -not -path "*/.git/*" \
        -exec grep -l "$old_name" {} \; 2>/dev/null | while read -r file; do
        safe_sed_replace "$old_name" "$new_name" "$file"
    done
    echo "Phase1: $old_name -> $new_name" >> "$REPLACE_LOG"
done

# Any remaining @mysten/* packages
log_info "  @mysten/* -> @linku/*"
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.mjs" -o -name "*.json" -o -name "*.md" \) \
    -not -path "*/node_modules/*" -not -path "*/.git/*" \
    -exec grep -l "@mysten/" {} \; 2>/dev/null | while read -r file; do
    safe_sed_replace "@mysten/" "@linku/" "$file"
done
echo "Phase1: @mysten/* -> @linku/*" >> "$REPLACE_LOG"

# ============================================
# Phase 2: Organization Names
# ============================================

log_info "Phase 2: Replacing organization names..."

# MystenLabs -> LinkUVerse (GitHub org)
log_info "  MystenLabs -> LinkUVerse"
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.mjs" -o -name "*.json" -o -name "*.md" -o -name "*.yaml" -o -name "*.yml" \) \
    -not -path "*/node_modules/*" -not -path "*/.git/*" \
    -exec grep -l "MystenLabs" {} \; 2>/dev/null | while read -r file; do
    safe_sed_replace "MystenLabs" "LinkUVerse" "$file"
done
echo "Phase2: MystenLabs -> LinkUVerse" >> "$REPLACE_LOG"

# Mysten Labs -> LinkU Labs (with space)
log_info "  Mysten Labs -> LinkU Labs"
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.mjs" -o -name "*.json" -o -name "*.md" \) \
    -not -path "*/node_modules/*" -not -path "*/.git/*" \
    -exec grep -l "Mysten Labs" {} \; 2>/dev/null | while read -r file; do
    safe_sed_replace "Mysten Labs" "LinkU Labs" "$file"
done
echo "Phase2: Mysten Labs -> LinkU Labs" >> "$REPLACE_LOG"

# mystenlabs.com -> linkuverse.com
log_info "  mystenlabs.com -> linkuverse.com"
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.mjs" -o -name "*.json" -o -name "*.md" \) \
    -not -path "*/node_modules/*" -not -path "*/.git/*" \
    -exec grep -l "mystenlabs.com" {} \; 2>/dev/null | while read -r file; do
    safe_sed_replace "mystenlabs.com" "linkuverse.com" "$file"
done
echo "Phase2: mystenlabs.com -> linkuverse.com" >> "$REPLACE_LOG"

# ============================================
# Phase 3: Network Endpoints
# ============================================

log_info "Phase 3: Replacing network endpoints..."

for i in "${!ENDPOINT_OLD[@]}"; do
    old_endpoint="${ENDPOINT_OLD[$i]}"
    new_endpoint="${ENDPOINT_NEW[$i]}"

    log_info "  $old_endpoint -> $new_endpoint"
    find . -type f \( -name "*.ts" -o -name "*.json" \) \
        -not -path "*/node_modules/*" -not -path "*/.git/*" \
        -exec grep -l "$old_endpoint" {} \; 2>/dev/null | while read -r file; do
        safe_sed_replace "$old_endpoint" "$new_endpoint" "$file"
    done
    echo "Phase3: $old_endpoint -> $new_endpoint" >> "$REPLACE_LOG"
done

# ============================================
# Phase 4: Type and Function Names
# ============================================

log_info "Phase 4: Replacing type and function names..."

for i in "${!TYPE_OLD[@]}"; do
    old_name="${TYPE_OLD[$i]}"
    new_name="${TYPE_NEW[$i]}"

    count=$(grep -r "$old_name" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v "node_modules" | wc -l | tr -d ' ')
    if [[ $count -gt 0 ]]; then
        log_info "  $old_name -> $new_name ($count occurrences)"
        find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
            -not -path "*/node_modules/*" -not -path "*/.git/*" \
            -exec grep -l "$old_name" {} \; 2>/dev/null | while read -r file; do
            safe_sed_replace "$old_name" "$new_name" "$file"
        done
        echo "Phase4: $old_name -> $new_name ($count)" >> "$REPLACE_LOG"
    fi
done

# ============================================
# Phase 5: Constants
# ============================================

log_info "Phase 5: Replacing constants..."

for i in "${!CONST_OLD[@]}"; do
    old_const="${CONST_OLD[$i]}"
    new_const="${CONST_NEW[$i]}"

    count=$(grep -r "$old_const" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v "node_modules" | wc -l | tr -d ' ')
    if [[ $count -gt 0 ]]; then
        log_info "  $old_const -> $new_const ($count occurrences)"
        find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
            -not -path "*/node_modules/*" -not -path "*/.git/*" \
            -exec grep -l "$old_const" {} \; 2>/dev/null | while read -r file; do
            safe_sed_replace "$old_const" "$new_const" "$file"
        done
        echo "Phase5: $old_const -> $new_const ($count)" >> "$REPLACE_LOG"
    fi
done

# ============================================
# Phase 6: Private Key Prefix
# ============================================

log_info "Phase 6: Replacing private key prefix..."

log_info "  suiprivkey -> rtdprivkey"
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
    -not -path "*/node_modules/*" -not -path "*/.git/*" \
    -exec grep -l "suiprivkey" {} \; 2>/dev/null | while read -r file; do
    safe_sed_replace "suiprivkey" "rtdprivkey" "$file"
done
echo "Phase6: suiprivkey -> rtdprivkey" >> "$REPLACE_LOG"

# ============================================
# Phase 7: Move Type Paths (RTD chain has renamed these)
# ============================================

log_info "Phase 7: Replacing Move type paths..."

# ::sui::SUI -> ::rtd::RTD
log_info "  ::sui::SUI -> ::rtd::RTD"
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.graphql" \) \
    -not -path "*/node_modules/*" -not -path "*/.git/*" \
    -exec grep -l "::sui::SUI" {} \; 2>/dev/null | while read -r file; do
    safe_sed_replace "::sui::SUI" "::rtd::RTD" "$file"
done
echo "Phase7: ::sui::SUI -> ::rtd::RTD" >> "$REPLACE_LOG"

# ::sui:: -> ::rtd:: (for other module references)
log_info "  ::sui:: -> ::rtd::"
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.graphql" \) \
    -not -path "*/node_modules/*" -not -path "*/.git/*" \
    -exec grep -l "::sui::" {} \; 2>/dev/null | while read -r file; do
    safe_sed_replace "::sui::" "::rtd::" "$file"
done
echo "Phase7: ::sui:: -> ::rtd::" >> "$REPLACE_LOG"

# sui_system -> rtd_system
log_info "  sui_system -> rtd_system"
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
    -not -path "*/node_modules/*" -not -path "*/.git/*" \
    -exec grep -l "sui_system" {} \; 2>/dev/null | while read -r file; do
    safe_sed_replace "sui_system" "rtd_system" "$file"
done
echo "Phase7: sui_system -> rtd_system" >> "$REPLACE_LOG"

# ============================================
# Phase 8: Domain Name Suffix (.sui -> .rtd)
# ============================================

log_info "Phase 8: Replacing domain name suffix..."

# In string literals for domain patterns
log_info "  .sui (domain suffix) -> .rtd"
find . -type f -name "*.ts" \
    -not -path "*/node_modules/*" -not -path "*/.git/*" \
    -exec grep -l '\.sui' {} \; 2>/dev/null | while read -r file; do
    # Replace .sui at end of patterns
    safe_sed_replace '\.sui/' '.rtd/' "$file"
    safe_sed_replace '\.sui"' '.rtd"' "$file"
    safe_sed_replace "\.sui'" ".rtd'" "$file"
done
echo "Phase8: .sui -> .rtd (domain suffix)" >> "$REPLACE_LOG"

# ============================================
# Phase 9: General Sui -> Rtd Replacements
# ============================================

log_info "Phase 9: General Sui/sui replacements..."

# sui- prefix in file imports and module names
log_info "  sui- prefix in imports..."
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
    -not -path "*/node_modules/*" -not -path "*/.git/*" \
    -exec grep -l "sui-" {} \; 2>/dev/null | while read -r file; do
    # ./sui-types -> ./rtd-types
    safe_sed_replace "/sui-" "/rtd-" "$file"
    safe_sed_replace "'sui-" "'rtd-" "$file"
    safe_sed_replace '"sui-' '"rtd-' "$file"
done
echo "Phase9: General sui- -> rtd- replacements" >> "$REPLACE_LOG"

# ============================================
# Phase 10: File Renames
# ============================================

log_info "Phase 10: Renaming files..."

for i in "${!FILE_OLD_NAMES[@]}"; do
    old_name="${FILE_OLD_NAMES[$i]}"
    new_name="${FILE_NEW_NAMES[$i]}"

    log_info "  $old_name -> $new_name"

    find . -type f -name "$old_name" -not -path "*/node_modules/*" 2>/dev/null | while read -r file; do
        dir_path=$(dirname "$file")
        new_file="$dir_path/$new_name"
        mv "$file" "$new_file"
        log_debug "Renamed: $file -> $new_file"
        echo "FileRename: $file -> $new_file" >> "$REPLACE_LOG"
    done
done

# ============================================
# Phase 11: Directory Renames
# ============================================

log_info "Phase 11: Renaming directories..."

# src/grpc/proto/sui -> src/grpc/proto/rtd
if [[ -d "packages/typescript/src/grpc/proto/sui" ]]; then
    log_info "  src/grpc/proto/sui -> src/grpc/proto/rtd"
    mv "packages/typescript/src/grpc/proto/sui" "packages/typescript/src/grpc/proto/rtd"
    echo "DirRename: src/grpc/proto/sui -> src/grpc/proto/rtd" >> "$REPLACE_LOG"
fi

# ============================================
# Phase 12: Update Import Paths
# ============================================

log_info "Phase 12: Updating import paths for renamed files..."

# Update imports for sui-types.ts -> rtd-types.ts
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
    -not -path "*/node_modules/*" -not -path "*/.git/*" \
    -exec grep -l "sui-types" {} \; 2>/dev/null | while read -r file; do
    safe_sed_replace "sui-types" "rtd-types" "$file"
done

# Update imports for suins.ts -> rtdns.ts
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
    -not -path "*/node_modules/*" -not -path "*/.git/*" \
    -exec grep -l "suins" {} \; 2>/dev/null | while read -r file; do
    safe_sed_replace "/suins" "/rtdns" "$file"
    safe_sed_replace "'suins" "'rtdns" "$file"
    safe_sed_replace '"suins' '"rtdns' "$file"
done

# Update grpc proto imports
find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
    -not -path "*/node_modules/*" -not -path "*/.git/*" \
    -exec grep -l "proto/sui" {} \; 2>/dev/null | while read -r file; do
    safe_sed_replace "proto/sui" "proto/rtd" "$file"
done

echo "Phase12: Import paths updated" >> "$REPLACE_LOG"

# ============================================
# Phase 13: Special File Updates
# ============================================

log_info "Phase 13: Updating special files..."

# Update genversion.mjs - point to RTD repo
GENVERSION_FILE="packages/typescript/genversion.mjs"
if [[ -f "$GENVERSION_FILE" ]]; then
    log_info "  Updating genversion.mjs..."
    safe_sed_replace "MystenLabs/sui" "LinkUVerse/rtd" "$GENVERSION_FILE"
fi

# Update graphql-codegen.ts - point to RTD repo
GRAPHQL_CODEGEN_FILE="packages/typescript/graphql-codegen.ts"
if [[ -f "$GRAPHQL_CODEGEN_FILE" ]]; then
    log_info "  Updating graphql-codegen.ts..."
    safe_sed_replace "MystenLabs/sui" "LinkUVerse/rtd" "$GRAPHQL_CODEGEN_FILE"
fi

# Update package.json codegen scripts
TYPESCRIPT_PKG="packages/typescript/package.json"
if [[ -f "$TYPESCRIPT_PKG" ]]; then
    log_info "  Updating typescript package.json codegen scripts..."
    safe_sed_replace "sui-apis/proto" "rtd-apis/proto" "$TYPESCRIPT_PKG"
fi

echo "Phase13: Special files updated" >> "$REPLACE_LOG"

# ============================================
# Summary
# ============================================

log_step "Brand Rename Complete"

# Count remaining patterns
remaining_mysten=$(grep -r "@mysten" --include="*.ts" --include="*.json" . 2>/dev/null | grep -v "node_modules" | wc -l | tr -d ' ')
remaining_sui_type=$(grep -r "Sui[A-Z]" --include="*.ts" . 2>/dev/null | grep -v "node_modules" | grep -v "Rtd" | wc -l | tr -d ' ')

log_info "Remaining @mysten references: $remaining_mysten"
log_info "Remaining Sui* type references: $remaining_sui_type"

if [[ $remaining_mysten -gt 0 ]]; then
    log_warn "Some @mysten references remain. Check manually:"
    grep -r "@mysten" --include="*.ts" --include="*.json" . 2>/dev/null | grep -v "node_modules" | head -5
fi

log_success "Replacement log saved to: $REPLACE_LOG"

echo ""
log_info "Next step: Run ./03-update-deps.sh to update package dependencies"
