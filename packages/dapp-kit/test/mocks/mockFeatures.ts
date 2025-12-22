// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type { IdentifierRecord, RtdFeatures, RtdSignMessageFeature } from 'rtd-wallet-standard';

export const signMessageFeature: RtdSignMessageFeature = {
	'rtd:signMessage': {
		version: '1.0.0',
		signMessage: vi.fn(),
	},
};

export const superCoolFeature: IdentifierRecord<unknown> = {
	'my-dapp:super-cool-feature': {
		version: '1.0.0',
		superCoolFeature: vi.fn(),
	},
};

export const rtdFeatures: RtdFeatures = {
	...signMessageFeature,
	'rtd:signPersonalMessage': {
		version: '1.1.0',
		signPersonalMessage: vi.fn(),
	},
	'rtd:signTransactionBlock': {
		version: '1.0.0',
		signTransactionBlock: vi.fn(),
	},
	'rtd:signTransaction': {
		version: '2.0.0',
		signTransaction: vi.fn(),
	},
	'rtd:signAndExecuteTransactionBlock': {
		version: '1.0.0',
		signAndExecuteTransactionBlock: vi.fn(),
	},
	'rtd:signAndExecuteTransaction': {
		version: '2.0.0',
		signAndExecuteTransaction: vi.fn(),
	},
	'rtd:reportTransactionEffects': {
		version: '1.0.0',
		reportTransactionEffects: vi.fn(),
	},
};
