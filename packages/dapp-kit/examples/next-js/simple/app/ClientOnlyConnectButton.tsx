// Copyright (c) LinkU Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { DAppKitProvider } from 'rtd-dapp-kit-react';
import { ConnectButton } from 'rtd-dapp-kit-react/ui';
import { dAppKit } from './dApp-kit.ts';

export default function ClientOnlyConnectButton() {
	return (
		<DAppKitProvider dAppKit={dAppKit}>
			<ConnectButton />
		</DAppKitProvider>
	);
}
