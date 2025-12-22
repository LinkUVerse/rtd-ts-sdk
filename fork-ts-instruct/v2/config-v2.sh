#!/bin/bash
# config-v2.sh - RTD SDK v2 Migration Configuration (New Packages)
# Copyright (c) LinkU Labs. All rights reserved.

# Load base configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../config.sh"

# ============================================
# New Packages to Copy (in dependency order)
# ============================================

NEW_PACKAGES=(
    "packages/kiosk"
    "packages/wallet-standard"
    "packages/window-wallet-core"
    "packages/slush-wallet"
    "packages/dapp-kit"
)

# ============================================
# NPM Package Names for New Packages
# ============================================

NPM_OLD_NAMES_V2=(
    "@mysten/kiosk"
    "@mysten/wallet-standard"
    "@mysten/window-wallet-core"
    "@mysten/slush-wallet"
    "@mysten/dapp-kit"
)

NPM_NEW_NAMES_V2=(
    "rtd-kiosk"
    "rtd-wallet-standard"
    "rtd-window-wallet-core"
    "rtd-slush-wallet"
    "rtd-dapp-kit"
)

# ============================================
# Wallet-Standard Specific Type Replacements
# ============================================

WALLET_TYPES_OLD=(
    # Chain types
    "SuiChain"
    "isSuiChain"
    "SUI_CHAINS"
    "SUI_MAINNET_CHAIN"
    "SUI_TESTNET_CHAIN"
    "SUI_DEVNET_CHAIN"
    "SUI_LOCALNET_CHAIN"
    # Sign Transaction
    "SuiSignTransaction"
    "SuiSignTransactionFeature"
    "SuiSignTransactionVersion"
    "SuiSignTransactionMethod"
    "SuiSignTransactionInput"
    "SuiSignTransactionOutput"
    # Sign Transaction Block
    "SuiSignTransactionBlock"
    "SuiSignTransactionBlockFeature"
    "SuiSignTransactionBlockVersion"
    "SuiSignTransactionBlockMethod"
    "SuiSignTransactionBlockInput"
    "SuiSignTransactionBlockOutput"
    # Sign and Execute Transaction Block
    "SuiSignAndExecuteTransactionBlock"
    "SuiSignAndExecuteTransactionBlockFeature"
    "SuiSignAndExecuteTransactionBlockVersion"
    "SuiSignAndExecuteTransactionBlockMethod"
    "SuiSignAndExecuteTransactionBlockInput"
    "SuiSignAndExecuteTransactionBlockOutput"
    # Sign and Execute Transaction
    "SuiSignAndExecuteTransaction"
    "SuiSignAndExecuteTransactionFeature"
    "SuiSignAndExecuteTransactionVersion"
    "SuiSignAndExecuteTransactionMethod"
    "SuiSignAndExecuteTransactionInput"
    "SuiSignAndExecuteTransactionOutput"
    # Sign Personal Message
    "SuiSignPersonalMessage"
    "SuiSignPersonalMessageFeature"
    "SuiSignPersonalMessageVersion"
    "SuiSignPersonalMessageMethod"
    "SuiSignPersonalMessageInput"
    "SuiSignPersonalMessageOutput"
    # Report Transaction Effects
    "SuiReportTransactionEffects"
    "SuiReportTransactionEffectsFeature"
    "SuiReportTransactionEffectsVersion"
    "SuiReportTransactionEffectsMethod"
    "SuiReportTransactionEffectsInput"
    # Get Capabilities
    "SuiGetCapabilities"
    "SuiGetCapabilitiesFeature"
    "SuiGetCapabilitiesVersion"
    "SuiGetCapabilitiesMethod"
    "SuiGetCapabilitiesOutput"
    # Wallet Features
    "SuiWalletFeatures"
    "SuiFeatures"
    # Account
    "SuiWalletAccount"
)

WALLET_TYPES_NEW=(
    # Chain types
    "RtdChain"
    "isRtdChain"
    "RTD_CHAINS"
    "RTD_MAINNET_CHAIN"
    "RTD_TESTNET_CHAIN"
    "RTD_DEVNET_CHAIN"
    "RTD_LOCALNET_CHAIN"
    # Sign Transaction
    "RtdSignTransaction"
    "RtdSignTransactionFeature"
    "RtdSignTransactionVersion"
    "RtdSignTransactionMethod"
    "RtdSignTransactionInput"
    "RtdSignTransactionOutput"
    # Sign Transaction Block
    "RtdSignTransactionBlock"
    "RtdSignTransactionBlockFeature"
    "RtdSignTransactionBlockVersion"
    "RtdSignTransactionBlockMethod"
    "RtdSignTransactionBlockInput"
    "RtdSignTransactionBlockOutput"
    # Sign and Execute Transaction Block
    "RtdSignAndExecuteTransactionBlock"
    "RtdSignAndExecuteTransactionBlockFeature"
    "RtdSignAndExecuteTransactionBlockVersion"
    "RtdSignAndExecuteTransactionBlockMethod"
    "RtdSignAndExecuteTransactionBlockInput"
    "RtdSignAndExecuteTransactionBlockOutput"
    # Sign and Execute Transaction
    "RtdSignAndExecuteTransaction"
    "RtdSignAndExecuteTransactionFeature"
    "RtdSignAndExecuteTransactionVersion"
    "RtdSignAndExecuteTransactionMethod"
    "RtdSignAndExecuteTransactionInput"
    "RtdSignAndExecuteTransactionOutput"
    # Sign Personal Message
    "RtdSignPersonalMessage"
    "RtdSignPersonalMessageFeature"
    "RtdSignPersonalMessageVersion"
    "RtdSignPersonalMessageMethod"
    "RtdSignPersonalMessageInput"
    "RtdSignPersonalMessageOutput"
    # Report Transaction Effects
    "RtdReportTransactionEffects"
    "RtdReportTransactionEffectsFeature"
    "RtdReportTransactionEffectsVersion"
    "RtdReportTransactionEffectsMethod"
    "RtdReportTransactionEffectsInput"
    # Get Capabilities
    "RtdGetCapabilities"
    "RtdGetCapabilitiesFeature"
    "RtdGetCapabilitiesVersion"
    "RtdGetCapabilitiesMethod"
    "RtdGetCapabilitiesOutput"
    # Wallet Features
    "RtdWalletFeatures"
    "RtdFeatures"
    # Account
    "RtdWalletAccount"
)

# Protocol identifiers (sui: prefix in feature names)
PROTOCOL_OLD=(
    "'sui:signTransaction'"
    "'sui:signTransactionBlock'"
    "'sui:signAndExecuteTransactionBlock'"
    "'sui:signAndExecuteTransaction'"
    "'sui:signPersonalMessage'"
    "'sui:reportTransactionEffects'"
    "'sui:getCapabilities'"
    "\"sui:signTransaction\""
    "\"sui:signTransactionBlock\""
    "\"sui:signAndExecuteTransactionBlock\""
    "\"sui:signAndExecuteTransaction\""
    "\"sui:signPersonalMessage\""
    "\"sui:reportTransactionEffects\""
    "\"sui:getCapabilities\""
)

PROTOCOL_NEW=(
    "'rtd:signTransaction'"
    "'rtd:signTransactionBlock'"
    "'rtd:signAndExecuteTransactionBlock'"
    "'rtd:signAndExecuteTransaction'"
    "'rtd:signPersonalMessage'"
    "'rtd:reportTransactionEffects'"
    "'rtd:getCapabilities'"
    "\"rtd:signTransaction\""
    "\"rtd:signTransactionBlock\""
    "\"rtd:signAndExecuteTransactionBlock\""
    "\"rtd:signAndExecuteTransaction\""
    "\"rtd:signPersonalMessage\""
    "\"rtd:reportTransactionEffects\""
    "\"rtd:getCapabilities\""
)

# Chain identifiers
CHAIN_IDS_OLD=(
    "'sui:mainnet'"
    "'sui:testnet'"
    "'sui:devnet'"
    "'sui:localnet'"
    "\"sui:mainnet\""
    "\"sui:testnet\""
    "\"sui:devnet\""
    "\"sui:localnet\""
)

CHAIN_IDS_NEW=(
    "'rtd:mainnet'"
    "'rtd:testnet'"
    "'rtd:devnet'"
    "'rtd:localnet'"
    "\"rtd:mainnet\""
    "\"rtd:testnet\""
    "\"rtd:devnet\""
    "\"rtd:localnet\""
)

# ============================================
# Wallet File Renames
# ============================================

WALLET_FILES_OLD=(
    "suiSignTransaction.ts"
    "suiSignTransactionBlock.ts"
    "suiSignAndExecuteTransactionBlock.ts"
    "suiSignAndExecuteTransaction.ts"
    "suiSignPersonalMessage.ts"
    "suiReportTransactionEffects.ts"
    "suiGetCapabilities.ts"
)

WALLET_FILES_NEW=(
    "rtdSignTransaction.ts"
    "rtdSignTransactionBlock.ts"
    "rtdSignAndExecuteTransactionBlock.ts"
    "rtdSignAndExecuteTransaction.ts"
    "rtdSignPersonalMessage.ts"
    "rtdReportTransactionEffects.ts"
    "rtdGetCapabilities.ts"
)

# ============================================
# Slush Wallet Specific Replacements
# ============================================

SLUSH_OLD=(
    "com.mystenlabs.suiwallet"
    "SUI_WALLET_EXTENSION_ID"
    "SUI_WALLET_NAME"
    "SlushWallet"
)

SLUSH_NEW=(
    "com.linkuverse.rtdwallet"
    "RTD_WALLET_EXTENSION_ID"
    "RTD_WALLET_NAME"
    "SlushWallet"
)

# ============================================
# DApp-Kit Specific Type Replacements
# ============================================

DAPPKIT_TYPES_OLD=(
    # Provider
    "SuiClientProvider"
    "SuiClientProviderContext"
    "SuiClientProviderProps"
    "SuiClientContext"
    # Hooks
    "useSuiClient"
    "useSuiClientContext"
    "useSuiClientQuery"
    "useSuiClientQueries"
    "useSuiClientInfiniteQuery"
    "useSuiClientMutation"
    # Options
    "UseSuiClientQueryOptions"
    "UseSuiClientMutationOptions"
    "GetSuiClientQueryOptions"
    "getSuiClientQuery"
    # RPC
    "SuiRpcMethods"
    "SuiRpcMethodName"
    # Name service
    "useResolveSuiNSNames"
    "useResolveSuiNSName"
    # UI
    "SuiIcon"
)

DAPPKIT_TYPES_NEW=(
    # Provider
    "RtdClientProvider"
    "RtdClientProviderContext"
    "RtdClientProviderProps"
    "RtdClientContext"
    # Hooks
    "useRtdClient"
    "useRtdClientContext"
    "useRtdClientQuery"
    "useRtdClientQueries"
    "useRtdClientInfiniteQuery"
    "useRtdClientMutation"
    # Options
    "UseRtdClientQueryOptions"
    "UseRtdClientMutationOptions"
    "GetRtdClientQueryOptions"
    "getRtdClientQuery"
    # RPC
    "RtdRpcMethods"
    "RtdRpcMethodName"
    # Name service
    "useResolveRtdNSNames"
    "useResolveRtdNSName"
    # UI
    "RtdIcon"
)

# ============================================
# DApp-Kit File Renames
# ============================================

DAPPKIT_FILES_OLD=(
    "SuiClientProvider.tsx"
    "useSuiClient.ts"
    "useSuiClientQuery.ts"
    "useSuiClientQueries.ts"
    "useSuiClientInfiniteQuery.ts"
    "useSuiClientMutation.ts"
    "useResolveSuiNSNames.ts"
    "SuiIcon.tsx"
)

DAPPKIT_FILES_NEW=(
    "RtdClientProvider.tsx"
    "useRtdClient.ts"
    "useRtdClientQuery.ts"
    "useRtdClientQueries.ts"
    "useRtdClientInfiniteQuery.ts"
    "useRtdClientMutation.ts"
    "useResolveRtdNSNames.ts"
    "RtdIcon.tsx"
)

# ============================================
# Package JSON Name Mapping (for Node.js script)
# ============================================

# Combined mapping for all packages (old and new)
# Note: Using arrays instead of associative arrays for bash 3.x compatibility
PKG_MAP_OLD=(
    "@mysten/sui"
    "@mysten/bcs"
    "@mysten/utils"
    "@mysten/build-scripts"
    "@mysten/kiosk"
    "@mysten/wallet-standard"
    "@mysten/window-wallet-core"
    "@mysten/slush-wallet"
    "@mysten/dapp-kit"
)

PKG_MAP_NEW=(
    "rtd-typescript"
    "rtd-bcs"
    "rtd-utils"
    "rtd-build-scripts"
    "rtd-kiosk"
    "rtd-wallet-standard"
    "rtd-window-wallet-core"
    "rtd-slush-wallet"
    "rtd-dapp-kit"
)
