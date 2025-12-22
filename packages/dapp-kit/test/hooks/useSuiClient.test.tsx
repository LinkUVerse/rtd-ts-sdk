// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import { getFullnodeUrl, RtdClient } from 'rtd-typescript/client';
import { renderHook } from '@testing-library/react';

import { useRtdClient } from '../../src/index.js';
import { createRtdClientContextWrapper } from '../test-utils.js';

describe('useRtdClient', () => {
	test('throws without a RtdClientContext', () => {
		expect(() => renderHook(() => useRtdClient())).toThrowError(
			'Could not find RtdClientContext. Ensure that you have set up the RtdClientProvider',
		);
	});

	test('returns a RtdClient', () => {
		const rtdClient = new RtdClient({ url: getFullnodeUrl('localnet') });
		const wrapper = createRtdClientContextWrapper(rtdClient);
		const { result } = renderHook(() => useRtdClient(), { wrapper });

		expect(result.current).toBe(rtdClient);
	});
});
