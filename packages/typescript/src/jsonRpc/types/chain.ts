// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type {
	Checkpoint,
	DynamicFieldInfo,
	RtdCallArg,
	RtdMoveNormalizedModule,
	RtdParsedData,
	RtdTransaction,
	RtdValidatorSummary,
} from './generated.js';

/**
 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
 */
export type ResolvedNameServiceNames = {
	data: string[];
	hasNextPage: boolean;
	nextCursor: string | null;
};

/**
 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
 */
export type EpochInfo = {
	epoch: string;
	validators: RtdValidatorSummary[];
	epochTotalTransactions: string;
	firstCheckpointId: string;
	epochStartTimestamp: string;
	endOfEpochInfo: EndOfEpochInfo | null;
	referenceGasPrice: number | null;
};

/**
 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
 */
export type EpochMetrics = {
	epoch: string;
	epochTotalTransactions: string;
	firstCheckpointId: string;
	epochStartTimestamp: string;
	endOfEpochInfo: EndOfEpochInfo | null;
};

/**
 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
 */
export type EpochPage = {
	data: EpochInfo[];
	nextCursor: string | null;
	hasNextPage: boolean;
};

/**
 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
 */
export type EpochMetricsPage = {
	data: EpochMetrics[];
	nextCursor: string | null;
	hasNextPage: boolean;
};

/**
 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
 */
export type EndOfEpochInfo = {
	lastCheckpointId: string;
	epochEndTimestamp: string;
	protocolVersion: string;
	referenceGasPrice: string;
	totalStake: string;
	storageFundReinvestment: string;
	storageCharge: string;
	storageRebate: string;
	storageFundBalance: string;
	stakeSubsidyAmount: string;
	totalGasFees: string;
	totalStakeRewardsDistributed: string;
	leftoverStorageFundInflow: string;
};

/**
 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
 */
export type CheckpointPage = {
	data: Checkpoint[];
	nextCursor: string | null;
	hasNextPage: boolean;
};

/**
 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
 */
export type NetworkMetrics = {
	currentTps: number;
	tps30Days: number;
	currentCheckpoint: string;
	currentEpoch: string;
	totalAddresses: string;
	totalObjects: string;
	totalPackages: string;
};

/**
 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
 */
export type AddressMetrics = {
	checkpoint: number;
	epoch: number;
	timestampMs: number;
	cumulativeAddresses: number;
	cumulativeActiveAddresses: number;
	dailyActiveAddresses: number;
};

/**
 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
 */
export type AllEpochsAddressMetrics = AddressMetrics[];

/**
 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
 */
export type MoveCallMetrics = {
	rank3Days: MoveCallMetric[];
	rank7Days: MoveCallMetric[];
	rank30Days: MoveCallMetric[];
};

/**
 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
 */
export type MoveCallMetric = [
	{
		module: string;
		package: string;
		function: string;
	},
	string,
];

/**
 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
 */
export type DynamicFieldPage = {
	data: DynamicFieldInfo[];
	nextCursor: string | null;
	hasNextPage: boolean;
};

/**
 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
 */
export type RtdMoveNormalizedModules = Record<string, RtdMoveNormalizedModule>;

/**
 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
 */
export type RtdMoveObject = Extract<RtdParsedData, { dataType: 'moveObject' }>;
/**
 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
 */
export type RtdMovePackage = Extract<RtdParsedData, { dataType: 'package' }>;

/**
 * @deprecated JSON-RPC APIs are deprecated in the Rtd TypeScript SDK. Use `RtdGrpcClient`
 * from `rtd-typescript/grpc` or `RtdGraphQLClient` from `rtd-typescript/graphql` instead.
 */
export type ProgrammableTransaction = {
	transactions: RtdTransaction[];
	inputs: RtdCallArg[];
};
