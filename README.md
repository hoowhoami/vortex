# Vortex

<div align="center">
  <img src="https://img.shields.io/badge/Flutter-3.32.8-blue?logo=flutter" alt="Flutter">
  <img src="https://img.shields.io/badge/Dart-3.8.1-blue?logo=dart" alt="Dart">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
  <img src="https://img.shields.io/badge/Platform-iOS%20%7C%20Android-lightgrey" alt="Platform">
</div>

<br>

<p align="center">
  <b>现代化跨平台小说阅读应用</b><br>
  继承 Legado 强大功能，提供更优雅的阅读体验
</p>

---

## ✨ 特性

- 📱 **跨平台支持** - 支持 iOS 和 Android 双平台
- 🎨 **现代化 UI** - 采用 Material Design 3，简约现代风格
- 👁️ **护眼优先** - 多种护眼配色方案，降低视觉疲劳
- 📚 **自定义书源** - 兼容 Legado 书源格式，支持规则引擎
- ⚡ **高性能** - Flutter 原生渲染，流畅阅读体验
- 🔧 **高度自定义** - 字体、主题、翻页模式等全方位定制
- ☁️ **云端同步** - WebDAV 跨设备同步
- 📖 **多格式支持** - 支持 EPUB, TXT, PDF 等多种格式
- 🌙 **深色模式** - 完美支持浅色/深色主题切换

## 📸 界面预览

> 开发中，敬请期待...

## 🏗️ 技术架构

### 核心技术栈

- **框架**: Flutter 3.32.8
- **语言**: Dart 3.8.1
- **架构**: Clean Architecture + MVVM
- **状态管理**: Riverpod 2.x
- **数据库**: Isar 3.x (NoSQL)
- **网络**: Dio 5.x
- **UI 设计**: Material Design 3 + 自定义主题

### 项目结构

```
lib/
├── core/                    # 核心层
│   ├── config/             # 配置
│   ├── constants/          # 常量
│   ├── error/              # 错误处理
│   ├── network/            # 网络层
│   ├── storage/            # 存储
│   └── utils/              # 工具类
│
├── data/                    # 数据层
│   ├── models/             # 数据模型
│   ├── repositories/       # 仓储实现
│   └── datasources/        # 数据源
│
├── domain/                  # 领域层
│   ├── entities/           # 实体
│   ├── repositories/       # 仓储接口
│   └── usecases/           # 用例
│
├── presentation/            # 展示层
│   ├── pages/              # 页面
│   ├── widgets/            # 组件
│   ├── controllers/        # 控制器
│   └── theme/              # 主题
│
└── services/                # 服务层
    ├── book_source/        # 书源服务
    ├── content_parser/     # 内容解析
    ├── reader/             # 阅读器引擎
    └── sync/               # 同步服务
```

## 🚀 快速开始

### 环境要求

- Flutter SDK >= 3.32.8
- Dart SDK >= 3.8.1
- iOS 12.0+ / Android 5.0+
- Xcode 14+ (iOS 开发)
- Android Studio / VS Code

### 安装依赖

```bash
flutter pub get
```

### 运行项目

```bash
# iOS
flutter run -d ios

# Android
flutter run -d android

# 指定设备
flutter run -d <device_id>
```

### 构建发布版本

```bash
# iOS
flutter build ios --release

# Android
flutter build apk --release
flutter build appbundle --release
```

## 📚 文档

详细文档请查看 [docs](./docs/) 目录:

- [Legado 项目分析](./docs/01-legado-analysis.md) - Legado 深度技术分析
- [Vortex 设计规范](./docs/02-vortex-design-specification.md) - 完整设计文档

## 🎨 UI 设计

### 设计理念

**简约现代风（改进版）**

- 大量留白，内容呼吸感
- 柔和圆角 (10-12px)
- 极简配色（护眼）
- 微动效（不夸张）
- 卡片式布局

### 配色方案

```dart
// 主色系
primary:     #5B7C99  // 柔和蓝灰
secondary:   #B8A48E  // 暖黄色
tertiary:    #91AC8F  // 护眼绿

// 阅读背景
纸张色:      #FBF8F2
羊皮纸:      #F4EDD8
护眼绿:      #E3EDCD
夜间模式:    #1A202C
```

## 🗺️ 开发路线

### ✅ Phase 1: 基础设施 (已完成)

- [x] 项目初始化
- [x] 依赖配置
- [x] 架构搭建
- [x] 主题系统
- [x] 文档编写

### 🚧 Phase 2: 核心功能 (进行中)

- [ ] 数据库设计
- [ ] 网络层封装
- [ ] 书源模型
- [ ] 规则引擎

### 📋 Phase 3: 书架与阅读 (计划中)

- [ ] 书架界面
- [ ] 阅读器核心
- [ ] 翻页引擎
- [ ] 阅读设置

### 📋 Phase 4: 高级功能 (计划中)

- [ ] 本地导入
- [ ] WebDAV 同步
- [ ] 书源管理
- [ ] 搜索功能

## 🤝 贡献

欢迎贡献代码！请遵循以下步骤:

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### Commit 规范

```
<type>(<scope>): <subject>

type: feat, fix, docs, style, refactor, test, chore
scope: bookshelf, reader, source, etc.
```

## 📄 开源协议

本项目采用 [MIT License](./LICENSE) 开源协议。

## 🙏 致谢

- [Legado](https://github.com/gedoor/legado) - 灵感来源
- [Flutter](https://flutter.dev) - 跨平台框架
- [Material Design 3](https://m3.material.io) - UI 设计系统

## 📧 联系方式

如有问题或建议，欢迎通过 Issue 反馈。

---

**注意**: 本项目目前处于早期开发阶段，功能尚不完善。欢迎关注项目进展！
