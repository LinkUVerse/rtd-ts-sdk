#!/bin/bash
# run-all.sh - Execute all fork steps
# Copyright (c) LinkU Labs. All rights reserved.
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"
source "$SCRIPT_DIR/utils.sh"

# ============================================
# Usage
# ============================================

usage() {
    echo "Usage: $0 [OPTIONS] [STEP]"
    echo ""
    echo "Execute RTD SDK fork process"
    echo ""
    echo "Steps:"
    echo "  all       Run all steps (default)"
    echo "  copy      Run step 1: Copy sources"
    echo "  rename    Run step 2: Brand rename"
    echo "  deps      Run step 3: Update dependencies"
    echo "  validate  Run step 4: Validate"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -y, --yes      Auto-confirm all prompts"
    echo "  -v, --verbose  Enable verbose output"
    echo ""
    echo "Examples:"
    echo "  $0              # Run all steps interactively"
    echo "  $0 -y           # Run all steps without prompts"
    echo "  $0 copy         # Run only copy step"
    echo "  $0 rename       # Run only brand rename step"
}

# ============================================
# Parse Arguments
# ============================================

AUTO_CONFIRM=false
VERBOSE=false
STEP="all"

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            usage
            exit 0
            ;;
        -y|--yes)
            AUTO_CONFIRM=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            LOG_LEVEL="DEBUG"
            shift
            ;;
        all|copy|rename|deps|validate)
            STEP=$1
            shift
            ;;
        *)
            log_error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# ============================================
# Main Execution
# ============================================

log_step "RTD TypeScript SDK Fork"

echo "Source: $SOURCE_ROOT"
echo "Target: $TARGET_ROOT"
echo "Step: $STEP"
echo ""

if [[ "$AUTO_CONFIRM" != "true" ]]; then
    read -p "Continue? (y/N): " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        log_info "Aborted by user"
        exit 0
    fi
fi

START_TIME=$(date +%s)

run_step() {
    local step_name=$1
    local script_name=$2

    log_info "Running: $step_name"

    if [[ "$AUTO_CONFIRM" == "true" ]]; then
        # For scripts that need confirmation, pipe 'y'
        echo "y" | "$SCRIPT_DIR/$script_name"
    else
        "$SCRIPT_DIR/$script_name"
    fi
}

case $STEP in
    all)
        run_step "Step 1: Copy Sources" "01-copy-sources.sh"
        run_step "Step 2: Brand Rename" "02-brand-rename.sh"
        run_step "Step 3: Update Dependencies" "03-update-deps.sh"
        run_step "Step 4: Validate" "04-validate.sh"
        ;;
    copy)
        run_step "Step 1: Copy Sources" "01-copy-sources.sh"
        ;;
    rename)
        run_step "Step 2: Brand Rename" "02-brand-rename.sh"
        ;;
    deps)
        run_step "Step 3: Update Dependencies" "03-update-deps.sh"
        ;;
    validate)
        run_step "Step 4: Validate" "04-validate.sh"
        ;;
esac

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

log_step "Fork Process Complete"

log_success "Total time: ${DURATION} seconds"
log_success "Target directory: $TARGET_ROOT"

echo ""
log_info "Next steps:"
log_info "  1. cd $TARGET_ROOT"
log_info "  2. Review any warnings from validation"
log_info "  3. pnpm install"
log_info "  4. pnpm build"
log_info "  5. pnpm test"
