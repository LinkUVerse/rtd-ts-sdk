# RTD 生产数据服务拓扑：标准实现、部署与数据安全

核对日期：2026-09-24。本文档是对 [原迁移报告第 5 节](../03-数据服务拓扑与历史保留.md#5-建议的-rtd-生产拓扑) 的展开，针对 **`temp/rtd` 这一版源码**设计上线拓扑；并不表示这些组件已在 RTD 网络部署或通过生产压测。官方 Sui 文档说明技术机制，所有端点、链身份、创世、桶和数据库均须由 RTD 自建并验收。不得使用 Sui 的公共服务和数据桶充当 RTD 源。

## 核心结论

Sui **已经提供**通用 Alt Indexer、GraphQL、Consistent Store、原始 checkpoint 远程存储写入器，以及原本以 Bigtable 为后端的归档写入器和 `LedgerService` gRPC 服务的标准开源业务实现。`temp/rtd` 里存在对应的 RTD fork 源码。**已决定只采用这些同源标准业务组件**，统一由 [`rtd-archive-service`](../../../rtd-archive-service/README.md) monorepo 组织构建、配置、部署与运维；旧 `rtd-indexer` 的服务和自建 KV 备选均不进入新链数据面。以自建 PostgreSQL、Apache HBase/HDFS/ZooKeeper、MinIO 和 RocksDB 承担持久化职责。**RTD 测试网和未来正式网的全部必需中间件都必须自建开源，不得依赖 Google Cloud Bigtable/GCS、AWS S3、Azure Blob 或其它闭源云服务。** Bigtable 连接层已在 dev 改为自建 HBase 网关并完成独立链 0–100 回填；生产 MinIO 必须来自 RTD 维护的 AGPLv3 源码 fork，分布式部署、补丁与许可证、HDFS HA 和完整恢复尚未验收。

涉及云密钥管理、托管数据库和监控的全栈替换也受[开源中间件政策](../../../rtd-archive-service/OPEN_SOURCE_POLICY.md)约束，不能因本分册重点讨论存储而遗漏。
该政策同样覆盖主链节点快照、状态同步和可选分析任务；目前 `temp/rtd` 的非归档模块仍有[未关闭的云分支](../../../rtd-archive-service/CLOUD_DEPENDENCY_AUDIT.md#归档六组件之外的全局残留)，必须在上线清单中单独整改或禁用并做隔离出站验证。

索引器不能替代 Full Node 的交易执行、模拟与实时链头；归档 Ledger gRPC 提供历史键值点查；启用 `List*` 且完成对应 bitmap/序号管线从 0 回填后，还能提供协议支持的历史过滤列表，但不等于任意 GraphQL 筛选。GraphQL 的筛选能力仍受 PostgreSQL 相应管线的保留范围约束。`temp/rtd` 的 GraphQL 启动实际要求 `--ledger-grpc-url`，即使仓库部分 README 仍展示了省略该参数的旧示例。见[官方操作手册](https://docs.sui.io/operators/data-management/indexer-stack-setup)和[本地运行时检查](../../../temp/rtd/crates/rtd-indexer-alt-graphql/src/lib.rs#L351-L373)。

## 文档导航

1. [01-决策总览与源码映射](./01-决策总览与源码映射.md)：官方标准实现、职责、拓扑及与前端的关系。
2. [02-通用索引GraphQL与Consistent-Store](./02-通用索引GraphQL与Consistent-Store.md)：PostgreSQL Alt、RocksDB 实时索引、GraphQL 的部署和水位。
3. [03-远程检查点归档存储与Ledger-gRPC](./03-远程检查点归档存储与Ledger-gRPC.md)：自建 MinIO、HBase 适配、14 条归档管线和 Ledger gRPC。
4. [04-高可用完整性与一致性控制](./04-高可用完整性与一致性控制.md)：数据不可丢、不可串链、不可伪装为“未找到”的具体控制与故障处理。
5. [05-旧rtd-indexer复用与自建备选](./05-旧rtd-indexer复用与自建备选.md)：明确旧实现退场、开源存储适配边界和禁止的捷径。
6. [06-上线顺序与验收演练](./06-上线顺序与验收演练.md)：分阶段建设、门槛、演练和交付证据。
7. [07-统一服务工程与环境方案](./07-统一服务工程与环境方案.md)：monorepo 分工、单机 Compose、测试网/正式网 Kubernetes HA、断点恢复与管理控制面。
8. [08-实施任务与验收清单](./08-实施任务与验收清单.md)：依赖顺序、逐项完成条件、工作记录和钱包改造的启动门槛。

## 结论的证据边界

| 说法                 | 本报告能证明什么                                                                                                                                                                                                                                                               | 仍需上线前证明什么                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| “官方有标准业务实现” | [通用索引/GraphQL 手册](https://docs.sui.io/operators/data-management/indexer-stack-setup)、[归档手册](https://docs.sui.io/operators/data-management/archival-stack-setup)、[远程存储手册](https://docs.sui.io/operators/data-management/remote-store-setup)以及本地对应源码。 | 完成 HBase 网关、MinIO 适配、同源构建和全功能集成测试。   |
| “历史完整”           | 可定义从 checkpoint 0 开始的源、持久化和各层水位验收。                                                                                                                                                                                                                         | 真实网络的连续性、证书/摘要核验、恢复演练和故障注入结果。 |
| “高可用”             | 可给出冗余部署、隔离、备份和切换设计。                                                                                                                                                                                                                                         | 多故障域实际部署、压测、RPO/RTO 记录和演练。              |
| “前端可迁移”         | [上层迁移方案](../04-前端迁移实施方案.md)给出 gRPC/GraphQL 选型。                                                                                                                                                                                                              | 钱包和 Mobile 在目标 RTD 链上的功能、历史与交易回归。     |

文中命令是需按锁定版本和环境验证的**部署模板**；占位 URL、实例名和凭证不是已存在的 RTD 公网服务。官方资料可能随上游版本变化，遇到说明与当前 `temp/rtd` 源码冲突时以目标构建的 `--help`、配置 schema 和集成测试为准。
