// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

/**
 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
 */
export function getJsonRpcFullnodeUrl(network: 'mainnet' | 'testnet' | 'devnet' | 'localnet') {
	switch (network) {
		case 'mainnet':
			return 'https://fullnode.mainnet.rtd.life:443';
		case 'testnet':
			return 'https://fullnode.testnet.rtd.life:443';
		case 'devnet':
			return 'https://fullnode.devnet.rtd.life:443';
		case 'localnet':
			return 'http://127.0.0.1:9000';
		default:
			throw new Error(`Unknown network: ${network}`);
	}
}
