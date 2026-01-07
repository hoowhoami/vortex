import 'package:flutter/material.dart';

/// Vortex 配色系统
/// 遵循简约现代风格，护眼优先
class VortexColors {
  VortexColors._();

  // ===== 主色系 =====
  /// 柔和蓝灰 (主色)
  static const Color primary = Color(0xFF5B7C99);
  /// 浅蓝灰
  static const Color primaryLight = Color(0xFF8DABC8);
  /// 深蓝灰
  static const Color primaryDark = Color(0xFF3D5A75);

  // ===== 辅助色 =====
  /// 暖黄色 (阅读强调色)
  static const Color secondary = Color(0xFFB8A48E);
  /// 护眼绿
  static const Color tertiary = Color(0xFF91AC8F);

  // ===== 功能色 =====
  /// 成功绿
  static const Color success = Color(0xFF10B981);
  /// 警告黄
  static const Color warning = Color(0xFFF59E0B);
  /// 错误红
  static const Color error = Color(0xFFEF4444);
  /// 信息蓝
  static const Color info = Color(0xFF3B82F6);

  // ===== 中性色 (灰度系统) =====
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

  // ===== 阅读背景色 (护眼配色) =====
  /// 纸张色 (默认，米白色)
  static const Color readingPaper = Color(0xFFFBF8F2);
  /// 羊皮纸色
  static const Color readingParchment = Color(0xFFF4EDD8);
  /// 护眼绿色
  static const Color readingEyeCare = Color(0xFFE3EDCD);
  /// 米黄色
  static const Color readingBeige = Color(0xFFF5F5DC);
  /// 夜间模式
  static const Color readingNight = Color(0xFF1A202C);
  /// OLED 纯黑
  static const Color readingAmoled = Color(0xFF000000);

  // ===== 浅色模式文字颜色 (降低对比度，护眼) =====
  /// 主文字 (非纯黑，降低视觉疲劳)
  static const Color textPrimary = Color(0xFF2D3748);
  /// 次要文字
  static const Color textSecondary = Color(0xFF4A5568);
  /// 提示文字
  static const Color textTertiary = Color(0xFF718096);
  /// 禁用文字
  static const Color textDisabled = Color(0xFFA0AEC0);

  // ===== 深色模式文字颜色 =====
  /// 深色模式主文字
  static const Color textPrimaryDark = Color(0xFFE2E8F0);
  /// 深色模式次要文字
  static const Color textSecondaryDark = Color(0xFFCBD5E0);
  /// 深色模式提示文字
  static const Color textTertiaryDark = Color(0xFFA0AEC0);

  // ===== 背景色 =====
  /// 浅色背景
  static const Color backgroundLight = Color(0xFFFAFAFA);
  /// 深色背景
  static const Color backgroundDark = Color(0xFF0F172A);

  /// 浅色卡片背景
  static const Color surfaceLight = Colors.white;
  /// 深色卡片背景
  static const Color surfaceDark = Color(0xFF1E293B);
}

/// 阅读主题枚举
enum ReadingTheme {
  /// 纸张色
  paper,
  /// 羊皮纸
  parchment,
  /// 护眼绿
  eyeCare,
  /// 米黄色
  beige,
  /// 夜间模式
  night,
  /// OLED 纯黑
  amoled,
}

/// 阅读主题扩展
extension ReadingThemeExtension on ReadingTheme {
  /// 获取背景颜色
  Color get backgroundColor {
    switch (this) {
      case ReadingTheme.paper:
        return VortexColors.readingPaper;
      case ReadingTheme.parchment:
        return VortexColors.readingParchment;
      case ReadingTheme.eyeCare:
        return VortexColors.readingEyeCare;
      case ReadingTheme.beige:
        return VortexColors.readingBeige;
      case ReadingTheme.night:
        return VortexColors.readingNight;
      case ReadingTheme.amoled:
        return VortexColors.readingAmoled;
    }
  }

  /// 获取文字颜色
  Color get textColor {
    switch (this) {
      case ReadingTheme.night:
      case ReadingTheme.amoled:
        return VortexColors.textPrimaryDark;
      default:
        return VortexColors.textPrimary;
    }
  }

  /// 是否为深色主题
  bool get isDark {
    return this == ReadingTheme.night || this == ReadingTheme.amoled;
  }

  /// 主题名称
  String get displayName {
    switch (this) {
      case ReadingTheme.paper:
        return '纸张';
      case ReadingTheme.parchment:
        return '羊皮纸';
      case ReadingTheme.eyeCare:
        return '护眼绿';
      case ReadingTheme.beige:
        return '米黄';
      case ReadingTheme.night:
        return '夜间';
      case ReadingTheme.amoled:
        return '纯黑';
    }
  }
}
