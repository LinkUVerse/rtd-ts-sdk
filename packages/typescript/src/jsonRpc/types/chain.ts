// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type {
	Checkpoint,
	DynamicFieldInfo,
	RtdCallArg,
	RtdMoveNormalizedModule,
	RtdParsedData,
	RtdTransaction,
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
export type CheckpointPage = {
	data: Checkpoint[];
	nextCursor: string | null;
	hasNextPage: boolean;
};

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
