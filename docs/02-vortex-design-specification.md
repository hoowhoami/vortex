# Vortex 设计规范文档

> 项目名称: Vortex
> 设计版本: 1.0
> 创建日期: 2026-01-07
> 设计风格: 简约现代风（改进版）

---

## 一、项目愿景

### 1.1 产品定位

Vortex 是一款**现代化跨平台小说阅读应用**，继承 Legado 的强大功能，提供更优雅的阅读体验。

**核心价值主张:**
- 📱 跨平台支持 (iOS + Android)
- 🎨 现代简约的 UI 设计
- 👁️ 护眼优先的配色方案
- ⚡ 流畅高性能的阅读体验
- 🔧 强大的自定义能力

### 1.2 目标用户

```
主要用户群体:
├─ 学生群体 (18-25岁) - 35%
│  └─ 需求: 免费、功能丰富、界面现代
│
├─ 职场人士 (25-35岁) - 40%
│  └─ 需求: 护眼、便捷、跨平台同步
│
├─ 资深书虫 (30-45岁) - 20%
│  └─ 需求: 自定义、稳定、功能完善
│
└─ 技术爱好者 (全年龄) - 5%
   └─ 需求: 开源、可折腾、书源规则
```

### 1.3 差异化策略

| 对比维度 | Legado | 微信读书 | Kindle | Vortex |
|---------|--------|----------|--------|--------|
| **跨平台** | ❌ | ✅ | ✅ | ✅ |
| **自定义书源** | ✅ | ❌ | ❌ | ✅ |
| **现代 UI** | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **护眼设计** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **功能丰富度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **开源** | ✅ | ❌ | ❌ | ✅ |

---

## 二、技术架构

### 2.1 技术栈选型

#### 核心技术

```yaml
跨平台框架:
  选择: Flutter 3.x
  理由:
    - 高性能 (接近原生 60fps)
    - UI 一致性好
    - 开发效率高
    - 社区活跃

开发语言:
  主语言: Dart 3.x
  原生扩展: Swift (iOS), Kotlin (Android)

UI 框架:
  设计系统: Material Design 3
  风格定制: 简约现代风

状态管理:
  选择: Riverpod 2.x
  理由:
    - 编译时安全
    - 强大的依赖注入
    - 易于测试

数据库:
  选择: Isar 3.x
  理由:
    - 超快的查询性能
    - 完整的 Dart 支持
    - 零配置

网络层:
  HTTP Client: Dio 5.x
  HTTP Engine: Cronet (可选)
  HTML 解析: html + beautiful_soup_dart

JavaScript 引擎:
  选择: QuickJS (FFI)
  理由:
    - 性能最优
    - 内存占用低
    - ES6+ 支持
```

#### 依赖清单

```yaml
dependencies:
  flutter:
    sdk: flutter

  # 状态管理
  flutter_riverpod: ^2.4.0
  riverpod_annotation: ^2.3.0

  # 数据库
  isar: ^3.1.0
  isar_flutter_libs: ^3.1.0
  path_provider: ^2.1.0

  # 网络
  dio: ^5.4.0
  html: ^0.15.4
  xpath_selector: ^3.0.0

  # JavaScript 引擎
  flutter_qjs: ^0.5.0  # QuickJS FFI binding

  # UI 组件
  google_fonts: ^6.1.0
  flutter_svg: ^2.0.9
  cached_network_image: ^3.3.0

  # 功能库
  shared_preferences: ^2.2.2
  file_picker: ^6.1.1
  permission_handler: ^11.1.0
  webdav_client: ^1.2.1

  # 工具库
  freezed_annotation: ^2.4.1
  json_annotation: ^4.8.1
  logger: ^2.0.2

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.1

  # 代码生成
  build_runner: ^2.4.7
  riverpod_generator: ^2.3.0
  freezed: ^2.4.6
  json_serializable: ^6.7.1
  isar_generator: ^3.1.0
```

### 2.2 架构模式

**Clean Architecture + MVVM**

```
┌─────────────────────────────────────────────┐
│           Presentation Layer                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │  Pages   │  │ Widgets  │  │  Theme   │ │
│  └────┬─────┘  └──────────┘  └──────────┘ │
│       │                                     │
│  ┌────▼──────────────────────────────────┐ │
│  │  Controllers (Riverpod Providers)     │ │
│  └────┬──────────────────────────────────┘ │
└───────┼─────────────────────────────────────┘
        │
┌───────▼─────────────────────────────────────┐
│           Domain Layer                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ Entities │  │ UseCases │  │Repository│ │
│  │          │  │          │  │Interface │ │
│  └──────────┘  └──────────┘  └──────────┘ │
└───────┬─────────────────────────────────────┘
        │
┌───────▼─────────────────────────────────────┐
│             Data Layer                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │  Models  │  │Repository│  │DataSource│ │
│  │          │  │  Impl    │  │          │ │
│  └──────────┘  └──────────┘  └──────────┘ │
│                                             │
│  ┌──────────┐              ┌──────────┐   │
│  │  Local   │              │  Remote  │   │
│  │ Database │              │ Network  │   │
│  └──────────┘              └──────────┘   │
└─────────────────────────────────────────────┘
```

### 2.3 目录结构

```
lib/
├── main.dart                       # 应用入口
│
├── core/                           # 核心层
│   ├── config/
│   │   ├── app_config.dart        # 应用配置
│   │   └── env_config.dart        # 环境配置
│   ├── constants/
│   │   ├── app_constants.dart     # 应用常量
│   │   └── api_constants.dart     # API 常量
│   ├── error/
│   │   ├── exceptions.dart        # 异常定义
│   │   └── failures.dart          # 错误处理
│   ├── network/
│   │   ├── dio_client.dart        # Dio 封装
│   │   └── network_info.dart      # 网络状态
│   ├── storage/
│   │   ├── storage_service.dart   # 存储服务
│   │   └── secure_storage.dart    # 安全存储
│   └── utils/
│       ├── logger.dart            # 日志工具
│       ├── date_utils.dart        # 日期工具
│       └── text_utils.dart        # 文本工具
│
├── data/                           # 数据层
│   ├── models/
│   │   ├── book_model.dart
│   │   ├── chapter_model.dart
│   │   └── book_source_model.dart
│   ├── repositories/
│   │   ├── book_repository_impl.dart
│   │   ├── source_repository_impl.dart
│   │   └── user_repository_impl.dart
│   ├── datasources/
│   │   ├── local/
│   │   │   ├── book_local_datasource.dart
│   │   │   └── cache_datasource.dart
│   │   └── remote/
│   │       └── book_remote_datasource.dart
│   └── database/
│       ├── database.dart          # Isar 数据库
│       ├── entities/
│       │   ├── book_entity.dart
│       │   ├── chapter_entity.dart
│       │   └── source_entity.dart
│       └── daos/
│           ├── book_dao.dart
│           └── source_dao.dart
│
├── domain/                         # 领域层
│   ├── entities/
│   │   ├── book.dart
│   │   ├── chapter.dart
│   │   ├── book_source.dart
│   │   └── reading_progress.dart
│   ├── repositories/
│   │   ├── book_repository.dart
│   │   ├── source_repository.dart
│   │   └── user_repository.dart
│   └── usecases/
│       ├── book/
│       │   ├── get_books.dart
│       │   ├── add_book.dart
│       │   └── delete_book.dart
│       ├── reading/
│       │   ├── get_chapter_content.dart
│       │   └── save_reading_progress.dart
│       └── source/
│           ├── search_books.dart
│           └── parse_book_info.dart
│
├── presentation/                   # 展示层
│   ├── pages/
│   │   ├── bookshelf/
│   │   │   ├── bookshelf_page.dart
│   │   │   └── widgets/
│   │   ├── reading/
│   │   │   ├── reading_page.dart
│   │   │   └── widgets/
│   │   ├── explore/
│   │   │   ├── explore_page.dart
│   │   │   └── widgets/
│   │   ├── source/
│   │   │   ├── source_manager_page.dart
│   │   │   └── widgets/
│   │   └── settings/
│   │       ├── settings_page.dart
│   │       └── widgets/
│   ├── widgets/
│   │   ├── common/
│   │   │   ├── loading_widget.dart
│   │   │   ├── error_widget.dart
│   │   │   └── empty_widget.dart
│   │   └── book/
│   │       ├── book_cover.dart
│   │       └── book_card.dart
│   ├── controllers/
│   │   ├── bookshelf_controller.dart
│   │   ├── reading_controller.dart
│   │   └── source_controller.dart
│   ├── providers/
│   │   └── providers.dart         # Riverpod providers
│   └── theme/
│       ├── app_theme.dart
│       ├── colors.dart
│       ├── text_styles.dart
│       └── dimensions.dart
│
├── services/                       # 服务层
│   ├── book_source/
│   │   ├── book_source_service.dart
│   │   ├── rule_parser.dart
│   │   └── content_matcher.dart
│   ├── content_parser/
│   │   ├── html_parser.dart
│   │   ├── xpath_parser.dart
│   │   └── json_parser.dart
│   ├── js_engine/
│   │   ├── js_engine_service.dart
│   │   └── js_runtime.dart
│   ├── reader/
│   │   ├── text_layout_engine.dart
│   │   ├── page_controller.dart
│   │   └── page_animator.dart
│   ├── sync/
│   │   ├── webdav_sync_service.dart
│   │   └── sync_manager.dart
│   └── local_book/
│       ├── epub_parser.dart
│       ├── txt_parser.dart
│       └── file_manager.dart
│
├── l10n/                           # 国际化
│   ├── app_en.arb
│   └── app_zh.arb
│
└── router/                         # 路由
    ├── app_router.dart
    └── route_guards.dart
```

---

## 三、UI/UX 设计规范

### 3.1 设计原则

**核心原则: 内容优先，体验至上**

1. **简约克制** - 减少不必要的视觉元素
2. **护眼友好** - 柔和配色，降低视觉疲劳
3. **流畅自然** - 符合物理直觉的动画
4. **清晰层级** - 信息架构清晰
5. **高效操作** - 减少点击次数

### 3.2 色彩系统

#### 主色板

```dart
class VortexColors {
  // ===== 主色系 =====
  static const Color primary = Color(0xFF5B7C99);        // 柔和蓝灰
  static const Color primaryLight = Color(0xFF8DABC8);   // 浅蓝灰
  static const Color primaryDark = Color(0xFF3D5A75);    // 深蓝灰

  // ===== 辅助色 =====
  static const Color secondary = Color(0xFFB8A48E);      // 暖黄色
  static const Color tertiary = Color(0xFF91AC8F);       // 护眼绿

  // ===== 功能色 =====
  static const Color success = Color(0xFF10B981);        // 成功绿
  static const Color warning = Color(0xFFF59E0B);        // 警告黄
  static const Color error = Color(0xFFEF4444);          // 错误红
  static const Color info = Color(0xFF3B82F6);           // 信息蓝

  // ===== 中性色 =====
  static const Color gray50 = Color(0xFFFAFAFA);
  static const Color gray100 = Color(0xFFF4F4F5);
  static const Color gray200 = Color(0xFFE4E4E7);
  static const Color gray300 = Color(0xFFD4D4D8);
  static const Color gray400 = Color(0xFFA1A1AA);
  static const Color gray500 = Color(0xFF71717A);
  static const Color gray600 = Color(0xFF52525B);
  static const Color gray700 = Color(0xFF3F3F46);
  static const Color gray800 = Color(0xFF27272A);
  static const Color gray900 = Color(0xFF18181B);

  // ===== 阅读背景色 =====
  static const Map<String, Color> readingBackgrounds = {
    'paper': Color(0xFFFBF8F2),        // 纸张色 (默认)
    'parchment': Color(0xFFF4EDD8),    // 羊皮纸
    'eyeCare': Color(0xFFE3EDCD),      // 护眼绿
    'beige': Color(0xFFF5F5DC),        // 米黄色
    'night': Color(0xFF1A202C),        // 夜间模式
    'amoled': Color(0xFF000000),       // OLED 纯黑
  };

  // ===== 文字颜色 (降低对比度，护眼) =====
  static const Color textPrimary = Color(0xFF2D3748);    // 主文字 (非纯黑)
  static const Color textSecondary = Color(0xFF4A5568);  // 次要文字
  static const Color textTertiary = Color(0xFF718096);   // 提示文字
  static const Color textDisabled = Color(0xFFA0AEC0);   // 禁用文字

  // 深色模式文字
  static const Color textPrimaryDark = Color(0xFFE2E8F0);
  static const Color textSecondaryDark = Color(0xFFCBD5E0);
  static const Color textTertiaryDark = Color(0xFFA0AEC0);
}
```

#### 配色使用规范

```dart
// ✅ 正确使用
Text(
  '书名',
  style: TextStyle(color: VortexColors.textPrimary),
)

// ❌ 错误使用 (避免纯黑色)
Text(
  '书名',
  style: TextStyle(color: Colors.black),
)
```

### 3.3 字体系统

#### 字体家族

```dart
class VortexFonts {
  // 系统默认字体
  static const String systemFont = 'System';

  // 阅读字体（衬线）
  static const String readingSerif = 'SourceHanSerif';    // 思源宋体
  static const String readingSans = 'SourceHanSans';      // 思源黑体

  // UI 字体（无衬线）
  static const String uiFont = 'Inter';                   // 现代无衬线

  // 等宽字体（代码、规则编辑）
  static const String monoFont = 'JetBrainsMono';
}
```

#### 字号系统

```dart
class VortexTextSizes {
  // 标题字号
  static const double heading1 = 28.0;
  static const double heading2 = 24.0;
  static const double heading3 = 20.0;
  static const double heading4 = 18.0;

  // 正文字号
  static const double bodyLarge = 18.0;     // 阅读正文（大）
  static const double bodyMedium = 16.0;    // 阅读正文（中）
  static const double bodySmall = 14.0;     // 次要文字

  // 辅助字号
  static const double caption = 12.0;       // 说明文字
  static const double overline = 10.0;      // 标签文字
}
```

#### 排版规范

```dart
class VortexTextStyles {
  // 阅读正文（最重要）
  static TextStyle get readingBody => TextStyle(
    fontSize: 18,
    height: 1.8,                    // 行高 1.8
    letterSpacing: 0.5,             // 字间距 0.5px
    fontFamily: VortexFonts.readingSerif,
    color: VortexColors.textPrimary,
    fontWeight: FontWeight.w400,
  );

  // 标题 H1
  static TextStyle get h1 => TextStyle(
    fontSize: VortexTextSizes.heading1,
    height: 1.3,
    fontWeight: FontWeight.w700,
    letterSpacing: -0.5,
    color: VortexColors.textPrimary,
  );

  // 标题 H2
  static TextStyle get h2 => TextStyle(
    fontSize: VortexTextSizes.heading2,
    height: 1.4,
    fontWeight: FontWeight.w600,
    letterSpacing: -0.3,
    color: VortexColors.textPrimary,
  );

  // 正文文字
  static TextStyle get bodyText => TextStyle(
    fontSize: VortexTextSizes.bodyMedium,
    height: 1.6,
    letterSpacing: 0.2,
    color: VortexColors.textPrimary,
  );

  // 次要文字
  static TextStyle get caption => TextStyle(
    fontSize: VortexTextSizes.caption,
    height: 1.4,
    color: VortexColors.textSecondary,
  );
}
```

### 3.4 间距系统

```dart
class VortexSpacing {
  // 基础间距单位: 4px
  static const double unit = 4.0;

  // 间距级别
  static const double xs = unit;          // 4px
  static const double sm = unit * 2;      // 8px
  static const double md = unit * 3;      // 12px
  static const double lg = unit * 4;      // 16px
  static const double xl = unit * 5;      // 20px
  static const double xxl = unit * 6;     // 24px
  static const double xxxl = unit * 8;    // 32px

  // 页面边距
  static const double pagePadding = lg;   // 16px

  // 卡片间距
  static const double cardMargin = sm;    // 8px
  static const double cardPadding = lg;   // 16px

  // 列表间距
  static const double listItemSpacing = md;  // 12px

  // 组件内间距
  static const double componentPadding = md; // 12px
}
```

### 3.5 圆角系统

```dart
class VortexRadius {
  // 圆角大小
  static const double none = 0;
  static const double sm = 6.0;
  static const double md = 10.0;
  static const double lg = 12.0;
  static const double xl = 16.0;
  static const double xxl = 20.0;
  static const double full = 9999.0;  // 全圆角

  // 默认卡片圆角
  static const double card = lg;      // 12px

  // 按钮圆角
  static const double button = md;    // 10px

  // 输入框圆角
  static const double input = md;     // 10px

  // 对话框圆角
  static const double dialog = xl;    // 16px
}
```

### 3.6 阴影系统

```dart
class VortexShadows {
  // 轻微阴影（卡片）
  static List<BoxShadow> get sm => [
    BoxShadow(
      color: Colors.black.withOpacity(0.03),
      blurRadius: 4,
      offset: Offset(0, 1),
    ),
  ];

  // 中等阴影（悬浮按钮）
  static List<BoxShadow> get md => [
    BoxShadow(
      color: Colors.black.withOpacity(0.05),
      blurRadius: 8,
      offset: Offset(0, 2),
    ),
  ];

  // 较大阴影（对话框）
  static List<BoxShadow> get lg => [
    BoxShadow(
      color: Colors.black.withOpacity(0.08),
      blurRadius: 16,
      offset: Offset(0, 4),
    ),
  ];

  // 强烈阴影（浮层）
  static List<BoxShadow> get xl => [
    BoxShadow(
      color: Colors.black.withOpacity(0.12),
      blurRadius: 24,
      offset: Offset(0, 8),
    ),
  ];
}
```

### 3.7 动画系统

```dart
class VortexAnimations {
  // 动画时长
  static const Duration fast = Duration(milliseconds: 150);
  static const Duration normal = Duration(milliseconds: 250);
  static const Duration slow = Duration(milliseconds: 350);

  // 动画曲线
  static const Curve easeIn = Curves.easeIn;
  static const Curve easeOut = Curves.easeOut;
  static const Curve easeInOut = Curves.easeInOut;
  static const Curve smooth = Curves.easeOutCubic;      // 最常用
  static const Curve spring = Curves.elasticOut;

  // 页面过渡
  static const Duration pageTransition = normal;
  static const Curve pageTransitionCurve = smooth;

  // 微动效
  static const Duration microInteraction = fast;
  static const Curve microInteractionCurve = easeOut;
}
```

### 3.8 组件规范

#### 卡片组件

```dart
class VortexCard extends StatelessWidget {
  final Widget child;
  final EdgeInsets? padding;
  final EdgeInsets? margin;
  final VoidCallback? onTap;

  const VortexCard({
    required this.child,
    this.padding,
    this.margin,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: margin ?? EdgeInsets.symmetric(
        horizontal: VortexSpacing.lg,
        vertical: VortexSpacing.sm,
      ),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(VortexRadius.card),
        boxShadow: VortexShadows.sm,
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(VortexRadius.card),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(VortexRadius.card),
          child: Padding(
            padding: padding ?? EdgeInsets.all(VortexSpacing.lg),
            child: child,
          ),
        ),
      ),
    );
  }
}
```

#### 按钮组件

```dart
class VortexButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool isPrimary;

  const VortexButton({
    required this.text,
    this.onPressed,
    this.isPrimary = true,
  });

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: isPrimary
          ? VortexColors.primary
          : VortexColors.gray100,
        foregroundColor: isPrimary
          ? Colors.white
          : VortexColors.textPrimary,
        elevation: 0,
        padding: EdgeInsets.symmetric(
          horizontal: VortexSpacing.xl,
          vertical: VortexSpacing.md,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(VortexRadius.button),
        ),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: VortexTextSizes.bodyMedium,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }
}
```

---

## 四、核心功能设计

### 4.1 书架界面

**设计目标:**
- 快速找到想读的书
- 清晰的阅读进度展示
- 便捷的管理操作

**布局结构:**

```
┌─────────────────────────────────────┐
│  ☰  书架           🔍  ⚙️           │  AppBar (简洁)
├─────────────────────────────────────┤
│                                     │
│  📚 正在阅读 (3本)        更多 >    │  Section Header
│                                     │
│  ┌──────┐  ┌──────┐  ┌──────┐    │
│  │ 封面 │  │ 封面 │  │ 封面 │    │  横向滚动
│  │ 书名 │  │ 书名 │  │ 书名 │    │
│  └─ 75%─┘  └─ 32%─┘  └─ 90%─┘    │  进度条
│                                     │
│  ─────────────────────────────────  │  分割线
│                                     │
│  📖 我的书架 (52本)        ⋮       │  Section Header
│                                     │
│  ┌─────────────────────────────┐  │
│  │ 🖼️  [封面]                   │  │
│  │     《剑来》                 │  │  卡片式列表
│  │     烽火戏诸侯 · 第1245章    │  │
│  │     ━━━━━●━━━━━ 45%         │  │
│  └─────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

**关键特性:**
- 分组展示: 正在阅读 / 全部书籍 / 自定义分组
- 进度可视化: 进度条 + 百分比
- 快速操作: 长按显示菜单 (删除、移动、详情)
- 搜索过滤: 支持书名、作者搜索
- 排序方式: 最近阅读、添加时间、书名

### 4.2 阅读界面

**设计目标:**
- 沉浸式阅读体验
- 零干扰
- 快速调整设置

**阅读模式:**

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│        第十二章 剑指苍穹            │  轻触显示章节名
│                                     │
│    "这一剑，破苍穹！"               │
│                                     │
│    林风手持长剑，剑尖直指天         │
│  际。整个人的气势在这一刻攀升       │  大字号、高行距
│  到了极致。周围的灵气疯狂地向       │  沉浸式阅读
│  他汇聚，天空中乌云密布，雷电       │  护眼配色
│  交加。                             │
│                                     │
│    "轰隆隆——"                      │
│                                     │
│    一道惊天雷霆从天而降，直         │
│  击林风手中的长剑...                │
│                                     │
│                                     │
│                           12% ───●  │  底部进度
└─────────────────────────────────────┘
```

**控制方式:**
- 单击中部: 显示/隐藏菜单
- 点击左侧: 上一页
- 点击右侧: 下一页
- 上下滑动: 调节亮度
- 左右滑动: 翻页（可配置）

**快捷菜单:**

```
┌─────────────────────────────────────┐
│  ←  第12章 剑指苍穹        ☰  ⚙️   │  顶部菜单栏
├─────────────────────────────────────┤
│                                     │
│         (阅读内容)                  │
│                                     │
├─────────────────────────────────────┤
│  ━━━━━━━━●━━━━━━━━ 12.5%          │  进度条
│                                     │
│  [Aa] [🎨] [📑] [💡] [⋯]           │  功能按钮
└─────────────────────────────────────┘
```

**功能按钮:**
- **Aa**: 字体设置 (字号、字体、字重、字间距)
- **🎨**: 主题设置 (背景色、文字色、翻页模式)
- **📑**: 目录 (章节列表、书签)
- **💡**: 亮度调节
- **⋯**: 更多 (听书、复制、分享)

### 4.3 书源管理

**书源列表:**

```
┌─────────────────────────────────────┐
│  ←  书源管理           + 添加       │
├─────────────────────────────────────┤
│  🔍 搜索书源...                      │
│                                     │
│  ┌─────────────────────────────┐  │
│  │ ✓ 📚 起点中文网              │  │
│  │    状态: 正常 | 权重: 100    │  │
│  │    最后更新: 2天前            │  │
│  │    [编辑] [测试] [禁用]      │  │
│  └─────────────────────────────┘  │
│                                     │
│  ┌─────────────────────────────┐  │
│  │ ✓ 📚 纵横中文网              │  │
│  │    状态: 正常 | 权重: 90     │  │
│  │    最后更新: 1周前            │  │
│  └─────────────────────────────┘  │
│                                     │
│  ┌─────────────────────────────┐  │
│  │ ⚠️ 📚 某小说网               │  │
│  │    状态: 失效 | 权重: 80     │  │
│  │    最后更新: 1月前            │  │
│  └─────────────────────────────┘  │
└─────────────────────────────────────┘
```

**添加书源:**
- URL 导入
- JSON 导入
- 二维码扫描
- 在线书源库

### 4.4 发现/探索

```
┌─────────────────────────────────────┐
│  发现                    🔍         │
├─────────────────────────────────────┤
│                                     │
│  🔥 热门推荐                        │
│  ┌──────┐  ┌──────┐  ┌──────┐    │
│  │ 封面 │  │ 封面 │  │ 封面 │    │
│  └──────┘  └──────┘  └──────┘    │
│                                     │
│  📖 分类浏览                        │
│  [玄幻] [武侠] [都市] [科幻]       │
│  [言情] [历史] [游戏] [更多...]    │
│                                     │
│  🆕 最新更新                        │
│  · 《剑来》更新至第1245章           │
│  · 《诡秘之主》更新至第1390章       │
│  · 《我师兄实在太稳健了》...        │
│                                     │
│  📊 排行榜                          │
│  [月榜] [总榜] [新书榜]            │
└─────────────────────────────────────┘
```

---

## 五、核心技术实现

### 5.1 书源规则引擎

**规则执行流程:**

```
1. 用户触发搜索/获取内容
   ↓
2. 选择匹配的书源
   ↓
3. 构造 HTTP 请求
   ↓
4. 获取响应内容 (HTML/JSON)
   ↓
5. 应用规则解析
   ├─ XPath 解析
   ├─ CSS Selector 解析
   ├─ 正则表达式匹配
   └─ JavaScript 执行 (QuickJS)
   ↓
6. 提取结构化数据
   ↓
7. 数据验证与清洗
   ↓
8. 存储到数据库
```

**规则示例 (兼容 Legado 格式):**

```json
{
  "bookSourceUrl": "https://example.com",
  "bookSourceName": "示例书源",
  "bookSourceType": 0,
  "enabled": true,
  "weight": 100,
  "searchUrl": "https://example.com/search?q={{key}}",
  "ruleSearch": {
    "bookList": "//div[@class='book-list']/div[@class='item']",
    "name": "h3.title@text",
    "author": "span.author@text",
    "bookUrl": "a@href",
    "coverUrl": "img@src",
    "intro": "p.intro@text"
  },
  "ruleBookInfo": {
    "name": "h1.book-title@text",
    "author": "div.author-name@text",
    "coverUrl": "img.cover@src",
    "intro": "div.book-intro@text",
    "kind": "span.category@text",
    "wordCount": "span.word-count@text",
    "lastChapter": "a.last-chapter@text",
    "tocUrl": "a.catalog-link@href"
  },
  "ruleToc": {
    "chapterList": "ul.chapter-list > li",
    "chapterName": "a@text",
    "chapterUrl": "a@href",
    "isVip": "span.vip",
    "updateTime": "span.time@text"
  },
  "ruleContent": {
    "content": "div.content@html",
    "nextContentUrl": "a.next-page@href"
  }
}
```

### 5.2 JavaScript 引擎集成

**QuickJS 使用示例:**

```dart
import 'package:flutter_qjs/flutter_qjs.dart';

class JSEngineService {
  late IsolateQjs _jsEngine;

  Future<void> init() async {
    _jsEngine = IsolateQjs(
      moduleHandler: (String module) {
        // 处理模块导入
        return '';
      },
    );
  }

  Future<dynamic> evaluate(String script, [Map<String, dynamic>? context]) async {
    try {
      // 注入上下文变量
      if (context != null) {
        for (var entry in context.entries) {
          await _jsEngine.evaluate('var ${entry.key} = ${jsonEncode(entry.value)};');
        }
      }

      // 执行脚本
      final result = await _jsEngine.evaluate(script);
      return result;
    } catch (e) {
      logger.error('JavaScript execution failed: $e');
      rethrow;
    }
  }

  void dispose() {
    _jsEngine.close();
  }
}
```

**规则中的 JS 使用场景:**

```javascript
// 场景1: URL 加密
function encryptUrl(url) {
  const timestamp = Date.now();
  const sign = md5(url + timestamp + 'secret_key');
  return url + '?t=' + timestamp + '&sign=' + sign;
}

// 场景2: 内容解密
function decryptContent(encrypted) {
  return CryptoJS.AES.decrypt(encrypted, 'key').toString();
}

// 场景3: 动态章节列表
function getChapters(html) {
  const $ = cheerio.load(html);
  const chapters = [];
  $('.chapter-item').each((i, el) => {
    chapters.push({
      name: $(el).find('.title').text(),
      url: $(el).find('a').attr('href'),
    });
  });
  return JSON.stringify(chapters);
}
```

### 5.3 文本布局引擎

**核心算法:**

```dart
class TextLayoutEngine {
  /// 计算文本布局
  Future<List<TextPage>> layoutText({
    required String content,
    required double pageWidth,
    required double pageHeight,
    required TextStyle textStyle,
    required EdgeInsets padding,
  }) async {
    final pages = <TextPage>[];

    // 1. 分段
    final paragraphs = _splitParagraphs(content);

    // 2. 创建文本画笔
    final painter = TextPainter(
      textDirection: TextDirection.ltr,
      textAlign: TextAlign.justify,
    );

    // 3. 计算可用空间
    final availableWidth = pageWidth - padding.horizontal;
    final availableHeight = pageHeight - padding.vertical;

    var currentPage = TextPage();
    var currentHeight = 0.0;

    // 4. 逐段布局
    for (var paragraph in paragraphs) {
      painter.text = TextSpan(text: paragraph, style: textStyle);
      painter.layout(maxWidth: availableWidth);

      final paragraphHeight = painter.height;

      // 检查是否需要分页
      if (currentHeight + paragraphHeight > availableHeight) {
        // 保存当前页
        pages.add(currentPage);

        // 创建新页
        currentPage = TextPage();
        currentHeight = 0;
      }

      currentPage.paragraphs.add(paragraph);
      currentHeight += paragraphHeight;
    }

    // 添加最后一页
    if (currentPage.paragraphs.isNotEmpty) {
      pages.add(currentPage);
    }

    return pages;
  }

  List<String> _splitParagraphs(String content) {
    return content
        .split('\n')
        .map((p) => p.trim())
        .where((p) => p.isNotEmpty)
        .toList();
  }
}
```

### 5.4 缓存策略

**多级缓存:**

```dart
class CacheManager {
  // 内存缓存 (LRU)
  final _memoryCache = LruCache<String, String>(maxSize: 50);

  // 磁盘缓存
  final _diskCache = DiskCache();

  /// 获取章节内容
  Future<String?> getChapterContent(String bookUrl, int chapterIndex) async {
    final key = '${bookUrl}_$chapterIndex';

    // 1. 尝试内存缓存
    var content = _memoryCache.get(key);
    if (content != null) {
      return content;
    }

    // 2. 尝试磁盘缓存
    content = await _diskCache.get(key);
    if (content != null) {
      // 写入内存缓存
      _memoryCache.put(key, content);
      return content;
    }

    return null;
  }

  /// 缓存章节内容
  Future<void> cacheChapterContent(
    String bookUrl,
    int chapterIndex,
    String content,
  ) async {
    final key = '${bookUrl}_$chapterIndex';

    // 写入内存缓存
    _memoryCache.put(key, content);

    // 写入磁盘缓存
    await _diskCache.put(key, content);
  }

  /// 清理缓存
  Future<void> clearCache() async {
    _memoryCache.clear();
    await _diskCache.clear();
  }
}
```

---

## 六、开发规范

### 6.1 代码规范

**Dart 代码风格:**

```dart
// ✅ 好的命名
class BookRepository {}
final bookList = <Book>[];
Future<Book> fetchBook() async {}

// ❌ 不好的命名
class book_repository {}
final list = <Book>[];
Future<Book> getbook() async {}

// ✅ 使用 const 和 final
const apiUrl = 'https://api.example.com';
final currentUser = User();

// ❌ 避免不必要的 var
var apiUrl = 'https://api.example.com';  // 应该用 const
var currentUser = User();                 // 应该用 final

// ✅ 异步函数
Future<void> loadData() async {
  final data = await repository.fetchData();
  setState(() {
    _data = data;
  });
}

// ✅ 空安全
String? nullableString;
String nonNullString = nullableString ?? 'default';

// ✅ 使用 Freezed 定义数据类
@freezed
class Book with _$Book {
  const factory Book({
    required String id,
    required String name,
    String? author,
    @Default([]) List<Chapter> chapters,
  }) = _Book;

  factory Book.fromJson(Map<String, dynamic> json) => _$BookFromJson(json);
}
```

**文件组织:**

```dart
// lib/data/models/book_model.dart

// 1. 导入 (按顺序)
import 'dart:async';                    // Dart SDK
import 'dart:io';

import 'package:flutter/material.dart';  // Flutter
import 'package:flutter/services.dart';

import 'package:dio/dio.dart';           // 第三方包
import 'package:freezed_annotation/freezed_annotation.dart';

import 'package:vortex/core/utils/logger.dart';  // 项目内部

// 2. Part 声明
part 'book_model.freezed.dart';
part 'book_model.g.dart';

// 3. 类定义
@freezed
class BookModel with _$BookModel {
  // ...
}
```

### 6.2 Git 提交规范

**Commit Message 格式:**

```
<type>(<scope>): <subject>

<body>

<footer>
```

**类型 (type):**
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具配置

**示例:**

```
feat(reading): 添加翻页动画效果

- 实现仿真翻页动画
- 支持滑动翻页
- 添加动画速度配置

Closes #123
```

### 6.3 测试规范

**单元测试:**

```dart
// test/domain/usecases/get_books_test.dart

import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';

void main() {
  late GetBooks useCase;
  late MockBookRepository mockRepository;

  setUp(() {
    mockRepository = MockBookRepository();
    useCase = GetBooks(mockRepository);
  });

  group('GetBooks', () {
    test('should return list of books from repository', () async {
      // arrange
      final books = [Book(id: '1', name: 'Test Book')];
      when(mockRepository.getBooks()).thenAnswer((_) async => books);

      // act
      final result = await useCase();

      // assert
      expect(result, books);
      verify(mockRepository.getBooks()).called(1);
    });
  });
}
```

**Widget 测试:**

```dart
// test/presentation/pages/bookshelf_page_test.dart

void main() {
  testWidgets('BookshelfPage shows loading indicator', (tester) async {
    // Build widget
    await tester.pumpWidget(
      MaterialApp(
        home: BookshelfPage(),
      ),
    );

    // Verify loading indicator
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
  });
}
```

---

## 七、实施路线图

### 第一阶段: 基础设施 (Week 1-2)

**目标:** 搭建项目基础框架

- [x] 创建 Flutter 项目
- [ ] 配置依赖和构建
- [ ] 实现主题系统
- [ ] 搭建路由
- [ ] 设置 CI/CD

### 第二阶段: 数据层 (Week 3-4)

**目标:** 完成数据存储和网络层

- [ ] 设计数据库 Schema
- [ ] 实现 Repository 层
- [ ] 封装网络请求
- [ ] 实现缓存机制

### 第三阶段: 书源系统 (Week 5-7)

**目标:** 实现核心书源功能

- [ ] 书源模型设计
- [ ] 规则解析引擎
- [ ] QuickJS 集成
- [ ] HTML/XPath 解析
- [ ] 书源管理界面

### 第四阶段: 阅读功能 (Week 8-11)

**目标:** 完成阅读体验

- [ ] 书架界面
- [ ] 阅读器核心
- [ ] 文本布局引擎
- [ ] 翻页动画
- [ ] 阅读设置

### 第五阶段: 高级功能 (Week 12-14)

**目标:** 完善辅助功能

- [ ] 本地导入 (EPUB, TXT)
- [ ] WebDAV 同步
- [ ] 内容替换规则
- [ ] 搜索功能

### 第六阶段: 优化与发布 (Week 15-16)

**目标:** 优化和上线

- [ ] 性能优化
- [ ] UI 调优
- [ ] 测试与修复
- [ ] 应用商店提交

---

## 八、附录

### A. 设计资源

**字体资源:**
- 思源宋体: https://github.com/adobe-fonts/source-han-serif
- 思源黑体: https://github.com/adobe-fonts/source-han-sans
- Inter: https://rsms.me/inter/

**图标资源:**
- Material Icons: https://fonts.google.com/icons
- SF Symbols (iOS): https://developer.apple.com/sf-symbols/

**设计工具:**
- Figma: UI 设计
- ColorSpace: 配色方案
- Type Scale: 字号系统

### B. 参考应用

**UI 参考:**
- 微信读书: 简约风格
- Notion: 现代卡片设计
- Telegram: 流畅动画

**功能参考:**
- Legado: 书源系统
- Kindle: 阅读体验
- 起点读书: 书架管理

### C. 技术文档

- Flutter 官方文档: https://flutter.dev/docs
- Material Design 3: https://m3.material.io/
- Riverpod 文档: https://riverpod.dev/
- Isar 文档: https://isar.dev/

---

**文档版本**: 1.0
**最后更新**: 2026-01-07
**维护者**: Vortex Team
