// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type { RtdObjectChange } from './generated.js';

export type RtdObjectChangePublished = Extract<RtdObjectChange, { type: 'published' }>;
export type RtdObjectChangeTransferred = Extract<RtdObjectChange, { type: 'transferred' }>;
export type RtdObjectChangeMutated = Extract<RtdObjectChange, { type: 'mutated' }>;
export type RtdObjectChangeDeleted = Extract<RtdObjectChange, { type: 'deleted' }>;
export type RtdObjectChangeWrapped = Extract<RtdObjectChange, { type: 'wrapped' }>;
export type RtdObjectChangeCreated = Extract<RtdObjectChange, { type: 'created' }>;
