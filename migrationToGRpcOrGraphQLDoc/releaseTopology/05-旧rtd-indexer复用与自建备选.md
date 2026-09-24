# 05 · 旧实现退场与开源适配边界

> **当前决策**：不使用 `rtd-indexer` 的运行时、数据库、checkpoint gateway、JSON-RPC 代理或控制面源码。该目录保留在工作区仅作历史资料，不属于 `rtd-archive-service` 的依赖。未来测试网/正式网全部必需中间件均须自建开源，涵盖数据存储、数据库高可用与备份、密钥/证书、网络入口、指标日志告警和镜像仓库；Google Cloud Bigtable、GCS、AWS S3、Azure Blob 或其它闭源云服务不能成为运行依赖。详见[开源中间件政策](../../../rtd-archive-service/OPEN_SOURCE_POLICY.md)。

## 1. 保留和更换的边界

| 层                              | 决策                                                                                                     | 实施位置                                                                |
| ------------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| 通用索引、近期一致状态、GraphQL | 保留 `temp/rtd` 官方 `rtd-indexer-alt`、Consistent Store 与 GraphQL 组件                                 | `rtd-archive-service/modules`                                           |
| checkpoint 格式与写入器         | 保留官方 `rtd-checkpoint-blob-indexer` 和 `{seq}.binpb.zst`；存储换为自建 MinIO（dev 可用开源 S3 实现）  | `modules/checkpoint-blob`、`localDeploy`                                |
| 历史处理与 LedgerService        | 保留官方 `rtd-kvstore-alt` 的 14 条管线、`rtd-kv-rpc` 的公开 gRPC 服务与数据编码；替换 Bigtable 专属连接 | `modules/kvstore-alt`、`modules/kv-rpc`、`modules/hbase-compat-gateway` |
| 历史持久层                      | 自建 Apache HBase/HDFS/ZooKeeper，不接 Google Cloud                                                      | `localDeploy` 与 Kubernetes 环境配置                                    |
| Alt 数据库、当前状态            | 自建 PostgreSQL、每副本独立 RocksDB                                                                      | `modules/indexer-alt`、`modules/consistent-store`                       |
| 管理控制面                      | 新建独立 `control-api`、`web-admin`，从新版标准组件收集事实                                              | `modules/control-api`、`modules/web-admin`                              |

选择 HBase 是因其开源、按字节排序的行键、列族、行内条件变更与扫描能力接近当前 Bigtable 客户端需求。[Apache HBase](https://hbase.apache.org/downloads/)、[CheckAndMutate API](https://hbase.apache.org/apidocs/org/apache/hadoop/hbase/client/CheckAndMutate.html)。当前 `temp/rtd` **通过自建兼容网关**连接 HBase，已完成开发链 0–100 回填；这不表示生产 MinIO/HDFS HA 与恢复已通过。完整适配与验收见 [03](./03-远程检查点归档存储与Ledger-gRPC.md)。

## 2. 不允许的捷径

1. 不在生产运行 Google Bigtable emulator：它只保存在内存中，不能作为可恢复历史账本。[Google 官方限制](https://docs.cloud.google.com/bigtable/docs/emulator)。
2. 不把 HBase URL 填入 `--bigtable-project` 或 `BIGTABLE_EMULATOR_HOST`：当前 Rust `new_remote` 固定 Google 端点与认证，[源码](../../../temp/rtd/crates/rtd-kvstore/src/bigtable/client/mod.rs#L224-L291)。
3. 不把旧 `rtd-indexer` 的 `.chk/.pb`、旧表或 JSON-RPC 暂作新归档：标准远程 checkpoint 读取端查 `.binpb.zst`，且目标公开协议是 Ledger gRPC。
4. 不把 S3 协议名误解为 AWS 运行依赖：正式 S3 端点是 RTD 自建 MinIO，且条件写、版本视图、复制等能力必须实测。[MinIO 社区源码](https://github.com/minio/minio)。
5. 不把开源许可证等同于可维护生产服务。MinIO 社区仓库[已停止维护](https://github.com/minio/minio)；开发用历史镜像只验证协议，测试网/正式网须先建立 RTD 维护的 AGPLv3 源码 fork、补丁机制和自建分布式部署并完成许可证及恢复验收。[生产放行条件](../../../rtd-archive-service/OPEN_SOURCE_POLICY.md#minio-生产基线与维护责任)。

## 3. 迁移前置完成条件

- HBase 网关实现当前客户端用到的读、写、条件变更、扫描、过滤和流式响应语义，并有与开发基准的对账用例。
- 14 管线从 RTD checkpoint 0 真实回填；逐管线水位、旧交易/对象/包/checkpoint 与 `List*` 用本链样本验证。
- HBase/HDFS/ZooKeeper、MinIO、PostgreSQL、RocksDB 的备份恢复、故障接管与从原始桶重建均实测。
- 所有生产镜像和配置扫描不到 Google/AWS/Azure 云凭据、云域名或闭源托管服务的必需运行依赖。

当前这些条件**尚未完成**。按 [08 任务清单](./08-实施任务与验收清单.md)推进，记录于 [workLog](../workLog)；未通过前不能开启钱包迁移阶段。
