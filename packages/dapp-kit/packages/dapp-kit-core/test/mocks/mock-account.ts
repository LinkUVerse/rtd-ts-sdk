// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type { WalletAccount } from 'rtd-wallet-standard';
import { Ed25519Keypair } from 'rtd-typescript/keypairs/ed25519';
import { ReadonlyWalletAccount } from 'rtd-wallet-standard';
import { TEST_NETWORKS } from '../test-utils.js';

export function createMockAccount(options: Partial<WalletAccount> = {}) {
	const keypair = new Ed25519Keypair();
	return new ReadonlyWalletAccount({
		address: keypair.getPublicKey().toRtdAddress(),
		publicKey: keypair.getPublicKey().toRtdBytes(),
		chains: TEST_NETWORKS.map((network) => `rtd:${network}` as const),
		features: [
			'rtd:signAndExecuteTransactionBlock',
			'rtd:signTransactionBlock',
			'rtd:signAndExecuteTransaction',
			'rtd:signTransaction',
		],
		...options,
	});
}
