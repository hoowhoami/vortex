import 'package:flutter/material.dart';
import 'colors.dart';

/// Vortex 文字样式系统
class VortexTextStyles {
  VortexTextStyles._();

  // ===== 字号系统 =====
  /// 超大标题 - 28px
  static const double heading1 = 28.0;
  /// 大标题 - 24px
  static const double heading2 = 24.0;
  /// 中标题 - 20px
  static const double heading3 = 20.0;
  /// 小标题 - 18px
  static const double heading4 = 18.0;

  /// 大正文 - 18px (阅读正文)
  static const double bodyLarge = 18.0;
  /// 中正文 - 16px (UI 正文)
  static const double bodyMedium = 16.0;
  /// 小正文 - 14px (次要文字)
  static const double bodySmall = 14.0;

  /// 说明文字 - 12px
  static const double caption = 12.0;
  /// 标签文字 - 10px
  static const double overline = 10.0;

  // ===== 字体家族 =====
  /// 系统默认字体
  static const String systemFont = '';

  // ===== 行高系统 =====
  /// 紧凑行高
  static const double lineHeightTight = 1.3;
  /// 普通行高
  static const double lineHeightNormal = 1.5;
  /// 宽松行高
  static const double lineHeightRelaxed = 1.6;
  /// 阅读行高 (最舒适)
  static const double lineHeightReading = 1.8;

  // ===== 字间距系统 =====
  /// 紧凑字间距
  static const double letterSpacingTight = -0.5;
  /// 普通字间距
  static const double letterSpacingNormal = 0.0;
  /// 宽松字间距
  static const double letterSpacingRelaxed = 0.3;
  /// 阅读字间距
  static const double letterSpacingReading = 0.5;

  // ===== 标题样式 =====
  /// H1 样式
  static TextStyle h1({Color? color}) => TextStyle(
        fontSize: heading1,
        height: lineHeightTight,
        fontWeight: FontWeight.w700,
        letterSpacing: letterSpacingTight,
        color: color ?? VortexColors.textPrimary,
      );

  /// H2 样式
  static TextStyle h2({Color? color}) => TextStyle(
        fontSize: heading2,
        height: 1.4,
        fontWeight: FontWeight.w600,
        letterSpacing: -0.3,
        color: color ?? VortexColors.textPrimary,
      );

  /// H3 样式
  static TextStyle h3({Color? color}) => TextStyle(
        fontSize: heading3,
        height: 1.4,
        fontWeight: FontWeight.w600,
        letterSpacing: letterSpacingNormal,
        color: color ?? VortexColors.textPrimary,
      );

  /// H4 样式
  static TextStyle h4({Color? color}) => TextStyle(
        fontSize: heading4,
        height: lineHeightNormal,
        fontWeight: FontWeight.w600,
        letterSpacing: letterSpacingNormal,
        color: color ?? VortexColors.textPrimary,
      );

  // ===== 正文样式 =====
  /// 阅读正文 (最重要，用于小说内容)
  static TextStyle readingBody({Color? color}) => TextStyle(
        fontSize: bodyLarge,
        height: lineHeightReading, // 1.8 倍行高，舒适阅读
        letterSpacing: letterSpacingReading, // 0.5px 字间距
        fontWeight: FontWeight.w400,
        color: color ?? VortexColors.textPrimary,
      );

  /// 大正文
  static TextStyle bodyLargeStyle({Color? color}) => TextStyle(
        fontSize: bodyLarge,
        height: lineHeightRelaxed,
        letterSpacing: letterSpacingRelaxed,
        color: color ?? VortexColors.textPrimary,
      );

  /// 中正文 (UI 默认)
  static TextStyle bodyMediumStyle({Color? color}) => TextStyle(
        fontSize: bodyMedium,
        height: lineHeightRelaxed,
        letterSpacing: 0.2,
        color: color ?? VortexColors.textPrimary,
      );

  /// 小正文
  static TextStyle bodySmallStyle({Color? color}) => TextStyle(
        fontSize: bodySmall,
        height: lineHeightRelaxed,
        color: color ?? VortexColors.textSecondary,
      );

  // ===== 辅助样式 =====
  /// 说明文字
  static TextStyle captionStyle({Color? color}) => TextStyle(
        fontSize: caption,
        height: 1.4,
        color: color ?? VortexColors.textSecondary,
      );

  /// 标签文字
  static TextStyle overlineStyle({Color? color}) => TextStyle(
        fontSize: overline,
        height: 1.4,
        letterSpacing: 0.5,
        fontWeight: FontWeight.w500,
        color: color ?? VortexColors.textTertiary,
      );

  // ===== 按钮样式 =====
  /// 按钮文字
  static TextStyle buttonText({Color? color}) => TextStyle(
        fontSize: bodyMedium,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.3,
        color: color,
      );

  // ===== 输入框样式 =====
  /// 输入文字
  static TextStyle inputText({Color? color}) => TextStyle(
        fontSize: bodyMedium,
        height: lineHeightNormal,
        color: color ?? VortexColors.textPrimary,
      );

  /// 提示文字
  static TextStyle hintText({Color? color}) => TextStyle(
        fontSize: bodyMedium,
        height: lineHeightNormal,
        color: color ?? VortexColors.textTertiary,
      );

  // ===== 特殊样式 =====
  /// 强调文字 (加粗)
  static TextStyle emphasis({Color? color}) => TextStyle(
        fontSize: bodyMedium,
        fontWeight: FontWeight.w600,
        color: color ?? VortexColors.textPrimary,
      );

  /// 链接文字
  static TextStyle link({Color? color}) => TextStyle(
        fontSize: bodyMedium,
        color: color ?? VortexColors.primary,
        decoration: TextDecoration.underline,
      );

  /// 错误文字
  static TextStyle error({Color? color}) => TextStyle(
        fontSize: bodySmall,
        color: color ?? VortexColors.error,
      );
}

/// Flutter TextTheme 扩展
extension VortexTextTheme on TextTheme {
  /// 创建 Vortex 文字主题
  static TextTheme create({bool isDark = false}) {
    final baseColor = isDark ? VortexColors.textPrimaryDark : VortexColors.textPrimary;
    final secondaryColor =
        isDark ? VortexColors.textSecondaryDark : VortexColors.textSecondary;

    // 使用系统默认字体，在中文环境下会自动使用中文字体
    return TextTheme(
      // 标题
      displayLarge: VortexTextStyles.h1(color: baseColor),
      displayMedium: VortexTextStyles.h2(color: baseColor),
      displaySmall: VortexTextStyles.h3(color: baseColor),

      // 小标题
      headlineLarge: VortexTextStyles.h2(color: baseColor),
      headlineMedium: VortexTextStyles.h3(color: baseColor),
      headlineSmall: VortexTextStyles.h4(color: baseColor),

      // 标题
      titleLarge: VortexTextStyles.h3(color: baseColor),
      titleMedium: VortexTextStyles.h4(color: baseColor),
      titleSmall: VortexTextStyles.bodyLargeStyle(color: baseColor),

      // 正文
      bodyLarge: VortexTextStyles.bodyLargeStyle(color: baseColor),
      bodyMedium: VortexTextStyles.bodyMediumStyle(color: baseColor),
      bodySmall: VortexTextStyles.bodySmallStyle(color: secondaryColor),

      // 标签
      labelLarge: VortexTextStyles.buttonText(color: baseColor),
      labelMedium: VortexTextStyles.captionStyle(color: secondaryColor),
      labelSmall: VortexTextStyles.overlineStyle(color: secondaryColor),
    );
  }
}
