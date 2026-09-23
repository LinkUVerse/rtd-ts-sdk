// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { beforeAll, describe, expect, it } from 'vitest';

import { RtdGasData } from '../../../../src/jsonRpc/index.js';
import { setup, TestToolbox } from '../../utils/setup.js';

describe('Invoke any RPC endpoint', () => {
	let toolbox: TestToolbox;

	beforeAll(async () => {
		toolbox = await setup();
	});

	it('rtdx_getOwnedObjects', async () => {
		const gasObjectsExpected = await toolbox.jsonRpcClient.getOwnedObjects({
			owner: toolbox.address(),
		});
		const gasObjects = await toolbox.jsonRpcClient.call<{ data: RtdGasData }>(
			'rtdx_getOwnedObjects',
			[toolbox.address()],
		);
		expect(gasObjects.data).toStrictEqual(gasObjectsExpected.data);
	});

	it('rtd_getObjectOwnedByAddress Error', async () => {
		await expect(toolbox.jsonRpcClient.call('rtdx_getOwnedObjects', [])).rejects.toThrowError();
	});

	it('rtdx_getCommitteeInfo', async () => {
		const committeeInfoExpected = await toolbox.jsonRpcClient.getCommitteeInfo();

		const committeeInfo = await toolbox.jsonRpcClient.call('rtdx_getCommitteeInfo', []);

		expect(committeeInfo).toStrictEqual(committeeInfoExpected);
	});
});
