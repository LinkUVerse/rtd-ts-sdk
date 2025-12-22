// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { Ed25519Keypair } from 'rtd-typescript/keypairs/ed25519';
import type { WalletAccount } from 'rtd-wallet-standard';
import { ReadonlyWalletAccount } from 'rtd-wallet-standard';

export function createMockAccount(accountOverrides: Partial<WalletAccount> = {}) {
	const keypair = new Ed25519Keypair();
	return new ReadonlyWalletAccount({
		address: keypair.getPublicKey().toRtdAddress(),
		publicKey: keypair.getPublicKey().toRtdBytes(),
		chains: ['rtd:unknown'],
		features: [
			'rtd:signAndExecuteTransactionBlock',
			'rtd:signTransactionBlock',
			'rtd:signAndExecuteTransaction',
			'rtd:signTransaction',
		],
		...accountOverrides,
	});
}
