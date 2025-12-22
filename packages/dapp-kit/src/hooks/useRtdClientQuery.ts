// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type { RtdClient } from 'rtd-typescript/client';
import type {
	UndefinedInitialDataOptions,
	UseQueryOptions,
	UseQueryResult,
} from '@tanstack/react-query';
import { queryOptions, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import type { PartialBy } from '../types/utilityTypes.js';
import { useRtdClientContext } from './useRtdClient.js';

export type RtdRpcMethodName = {
	[K in keyof RtdClient]: RtdClient[K] extends ((input: any) => Promise<any>) | (() => Promise<any>)
		? K
		: never;
}[keyof RtdClient];

export type RtdRpcMethods = {
	[K in RtdRpcMethodName]: RtdClient[K] extends (input: infer P) => Promise<infer R>
		? {
				name: K;
				result: R;
				params: P;
			}
		: RtdClient[K] extends () => Promise<infer R>
			? {
					name: K;
					result: R;
					params: undefined | object;
				}
			: never;
};

export type UseRtdClientQueryOptions<T extends keyof RtdRpcMethods, TData> = PartialBy<
	Omit<UseQueryOptions<RtdRpcMethods[T]['result'], Error, TData, unknown[]>, 'queryFn'>,
	'queryKey'
>;

export type GetRtdClientQueryOptions<T extends keyof RtdRpcMethods> = {
	client: RtdClient;
	network: string;
	method: T;
	options?: PartialBy<
		Omit<UndefinedInitialDataOptions<RtdRpcMethods[T]['result']>, 'queryFn'>,
		'queryKey'
	>;
} & (undefined extends RtdRpcMethods[T]['params']
	? { params?: RtdRpcMethods[T]['params'] }
	: { params: RtdRpcMethods[T]['params'] });

export function getRtdClientQuery<T extends keyof RtdRpcMethods>({
	client,
	network,
	method,
	params,
	options,
}: GetRtdClientQueryOptions<T>) {
	return queryOptions<RtdRpcMethods[T]['result']>({
		...options,
		queryKey: [network, method, params],
		queryFn: async () => {
			return await client[method](params as never);
		},
	});
}

export function useRtdClientQuery<
	T extends keyof RtdRpcMethods,
	TData = RtdRpcMethods[T]['result'],
>(
	...args: undefined extends RtdRpcMethods[T]['params']
		? [method: T, params?: RtdRpcMethods[T]['params'], options?: UseRtdClientQueryOptions<T, TData>]
		: [method: T, params: RtdRpcMethods[T]['params'], options?: UseRtdClientQueryOptions<T, TData>]
): UseQueryResult<TData, Error> {
	const [method, params, { queryKey = [], ...options } = {}] = args as [
		method: T,
		params?: RtdRpcMethods[T]['params'],
		options?: UseRtdClientQueryOptions<T, TData>,
	];

	const rtdContext = useRtdClientContext();

	return useQuery({
		...options,
		queryKey: [rtdContext.network, method, params, ...queryKey],
		queryFn: async () => {
			return await rtdContext.client[method](params as never);
		},
	});
}

export function useRtdClientSuspenseQuery<
	T extends keyof RtdRpcMethods,
	TData = RtdRpcMethods[T]['result'],
>(
	...args: undefined extends RtdRpcMethods[T]['params']
		? [method: T, params?: RtdRpcMethods[T]['params'], options?: UndefinedInitialDataOptions<TData>]
		: [method: T, params: RtdRpcMethods[T]['params'], options?: UndefinedInitialDataOptions<TData>]
) {
	const [method, params, options = {}] = args as [
		method: T,
		params?: RtdRpcMethods[T]['params'],
		options?: UndefinedInitialDataOptions<TData>,
	];

	const rtdContext = useRtdClientContext();

	const query = useMemo(() => {
		return getRtdClientQuery<T>({
			client: rtdContext.client,
			network: rtdContext.network,
			method,
			params,
			options,
		});
	}, [rtdContext.client, rtdContext.network, method, params, options]);

	return useSuspenseQuery(query);
}
