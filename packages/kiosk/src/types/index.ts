// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type { ClientWithCoreApi, RtdClientTypes } from 'rtd-typescript/client';
import type { TransactionObjectArgument } from 'rtd-typescript/transactions';

import type { BaseRulePackageIds } from '../constants.js';

export * from './kiosk.js';
export * from './transfer-policy.js';

/**
 * A valid argument for any of the Kiosk functions.
 */
export type ObjectArgument = string | TransactionObjectArgument;

/**
 * The Client Options for Both KioskClient & TransferPolicyManager.
 */
export type KioskClientOptions = {
	client: KioskCompatibleClient;
	network: RtdClientTypes.Network;
	packageIds?: BaseRulePackageIds;
};

export type KioskCompatibleClient = ClientWithCoreApi;

export type KioskPaginationArguments = {
	cursor?: string | null;
	limit?: number | null;
};
