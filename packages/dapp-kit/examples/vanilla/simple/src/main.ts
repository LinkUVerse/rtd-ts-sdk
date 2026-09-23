// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { createDAppKit } from 'rtd-dapp-kit-core';
import { RtdGrpcClient } from 'rtd-typescript/grpc';

import 'rtd-dapp-kit-core/web';

const GRPC_URLS = {
	mainnet: 'https://fullnode.mainnet.rtd.life:443',
	testnet: 'https://fullnode.testnet.rtd.life:443',
};

const connectButton = document.querySelector('linku-dapp-kit-connect-button');

const dAppKit = createDAppKit({
	enableBurnerWallet: import.meta.env.DEV,
	networks: ['mainnet', 'testnet'],
	defaultNetwork: 'testnet',
	createClient(network) {
		return new RtdGrpcClient({ network, baseUrl: GRPC_URLS[network] });
	},
});

connectButton!.instance = dAppKit;
