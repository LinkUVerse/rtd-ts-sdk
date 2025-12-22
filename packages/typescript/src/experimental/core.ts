// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { TypeTagSerializer } from '../bcs/type-tag-serializer.js';
import type { TransactionPlugin } from '../transactions/index.js';
import { deriveDynamicFieldID } from '../utils/dynamic-fields.js';
import { normalizeStructTag, parseStructTag, RTD_ADDRESS_LENGTH } from '../utils/rtd-types.js';
import { Experimental_BaseClient } from './client.js';
import type { ClientWithExtensions, Experimental_RtdClientTypes } from './types.js';
import { MvrClient } from './mvr.js';

export type ClientWithCoreApi = ClientWithExtensions<{
	core: Experimental_CoreClient;
}>;

export interface Experimental_CoreClientOptions
	extends Experimental_RtdClientTypes.RtdClientOptions {
	base: Experimental_BaseClient;
	mvr?: Experimental_RtdClientTypes.MvrOptions;
}

const DEFAULT_MVR_URLS: Record<string, string> = {
	mainnet: 'https://mainnet.mvr.linkuverse.com',
	testnet: 'https://testnet.mvr.linkuverse.com',
};

export abstract class Experimental_CoreClient
	extends Experimental_BaseClient
	implements Experimental_RtdClientTypes.TransportMethods
{
	core = this;
	mvr: Experimental_RtdClientTypes.MvrMethods;

	constructor(options: Experimental_CoreClientOptions) {
		super(options);

		this.mvr = new MvrClient({
			cache: this.cache.scope('core.mvr'),
			url: options.mvr?.url ?? DEFAULT_MVR_URLS[this.network],
			pageSize: options.mvr?.pageSize,
			overrides: options.mvr?.overrides,
		});
	}

	abstract getObjects(
		options: Experimental_RtdClientTypes.GetObjectsOptions,
	): Promise<Experimental_RtdClientTypes.GetObjectsResponse>;

	async getObject(
		options: Experimental_RtdClientTypes.GetObjectOptions,
	): Promise<Experimental_RtdClientTypes.GetObjectResponse> {
		const { objectId } = options;
		const {
			objects: [result],
		} = await this.getObjects({ objectIds: [objectId], signal: options.signal });
		if (result instanceof Error) {
			throw result;
		}
		return { object: result };
	}

	abstract getCoins(
		options: Experimental_RtdClientTypes.GetCoinsOptions,
	): Promise<Experimental_RtdClientTypes.GetCoinsResponse>;

	abstract getOwnedObjects(
		options: Experimental_RtdClientTypes.GetOwnedObjectsOptions,
	): Promise<Experimental_RtdClientTypes.GetOwnedObjectsResponse>;

	abstract getBalance(
		options: Experimental_RtdClientTypes.GetBalanceOptions,
	): Promise<Experimental_RtdClientTypes.GetBalanceResponse>;

	abstract getAllBalances(
		options: Experimental_RtdClientTypes.GetAllBalancesOptions,
	): Promise<Experimental_RtdClientTypes.GetAllBalancesResponse>;

	abstract getTransaction(
		options: Experimental_RtdClientTypes.GetTransactionOptions,
	): Promise<Experimental_RtdClientTypes.GetTransactionResponse>;

	abstract executeTransaction(
		options: Experimental_RtdClientTypes.ExecuteTransactionOptions,
	): Promise<Experimental_RtdClientTypes.ExecuteTransactionResponse>;

	abstract dryRunTransaction(
		options: Experimental_RtdClientTypes.DryRunTransactionOptions,
	): Promise<Experimental_RtdClientTypes.DryRunTransactionResponse>;

	abstract getReferenceGasPrice(
		options?: Experimental_RtdClientTypes.GetReferenceGasPriceOptions,
	): Promise<Experimental_RtdClientTypes.GetReferenceGasPriceResponse>;

	abstract getDynamicFields(
		options: Experimental_RtdClientTypes.GetDynamicFieldsOptions,
	): Promise<Experimental_RtdClientTypes.GetDynamicFieldsResponse>;

	abstract resolveTransactionPlugin(): TransactionPlugin;

	abstract verifyZkLoginSignature(
		options: Experimental_RtdClientTypes.VerifyZkLoginSignatureOptions,
	): Promise<Experimental_RtdClientTypes.ZkLoginVerifyResponse>;

	abstract getMoveFunction(
		options: Experimental_RtdClientTypes.GetMoveFunctionOptions,
	): Promise<Experimental_RtdClientTypes.GetMoveFunctionResponse>;

	abstract defaultNameServiceName(
		options: Experimental_RtdClientTypes.DefaultNameServiceNameOptions,
	): Promise<Experimental_RtdClientTypes.DefaultNameServiceNameResponse>;

	async getDynamicField(
		options: Experimental_RtdClientTypes.GetDynamicFieldOptions,
	): Promise<Experimental_RtdClientTypes.GetDynamicFieldResponse> {
		const normalizedNameType = TypeTagSerializer.parseFromStr(
			(
				await this.core.mvr.resolveType({
					type: options.name.type,
				})
			).type,
		);
		const fieldId = deriveDynamicFieldID(options.parentId, normalizedNameType, options.name.bcs);
		const {
			objects: [fieldObject],
		} = await this.getObjects({
			objectIds: [fieldId],
			signal: options.signal,
		});

		if (fieldObject instanceof Error) {
			throw fieldObject;
		}

		const fieldType = parseStructTag(fieldObject.type);
		const content = await fieldObject.content;

		return {
			dynamicField: {
				id: fieldObject.id,
				digest: fieldObject.digest,
				version: fieldObject.version,
				type: fieldObject.type,
				previousTransaction: fieldObject.previousTransaction,
				name: {
					type:
						typeof fieldType.typeParams[0] === 'string'
							? fieldType.typeParams[0]
							: normalizeStructTag(fieldType.typeParams[0]),
					bcs: options.name.bcs,
				},
				value: {
					type:
						typeof fieldType.typeParams[1] === 'string'
							? fieldType.typeParams[1]
							: normalizeStructTag(fieldType.typeParams[1]),
					bcs: content.slice(RTD_ADDRESS_LENGTH + options.name.bcs.length),
				},
			},
		};
	}

	async waitForTransaction({
		signal,
		timeout = 60 * 1000,
		...input
	}: {
		/** An optional abort signal that can be used to cancel the wait. */
		signal?: AbortSignal;
		/** The amount of time to wait for transaction. Defaults to one minute. */
		timeout?: number;
	} & Experimental_RtdClientTypes.GetTransactionOptions): Promise<Experimental_RtdClientTypes.GetTransactionResponse> {
		const abortSignal = signal
			? AbortSignal.any([AbortSignal.timeout(timeout), signal])
			: AbortSignal.timeout(timeout);

		const abortPromise = new Promise((_, reject) => {
			abortSignal.addEventListener('abort', () => reject(abortSignal.reason));
		});

		abortPromise.catch(() => {
			// Swallow unhandled rejections that might be thrown after early return
		});

		// eslint-disable-next-line no-constant-condition
		while (true) {
			abortSignal.throwIfAborted();
			try {
				return await this.getTransaction({
					...input,
					signal: abortSignal,
				});
			} catch {
				await Promise.race([new Promise((resolve) => setTimeout(resolve, 2_000)), abortPromise]);
			}
		}
	}
}
