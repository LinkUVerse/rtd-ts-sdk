// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { beforeAll, describe, expect, it } from 'vitest';
import { setup, TestToolbox, createTestWithAllClients } from '../../utils/setup.js';
import { RTD_TYPE_ARG } from '../../../../src/utils/index.js';

describe('Core API - Coin Metadata', () => {
	let toolbox: TestToolbox;
	let testPackageId: string;

	const testWithAllClients = createTestWithAllClients(() => toolbox);

	beforeAll(async () => {
		toolbox = await setup();
		testPackageId = await toolbox.getPackage('test_data');
	});

	describe('getCoinMetadata', () => {
		it('all clients return same data for RTD metadata', async () => {
			await toolbox.expectAllClientsReturnSameData((client) =>
				client.core.getCoinMetadata({ coinType: RTD_TYPE_ARG }),
			);
		});

		it('all clients return same data for custom coin metadata', async () => {
			await toolbox.expectAllClientsReturnSameData((client) =>
				client.core.getCoinMetadata({
					coinType: `${testPackageId}::test_coin::TEST_COIN`,
				}),
			);
		});

		testWithAllClients('should get metadata for RTD coin', async (client) => {
			const result = await client.core.getCoinMetadata({
				coinType: RTD_TYPE_ARG,
			});

			expect(result.coinMetadata).not.toBeNull();
			expect(result.coinMetadata!.decimals).toBe(9);
			expect(result.coinMetadata!.name).toBe('Rtd');
			expect(result.coinMetadata!.symbol).toBe('RTD');
			expect(result.coinMetadata!.description).toBeDefined();
			expect(result.coinMetadata!.id).toBeDefined();
		});

		testWithAllClients('should get metadata for custom TEST_COIN', async (client) => {
			const result = await client.core.getCoinMetadata({
				coinType: `${testPackageId}::test_coin::TEST_COIN`,
			});

			expect(result.coinMetadata).not.toBeNull();
			expect(result.coinMetadata!.decimals).toBeTypeOf('number');
			expect(result.coinMetadata!.name).toBeTypeOf('string');
			expect(result.coinMetadata!.symbol).toBeTypeOf('string');
			expect(result.coinMetadata!.description).toBeTypeOf('string');
		});

		testWithAllClients('should return null for non-existent coin type', async (client) => {
			const result = await client.core.getCoinMetadata({
				coinType: '0x0000000000000000000000000000000000000000000000000000000000000000::fake::FAKE',
			});

			expect(result.coinMetadata).toBeNull();
		});
	});
});
