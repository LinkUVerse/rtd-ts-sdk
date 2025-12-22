// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type { WalletAccount } from '@wallet-standard/core';

/**
 * Name of the feature.
 * @deprecated Wallets can still implement this method for compatibility, but this has been replaced by the `rtd:signPersonalMessage` feature
 **/
export const RtdSignMessage = 'rtd:signMessage';

/**
 * The latest API version of the signMessage API.
 * @deprecated Wallets can still implement this method for compatibility, but this has been replaced by the `rtd:signPersonalMessage` feature
 */
export type RtdSignMessageVersion = '1.0.0';

/**
 * A Wallet Standard feature for signing a personal message, and returning the
 * message bytes that were signed, and message signature.
 *
 * @deprecated Wallets can still implement this method for compatibility, but this has been replaced by the `rtd:signPersonalMessage` feature
 */
export type RtdSignMessageFeature = {
	/** Namespace for the feature. */
	[RtdSignMessage]: {
		/** Version of the feature API. */
		version: RtdSignMessageVersion;
		signMessage: RtdSignMessageMethod;
	};
};

/** @deprecated Wallets can still implement this method for compatibility, but this has been replaced by the `rtd:signPersonalMessage` feature */
export type RtdSignMessageMethod = (input: RtdSignMessageInput) => Promise<RtdSignMessageOutput>;

/**
 * Input for signing messages.
 * @deprecated Wallets can still implement this method for compatibility, but this has been replaced by the `rtd:signPersonalMessage` feature
 */
export interface RtdSignMessageInput {
	message: Uint8Array;
	account: WalletAccount;
}

/**
 * Output of signing messages.
 * @deprecated Wallets can still implement this method for compatibility, but this has been replaced by the `rtd:signPersonalMessage` feature
 */
export interface RtdSignMessageOutput {
	/** Base64 message bytes. */
	messageBytes: string;
	/** Base64 encoded signature */
	signature: string;
}
