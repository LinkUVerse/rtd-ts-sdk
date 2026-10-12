import { describe, expect, it } from 'vitest';
import { bcs } from '../../../src/bcs/index.js';
import { Transaction, TransactionDataBuilder } from '../../../src/transactions/index.js';
import { toBase58 } from 'rtd-utils';

describe('Exact expiration Epoch u64', () => {
	it.each([
		'0',
		'42',
		'9007199254740991',
		'9007199254740992',
		'9007199254740993',
		'18446744073709551615',
	])('preserves %s through BCS, v1/v2 JSON and final transaction bytes', async (epoch) => {
		const encoded = bcs.TransactionExpiration.serialize({ Epoch: epoch }).toBytes();
		// Independent wire oracle: variant 1, followed by little-endian u64.
		const expected = new Uint8Array(9);
		expected[0] = 1;
		new DataView(expected.buffer).setBigUint64(1, BigInt(epoch), true);
		expect(encoded).toEqual(expected);
		expect(bcs.TransactionExpiration.parse(encoded)).toMatchObject({ Epoch: epoch });
		const tx = new Transaction();
		tx.setSender('0xa');
		tx.setGasOwner('0xa');
		tx.setGasBudget(100);
		tx.setGasPrice(1);
		tx.setGasPayment([
			{ objectId: '0xb', version: '1', digest: toBase58(new Uint8Array(32).fill(7)) },
		]);
		tx.setExpiration({ Epoch: epoch });
		const bytes = await tx.build();
		for (const restored of [
			Transaction.from(bytes),
			Transaction.from(tx.serialize()),
			Transaction.from(await tx.toJSON()),
		]) {
			expect(String(restored.getData().expiration!.Epoch)).toBe(epoch);
			const rebuilt = await restored.build();
			expect(rebuilt).toEqual(bytes);
			expect(TransactionDataBuilder.getDigestFromBytes(rebuilt)).toBe(
				TransactionDataBuilder.getDigestFromBytes(bytes),
			);
		}
	});
	it('rejects an already imprecise number; callers must provide decimal strings', () => {
		expect(() => new Transaction().setExpiration({ Epoch: Number.MAX_SAFE_INTEGER + 1 })).toThrow();
		expect(() =>
			bcs.TransactionExpiration.serialize({ Epoch: Number.MAX_SAFE_INTEGER + 1 }),
		).toThrow();
	});
});
