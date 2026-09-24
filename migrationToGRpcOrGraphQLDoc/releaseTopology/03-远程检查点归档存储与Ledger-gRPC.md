# 03 · 开源原始归档、HBase 历史存储与 Ledger gRPC

> **高优先级架构约束（2026-09-24）**：RTD 测试网和未来正式网的全部必需中间件必须自建开源，涵盖存储、数据库高可用与备份、密钥/证书、网络入口、指标日志告警及镜像仓库；不得依赖 Google Cloud Bigtable、GCS、AWS S3、Azure Blob 或任何必须使用闭源云服务的中间件。Sui 上游的云服务只是源码现状，不是 RTD 部署选型。正式环境采用自建开源 **Apache HBase + HDFS + ZooKeeper** 存历史记录、**MinIO** 存原始 checkpoint、**PostgreSQL** 存 Alt 索引。当前 `temp/rtd` 的 Bigtable 客户端已显式接入自建 HBase 适配网关；不得把 HBase 主机填入旧 Bigtable 参数就宣称完成生产替换。完整要求见[开源中间件政策](../../../rtd-archive-service/OPEN_SOURCE_POLICY.md)。

Sui 官方[原始 checkpoint 手册](https://docs.sui.io/operators/data-management/remote-store-setup)和[归档栈手册](https://docs.sui.io/operators/data-management/archival-stack-setup)规定了 `.binpb.zst` 数据格式与 `LedgerService` 行为；RTD 保留**格式和公开协议**，替换存储。Apache [HBase 官网](https://hbase.apache.org/downloads/)说明其是 Bigtable 模型的开源分布式列存储；[HBase Java API](https://hbase.apache.org/apidocs/org/apache/hadoop/hbase/client/CheckAndMutate.html)支持条件行变更；[MinIO 社区源码](https://github.com/minio/minio)提供 S3 兼容对象服务及版本化。这些只是实现依据，**并不表示 HBase/Bigtable 的 wire 协议或 MinIO/云对象存储的故障语义天然兼容**。

## 1. 标准 Rust 组件保留的职责

| 组件                               | 保留的官方能力                                            | 开源适配                                                         |
| ---------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------- |
| `rtd-checkpoint-blob-indexer`      | 从同链 Full Node gRPC 写 `{seq}.binpb.zst`、`epochs.json` | 通过现有 `--s3` 协议接自建 MinIO；dev 可用开源 S3 服务做合同测试 |
| `rtd-indexer-alt`                  | PG 过滤管线和逐管线 watermark                             | 通过 `--remote-store-s3` 从 MinIO 回填，PG 自建                  |
| `rtd-indexer-alt-consistent-store` | RocksDB 当前状态管线和 gRPC                               | 每副本独立开源 RocksDB 与同链源                                  |
| `rtd-kvstore-alt`                  | 14 条官方处理管线、row key/column 编码和 watermark        | 增加自建 HBase 兼容网关，替换 Google Bigtable 连接               |
| `rtd-kv-rpc`                       | 原有 `LedgerService`、`MovePackageService`、可选 `List*`  | 同样通过 HBase 网关读取并核验水位                                |
| `rtd-indexer-alt-graphql`          | 聚合 PG、Ledger、Consistent Store、Full Node              | `--ledger-grpc-url` 接本链 `rtd-kv-rpc`                          |

六个标准组件仍由同一 `temp/rtd` 版本构建；只替换云专属适配层。不接入旧 `rtd-indexer` 的 `.chk/.pb`、JSON-RPC 网关或旧表。Full Node 的执行和实时状态不能由归档服务代替。

## 2. 原始 checkpoint：生产 MinIO

Blob writer 的 [`--s3` 后端](../../../temp/rtd/crates/rtd-checkpoint-blob-indexer/src/main.rs)和 Alt 框架的 [`--remote-store-s3`](../../../temp/rtd/crates/rtd-indexer-alt-framework/src/ingestion/ingestion_client.rs)使用 S3 **开放 API 协议**，不要求 Amazon S3 云服务。生产 `AWS_ENDPOINT` 必须指向 RTD 私有 MinIO，且必须显式提供 S3 协议凭据和 region，不能从云元数据服务取凭据；HTTP 明文只允许显式标记的 dev 环境。实际数据面源码已删除 GCS/Azure 后端选项和 EC2 IMDSv1 fallback；生产还须实施禁止出站云端点的网络策略。

桶从 checkpoint 0 保存事实文件和标准元数据。须实测写后读、同序号重复写与冲突、`epochs.json` 条件更新、对象版本视图、跨故障域副本和隔离恢复。当前 [blob 普通 put](../../../temp/rtd/crates/rtd-checkpoint-blob-indexer/src/handlers/checkpoint_blob.rs#L112-L136)不阻止不同内容覆盖；必须增加只增不改保护或经验证的写入代理，并把已验证 VersionId/digest 固定在独立清单。不能仅凭“兼容 S3”推断条件写和对象锁行为已满足本链要求；必须在锁定的 RTD MinIO fork 实测。[MinIO 版本化说明](https://github.com/minio/minio/blob/master/docs/bucket/versioning/README.md)。

**独立水位文件不是摄取闸门。** 事件隔离链的 dev 实测中，已验证水位文件仍为 1755，官方 PG Alt 已把同桶现存的 checkpoint 1756–1873 摄入 22 条管线。[标准对象 reader](../../../temp/rtd/crates/rtd-indexer-alt-framework/src/ingestion/store_client.rs)能按序号直接获取文件；它读取水位作为初始进度信息，不能把额外文件的访问隔绝。正式环境必须在自建 MinIO 中把 writer 的**暂存桶**与只供索引器读取的**已验证发布桶**分开；独立验证/发布器确认链身份、连续证书、摘要、VersionId 与持久副本后才按序号将不可变文件发布，consumer 身份不得读暂存桶。开发 MinIO 已用两个桶和独立只读身份验证 0–100 发布前缀与暂存 101 不可见，官方 PG Alt 在独立临时库从只读发布桶只摄取到 100。生产 MinIO 的验证器、持久账本、其他消费者实际切桶、故障补追与已发布版本不可覆写仍是待实施上线门槛。

生产由 RTD 维护的开源 MinIO 分布式实例、独立存储故障域及经验证的跨站点复制承担 HA；同一集群纠删码和异地复制须分别验证，不能把任一项当成另一项。[MinIO 分布式部署](https://github.com/minio/minio/blob/master/docs/distributed/README.md)、[桶复制](https://github.com/minio/minio/blob/master/docs/bucket/replication/README.md)。[MinIO Community 仓库已归档且不再维护](https://github.com/minio/minio)，因此生产要先锁定 RTD 维护的 AGPLv3 源码 fork、自行构建镜像、安排补丁与许可证核查；当前 dev 使用的历史镜像不能直接升格为生产镜像，非开源 AIStor 也不符合选型。完整放行条件见[开源中间件政策](../../../rtd-archive-service/OPEN_SOURCE_POLICY.md#minio-生产基线与维护责任)。

## 3. HBase 适配网关：必须开发与验证

最初上游的 [`BigTableClient::new_remote`](../../../temp/rtd/crates/rtd-kvstore/src/bigtable/client/mod.rs)固定 `bigtable.googleapis.com`、Google CA 和 OAuth。当前 RTD 已将它改成必须显式配置 `RTD_HBASE_GATEWAY_ENDPOINT` 的自建网关连接，移除该客户端的 `gcp_auth` 依赖；生产 `https://` 连接须提供 CA、客户端证书和私钥，`http://` 仅在显式开发开关下可用。Google 的 Bigtable emulator 数据仅在内存中，不能用于生产；设置 `BIGTABLE_EMULATOR_HOST` 也不会让这两个二进制自动连 HBase。[Google emulator 限制](https://docs.cloud.google.com/bigtable/docs/emulator)。

`rtd-archive-service/modules/hbase-compat-gateway` 已在私网实现当前 Rust 客户端实际用到的 Bigtable v2 数据面子集：`ReadRows`、`MutateRows`、`CheckAndMutateRow`、`PingAndWarm`。未知表、操作与过滤器明确报错，不返回空成功。Rust 客户端显式选择私网网关 URL，并在生产 mTLS 连接时校验服务器证书及出示客户端身份，不会隐式回退到 Google 地址。内部 wire 合同沿用 Bigtable proto 仅为复用官方 Rust 索引/查询逻辑；**服务端、持久数据和控制权完全在 RTD 自建开源栈内**。

| 原数据面语义                 | HBase 映射与必测条件                                                                                                                   |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 14 张表、`rtd` column family | 相同逻辑表；row key/qualifier 原始字节不变；每 cell 最多一个版本，链上对象版本由 row key 区分                                          |
| `MutateRows` 逐 entry 状态   | 每个 entry 对应行原子写；按原 index 回成功/失败；测部分成功后的幂等重试                                                                |
| `CheckAndMutateRow`          | HBase 行内 CAS；精确实现当前 RTD 调用的列不存在、列值阈值和 false mutation 分支，防止链 ID/水位误绑定；未使用的 true mutation 显式拒绝 |
| `ReadRows`                   | 精确键、正/逆范围、行数限制、列族/qualifier 过滤、每列最新版本，正确输出流式 row commit；ReadRows 未用的 value filter 显式拒绝         |
| `PingAndWarm`                | 实际 HBase 读就绪和目标表可访问才成功                                                                                                  |

本地还用 `ColumnQualifierRegexFilter`、`FamilyNameRegexFilter`、`CellsPerColumnLimitFilter`、`ValueRangeFilter` 等组合过滤，[见源码](../../../temp/rtd/crates/rtd-kvstore/src/bigtable/client/mod.rs)。开发容器已通过真实 HBase 的正反向范围、开闭边界、列筛选、大值分块、逐项写入状态、部分失败、并发 watermark CAS、拒绝未知请求，以及 Rust 客户端的明文开发连接与 mTLS 正负例。独立 RTD 链的 checkpoint 0–100 已使 14 条管线持久化水位到 100，HBase 清空后又从原始桶回填到 100；Ledger 点查和 `ListCheckpoints` 已核验。原始 checkpoint 的系统交易用户签名为空，Full Node 交易存储有全零占位签名，归档 Ledger 已按同版 Full Node 源码在响应层重建该占位值；`GetCheckpoint(0)` 与 `GetTransaction` 两路径在开发链核验一致，原始 HBase 行不变。全部 `List*` 筛选/分页、大批量读取、生产负载与故障语义仍未关闭；不能据此宣称生产开源归档已可运行。

HBase 生产集群需要自建 HDFS、ZooKeeper、多 HMaster/RegionServer 及可恢复快照。[HBase 架构说明](https://hbase.apache.org/docs/architecture/)说明 RegionServer 故障有实际恢复时延。不同地域运行独立集群并从 RTD 全保留桶各自索引；切换前验证 chain ID、14 水位、历史样本及负结果语义。

## 4. 管线、水位与公开接口

保留源码中 [14 个 `ALL_PIPELINE_NAMES`](../../../temp/rtd/crates/rtd-kvstore/src/lib.rs#L91-L136)、原表编码与 `watermark_alt`。要启用 `ListTransactions`、`ListEvents`、`ListCheckpoints`，其三条附加管线必须从 0 完整回填。网关不能在 HBase 断连时模拟写入成功，更不能推进未持久化水位。`rtd-kv-rpc GetServiceInfo` 目前只汇总点查所需八条管线，启用 List 后加三条，且最低下界写死为 0；仍需独立连续性审计。[代码](../../../temp/rtd/crates/rtd-kv-rpc/src/v2/mod.rs#L192-L216)。

公开协议仍是 `LedgerService` gRPC 和 GraphQL；钱包与 SDK 不直接接 HBase 或内部兼容网关。存储故障对外明确报告“暂不可用/尚未覆盖”，不得把旧史 `NOT_FOUND` 当作链上不存在。容量按 RTD 自有流量压测，不照搬上游云服务的 TB 数字。

## 5. 实施顺序与门槛

1. 锁定 `temp/rtd`，列出完整 wire RPC、过滤器和测试向量；建 HBase 网关及私网身份。
2. dev Compose 使用单机 MinIO、PostgreSQL、单节点 HBase Master/RegionServer + 独立 ZooKeeper（共享本地开发卷）和 RTD Full Node，**不把 Google emulator 作为目标环境**。建 14 表/列族；先验 CAS、范围/逆序、部分失败，再接两个 Rust 二进制。生产使用 RTD 维护的分布式 MinIO，并为 HBase 配置 HDFS 与多节点集群。
3. 用 RTD 创世源从 0 跑 blob、Alt、Consistent Store、KVStore Alt、Ledger/GraphQL，逐管线验水位与查询合同。
4. 测试网/正式网使用 MinIO、PostgreSQL HA、HBase/HDFS/ZooKeeper 多故障域集群；演练恢复、区域切换与原始桶重建，确认没有 Google/AWS/Azure 运行凭据或闭源云 DNS 依赖。

**当前状态：HBase 网关、Rust 显式连接、独立链 0–100 同链回填、Ledger/GraphQL 开发查询与系统交易签名响应规则已验证；自建 MinIO 和生产 HDFS/PG HA 未完成。** 完成证据以 [任务清单](./08-实施任务与验收清单.md)和 [workLog](../workLog) 为准。
