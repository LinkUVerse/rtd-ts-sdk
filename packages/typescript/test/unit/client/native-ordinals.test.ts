import { afterEach, expect, it, vi } from 'vitest';

afterEach(() => {
	vi.unstubAllGlobals();
	vi.resetModules();
});

it('loads transaction utilities and formats errors without Intl', async () => {
	vi.stubGlobal('Intl', undefined);
	vi.resetModules();
	const { formatOrdinal, formatMoveAbortMessage } = await import('../../../src/client/utils.js');
	expect(formatOrdinal(111)).toBe('111th');
	expect(formatOrdinal(123)).toBe('123rd');
	expect(formatMoveAbortMessage({ command: 20, abortCode: '9' })).toBe(
		'MoveAbort in 21st command, abort code: 9',
	);
});

it('preserves English integer ordinals for command indices and their boundaries', async () => {
	const rules = new Intl.PluralRules('en-US', { type: 'ordinal' });
	const suffixes: Record<string, string> = { one: 'st', two: 'nd', few: 'rd', other: 'th' };
	const { formatOrdinal } = await import('../../../src/client/utils.js');
	for (let n = -200; n <= 10000; n++)
		expect(formatOrdinal(n)).toBe(`${n}${suffixes[rules.select(n)]}`);
	for (const n of [NaN, Infinity, -Infinity, 1.5]) expect(formatOrdinal(n)).toBe(`${n}th`);
});
