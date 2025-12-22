// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type {
	ExecuteTransactionRequestType,
	RtdTransactionBlockResponse,
	RtdTransactionBlockResponseOptions,
} from 'rtd-typescript/client';

import type { RtdSignTransactionBlockInput } from './rtdSignTransactionBlock.js';

/** Name of the feature. */
export const RtdSignAndExecuteTransactionBlock = 'rtd:signAndExecuteTransactionBlock';

/** The latest API version of the signAndExecuteTransactionBlock API. */
export type RtdSignAndExecuteTransactionBlockVersion = '1.0.0';

/**
 * @deprecated Use `rtd:signAndExecuteTransaction` instead.
 *
 * A Wallet Standard feature for signing a transaction, and submitting it to the
 * network. The wallet is expected to submit the transaction to the network via RPC,
 * and return the transaction response.
 */
export type RtdSignAndExecuteTransactionBlockFeature = {
	/** Namespace for the feature. */
	[RtdSignAndExecuteTransactionBlock]: {
		/** Version of the feature API. */
		version: RtdSignAndExecuteTransactionBlockVersion;
		/** @deprecated Use `rtd:signAndExecuteTransaction` instead. */
		signAndExecuteTransactionBlock: RtdSignAndExecuteTransactionBlockMethod;
	};
};

/** @deprecated Use `rtd:signAndExecuteTransaction` instead. */
export type RtdSignAndExecuteTransactionBlockMethod = (
	input: RtdSignAndExecuteTransactionBlockInput,
) => Promise<RtdSignAndExecuteTransactionBlockOutput>;

/** Input for signing and sending transactions. */
export interface RtdSignAndExecuteTransactionBlockInput extends RtdSignTransactionBlockInput {
	/**
	 * @deprecated requestType will be ignored by JSON RPC in the future
	 */
	requestType?: ExecuteTransactionRequestType;
	/** specify which fields to return (e.g., transaction, effects, events, etc). By default, only the transaction digest will be returned. */
	options?: RtdTransactionBlockResponseOptions;
}

/** Output of signing and sending transactions. */
export interface RtdSignAndExecuteTransactionBlockOutput extends RtdTransactionBlockResponse {}
