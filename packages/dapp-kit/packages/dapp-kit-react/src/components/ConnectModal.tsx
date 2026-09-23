// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { createComponent } from '@lit/react';
import { DAppKitConnectModal as ConnectModalElement } from 'rtd-dapp-kit-core/web';
import { useDAppKit } from '../hooks/useDAppKit.js';
import type { ComponentProps } from 'react';

export type ConnectModalProps = ComponentProps<typeof ConnectModalComponent>;

const ConnectModalComponent = createComponent({
	react: React,
	tagName: 'linku-dapp-kit-connect-modal',
	elementClass: ConnectModalElement,
});

export function ConnectModal({ instance, ...props }: ConnectModalProps) {
	const dAppKit = useDAppKit(instance);
	return <ConnectModalComponent {...props} instance={dAppKit} />;
}
