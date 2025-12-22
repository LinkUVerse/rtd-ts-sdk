// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type { SignedTransaction, RtdSignTransactionInput } from './rtdSignTransaction.js';

/** Name of the feature. */
export const RtdSignAndExecuteTransaction = 'rtd:signAndExecuteTransaction';

/** The latest API version of the signAndExecuteTransactionBlock API. */
export type RtdSignAndExecuteTransactionVersion = '2.0.0';

/**
 * A Wallet Standard feature for signing a transaction, and submitting it to the
 * network. The wallet is expected to submit the transaction to the network via RPC,
 * and return the transaction response.
 */
export type RtdSignAndExecuteTransactionFeature = {
	/** Namespace for the feature. */
	[RtdSignAndExecuteTransaction]: {
		/** Version of the feature API. */
		version: RtdSignAndExecuteTransactionVersion;
		signAndExecuteTransaction: RtdSignAndExecuteTransactionMethod;
	};
};

export type RtdSignAndExecuteTransactionMethod = (
	input: RtdSignAndExecuteTransactionInput,
) => Promise<RtdSignAndExecuteTransactionOutput>;

/** Input for signing and sending transactions. */
export interface RtdSignAndExecuteTransactionInput extends RtdSignTransactionInput {}

/** Output of signing and sending transactions. */
export interface RtdSignAndExecuteTransactionOutput extends SignedTransaction {
	digest: string;
	/** Transaction effects as base64 encoded bcs. */
	effects: string;
}
