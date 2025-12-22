// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { normalizeRtdObjectId } from './rtd-types.js';

export const RTD_DECIMALS = 9;
export const MIST_PER_RTD = BigInt(1000000000);

export const MOVE_STDLIB_ADDRESS = '0x1';
export const RTD_FRAMEWORK_ADDRESS = '0x2';
export const RTD_SYSTEM_ADDRESS = '0x3';
export const RTD_CLOCK_OBJECT_ID = normalizeRtdObjectId('0x6');
export const RTD_SYSTEM_MODULE_NAME = 'rtd_system';
export const RTD_TYPE_ARG = `${RTD_FRAMEWORK_ADDRESS}::rtd::RTD`;
export const RTD_SYSTEM_STATE_OBJECT_ID: string = normalizeRtdObjectId('0x5');
export const RTD_RANDOM_OBJECT_ID = normalizeRtdObjectId('0x8');
