# 2026-09 上游 TypeScript SDK 迁移补充

基线：`MystenLabs/ts-sdks` 的 `56d51645cd231010e39d96dd23583056c5266426`。在此仓库的 `feature/rtd-sdk-refresh` 分支操作。旧 `run-all.sh`、`v2/run-migration.sh` 和 `v2/apps/*` 为历史流程，不在新上游运行：其 `config.sh` 使用了不存在的绝对路径，并只覆盖当时的 9 个包。

## 2026-09-23 最终保留范围

先用 `refresh-current-upstream.py` 对当前上游完整进行品牌迁移，再用 `trim-to-existing-fork.py` 以旧仓库 `rtd-ts-sdk/packages` 为只读基准精简。最终顶层目录严格保留 `bcs`、`build-scripts`、`dapp-kit`、`kiosk`、`slush-wallet`、`typescript`、`utils`、`wallet-standard`、`window-wallet-core` 九个。新版 `packages/rtd` 改名为 `packages/typescript`，内容仍以当前上游迁移后的实现为准；新版 dApp Kit 的 core/react 子包继续保留在 `packages/dapp-kit` 内。旧仓库只提供目录范围和 `build-scripts` 源文件，不覆盖新版 SDK 实现。

已移除多余包、对应发布工作流、文档构建入口和 Kiosk 对已删除 `rtd-codegen` 的依赖。Kiosk 已提交的绑定仍可编译；重新生成须等 RTD 对应代码生成工具及链上部署就绪。`rtd-apis` 已升级为 `proto/rtd`，其 v2 协议文件与 Rust SDK vendored 的 33 个 `.proto` 逐字节一致；主链扩展协议仍应在主链 fork 完成后重生成并校验。

主链 2026-09-23 的 OpenRPC 有 56 个方法。精简后的 TypeScript JSON-RPC 客户端原有 46 个静态方法，其中 `rpc.discover` 由服务端单独注册，另有 7 个 `rtdx_*` 方法没有主链路由：`getNetworkMetrics`、`getAddressMetrics`、`getEpochMetrics`、`getAllEpochAddressMetrics`、`getEpochs`、`getMoveCallMetrics`、`getCurrentEpoch`。其中后两个只在主链未注册的 `ExtendedApi` trait 中声明。运行 `prune-unregistered-jsonrpc.py` 删除这些客户端入口及其 10 个无其他引用的响应类型。脚本仅适用于本次上游基线；迁移到更新版本前须重新对照主链 OpenRPC 与服务注册表。删除的是既有 TypeScript 公共 API，调用方若依赖这些方法需转用实际已提供的链服务。

## 初始完整品牌迁移阶段的补漏范围

- 初始品牌迁移时覆盖当前 monorepo 的所有根包及嵌套 workspace；完成迁移和必要的测试修复后，再运行精简脚本删除不在旧 fork 顶层目录清单中的包。
- 遍历 UTF-8 源码、GraphQL schema、protobuf 生成的 TS 文本、JSON、配置、测试预期、Move 示例和文档，同时重命名带品牌的文件及目录。
- 测试中的正则表达式会把包名斜杠写成 `\/`，普通包名替换匹配不到；迁移时单独处理这种写法，初始迁移阶段用 `rtd-codegen` 单包测试校验；最终精简版不再包含此包。
- 延续已发布 RTD TS SDK 的包名约定：`@mysten/sui` → `rtd-typescript`，其余 `@mysten/<name>` → `rtd-<name>`；`@mysten-incubation/<name>` 同理。品牌迁移阶段目录名按品牌规则变更；精简阶段再将 `packages/rtd` 对齐为旧 fork 的 `packages/typescript`。
- 保留原 lockfile 内容直至运行 `pnpm install --lockfile-only`，由 pnpm 重新求解，不直接替换 registry 完整性记录。纯 Base64 长行、WASM 和图片不做字节级改写；WASM 和图片需单独审计或从 RTD 源码再生成。
- `suiprivkey` 测试向量的 Bech32 校验和包含前缀，必须按 `rtdprivkey` 重新计算；直接替换文本会使三个密钥算法的单元测试失败。
- `Seal` 的哈希与密钥派生使用链品牌作为域分隔符；原 Sui 回归值必须按 RTD 域重新计算。旧 Rust Seal 密文不能在 RTD 域解密，保留为明确的跨链不兼容回归用例；份额一致性用例重新构造 RTD 加密数据。PoP 签名样本也重新生成，并实际 `await` 验签结果，避免原用例只断言 Promise 非空。
- `PAS` 对象地址由 Move 类型名参与派生；`sui` → `rtd` 后四个固定地址快照重新计算。PAS 的默认测试只跑单元测试，`RTD_PAS_E2E=1` 明确启用 Docker E2E。
- 上游 E2E 配置锁定的是 Sui `sui-tools` 镜像 commit，文字替换为 `linku/rtd-tools` 会拉取 404。`rtd`、`kiosk`、`pas` 的 E2E 统一要求 `RTD_TOOLS_IMAGE` 指向真实构建的 RTD 工具镜像，并在启动容器前检查此变量。
- `Seal` 网络测试与 MVR 跨网络解析测试分别通过 `RTD_SEAL_LIVE=1`、`RTD_MVR_LIVE=1` 显式开启；当前保留的上游对象 ID、部署地址与公开服务器不能证明 RTD 链可用，必须在主链 fork 后替换并验收。
- 已知上游节点域名按旧 `config.sh` 转为 `rtd.life`。这些地址能否连接 RTD 主链，需主项目完成后进行真实网络验收。
- Reown 1.8.23 的 TypeScript CAIP 网络类型只列出内置命名空间，未列 `rtd`；`UniversalConnector` 运行时会把自定义 namespace 转给 WalletConnect。`walletconnect-wallet` 在此单一边界做类型断言；钱包互通还需真实 RTD 钱包验收。
- 当前上游 `enoki` 中 OneFC 使用 Sui 专用的 OAuth 租户路径，无法靠品牌替换得到 RTD 租户。在得到 RTD 授权端点之前，该路径必须显式拒绝使用。

## 可重现操作

```bash
python3 fork-ts-instruct/v2/refresh-current-upstream.py
python3 fork-ts-instruct/v2/trim-to-existing-fork.py
python3 fork-ts-instruct/v2/prune-unregistered-jsonrpc.py
corepack pnpm install --lockfile-only --ignore-scripts
CI=1 corepack pnpm install --frozen-lockfile --ignore-scripts
corepack pnpm exec prettier -w --ignore-unknown .
corepack pnpm exec manypkg check
CI=1 corepack pnpm exec turbo run build --force
CI=1 corepack pnpm test
CI=1 corepack pnpm lint
```

当前精简版结果：15 个 pnpm workspace（含根项目及 4 个 dApp 示例）；保留包的强制构建 14/14 通过，缓存命中 0；`manypkg check`、`pnpm test`（19/19 任务，所执行单元测试 850 项通过）、`pnpm lint` 和 `pnpm exec turbo run lint`（10/10 任务）通过；lint 有 4 条既有非阻断警告。真实 RTD 主网、公共 RPC、Kiosk 合约及 gRPC 协议再生成尚未验收。初始完整品牌迁移阶段的 43 个 workspace、52 个构建任务及 76 个测试任务属于精简前历史记录，不能作为精简后的测试结果。
