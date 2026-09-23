# LinkU Typescript SDKs

A collection of TypeScript SDKs for interacting with the Rtd blockchain ecosystem.

The top-level `packages` directories match the previous RTD SDK fork: `bcs`,
`build-scripts`, `dapp-kit`, `kiosk`, `slush-wallet`, `typescript`, `utils`,
`wallet-standard`, and `window-wallet-core`. The current upstream core SDK is in
`packages/typescript`; the current dApp Kit core and React packages remain under
`packages/dapp-kit`.

## Documentation

For SDK documentation visit https://sdk.linkuverse.com/rtd

## Development

Any of the following commands can be run at the root of the project or from an individual package directory.

When running commands for individual you can use `turbo` to ensure all of a tasks dependencies are run first (eg. `pnpm turbo build`)

### Setup

```bash
pnpm install
pnpm turbo build
```

Dependency install scripts are disabled by default in `pnpm-workspace.yaml`. If a new dependency needs an install/build script, explicitly review it before approving it with `pnpm approve-builds`. Transitive dependencies are also blocked from resolving untrusted git or tarball URLs.

### Building

```bash
pnpm build
# or
pnpm turbo build
```

### Unit tests

For unit tests

```bash
pnpm test
# or
pnpm turbo test
```

### e2e tests

The e2e tests require docker to be installed and uses [testcontainers](https://node.testcontainers.org/) to create an e2e test environment

```bash
pnpm test:e2e
```

Using turbo to run e2e tests in parallel is not recommended

### Linting

This repo uses `oxlint` and `prettier` for linting

```bash
pnpm lint
```

You can automatically fix many lint issues by running

```bash
pnpm lint:fix
```

To run oxlint and prettier individually you can use the following commands:

```bash
pnpm prettier:check
pnpm prettier:fix
pnpm oxlint:check
pnpm oxlint:fix
```
