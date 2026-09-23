// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type {
	IdentifierRecord,
	StandardConnectFeature,
	StandardDisconnectFeature,
	StandardEventsFeature,
	WalletWithFeatures,
} from '@wallet-standard/core';

import type { RtdSignAndExecuteTransactionFeature } from './rtdSignAndExecuteTransaction.js';
import type { RtdSignAndExecuteTransactionBlockFeature } from './rtdSignAndExecuteTransactionBlock.js';
import type { RtdSignMessageFeature } from './rtdSignMessage.js';
import type { RtdSignPersonalMessageFeature } from './rtdSignPersonalMessage.js';
import type { RtdSignTransactionFeature } from './rtdSignTransaction.js';
import type { RtdSignTransactionBlockFeature } from './rtdSignTransactionBlock.js';
import type { RtdGetCapabilitiesFeature } from './rtdGetCapabilities.js';

/**
 * Wallet Standard features that are unique to Rtd, and that all Rtd wallets are expected to implement.
 */
export type RtdFeatures = Partial<RtdSignTransactionBlockFeature> &
	Partial<RtdSignAndExecuteTransactionBlockFeature> &
	RtdSignPersonalMessageFeature &
	RtdSignAndExecuteTransactionFeature &
	RtdSignTransactionFeature &
	// This deprecated feature should be removed once wallets update to the new method:
	Partial<RtdSignMessageFeature> &
	Partial<RtdGetCapabilitiesFeature>;

export type RtdWalletFeatures = StandardConnectFeature &
	StandardEventsFeature &
	RtdFeatures &
	// Disconnect is an optional feature:
	Partial<StandardDisconnectFeature>;

export type WalletWithRtdFeatures = WalletWithFeatures<RtdWalletFeatures>;

/**
 * Represents a wallet with the absolute minimum feature set required to function in the Rtd ecosystem.
 */
export type WalletWithRequiredFeatures = WalletWithFeatures<
	MinimallyRequiredFeatures &
		Partial<RtdFeatures> &
		Partial<StandardDisconnectFeature> &
		IdentifierRecord<unknown>
>;

export type MinimallyRequiredFeatures = StandardConnectFeature & StandardEventsFeature;

export * from './rtdSignMessage.js';
export * from './rtdSignTransactionBlock.js';
export * from './rtdSignTransaction.js';
export * from './rtdSignAndExecuteTransactionBlock.js';
export * from './rtdSignAndExecuteTransaction.js';
export * from './rtdSignPersonalMessage.js';
export * from './rtdGetCapabilities.js';
