// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type { RtdClient } from 'rtd-typescript/client';
import { useContext } from 'react';

import { RtdClientContext } from '../components/RtdClientProvider.js';

export function useRtdClientContext() {
	const rtdClient = useContext(RtdClientContext);

	if (!rtdClient) {
		throw new Error(
			'Could not find RtdClientContext. Ensure that you have set up the RtdClientProvider',
		);
	}

	return rtdClient;
}

export function useRtdClient(): RtdClient {
	return useRtdClientContext().client;
}
