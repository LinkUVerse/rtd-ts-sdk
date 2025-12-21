#!/bin/bash
# config.sh - RTD SDK Fork Configuration
# Copyright (c) LinkU Labs. All rights reserved.

# ============================================
# Directory Configuration
# ============================================

# Source directory (original Sui SDK)
SOURCE_ROOT="/Users/changzechuan/WenchuanProjects/SuiTestProjects/ts-sdks"

# Target directory (new RTD SDK)
TARGET_ROOT="/Users/changzechuan/WenchuanProjects/SuiTestProjects/rtd-typescript/rtd-ts-sdk"

# ============================================
# Packages to Copy (in dependency order)
# ============================================

PACKAGES=(
    "packages/build-scripts"
    "packages/utils"
    "packages/bcs"
    "packages/typescript"
)

# ============================================
# Root Configuration Files to Copy
# ============================================

ROOT_FILES=(
    "package.json"
    "pnpm-workspace.yaml"
    "turbo.json"
    ".gitignore"
)

# Optional root files (copy if exist)
OPTIONAL_ROOT_FILES=(
    ".eslintrc.js"
    "eslint.config.mjs"
    ".prettierignore"
    "prettier.config.js"
    ".gitattributes"
    "tsconfig.json"
    ".npmrc"
)

# ============================================
# Brand Replacement Rules
# ============================================

# Organization names
OLD_ORG="MystenLabs"
NEW_ORG="LinkUVerse"

OLD_ORG_FULL="Mysten Labs"
NEW_ORG_FULL="LinkU Labs"

# Domain names
OLD_DOMAIN="mystenlabs.com"
NEW_DOMAIN="linkuverse.com"

# Brand names (case variants)
OLD_UPPER="SUI"
NEW_UPPER="RTD"

OLD_MIXED="Sui"
NEW_MIXED="Rtd"

OLD_LOWER="sui"
NEW_LOWER="rtd"

# ============================================
# NPM Package Names (as arrays)
# ============================================

NPM_OLD_NAMES=(
    "@mysten/sui"
    "@mysten/bcs"
    "@mysten/utils"
    "@mysten/build-scripts"
)

NPM_NEW_NAMES=(
    "@linku/rtd"
    "@linku/bcs"
    "@linku/utils"
    "@linku/build-scripts"
)

# ============================================
# Network Endpoints (as arrays)
# ============================================

ENDPOINT_OLD=(
    "fullnode.mainnet.sui.io"
    "fullnode.testnet.sui.io"
    "fullnode.devnet.sui.io"
    "faucet.testnet.sui.io"
    "faucet.devnet.sui.io"
    "mainnet.sui.io"
    "testnet.sui.io"
    "devnet.sui.io"
)

ENDPOINT_NEW=(
    "fullnode.mainnet.rtd.life"
    "fullnode.testnet.rtd.life"
    "fullnode.devnet.rtd.life"
    "faucet.testnet.rtd.life"
    "faucet.devnet.rtd.life"
    "mainnet.rtd.life"
    "testnet.rtd.life"
    "devnet.rtd.life"
)

# ============================================
# Type and Function Name Replacements (as arrays)
# ============================================

TYPE_OLD=(
    # Client types
    "SuiClient"
    "SuiGraphQLClient"
    "SuiGrpcClient"
    "SuiHTTPTransport"
    "SuiTransport"
    # Data types
    "SuiObjectRef"
    "SuiObjectData"
    "SuiObjectResponse"
    "SuiParsedData"
    "SuiRawData"
    "SuiMoveObject"
    "SuiMovePackage"
    "SuiMoveNormalizedType"
    "SuiMoveNormalizedFunction"
    "SuiMoveNormalizedModule"
    "SuiMoveNormalizedStruct"
    "SuiEvent"
    "SuiObjectChange"
    "SuiTransactionBlock"
    "SuiTransactionBlockResponse"
    "SuiTransactionBlockResponseOptions"
    "SuiExecutionResult"
    "SuiCallArg"
    "SuiAddress"
    "SuiObjectDataOptions"
    "SuiObjectDataFilter"
    # Validation functions
    "isValidSuiAddress"
    "isValidSuiObjectId"
    "normalizeSuiAddress"
    "normalizeSuiObjectId"
    # Faucet functions
    "requestSuiFromFaucetV0"
    "requestSuiFromFaucetV1"
    "requestSuiFromFaucetV2"
    # Cryptography
    "toSuiAddress"
    "toSuiPublicKey"
    "toSuiBytes"
    "decodeSuiPrivateKey"
    "encodeSuiPrivateKey"
    # Name Service
    "SuiNS"
    "isValidSuiNSName"
    "normalizeSuiNSName"
)

TYPE_NEW=(
    # Client types
    "RtdClient"
    "RtdGraphQLClient"
    "RtdGrpcClient"
    "RtdHTTPTransport"
    "RtdTransport"
    # Data types
    "RtdObjectRef"
    "RtdObjectData"
    "RtdObjectResponse"
    "RtdParsedData"
    "RtdRawData"
    "RtdMoveObject"
    "RtdMovePackage"
    "RtdMoveNormalizedType"
    "RtdMoveNormalizedFunction"
    "RtdMoveNormalizedModule"
    "RtdMoveNormalizedStruct"
    "RtdEvent"
    "RtdObjectChange"
    "RtdTransactionBlock"
    "RtdTransactionBlockResponse"
    "RtdTransactionBlockResponseOptions"
    "RtdExecutionResult"
    "RtdCallArg"
    "RtdAddress"
    "RtdObjectDataOptions"
    "RtdObjectDataFilter"
    # Validation functions
    "isValidRtdAddress"
    "isValidRtdObjectId"
    "normalizeRtdAddress"
    "normalizeRtdObjectId"
    # Faucet functions
    "requestRtdFromFaucetV0"
    "requestRtdFromFaucetV1"
    "requestRtdFromFaucetV2"
    # Cryptography
    "toRtdAddress"
    "toRtdPublicKey"
    "toRtdBytes"
    "decodeRtdPrivateKey"
    "encodeRtdPrivateKey"
    # Name Service
    "RtdNS"
    "isValidRtdNSName"
    "normalizeRtdNSName"
)

# ============================================
# Constant Replacements (as arrays)
# ============================================

CONST_OLD=(
    "SUI_DECIMALS"
    "SUI_ADDRESS_LENGTH"
    "SUI_FRAMEWORK_ADDRESS"
    "SUI_SYSTEM_ADDRESS"
    "SUI_CLOCK_OBJECT_ID"
    "SUI_SYSTEM_MODULE_NAME"
    "SUI_TYPE_ARG"
    "SUI_SYSTEM_STATE_OBJECT_ID"
    "SUI_RANDOM_OBJECT_ID"
    "SUI_PRIVATE_KEY_PREFIX"
    "MIST_PER_SUI"
    "SUI_NS_NAME_REGEX"
    "SUI_NS_DOMAIN_REGEX"
    "MAX_SUI_NS_NAME_LENGTH"
    "SUI_CLIENT_BRAND"
)

CONST_NEW=(
    "RTD_DECIMALS"
    "RTD_ADDRESS_LENGTH"
    "RTD_FRAMEWORK_ADDRESS"
    "RTD_SYSTEM_ADDRESS"
    "RTD_CLOCK_OBJECT_ID"
    "RTD_SYSTEM_MODULE_NAME"
    "RTD_TYPE_ARG"
    "RTD_SYSTEM_STATE_OBJECT_ID"
    "RTD_RANDOM_OBJECT_ID"
    "RTD_PRIVATE_KEY_PREFIX"
    "MIST_PER_RTD"
    "RTD_NS_NAME_REGEX"
    "RTD_NS_DOMAIN_REGEX"
    "MAX_RTD_NS_NAME_LENGTH"
    "RTD_CLIENT_BRAND"
)

# ============================================
# File Renames (as arrays)
# ============================================

FILE_OLD_NAMES=(
    "sui-types.ts"
    "suins.ts"
)

FILE_NEW_NAMES=(
    "rtd-types.ts"
    "rtdns.ts"
)

# ============================================
# Special String Replacements
# ============================================

# Private key prefix (Bech32)
OLD_PRIVKEY_PREFIX="suiprivkey"
NEW_PRIVKEY_PREFIX="rtdprivkey"

# Domain suffix for name service
OLD_DOMAIN_SUFFIX=".sui"
NEW_DOMAIN_SUFFIX=".rtd"

# Move type paths (these ARE replaced since RTD chain has renamed them)
OLD_MOVE_COIN_TYPE="::sui::SUI"
NEW_MOVE_COIN_TYPE="::rtd::RTD"

OLD_SYSTEM_MODULE="sui_system"
NEW_SYSTEM_MODULE="rtd_system"

# ============================================
# Logging Configuration
# ============================================

LOG_LEVEL="INFO"  # DEBUG, INFO, WARN, ERROR
LOG_FILE=""       # Set to a path to enable file logging
