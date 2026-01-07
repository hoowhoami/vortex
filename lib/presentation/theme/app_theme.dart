import 'package:flutter/material.dart';
import 'colors.dart';
import 'dimensions.dart';
import 'text_styles.dart';

/// Vortex 应用主题
class VortexTheme {
  VortexTheme._();

  /// 浅色主题
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,

      // 配色方案
      colorScheme: ColorScheme.light(
        primary: VortexColors.primary,
        onPrimary: Colors.white,
        primaryContainer: VortexColors.primaryLight,
        onPrimaryContainer: VortexColors.primaryDark,

        secondary: VortexColors.secondary,
        onSecondary: Colors.white,
        secondaryContainer: VortexColors.secondary.withValues(alpha: 0.2),

        tertiary: VortexColors.tertiary,
        onTertiary: Colors.white,

        error: VortexColors.error,
        onError: Colors.white,

        surface: VortexColors.surfaceLight,
        onSurface: VortexColors.textPrimary,
        surfaceContainerHighest: VortexColors.gray100,

        outline: VortexColors.gray300,
        outlineVariant: VortexColors.gray200,

        shadow: Colors.black.withValues(alpha: 0.05),
      ),

      // 脚手架背景色
      scaffoldBackgroundColor: VortexColors.backgroundLight,

      // 文字主题
      textTheme: VortexTextTheme.create(isDark: false),

      // AppBar 主题
      appBarTheme: AppBarTheme(
        centerTitle: true,
        elevation: 0,
        scrolledUnderElevation: 0,
        backgroundColor: VortexColors.surfaceLight,
        foregroundColor: VortexColors.textPrimary,
        titleTextStyle: VortexTextStyles.h4(),
        iconTheme: const IconThemeData(
          color: VortexColors.textPrimary,
          size: VortexDimensions.iconLg,
        ),
      ),

      // 卡片主题
      cardTheme: CardThemeData(
        color: VortexColors.surfaceLight,
        elevation: VortexDimensions.elevationSm,
        shadowColor: Colors.black.withValues(alpha: 0.03),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(VortexDimensions.cardRadius),
        ),
        margin: const EdgeInsets.symmetric(
          horizontal: VortexDimensions.cardMargin,
          vertical: VortexDimensions.cardMargin,
        ),
      ),

      // 列表项主题
      listTileTheme: ListTileThemeData(
        contentPadding: const EdgeInsets.symmetric(
          horizontal: VortexDimensions.listItemPadding,
          vertical: VortexDimensions.spacingSm,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(VortexDimensions.radiusMd),
        ),
        tileColor: VortexColors.surfaceLight,
      ),

      // 按钮主题
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 0,
          backgroundColor: VortexColors.primary,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(
            horizontal: VortexDimensions.buttonPaddingH,
            vertical: VortexDimensions.buttonPaddingV,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(VortexDimensions.buttonRadius),
          ),
          textStyle: VortexTextStyles.buttonText(),
        ),
      ),

      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: VortexColors.primary,
          padding: const EdgeInsets.symmetric(
            horizontal: VortexDimensions.buttonPaddingH,
            vertical: VortexDimensions.buttonPaddingV,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(VortexDimensions.buttonRadius),
          ),
          textStyle: VortexTextStyles.buttonText(),
        ),
      ),

      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: VortexColors.primary,
          side: const BorderSide(color: VortexColors.primary),
          padding: const EdgeInsets.symmetric(
            horizontal: VortexDimensions.buttonPaddingH,
            vertical: VortexDimensions.buttonPaddingV,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(VortexDimensions.buttonRadius),
          ),
          textStyle: VortexTextStyles.buttonText(),
        ),
      ),

      // 输入框主题
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: VortexColors.gray100,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(VortexDimensions.inputRadius),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(VortexDimensions.inputRadius),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(VortexDimensions.inputRadius),
          borderSide: const BorderSide(color: VortexColors.primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(VortexDimensions.inputRadius),
          borderSide: const BorderSide(color: VortexColors.error),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: VortexDimensions.spacingLg,
          vertical: VortexDimensions.spacingMd,
        ),
        hintStyle: VortexTextStyles.hintText(),
      ),

      // 底部导航栏主题
      navigationBarTheme: NavigationBarThemeData(
        elevation: 0,
        backgroundColor: VortexColors.surfaceLight,
        indicatorColor: VortexColors.primary.withValues(alpha: 0.1),
        height: VortexDimensions.bottomNavHeight,
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return VortexTextStyles.captionStyle(color: VortexColors.primary)
                .copyWith(fontWeight: FontWeight.w600);
          }
          return VortexTextStyles.captionStyle(color: VortexColors.textSecondary);
        }),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const IconThemeData(
              color: VortexColors.primary,
              size: VortexDimensions.iconLg,
            );
          }
          return const IconThemeData(
            color: VortexColors.textSecondary,
            size: VortexDimensions.iconLg,
          );
        }),
      ),

      // 对话框主题
      dialogTheme: DialogThemeData(
        backgroundColor: VortexColors.surfaceLight,
        elevation: VortexDimensions.elevationLg,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(VortexDimensions.dialogRadius),
        ),
        titleTextStyle: VortexTextStyles.h3(),
        contentTextStyle: VortexTextStyles.bodyMediumStyle(),
      ),

      // 分割线主题
      dividerTheme: const DividerThemeData(
        color: VortexColors.gray200,
        thickness: VortexDimensions.dividerThickness,
        space: VortexDimensions.dividerHeight,
      ),

      // 进度指示器主题
      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: VortexColors.primary,
        linearTrackColor: VortexColors.gray200,
      ),

      // 开关主题
      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return VortexColors.primary;
          }
          return VortexColors.gray400;
        }),
        trackColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return VortexColors.primary.withValues(alpha: 0.5);
          }
          return VortexColors.gray300;
        }),
      ),

      // 复选框主题
      checkboxTheme: CheckboxThemeData(
        fillColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return VortexColors.primary;
          }
          return Colors.transparent;
        }),
        checkColor: WidgetStateProperty.all(Colors.white),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(VortexDimensions.radiusSm),
        ),
      ),

      // 单选框主题
      radioTheme: RadioThemeData(
        fillColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return VortexColors.primary;
          }
          return VortexColors.gray400;
        }),
      ),

      // 图标主题
      iconTheme: const IconThemeData(
        color: VortexColors.textPrimary,
        size: VortexDimensions.iconMd,
      ),
    );
  }

  /// 深色主题
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,

      // 配色方案
      colorScheme: ColorScheme.dark(
        primary: VortexColors.primaryLight,
        onPrimary: VortexColors.textPrimaryDark,
        primaryContainer: VortexColors.primaryDark,
        onPrimaryContainer: VortexColors.primaryLight,

        secondary: VortexColors.secondary,
        onSecondary: VortexColors.textPrimaryDark,
        secondaryContainer: VortexColors.secondary.withValues(alpha: 0.2),

        tertiary: VortexColors.tertiary,
        onTertiary: VortexColors.textPrimaryDark,

        error: VortexColors.error,
        onError: Colors.white,

        surface: VortexColors.surfaceDark,
        onSurface: VortexColors.textPrimaryDark,
        surfaceContainerHighest: VortexColors.gray800,

        outline: VortexColors.gray600,
        outlineVariant: VortexColors.gray700,

        shadow: Colors.black.withValues(alpha: 0.3),
      ),

      // 脚手架背景色
      scaffoldBackgroundColor: VortexColors.backgroundDark,

      // 文字主题
      textTheme: VortexTextTheme.create(isDark: true),

      // AppBar 主题
      appBarTheme: AppBarTheme(
        centerTitle: true,
        elevation: 0,
        scrolledUnderElevation: 0,
        backgroundColor: VortexColors.surfaceDark,
        foregroundColor: VortexColors.textPrimaryDark,
        titleTextStyle: VortexTextStyles.h4(color: VortexColors.textPrimaryDark),
        iconTheme: const IconThemeData(
          color: VortexColors.textPrimaryDark,
          size: VortexDimensions.iconLg,
        ),
      ),

      // 卡片主题
      cardTheme: CardThemeData(
        color: VortexColors.surfaceDark,
        elevation: VortexDimensions.elevationSm,
        shadowColor: Colors.black.withValues(alpha: 0.3),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(VortexDimensions.cardRadius),
        ),
        margin: const EdgeInsets.symmetric(
          horizontal: VortexDimensions.cardMargin,
          vertical: VortexDimensions.cardMargin,
        ),
      ),

      // 其他主题配置与浅色类似，只是颜色不同
      listTileTheme: ListTileThemeData(
        contentPadding: const EdgeInsets.symmetric(
          horizontal: VortexDimensions.listItemPadding,
          vertical: VortexDimensions.spacingSm,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(VortexDimensions.radiusMd),
        ),
        tileColor: VortexColors.surfaceDark,
      ),

      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 0,
          backgroundColor: VortexColors.primary,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(
            horizontal: VortexDimensions.buttonPaddingH,
            vertical: VortexDimensions.buttonPaddingV,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(VortexDimensions.buttonRadius),
          ),
          textStyle: VortexTextStyles.buttonText(),
        ),
      ),

      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: VortexColors.gray800,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(VortexDimensions.inputRadius),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(VortexDimensions.inputRadius),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(VortexDimensions.inputRadius),
          borderSide: const BorderSide(color: VortexColors.primaryLight, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(VortexDimensions.inputRadius),
          borderSide: const BorderSide(color: VortexColors.error),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: VortexDimensions.spacingLg,
          vertical: VortexDimensions.spacingMd,
        ),
        hintStyle: VortexTextStyles.hintText(color: VortexColors.textTertiaryDark),
      ),

      navigationBarTheme: NavigationBarThemeData(
        elevation: 0,
        backgroundColor: VortexColors.surfaceDark,
        indicatorColor: VortexColors.primaryLight.withValues(alpha: 0.2),
        height: VortexDimensions.bottomNavHeight,
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return VortexTextStyles.captionStyle(color: VortexColors.primaryLight)
                .copyWith(fontWeight: FontWeight.w600);
          }
          return VortexTextStyles.captionStyle(color: VortexColors.textSecondaryDark);
        }),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const IconThemeData(
              color: VortexColors.primaryLight,
              size: VortexDimensions.iconLg,
            );
          }
          return const IconThemeData(
            color: VortexColors.textSecondaryDark,
            size: VortexDimensions.iconLg,
          );
        }),
      ),

      dialogTheme: DialogThemeData(
        backgroundColor: VortexColors.surfaceDark,
        elevation: VortexDimensions.elevationLg,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(VortexDimensions.dialogRadius),
        ),
        titleTextStyle: VortexTextStyles.h3(color: VortexColors.textPrimaryDark),
        contentTextStyle: VortexTextStyles.bodyMediumStyle(color: VortexColors.textPrimaryDark),
      ),

      dividerTheme: const DividerThemeData(
        color: VortexColors.gray700,
        thickness: VortexDimensions.dividerThickness,
        space: VortexDimensions.dividerHeight,
      ),

      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: VortexColors.primaryLight,
        linearTrackColor: VortexColors.gray700,
      ),

      iconTheme: const IconThemeData(
        color: VortexColors.textPrimaryDark,
        size: VortexDimensions.iconMd,
      ),
    );
  }
}
