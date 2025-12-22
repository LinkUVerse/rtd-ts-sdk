// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type { IdentifierString, WalletAccount } from '@wallet-standard/core';

/** Name of the feature. */
export const RtdSignTransaction = 'rtd:signTransaction';

/** The latest API version of the signTransaction API. */
export type RtdSignTransactionVersion = '2.0.0';

/**
 * A Wallet Standard feature for signing a transaction, and returning the
 * serialized transaction and transaction signature.
 */
export type RtdSignTransactionFeature = {
	/** Namespace for the feature. */
	[RtdSignTransaction]: {
		/** Version of the feature API. */
		version: RtdSignTransactionVersion;
		signTransaction: RtdSignTransactionMethod;
	};
};

export type RtdSignTransactionMethod = (
	input: RtdSignTransactionInput,
) => Promise<SignedTransaction>;

/** Input for signing transactions. */
export interface RtdSignTransactionInput {
	transaction: { toJSON: () => Promise<string> };
	account: WalletAccount;
	chain: IdentifierString;
	signal?: AbortSignal;
}

/** Output of signing transactions. */

export interface SignedTransaction {
	/** Transaction as base64 encoded bcs. */
	bytes: string;
	/** Base64 encoded signature */
	signature: string;
}
