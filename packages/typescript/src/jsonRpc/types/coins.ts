// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

/**
 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
 */
export type CoinBalance = {
	coinType: string;
	coinObjectCount: number;
	totalBalance: string;
	lockedBalance: Record<string, string>;
	fundsInAddressBalance?: string;
};
