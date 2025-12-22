// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type { IdentifierString, WalletAccount } from '@wallet-standard/core';

/** Name of the feature. */
export const RtdSignPersonalMessage = 'rtd:signPersonalMessage';

/** The latest API version of the signPersonalMessage API. */
export type RtdSignPersonalMessageVersion = '1.1.0';

/**
 * A Wallet Standard feature for signing a personal message, and returning the
 * message bytes that were signed, and message signature.
 */
export type RtdSignPersonalMessageFeature = {
	/** Namespace for the feature. */
	[RtdSignPersonalMessage]: {
		/** Version of the feature API. */
		version: RtdSignPersonalMessageVersion;
		signPersonalMessage: RtdSignPersonalMessageMethod;
	};
};

export type RtdSignPersonalMessageMethod = (
	input: RtdSignPersonalMessageInput,
) => Promise<RtdSignPersonalMessageOutput>;

/** Input for signing personal messages. */
export interface RtdSignPersonalMessageInput {
	message: Uint8Array;
	account: WalletAccount;
	chain?: IdentifierString;
}

/** Output of signing personal messages. */
export interface RtdSignPersonalMessageOutput extends SignedPersonalMessage {}

export interface SignedPersonalMessage {
	/** Base64 encoded message bytes */
	bytes: string;
	/** Base64 encoded signature */
	signature: string;
}
