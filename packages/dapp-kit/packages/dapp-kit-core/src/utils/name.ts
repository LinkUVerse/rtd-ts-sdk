// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { normalizeRtdNSName } from 'rtd-typescript/utils';
import type { DAppKitCompatibleClient } from '../core/types.js';

const cache = new Map<string, string | null>();

export async function resolveNameServiceName(client: DAppKitCompatibleClient, address: string) {
	if (cache.has(address)) {
		return cache.get(address)!;
	}

	try {
		const result = await client.core.defaultNameServiceName?.({
			address,
		});

		const name = result?.data.name;
		cache.set(address, name ? normalizeRtdNSName(name, 'at') : null);
		return name;
	} catch {
		cache.set(address, null);
		return null;
	}
}
