// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { createDAppKit } from 'rtd-dapp-kit-react';
import { RtdGrpcClient } from 'rtd-typescript/grpc';

const GRPC_URLS = {
	mainnet: 'https://fullnode.mainnet.rtd.life:443',
	testnet: 'https://fullnode.testnet.rtd.life:443',
} as const;

export const dAppKit = createDAppKit({
	enableBurnerWallet: process.env.NODE_ENV === 'development',
	networks: ['mainnet', 'testnet'],
	defaultNetwork: 'testnet',
	createClient(network) {
		return new RtdGrpcClient({ network, baseUrl: GRPC_URLS[network] });
	},
});

// global type registration necessary for the hooks to work correctly
declare module 'rtd-dapp-kit-react' {
	interface Register {
		dAppKit: typeof dAppKit;
	}
}
