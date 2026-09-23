// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type { GrpcWebOptions } from '@protobuf-ts/grpcweb-transport';
import { TransactionExecutionServiceClient } from './proto/rtd/rpc/v2/transaction_execution_service.client.js';
import { LedgerServiceClient } from './proto/rtd/rpc/v2/ledger_service.client.js';
import { MovePackageServiceClient } from './proto/rtd/rpc/v2/move_package_service.client.js';
import { SignatureVerificationServiceClient } from './proto/rtd/rpc/v2/signature_verification_service.client.js';
import type { RpcTransport } from '@protobuf-ts/runtime-rpc';
import { StateServiceClient } from './proto/rtd/rpc/v2/state_service.client.js';
import { SubscriptionServiceClient } from './proto/rtd/rpc/v2/subscription_service.client.js';
import { GrpcCoreClient } from './core.js';
import type { RtdClientTypes } from '../client/index.js';
import { BaseClient } from '../client/index.js';
import { DynamicField_DynamicFieldKind } from './proto/rtd/rpc/v2/state_service.js';
import { normalizeStructTag } from '../utils/rtd-types.js';
import { fromBase64, toBase64 } from 'rtd-utils';
import { NameServiceClient } from './proto/rtd/rpc/v2/name_service.client.js';
import { ForkingServiceClient } from './proto/rtd/forking/v1alpha/forking_service.client.js';
import type { TransactionPlugin } from '../transactions/index.js';
import { GrpcWebFetchTransport } from './transport.js';

interface RtdGrpcTransportOptions extends GrpcWebOptions {
	transport?: never;
}

export type RtdGrpcClientOptions = {
	network: RtdClientTypes.Network;
	mvr?: RtdClientTypes.MvrOptions;
} & (
	| {
			transport: RpcTransport;
	  }
	| RtdGrpcTransportOptions
);

const RTD_CLIENT_BRAND = Symbol.for('rtd-RtdGrpcClient') as never;

export function isRtdGrpcClient(client: unknown): client is RtdGrpcClient {
	return (
		typeof client === 'object' && client !== null && (client as any)[RTD_CLIENT_BRAND] === true
	);
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

export interface GrpcTransactionInclude extends RtdClientTypes.TransactionInclude {
	/** Include the parsed protobuf JSON value for the gRPC transaction response. */
	protoJson?: boolean;
}

export interface GrpcSimulateTransactionInclude extends RtdClientTypes.SimulateTransactionInclude {
	/** Include the parsed protobuf JSON value for the gRPC simulation response. */
	protoJson?: boolean;
}

export type GrpcTransactionProtoJson = ReturnType<
	typeof import('./proto/rtd/rpc/v2/executed_transaction.js').ExecutedTransaction.toJson
>;

export type GrpcSimulateTransactionProtoJson = ReturnType<
	typeof import('./proto/rtd/rpc/v2/transaction_execution_service.js').SimulateTransactionResponse.toJson
>;

type ProtoJson<Include extends { protoJson?: boolean }, Json> = Include['protoJson'] extends true
	? Json
	: undefined;

export type GrpcTransactionResult<Include extends GrpcTransactionInclude = {}> =
	RtdClientTypes.TransactionResult<Include> & {
		protoJson: ProtoJson<Include, GrpcTransactionProtoJson>;
	};

export type GrpcSimulateTransactionResult<Include extends GrpcSimulateTransactionInclude = {}> =
	RtdClientTypes.SimulateTransactionResult<Include> & {
		protoJson: ProtoJson<Include, GrpcSimulateTransactionProtoJson>;
	};

export interface GrpcGetTransactionOptions<
	Include extends GrpcTransactionInclude = {},
> extends RtdClientTypes.GetTransactionOptions<Include> {
	include?: Include & GrpcTransactionInclude;
}

export interface GrpcWaitForTransactionByDigest<
	Include extends GrpcTransactionInclude = {},
> extends RtdClientTypes.WaitForTransactionByDigest<Include> {
	include?: Include & GrpcTransactionInclude;
}

export interface GrpcWaitForTransactionByResult<
	Include extends GrpcTransactionInclude = {},
> extends RtdClientTypes.WaitForTransactionByResult<Include> {
	include?: Include & GrpcTransactionInclude;
}

export type GrpcWaitForTransactionOptions<Include extends GrpcTransactionInclude = {}> =
	GrpcWaitForTransactionByDigest<Include> | GrpcWaitForTransactionByResult<Include>;

export interface GrpcExecuteTransactionOptions<
	Include extends GrpcTransactionInclude = {},
> extends RtdClientTypes.ExecuteTransactionOptions<Include> {
	include?: Include & GrpcTransactionInclude;
}

export interface GrpcSignAndExecuteTransactionOptions<
	Include extends GrpcTransactionInclude = {},
> extends RtdClientTypes.SignAndExecuteTransactionOptions<Include> {
	include?: Include & GrpcTransactionInclude;
}

export interface GrpcSimulateTransactionOptions<
	Include extends GrpcSimulateTransactionInclude = {},
> extends RtdClientTypes.SimulateTransactionOptions<Include> {
	include?: Include & GrpcSimulateTransactionInclude;
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

export class RtdGrpcClient extends BaseClient implements RtdClientTypes.TransportMethods {
	core: GrpcCoreClient;
	get mvr(): RtdClientTypes.MvrMethods {
		return this.core.mvr;
	}
	transactionExecutionService: TransactionExecutionServiceClient;
	ledgerService: LedgerServiceClient;
	stateService: StateServiceClient;
	subscriptionService: SubscriptionServiceClient;
	movePackageService: MovePackageServiceClient;
	signatureVerificationService: SignatureVerificationServiceClient;
	nameService: NameServiceClient;
	forkingService: ForkingServiceClient;

	get [RTD_CLIENT_BRAND]() {
		return true;
	}

	constructor(options: RtdGrpcClientOptions) {
		super({ network: options.network });
		const {
			network: _network,
			mvr: _mvr,
			// Not forwarded: every Core API call passes its own `signal`, which would overwrite it.
			abort: _abort,
			transport: providedTransport,
			...transportOptions
		} = options as RtdGrpcClientOptions & RtdGrpcTransportOptions & { transport?: RpcTransport };

		// A caller-supplied transport is used as given. See ./transport.ts for the default.
		const transport = providedTransport ?? new GrpcWebFetchTransport(transportOptions);
		this.transactionExecutionService = new TransactionExecutionServiceClient(transport);
		this.ledgerService = new LedgerServiceClient(transport);
		this.stateService = new StateServiceClient(transport);
		this.subscriptionService = new SubscriptionServiceClient(transport);
		this.movePackageService = new MovePackageServiceClient(transport);
		this.signatureVerificationService = new SignatureVerificationServiceClient(transport);
		this.nameService = new NameServiceClient(transport);
		this.forkingService = new ForkingServiceClient(transport);

		this.core = new GrpcCoreClient({
			client: this,
			base: this,
			network: options.network,
			mvr: options.mvr,
		});
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

	getTransaction<Include extends GrpcTransactionInclude = {}>(
		input: GrpcGetTransactionOptions<Include>,
	): Promise<GrpcTransactionResult<Include>> {
		return this.core.getTransaction(input) as Promise<GrpcTransactionResult<Include>>;
	}

	executeTransaction<Include extends GrpcTransactionInclude = {}>(
		input: GrpcExecuteTransactionOptions<Include>,
	): Promise<GrpcTransactionResult<Include>> {
		return this.core.executeTransaction(input) as Promise<GrpcTransactionResult<Include>>;
	}

	signAndExecuteTransaction<Include extends GrpcTransactionInclude = {}>(
		input: GrpcSignAndExecuteTransactionOptions<Include>,
	): Promise<GrpcTransactionResult<Include>> {
		return this.core.signAndExecuteTransaction(input) as Promise<GrpcTransactionResult<Include>>;
	}

	waitForTransaction<Include extends GrpcTransactionInclude = {}>(
		input: GrpcWaitForTransactionOptions<Include>,
	): Promise<GrpcTransactionResult<Include>> {
		return this.core.waitForTransaction(input) as Promise<GrpcTransactionResult<Include>>;
	}

	simulateTransaction<Include extends GrpcSimulateTransactionInclude = {}>(
		input: GrpcSimulateTransactionOptions<Include>,
	): Promise<GrpcSimulateTransactionResult<Include>> {
		return this.core.simulateTransaction(input) as Promise<GrpcSimulateTransactionResult<Include>>;
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
		const paths = ['field_id', 'name', 'value_type', 'kind', 'child_id'];
		if (includeValue) {
			paths.push('value');
		}

		const response = await this.stateService.listDynamicFields(
			{
				parent: input.parentId,
				pageToken: input.cursor ? fromBase64(input.cursor) : undefined,
				pageSize: input.limit,
				readMask: {
					paths,
				},
			},
			{ abort: input.signal },
		);

		return {
			dynamicFields: response.response.dynamicFields.map(
				(field): DynamicFieldEntryWithValue<Include> => {
					const isDynamicObject = field.kind === DynamicField_DynamicFieldKind.OBJECT;
					const fieldType = isDynamicObject
						? `0x2::dynamic_field::Field<0x2::dynamic_object_field::Wrapper<${field.name?.name!}>,0x2::object::ID>`
						: `0x2::dynamic_field::Field<${field.name?.name!},${field.valueType!}>`;
					return {
						$kind: isDynamicObject ? 'DynamicObject' : 'DynamicField',
						fieldId: field.fieldId!,
						name: {
							type: field.name?.name!,
							bcs: field.name?.value!,
						},
						valueType: field.valueType!,
						type: normalizeStructTag(fieldType),
						childId: field.childId,
						value: (includeValue
							? { type: field.valueType!, bcs: field.value?.value ?? new Uint8Array() }
							: undefined) as DynamicFieldEntryWithValue<Include>['value'],
					} as DynamicFieldEntryWithValue<Include>;
				},
			),
			cursor: response.response.nextPageToken ? toBase64(response.response.nextPageToken) : null,
			hasNextPage: response.response.nextPageToken !== undefined,
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
