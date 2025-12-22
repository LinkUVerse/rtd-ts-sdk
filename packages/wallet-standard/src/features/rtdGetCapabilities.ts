// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

export const RtdGetCapabilities = 'rtd:getCapabilities';

/** The latest API version of the getCapabilities API. */
export type RtdGetCapabilitiesVersion = '1.0.0';

/**
 * A Wallet Standard feature for reporting intents supported by the wallet.
 */
export type RtdGetCapabilitiesFeature = {
	[RtdGetCapabilities]: {
		version: RtdGetCapabilitiesVersion;
		getCapabilities: RtdGetCapabilitiesMethod;
	};
};

export type RtdGetCapabilitiesMethod = () => Promise<{
	supportedIntents?: string[];
}>;
