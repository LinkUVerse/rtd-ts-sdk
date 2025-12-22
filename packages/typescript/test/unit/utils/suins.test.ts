// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test } from 'vitest';

import { isValidRtdNSName, normalizeRtdNSName } from '../../../src/utils';

describe('isValidRtdNSName', () => {
	test('valid RtdNS names', () => {
		expect(isValidRtdNSName('example.rtd')).toBe(true);
		expect(isValidRtdNSName('EXAMPLE.rtd')).toBe(true);
		expect(isValidRtdNSName('@example')).toBe(true);
		expect(isValidRtdNSName('1.example.rtd')).toBe(true);
		expect(isValidRtdNSName('1@example')).toBe(true);
		expect(isValidRtdNSName('a.b.c.example.rtd')).toBe(true);
		expect(isValidRtdNSName('A.B.c.123@Example')).toBe(true);
		expect(isValidRtdNSName('1-a@1-b')).toBe(true);
		expect(isValidRtdNSName('1-a.1-b.rtd')).toBe(true);
		expect(isValidRtdNSName('-@test')).toBe(false);
		expect(isValidRtdNSName('-1@test')).toBe(false);
		expect(isValidRtdNSName('test@-')).toBe(false);
		expect(isValidRtdNSName('test@-1')).toBe(false);
		expect(isValidRtdNSName('test@-a')).toBe(false);
		expect(isValidRtdNSName('test.rtd2')).toBe(false);
		expect(isValidRtdNSName('.rtd2')).toBe(false);
		expect(isValidRtdNSName('test@')).toBe(false);
		expect(isValidRtdNSName('@@')).toBe(false);
		expect(isValidRtdNSName('@@test')).toBe(false);
		expect(isValidRtdNSName('test@test.test')).toBe(false);
		expect(isValidRtdNSName('@test.test')).toBe(false);
		expect(isValidRtdNSName('#@test')).toBe(false);
		expect(isValidRtdNSName('test@#')).toBe(false);
		expect(isValidRtdNSName('test.#.rtd')).toBe(false);
		expect(isValidRtdNSName('#.rtd')).toBe(false);
		expect(isValidRtdNSName('@.test.sue')).toBe(false);

		expect(isValidRtdNSName('hello-.rtd')).toBe(false);
		expect(isValidRtdNSName('hello--.rtd')).toBe(false);
		expect(isValidRtdNSName('hello.-rtd')).toBe(false);
		expect(isValidRtdNSName('hello.--rtd')).toBe(false);
		expect(isValidRtdNSName('hello.rtd-')).toBe(false);
		expect(isValidRtdNSName('hello.rtd--')).toBe(false);
		expect(isValidRtdNSName('hello-@rtd')).toBe(false);
		expect(isValidRtdNSName('hello--@rtd')).toBe(false);
		expect(isValidRtdNSName('hello@-rtd')).toBe(false);
		expect(isValidRtdNSName('hello@--rtd')).toBe(false);
		expect(isValidRtdNSName('hello@rtd-')).toBe(false);
		expect(isValidRtdNSName('hello@rtd--')).toBe(false);
		expect(isValidRtdNSName('hello--world@rtd')).toBe(false);
	});
});

describe('normalizeRtdNSName', () => {
	test('normalize RtdNS names', () => {
		expect(normalizeRtdNSName('example.rtd')).toMatch('@example');
		expect(normalizeRtdNSName('EXAMPLE.rtd')).toMatch('@example');
		expect(normalizeRtdNSName('@example')).toMatch('@example');
		expect(normalizeRtdNSName('1.example.rtd')).toMatch('1@example');
		expect(normalizeRtdNSName('1@example')).toMatch('1@example');
		expect(normalizeRtdNSName('a.b.c.example.rtd')).toMatch('a.b.c@example');
		expect(normalizeRtdNSName('A.B.c.123@Example')).toMatch('a.b.c.123@example');
		expect(normalizeRtdNSName('1-a@1-b')).toMatch('1-a@1-b');
		expect(normalizeRtdNSName('1-a.1-b.rtd')).toMatch('1-a@1-b');

		expect(normalizeRtdNSName('example.rtd', 'dot')).toMatch('example.rtd');
		expect(normalizeRtdNSName('EXAMPLE.rtd', 'dot')).toMatch('example.rtd');
		expect(normalizeRtdNSName('@example', 'dot')).toMatch('example.rtd');
		expect(normalizeRtdNSName('1.example.rtd', 'dot')).toMatch('1.example.rtd');
		expect(normalizeRtdNSName('1@example', 'dot')).toMatch('1.example.rtd');
		expect(normalizeRtdNSName('a.b.c.example.rtd', 'dot')).toMatch('a.b.c.example.rtd');
		expect(normalizeRtdNSName('A.B.c.123@Example', 'dot')).toMatch('a.b.c.123.example.rtd');
		expect(normalizeRtdNSName('1-a@1-b', 'dot')).toMatch('1-a.1-b.rtd');
		expect(normalizeRtdNSName('1-a.1-b.rtd', 'dot')).toMatch('1-a.1-b.rtd');

		expect(() => normalizeRtdNSName('-@test')).toThrowError('Invalid RtdNS name -@test');
		expect(normalizeRtdNSName('1-a@1-b')).toMatchInlineSnapshot('"1-a@1-b"');
		expect(normalizeRtdNSName('1-a.1-b.rtd')).toMatchInlineSnapshot('"1-a@1-b"');
		expect(() => normalizeRtdNSName('-@test')).toThrowError('Invalid RtdNS name -@test');
		expect(() => normalizeRtdNSName('-1@test')).toThrowError('Invalid RtdNS name -1@test');
		expect(() => normalizeRtdNSName('test@-')).toThrowError('Invalid RtdNS name test@-');
		expect(() => normalizeRtdNSName('test@-1')).toThrowError('Invalid RtdNS name test@-1');
		expect(() => normalizeRtdNSName('test@-a')).toThrowError('Invalid RtdNS name test@-a');
		expect(() => normalizeRtdNSName('test.rtd2')).toThrowError('Invalid RtdNS name test.rtd2');
		expect(() => normalizeRtdNSName('.rtd2')).toThrowError('Invalid RtdNS name .rtd2');
		expect(() => normalizeRtdNSName('test@')).toThrowError('Invalid RtdNS name test@');
		expect(() => normalizeRtdNSName('@@')).toThrowError('Invalid RtdNS name @@');
		expect(() => normalizeRtdNSName('@@test')).toThrowError('Invalid RtdNS name @@test');
		expect(() => normalizeRtdNSName('test@test.test')).toThrowError(
			'Invalid RtdNS name test@test.test',
		);
		expect(() => normalizeRtdNSName('@test.test')).toThrowError('Invalid RtdNS name @test.test');
		expect(() => normalizeRtdNSName('#@test')).toThrowError('Invalid RtdNS name #@test');
		expect(() => normalizeRtdNSName('test@#')).toThrowError('Invalid RtdNS name test@#');
		expect(() => normalizeRtdNSName('test.#.rtd')).toThrowError('Invalid RtdNS name test.#.rtd');
		expect(() => normalizeRtdNSName('#.rtd')).toThrowError('Invalid RtdNS name #.rtd');
		expect(() => normalizeRtdNSName('@.test.sue')).toThrowError('Invalid RtdNS name @.test.sue');
	});
});
