import 'package:flutter/material.dart';

/// Vortex 尺寸规范
class VortexDimensions {
  VortexDimensions._();

  // ===== 间距系统 (基于 4px 基础单位) =====
  /// 基础间距单位
  static const double unit = 4.0;

  /// 极小间距 - 4px
  static const double spacingXs = unit;
  /// 小间距 - 8px
  static const double spacingSm = unit * 2;
  /// 中等间距 - 12px
  static const double spacingMd = unit * 3;
  /// 大间距 - 16px
  static const double spacingLg = unit * 4;
  /// 超大间距 - 20px
  static const double spacingXl = unit * 5;
  /// 极大间距 - 24px
  static const double spacingXxl = unit * 6;
  /// 超级大间距 - 32px
  static const double spacingXxxl = unit * 8;

  // ===== 页面边距 =====
  /// 页面水平边距
  static const double pagePaddingHorizontal = spacingLg; // 16px
  /// 页面垂直边距
  static const double pagePaddingVertical = spacingLg; // 16px
  /// 页面内边距
  static const EdgeInsets pagePadding = EdgeInsets.all(spacingLg);

  // ===== 卡片间距 =====
  /// 卡片外边距
  static const double cardMargin = spacingSm; // 8px
  /// 卡片内边距
  static const double cardPadding = spacingLg; // 16px

  // ===== 列表间距 =====
  /// 列表项间距
  static const double listItemSpacing = spacingMd; // 12px
  /// 列表项内边距
  static const double listItemPadding = spacingLg; // 16px

  // ===== 组件内间距 =====
  /// 组件内边距
  static const double componentPadding = spacingMd; // 12px
  /// 按钮内边距水平
  static const double buttonPaddingH = spacingXl; // 20px
  /// 按钮内边距垂直
  static const double buttonPaddingV = spacingMd; // 12px

  // ===== 圆角系统 =====
  /// 无圆角
  static const double radiusNone = 0;
  /// 小圆角 - 6px
  static const double radiusSm = 6.0;
  /// 中等圆角 - 10px
  static const double radiusMd = 10.0;
  /// 大圆角 - 12px (默认)
  static const double radiusLg = 12.0;
  /// 超大圆角 - 16px
  static const double radiusXl = 16.0;
  /// 极大圆角 - 20px
  static const double radiusXxl = 20.0;
  /// 全圆角 (药丸形)
  static const double radiusFull = 9999.0;

  // ===== 组件圆角 =====
  /// 卡片圆角
  static const double cardRadius = radiusLg; // 12px
  /// 按钮圆角
  static const double buttonRadius = radiusMd; // 10px
  /// 输入框圆角
  static const double inputRadius = radiusMd; // 10px
  /// 对话框圆角
  static const double dialogRadius = radiusXl; // 16px
  /// 图片圆角
  static const double imageRadius = radiusMd; // 10px

  // ===== 图标尺寸 =====
  /// 小图标 - 16px
  static const double iconSm = 16.0;
  /// 中等图标 - 20px
  static const double iconMd = 20.0;
  /// 大图标 - 24px
  static const double iconLg = 24.0;
  /// 超大图标 - 32px
  static const double iconXl = 32.0;

  // ===== 头像/封面尺寸 =====
  /// 小头像 - 32px
  static const double avatarSm = 32.0;
  /// 中等头像 - 40px
  static const double avatarMd = 40.0;
  /// 大头像 - 48px
  static const double avatarLg = 48.0;
  /// 超大头像 - 64px
  static const double avatarXl = 64.0;

  /// 书籍封面宽度 (列表)
  static const double bookCoverWidthSm = 60.0;
  /// 书籍封面高度 (列表)
  static const double bookCoverHeightSm = 80.0;

  /// 书籍封面宽度 (卡片)
  static const double bookCoverWidthMd = 100.0;
  /// 书籍封面高度 (卡片)
  static const double bookCoverHeightMd = 140.0;

  /// 书籍封面宽度 (大图)
  static const double bookCoverWidthLg = 120.0;
  /// 书籍封面高度 (大图)
  static const double bookCoverHeightLg = 160.0;

  // ===== 阴影高度 =====
  /// 无阴影
  static const double elevationNone = 0;
  /// 轻微阴影
  static const double elevationSm = 0.5;
  /// 中等阴影
  static const double elevationMd = 2.0;
  /// 大阴影
  static const double elevationLg = 4.0;
  /// 超大阴影
  static const double elevationXl = 8.0;

  // ===== 组件高度 =====
  /// 按钮高度
  static const double buttonHeight = 44.0;
  /// 输入框高度
  static const double inputHeight = 48.0;
  /// AppBar 高度
  static const double appBarHeight = 56.0;
  /// 底部导航栏高度
  static const double bottomNavHeight = 65.0;
  /// TabBar 高度
  static const double tabBarHeight = 48.0;

  // ===== 分割线 =====
  /// 分割线粗细
  static const double dividerThickness = 0.5;
  /// 分割线高度 (带间距)
  static const double dividerHeight = 1.0;

  // ===== 进度条 =====
  /// 进度条高度 (细)
  static const double progressHeightThin = 2.0;
  /// 进度条高度 (中)
  static const double progressHeightMedium = 4.0;
  /// 进度条高度 (粗)
  static const double progressHeightThick = 6.0;
}

/// Vortex 阴影系统
class VortexShadows {
  VortexShadows._();

  /// 轻微阴影 (卡片)
  static List<BoxShadow> get sm => [
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.03),
          blurRadius: 4,
          offset: const Offset(0, 1),
        ),
      ];

  /// 中等阴影 (悬浮按钮)
  static List<BoxShadow> get md => [
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.05),
          blurRadius: 8,
          offset: const Offset(0, 2),
        ),
      ];

  /// 较大阴影 (对话框)
  static List<BoxShadow> get lg => [
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.08),
          blurRadius: 16,
          offset: const Offset(0, 4),
        ),
      ];

  /// 强烈阴影 (浮层)
  static List<BoxShadow> get xl => [
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.12),
          blurRadius: 24,
          offset: const Offset(0, 8),
        ),
      ];

  /// 无阴影
  static List<BoxShadow>? get none => null;
}
