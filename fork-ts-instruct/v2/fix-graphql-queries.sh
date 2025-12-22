#!/bin/bash
# Copyright (c) Wenchuan Tech, Inc.
# SPDX-License-Identifier: Apache-2.0
#
# Script to fix GraphQL query files for RTD brand alignment
# - Replace Copyright
# - Replace SuiAddress -> RtdAddress
# - Replace Suins -> Rtdns

QUERIES_DIR="packages/typescript/src/graphql/queries"

echo "=== Fixing GraphQL Query Files ==="

# 1. Replace Copyright in all .graphql files
echo "1. Replacing Copyright..."
find "$QUERIES_DIR" -name "*.graphql" -exec sed -i '' 's/# Copyright (c) Mysten Labs, Inc./# Copyright (c) Wenchuan Tech, Inc./g' {} \;

# 2. Replace SuiAddress -> RtdAddress
echo "2. Replacing SuiAddress -> RtdAddress..."
find "$QUERIES_DIR" -name "*.graphql" -exec sed -i '' 's/SuiAddress/RtdAddress/g' {} \;

# 3. Replace Suins -> Rtdns (query name and field name)
echo "3. Replacing Suins -> Rtdns..."
find "$QUERIES_DIR" -name "*.graphql" -exec sed -i '' 's/defaultSuinsName/defaultRtdnsName/g' {} \;
find "$QUERIES_DIR" -name "*.graphql" -exec sed -i '' 's/SuinsRegistration/RtdnsRegistration/g' {} \;

echo "=== Done ==="
echo ""
echo "Modified files:"
git diff --name-only "$QUERIES_DIR"
