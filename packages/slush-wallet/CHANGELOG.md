# rtd-slush-wallet

## 1.2.5

## 1.2.4

## 1.2.3

## 1.2.2

## 1.2.1

### Patch Changes

- 3175d33: Exclude unit tests from the production TypeScript build so releases do not require
  Vitest.

## 1.2.0

### Minor Changes

- a1f4087: Preserve per-account signing features in web wallet sessions. Slush now honors an
  explicit empty or restricted feature list, while older sessions without the field retain their
  existing capabilities.

  Enforce signed account capabilities during wallet-side request verification, advertise only
  implemented features, and refresh account capabilities when another tab replaces the hosted
  session.

  Dispose cross-tab session listeners when unregistering the wallet. Directly constructed wallets
  can release their listener with `dispose()`.

### Patch Changes

- Updated dependencies [a1f4087]
  - rtd-window-wallet-core@0.3.0

## 1.1.24

## 1.1.23

## 1.1.22

### Patch Changes

- 331eb20: Default personal message signing requests without a chain to Rtd mainnet.

## 1.1.21

## 1.1.20

## 1.1.19

## 1.1.18

## 1.1.17

## 1.1.16

## 1.1.15

## 1.1.14

## 1.1.13

## 1.1.12

### Patch Changes

- 8c4b149: Update dependencies to versions that resolve security advisories: hono,
  @hono/node-server, next, postcss, and valibot

## 1.1.11

## 1.1.10

## 1.1.9

## 1.1.8

## 1.1.7

## 1.1.6

## 1.1.5

## 1.1.4

## 1.1.3

## 1.1.2

## 1.1.1

## 1.1.0

### Minor Changes

- bbf63cb: Updated dependencies

### Patch Changes

- Updated dependencies [bbf63cb]
  - rtd-utils@0.4.0
  - rtd-wallet-standard@0.21.0
  - rtd-window-wallet-core@0.2.0

## 1.0.5

### Patch Changes

- f7de3e5: Restore docs in published tarballs.
- Updated dependencies [f7de3e5]
  - rtd-typescript@2.16.2
  - rtd-utils@0.3.3
  - rtd-wallet-standard@0.20.3
  - rtd-window-wallet-core@0.1.6

## 1.0.4

### Patch Changes

- 9e067cf: Validate the new per-package release flow end-to-end across every public @linku package.
  No functional changes — empty patch bump to force the orchestrator to dispatch every
  release-<pkg>.yml workflow with `dry_run=false` so each package publishes via OIDC trusted
  publishing.
- Updated dependencies [9e067cf]
  - rtd-typescript@2.16.1
  - rtd-utils@0.3.2
  - rtd-wallet-standard@0.20.2
  - rtd-window-wallet-core@0.1.5

## 1.0.3

### Patch Changes

- 43e69f8: Add embedded LLM-friendly docs to published packages
- Updated dependencies [43e69f8]
- Updated dependencies [e51dc5d]
- Updated dependencies [a7237ff]
  - rtd-typescript@2.8.0
  - rtd-window-wallet-core@0.1.4
  - rtd-wallet-standard@0.20.1

## 1.0.2

### Patch Changes

- 99d1e00: Add default export condition
- Updated dependencies [99d1e00]
  - rtd-window-wallet-core@0.1.3
  - rtd-wallet-standard@0.20.1
  - rtd-utils@0.3.1
  - rtd-typescript@2.3.2

## 1.0.1

### Patch Changes

- Updated dependencies [339d1e0]
  - rtd-utils@0.3.0
  - rtd-typescript@2.0.1
  - rtd-window-wallet-core@0.1.2
  - rtd-wallet-standard@0.20.0

## 1.0.0

### Patch Changes

- Updated dependencies [e00788c]
- Updated dependencies [e00788c]
- Updated dependencies [e00788c]
- Updated dependencies [e00788c]
- Updated dependencies [e00788c]
- Updated dependencies [e00788c]
- Updated dependencies [e00788c]
- Updated dependencies [e00788c]
- Updated dependencies [e00788c]
- Updated dependencies [e00788c]
- Updated dependencies [e00788c]
- Updated dependencies [e00788c]
- Updated dependencies [e00788c]
- Updated dependencies [e00788c]
  - rtd-typescript@2.0.0
  - rtd-wallet-standard@0.20.0

## 0.3.0

### Minor Changes

- b827dfd: Replace references to Rtd Wallet and set Slush as the default wallet in WalletList.tsx

## 0.2.12

### Patch Changes

- Updated dependencies [29e8b92]
  - rtd-typescript@1.45.2
  - rtd-wallet-standard@0.19.9

## 0.2.11

### Patch Changes

- e3811f1: update valibot
- Updated dependencies [e3811f1]
  - rtd-window-wallet-core@0.1.1
  - rtd-typescript@1.45.1
  - rtd-wallet-standard@0.19.8

## 0.2.10

### Patch Changes

- Updated dependencies [88bdbac]
  - rtd-typescript@1.45.0
  - rtd-wallet-standard@0.19.7

## 0.2.9

### Patch Changes

- Updated dependencies [44d9b4f]
  - rtd-typescript@1.44.0
  - rtd-wallet-standard@0.19.6

## 0.2.8

### Patch Changes

- rtd-typescript@1.43.2
- rtd-wallet-standard@0.19.5

## 0.2.7

### Patch Changes

- rtd-typescript@1.43.1
- rtd-wallet-standard@0.19.4

## 0.2.6

### Patch Changes

- Updated dependencies [f3b19a7]
- Updated dependencies [bf9f85c]
  - rtd-typescript@1.43.0
  - rtd-wallet-standard@0.19.3

## 0.2.5

### Patch Changes

- Updated dependencies [98c8a27]
  - rtd-typescript@1.42.0
  - rtd-wallet-standard@0.19.2

## 0.2.4

### Patch Changes

- Updated dependencies [d554cd2]
- Updated dependencies [04fcfbc]
  - rtd-typescript@1.41.0
  - rtd-wallet-standard@0.19.1

## 0.2.3

### Patch Changes

- Updated dependencies [f5fc0c0]
- Updated dependencies [f5fc0c0]
  - rtd-wallet-standard@0.19.0
  - rtd-typescript@1.40.0

## 0.2.2

### Patch Changes

- Updated dependencies [a9f9035]
  - rtd-typescript@1.39.1
  - rtd-wallet-standard@0.18.1

## 0.2.1

### Patch Changes

- Updated dependencies [566b9ae]
- Updated dependencies [ca92487]
- Updated dependencies [5ab3c0a]
  - rtd-wallet-standard@0.18.0
  - rtd-typescript@1.39.0

## 0.2.0

### Minor Changes

- ea1ac70: Update dependencies and improve support for typescript 5.9

### Patch Changes

- Updated dependencies [45efc26]
- Updated dependencies [3c1741f]
- Updated dependencies [ea1ac70]
  - rtd-window-wallet-core@0.1.0
  - rtd-typescript@1.38.0
  - rtd-wallet-standard@0.17.0
  - rtd-utils@0.2.0

## 0.1.24

### Patch Changes

- Updated dependencies [c689b98]
- Updated dependencies [c689b98]
- Updated dependencies [5b9ff1a]
  - rtd-typescript@1.37.6
  - rtd-wallet-standard@0.16.14

## 0.1.23

### Patch Changes

- Updated dependencies [3980d04]
  - rtd-typescript@1.37.5
  - rtd-wallet-standard@0.16.13

## 0.1.22

### Patch Changes

- Updated dependencies [6b03e57]
  - rtd-typescript@1.37.4
  - rtd-wallet-standard@0.16.12

## 0.1.21

### Patch Changes

- Updated dependencies [8ff1471]
  - rtd-typescript@1.37.3
  - rtd-wallet-standard@0.16.11

## 0.1.20

### Patch Changes

- Updated dependencies [660377c]
  - rtd-typescript@1.37.2
  - rtd-wallet-standard@0.16.10

## 0.1.19

### Patch Changes

- rtd-typescript@1.37.1
- rtd-wallet-standard@0.16.9

## 0.1.18

### Patch Changes

- Updated dependencies [72168f0]
  - rtd-typescript@1.37.0
  - rtd-wallet-standard@0.16.8

## 0.1.17

### Patch Changes

- Updated dependencies [44354ab]
  - rtd-typescript@1.36.2
  - rtd-wallet-standard@0.16.7

## 0.1.16

### Patch Changes

- Updated dependencies [c76ddc5]
  - rtd-typescript@1.36.1
  - rtd-wallet-standard@0.16.6

## 0.1.15

### Patch Changes

- 1c4a82d: update links in package.json
- Updated dependencies [1c4a82d]
- Updated dependencies [783bb9e]
- Updated dependencies [783bb9e]
- Updated dependencies [5cbbb21]
  - rtd-window-wallet-core@0.0.6
  - rtd-utils@0.1.1
  - rtd-typescript@1.36.0
  - rtd-wallet-standard@0.16.5

## 0.1.14

### Patch Changes

- Updated dependencies [888afe6]
  - rtd-typescript@1.35.0
  - rtd-wallet-standard@0.16.4

## 0.1.13

### Patch Changes

- Updated dependencies [3fb7a83]
  - rtd-typescript@1.34.0
  - rtd-wallet-standard@0.16.3

## 0.1.12

### Patch Changes

- Updated dependencies [a00522b]
- Updated dependencies [a00522b]
  - rtd-typescript@1.33.0
  - rtd-utils@0.1.0
  - rtd-wallet-standard@0.16.2
  - rtd-window-wallet-core@0.0.5

## 0.1.11

### Patch Changes

- Updated dependencies [6b7deb8]
  - rtd-typescript@1.32.0
  - rtd-wallet-standard@0.16.1

## 0.1.10

### Patch Changes

- d0a406a: Authorize previously saved accounts without needing to call `connect`
- Updated dependencies [1ff4e57]
- Updated dependencies [550e2e3]
- Updated dependencies [550e2e3]
  - rtd-typescript@1.31.0
  - rtd-wallet-standard@0.16.0

## 0.1.9

### Patch Changes

- Updated dependencies [5bd6ca3]
  - rtd-typescript@1.30.5
  - rtd-wallet-standard@0.15.6

## 0.1.8

### Patch Changes

- Updated dependencies [5dce590]
- Updated dependencies [4a5aef6]
  - rtd-typescript@1.30.4
  - rtd-wallet-standard@0.15.5

## 0.1.7

### Patch Changes

- bb7c03a: Update dependencies
- Updated dependencies [4457f10]
- Updated dependencies [bb7c03a]
  - rtd-typescript@1.30.3
  - rtd-window-wallet-core@0.0.4
  - rtd-wallet-standard@0.15.4
  - rtd-utils@0.0.1

## 0.1.6

### Patch Changes

- Updated dependencies [b265f7e]
  - rtd-typescript@1.30.2
  - rtd-wallet-standard@0.15.3

## 0.1.5

### Patch Changes

- Updated dependencies [ec519fc]
  - rtd-typescript@1.30.1
  - rtd-wallet-standard@0.15.2

## 0.1.4

### Patch Changes

- 4721f75: Update slush wallet to statically define metadata
- Updated dependencies [2456052]
- Updated dependencies [5264038]
- Updated dependencies [2456052]
- Updated dependencies [a257600]
- Updated dependencies [933199c]
- Updated dependencies [2456052]
- Updated dependencies [2456052]
- Updated dependencies [2456052]
  - rtd-typescript@1.30.0
  - rtd-window-wallet-core@0.0.3
  - rtd-wallet-standard@0.15.1

## 0.1.3

### Patch Changes

- Updated dependencies [afbbb80]
  - rtd-wallet-standard@0.15.0

## 0.1.2

### Patch Changes

- 3f87e73: Fix broken message signing for zkLogin accounts in the web version of Slush Wallet
  - rtd-typescript@1.29.1
  - rtd-wallet-standard@0.14.9

## 0.1.1

### Patch Changes

- Updated dependencies [7d66a32]
- Updated dependencies [eb91fba]
- Updated dependencies [19a8045]
  - rtd-typescript@1.29.0
  - rtd-wallet-standard@0.14.8

## 0.1.0

### Minor Changes

- c5adcb8: Integrated rtd-slush-wallet, swapped registerStashedWallet for registerSlushWallet

### Patch Changes

- 91624e0: stop setting transaction sender
- Updated dependencies [9a94aea]
  - rtd-typescript@1.28.2
  - rtd-wallet-standard@0.14.7

## 0.0.3

### Patch Changes

- Updated dependencies [3cd4e53]
  - rtd-typescript@1.28.1
  - rtd-wallet-standard@0.14.6
