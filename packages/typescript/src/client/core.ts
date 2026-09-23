// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { TypeTagSerializer } from '../bcs/type-tag-serializer.js';
import type { TransactionPlugin } from '../transactions/index.js';
import { deriveDynamicFieldID } from '../utils/dynamic-fields.js';
import { normalizeStructTag, parseStructTag, RTD_ADDRESS_LENGTH } from '../utils/rtd-types.js';
import { BaseClient } from './client.js';
import type { ClientWithExtensions, RtdClientTypes } from './types.js';
import { MvrClient } from './mvr.js';
import { bcs } from '../bcs/index.js';

export type ClientWithCoreApi = ClientWithExtensions<{
	core: CoreClient;
}>;

export interface CoreClientOptions extends RtdClientTypes.RtdClientOptions {
	base: BaseClient;
	mvr?: RtdClientTypes.MvrOptions;
}

const DEFAULT_MVR_URLS: Record<string, string> = {
	mainnet: 'https://mainnet.mvr.linkuverse.com',
	testnet: 'https://testnet.mvr.linkuverse.com',
};

export abstract class CoreClient extends BaseClient implements RtdClientTypes.TransportMethods {
	core = this;
	mvr: RtdClientTypes.MvrMethods;

	constructor(options: CoreClientOptions) {
		super(options);

		this.mvr = new MvrClient({
			cache: this.cache.scope('core.mvr'),
			url: options.mvr?.url ?? DEFAULT_MVR_URLS[this.network],
			pageSize: options.mvr?.pageSize,
			overrides: options.mvr?.overrides,
		});
	}

	abstract getObjects<Include extends RtdClientTypes.ObjectInclude = {}>(
		options: RtdClientTypes.GetObjectsOptions<Include>,
	): Promise<RtdClientTypes.GetObjectsResponse<Include>>;

	async getObject<Include extends RtdClientTypes.ObjectInclude = {}>(
		options: RtdClientTypes.GetObjectOptions<Include>,
	): Promise<RtdClientTypes.GetObjectResponse<Include>> {
		const { objectId } = options;
		const {
			objects: [result],
		} = await this.getObjects({
			objectIds: [objectId],
			signal: options.signal,
			include: options.include,
		});
		if (result instanceof Error) {
			throw result;
		}
		return { object: result };
	}

	abstract listCoins(
		options: RtdClientTypes.ListCoinsOptions,
	): Promise<RtdClientTypes.ListCoinsResponse>;

	abstract listOwnedObjects<Include extends RtdClientTypes.ObjectInclude = {}>(
		options: RtdClientTypes.ListOwnedObjectsOptions<Include>,
	): Promise<RtdClientTypes.ListOwnedObjectsResponse<Include>>;

	abstract getBalance(
		options: RtdClientTypes.GetBalanceOptions,
	): Promise<RtdClientTypes.GetBalanceResponse>;

	abstract listBalances(
		options: RtdClientTypes.ListBalancesOptions,
	): Promise<RtdClientTypes.ListBalancesResponse>;

	abstract getCoinMetadata(
		options: RtdClientTypes.GetCoinMetadataOptions,
	): Promise<RtdClientTypes.GetCoinMetadataResponse>;

	abstract getTransaction<Include extends RtdClientTypes.TransactionInclude = {}>(
		options: RtdClientTypes.GetTransactionOptions<Include>,
	): Promise<RtdClientTypes.TransactionResult<Include>>;

	abstract executeTransaction<Include extends RtdClientTypes.TransactionInclude = {}>(
		options: RtdClientTypes.ExecuteTransactionOptions<Include>,
	): Promise<RtdClientTypes.TransactionResult<Include>>;

	abstract simulateTransaction<Include extends RtdClientTypes.SimulateTransactionInclude = {}>(
		options: RtdClientTypes.SimulateTransactionOptions<Include>,
	): Promise<RtdClientTypes.SimulateTransactionResult<Include>>;

	abstract getReferenceGasPrice(
		options?: RtdClientTypes.GetReferenceGasPriceOptions,
	): Promise<RtdClientTypes.GetReferenceGasPriceResponse>;

	abstract getCurrentSystemState(
		options?: RtdClientTypes.GetCurrentSystemStateOptions,
	): Promise<RtdClientTypes.GetCurrentSystemStateResponse>;

	abstract getProtocolConfig(
		options?: RtdClientTypes.GetProtocolConfigOptions,
	): Promise<RtdClientTypes.GetProtocolConfigResponse>;

	abstract getChainIdentifier(
		options?: RtdClientTypes.GetChainIdentifierOptions,
	): Promise<RtdClientTypes.GetChainIdentifierResponse>;

	abstract listDynamicFields(
		options: RtdClientTypes.ListDynamicFieldsOptions,
	): Promise<RtdClientTypes.ListDynamicFieldsResponse>;

	abstract listTransactions<Include extends RtdClientTypes.TransactionInclude = {}>(
		options: RtdClientTypes.ListTransactionsOptions<Include>,
	): Promise<RtdClientTypes.ListTransactionsResponse<Include>>;

	abstract listEvents(
		options: RtdClientTypes.ListEventsOptions,
	): Promise<RtdClientTypes.ListEventsResponse>;

	abstract resolveTransactionPlugin(): TransactionPlugin;

	abstract verifyZkLoginSignature(
		options: RtdClientTypes.VerifyZkLoginSignatureOptions,
	): Promise<RtdClientTypes.ZkLoginVerifyResponse>;

	abstract getMoveFunction(
		options: RtdClientTypes.GetMoveFunctionOptions,
	): Promise<RtdClientTypes.GetMoveFunctionResponse>;

	abstract defaultNameServiceName(
		options: RtdClientTypes.DefaultNameServiceNameOptions,
	): Promise<RtdClientTypes.DefaultNameServiceNameResponse>;

	abstract resolveNameServiceAddress(
		options: RtdClientTypes.ResolveNameServiceAddressOptions,
	): Promise<RtdClientTypes.ResolveNameServiceAddressResponse>;

	async getDynamicField(
		options: RtdClientTypes.GetDynamicFieldOptions,
	): Promise<RtdClientTypes.GetDynamicFieldResponse> {
		const normalizedNameType = TypeTagSerializer.parseFromStr(
			(
				await this.core.mvr.resolveType({
					type: options.name.type,
					signal: options.signal,
				})
			).type,
		);
		const fieldId = deriveDynamicFieldID(options.parentId, normalizedNameType, options.name.bcs);
		const {
			objects: [fieldObject],
		} = await this.getObjects({
			objectIds: [fieldId],
			signal: options.signal,
			include: {
				previousTransaction: true,
				content: true,
			},
		});

		if (fieldObject instanceof Error) {
			throw fieldObject;
		}

		const fieldType = parseStructTag(fieldObject.type);
		const content = await fieldObject.content;

		const nameTypeParam = fieldType.typeParams[0];
		const isDynamicObject =
			typeof nameTypeParam !== 'string' &&
			nameTypeParam.module === 'dynamic_object_field' &&
			nameTypeParam.name === 'Wrapper';

		const valueBcs = content.slice(RTD_ADDRESS_LENGTH + options.name.bcs.length);

		const valueType =
			typeof fieldType.typeParams[1] === 'string'
				? fieldType.typeParams[1]
				: normalizeStructTag(fieldType.typeParams[1]);

		return {
			dynamicField: {
				$kind: isDynamicObject ? 'DynamicObject' : 'DynamicField',
				fieldId: fieldObject.objectId,
				digest: fieldObject.digest,
				version: fieldObject.version,
				type: fieldObject.type,
				previousTransaction: fieldObject.previousTransaction,
				name: {
					type:
						typeof nameTypeParam === 'string' ? nameTypeParam : normalizeStructTag(nameTypeParam),
					bcs: options.name.bcs,
				},
				value: {
					type: valueType,
					bcs: valueBcs,
				},
				childId: isDynamicObject ? bcs.Address.parse(valueBcs) : undefined,
			} as RtdClientTypes.GetDynamicFieldResponse['dynamicField'],
		};
	}

	async getDynamicObjectField<Include extends RtdClientTypes.ObjectInclude = {}>(
		options: RtdClientTypes.GetDynamicObjectFieldOptions<Include>,
	): Promise<RtdClientTypes.GetDynamicObjectFieldResponse<Include>> {
		const resolvedNameType = (
			await this.core.mvr.resolveType({
				type: options.name.type,
				signal: options.signal,
			})
		).type;
		const wrappedType = `0x2::dynamic_object_field::Wrapper<${resolvedNameType}>`;

		const { dynamicField } = await this.getDynamicField({
			parentId: options.parentId,
			name: {
				type: wrappedType,
				bcs: options.name.bcs,
			},
			signal: options.signal,
		});

		const { object } = await this.getObject({
			objectId: dynamicField.childId!,
			signal: options.signal,
			include: options.include,
		});

		return { object };
	}

	async waitForTransaction<Include extends RtdClientTypes.TransactionInclude = {}>(
		options: RtdClientTypes.WaitForTransactionOptions<Include>,
	): Promise<RtdClientTypes.TransactionResult<Include>> {
		const { signal, timeout = 60 * 1000, pollSchedule, include } = options;

		const digest =
			'result' in options && options.result
				? (options.result.Transaction ?? options.result.FailedTransaction)!.digest
				: options.digest;

		const abortSignal = signal
			? AbortSignal.any([AbortSignal.timeout(timeout), signal])
			: AbortSignal.timeout(timeout);

		const abortPromise = new Promise((_, reject) => {
			abortSignal.addEventListener('abort', () => reject(abortSignal.reason));
		});

		abortPromise.catch(() => {
			// Swallow unhandled rejections that might be thrown after early return
		});

		// Default schedule tuned to testnet measurements:
		// - Fullnode (gRPC/JSON-RPC): p50=130ms, p95=330ms
		// - GraphQL indexer: p50=1300ms, p95=1430ms
		// After schedule exhausted, repeats the last interval.
		const schedule = pollSchedule ?? [0, 300, 600, 1500, 3500];
		const t0 = Date.now();
		let scheduleIndex = 0;
		const lastInterval =
			schedule.length > 0
				? schedule[schedule.length - 1] - (schedule[schedule.length - 2] ?? 0)
				: 2_000;

		while (true) {
			if (scheduleIndex < schedule.length) {
				const remaining = t0 + schedule[scheduleIndex] - Date.now();
				scheduleIndex++;
				if (remaining > 0) {
					await Promise.race([
						new Promise((resolve) => setTimeout(resolve, remaining)),
						abortPromise,
					]);
				}
			} else {
				await Promise.race([
					new Promise((resolve) => setTimeout(resolve, lastInterval)),
					abortPromise,
				]);
			}

			abortSignal.throwIfAborted();
			try {
				return await this.getTransaction({
					digest,
					include,
					signal: abortSignal,
				});
			} catch {}
		}
	}

	async signAndExecuteTransaction<Include extends RtdClientTypes.TransactionInclude = {}>({
		transaction,
		signer,
		additionalSignatures = [],
		...input
	}: RtdClientTypes.SignAndExecuteTransactionOptions<Include>): Promise<
		RtdClientTypes.TransactionResult<Include>
	> {
		let transactionBytes;

		if (transaction instanceof Uint8Array) {
			transactionBytes = transaction;
		} else {
			transaction.setSenderIfNotSet(signer.toRtdAddress());
			transactionBytes = await transaction.build({ client: this });
		}

		const { signature } = await signer.signTransaction(transactionBytes);

		return this.executeTransaction({
			transaction: transactionBytes,
			signatures: [signature, ...additionalSignatures],
			...input,
		});
	}
}
