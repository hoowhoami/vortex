# Vortex - 高速下载管理器

基于 Rust 的高速下载管理器，支持 HTTP 分片下载和 BT 下载。

## 技术栈

- **后端**: Rust + Tokio
- **GUI**: Tauri + React + TypeScript
- **数据库**: SQLite (sqlx)

## 项目结构

```
vortex/
├── crates/              # Rust 核心库
│   ├── vortex-core/     # 核心数据结构
│   ├── vortex-http/     # HTTP 分片下载引擎
│   ├── vortex-torrent/  # BT 下载引擎
│   ├── vortex-db/       # 数据库层
│   └── vortex-api/      # API 服务器
├── gui/                 # Tauri GUI 应用
│   ├── src/             # React 前端
│   └── src-tauri/       # Rust 后端
└── extension/           # 浏览器扩展 (待开发)
```

## 核心功能

### 已实现
- ✅ Rust workspace 架构
- ✅ HTTP 分片下载引擎骨架
- ✅ SQLite 数据库层
- ✅ Tauri + React 基础框架
- ✅ 下载任务 CRUD 操作

### 待实现
- ⏳ 完整的分片下载逻辑
- ⏳ 断点续传
- ⏳ 下载进度实时更新
- ⏳ BT 下载功能
- ⏳ 速度限制
- ⏳ 浏览器扩展集成

## 开发指南

### 前置要求
- Rust 1.70+
- Node.js 18+
- Tauri CLI: `cargo install tauri-cli`

### 开发步骤

1. 安装前端依赖:
```bash
cd gui
npm install
```

2. 启动开发环境:
```bash
npm run tauri dev
```

3. 构建生产版本:
```bash
npm run tauri build
```

## 使用说明

1. 在 GUI 中输入下载 URL 和保存路径
2. 点击 "Add Download" 创建下载任务
3. 查看下载列表和管理任务

## 许可证

MIT License
