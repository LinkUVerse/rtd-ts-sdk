// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type { UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import { useRtdClientContext } from './useRtdClient.js';
import type { RtdRpcMethods } from './useRtdClientQuery.js';

export type UseRtdClientMutationOptions<T extends keyof RtdRpcMethods> = Omit<
	UseMutationOptions<RtdRpcMethods[T]['result'], Error, RtdRpcMethods[T]['params'], unknown[]>,
	'mutationFn'
>;

export function useRtdClientMutation<T extends keyof RtdRpcMethods>(
	method: T,
	options: UseRtdClientMutationOptions<T> = {},
): UseMutationResult<RtdRpcMethods[T]['result'], Error, RtdRpcMethods[T]['params'], unknown[]> {
	const rtdContext = useRtdClientContext();

	return useMutation({
		...options,
		mutationFn: async (params) => {
			return await rtdContext.client[method](params as never);
		},
	});
}
