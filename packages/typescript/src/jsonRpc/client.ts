// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import { fromBase58, toBase64, toHex } from 'rtd-bcs';

import type { Signer } from '../cryptography/index.js';
import { BaseClient } from '../client/client.js';
import type { RtdClientTypes } from '../client/types.js';
import { isCoinReservationDigest } from '../utils/coin-reservation.js';
import type { Transaction } from '../transactions/Transaction.js';
import { isTransaction } from '../transactions/Transaction.js';
import {
	isValidRtdAddress,
	isValidRtdObjectId,
	isValidTransactionDigest,
	normalizeRtdAddress,
	normalizeRtdObjectId,
} from '../utils/rtd-types.js';
import { normalizeRtdNSName } from '../utils/rtdns.js';
import { JsonRpcHTTPTransport } from './http-transport.js';
import type { JsonRpcTransport } from './http-transport.js';
import type {
	AddressMetrics,
	AllEpochsAddressMetrics,
	Checkpoint,
	CheckpointPage,
	CoinBalance,
	CoinMetadata,
	CoinSupply,
	CommitteeInfo,
	DelegatedStake,
	DevInspectResults,
	DevInspectTransactionBlockParams,
	DryRunTransactionBlockParams,
	DryRunTransactionBlockResponse,
	DynamicFieldPage,
	EpochInfo,
	EpochMetricsPage,
	EpochPage,
	ExecuteTransactionBlockParams,
	GetAllBalancesParams,
	GetAllCoinsParams,
	GetBalanceParams,
	GetCheckpointParams,
	GetCheckpointsParams,
	GetCoinMetadataParams,
	GetCoinsParams,
	GetCommitteeInfoParams,
	GetDynamicFieldObjectParams,
	GetDynamicFieldsParams,
	GetLatestCheckpointSequenceNumberParams,
	GetLatestRtdSystemStateParams,
	GetMoveFunctionArgTypesParams,
	GetNormalizedMoveFunctionParams,
	GetNormalizedMoveModuleParams,
	GetNormalizedMoveModulesByPackageParams,
	GetNormalizedMoveStructParams,
	GetObjectParams,
	GetOwnedObjectsParams,
	GetProtocolConfigParams,
	GetReferenceGasPriceParams,
	GetStakesByIdsParams,
	GetStakesParams,
	GetTotalSupplyParams,
	GetTransactionBlockParams,
	MoveCallMetrics,
	MultiGetObjectsParams,
	MultiGetTransactionBlocksParams,
	NetworkMetrics,
	ObjectRead,
	Order,
	PaginatedCoins,
	PaginatedEvents,
	PaginatedObjectsResponse,
	PaginatedTransactionResponse,
	ProtocolConfig,
	QueryEventsParams,
	QueryTransactionBlocksParams,
	ResolvedNameServiceNames,
	ResolveNameServiceAddressParams,
	ResolveNameServiceNamesParams,
	RtdMoveFunctionArgType,
	RtdMoveNormalizedFunction,
	RtdMoveNormalizedModule,
	RtdMoveNormalizedModules,
	RtdMoveNormalizedStruct,
	RtdObjectResponse,
	RtdObjectResponseQuery,
	RtdSystemStateSummary,
	RtdTransactionBlockResponse,
	RtdTransactionBlockResponseQuery,
	TryGetPastObjectParams,
	ValidatorsApy,
	VerifyZkLoginSignatureParams,
	ZkLoginVerifyResult,
} from './types/index.js';
import { isValidNamedPackage } from '../utils/move-registry.js';
import { hasMvrName } from '../client/mvr.js';
import { JSONRpcCoreClient } from './core.js';

/**
 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
 */
export interface PaginationArguments<Cursor> {
	/** Optional paging cursor */
	cursor?: Cursor;
	/** Maximum item returned per page */
	limit?: number | null;
}

/**
 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
 */
export interface OrderArguments {
	order?: Order | null;
}

/**
 * Configuration options for the RtdJsonRpcClient
 * You must provide either a `url` or a `transport`
 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
 */
export type RtdJsonRpcClientOptions = NetworkOrTransport & {
	network: RtdClientTypes.Network;
	mvr?: RtdClientTypes.MvrOptions;
};

type NetworkOrTransport =
	| {
			url: string;
			transport?: never;
	  }
	| {
			transport: JsonRpcTransport;
			url?: never;
	  };

const RTD_CLIENT_BRAND = Symbol.for('rtd-RtdJsonRpcClient') as never;

/**
 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
 */
export function isRtdJsonRpcClient(client: unknown): client is RtdJsonRpcClient {
	return (
		typeof client === 'object' && client !== null && (client as any)[RTD_CLIENT_BRAND] === true
	);
}

/**
 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
 */
export class RtdJsonRpcClient extends BaseClient {
	/**
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	core: JSONRpcCoreClient;
	/**
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	jsonRpc = this;
	protected transport: JsonRpcTransport;

	get [RTD_CLIENT_BRAND]() {
		return true;
	}

	/**
	 * Establish a connection to a Rtd RPC endpoint
	 *
	 * @param options configuration options for the API Client
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	constructor(options: RtdJsonRpcClientOptions) {
		super({ network: options.network });
		this.transport = options.transport ?? new JsonRpcHTTPTransport({ url: options.url });
		this.core = new JSONRpcCoreClient({
			jsonRpcClient: this,
			mvr: options.mvr,
		});
	}

	/**
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async getRpcApiVersion({ signal }: { signal?: AbortSignal } = {}): Promise<string | undefined> {
		const resp = await this.transport.request<{ info: { version: string } }>({
			method: 'rpc.discover',
			params: [],
			signal,
		});

		return resp.info.version;
	}

	/**
	 * Get all Coin<`coin_type`> objects owned by an address.
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async getCoins({
		coinType,
		owner,
		cursor,
		limit,
		signal,
	}: GetCoinsParams): Promise<PaginatedCoins> {
		if (!owner || !isValidRtdAddress(normalizeRtdAddress(owner))) {
			throw new Error('Invalid Rtd address');
		}

		if (coinType && hasMvrName(coinType)) {
			coinType = (
				await this.core.mvr.resolveType({
					type: coinType,
					signal,
				})
			).type;
		}

		const result: PaginatedCoins = await this.transport.request({
			method: 'rtdx_getCoins',
			params: [owner, coinType, cursor, limit],
			signal: signal,
		});

		return {
			...result,
			data: result.data.filter((coin) => !isCoinReservationDigest(coin.digest)),
		};
	}

	/**
	 * Get all Coin objects owned by an address.
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async getAllCoins(input: GetAllCoinsParams): Promise<PaginatedCoins> {
		if (!input.owner || !isValidRtdAddress(normalizeRtdAddress(input.owner))) {
			throw new Error('Invalid Rtd address');
		}

		const result: PaginatedCoins = await this.transport.request({
			method: 'rtdx_getAllCoins',
			params: [input.owner, input.cursor, input.limit],
			signal: input.signal,
		});

		return {
			...result,
			data: result.data.filter((coin) => !isCoinReservationDigest(coin.digest)),
		};
	}

	/**
	 * Get the total coin balance for one coin type, owned by the address owner.
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async getBalance({ owner, coinType, signal }: GetBalanceParams): Promise<CoinBalance> {
		if (!owner || !isValidRtdAddress(normalizeRtdAddress(owner))) {
			throw new Error('Invalid Rtd address');
		}

		if (coinType && hasMvrName(coinType)) {
			coinType = (
				await this.core.mvr.resolveType({
					type: coinType,
					signal,
				})
			).type;
		}

		return await this.transport.request({
			method: 'rtdx_getBalance',
			params: [owner, coinType],
			signal: signal,
		});
	}

	/**
	 * Get the total coin balance for all coin types, owned by the address owner.
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async getAllBalances(input: GetAllBalancesParams): Promise<CoinBalance[]> {
		if (!input.owner || !isValidRtdAddress(normalizeRtdAddress(input.owner))) {
			throw new Error('Invalid Rtd address');
		}
		return await this.transport.request({
			method: 'rtdx_getAllBalances',
			params: [input.owner],
			signal: input.signal,
		});
	}

	/**
	 * Fetch CoinMetadata for a given coin type
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async getCoinMetadata({ coinType, signal }: GetCoinMetadataParams): Promise<CoinMetadata | null> {
		if (coinType && hasMvrName(coinType)) {
			coinType = (
				await this.core.mvr.resolveType({
					type: coinType,
					signal,
				})
			).type;
		}

		return await this.transport.request({
			method: 'rtdx_getCoinMetadata',
			params: [coinType],
			signal: signal,
		});
	}

	/**
	 *  Fetch total supply for a coin
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async getTotalSupply({ coinType, signal }: GetTotalSupplyParams): Promise<CoinSupply> {
		if (coinType && hasMvrName(coinType)) {
			coinType = (
				await this.core.mvr.resolveType({
					type: coinType,
					signal,
				})
			).type;
		}

		return await this.transport.request({
			method: 'rtdx_getTotalSupply',
			params: [coinType],
			signal: signal,
		});
	}

	/**
	 * Invoke any RPC method
	 * @param method the method to be invoked
	 * @param args the arguments to be passed to the RPC request
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async call<T = unknown>(
		method: string,
		params: unknown[],
		{ signal }: { signal?: AbortSignal } = {},
	): Promise<T> {
		return await this.transport.request({ method, params, signal });
	}

	/**
	 * Get Move function argument types like read, write and full access
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async getMoveFunctionArgTypes({
		package: pkg,
		module,
		function: fn,
		signal,
	}: GetMoveFunctionArgTypesParams): Promise<RtdMoveFunctionArgType[]> {
		if (pkg && isValidNamedPackage(pkg)) {
			pkg = (
				await this.core.mvr.resolvePackage({
					package: pkg,
					signal,
				})
			).package;
		}

		return await this.transport.request({
			method: 'rtd_getMoveFunctionArgTypes',
			params: [pkg, module, fn],
			signal: signal,
		});
	}

	/**
	 * Get a map from module name to
	 * structured representations of Move modules
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async getNormalizedMoveModulesByPackage({
		package: pkg,
		signal,
	}: GetNormalizedMoveModulesByPackageParams): Promise<RtdMoveNormalizedModules> {
		if (pkg && isValidNamedPackage(pkg)) {
			pkg = (
				await this.core.mvr.resolvePackage({
					package: pkg,
					signal,
				})
			).package;
		}

		return await this.transport.request({
			method: 'rtd_getNormalizedMoveModulesByPackage',
			params: [pkg],
			signal: signal,
		});
	}

	/**
	 * Get a structured representation of Move module
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async getNormalizedMoveModule({
		package: pkg,
		module,
		signal,
	}: GetNormalizedMoveModuleParams): Promise<RtdMoveNormalizedModule> {
		if (pkg && isValidNamedPackage(pkg)) {
			pkg = (
				await this.core.mvr.resolvePackage({
					package: pkg,
					signal,
				})
			).package;
		}

		return await this.transport.request({
			method: 'rtd_getNormalizedMoveModule',
			params: [pkg, module],
			signal: signal,
		});
	}

	/**
	 * Get a structured representation of Move function
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async getNormalizedMoveFunction({
		package: pkg,
		module,
		function: fn,
		signal,
	}: GetNormalizedMoveFunctionParams): Promise<RtdMoveNormalizedFunction> {
		if (pkg && isValidNamedPackage(pkg)) {
			pkg = (
				await this.core.mvr.resolvePackage({
					package: pkg,
					signal,
				})
			).package;
		}

		return await this.transport.request({
			method: 'rtd_getNormalizedMoveFunction',
			params: [pkg, module, fn],
			signal: signal,
		});
	}

	/**
	 * Get a structured representation of Move struct
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async getNormalizedMoveStruct({
		package: pkg,
		module,
		struct,
		signal,
	}: GetNormalizedMoveStructParams): Promise<RtdMoveNormalizedStruct> {
		if (pkg && isValidNamedPackage(pkg)) {
			pkg = (
				await this.core.mvr.resolvePackage({
					package: pkg,
					signal,
				})
			).package;
		}

		return await this.transport.request({
			method: 'rtd_getNormalizedMoveStruct',
			params: [pkg, module, struct],
			signal: signal,
		});
	}

	/**
	 * Get all objects owned by an address
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async getOwnedObjects(input: GetOwnedObjectsParams): Promise<PaginatedObjectsResponse> {
		if (!input.owner || !isValidRtdAddress(normalizeRtdAddress(input.owner))) {
			throw new Error('Invalid Rtd address');
		}

		const filter = input.filter
			? {
					...input.filter,
				}
			: undefined;

		if (filter && 'MoveModule' in filter && isValidNamedPackage(filter.MoveModule.package)) {
			filter.MoveModule = {
				module: filter.MoveModule.module,
				package: (
					await this.core.mvr.resolvePackage({
						package: filter.MoveModule.package,
						signal: input.signal,
					})
				).package,
			};
		} else if (filter && 'StructType' in filter && hasMvrName(filter.StructType)) {
			filter.StructType = (
				await this.core.mvr.resolveType({
					type: filter.StructType,
					signal: input.signal,
				})
			).type;
		}

		return await this.transport.request({
			method: 'rtdx_getOwnedObjects',
			params: [
				input.owner,
				{
					filter,
					options: input.options,
				} as RtdObjectResponseQuery,
				input.cursor,
				input.limit,
			],
			signal: input.signal,
		});
	}

	/**
	 * Get details about an object
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async getObject(input: GetObjectParams): Promise<RtdObjectResponse> {
		if (!input.id || !isValidRtdObjectId(normalizeRtdObjectId(input.id))) {
			throw new Error('Invalid Rtd Object id');
		}
		return await this.transport.request({
			method: 'rtd_getObject',
			params: [input.id, input.options],
			signal: input.signal,
		});
	}

	/**
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async tryGetPastObject(input: TryGetPastObjectParams): Promise<ObjectRead> {
		return await this.transport.request({
			method: 'rtd_tryGetPastObject',
			params: [input.id, input.version, input.options],
			signal: input.signal,
		});
	}

	/**
	 * Batch get details about a list of objects. If any of the object ids are duplicates the call will fail
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async multiGetObjects(input: MultiGetObjectsParams): Promise<RtdObjectResponse[]> {
		input.ids.forEach((id) => {
			if (!id || !isValidRtdObjectId(normalizeRtdObjectId(id))) {
				throw new Error(`Invalid Rtd Object id ${id}`);
			}
		});
		const hasDuplicates = input.ids.length !== new Set(input.ids).size;
		if (hasDuplicates) {
			throw new Error(`Duplicate object ids in batch call ${input.ids}`);
		}

		return await this.transport.request({
			method: 'rtd_multiGetObjects',
			params: [input.ids, input.options],
			signal: input.signal,
		});
	}

	/**
	 * Get transaction blocks for a given query criteria
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async queryTransactionBlocks({
		filter,
		options,
		cursor,
		limit,
		order,
		signal,
	}: QueryTransactionBlocksParams): Promise<PaginatedTransactionResponse> {
		if (filter && 'MoveFunction' in filter && isValidNamedPackage(filter.MoveFunction.package)) {
			filter = {
				...filter,
				MoveFunction: {
					package: (
						await this.core.mvr.resolvePackage({
							package: filter.MoveFunction.package,
							signal,
						})
					).package,
				},
			};
		}

		return await this.transport.request({
			method: 'rtdx_queryTransactionBlocks',
			params: [
				{
					filter,
					options,
				} as RtdTransactionBlockResponseQuery,
				cursor,
				limit,
				(order || 'descending') === 'descending',
			],
			signal,
		});
	}

	/**
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async getTransactionBlock(
		input: GetTransactionBlockParams,
	): Promise<RtdTransactionBlockResponse> {
		if (!isValidTransactionDigest(input.digest)) {
			throw new Error('Invalid Transaction digest');
		}
		return await this.transport.request({
			method: 'rtd_getTransactionBlock',
			params: [input.digest, input.options],
			signal: input.signal,
		});
	}

	/**
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async multiGetTransactionBlocks(
		input: MultiGetTransactionBlocksParams,
	): Promise<RtdTransactionBlockResponse[]> {
		input.digests.forEach((d) => {
			if (!isValidTransactionDigest(d)) {
				throw new Error(`Invalid Transaction digest ${d}`);
			}
		});

		const hasDuplicates = input.digests.length !== new Set(input.digests).size;
		if (hasDuplicates) {
			throw new Error(`Duplicate digests in batch call ${input.digests}`);
		}

		return await this.transport.request({
			method: 'rtd_multiGetTransactionBlocks',
			params: [input.digests, input.options],
			signal: input.signal,
		});
	}

	/**
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async executeTransactionBlock({
		transactionBlock,
		signature,
		options,
		signal,
	}: ExecuteTransactionBlockParams): Promise<RtdTransactionBlockResponse> {
		const result: RtdTransactionBlockResponse = await this.transport.request({
			method: 'rtd_executeTransactionBlock',
			params: [
				typeof transactionBlock === 'string' ? transactionBlock : toBase64(transactionBlock),
				Array.isArray(signature) ? signature : [signature],
				options,
			],
			signal,
		});

		return result;
	}

	/**
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async signAndExecuteTransaction({
		transaction,
		signer,
		...input
	}: {
		transaction: Uint8Array | Transaction;
		signer: Signer;
	} & Omit<
		ExecuteTransactionBlockParams,
		'transactionBlock' | 'signature'
	>): Promise<RtdTransactionBlockResponse> {
		let transactionBytes;

		if (transaction instanceof Uint8Array) {
			transactionBytes = transaction;
		} else {
			transaction.setSenderIfNotSet(signer.toRtdAddress());
			transactionBytes = await transaction.build({ client: this });
		}

		const { signature, bytes } = await signer.signTransaction(transactionBytes);

		return this.executeTransactionBlock({
			transactionBlock: bytes,
			signature,
			...input,
		});
	}

	/**
	 * Get total number of transactions
	 */

	/**
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async getTotalTransactionBlocks({ signal }: { signal?: AbortSignal } = {}): Promise<bigint> {
		const resp = await this.transport.request<string>({
			method: 'rtd_getTotalTransactionBlocks',
			params: [],
			signal,
		});
		return BigInt(resp);
	}

	/**
	 * Getting the reference gas price for the network
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async getReferenceGasPrice({ signal }: GetReferenceGasPriceParams = {}): Promise<bigint> {
		const resp = await this.transport.request<string>({
			method: 'rtdx_getReferenceGasPrice',
			params: [],
			signal,
		});
		return BigInt(resp);
	}

	/**
	 * Return the delegated stakes for an address
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async getStakes(input: GetStakesParams): Promise<DelegatedStake[]> {
		if (!input.owner || !isValidRtdAddress(normalizeRtdAddress(input.owner))) {
			throw new Error('Invalid Rtd address');
		}
		return await this.transport.request({
			method: 'rtdx_getStakes',
			params: [input.owner],
			signal: input.signal,
		});
	}

	/**
	 * Return the delegated stakes queried by id.
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async getStakesByIds(input: GetStakesByIdsParams): Promise<DelegatedStake[]> {
		input.stakedRtdIds.forEach((id) => {
			if (!id || !isValidRtdObjectId(normalizeRtdObjectId(id))) {
				throw new Error(`Invalid Rtd Stake id ${id}`);
			}
		});
		return await this.transport.request({
			method: 'rtdx_getStakesByIds',
			params: [input.stakedRtdIds],
			signal: input.signal,
		});
	}

	/**
	 * Return the latest system state content.
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async getLatestRtdSystemState({
		signal,
	}: GetLatestRtdSystemStateParams = {}): Promise<RtdSystemStateSummary> {
		return await this.transport.request({
			method: 'rtdx_getLatestRtdSystemState',
			params: [],
			signal,
		});
	}

	/**
	 * Get events for a given query criteria
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async queryEvents({
		query,
		cursor,
		limit,
		order,
		signal,
	}: QueryEventsParams): Promise<PaginatedEvents> {
		if (query && 'MoveEventType' in query && hasMvrName(query.MoveEventType)) {
			query = {
				...query,
				MoveEventType: (
					await this.core.mvr.resolveType({
						type: query.MoveEventType,
						signal,
					})
				).type,
			};
		}

		if (query && 'MoveEventModule' in query && isValidNamedPackage(query.MoveEventModule.package)) {
			query = {
				...query,
				MoveEventModule: {
					module: query.MoveEventModule.module,
					package: (
						await this.core.mvr.resolvePackage({
							package: query.MoveEventModule.package,
							signal,
						})
					).package,
				},
			};
		}

		if ('MoveModule' in query && isValidNamedPackage(query.MoveModule.package)) {
			query = {
				...query,
				MoveModule: {
					module: query.MoveModule.module,
					package: (
						await this.core.mvr.resolvePackage({
							package: query.MoveModule.package,
							signal,
						})
					).package,
				},
			};
		}

		return await this.transport.request({
			method: 'rtdx_queryEvents',
			params: [query, cursor, limit, (order || 'descending') === 'descending'],
			signal,
		});
	}

	/**
	 * Runs the transaction block in dev-inspect mode. Which allows for nearly any
	 * transaction (or Move call) with any arguments. Detailed results are
	 * provided, including both the transaction effects and any return values.
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async devInspectTransactionBlock(
		input: DevInspectTransactionBlockParams,
	): Promise<DevInspectResults> {
		let devInspectTxBytes;
		if (isTransaction(input.transactionBlock)) {
			input.transactionBlock.setSenderIfNotSet(input.sender);
			devInspectTxBytes = toBase64(
				await input.transactionBlock.build({
					client: this,
					onlyTransactionKind: true,
				}),
			);
		} else if (typeof input.transactionBlock === 'string') {
			devInspectTxBytes = input.transactionBlock;
		} else if (input.transactionBlock instanceof Uint8Array) {
			devInspectTxBytes = toBase64(input.transactionBlock);
		} else {
			throw new Error('Unknown transaction block format.');
		}

		input.signal?.throwIfAborted();

		return await this.transport.request({
			method: 'rtd_devInspectTransactionBlock',
			params: [input.sender, devInspectTxBytes, input.gasPrice?.toString(), input.epoch],
			signal: input.signal,
		});
	}

	/**
	 * Dry run a transaction block and return the result.
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async dryRunTransactionBlock(
		input: DryRunTransactionBlockParams,
	): Promise<DryRunTransactionBlockResponse> {
		return await this.transport.request({
			method: 'rtd_dryRunTransactionBlock',
			params: [
				typeof input.transactionBlock === 'string'
					? input.transactionBlock
					: toBase64(input.transactionBlock),
			],
		});
	}

	/**
	 * Return the list of dynamic field objects owned by an object
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async getDynamicFields(input: GetDynamicFieldsParams): Promise<DynamicFieldPage> {
		if (!input.parentId || !isValidRtdObjectId(normalizeRtdObjectId(input.parentId))) {
			throw new Error('Invalid Rtd Object id');
		}
		return await this.transport.request({
			method: 'rtdx_getDynamicFields',
			params: [input.parentId, input.cursor, input.limit],
			signal: input.signal,
		});
	}

	/**
	 * Return the dynamic field object information for a specified object
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async getDynamicFieldObject(input: GetDynamicFieldObjectParams): Promise<RtdObjectResponse> {
		return await this.transport.request({
			method: 'rtdx_getDynamicFieldObject',
			params: [input.parentId, input.name],
			signal: input.signal,
		});
	}

	/**
	 * Get the sequence number of the latest checkpoint that has been executed
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async getLatestCheckpointSequenceNumber({
		signal,
	}: GetLatestCheckpointSequenceNumberParams = {}): Promise<string> {
		const resp = await this.transport.request({
			method: 'rtd_getLatestCheckpointSequenceNumber',
			params: [],
			signal,
		});
		return String(resp);
	}

	/**
	 * Returns information about a given checkpoint
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async getCheckpoint(input: GetCheckpointParams): Promise<Checkpoint> {
		return await this.transport.request({
			method: 'rtd_getCheckpoint',
			params: [input.id],
			signal: input.signal,
		});
	}

	/**
	 * Returns historical checkpoints paginated
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async getCheckpoints(
		input: PaginationArguments<CheckpointPage['nextCursor']> & GetCheckpointsParams,
	): Promise<CheckpointPage> {
		return await this.transport.request({
			method: 'rtd_getCheckpoints',
			params: [input.cursor, input?.limit, input.descendingOrder],
			signal: input.signal,
		});
	}

	/**
	 * Return the committee information for the asked epoch
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async getCommitteeInfo(input?: GetCommitteeInfoParams): Promise<CommitteeInfo> {
		return await this.transport.request({
			method: 'rtdx_getCommitteeInfo',
			params: [input?.epoch],
			signal: input?.signal,
		});
	}

	/**
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async getNetworkMetrics({ signal }: { signal?: AbortSignal } = {}): Promise<NetworkMetrics> {
		return await this.transport.request({
			method: 'rtdx_getNetworkMetrics',
			params: [],
			signal,
		});
	}

	/**
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async getAddressMetrics({ signal }: { signal?: AbortSignal } = {}): Promise<AddressMetrics> {
		return await this.transport.request({
			method: 'rtdx_getLatestAddressMetrics',
			params: [],
			signal,
		});
	}

	/**
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async getEpochMetrics(
		input?: {
			descendingOrder?: boolean;
			signal?: AbortSignal;
		} & PaginationArguments<EpochMetricsPage['nextCursor']>,
	): Promise<EpochMetricsPage> {
		return await this.transport.request({
			method: 'rtdx_getEpochMetrics',
			params: [input?.cursor, input?.limit, input?.descendingOrder],
			signal: input?.signal,
		});
	}

	/**
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async getAllEpochAddressMetrics(input?: {
		descendingOrder?: boolean;
		signal?: AbortSignal;
	}): Promise<AllEpochsAddressMetrics> {
		return await this.transport.request({
			method: 'rtdx_getAllEpochAddressMetrics',
			params: [input?.descendingOrder],
			signal: input?.signal,
		});
	}

	/**
	 * Return the committee information for the asked epoch
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async getEpochs(
		input?: {
			descendingOrder?: boolean;
			signal?: AbortSignal;
		} & PaginationArguments<EpochPage['nextCursor']>,
	): Promise<EpochPage> {
		return await this.transport.request({
			method: 'rtdx_getEpochs',
			params: [input?.cursor, input?.limit, input?.descendingOrder],
			signal: input?.signal,
		});
	}

	/**
	 * Returns list of top move calls by usage
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async getMoveCallMetrics({ signal }: { signal?: AbortSignal } = {}): Promise<MoveCallMetrics> {
		return await this.transport.request({
			method: 'rtdx_getMoveCallMetrics',
			params: [],
			signal,
		});
	}

	/**
	 * Return the committee information for the asked epoch
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async getCurrentEpoch({ signal }: { signal?: AbortSignal } = {}): Promise<EpochInfo> {
		return await this.transport.request({
			method: 'rtdx_getCurrentEpoch',
			params: [],
			signal,
		});
	}

	/**
	 * Return the Validators APYs
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async getValidatorsApy({ signal }: { signal?: AbortSignal } = {}): Promise<ValidatorsApy> {
		return await this.transport.request({
			method: 'rtdx_getValidatorsApy',
			params: [],
			signal,
		});
	}

	// TODO: Migrate this to `rtd_getChainIdentifier` once it is widely available.
	/**
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async getChainIdentifier({ signal }: { signal?: AbortSignal } = {}): Promise<string> {
		const checkpoint = await this.getCheckpoint({ id: '0', signal });
		const bytes = fromBase58(checkpoint.digest);
		return toHex(bytes.slice(0, 4));
	}

	/**
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async resolveNameServiceAddress(input: ResolveNameServiceAddressParams): Promise<string | null> {
		return await this.transport.request({
			method: 'rtdx_resolveNameServiceAddress',
			params: [input.name],
			signal: input.signal,
		});
	}

	/**
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async resolveNameServiceNames({
		format = 'dot',
		...input
	}: ResolveNameServiceNamesParams & {
		format?: 'at' | 'dot';
	}): Promise<ResolvedNameServiceNames> {
		const { nextCursor, hasNextPage, data }: ResolvedNameServiceNames =
			await this.transport.request({
				method: 'rtdx_resolveNameServiceNames',
				params: [input.address, input.cursor, input.limit],
				signal: input.signal,
			});

		return {
			hasNextPage,
			nextCursor,
			data: data.map((name) => normalizeRtdNSName(name, format)),
		};
	}

	/**
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async getProtocolConfig(input?: GetProtocolConfigParams): Promise<ProtocolConfig> {
		return await this.transport.request({
			method: 'rtd_getProtocolConfig',
			params: [input?.version],
			signal: input?.signal,
		});
	}

	/**
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async verifyZkLoginSignature(input: VerifyZkLoginSignatureParams): Promise<ZkLoginVerifyResult> {
		return await this.transport.request({
			method: 'rtd_verifyZkLoginSignature',
			params: [input.bytes, input.signature, input.intentScope, input.author],
			signal: input.signal,
		});
	}

	/**
	 * Wait for a transaction block result to be available over the API.
	 * This can be used in conjunction with `executeTransactionBlock` to wait for the transaction to
	 * be available via the API.
	 * This currently polls the `getTransactionBlock` API to check for the transaction.
	 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
	 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
	 */
	async waitForTransaction({
		signal,
		timeout = 60 * 1000,
		pollInterval = 2 * 1000,
		...input
	}: {
		/** An optional abort signal that can be used to cancel */
		signal?: AbortSignal;
		/** The amount of time to wait for a transaction block. Defaults to one minute. */
		timeout?: number;
		/** The amount of time to wait between checks for the transaction block. Defaults to 2 seconds. */
		pollInterval?: number;
	} & Parameters<
		RtdJsonRpcClient['getTransactionBlock']
	>[0]): Promise<RtdTransactionBlockResponse> {
		const timeoutSignal = AbortSignal.timeout(timeout);
		const timeoutPromise = new Promise((_, reject) => {
			timeoutSignal.addEventListener('abort', () => reject(timeoutSignal.reason));
		});

		timeoutPromise.catch(() => {
			// Swallow unhandled rejections that might be thrown after early return
		});

		while (!timeoutSignal.aborted) {
			signal?.throwIfAborted();
			try {
				return await this.getTransactionBlock(input);
			} catch {
				// Wait for either the next poll interval, or the timeout.
				await Promise.race([
					new Promise((resolve) => setTimeout(resolve, pollInterval)),
					timeoutPromise,
				]);
			}
		}

		timeoutSignal.throwIfAborted();

		// This should never happen, because the above case should always throw, but just adding it in the event that something goes horribly wrong.
		throw new Error('Unexpected error while waiting for transaction block.');
	}
}
