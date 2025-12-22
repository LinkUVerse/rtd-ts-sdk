// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type { UseQueryResult } from '@tanstack/react-query';
import { useQueries } from '@tanstack/react-query';

import { useRtdClientContext } from './useRtdClient.js';
import type { RtdRpcMethods, UseRtdClientQueryOptions } from './useRtdClientQuery.js';

type RtdClientQueryOptions = RtdRpcMethods[keyof RtdRpcMethods] extends infer Method
	? Method extends {
			name: infer M extends keyof RtdRpcMethods;
			params?: infer P;
		}
		? undefined extends P
			? {
					method: M;
					params?: P;
					options?: UseRtdClientQueryOptions<M, unknown>;
				}
			: {
					method: M;
					params: P;
					options?: UseRtdClientQueryOptions<M, unknown>;
				}
		: never
	: never;

export type UseRtdClientQueriesResults<Args extends readonly RtdClientQueryOptions[]> = {
	-readonly [K in keyof Args]: Args[K] extends {
		method: infer M extends keyof RtdRpcMethods;
		readonly options?:
			| {
					select?: (...args: any[]) => infer R;
			  }
			| object;
	}
		? UseQueryResult<unknown extends R ? RtdRpcMethods[M]['result'] : R>
		: never;
};

export function useRtdClientQueries<
	const Queries extends readonly RtdClientQueryOptions[],
	Results = UseRtdClientQueriesResults<Queries>,
>({
	queries,
	combine,
}: {
	queries: Queries;
	combine?: (results: UseRtdClientQueriesResults<Queries>) => Results;
}): Results {
	const rtdContext = useRtdClientContext();

	return useQueries({
		combine: combine as never,
		queries: queries.map((query) => {
			const { method, params, options: { queryKey = [], ...restOptions } = {} } = query;

			return {
				...restOptions,
				queryKey: [rtdContext.network, method, params, ...queryKey],
				queryFn: async () => {
					return await rtdContext.client[method](params as never);
				},
			};
		}) as [],
	});
}
