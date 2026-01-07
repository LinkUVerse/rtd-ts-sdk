#!/bin/bash
# run-apps-migration.sh - Main script to run RTD apps migration
# Copyright (c) LinkU Labs. All rights reserved.

set -e

# Save our script directory BEFORE sourcing config (which may override SCRIPT_DIR)
APPS_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$APPS_SCRIPT_DIR/config-apps.sh"
# Restore SCRIPT_DIR to point to apps directory
SCRIPT_DIR="$APPS_SCRIPT_DIR"

# ============================================
# Banner
# ============================================

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           RTD Apps Migration Script                          ║"
echo "║           Sui Apps -> RTD Apps                               ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# ============================================
# Parse Arguments
# ============================================

AUTO_CONFIRM=false
SKIP_VALIDATE=false
STEP=""
DRY_RUN=false

print_usage() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -y, --yes           Auto-confirm all prompts"
    echo "  --skip-validate     Skip validation step"
    echo "  --step <name>       Run only specified step"
    echo "                      Steps: copy, clean, rename, wallet, deps, validate"
    echo "  --dry-run           Show what would be done without making changes"
    echo "  -h, --help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                  Run full migration with prompts"
    echo "  $0 -y               Run full migration without prompts"
    echo "  $0 --step copy      Run only the copy step"
    echo "  $0 --step validate  Run only validation"
    echo ""
}

while [[ $# -gt 0 ]]; do
    case $1 in
        -y|--yes)
            AUTO_CONFIRM=true
            shift
            ;;
        --skip-validate)
            SKIP_VALIDATE=true
            shift
            ;;
        --step)
            STEP="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        -h|--help)
            print_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            print_usage
            exit 1
            ;;
    esac
done

# ============================================
# Helper Functions
# ============================================

run_step() {
    local step_num="$1"
    local step_name="$2"
    local script="$3"

    echo ""
    echo "┌──────────────────────────────────────────────────────────────┐"
    echo "│ Step $step_num: $step_name"
    echo "└──────────────────────────────────────────────────────────────┘"

    if [[ "$DRY_RUN" == "true" ]]; then
        echo "[DRY RUN] Would execute: $script"
        return 0
    fi

    if [[ ! -f "$SCRIPT_DIR/$script" ]]; then
        print_error "Script not found: $script"
        return 1
    fi

    bash "$SCRIPT_DIR/$script"

    echo ""
    print_success "Step $step_num completed"
}

confirm_proceed() {
    if [[ "$AUTO_CONFIRM" == "true" ]]; then
        return 0
    fi

    echo ""
    read -p "Proceed? (Y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]?$ ]]; then
        print_warning "Aborted by user"
        exit 0
    fi
}

# ============================================
# Show Configuration
# ============================================

echo "Configuration:"
echo "  Source:      $APPS_SOURCE"
echo "  Target:      $APPS_TARGET"
echo "  Apps:        ${APPS_TO_COPY[*]}"
echo "  Auto-confirm: $AUTO_CONFIRM"
echo "  Skip validate: $SKIP_VALIDATE"
if [[ -n "$STEP" ]]; then
    echo "  Single step: $STEP"
fi
if [[ "$DRY_RUN" == "true" ]]; then
    echo "  Mode:        DRY RUN (no changes)"
fi

# ============================================
# Single Step Mode
# ============================================

if [[ -n "$STEP" ]]; then
    case "$STEP" in
        copy)
            run_step "1" "Copy Apps" "20-copy-apps.sh"
            ;;
        clean)
            run_step "2" "Clean Wallet Features" "21-clean-wallet-features.sh"
            ;;
        rename)
            run_step "3" "Brand Replacement" "22-apps-brand-rename.sh"
            ;;
        files)
            run_step "4" "Rename Sui Files/Dirs" "26-rename-sui-files-dirs.sh"
            ;;
        wallet)
            run_step "5" "Wallet-Specific Processing" "23-wallet-specific.sh"
            ;;
        deps)
            run_step "6" "Update Dependencies" "24-update-apps-deps.sh"
            ;;
        validate)
            run_step "7" "Validation" "25-validate-apps.sh"
            ;;
        *)
            print_error "Unknown step: $STEP"
            echo "Valid steps: copy, clean, rename, files, wallet, deps, validate"
            exit 1
            ;;
    esac
    exit 0
fi

# ============================================
# Full Migration Mode
# ============================================

echo ""
echo "This script will perform the following steps:"
echo "  1. Copy apps from source to target directory"
echo "  2. Clean wallet features (remove DeepBook & Ledger)"
echo "  3. Apply brand replacements (Sui -> Rtd, etc.)"
echo "  4. Rename Sui/sui files and directories"
echo "  5. Wallet-specific processing (fix routing & imports)"
echo "  6. Update dependencies in package.json files"
echo "  7. Validate migration results"
echo ""

confirm_proceed

# ============================================
# Execute Steps
# ============================================

START_TIME=$(date +%s)

run_step "1/7" "Copy Apps" "20-copy-apps.sh"
confirm_proceed

run_step "2/7" "Clean Wallet Features" "21-clean-wallet-features.sh"
confirm_proceed

run_step "3/7" "Brand Replacement" "22-apps-brand-rename.sh"
confirm_proceed

run_step "4/7" "Rename Sui Files/Dirs" "26-rename-sui-files-dirs.sh"
confirm_proceed

run_step "5/7" "Wallet-Specific Processing" "23-wallet-specific.sh"
confirm_proceed

run_step "6/7" "Update Dependencies" "24-update-apps-deps.sh"
confirm_proceed

if [[ "$SKIP_VALIDATE" != "true" ]]; then
    run_step "7/7" "Validation" "25-validate-apps.sh"
fi

# ============================================
# Summary
# ============================================

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    Migration Complete!                        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "Duration: ${DURATION}s"
echo "Target:   $APPS_TARGET"
echo ""
echo "Next steps:"
echo "  1. cd $APPS_TARGET"
echo "  2. pnpm install"
echo "  3. pnpm build"
echo "  4. Review any warnings from validation"
echo ""

print_success "RTD Apps migration completed successfully!"
