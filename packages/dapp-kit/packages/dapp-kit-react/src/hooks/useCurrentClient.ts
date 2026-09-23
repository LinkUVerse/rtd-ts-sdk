// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type { DAppKit, RegisteredDAppKit } from 'rtd-dapp-kit-core';
import { useStore } from '@nanostores/react';
import { useDAppKit } from './useDAppKit.js';

export type UseCurrentClientOptions<TDAppKit extends DAppKit<any>> = {
	dAppKit?: TDAppKit;
};

export function useCurrentClient<TDAppKit extends DAppKit<any> = RegisteredDAppKit>({
	dAppKit,
}: UseCurrentClientOptions<TDAppKit> = {}) {
	const instance = useDAppKit(dAppKit);
	return useStore(instance.stores.$currentClient) as ReturnType<TDAppKit['getClient']>;
}
