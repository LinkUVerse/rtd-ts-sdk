#!/bin/bash
# 04-validate.sh - Validate the fork results
# Copyright (c) LinkU Labs. All rights reserved.
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"
source "$SCRIPT_DIR/utils.sh"

log_step "Step 4: Validation"

# ============================================
# Validation
# ============================================

if [[ ! -d "$TARGET_ROOT" ]]; then
    die "Target directory not found: $TARGET_ROOT"
fi

cd "$TARGET_ROOT"

# Create validation report
VALIDATION_REPORT="$TARGET_ROOT/fork-ts-instruct/.validation-report.txt"
echo "RTD SDK Fork Validation Report" > "$VALIDATION_REPORT"
echo "Generated: $(date)" >> "$VALIDATION_REPORT"
echo "========================================" >> "$VALIDATION_REPORT"

ERRORS=0
WARNINGS=0

# ============================================
# 4.1 Check for Remaining Old Brand References
# ============================================

log_info "4.1 Checking for remaining old brand references..."

# Check @mysten
mysten_count=$(grep -r "@mysten" --include="*.ts" --include="*.json" --include="*.md" . 2>/dev/null | grep -v "node_modules" | grep -v "fork-ts-instruct" | wc -l | tr -d ' ')
if [[ $mysten_count -gt 0 ]]; then
    log_warn "Found $mysten_count remaining @mysten references"
    echo "" >> "$VALIDATION_REPORT"
    echo "WARNING: Remaining @mysten references ($mysten_count):" >> "$VALIDATION_REPORT"
    grep -r "@mysten" --include="*.ts" --include="*.json" --include="*.md" . 2>/dev/null | grep -v "node_modules" | grep -v "fork-ts-instruct" | head -20 >> "$VALIDATION_REPORT"
    ((WARNINGS++))
else
    log_success "No @mysten references found"
    echo "OK: No @mysten references found" >> "$VALIDATION_REPORT"
fi

# Check MystenLabs
mystenlabs_count=$(grep -r "MystenLabs" --include="*.ts" --include="*.json" . 2>/dev/null | grep -v "node_modules" | grep -v "fork-ts-instruct" | wc -l | tr -d ' ')
if [[ $mystenlabs_count -gt 0 ]]; then
    log_warn "Found $mystenlabs_count remaining MystenLabs references"
    ((WARNINGS++))
else
    log_success "No MystenLabs references found"
fi

# Check mystenlabs.com
mystenlabs_com_count=$(grep -r "mystenlabs.com" --include="*.ts" --include="*.json" . 2>/dev/null | grep -v "node_modules" | grep -v "fork-ts-instruct" | wc -l | tr -d ' ')
if [[ $mystenlabs_com_count -gt 0 ]]; then
    log_warn "Found $mystenlabs_com_count remaining mystenlabs.com references"
    ((WARNINGS++))
else
    log_success "No mystenlabs.com references found"
fi

# Check suiprivkey
suiprivkey_count=$(grep -r "suiprivkey" --include="*.ts" . 2>/dev/null | grep -v "node_modules" | grep -v "fork-ts-instruct" | wc -l | tr -d ' ')
if [[ $suiprivkey_count -gt 0 ]]; then
    log_warn "Found $suiprivkey_count remaining suiprivkey references"
    ((WARNINGS++))
else
    log_success "No suiprivkey references found"
fi

# Check old network endpoints
for old_endpoint in "${ENDPOINT_OLD[@]}"; do
    endpoint_count=$(grep -r "$old_endpoint" --include="*.ts" --include="*.json" . 2>/dev/null | grep -v "node_modules" | grep -v "fork-ts-instruct" | wc -l | tr -d ' ')
    if [[ $endpoint_count -gt 0 ]]; then
        log_warn "Found $endpoint_count remaining $old_endpoint references"
        ((WARNINGS++))
    fi
done

# ============================================
# 4.2 Verify New Brand Application
# ============================================

log_info "4.2 Verifying new brand application..."

# Count @linku references
linku_count=$(grep -r "@linku" --include="*.ts" --include="*.json" . 2>/dev/null | grep -v "node_modules" | grep -v "fork-ts-instruct" | wc -l | tr -d ' ')
log_info "  @linku references: $linku_count"
echo "" >> "$VALIDATION_REPORT"
echo "New brand references:" >> "$VALIDATION_REPORT"
echo "  @linku: $linku_count" >> "$VALIDATION_REPORT"

# Count RtdClient references
rtdclient_count=$(grep -r "RtdClient" --include="*.ts" . 2>/dev/null | grep -v "node_modules" | grep -v "fork-ts-instruct" | wc -l | tr -d ' ')
log_info "  RtdClient references: $rtdclient_count"
echo "  RtdClient: $rtdclient_count" >> "$VALIDATION_REPORT"

# Count RTD_TYPE_ARG references
rtd_type_arg_count=$(grep -r "RTD_TYPE_ARG" --include="*.ts" . 2>/dev/null | grep -v "node_modules" | grep -v "fork-ts-instruct" | wc -l | tr -d ' ')
log_info "  RTD_TYPE_ARG references: $rtd_type_arg_count"
echo "  RTD_TYPE_ARG: $rtd_type_arg_count" >> "$VALIDATION_REPORT"

# ============================================
# 4.3 Verify Move Type Paths
# ============================================

log_info "4.3 Verifying Move type paths..."

# Check ::rtd::RTD is present
rtd_move_count=$(grep -r "::rtd::RTD" --include="*.ts" . 2>/dev/null | grep -v "node_modules" | grep -v "fork-ts-instruct" | wc -l | tr -d ' ')
log_info "  ::rtd::RTD references: $rtd_move_count"

# Check no ::sui::SUI remains
sui_move_count=$(grep -r "::sui::SUI" --include="*.ts" . 2>/dev/null | grep -v "node_modules" | grep -v "fork-ts-instruct" | wc -l | tr -d ' ')
if [[ $sui_move_count -gt 0 ]]; then
    log_warn "Found $sui_move_count remaining ::sui::SUI references"
    ((WARNINGS++))
else
    log_success "No ::sui::SUI references found"
fi

# ============================================
# 4.4 Verify File Renames
# ============================================

log_info "4.4 Verifying file renames..."

for i in "${!FILE_OLD_NAMES[@]}"; do
    old_name="${FILE_OLD_NAMES[$i]}"
    new_name="${FILE_NEW_NAMES[$i]}"

    # Check old file doesn't exist
    old_files=$(find . -name "$old_name" -not -path "*/node_modules/*" -not -path "*/fork-ts-instruct/*" 2>/dev/null | wc -l | tr -d ' ')
    if [[ $old_files -gt 0 ]]; then
        log_warn "Old file still exists: $old_name ($old_files occurrences)"
        ((WARNINGS++))
    fi

    # Check new file exists
    new_files=$(find . -name "$new_name" -not -path "*/node_modules/*" -not -path "*/fork-ts-instruct/*" 2>/dev/null | wc -l | tr -d ' ')
    if [[ $new_files -gt 0 ]]; then
        log_success "File renamed: $old_name -> $new_name ($new_files files)"
    else
        log_warn "Renamed file not found: $new_name"
        ((WARNINGS++))
    fi
done

# ============================================
# 4.5 Validate JSON Files
# ============================================

log_info "4.5 Validating JSON files..."

json_errors=0
while IFS= read -r json_file; do
    if ! validate_json "$json_file"; then
        log_error "Invalid JSON: $json_file"
        ((json_errors++))
        ((ERRORS++))
    fi
done < <(find . -name "package.json" -not -path "*/node_modules/*" -not -path "*/fork-ts-instruct/*" 2>/dev/null)

if [[ $json_errors -eq 0 ]]; then
    log_success "All JSON files are valid"
fi

# ============================================
# 4.6 Check Package Names in package.json
# ============================================

log_info "4.6 Checking package names..."

# Check root package
if [[ -f "package.json" ]]; then
    root_name=$(node -e "console.log(require('./package.json').name)")
    if [[ "$root_name" == "@linku/ts-sdks" ]]; then
        log_success "Root package name: $root_name"
    else
        log_warn "Root package name unexpected: $root_name"
        ((WARNINGS++))
    fi
fi

# Check subpackage names
for pkg_dir in packages/*/; do
    if [[ -f "${pkg_dir}package.json" ]]; then
        pkg_name=$(node -e "console.log(require('./${pkg_dir}package.json').name)" 2>/dev/null || echo "ERROR")
        if [[ "$pkg_name" == "@linku/"* ]]; then
            log_success "  $pkg_dir: $pkg_name"
        else
            log_warn "  $pkg_dir: unexpected name '$pkg_name'"
            ((WARNINGS++))
        fi
    fi
done

# ============================================
# 4.7 Check for Potential Issues
# ============================================

log_info "4.7 Checking for potential issues..."

# Check for any remaining SuiClient (should be RtdClient)
suiclient_count=$(grep -r "SuiClient" --include="*.ts" . 2>/dev/null | grep -v "node_modules" | grep -v "fork-ts-instruct" | wc -l | tr -d ' ')
if [[ $suiclient_count -gt 0 ]]; then
    log_warn "Found $suiclient_count remaining SuiClient references"
    echo "" >> "$VALIDATION_REPORT"
    echo "WARNING: Remaining SuiClient references:" >> "$VALIDATION_REPORT"
    grep -r "SuiClient" --include="*.ts" . 2>/dev/null | grep -v "node_modules" | grep -v "fork-ts-instruct" | head -10 >> "$VALIDATION_REPORT"
    ((WARNINGS++))
fi

# Check for remaining Sui type names (excluding comments)
sui_types=$(grep -r "Sui[A-Z][a-z]" --include="*.ts" . 2>/dev/null | grep -v "node_modules" | grep -v "fork-ts-instruct" | grep -v "//" | wc -l | tr -d ' ')
if [[ $sui_types -gt 0 ]]; then
    log_warn "Found $sui_types potential remaining Sui* type names"
    ((WARNINGS++))
fi

# ============================================
# 4.8 Try TypeScript Compilation (Optional)
# ============================================

log_info "4.8 Attempting TypeScript compilation check..."

if command -v pnpm &> /dev/null; then
    log_info "  Installing dependencies (this may take a while)..."
    if pnpm install --ignore-scripts 2>&1 | tail -5; then
        log_success "  Dependencies installed"

        # Try to compile build-scripts first (simplest package)
        log_info "  Checking build-scripts compilation..."
        if cd packages/build-scripts && pnpm tsc --noEmit 2>&1 | tail -10; then
            log_success "  build-scripts: TypeScript check passed"
        else
            log_warn "  build-scripts: TypeScript check had issues (may need fixes)"
            ((WARNINGS++))
        fi
        cd "$TARGET_ROOT"

        # Try utils
        log_info "  Checking utils compilation..."
        if cd packages/utils && pnpm tsc --noEmit 2>&1 | tail -10; then
            log_success "  utils: TypeScript check passed"
        else
            log_warn "  utils: TypeScript check had issues"
            ((WARNINGS++))
        fi
        cd "$TARGET_ROOT"
    else
        log_warn "  Failed to install dependencies"
        ((WARNINGS++))
    fi
else
    log_warn "  pnpm not found, skipping compilation check"
fi

# ============================================
# Summary
# ============================================

echo "" >> "$VALIDATION_REPORT"
echo "========================================" >> "$VALIDATION_REPORT"
echo "Summary:" >> "$VALIDATION_REPORT"
echo "  Errors: $ERRORS" >> "$VALIDATION_REPORT"
echo "  Warnings: $WARNINGS" >> "$VALIDATION_REPORT"
echo "========================================" >> "$VALIDATION_REPORT"

log_step "Validation Complete"

echo ""
if [[ $ERRORS -eq 0 ]]; then
    if [[ $WARNINGS -eq 0 ]]; then
        log_success "All validations passed! No errors or warnings."
    else
        log_warn "Validation completed with $WARNINGS warnings (no errors)"
        log_info "Review the warnings and fix if necessary"
    fi
else
    log_error "Validation completed with $ERRORS errors and $WARNINGS warnings"
    log_info "Please fix the errors before proceeding"
fi

echo ""
log_info "Validation report saved to: $VALIDATION_REPORT"
echo ""
log_info "To build the SDK:"
log_info "  cd $TARGET_ROOT"
log_info "  pnpm install"
log_info "  pnpm build"

exit $ERRORS
