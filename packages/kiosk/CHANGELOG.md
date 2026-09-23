# rtd-kiosk

## 1.4.13

## 1.4.12

## 1.4.11

## 1.4.10

## 1.4.9

## 1.4.8

## 1.4.7

## 1.4.6

## 1.4.5

## 1.4.4

## 1.4.3

## 1.4.2

## 1.4.1

### Patch Changes

- 19e85a3: Regenerate contract bindings with the latest codegen utils template

## 1.4.0

### Minor Changes

- f27cd69: Add support for `RtdGrpcClient` and other `ClientWithCoreApi` implementations to the
  Kiosk SDK, and query objects and transfer policy events through the shared Core API.

## 1.3.13

## 1.3.12

## 1.3.11

## 1.3.10

## 1.3.9

## 1.3.8

## 1.3.7

## 1.3.6

## 1.3.5

## 1.3.4

## 1.3.3

## 1.3.2

## 1.3.1

## 1.3.0

### Minor Changes

- bbf63cb: Add `typeTag` and `resolveTypeTag` methods to the generated `MoveStruct`, `MoveEnum`, and
  `MoveTuple` classes.

  - `typeTag(options?)` builds the type tag string for a generated type. `typeArguments` is the full
    positional list of type arguments in Move declaration order; each entry is a type tag string,
    another `typeTag()` result, or a BCS type (its name is used). Types with unfilled phantom
    parameters require `typeArguments` at compile time, and argument arity is validated at runtime.
  - `resolveTypeTag({ client, ... })` builds the tag, resolves MVR names through
    `client.core.mvr.resolveType`, and returns the normalized address-only form suitable for queries
    and comparisons against on-chain data.

- bbf63cb: Updated dependencies

### Patch Changes

- Updated dependencies [bbf63cb]
  - rtd-bcs@2.1.0
  - rtd-utils@0.4.0

## 1.2.6

### Patch Changes

- f7de3e5: Restore docs in published tarballs.
- Updated dependencies [f7de3e5]
  - rtd-bcs@2.0.5
  - rtd-typescript@2.16.2
  - rtd-utils@0.3.3

## 1.2.5

### Patch Changes

- 9e067cf: Validate the new per-package release flow end-to-end across every public @linku package.
  No functional changes — empty patch bump to force the orchestrator to dispatch every
  release-<pkg>.yml workflow with `dry_run=false` so each package publishes via OIDC trusted
  publishing.
- Updated dependencies [9e067cf]
  - rtd-bcs@2.0.4
  - rtd-typescript@2.16.1
  - rtd-utils@0.3.2

## 1.2.4

### Patch Changes

- bb8d26a: Fix three latent type errors in the generated `utils/index.ts` that surfaced for
  consumers with `noUncheckedIndexedAccess: true`:
  - `getPureBcsSchema(structTag.typeParams[0])` passed `TypeTag | undefined` to a parameter typed
    `string | TypeTag`. Now null-checks the inner tag before passing it.
  - `argTypes[i]` was redundantly re-indexed inside a `for…of entries()` loop, returning
    `string | null | undefined` and being passed back to `getPureBcsSchema`. Switched to the loop
    variable, which is `string | null`.
  - `MoveStruct.get()` returned the destructured `[res]` from `getMany([objectId])` without
    asserting it was defined. Now throws if no object was returned.

  The codegen test suite gained a `tsc`-based check that compiles the generated `utils/index.ts`
  under strict + `noUncheckedIndexedAccess`, so embedded-template type bugs are caught before
  release rather than by downstream consumers.

  All consumer packages (`payment-kit`, `pas`, `walrus`, `rtdns`, `deepbook-v3`, `kiosk`) have been
  regenerated with the fix.

## 1.2.3

### Patch Changes

- c96956e: Regenerate generated Move types against the latest contract sources. The generated
  `utils/index.ts` `GetOptions` / `GetManyOptions` are now exported as type aliases (intersection)
  instead of interfaces. RtdNS gains `SubnamePrunedEvent`, `pruneExpiredSubname`, and
  `pruneExpiredSubnames`.

## 1.2.2

### Patch Changes

- e9570a1: Regenerated Move call bindings. Parameters that can't accept a plain value (non-`key`
  struct or enum, `vector<KeyStruct>`, etc.) are now typed as `TransactionArgument`, forcing callers
  to pass a prior move-call result or `tx.makeMoveVec(...)`. Passing a bare string or array for
  these parameters was always broken at runtime.
- Updated dependencies [6adc085]
- Updated dependencies [b1bf49a]
  - rtd-typescript@2.16.0

## 1.2.1

### Patch Changes

- 6fd995d: Use type imports in generated code for verbatimModuleSyntax compatibility

## 1.2.0

### Minor Changes

- d0a401e: Update `Display.output` type from `Record<string, string>` to `Record<string, unknown>`
  to match actual API behavior. Display v2 templates can produce structured JSON values (objects,
  arrays) for fields that reference non-string Move types or use the `:json` transform. This affects
  the core client type, the JSON-RPC `DisplayFieldsResponse` type, and all three transport
  implementations (gRPC, GraphQL, JSON-RPC).

### Patch Changes

- Updated dependencies [d0a401e]
  - rtd-typescript@2.14.0

## 1.1.3

### Patch Changes

- 43e69f8: Add embedded LLM-friendly docs to published packages
- Updated dependencies [43e69f8]
- Updated dependencies [e51dc5d]
  - rtd-bcs@2.0.3
  - rtd-typescript@2.8.0

## 1.1.2

### Patch Changes

- 3d53583: Improve typing of generated bcs tuples

## 1.1.1

### Patch Changes

- 99d1e00: Add default export condition
- Updated dependencies [99d1e00]
  - rtd-utils@0.3.1
  - rtd-bcs@2.0.2
  - rtd-typescript@2.3.2

## 1.1.0

### Minor Changes

- d9133f1: Add display to kiosk items

## 1.0.1

### Patch Changes

- Updated dependencies [339d1e0]
  - rtd-utils@0.3.0
  - rtd-bcs@2.0.1
  - rtd-typescript@2.0.1

## 1.0.0

### Major Changes

- e00788c: ### Breaking Changes

  **Removed deprecated `transactionBlock` parameter**

  The deprecated `transactionBlock` parameter has been removed from `KioskTransaction`,
  `TransferPolicyTransaction`, and rule resolving functions. Use `transaction` instead:

  ```diff
  const kioskTx = new KioskTransaction({
  -  transactionBlock: tx,
  +  transaction: tx,
     kioskClient,
     cap,
  });
  ```

  **Removed low-level transaction helper functions**

  The following low-level helper functions have been removed. Use `KioskTransaction` and
  `TransferPolicyTransaction` classes instead:

  From kiosk operations:
  - `createKiosk` - use `kioskTx.create()`
  - `shareKiosk` - use `kioskTx.share()`
  - `place` - use `kioskTx.place()`
  - `lock` - use `kioskTx.lock()`
  - `take` - use `kioskTx.take()`
  - `list` - use `kioskTx.list()`
  - `delist` - use `kioskTx.delist()`
  - `placeAndList` - use `kioskTx.placeAndList()`
  - `purchase` - use `kioskTx.purchase()`
  - `withdrawFromKiosk` - use `kioskTx.withdraw()`
  - `borrowValue` - use `kioskTx.borrow()`
  - `returnValue` - use `kioskTx.return()`

  From transfer policy operations:
  - `createTransferPolicyWithoutSharing` - use `tpTx.create()`
  - `shareTransferPolicy` - use `tpTx.shareAndTransferCap()`
  - `confirmRequest` - handled automatically by `kioskTx.purchaseAndResolve()`
  - `removeTransferPolicyRule` - use `tpTx.removeRule()`

  From personal kiosk operations:
  - `convertToPersonalTx` - use `kioskTx.convertToPersonal()`
  - `transferPersonalCapTx` - handled automatically by `kioskTx.finalize()`

  From rule attachment:
  - `attachKioskLockRuleTx` - use `tpTx.addLockRule()`
  - `attachRoyaltyRuleTx` - use `tpTx.addRoyaltyRule()`
  - `attachPersonalKioskRuleTx` - use `tpTx.addPersonalKioskRule()`
  - `attachFloorPriceRuleTx` - use `tpTx.addFloorPriceRule()`

  **Updated client requirements**

  The SDK now uses the core client API (`ClientWithCoreApi`) instead of direct JSON-RPC types.
  Update your `KioskClient` initialization:

  ```diff
  const kioskClient = new KioskClient({
  -  client: new RtdClient({ url: getFullnodeUrl('mainnet') }),
  +  client: new RtdJsonRpcClient({
  +    url: getJsonRpcFullnodeUrl('mainnet'),
  +    network: 'mainnet',
  +  }),
     network: Network.MAINNET,
  });
  ```

  **Removed BCS exports**

  The `KioskType` and other BCS type exports from `bcs.ts` have been removed. The SDK now uses
  generated contract bindings internally.

### Minor Changes

- e00788c: Update to use RtdJsonRpcClient instead of RtdClient

  Updated all type signatures, internal usages, examples, and documentation to use
  `RtdJsonRpcClient` from `rtd-typescript/jsonRpc` instead of the deprecated `RtdClient` from
  `rtd-typescript/client`.

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
  - rtd-bcs@2.0.0

## 0.14.6

### Patch Changes

- Updated dependencies [29e8b92]
  - rtd-typescript@1.45.2

## 0.14.5

### Patch Changes

- Updated dependencies [e3811f1]
  - rtd-typescript@1.45.1

## 0.14.4

### Patch Changes

- Updated dependencies [88bdbac]
  - rtd-typescript@1.45.0

## 0.14.3

### Patch Changes

- Updated dependencies [44d9b4f]
  - rtd-typescript@1.44.0

## 0.14.2

### Patch Changes

- rtd-typescript@1.43.2

## 0.14.1

### Patch Changes

- rtd-typescript@1.43.1

## 0.14.0

### Minor Changes

- 75e5d23: Add `return this` in some functions in file
  `packages/kiosk/src/client/kiosk-transaction.ts` to make it chainable. If chain calls are not
  supported, some of the usage in the document will not be implemented: line 117 in
  `packages/docs/content/kiosk/from-v1.mdx` and line 110 in
  `packages/docs/content/kiosk/kiosk-client/kiosk-transaction/examples.mdx`.

### Patch Changes

- Updated dependencies [f3b19a7]
- Updated dependencies [bf9f85c]
  - rtd-typescript@1.43.0

## 0.13.6

### Patch Changes

- Updated dependencies [98c8a27]
  - rtd-typescript@1.42.0

## 0.13.5

### Patch Changes

- Updated dependencies [d554cd2]
- Updated dependencies [04fcfbc]
  - rtd-typescript@1.41.0

## 0.13.4

### Patch Changes

- Updated dependencies [f5fc0c0]
  - rtd-typescript@1.40.0

## 0.13.3

### Patch Changes

- Updated dependencies [a9f9035]
  - rtd-typescript@1.39.1

## 0.13.2

### Patch Changes

- Updated dependencies [ca92487]
- Updated dependencies [5ab3c0a]
  - rtd-typescript@1.39.0

## 0.13.1

### Patch Changes

- 0fb5271: Fix double-slash in Kiosk imports.

## 0.13.0

### Minor Changes

- ea1ac70: Update dependencies and improve support for typescript 5.9

### Patch Changes

- Updated dependencies [3c1741f]
- Updated dependencies [ea1ac70]
  - rtd-typescript@1.38.0
  - rtd-utils@0.2.0

## 0.12.26

### Patch Changes

- Updated dependencies [c689b98]
- Updated dependencies [5b9ff1a]
  - rtd-typescript@1.37.6

## 0.12.25

### Patch Changes

- Updated dependencies [3980d04]
  - rtd-typescript@1.37.5

## 0.12.24

### Patch Changes

- Updated dependencies [6b03e57]
  - rtd-typescript@1.37.4

## 0.12.23

### Patch Changes

- Updated dependencies [8ff1471]
  - rtd-typescript@1.37.3

## 0.12.22

### Patch Changes

- Updated dependencies [660377c]
  - rtd-typescript@1.37.2

## 0.12.21

### Patch Changes

- rtd-typescript@1.37.1

## 0.12.20

### Patch Changes

- Updated dependencies [72168f0]
  - rtd-typescript@1.37.0

## 0.12.19

### Patch Changes

- Updated dependencies [44354ab]
  - rtd-typescript@1.36.2

## 0.12.18

### Patch Changes

- Updated dependencies [c76ddc5]
  - rtd-typescript@1.36.1

## 0.12.17

### Patch Changes

- Updated dependencies [1c4a82d]
- Updated dependencies [783bb9e]
- Updated dependencies [783bb9e]
- Updated dependencies [5cbbb21]
  - rtd-utils@0.1.1
  - rtd-typescript@1.36.0

## 0.12.16

### Patch Changes

- Updated dependencies [888afe6]
  - rtd-typescript@1.35.0

## 0.12.15

### Patch Changes

- Updated dependencies [3fb7a83]
  - rtd-typescript@1.34.0

## 0.12.14

### Patch Changes

- Updated dependencies [a00522b]
- Updated dependencies [a00522b]
  - rtd-typescript@1.33.0
  - rtd-utils@0.1.0

## 0.12.13

### Patch Changes

- Updated dependencies [6b7deb8]
  - rtd-typescript@1.32.0

## 0.12.12

### Patch Changes

- Updated dependencies [1ff4e57]
- Updated dependencies [550e2e3]
- Updated dependencies [550e2e3]
  - rtd-typescript@1.31.0

## 0.12.11

### Patch Changes

- Updated dependencies [5bd6ca3]
  - rtd-typescript@1.30.5

## 0.12.10

### Patch Changes

- Updated dependencies [5dce590]
- Updated dependencies [4a5aef6]
  - rtd-typescript@1.30.4

## 0.12.9

### Patch Changes

- bb7c03a: Update dependencies
- Updated dependencies [4457f10]
- Updated dependencies [bb7c03a]
  - rtd-typescript@1.30.3
  - rtd-utils@0.0.1

## 0.12.8

### Patch Changes

- Updated dependencies [b265f7e]
  - rtd-typescript@1.30.2

## 0.12.7

### Patch Changes

- Updated dependencies [ec519fc]
  - rtd-typescript@1.30.1

## 0.12.6

### Patch Changes

- Updated dependencies [2456052]
- Updated dependencies [5264038]
- Updated dependencies [2456052]
- Updated dependencies [2456052]
- Updated dependencies [2456052]
- Updated dependencies [2456052]
  - rtd-typescript@1.30.0

## 0.12.5

### Patch Changes

- rtd-typescript@1.29.1

## 0.12.4

### Patch Changes

- Updated dependencies [7d66a32]
- Updated dependencies [eb91fba]
- Updated dependencies [19a8045]
  - rtd-typescript@1.29.0

## 0.12.3

### Patch Changes

- Updated dependencies [9a94aea]
  - rtd-typescript@1.28.2

## 0.12.2

### Patch Changes

- Updated dependencies [3cd4e53]
  - rtd-typescript@1.28.1

## 0.12.1

### Patch Changes

- Updated dependencies [2705dc8]
  - rtd-typescript@1.28.0

## 0.12.0

### Minor Changes

- d81b9a7: Use default pagination limit when loading kiosks

## 0.11.6

### Patch Changes

- 986c4e3: Fix transasction construction for royalty_rule::fee_amount
- Updated dependencies [5cea435]
  - rtd-typescript@1.27.1

## 0.11.5

### Patch Changes

- Updated dependencies [4d13ef8]
- Updated dependencies [4d13ef8]
  - rtd-typescript@1.27.0

## 0.11.4

### Patch Changes

- 7ba32a4: update dependencies
- Updated dependencies [7ba32a4]
  - rtd-typescript@1.26.1

## 0.11.3

### Patch Changes

- Updated dependencies [906dd14]
  - rtd-typescript@1.26.0

## 0.11.2

### Patch Changes

- Updated dependencies [e8b5d04]
  - rtd-typescript@1.25.0

## 0.11.1

### Patch Changes

- Updated dependencies [cf3d12d]
  - rtd-typescript@1.24.0

## 0.11.0

### Minor Changes

- d76da22: Remove MatchAny filter when loading owned kiosks. This may result in an extra request,
  and a change of cursor format when loading owned kiosks

## 0.10.8

### Patch Changes

- Updated dependencies [8baac61]
- Updated dependencies [8baac61]
  - rtd-typescript@1.23.0

## 0.10.7

### Patch Changes

- Updated dependencies [03975f4]
  - rtd-typescript@1.22.0

## 0.10.6

### Patch Changes

- rtd-typescript@1.21.2

## 0.10.5

### Patch Changes

- rtd-typescript@1.21.1

## 0.10.4

### Patch Changes

- Updated dependencies [3d8a0d9]
- Updated dependencies [20a5aaa]
  - rtd-typescript@1.21.0

## 0.10.3

### Patch Changes

- Updated dependencies [827a200]
  - rtd-typescript@1.20.0

## 0.10.2

### Patch Changes

- Updated dependencies [c39f32f]
- Updated dependencies [539168a]
  - rtd-typescript@1.19.0

## 0.10.1

### Patch Changes

- 7abd243: Update repo links
- Updated dependencies [7abd243]
  - rtd-typescript@1.18.1

## 0.10.0

### Minor Changes

- c755947: Update fee calculation to happen via dry runs to improve the display of transactions
  within the wallet.

## 0.9.34

### Patch Changes

- Updated dependencies [4f012b9]
- Updated dependencies [85bd9e4]
- Updated dependencies [5e3709d]
- Updated dependencies [b2928a9]
- Updated dependencies [dc0e21e]
- Updated dependencies [85bd9e4]
- Updated dependencies [a872b97]
  - rtd-typescript@1.18.0

## 0.9.33

### Patch Changes

- Updated dependencies [20af12d]
  - rtd-typescript@1.17.0

## 0.9.32

### Patch Changes

- Updated dependencies [100207f]
  - rtd-typescript@1.16.2

## 0.9.31

### Patch Changes

- rtd-typescript@1.16.1

## 0.9.30

### Patch Changes

- Updated dependencies [ec2dc7f]
- Updated dependencies [ec2dc7f]
  - rtd-typescript@1.16.0

## 0.9.29

### Patch Changes

- rtd-typescript@1.15.1

## 0.9.28

### Patch Changes

- Updated dependencies [6460e45]
  - rtd-typescript@1.15.0

## 0.9.27

### Patch Changes

- Updated dependencies [938fb6e]
  - rtd-typescript@1.14.4

## 0.9.26

### Patch Changes

- Updated dependencies [d5a23d7]
  - rtd-typescript@1.14.3

## 0.9.25

### Patch Changes

- Updated dependencies [e7bc63e]
  - rtd-typescript@1.14.2

## 0.9.24

### Patch Changes

- Updated dependencies [69ef100]
  - rtd-typescript@1.14.1

## 0.9.23

### Patch Changes

- 4166d71: Fix doc comment on `getKiosk` command
- Updated dependencies [c24814b]
  - rtd-typescript@1.14.0

## 0.9.22

### Patch Changes

- Updated dependencies [477d2a4]
  - rtd-typescript@1.13.0

## 0.9.21

### Patch Changes

- Updated dependencies [5436a90]
- Updated dependencies [5436a90]
  - rtd-typescript@1.12.0

## 0.9.20

### Patch Changes

- Updated dependencies [489f421]
- Updated dependencies [489f421]
  - rtd-typescript@1.11.0

## 0.9.19

### Patch Changes

- Updated dependencies [830b8d8]
  - rtd-typescript@1.10.0

## 0.9.18

### Patch Changes

- Updated dependencies [2c96b06]
- Updated dependencies [1fd22cc]
  - rtd-typescript@1.9.0

## 0.9.17

### Patch Changes

- Updated dependencies [569511a]
  - rtd-typescript@1.8.0

## 0.9.16

### Patch Changes

- Updated dependencies [143cd9d]
- Updated dependencies [4357ac6]
- Updated dependencies [4019dd7]
- Updated dependencies [4019dd7]
- Updated dependencies [00a974d]
  - rtd-typescript@1.7.0

## 0.9.15

### Patch Changes

- Updated dependencies [a3e32fe]
  - rtd-typescript@1.6.0

## 0.9.14

### Patch Changes

- Updated dependencies [0851b31]
- Updated dependencies [f37b3c2]
  - rtd-typescript@1.5.0

## 0.9.13

### Patch Changes

- Updated dependencies [4419234]
  - rtd-typescript@1.4.0

## 0.9.12

### Patch Changes

- Updated dependencies [a45f461]
  - rtd-typescript@1.3.1

## 0.9.11

### Patch Changes

- 0f27a97: Update dependencies
- Updated dependencies [7fc464a]
- Updated dependencies [086b2bc]
- Updated dependencies [0fb0628]
- Updated dependencies [cdedf69]
- Updated dependencies [0f27a97]
- Updated dependencies [beed646]
  - rtd-typescript@1.3.0

## 0.9.10

### Patch Changes

- Updated dependencies [06a900c1ab]
- Updated dependencies [45877014d1]
- Updated dependencies [87d6f75403]
  - rtd-typescript@1.2.1

## 0.9.9

### Patch Changes

- Updated dependencies [fef99d377f]
  - rtd-typescript@1.2.0

## 0.9.8

### Patch Changes

- Updated dependencies [0dfff33b95]
  - rtd-typescript@1.1.2

## 0.9.7

### Patch Changes

- Updated dependencies [101f1ff4b8]
  - rtd-typescript@1.1.1

## 0.9.6

### Patch Changes

- Updated dependencies [bae8f9683c]
  - rtd-typescript@1.1.0

## 0.9.5

### Patch Changes

- Updated dependencies [369b924343]
  - rtd-typescript@1.0.5

## 0.9.4

### Patch Changes

- Updated dependencies [f1e828f557]
  - rtd-typescript@1.0.4

## 0.9.3

### Patch Changes

- Updated dependencies [1f20580841]
  - rtd-typescript@1.0.3

## 0.9.2

### Patch Changes

- Updated dependencies [f0a839f874]
  - rtd-typescript@1.0.2

## 0.9.1

### Patch Changes

- Updated dependencies [6fc6235984]
  - rtd-typescript@1.0.1

## 0.9.0

### Minor Changes

- a92b03de42: The Typescript SDK has been renamed to `rtd-typescript` and includes many new features
  and breaking changes. See the
  [full migration guide](https://sdk.linkuverse.com/rtd/migrations/rtd-1.0) for details on how to
  upgrade.

### Patch Changes

- Updated dependencies [ebdfe7cf21]
- Updated dependencies [a92b03de42]
  - rtd-typescript@1.0.0

## 0.8.10

### Patch Changes

- Updated dependencies [99b112178c]
  - rtd-rtd.js@0.54.1

## 0.8.9

### Patch Changes

- Updated dependencies [b7f673dbd9]
- Updated dependencies [123b42c75c]
  - rtd-rtd.js@0.54.0

## 0.8.8

### Patch Changes

- Updated dependencies [774bfb41a8]
  - rtd-rtd.js@0.53.0

## 0.8.7

### Patch Changes

- 0511cf3378: Adds pagination option for owned kiosks lookup
- Updated dependencies [929db4976a]
  - rtd-rtd.js@0.52.0

## 0.8.6

### Patch Changes

- Updated dependencies [b4ecdb5860]
  - rtd-rtd.js@0.51.2

## 0.8.5

### Patch Changes

- Updated dependencies [6984dd1e38]
  - rtd-rtd.js@0.51.1

## 0.8.4

### Patch Changes

- Updated dependencies [0cafa94027]
  - rtd-rtd.js@0.51.0

## 0.8.3

### Patch Changes

- 4830361fa4: Updated typescript version
- Updated dependencies [4830361fa4]
  - rtd-rtd.js@0.50.1

## 0.8.2

### Patch Changes

- a3971c3524: Fixes `lock` function arguments. `itemId` is replaced by `item`, which accepts an
  ObjectArgument instead of a string. `itemId` is still supported but deprecated, and will be
  removed in future versions.
- Updated dependencies [a34f1cb67d]
- Updated dependencies [c08e3569ef]
- Updated dependencies [9a14e61db4]
- Updated dependencies [13e922d9b1]
- Updated dependencies [a34f1cb67d]
- Updated dependencies [220a766d86]
  - rtd-rtd.js@0.50.0

## 0.8.1

### Patch Changes

- 9ac0a4ec01: Add extensions to all sdk import paths
- Updated dependencies [9ac0a4ec01]
  - rtd-rtd.js@0.49.1

## 0.8.0

### Minor Changes

- e5f9e3ba21: Replace tsup based build to fix issues with esm/cjs dual publishing

### Patch Changes

- Updated dependencies [e5f9e3ba21]
  - rtd-rtd.js@0.49.0

## 0.7.13

### Patch Changes

- dd362ec1d6: Update docs url to sdk.linkuverse.com
- Updated dependencies [dd362ec1d6]
  - rtd-rtd.js@0.48.1

## 0.7.12

### Patch Changes

- Updated dependencies [cdcfa76c43]
  - rtd-rtd.js@0.48.0

## 0.7.11

### Patch Changes

- Updated dependencies [194c980cb]
- Updated dependencies [9ac7e2f3d]
- Updated dependencies [0259aec82]
- Updated dependencies [64d45ba27]
  - rtd-rtd.js@0.47.0

## 0.7.10

### Patch Changes

- Updated dependencies [652bcdd92]
  - rtd-rtd.js@0.46.1

## 0.7.9

### Patch Changes

- 43444c58f: Extend the `TransactionBlock#object()` API to accept the `TransactionResult` type as
  well, so that it can be used flexibly in SDKs.
- 3718a230b: Adds `txb.pure.id()` to pass ID pure values more intuitively
- Updated dependencies [28c2c3330]
- Updated dependencies [43444c58f]
- Updated dependencies [8d1e74e52]
- Updated dependencies [093554a0d]
- Updated dependencies [3718a230b]
  - rtd-rtd.js@0.46.0

## 0.7.8

### Patch Changes

- Updated dependencies [30b47b758]
  - rtd-rtd.js@0.45.1

## 0.7.7

### Patch Changes

- Updated dependencies [b9afb5567]
  - rtd-rtd.js@0.45.0

## 0.7.6

### Patch Changes

- b48289346: Mark packages as being side-effect free.
- 3699dd364: Adds support for extensions (on `getKiosk()`), and exports a `getKioskExtension()`
  function on kioskClient to get extension's content
- Updated dependencies [b48289346]
- Updated dependencies [11cf4e68b]
  - rtd-rtd.js@0.44.0

## 0.7.5

### Patch Changes

- Updated dependencies [004fb1991]
  - rtd-rtd.js@0.43.3

## 0.7.4

### Patch Changes

- Updated dependencies [9b052166d]
  - rtd-rtd.js@0.43.2

## 0.7.3

### Patch Changes

- Updated dependencies [faa13ded9]
- Updated dependencies [c5684bb52]
  - rtd-rtd.js@0.43.1

## 0.7.2

### Patch Changes

- 68fea9e97: Fixes resolve royalty rule from breaking.

## 0.7.1

### Patch Changes

- Updated dependencies [781d073d9]
- Updated dependencies [3764c464f]
- Updated dependencies [e4484852b]
- Updated dependencies [71e0a3197]
- Updated dependencies [1bc430161]
  - rtd-rtd.js@0.43.0

## 0.7.0

### Minor Changes

- 5ee8c24f1: Introduces BREAKING CHANGES. Migration guide and explanation:
  https://sdk.linkuverse.com/kiosk/from-v1

## 0.6.0

### Minor Changes

- fd8589806: Remove uses of deprecated imports from rtd-rtd.js

### Patch Changes

- Updated dependencies [fd8589806]
  - rtd-rtd.js@0.42.0

## 0.5.3

### Patch Changes

- rtd-rtd.js@0.41.2

## 0.5.2

### Patch Changes

- Updated dependencies [24c21e1f0]
  - rtd-rtd.js@0.41.1

## 0.5.1

### Patch Changes

- Updated dependencies [ba8e3b857]
- Updated dependencies [f4b7b3474]
  - rtd-rtd.js@0.41.0

## 0.5.0

### Minor Changes

- 210bfac58: Adds support for attaching royalty rule and kiosk lock rule to a transfer policy.

### Patch Changes

- Updated dependencies [a503cad34]
- Updated dependencies [8281e3d25]
  - rtd-rtd.js@0.40.0

## 0.4.1

### Patch Changes

- Updated dependencies [47ea5ec7c]
  - rtd-rtd.js@0.39.0

## 0.4.0

### Minor Changes

- cc6441f46: Updated types and imports to use new modular exports from the `rtd-rtd.js` refactor
- 6d41059c7: Update to use modular imports from rtd-rtd.js

  Some methods now accept a `RtdClient` imported from `rtd-rtd.js/client` rather than a
  `JsonRpcProvider`

### Patch Changes

- Updated dependencies [ad46f9f2f]
- Updated dependencies [67e581a5a]
- Updated dependencies [34242be56]
- Updated dependencies [4e2a150a1]
- Updated dependencies [cce6ffbcc]
- Updated dependencies [0f06d593a]
- Updated dependencies [83d0fb734]
- Updated dependencies [09f4ed3fc]
- Updated dependencies [6d41059c7]
- Updated dependencies [cc6441f46]
- Updated dependencies [001148443]
  - rtd-rtd.js@0.38.0

## 0.3.3

### Patch Changes

- Updated dependencies [34cc7d610]
  - rtd-rtd.js@0.37.1

## 0.3.2

### Patch Changes

- Updated dependencies [36f2edff3]
- Updated dependencies [75d1a190d]
- Updated dependencies [93794f9f2]
- Updated dependencies [c3a4ec57c]
- Updated dependencies [a17d3678a]
- Updated dependencies [2f37537d5]
- Updated dependencies [00484bcc3]
  - rtd-rtd.js@0.37.0

## 0.3.1

### Patch Changes

- 6a2a42d779: Add `getOwnedKiosks` query to easily get owned kiosks and their ownerCaps for an
  address
- abf6ad381e: Refactor the fetchKiosk function to return all content instead of paginating, to
  prevent missing data
- d72fdb5a5c: Fix on createTransferPolicy method. Updated type arguments for public_share_object
  command.
- Updated dependencies [3ea9adb71a]
- Updated dependencies [1cfb1c9da3]
- Updated dependencies [1cfb1c9da3]
- Updated dependencies [fb3bb9118a]
  - rtd-rtd.js@0.36.0

## 0.3.0

### Minor Changes

- 968304368d: Support kiosk_lock_rule and environment support for rules package. Breaks
  `purchaseAndResolvePolicies` as it changes signature and return format.

### Patch Changes

- Updated dependencies [09d77325a9]
  - rtd-rtd.js@0.35.1

## 0.2.0

### Minor Changes

- c322a230da: Fix fetchKiosk consistency/naming, include locked state in items

## 0.1.0

### Minor Changes

- 4ea96d909a: Kiosk SDK for managing, querying and interacting with Kiosk and TransferPolicy objects

### Patch Changes

- 528cfec314: fixes publishing flow
- Updated dependencies [4ea96d909a]
- Updated dependencies [bcbb178c44]
- Updated dependencies [470c27af50]
- Updated dependencies [03828224c9]
- Updated dependencies [671faefe3c]
- Updated dependencies [9ce7e051b4]
- Updated dependencies [9ce7e051b4]
- Updated dependencies [bb50698551]
  - rtd-rtd.js@0.35.0
