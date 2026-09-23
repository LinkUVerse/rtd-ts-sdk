// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import type { TadaDocumentNode } from 'gql.tada';
import type { DocumentNode } from 'graphql';
import { print } from 'graphql';
import { BaseClient } from '../client/index.js';
import type { RtdClientTypes } from '../client/index.js';
import { GraphQLCoreClient } from './core.js';
import type { TypedDocumentString } from './generated/queries.js';
import { GetDynamicFieldsDocument } from './generated/queries.js';
import { fromBase64 } from 'rtd-utils';
import { normalizeStructTag } from '../utils/rtd-types.js';
import { deriveDynamicFieldID } from '../utils/dynamic-fields.js';
import type { TransactionPlugin } from '../transactions/index.js';

export type GraphQLDocument<Result = Record<string, unknown>, Variables = Record<string, unknown>> =
	| string
	| DocumentNode
	| TypedDocumentString<Result, Variables>
	| TypedDocumentNode<Result, Variables>
	| TadaDocumentNode<Result, Variables>;

export type GraphQLQueryOptions<
	Result = Record<string, unknown>,
	Variables = Record<string, unknown>,
> = {
	query: GraphQLDocument<Result, Variables>;
	operationName?: string;
	extensions?: Record<string, unknown>;
	signal?: AbortSignal;
} & (Variables extends { [key: string]: never }
	? { variables?: Variables }
	: {
			variables: Variables;
		});

export type GraphQLQueryResult<Result = Record<string, unknown>> = {
	data?: Result;
	errors?: GraphQLResponseErrors;
	extensions?: Record<string, unknown>;
};

export type GraphQLResponseErrors = Array<{
	message: string;
	locations?: { line: number; column: number }[];
	path?: (string | number)[];
}>;

export interface RtdGraphQLClientOptions<Queries extends Record<string, GraphQLDocument>> {
	url: string;
	fetch?: typeof fetch;
	headers?: Record<string, string>;
	queries?: Queries;
	network: RtdClientTypes.Network;
	mvr?: RtdClientTypes.MvrOptions;
}

export class RtdGraphQLRequestError extends Error {}

const RTD_CLIENT_BRAND = Symbol.for('rtd-RtdGraphQLClient') as never;

export function isRtdGraphQLClient(client: unknown): client is RtdGraphQLClient {
	return (
		typeof client === 'object' && client !== null && (client as any)[RTD_CLIENT_BRAND] === true
	);
}

export interface GraphQLSimulateTransactionOptions<
	Include extends RtdClientTypes.SimulateTransactionInclude = {},
> extends RtdClientTypes.SimulateTransactionOptions<Include> {
	/**
	 * Overrides whether the server selects gas payment during simulation.
	 *
	 * When not set, gas selection is enabled only when the transaction's gas payment is explicitly
	 * set to an empty list (`[]`), which indicates gas is paid from the sender's address balance.
	 * Transactions with gas coins set are simulated as-is, and transactions without a gas payment
	 * are simulated with a mocked gas coin.
	 */
	doGasSelection?: boolean;
}

export interface DynamicFieldInclude {
	value?: boolean;
}

export type DynamicFieldEntryWithValue<Include extends DynamicFieldInclude = {}> =
	RtdClientTypes.DynamicFieldEntry & {
		value: Include extends { value: true } ? RtdClientTypes.DynamicFieldValue : undefined;
	};

export interface ListDynamicFieldsWithValueResponse<Include extends DynamicFieldInclude = {}> {
	hasNextPage: boolean;
	cursor: string | null;
	dynamicFields: DynamicFieldEntryWithValue<Include>[];
}

export class RtdGraphQLClient<Queries extends Record<string, GraphQLDocument> = {}>
	extends BaseClient
	implements RtdClientTypes.TransportMethods
{
	#url: string;
	#queries: Queries;
	#headers: Record<string, string>;
	#fetch: typeof fetch;
	core: GraphQLCoreClient;
	get mvr(): RtdClientTypes.MvrMethods {
		return this.core.mvr;
	}

	get [RTD_CLIENT_BRAND]() {
		return true;
	}

	constructor({
		url,
		fetch: fetchFn = fetch,
		headers = {},
		queries = {} as Queries,
		network,
		mvr,
	}: RtdGraphQLClientOptions<Queries>) {
		super({
			network,
		});
		this.#url = url;
		this.#queries = queries;
		this.#headers = headers;
		this.#fetch = (...args) => fetchFn(...args);
		this.core = new GraphQLCoreClient({
			graphqlClient: this,
			mvr,
		});
	}

	async query<Result = Record<string, unknown>, Variables = Record<string, unknown>>(
		options: GraphQLQueryOptions<Result, Variables>,
	): Promise<GraphQLQueryResult<Result>> {
		const res = await this.#fetch(this.#url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...this.#headers,
			},
			body: JSON.stringify({
				query:
					typeof options.query === 'string' || options.query instanceof String
						? String(options.query)
						: print(options.query),
				variables: options.variables,
				extensions: options.extensions,
				operationName: options.operationName,
			}),
			signal: options.signal,
		});

		if (!res.ok) {
			throw new RtdGraphQLRequestError(`GraphQL request failed: ${res.statusText} (${res.status})`);
		}

		return await res.json();
	}

	async execute<
		const Query extends Extract<keyof Queries, string>,
		Result = Queries[Query] extends GraphQLDocument<infer R, unknown> ? R : Record<string, unknown>,
		Variables = Queries[Query] extends GraphQLDocument<unknown, infer V>
			? V
			: Record<string, unknown>,
	>(
		query: Query,
		options: Omit<GraphQLQueryOptions<Result, Variables>, 'query'>,
	): Promise<GraphQLQueryResult<Result>> {
		return this.query({
			...(options as { variables: Record<string, unknown> }),
			query: this.#queries[query]!,
		}) as Promise<GraphQLQueryResult<Result>>;
	}

	getObjects<Include extends RtdClientTypes.ObjectInclude = {}>(
		input: RtdClientTypes.GetObjectsOptions<Include>,
	): Promise<RtdClientTypes.GetObjectsResponse<Include>> {
		return this.core.getObjects(input);
	}

	getObject<Include extends RtdClientTypes.ObjectInclude = {}>(
		input: RtdClientTypes.GetObjectOptions<Include>,
	): Promise<RtdClientTypes.GetObjectResponse<Include>> {
		return this.core.getObject(input);
	}

	listCoins(input: RtdClientTypes.ListCoinsOptions): Promise<RtdClientTypes.ListCoinsResponse> {
		return this.core.listCoins(input);
	}

	listOwnedObjects<Include extends RtdClientTypes.ObjectInclude = {}>(
		input: RtdClientTypes.ListOwnedObjectsOptions<Include>,
	): Promise<RtdClientTypes.ListOwnedObjectsResponse<Include>> {
		return this.core.listOwnedObjects(input);
	}

	getBalance(input: RtdClientTypes.GetBalanceOptions): Promise<RtdClientTypes.GetBalanceResponse> {
		return this.core.getBalance(input);
	}

	listBalances(
		input: RtdClientTypes.ListBalancesOptions,
	): Promise<RtdClientTypes.ListBalancesResponse> {
		return this.core.listBalances(input);
	}

	getCoinMetadata(
		input: RtdClientTypes.GetCoinMetadataOptions,
	): Promise<RtdClientTypes.GetCoinMetadataResponse> {
		return this.core.getCoinMetadata(input);
	}

	getTransaction<Include extends RtdClientTypes.TransactionInclude = {}>(
		input: RtdClientTypes.GetTransactionOptions<Include>,
	): Promise<RtdClientTypes.TransactionResult<Include>> {
		return this.core.getTransaction(input);
	}

	executeTransaction<Include extends RtdClientTypes.TransactionInclude = {}>(
		input: RtdClientTypes.ExecuteTransactionOptions<Include>,
	): Promise<RtdClientTypes.TransactionResult<Include>> {
		return this.core.executeTransaction(input);
	}

	signAndExecuteTransaction<Include extends RtdClientTypes.TransactionInclude = {}>(
		input: RtdClientTypes.SignAndExecuteTransactionOptions<Include>,
	): Promise<RtdClientTypes.TransactionResult<Include>> {
		return this.core.signAndExecuteTransaction(input);
	}

	waitForTransaction<Include extends RtdClientTypes.TransactionInclude = {}>(
		input: RtdClientTypes.WaitForTransactionOptions<Include>,
	): Promise<RtdClientTypes.TransactionResult<Include>> {
		return this.core.waitForTransaction(input);
	}

	simulateTransaction<Include extends RtdClientTypes.SimulateTransactionInclude = {}>(
		input: GraphQLSimulateTransactionOptions<Include>,
	): Promise<RtdClientTypes.SimulateTransactionResult<Include>> {
		return this.core.simulateTransaction(input);
	}

	getReferenceGasPrice(
		input?: RtdClientTypes.GetReferenceGasPriceOptions,
	): Promise<RtdClientTypes.GetReferenceGasPriceResponse> {
		return this.core.getReferenceGasPrice(input);
	}

	getCurrentSystemState(
		input?: RtdClientTypes.GetCurrentSystemStateOptions,
	): Promise<RtdClientTypes.GetCurrentSystemStateResponse> {
		return this.core.getCurrentSystemState(input);
	}

	getProtocolConfig(
		input?: RtdClientTypes.GetProtocolConfigOptions,
	): Promise<RtdClientTypes.GetProtocolConfigResponse> {
		return this.core.getProtocolConfig(input);
	}

	getChainIdentifier(
		input?: RtdClientTypes.GetChainIdentifierOptions,
	): Promise<RtdClientTypes.GetChainIdentifierResponse> {
		return this.core.getChainIdentifier(input);
	}

	async listDynamicFields<Include extends DynamicFieldInclude = {}>(
		input: RtdClientTypes.ListDynamicFieldsOptions & { include?: Include & DynamicFieldInclude },
	): Promise<ListDynamicFieldsWithValueResponse<Include>> {
		const includeValue = input.include?.value ?? false;

		const { data, errors } = await this.query({
			query: GetDynamicFieldsDocument,
			signal: input.signal,
			variables: {
				parentId: input.parentId,
				first: input.limit,
				cursor: input.cursor,
				includeValue,
			},
		});

		if (errors?.length) {
			throw errors.length === 1
				? new Error(errors[0].message)
				: new AggregateError(errors.map((e) => new Error(e.message)));
		}

		const result = data?.address?.dynamicFields;
		if (!result) {
			throw new Error('Missing response data');
		}

		return {
			dynamicFields: result.nodes.map((dynamicField): DynamicFieldEntryWithValue<Include> => {
				const valueType =
					dynamicField.value?.__typename === 'MoveObject'
						? dynamicField.value.contents?.type?.repr!
						: dynamicField.value?.type?.repr!;
				const isDynamicObject = dynamicField.value?.__typename === 'MoveObject';
				const derivedNameType = isDynamicObject
					? `0x2::dynamic_object_field::Wrapper<${dynamicField.name?.type?.repr}>`
					: dynamicField.name?.type?.repr!;

				let value: RtdClientTypes.DynamicFieldValue | undefined;
				if (includeValue) {
					let valueBcs: Uint8Array;
					if (dynamicField.value?.__typename === 'MoveValue') {
						valueBcs = fromBase64(dynamicField.value.bcs ?? '');
					} else if (dynamicField.value?.__typename === 'MoveObject') {
						valueBcs = fromBase64(dynamicField.value.contents?.bcs ?? '');
					} else {
						valueBcs = new Uint8Array();
					}
					value = { type: valueType, bcs: valueBcs };
				}

				return {
					$kind: isDynamicObject ? 'DynamicObject' : 'DynamicField',
					fieldId: deriveDynamicFieldID(
						input.parentId,
						derivedNameType,
						fromBase64(dynamicField.name?.bcs!),
					),
					type: normalizeStructTag(
						isDynamicObject
							? `0x2::dynamic_field::Field<0x2::dynamic_object_field::Wrapper<${dynamicField.name?.type?.repr}>,0x2::object::ID>`
							: `0x2::dynamic_field::Field<${dynamicField.name?.type?.repr},${valueType}>`,
					),
					name: {
						type: dynamicField.name?.type?.repr!,
						bcs: fromBase64(dynamicField.name?.bcs!),
					},
					valueType,
					childId:
						isDynamicObject && dynamicField.value?.__typename === 'MoveObject'
							? dynamicField.value.address
							: undefined,
					value: (includeValue ? value : undefined) as DynamicFieldEntryWithValue<Include>['value'],
				} as DynamicFieldEntryWithValue<Include>;
			}),
			cursor: result.pageInfo.endCursor ?? null,
			hasNextPage: result.pageInfo.hasNextPage,
		};
	}

	getDynamicField(
		input: RtdClientTypes.GetDynamicFieldOptions,
	): Promise<RtdClientTypes.GetDynamicFieldResponse> {
		return this.core.getDynamicField(input);
	}

	getDynamicObjectField<Include extends RtdClientTypes.ObjectInclude = {}>(
		input: RtdClientTypes.GetDynamicObjectFieldOptions<Include>,
	): Promise<RtdClientTypes.GetDynamicObjectFieldResponse<Include>> {
		return this.core.getDynamicObjectField(input);
	}

	listTransactions<Include extends RtdClientTypes.TransactionInclude = {}>(
		input: RtdClientTypes.ListTransactionsOptions<Include>,
	): Promise<RtdClientTypes.ListTransactionsResponse<Include>> {
		return this.core.listTransactions(input);
	}

	listEvents(input: RtdClientTypes.ListEventsOptions): Promise<RtdClientTypes.ListEventsResponse> {
		return this.core.listEvents(input);
	}

	getMoveFunction(
		input: RtdClientTypes.GetMoveFunctionOptions,
	): Promise<RtdClientTypes.GetMoveFunctionResponse> {
		return this.core.getMoveFunction(input);
	}

	resolveTransactionPlugin(): TransactionPlugin {
		return this.core.resolveTransactionPlugin();
	}

	verifyZkLoginSignature(
		input: RtdClientTypes.VerifyZkLoginSignatureOptions,
	): Promise<RtdClientTypes.ZkLoginVerifyResponse> {
		return this.core.verifyZkLoginSignature(input);
	}

	defaultNameServiceName(
		input: RtdClientTypes.DefaultNameServiceNameOptions,
	): Promise<RtdClientTypes.DefaultNameServiceNameResponse> {
		return this.core.defaultNameServiceName(input);
	}

	resolveNameServiceAddress(
		input: RtdClientTypes.ResolveNameServiceAddressOptions,
	): Promise<RtdClientTypes.ResolveNameServiceAddressResponse> {
		return this.core.resolveNameServiceAddress(input);
	}
}
