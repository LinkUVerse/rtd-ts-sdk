// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { Experimental_CoreClient } from '../experimental/core.js';
import type { Experimental_RtdClientTypes } from '../experimental/types.js';
import type { GraphQLQueryOptions, RtdGraphQLClient } from './client.js';
import type {
	Object_Owner_FieldsFragment,
	Transaction_FieldsFragment,
} from './generated/queries.js';
import {
	DefaultRtdnsNameDocument,
	ExecuteTransactionDocument,
	GetAllBalancesDocument,
	GetBalanceDocument,
	GetCoinsDocument,
	GetDynamicFieldsDocument,
	GetMoveFunctionDocument,
	GetOwnedObjectsDocument,
	GetReferenceGasPriceDocument,
	GetTransactionBlockDocument,
	MultiGetObjectsDocument,
	SimulateTransactionDocument,
	VerifyZkLoginSignatureDocument,
	ZkLoginIntentScope,
} from './generated/queries.js';
import { ObjectError } from '../experimental/errors.js';
import { chunk, fromBase64, toBase64 } from 'rtd-utils';
import { normalizeStructTag, normalizeRtdAddress } from '../utils/rtd-types.js';
import { deriveDynamicFieldID } from '../utils/dynamic-fields.js';
import {
	parseTransactionBcs,
	parseTransactionEffectsBcs,
} from '../experimental/transports/utils.js';
import type { OpenMoveTypeSignatureBody, OpenMoveTypeSignature } from './types.js';

export class GraphQLCoreClient extends Experimental_CoreClient {
	#graphqlClient: RtdGraphQLClient;

	constructor({
		graphqlClient,
		mvr,
	}: {
		graphqlClient: RtdGraphQLClient;
		mvr?: Experimental_RtdClientTypes.MvrOptions;
	}) {
		super({ network: graphqlClient.network, base: graphqlClient, mvr });
		this.#graphqlClient = graphqlClient;
	}

	async #graphqlQuery<
		Result = Record<string, unknown>,
		Variables = Record<string, unknown>,
		Data = Result,
	>(
		options: GraphQLQueryOptions<Result, Variables>,
		getData?: (result: Result) => Data,
	): Promise<NonNullable<Data>> {
		const { data, errors } = await this.#graphqlClient.query(options);

		handleGraphQLErrors(errors);

		const extractedData = data && (getData ? getData(data) : data);

		if (extractedData == null) {
			throw new Error('Missing response data');
		}

		return extractedData as NonNullable<Data>;
	}

	async getObjects(
		options: Experimental_RtdClientTypes.GetObjectsOptions,
	): Promise<Experimental_RtdClientTypes.GetObjectsResponse> {
		const batches = chunk(options.objectIds, 50);
		const results: Experimental_RtdClientTypes.GetObjectsResponse['objects'] = [];

		for (const batch of batches) {
			const page = await this.#graphqlQuery(
				{
					query: MultiGetObjectsDocument,
					variables: {
						objectKeys: batch.map((address) => ({ address })),
					},
				},
				(result) => result.multiGetObjects,
			);
			results.push(
				...batch
					.map((id) => normalizeRtdAddress(id))
					.map(
						(id) =>
							page.find((obj) => obj?.address === id) ??
							new ObjectError('notFound', `Object ${id} not found`),
					)
					.map((obj) => {
						if (obj instanceof ObjectError) {
							return obj;
						}
						return {
							id: obj.address,
							version: obj.version?.toString()!,
							digest: obj.digest!,
							owner: mapOwner(obj.owner!),
							type: obj.asMoveObject?.contents?.type?.repr!,
							content: Promise.resolve(
								obj.asMoveObject?.contents?.bcs
									? fromBase64(obj.asMoveObject.contents.bcs)
									: new Uint8Array(),
							),
							previousTransaction: obj.previousTransaction?.digest ?? null,
						};
					}),
			);
		}

		return {
			objects: results,
		};
	}
	async getOwnedObjects(
		options: Experimental_RtdClientTypes.GetOwnedObjectsOptions,
	): Promise<Experimental_RtdClientTypes.GetOwnedObjectsResponse> {
		const objects = await this.#graphqlQuery(
			{
				query: GetOwnedObjectsDocument,
				variables: {
					owner: options.address,
					limit: options.limit,
					cursor: options.cursor,
					filter: options.type
						? { type: (await this.mvr.resolveType({ type: options.type })).type }
						: undefined,
				},
			},
			(result) => result.address?.objects,
		);

		return {
			objects: objects.nodes.map((obj) => ({
				id: obj.address,
				version: obj.version?.toString()!,
				digest: obj.digest!,
				owner: mapOwner(obj.owner!),
				type: obj.contents?.type?.repr!,
				content: Promise.resolve(
					obj.contents?.bcs ? fromBase64(obj.contents.bcs) : new Uint8Array(),
				),
				previousTransaction: obj.previousTransaction?.digest ?? null,
			})),
			hasNextPage: objects.pageInfo.hasNextPage,
			cursor: objects.pageInfo.endCursor ?? null,
		};
	}
	async getCoins(
		options: Experimental_RtdClientTypes.GetCoinsOptions,
	): Promise<Experimental_RtdClientTypes.GetCoinsResponse> {
		const coins = await this.#graphqlQuery(
			{
				query: GetCoinsDocument,
				variables: {
					owner: options.address,
					cursor: options.cursor,
					first: options.limit,
					type: `0x2::coin::Coin<${(await this.mvr.resolveType({ type: options.coinType })).type}>`,
				},
			},
			(result) => result.address?.objects,
		);

		return {
			cursor: coins.pageInfo.endCursor ?? null,
			hasNextPage: coins.pageInfo.hasNextPage,
			objects: coins.nodes.map((coin) => ({
				id: coin.address,
				version: coin.version?.toString()!,
				digest: coin.digest!,
				owner: mapOwner(coin.owner!),
				type: coin.contents?.type?.repr!,
				balance: (coin.contents?.json as { balance: string })?.balance,
				content: Promise.resolve(
					coin.contents?.bcs ? fromBase64(coin.contents.bcs) : new Uint8Array(),
				),
				previousTransaction: coin.previousTransaction?.digest ?? null,
			})),
		};
	}

	async getBalance(
		options: Experimental_RtdClientTypes.GetBalanceOptions,
	): Promise<Experimental_RtdClientTypes.GetBalanceResponse> {
		const result = await this.#graphqlQuery(
			{
				query: GetBalanceDocument,
				variables: {
					owner: options.address,
					type: (await this.mvr.resolveType({ type: options.coinType })).type,
				},
			},
			(result) => result.address?.balance,
		);

		return {
			balance: {
				coinType: result.coinType?.repr!,
				balance: result.totalBalance!,
			},
		};
	}
	async getAllBalances(
		options: Experimental_RtdClientTypes.GetAllBalancesOptions,
	): Promise<Experimental_RtdClientTypes.GetAllBalancesResponse> {
		const balances = await this.#graphqlQuery(
			{
				query: GetAllBalancesDocument,
				variables: { owner: options.address },
			},
			(result) => result.address?.balances,
		);

		return {
			cursor: balances.pageInfo.endCursor ?? null,
			hasNextPage: balances.pageInfo.hasNextPage,
			balances: balances.nodes.map((balance) => ({
				coinType: balance.coinType?.repr!,
				balance: balance.totalBalance!,
			})),
		};
	}
	async getTransaction(
		options: Experimental_RtdClientTypes.GetTransactionOptions,
	): Promise<Experimental_RtdClientTypes.GetTransactionResponse> {
		const result = await this.#graphqlQuery(
			{
				query: GetTransactionBlockDocument,
				variables: { digest: options.digest },
			},
			(result) => result.transaction,
		);

		return {
			transaction: parseTransaction(result),
		};
	}
	async executeTransaction(
		options: Experimental_RtdClientTypes.ExecuteTransactionOptions,
	): Promise<Experimental_RtdClientTypes.ExecuteTransactionResponse> {
		const result = await this.#graphqlQuery(
			{
				query: ExecuteTransactionDocument,
				variables: {
					transactionDataBcs: toBase64(options.transaction),
					signatures: options.signatures,
				},
			},
			(result) => result.executeTransaction,
		);

		if (result.errors) {
			if (result.errors.length === 1) {
				throw new Error(result.errors[0]);
			}
			throw new AggregateError(result.errors.map((error) => new Error(error)));
		}

		return {
			transaction: parseTransaction(result.effects?.transaction!),
		};
	}
	async dryRunTransaction(
		options: Experimental_RtdClientTypes.DryRunTransactionOptions,
	): Promise<Experimental_RtdClientTypes.DryRunTransactionResponse> {
		const result = await this.#graphqlQuery(
			{
				query: SimulateTransactionDocument,
				variables: {
					transaction: {
						bcs: {
							value: toBase64(options.transaction),
						},
					},
				},
			},
			(result) => result.simulateTransaction,
		);

		if (result.error) {
			throw new Error(result.error);
		}

		return {
			transaction: parseTransaction(result.effects?.transaction!),
		};
	}
	async getReferenceGasPrice(): Promise<Experimental_RtdClientTypes.GetReferenceGasPriceResponse> {
		const result = await this.#graphqlQuery(
			{
				query: GetReferenceGasPriceDocument,
			},
			(result) => result.epoch?.referenceGasPrice,
		);

		return {
			referenceGasPrice: result,
		};
	}

	async getDynamicFields(
		options: Experimental_RtdClientTypes.GetDynamicFieldsOptions,
	): Promise<Experimental_RtdClientTypes.GetDynamicFieldsResponse> {
		const result = await this.#graphqlQuery(
			{
				query: GetDynamicFieldsDocument,
				variables: { parentId: options.parentId },
			},
			(result) => result.address?.dynamicFields,
		);

		return {
			dynamicFields: result.nodes.map((dynamicField) => {
				const valueType =
					dynamicField.value?.__typename === 'MoveObject'
						? dynamicField.value.contents?.type?.repr!
						: dynamicField.value?.type?.repr!;
				return {
					id: deriveDynamicFieldID(
						options.parentId,
						dynamicField.name?.type?.repr!,
						fromBase64(dynamicField.name?.bcs!),
					),
					type: normalizeStructTag(
						dynamicField.value?.__typename === 'MoveObject'
							? `0x2::dynamic_field::Field<0x2::dynamic_object_field::Wrapper<${dynamicField.name?.type?.repr}>,0x2::object::ID>`
							: `0x2::dynamic_field::Field<${dynamicField.name?.type?.repr},${valueType}>`,
					),
					name: {
						type: dynamicField.name?.type?.repr!,
						bcs: fromBase64(dynamicField.name?.bcs!),
					},
					valueType,
				};
			}),
			cursor: result.pageInfo.endCursor ?? null,
			hasNextPage: result.pageInfo.hasNextPage,
		};
	}

	async verifyZkLoginSignature(
		options: Experimental_RtdClientTypes.VerifyZkLoginSignatureOptions,
	): Promise<Experimental_RtdClientTypes.ZkLoginVerifyResponse> {
		const intentScope =
			options.intentScope === 'TransactionData'
				? ZkLoginIntentScope.TransactionData
				: ZkLoginIntentScope.PersonalMessage;

		const result = await this.#graphqlQuery(
			{
				query: VerifyZkLoginSignatureDocument,
				variables: {
					bytes: options.bytes,
					signature: options.signature,
					intentScope,
					author: options.author,
				},
			},
			(result) => result.verifyZkLoginSignature,
		);

		return {
			success: result.success ?? false,
			errors: result.error ? [result.error] : [],
		};
	}

	async defaultNameServiceName(
		options: Experimental_RtdClientTypes.DefaultNameServiceNameOptions,
	): Promise<Experimental_RtdClientTypes.DefaultNameServiceNameResponse> {
		const name = await this.#graphqlQuery(
			{
				query: DefaultRtdnsNameDocument,
				signal: options.signal,
				variables: {
					address: options.address,
				},
			},
			(result) => result.address?.defaultRtdnsName ?? null,
		);

		return {
			data: { name: name },
		};
	}

	async getMoveFunction(
		options: Experimental_RtdClientTypes.GetMoveFunctionOptions,
	): Promise<Experimental_RtdClientTypes.GetMoveFunctionResponse> {
		const moveFunction = await this.#graphqlQuery(
			{
				query: GetMoveFunctionDocument,
				variables: {
					package: (await this.mvr.resolvePackage({ package: options.packageId })).package,
					module: options.moduleName,
					function: options.name,
				},
			},
			(result) => result.package?.module?.function,
		);

		let visibility: 'public' | 'private' | 'friend' | 'unknown' = 'unknown';

		switch (moveFunction.visibility) {
			case 'PUBLIC':
				visibility = 'public';
				break;
			case 'PRIVATE':
				visibility = 'private';
				break;
			case 'FRIEND':
				visibility = 'friend';
				break;
		}

		return {
			function: {
				packageId: normalizeRtdAddress(options.packageId),
				moduleName: options.moduleName,
				name: moveFunction.name,
				visibility,
				isEntry: moveFunction.isEntry ?? false,
				typeParameters:
					moveFunction.typeParameters?.map(({ constraints }) => ({
						isPhantom: false,
						constraints:
							constraints.map((constraint) => {
								switch (constraint) {
									case 'COPY':
										return 'copy';
									case 'DROP':
										return 'drop';
									case 'STORE':
										return 'store';
									case 'KEY':
										return 'key';
									default:
										return 'unknown';
								}
							}) ?? [],
					})) ?? [],
				parameters:
					moveFunction.parameters?.map((param) => parseNormalizedRtdMoveType(param.signature)) ??
					[],
				returns:
					moveFunction.return?.map(({ signature }) => parseNormalizedRtdMoveType(signature)) ?? [],
			},
		};
	}

	resolveTransactionPlugin(): never {
		throw new Error('GraphQL client does not support transaction resolution yet');
	}
}
export type GraphQLResponseErrors = Array<{
	message: string;
	locations?: { line: number; column: number }[];
	path?: (string | number)[];
}>;

function handleGraphQLErrors(errors: GraphQLResponseErrors | undefined): void {
	if (!errors || errors.length === 0) return;

	const errorInstances = errors.map((error) => new GraphQLResponseError(error));

	if (errorInstances.length === 1) {
		throw errorInstances[0];
	}

	throw new AggregateError(errorInstances);
}

class GraphQLResponseError extends Error {
	locations?: Array<{ line: number; column: number }>;

	constructor(error: GraphQLResponseErrors[0]) {
		super(error.message);
		this.locations = error.locations;
	}
}

function mapOwner(owner: Object_Owner_FieldsFragment): Experimental_RtdClientTypes.ObjectOwner {
	switch (owner.__typename) {
		case 'AddressOwner':
			return { $kind: 'AddressOwner', AddressOwner: owner.address?.address! };
		case 'ConsensusAddressOwner':
			return {
				$kind: 'ConsensusAddressOwner',
				ConsensusAddressOwner: {
					owner: owner?.address?.address!,
					startVersion: String(owner.startVersion),
				},
			};
		case 'ObjectOwner':
			return { $kind: 'ObjectOwner', ObjectOwner: owner.address?.address! };
		case 'Immutable':
			return { $kind: 'Immutable', Immutable: true };
		case 'Shared':
			return {
				$kind: 'Shared',
				Shared: { initialSharedVersion: String(owner.initialSharedVersion) },
			};
	}
}

function parseTransaction(
	transaction: Transaction_FieldsFragment,
): Experimental_RtdClientTypes.TransactionResponse {
	const objectTypes: Record<string, string> = {};

	transaction.effects?.unchangedConsensusObjects?.nodes.forEach((node) => {
		if (node.__typename === 'ConsensusObjectRead') {
			const type = node.object?.asMoveObject?.contents?.type?.repr;
			const address = node.object?.asMoveObject?.address;

			if (type && address) {
				objectTypes[address] = type;
			}
		}
	});

	transaction.effects?.objectChanges?.nodes.forEach((node) => {
		const address = node.address;
		const type =
			node.inputState?.asMoveObject?.contents?.type?.repr ??
			node.outputState?.asMoveObject?.contents?.type?.repr;

		if (address && type) {
			objectTypes[address] = type;
		}
	});

	if (transaction.effects?.balanceChanges?.pageInfo.hasNextPage) {
		throw new Error('Pagination for balance changes is not supported');
	}

	return {
		digest: transaction.digest!,
		effects: parseTransactionEffectsBcs(fromBase64(transaction.effects?.effectsBcs!)),
		epoch: transaction.effects?.epoch?.epochId?.toString() ?? null,
		objectTypes: Promise.resolve(objectTypes),
		transaction: parseTransactionBcs(fromBase64(transaction.transactionBcs!)),
		signatures: transaction.signatures.map((sig) => sig.signatureBytes!),
		balanceChanges:
			transaction.effects?.balanceChanges?.nodes.map((change) => ({
				coinType: change?.coinType?.repr!,
				address: change.owner?.address!,
				amount: change.amount!,
			})) ?? [],
		// events: transaction.events?.pageInfo.hasNextPage
	};
}

function parseNormalizedRtdMoveType(
	type: OpenMoveTypeSignature,
): Experimental_RtdClientTypes.OpenSignature {
	let reference: 'mutable' | 'immutable' | null = null;

	if (type.ref === '&') {
		reference = 'immutable';
	} else if (type.ref === '&mut') {
		reference = 'mutable';
	}

	return {
		reference,
		body: parseNormalizedRtdMoveTypeBody(type.body),
	};
}

function parseNormalizedRtdMoveTypeBody(
	type: OpenMoveTypeSignatureBody,
): Experimental_RtdClientTypes.OpenSignatureBody {
	switch (type) {
		case 'address':
			return { $kind: 'address' };
		case 'bool':
			return { $kind: 'bool' };
		case 'u8':
			return { $kind: 'u8' };
		case 'u16':
			return { $kind: 'u16' };
		case 'u32':
			return { $kind: 'u32' };
		case 'u64':
			return { $kind: 'u64' };
		case 'u128':
			return { $kind: 'u128' };
		case 'u256':
			return { $kind: 'u256' };
	}

	if (typeof type === 'string') {
		throw new Error(`Unknown type: ${type}`);
	}

	if ('vector' in type) {
		return {
			$kind: 'vector',
			vector: parseNormalizedRtdMoveTypeBody(type.vector),
		};
	}

	if ('datatype' in type) {
		return {
			$kind: 'datatype',
			datatype: {
				typeName: `${normalizeRtdAddress(type.datatype.package)}::${type.datatype.module}::${type.datatype.type}`,
				typeParameters: type.datatype.typeParameters.map((t) => parseNormalizedRtdMoveTypeBody(t)),
			},
		};
	}

	if ('typeParameter' in type) {
		return {
			$kind: 'typeParameter',
			index: type.typeParameter,
		};
	}

	throw new Error(`Unknown type: ${JSON.stringify(type)}`);
}
