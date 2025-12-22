// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type { RtdWalletFeatures, WalletWithRequiredFeatures } from 'rtd-wallet-standard';
import { SLUSH_WALLET_NAME } from 'rtd-slush-wallet';

import { createInMemoryStore } from '../utils/stateStorage.js';

export const RTD_WALLET_NAME = 'Rtd Wallet';

export const DEFAULT_STORAGE =
	typeof window !== 'undefined' && window.localStorage ? localStorage : createInMemoryStore();

export const DEFAULT_STORAGE_KEY = 'rtd-dapp-kit:wallet-connection-info';

const SIGN_FEATURES = [
	'rtd:signTransaction',
	'rtd:signTransactionBlock',
] satisfies (keyof RtdWalletFeatures)[];

export const DEFAULT_WALLET_FILTER = (wallet: WalletWithRequiredFeatures) =>
	SIGN_FEATURES.some((feature) => wallet.features[feature]);

export const DEFAULT_PREFERRED_WALLETS = [RTD_WALLET_NAME, SLUSH_WALLET_NAME];
