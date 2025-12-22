// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type { Transaction } from 'rtd-typescript/transactions';
import type { IdentifierString, WalletAccount } from '@wallet-standard/core';

/** Name of the feature. */
export const RtdSignTransactionBlock = 'rtd:signTransactionBlock';

/** The latest API version of the signTransactionBlock API. */
export type RtdSignTransactionBlockVersion = '1.0.0';

/**
 * @deprecated Use `rtd:signTransaction` instead.
 *
 * A Wallet Standard feature for signing a transaction, and returning the
 * serialized transaction and transaction signature.
 */
export type RtdSignTransactionBlockFeature = {
	/** Namespace for the feature. */
	[RtdSignTransactionBlock]: {
		/** Version of the feature API. */
		version: RtdSignTransactionBlockVersion;
		/** @deprecated Use `rtd:signTransaction` instead. */
		signTransactionBlock: RtdSignTransactionBlockMethod;
	};
};

/** @deprecated Use `rtd:signTransaction` instead. */
export type RtdSignTransactionBlockMethod = (
	input: RtdSignTransactionBlockInput,
) => Promise<RtdSignTransactionBlockOutput>;

/** Input for signing transactions. */
export interface RtdSignTransactionBlockInput {
	transactionBlock: Transaction;
	account: WalletAccount;
	chain: IdentifierString;
}

/** Output of signing transactions. */
export interface RtdSignTransactionBlockOutput extends SignedTransactionBlock {}

export interface SignedTransactionBlock {
	/** Transaction as base64 encoded bcs. */
	transactionBlockBytes: string;
	/** Base64 encoded signature */
	signature: string;
}
