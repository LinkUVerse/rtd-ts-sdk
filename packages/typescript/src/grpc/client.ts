// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type { GrpcWebOptions } from '@protobuf-ts/grpcweb-transport';
import { GrpcWebFetchTransport } from '@protobuf-ts/grpcweb-transport';
import { TransactionExecutionServiceClient } from './proto/rtd/rpc/v2/transaction_execution_service.client.js';
import { LedgerServiceClient } from './proto/rtd/rpc/v2/ledger_service.client.js';
import { MovePackageServiceClient } from './proto/rtd/rpc/v2/move_package_service.client.js';
import { SignatureVerificationServiceClient } from './proto/rtd/rpc/v2/signature_verification_service.client.js';
import type { RpcTransport } from '@protobuf-ts/runtime-rpc';
import { StateServiceClient } from './proto/rtd/rpc/v2/state_service.client.js';
import { SubscriptionServiceClient } from './proto/rtd/rpc/v2/subscription_service.client.js';
import { GrpcCoreClient } from './core.js';
import type { Experimental_RtdClientTypes } from '../experimental/index.js';
import { Experimental_BaseClient } from '../experimental/index.js';
import { NameServiceClient } from './proto/rtd/rpc/v2/name_service.client.js';

interface RtdGrpcTransportOptions extends GrpcWebOptions {
	transport?: never;
}

export type RtdGrpcClientOptions = {
	network: Experimental_RtdClientTypes.Network;
	mvr?: Experimental_RtdClientTypes.MvrOptions;
} & (
	| {
			transport: RpcTransport;
	  }
	| RtdGrpcTransportOptions
);

export class RtdGrpcClient extends Experimental_BaseClient {
	core: GrpcCoreClient;
	transactionExecutionService: TransactionExecutionServiceClient;
	ledgerService: LedgerServiceClient;
	stateService: StateServiceClient;
	subscriptionService: SubscriptionServiceClient;
	movePackageService: MovePackageServiceClient;
	signatureVerificationService: SignatureVerificationServiceClient;
	nameService: NameServiceClient;

	constructor(options: RtdGrpcClientOptions) {
		super({ network: options.network });
		const transport =
			options.transport ??
			new GrpcWebFetchTransport({ baseUrl: options.baseUrl, fetchInit: options.fetchInit });
		this.transactionExecutionService = new TransactionExecutionServiceClient(transport);
		this.ledgerService = new LedgerServiceClient(transport);
		this.stateService = new StateServiceClient(transport);
		this.subscriptionService = new SubscriptionServiceClient(transport);
		this.movePackageService = new MovePackageServiceClient(transport);
		this.signatureVerificationService = new SignatureVerificationServiceClient(transport);
		this.nameService = new NameServiceClient(transport);

		this.core = new GrpcCoreClient({
			client: this,
			base: this,
			network: options.network,
			mvr: options.mvr,
		});
	}
}
