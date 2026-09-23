// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import {
	extractStatusFromEffectsBcs,
	parseTransactionBcs,
	parseTransactionEffectsBcs,
	type RtdClientTypes,
} from 'rtd-typescript/client';

export type TransactionResultWithEffects = RtdClientTypes.TransactionResult<{
	effects: true;
	transaction: true;
	bcs: true;
}>;

export function buildTransactionResult(
	digest: string,
	signature: string,
	transactionBytes: Uint8Array,
	effectsBytes: Uint8Array,
): TransactionResultWithEffects {
	const status = extractStatusFromEffectsBcs(effectsBytes);

	let effects: RtdClientTypes.TransactionEffects | null = null;
	try {
		effects = parseTransactionEffectsBcs(effectsBytes);
	} catch {
		console.warn(
			'Parsing transaction effects failed, you may need to update the SDK to pickup the latest bcs types',
		);
	}

	const txResult: RtdClientTypes.Transaction<{ effects: true; transaction: true; bcs: true }> = {
		digest,
		signatures: [signature],
		epoch: null,
		timestampMs: null,
		checkpoint: null,
		status,
		effects: effects as RtdClientTypes.TransactionEffects,
		transaction: parseTransactionBcs(transactionBytes),
		balanceChanges: undefined,
		events: undefined,
		objectTypes: undefined,
		bcs: transactionBytes,
	};

	return status.success
		? { $kind: 'Transaction', Transaction: txResult }
		: { $kind: 'FailedTransaction', FailedTransaction: txResult };
}
