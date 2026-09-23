# AGENTS.md

This file provides guidance to AI agents working with code in this repository.

## Overview

This monorepo retains the same top-level package directories as the previous RTD TypeScript SDK fork. It uses pnpm workspaces and Turbo. The current upstream dApp Kit has separate core and React packages inside the retained `packages/dapp-kit` directory.

## Common Commands

### Setup and Build

```bash
# Initial setup
pnpm install
pnpm turbo build

# Build all packages
pnpm build

# Build a specific package with dependencies
pnpm turbo build --filter=rtd-typescript
```

### Testing

```bash
# Run unit tests
pnpm test

# Run unit tests for a specific package
pnpm --filter rtd-typescript test

# Run a single test file
pnpm --filter rtd-typescript vitest run path/to/test.spec.ts

# Run e2e tests (requires Docker for local network)
# All e2e tests for a package:
pnpm --filter rtd-typescript vitest run --config test/e2e/vitest.config.mts

# A specific e2e test file:
pnpm --filter rtd-typescript vitest run --config test/e2e/vitest.config.mts test/e2e/clients/core/objects.test.ts
```

### Linting and Formatting

```bash
# Check lint and formatting
pnpm lint

# Auto-fix lint and formatting issues
pnpm lint:fix

# Run oxlint and prettier separately
pnpm oxlint:check
pnpm prettier:check
```

### Package Management

```bash
# Add a changeset for version updates
pnpm changeset

# Version packages
pnpm changeset-version
```

## Architecture

### Repository Structure

- **packages/** - SDK packages organized by functionality
  - **typescript/** - Core RTD SDK with BCS, clients, cryptography, and transactions
  - **bcs/** and **utils/** - Shared serialization and utilities
  - **dapp-kit/** - Current core and React dApp packages
  - **wallet-standard/**, **window-wallet-core/**, and **slush-wallet/** - Retained wallet integrations
  - **kiosk/** - Kiosk contract bindings and client
  - **build-scripts/** - Private build helpers carried over from the previous fork

### Build System

- Uses Turbo for monorepo task orchestration with dependency-aware builds
- Each package can have its own test configuration (typically using Vitest)
- Common build outputs: `dist/` for compiled code, with both ESM and CJS formats

### Key Patterns

1. **Modular exports**: Packages use subpath exports (e.g., `rtd-typescript/client`, `rtd-typescript/bcs`)
2. **Shared utilities**: Common functionality in `packages/utils`
3. **Code generation**: Some packages use GraphQL codegen and version generation scripts
4. **Testing**: Unit tests alongside source files, e2e tests in separate directories
5. **Type safety**: Extensive TypeScript usage with strict type checking

### Rtd Client Architecture (`packages/typescript`)

The `rtd-typescript` package has a multi-transport client architecture. Understanding its layered design is critical before making changes.

#### Layered Client Design

The client system has three layers:

1. **Public client** (`RtdGrpcClient`, `RtdGraphQLClient`, `RtdJsonRpcClient`) — what users instantiate. Provides transport-specific "Native API" access (e.g., raw gRPC service clients, raw GraphQL queries) plus the unified `client.core` property. Supports extension via `$extend`.

2. **Core implementation** (`GrpcCoreClient`, `GraphQLCoreClient`, `JSONRpcCoreClient`) — each extends the abstract `CoreClient` and maps protocol-specific wire data (protobuf, GraphQL fragments, JSON) into unified `RtdClientTypes`. This is where most business logic lives.

3. **Abstract contract** (`CoreClient` in `src/client/core.ts`) — defines the "Core API" that all transports implement. Also provides transport-agnostic composed methods (e.g., `getObject` delegates to `getObjects`, `getDynamicField` uses `getObjects` + BCS parsing).

Key files:

| Layer             | gRPC                  | GraphQL                 | JSON-RPC                |
| ----------------- | --------------------- | ----------------------- | ----------------------- |
| Public client     | `src/grpc/client.ts`  | `src/graphql/client.ts` | `src/jsonRpc/client.ts` |
| Core impl         | `src/grpc/core.ts`    | `src/graphql/core.ts`   | `src/jsonRpc/core.ts`   |
| Abstract contract | `src/client/core.ts`  | ←                       | ←                       |
| Shared types      | `src/client/types.ts` | ←                       | ←                       |

#### Cross-Client Consistency

All three transports must produce identical results for the same Core API call. This is the most important architectural invariant. When making changes:

- **Always read all three implementations** of the affected method before changing any of them.
- A bug in one transport very often exists (in a different form) in the others.
- Each transport has different protocol-level concerns (gRPC read masks, GraphQL query fields, JSON-RPC response shapes) but they must all produce the same unified output.

#### Unified Type System (`src/client/types.ts`)

All Core API methods return types from the `RtdClientTypes` namespace. Key design patterns:

- **Discriminated unions with `$kind`**: All polymorphic types use a `$kind` string literal to discriminate variants. This is used for `ObjectOwner`, `TransactionResult`, `ExecutionError`, `DatatypeResponse`, and others.
  ```typescript
  // This pattern — not optional fields — is how variants are expressed:
  export type ObjectOwner =
  	| { $kind: 'AddressOwner'; AddressOwner: string }
  	| { $kind: 'ObjectOwner'; ObjectOwner: string }
  	| { $kind: 'Shared'; Shared: { initialSharedVersion: string } }
  	| { $kind: 'Immutable'; Immutable: true };
  ```
- **`Include` generics**: Methods like `getObjects` use an `Include` type parameter to make optional data (content, BCS, owner, etc.) available only when requested. This maps to transport-specific field selection (gRPC read masks, GraphQL fragments, JSON-RPC options).
- **Named types for array items**: When a response contains an array of structured items, extract a named type (e.g., `Coin`, `DynamicFieldEntry`) rather than using inline anonymous objects.

#### Transport-Specific Mapping Details

Each implementation has its own way of retrieving and transforming data:

- **gRPC**: Uses `readMask.paths` arrays to request specific fields from the server. Proto-generated types live in `src/grpc/proto/`. Missing paths in the read mask mean the server won't return those fields.
- **GraphQL**: Queries are defined in `.graphql` files in `src/graphql/queries/`, then codegen produces typed document nodes in `src/graphql/generated/queries.ts`. If you need new fields, edit the `.graphql` file and run `pnpm --filter rtd-typescript codegen:graphql`.
- **JSON-RPC**: Legacy transport with the most complex mapping logic. Response shapes often differ significantly from the unified types, requiring manual BCS serialization, ID derivation, or type wrapping.

#### E2E Testing for Parity

The e2e tests in `test/e2e/clients/core/` enforce the cross-client consistency invariant:

- **`testWithAllClients(name, fn)`**: Runs a single test case against all three transports automatically.
- **`expectAllClientsReturnSameData(queryFn, normalizeFn?)`**: Executes the same query on all three clients and asserts deep equality (with optional normalization for transport-specific differences like cursor encoding).

When changing Core API behavior, use both of these to verify parity. Move test contracts live in `test/e2e/data/shared/test_data/sources/`.

### Changeset Conventions

- **`patch`**: Bug fixes that don't change the public API shape
- **`minor`**: New fields, methods, or types added to the public API (even if optional/additive)
- **`major`**: Breaking changes to existing public API

**Never manually edit the `version` field in any package's `package.json`.** Package versions are
managed exclusively by changesets (`pnpm changeset` to add one, `pnpm changeset-version` to apply
them at release time). Hand-bumping a version conflicts with the changesets workflow and breaks
release automation. To get a package's version bumped, add a changeset describing the change — do not
touch `version` directly. Likewise, prefer the root `pnpm.overrides` for forcing a transitive
dependency version (for example, a security fix) rather than editing a published package's
`dependencies`/`devDependencies`, which would change its manifest without a changeset.

### Development Workflow

1. Changes require changesets for version management
2. Turbo ensures dependencies are built before dependents
3. OXLint and Prettier are enforced across the codebase
4. Tests must pass before changes can be merged

## External Resources and Generation

- The core gRPC source in `packages/typescript` has checked-in generated files. Its `codegen:grpc-protoc` script expects `../../../rtd-apis/proto` and `../../../rtd/crates/rtd-fork/proto` relative to that package. The local `rtd-apis` source and the future RTD main-chain proto source are not present yet. The existing public `LinkUVerse/rtd-apis` repository still has `proto/sui` and must be updated before regeneration.
- GraphQL code generation uses the checked-in schema and queries under `packages/typescript/src/graphql`; refreshing the schema requires an RTD GraphQL service that matches the future chain.
- `rtd-kiosk` retains generated contract bindings. Its former dependency on the removed `rtd-codegen` package and the broken `codegen` command were removed. Regenerate these bindings only after a matching RTD generator and on-chain Kiosk deployment are available.
- Public node, faucet, MVR, and Kiosk testnet addresses are not proof of connectivity to the future RTD main chain. Build and unit tests do not establish network acceptance.

## Fork Scope

The reproducible current-upstream migration is documented in `fork-ts-instruct/v2/REFRESH_2026.md`. Run `refresh-current-upstream.py` first, then `trim-to-existing-fork.py` to match the previous fork's nine top-level package directories. The baseline `rtd-ts-sdk` checkout is read only. Keep the current core SDK and the modern split dApp Kit source when trimming; do not replace them with the older implementation.
