// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

export { formatAddress, formatDigest } from './format.js';
export {
	isValidRtdAddress,
	isValidRtdObjectId,
	isValidTransactionDigest,
	normalizeStructTag,
	normalizeRtdAddress,
	normalizeRtdObjectId,
	parseStructTag,
	RTD_ADDRESS_LENGTH,
} from './rtd-types.js';

export {
	fromB64,
	toB64,
	fromHEX,
	toHex,
	toHEX,
	fromHex,
	fromBase64,
	toBase64,
	fromBase58,
	toBase58,
} from '@linku/bcs';
export { isValidRtdNSName, normalizeRtdNSName } from './rtdns.js';

export {
	RTD_DECIMALS,
	MIST_PER_RTD,
	MOVE_STDLIB_ADDRESS,
	RTD_FRAMEWORK_ADDRESS,
	RTD_SYSTEM_ADDRESS,
	RTD_CLOCK_OBJECT_ID,
	RTD_SYSTEM_MODULE_NAME,
	RTD_TYPE_ARG,
	RTD_SYSTEM_STATE_OBJECT_ID,
	RTD_RANDOM_OBJECT_ID,
} from './constants.js';

export { isValidNamedPackage, isValidNamedType } from './move-registry.js';

export { deriveDynamicFieldID } from './dynamic-fields.js';

export { deriveObjectID } from './derived-objects.js';
export { normalizeTypeTag } from '../bcs/type-tag-serializer.js';
