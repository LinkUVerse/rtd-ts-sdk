#!/bin/bash
# run-migration.sh - Run complete migration for new packages
# Copyright (c) LinkU Labs. All rights reserved.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print banner
echo ""
echo -e "${BLUE}=========================================="
echo "  RTD SDK New Package Migration (v2)"
echo "==========================================${NC}"
echo ""

# Parse arguments
AUTO_CONFIRM=false
SKIP_VALIDATE=false
STEP=""

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
        -h|--help)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  -y, --yes           Auto-confirm all prompts"
            echo "  --skip-validate     Skip validation step"
            echo "  --step <name>       Run only specified step:"
            echo "                        copy    - Copy packages only"
            echo "                        rename  - Brand rename only"
            echo "                        wallet  - Wallet-specific only"
            echo "                        dappkit - DApp-kit specific only"
            echo "                        deps    - Update dependencies only"
            echo "                        validate - Validation only"
            echo "  -h, --help          Show this help"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Show what will be done
echo "This script will migrate the following packages:"
echo "  1. kiosk        -> rtd-kiosk"
echo "  2. wallet-standard -> rtd-wallet-standard"
echo "  3. window-wallet-core -> rtd-window-wallet-core"
echo "  4. slush-wallet -> rtd-slush-wallet"
echo "  5. dapp-kit     -> rtd-dapp-kit"
echo ""

# Confirm
if [[ "$AUTO_CONFIRM" != "true" && -z "$STEP" ]]; then
    read -p "Continue? [y/N] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 0
    fi
fi

# Track timing
start_time=$(date +%s)

run_step() {
    local step_name="$1"
    local script_name="$2"

    echo ""
    echo -e "${BLUE}>>> Running: $step_name${NC}"
    echo ""

    if [[ -x "$SCRIPT_DIR/$script_name" ]]; then
        "$SCRIPT_DIR/$script_name"
    else
        bash "$SCRIPT_DIR/$script_name"
    fi

    echo ""
    echo -e "${GREEN}<<< Completed: $step_name${NC}"
}

# Run steps based on argument
if [[ -n "$STEP" ]]; then
    case $STEP in
        copy)
            run_step "Copy Packages" "10-copy-new-packages.sh"
            ;;
        rename)
            run_step "Brand Rename" "11-brand-rename-v2.sh"
            ;;
        wallet)
            run_step "Wallet Specific" "12-wallet-specific.sh"
            ;;
        dappkit)
            run_step "DApp-Kit Specific" "13-dapp-kit-specific.sh"
            ;;
        deps)
            run_step "Update Dependencies" "14-update-deps-v2.sh"
            ;;
        validate)
            run_step "Validation" "15-validate-v2.sh"
            ;;
        *)
            echo -e "${RED}Unknown step: $STEP${NC}"
            exit 1
            ;;
    esac
else
    # Run all steps
    run_step "Step 1/6: Copy Packages" "10-copy-new-packages.sh"
    run_step "Step 2/6: Brand Rename" "11-brand-rename-v2.sh"
    run_step "Step 3/6: Wallet Specific" "12-wallet-specific.sh"
    run_step "Step 4/6: DApp-Kit Specific" "13-dapp-kit-specific.sh"
    run_step "Step 5/6: Update Dependencies" "14-update-deps-v2.sh"

    if [[ "$SKIP_VALIDATE" != "true" ]]; then
        run_step "Step 6/6: Validation" "15-validate-v2.sh"
    else
        echo ""
        echo -e "${YELLOW}Skipping validation step${NC}"
    fi
fi

# Calculate elapsed time
end_time=$(date +%s)
elapsed=$((end_time - start_time))
minutes=$((elapsed / 60))
seconds=$((elapsed % 60))

echo ""
echo -e "${GREEN}=========================================="
echo "  Migration Complete!"
echo "==========================================${NC}"
echo ""
echo "Elapsed time: ${minutes}m ${seconds}s"
echo ""
echo "Next steps:"
echo "  1. cd $(dirname $SCRIPT_DIR)/.."
echo "  2. pnpm install"
echo "  3. pnpm build"
echo ""
echo "If build fails, check for remaining issues:"
echo "  - grep -r '@mysten' packages/kiosk packages/wallet-standard packages/window-wallet-core packages/slush-wallet packages/dapp-kit"
echo "  - grep -r 'SuiClient' packages/dapp-kit"
echo ""
