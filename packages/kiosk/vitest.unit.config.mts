// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		include: ['test/unit/**/*.test.ts'],
	},
	resolve: {
		alias: {
			'rtd-bcs': new URL('../bcs/src', import.meta.url).pathname,
			'rtd-typescript': new URL('../typescript/src', import.meta.url).pathname,
		},
	},
});
