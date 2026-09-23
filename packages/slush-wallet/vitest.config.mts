// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { defineConfig } from 'vitest/config';

export default defineConfig({
	resolve: {
		alias: {
			'rtd-window-wallet-core': new URL('../window-wallet-core/src/index.ts', import.meta.url)
				.pathname,
		},
	},
});
