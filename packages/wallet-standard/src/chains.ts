// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type { IdentifierString } from '@wallet-standard/core';

/** Rtd Devnet */
export const RTD_DEVNET_CHAIN = 'rtd:devnet';

/** Rtd Testnet */
export const RTD_TESTNET_CHAIN = 'rtd:testnet';

/** Rtd Localnet */
export const RTD_LOCALNET_CHAIN = 'rtd:localnet';

/** Rtd Mainnet */
export const RTD_MAINNET_CHAIN = 'rtd:mainnet';

export const RTD_CHAINS = [
	RTD_DEVNET_CHAIN,
	RTD_TESTNET_CHAIN,
	RTD_LOCALNET_CHAIN,
	RTD_MAINNET_CHAIN,
] as const;

export type RtdChain = (typeof RTD_CHAINS)[number];

/**
 * Utility that returns whether or not a chain identifier is a valid Rtd chain.
 * @param chain a chain identifier in the form of `${string}:{$string}`
 */
export function isRtdChain(chain: IdentifierString): chain is RtdChain {
	return RTD_CHAINS.includes(chain as RtdChain);
}
