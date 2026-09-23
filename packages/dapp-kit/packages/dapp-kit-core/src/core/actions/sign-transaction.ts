// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type { DAppKitStores } from '../store.js';
import { RtdSignTransaction, RtdSignTransactionBlock } from 'rtd-wallet-standard';
import type {
	RtdSignTransactionBlockFeature,
	RtdSignTransactionFeature,
	RtdSignTransactionInput,
} from 'rtd-wallet-standard';
import { getWalletAccountForUiWalletAccount } from '@wallet-standard/ui-registry';
import type { UiWalletAccount } from '@wallet-standard/ui';
import { FeatureNotSupportedError } from '../../utils/errors.js';
import { getChain } from '../../utils/networks.js';
import type { Networks } from '../../utils/networks.js';
import { Transaction } from 'rtd-typescript/transactions';
import { resolveSigningAccount, tryGetAccountFeature } from '../../utils/wallets.js';
import type { DAppKitCompatibleClient } from '../types.js';

export type SignTransactionArgs<TNetworks extends Networks = Networks> = {
	transaction: Transaction | string;
	/** The account to sign with. Defaults to the currently connected account. */
	account?: UiWalletAccount;
	/** The network to sign against. Defaults to the dApp kit's current network. */
	network?: TNetworks[number];
} & Omit<RtdSignTransactionInput, 'account' | 'chain' | 'transaction'>;

export function signTransactionCreator<TNetworks extends Networks>(
	{ $connection, $currentNetwork }: DAppKitStores<TNetworks>,
	getClient: (network: TNetworks[number]) => DAppKitCompatibleClient,
) {
	/**
	 * Prompts the specified wallet account to sign a transaction.
	 */
	return async function signTransaction({
		transaction,
		account: accountOverride,
		network,
		...standardArgs
	}: SignTransactionArgs<TNetworks>) {
		const connection = $connection.get();
		const account = resolveSigningAccount(connection, accountOverride);
		const supportedIntents = [...connection.supportedIntents];

		const underlyingAccount = getWalletAccountForUiWalletAccount(account);
		const resolvedNetwork = network ?? $currentNetwork.get();
		const rtdClient = getClient(resolvedNetwork);
		const chain = getChain(resolvedNetwork);

		const transactionWrapper = {
			toJSON: async () => {
				if (typeof transaction === 'string') {
					return transaction;
				}

				transaction.setSenderIfNotSet(account.address);
				return await transaction.toJSON({ client: rtdClient, supportedIntents });
			},
		};

		const signTransactionFeature = tryGetAccountFeature({
			account,
			chain,
			featureName: RtdSignTransaction,
		}) as RtdSignTransactionFeature[typeof RtdSignTransaction];

		if (signTransactionFeature) {
			return await signTransactionFeature.signTransaction({
				...standardArgs,
				transaction: transactionWrapper,
				account: underlyingAccount,
				chain,
			});
		}

		const signTransactionBlockFeature = tryGetAccountFeature({
			account,
			chain,
			featureName: RtdSignTransactionBlock,
		}) as RtdSignTransactionBlockFeature[typeof RtdSignTransactionBlock];

		if (signTransactionBlockFeature) {
			const transaction = Transaction.from(await transactionWrapper.toJSON());
			const { transactionBlockBytes, signature } =
				await signTransactionBlockFeature.signTransactionBlock({
					transactionBlock: transaction,
					account: underlyingAccount,
					chain,
				});

			return { bytes: transactionBlockBytes, signature };
		}

		throw new FeatureNotSupportedError(
			`The account ${account.address} does not support signing transactions.`,
		);
	};
}
