# Vortex - 跨平台 Redis 客户端

基于 Tauri 2 + React + shadcn/ui 构建的高性能跨平台 Redis 客户端。

## 特性

- 🚀 高性能 - 使用 Rust 和原生能力
- 🎨 现代化 UI - shadcn/ui + Tailwind CSS
- 📦 连接管理 - 支持保存、分组、标签
- 🔌 多数据类型支持 - String, Hash, List, Set, ZSet
- 💻 跨平台 - Windows, macOS, Linux

## 技术栈

- **前端**: React 18 + TypeScript + Vite
- **UI**: shadcn/ui + Tailwind CSS
- **后端**: Tauri 2 + Rust
- **数据库**: SQLite (存储连接配置)
- **Redis 客户端**: redis-rs

## 开发环境

### 前置要求

- Node.js 18+
- Rust 1.70+
- Tauri CLI (会自动安装)

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run tauri:dev
```

### 构建生产版本

```bash
npm run tauri:build
```

## 项目结构

```
vortex/
├── src/                      # React 前端
│   ├── components/           # UI 组件
│   │   └── ui/              # shadcn/ui 组件
│   ├── stores/              # Zustand 状态管理
│   ├── types/               # TypeScript 类型
│   └── lib/                 # 工具函数
├── src-tauri/               # Tauri 后端
│   ├── src/
│   │   ├── commands/        # Tauri 命令
│   │   ├── db/              # 数据库操作
│   │   └── redis_client/    # Redis 客户端
│   └── Cargo.toml
└── package.json
```

## 开发进度

### ✅ 已完成
- 项目初始化
- Tauri + React + TypeScript 配置
- shadcn/ui 和 Tailwind CSS 配置
- 基础项目结构
- 数据库 schema 设计
- Rust 后端模块骨架

### 🚧 进行中
- 连接管理 UI
- Redis 操作界面

### 📋 待实现
- 完整的连接 CRUD 功能
- Redis 数据操作功能
- 命令行控制台
- 主题切换
- 导入/导出配置

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
