// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

const RTD_NS_NAME_REGEX =
	/^(?!.*(^(?!@)|[-.@])($|[-.@]))(?:[a-z0-9-]{0,63}(?:\.[a-z0-9-]{0,63})*)?@[a-z0-9-]{0,63}$/i;
const RTD_NS_DOMAIN_REGEX = /^(?!.*(^|[-.])($|[-.]))(?:[a-z0-9-]{0,63}\.)+rtd$/i;
const MAX_RTD_NS_NAME_LENGTH = 235;

export function isValidRtdNSName(name: string): boolean {
	if (name.length > MAX_RTD_NS_NAME_LENGTH) {
		return false;
	}

	if (name.includes('@')) {
		return RTD_NS_NAME_REGEX.test(name);
	}

	return RTD_NS_DOMAIN_REGEX.test(name);
}

export function normalizeRtdNSName(name: string, format: 'at' | 'dot' = 'at'): string {
	const lowerCase = name.toLowerCase();
	let parts;

	if (lowerCase.includes('@')) {
		if (!RTD_NS_NAME_REGEX.test(lowerCase)) {
			throw new Error(`Invalid RtdNS name ${name}`);
		}
		const [labels, domain] = lowerCase.split('@');
		parts = [...(labels ? labels.split('.') : []), domain];
	} else {
		if (!RTD_NS_DOMAIN_REGEX.test(lowerCase)) {
			throw new Error(`Invalid RtdNS name ${name}`);
		}
		parts = lowerCase.split('.').slice(0, -1);
	}

	if (format === 'dot') {
		return `${parts.join('.')}.rtd`;
	}

	return `${parts.slice(0, -1).join('.')}@${parts[parts.length - 1]}`;
}
