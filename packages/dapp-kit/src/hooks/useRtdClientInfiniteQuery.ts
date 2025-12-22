// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type { RtdClient } from 'rtd-typescript/client';
import type {
	InfiniteData,
	UseInfiniteQueryOptions,
	UseInfiniteQueryResult,
} from '@tanstack/react-query';
import { useInfiniteQuery } from '@tanstack/react-query';

import type { PartialBy } from '../types/utilityTypes.js';
import { useRtdClientContext } from './useRtdClient.js';

interface PaginatedResult {
	data?: unknown;
	nextCursor?: unknown;
	hasNextPage: boolean;
}

export type RtdRpcPaginatedMethodName = {
	[K in keyof RtdClient]: RtdClient[K] extends (input: any) => Promise<PaginatedResult> ? K : never;
}[keyof RtdClient];

export type RtdRpcPaginatedMethods = {
	[K in RtdRpcPaginatedMethodName]: RtdClient[K] extends (
		input: infer Params,
	) => Promise<
		infer Result extends { hasNextPage?: boolean | null; nextCursor?: infer Cursor | null }
	>
		? {
				name: K;
				result: Result;
				params: Params;
				cursor: Cursor;
			}
		: never;
};

export type UseRtdClientInfiniteQueryOptions<
	T extends keyof RtdRpcPaginatedMethods,
	TData,
> = PartialBy<
	Omit<
		UseInfiniteQueryOptions<RtdRpcPaginatedMethods[T]['result'], Error, TData, unknown[]>,
		'queryFn' | 'initialPageParam' | 'getNextPageParam'
	>,
	'queryKey'
>;

export function useRtdClientInfiniteQuery<
	T extends keyof RtdRpcPaginatedMethods,
	TData = InfiniteData<RtdRpcPaginatedMethods[T]['result']>,
>(
	method: T,
	params: RtdRpcPaginatedMethods[T]['params'],
	{
		queryKey = [],
		enabled = !!params,
		...options
	}: UseRtdClientInfiniteQueryOptions<T, TData> = {},
): UseInfiniteQueryResult<TData, Error> {
	const rtdContext = useRtdClientContext();

	return useInfiniteQuery({
		...options,
		initialPageParam: null,
		queryKey: [rtdContext.network, method, params, ...queryKey],
		enabled,
		queryFn: ({ pageParam }) =>
			rtdContext.client[method]({
				// oxlint-disable-next-line no-useless-fallback-in-spread
				...(params ?? {}),
				cursor: pageParam,
			} as never),
		getNextPageParam: (lastPage) => (lastPage.hasNextPage ? (lastPage.nextCursor ?? null) : null),
	});
}
