# CLAUDE.md - RTD TypeScript SDK 项目指南

## 项目背景
本项目是基于 Sui 原版 ts-sdks 的部分源码移植并进行品牌更名后的独立工程。

## 重要规则

### 1. 代码修改参考原则
**所有报错和代码修改，必须参考原始 Sui 代码进行解决：**

- 原始代码路径：`/Users/changzechuan/WenchuanProjects/SuiTestProjects/ts-sdks/packages/`
- 对应的移植代码路径：`/Users/changzechuan/WenchuanProjects/SuiTestProjects/rtd-typescript/rtd-ts-sdk/packages/`

在修复问题时：
1. 先查看原始 Sui 代码的实现
2. 确保修改不破坏原始功能
3. 如果移植的代码有残缺，从原始代码中补充移植

### 2. 品牌替换规则
从原始代码移植时，按以下规则进行品牌替换：

| 原始 | 替换为 | 说明 |
|------|--------|------|
| MystenLabs | LinkUVerse | 组织名称 |
| Mysten | LinkU | 品牌名称（首字母大写） |
| mysten | linku | 品牌名称（纯小写） |
| SUI | RTD | 代币符号（纯大写） |
| Sui | Rtd | 混合大小写 |
| sui | rtd | 纯小写 |

**包名替换规则：**
- `@mysten/sui` → `rtd-ts-sdk`
- `@mysten/bcs` → `rtd-bcs`
- `@mysten/utils` → `rtd-utils`
- `@mysten/build-scripts` → `rtd-build-scripts`

### 3. 脚本存放位置
如果需要编写脚本来解决问题，请将脚本放在 `fork-ts-instruct/v2` 目录中。

## 项目结构
```
packages/
├── bcs/          # BCS 序列化库 (rtd-bcs)
├── typescript/   # 主 SDK (rtd-ts-sdk)
├── utils/        # 工具库 (rtd-utils)
└── build-scripts/ # 构建脚本 (rtd-build-scripts)
```

## 构建命令
```bash
pnpm install    # 安装依赖
pnpm build      # 构建项目
pnpm test       # 运行测试
```
