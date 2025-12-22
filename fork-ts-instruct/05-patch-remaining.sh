#!/bin/bash
# 05-patch-remaining.sh - Patch remaining Sui/SUI/sui references
# Copyright (c) LinkU Labs. All rights reserved.
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"
source "$SCRIPT_DIR/utils.sh"

log_step "Step 5: Patch Remaining References"

# ============================================
# Validation
# ============================================

if [[ ! -d "$TARGET_ROOT" ]]; then
    die "Target directory not found: $TARGET_ROOT"
fi

cd "$TARGET_ROOT"

# Create patch log
PATCH_LOG="$TARGET_ROOT/fork-ts-instruct/.patch-log.txt"
echo "Patch Log - $(date)" > "$PATCH_LOG"
echo "========================================" >> "$PATCH_LOG"

# ============================================
# Phase 1: Replace remaining variable names in test files
# ============================================

log_info "Phase 1: Replacing remaining variable names..."

# suiPublicKey -> rtdPublicKey
log_info "  suiPublicKey -> rtdPublicKey"
find . -type f -name "*.ts" -not -path "*/node_modules/*" -not -path "*/.git/*" \
    -exec grep -l "suiPublicKey" {} \; 2>/dev/null | while read -r file; do
    sed -i '' "s/suiPublicKey/rtdPublicKey/g" "$file"
done

# suiAddress -> rtdAddress
log_info "  suiAddress -> rtdAddress"
find . -type f -name "*.ts" -not -path "*/node_modules/*" -not -path "*/.git/*" \
    -exec grep -l "suiAddress" {} \; 2>/dev/null | while read -r file; do
    sed -i '' "s/suiAddress/rtdAddress/g" "$file"
done

# suiBytes -> rtdBytes (variable names)
log_info "  *SuiBytes -> *RtdBytes"
find . -type f -name "*.ts" -not -path "*/node_modules/*" -not -path "*/.git/*" \
    -exec grep -l "SuiBytes" {} \; 2>/dev/null | while read -r file; do
    sed -i '' "s/SuiBytes/RtdBytes/g" "$file"
done

# suiCoins -> rtdCoins
log_info "  suiCoins -> rtdCoins"
find . -type f -name "*.ts" -not -path "*/node_modules/*" -not -path "*/.git/*" \
    -exec grep -l "suiCoins" {} \; 2>/dev/null | while read -r file; do
    sed -i '' "s/suiCoins/rtdCoins/g" "$file"
done

echo "Phase1: Variable names replaced" >> "$PATCH_LOG"

# ============================================
# Phase 2: Replace URLs containing sui.io
# ============================================

log_info "Phase 2: Replacing sui.io URLs..."

# www.sui.io -> www.rtd.life
log_info "  www.sui.io -> www.rtd.life"
find . -type f -name "*.ts" -not -path "*/node_modules/*" -not -path "*/.git/*" \
    -exec grep -l "sui\.io" {} \; 2>/dev/null | while read -r file; do
    sed -i '' "s/sui\.io/rtd\.life/g" "$file"
done

echo "Phase2: URLs replaced" >> "$PATCH_LOG"

# ============================================
# Phase 3: Replace Move module names in test data
# ============================================

log_info "Phase 3: Replacing Move module names in test data..."

# module: 'sui' -> module: 'rtd'
log_info "  module: 'sui' -> module: 'rtd'"
find . -type f -name "*.ts" -not -path "*/node_modules/*" -not -path "*/.git/*" \
    -exec grep -l "module: 'sui'" {} \; 2>/dev/null | while read -r file; do
    sed -i '' "s/module: 'sui'/module: 'rtd'/g" "$file"
done

# module: "sui" -> module: "rtd"
log_info "  module: \"sui\" -> module: \"rtd\""
find . -type f -name "*.ts" -not -path "*/node_modules/*" -not -path "*/.git/*" \
    -exec grep -l 'module: "sui"' {} \; 2>/dev/null | while read -r file; do
    sed -i '' 's/module: "sui"/module: "rtd"/g' "$file"
done

# name: 'SUI' -> name: 'RTD'
log_info "  name: 'SUI' -> name: 'RTD'"
find . -type f -name "*.ts" -not -path "*/node_modules/*" -not -path "*/.git/*" \
    -exec grep -l "name: 'SUI'" {} \; 2>/dev/null | while read -r file; do
    sed -i '' "s/name: 'SUI'/name: 'RTD'/g" "$file"
done

# name: "SUI" -> name: "RTD"
log_info "  name: \"SUI\" -> name: \"RTD\""
find . -type f -name "*.ts" -not -path "*/node_modules/*" -not -path "*/.git/*" \
    -exec grep -l 'name: "SUI"' {} \; 2>/dev/null | while read -r file; do
    sed -i '' 's/name: "SUI"/name: "RTD"/g' "$file"
done

echo "Phase3: Move module names replaced" >> "$PATCH_LOG"

# ============================================
# Phase 4: Replace comments mentioning sui CLI/binary
# ============================================

log_info "Phase 4: Replacing comments and documentation..."

# --bin sui -> --bin rtd
log_info "  --bin sui -> --bin rtd"
find . -type f -name "*.ts" -not -path "*/node_modules/*" -not -path "*/.git/*" \
    -exec grep -l "\-\-bin sui" {} \; 2>/dev/null | while read -r file; do
    sed -i '' "s/--bin sui/--bin rtd/g" "$file"
done

# /sui client -> /rtd client (in comments)
log_info "  /sui commands in comments"
find . -type f -name "*.ts" -not -path "*/node_modules/*" -not -path "*/.git/*" \
    -exec grep -l "debug/sui" {} \; 2>/dev/null | while read -r file; do
    sed -i '' "s|debug/sui|debug/rtd|g" "$file"
done

# Sui private key -> Rtd private key (in comments)
log_info "  'Sui private key' in comments"
find . -type f -name "*.ts" -not -path "*/node_modules/*" -not -path "*/.git/*" \
    -exec grep -l "Sui private key" {} \; 2>/dev/null | while read -r file; do
    sed -i '' "s/Sui private key/Rtd private key/g" "$file"
done

echo "Phase4: Comments replaced" >> "$PATCH_LOG"

# ============================================
# Phase 5: Replace function/method names with 'sui' prefix
# ============================================

log_info "Phase 5: Replacing remaining function names..."

# getLatestSuiSystemState -> getLatestRtdSystemState
log_info "  getLatestSuiSystemState -> getLatestRtdSystemState"
find . -type f -name "*.ts" -not -path "*/node_modules/*" -not -path "*/.git/*" \
    -exec grep -l "getLatestSuiSystemState" {} \; 2>/dev/null | while read -r file; do
    sed -i '' "s/getLatestSuiSystemState/getLatestRtdSystemState/g" "$file"
done

# execSuiTools -> execRtdTools
log_info "  execSuiTools -> execRtdTools"
find . -type f -name "*.ts" -not -path "*/node_modules/*" -not -path "*/.git/*" \
    -exec grep -l "execSuiTools" {} \; 2>/dev/null | while read -r file; do
    sed -i '' "s/execSuiTools/execRtdTools/g" "$file"
done

# executePaySuiNTimes -> executePayRtdNTimes
log_info "  executePaySuiNTimes -> executePayRtdNTimes"
find . -type f -name "*.ts" -not -path "*/node_modules/*" -not -path "*/.git/*" \
    -exec grep -l "executePaySuiNTimes" {} \; 2>/dev/null | while read -r file; do
    sed -i '' "s/executePaySuiNTimes/executePayRtdNTimes/g" "$file"
done

# suix_ -> rtdx_ (RPC method prefixes)
log_info "  suix_ -> rtdx_"
find . -type f -name "*.ts" -not -path "*/node_modules/*" -not -path "*/.git/*" \
    -exec grep -l "suix_" {} \; 2>/dev/null | while read -r file; do
    sed -i '' "s/suix_/rtdx_/g" "$file"
done

# sui_ -> rtd_ (RPC method prefixes, but be careful)
log_info "  'sui_' RPC methods"
find . -type f -name "*.ts" -not -path "*/node_modules/*" -not -path "*/.git/*" \
    -exec grep -l "'sui_" {} \; 2>/dev/null | while read -r file; do
    sed -i '' "s/'sui_/'rtd_/g" "$file"
done

echo "Phase5: Function names replaced" >> "$PATCH_LOG"

# ============================================
# Phase 6: Replace in scripts/generate.ts aliases
# ============================================

log_info "Phase 6: Replacing type aliases in generate.ts..."

GENERATE_FILE="packages/typescript/scripts/generate.ts"
if [[ -f "$GENERATE_FILE" ]]; then
    # SuiGasData -> RtdGasData
    sed -i '' "s/SuiGasData/RtdGasData/g" "$GENERATE_FILE"
    # SuiMoveFunctionArgType -> RtdMoveFunctionArgType
    sed -i '' "s/SuiMoveFunctionArgType/RtdMoveFunctionArgType/g" "$GENERATE_FILE"
    # SuiCoinMetadata -> RtdCoinMetadata
    sed -i '' "s/SuiCoinMetadata/RtdCoinMetadata/g" "$GENERATE_FILE"
    # SuiProgrammableMoveCall -> RtdProgrammableMoveCall
    sed -i '' "s/SuiProgrammableMoveCall/RtdProgrammableMoveCall/g" "$GENERATE_FILE"
    # MoveCallSuiTransaction -> MoveCallRtdTransaction
    sed -i '' "s/MoveCallSuiTransaction/MoveCallRtdTransaction/g" "$GENERATE_FILE"
    log_info "  Updated generate.ts aliases"
fi

echo "Phase6: generate.ts aliases replaced" >> "$PATCH_LOG"

# ============================================
# Phase 7: Replace in BCS effects.ts
# ============================================

log_info "Phase 7: Replacing in BCS effects..."

EFFECTS_FILE="packages/typescript/src/bcs/effects.ts"
if [[ -f "$EFFECTS_FILE" ]]; then
    sed -i '' "s/SuiMoveVerificationError/RtdMoveVerificationError/g" "$EFFECTS_FILE"
    sed -i '' "s/SuiMoveVerificationTimedout/RtdMoveVerificationTimedout/g" "$EFFECTS_FILE"
    log_info "  Updated effects.ts"
fi

echo "Phase7: BCS effects replaced" >> "$PATCH_LOG"

# ============================================
# Phase 8: Replace in gRPC proto files
# ============================================

log_info "Phase 8: Replacing in gRPC proto generated files..."

find packages/typescript/src/grpc/proto -type f -name "*.ts" 2>/dev/null | while read -r file; do
    # Replace Sui prefixes in generated types
    sed -i '' "s/pendingTotalSuiWithdraw/pendingTotalRtdWithdraw/g" "$file"
    sed -i '' "s/totalSuiBalance/totalRtdBalance/g" "$file"
    sed -i '' "s/suiBalance/rtdBalance/g" "$file"
    sed -i '' "s/Sui([A-Z])/Rtd\1/g" "$file"
done

echo "Phase8: gRPC proto files updated" >> "$PATCH_LOG"

# ============================================
# Phase 9: Generic Sui/SUI/sui replacements
# ============================================

log_info "Phase 9: Generic pattern replacements..."

# 'sui' client command in strings
log_info "  'sui' command strings"
find . -type f -name "*.ts" -not -path "*/node_modules/*" -not -path "*/.git/*" \
    -exec grep -l "'sui'" {} \; 2>/dev/null | while read -r file; do
    # Be careful not to replace in Move paths
    sed -i '' "s/'sui'/'rtd'/g" "$file"
done

# "sui" in arrays (like command args)
find . -type f -name "*.ts" -not -path "*/node_modules/*" -not -path "*/.git/*" \
    -exec grep -l '"sui"' {} \; 2>/dev/null | while read -r file; do
    sed -i '' 's/"sui"/"rtd"/g' "$file"
done

echo "Phase9: Generic replacements done" >> "$PATCH_LOG"

# ============================================
# Summary
# ============================================

log_step "Patch Complete"

# Count remaining
remaining=$(grep -r "Sui\|SUI\|sui" --include="*.ts" . 2>/dev/null | grep -v "node_modules" | grep -v "Rtd\|RTD\|rtd" | wc -l | tr -d ' ')

log_info "Remaining references after patch: $remaining"

if [[ $remaining -gt 0 ]]; then
    log_warn "Some references remain. Showing samples:"
    grep -r "Sui\|SUI\|sui" --include="*.ts" . 2>/dev/null | grep -v "node_modules" | grep -v "Rtd\|RTD\|rtd" | head -10
fi

log_success "Patch log saved to: $PATCH_LOG"
