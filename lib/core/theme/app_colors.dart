import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  // Modern Accent Colors - Vibrant and eye-catching
  static const Color accent = Color(0xFFFF6B6B); // Coral Red
  static const Color accentLight = Color(0xFFFF8E8E);
  static const Color accentDark = Color(0xFFE85555);
  static const Color accentSecondary = Color(0xFF4ECDC4); // Teal

  // ===== DARK THEME =====
  // Dark Theme Background Colors - Deep and rich
  static const Color darkBackground = Color(0xFF0A0E27); // Very dark blue
  static const Color darkSurface = Color(0xFF1A1F3A); // Dark blue
  static const Color darkCard = Color(0xFF252B47); // Medium dark blue
  static const Color darkSurfaceVariant = Color(0xFF2D3350);

  // Dark Theme Text Colors - Maximum contrast for readability
  static const Color darkTextPrimary = Color(0xFFFAFAFA); // Almost white
  static const Color darkTextSecondary = Color(0xFFB8C1D9); // Light blue-grey
  static const Color darkTextTertiary = Color(0xFF8892AA); // Medium blue-grey

  // ===== LIGHT THEME =====
  // Light Theme Background Colors - Clean and bright
  static const Color lightBackground = Color(0xFFFAFBFC); // Very light blue-grey
  static const Color lightSurface = Color(0xFFFFFFFF); // Pure white
  static const Color lightCard = Color(0xFFFFFFFF); // Pure white
  static const Color lightSurfaceVariant = Color(0xFFF0F2F5); // Light grey

  // Light Theme Text Colors - Maximum contrast for readability
  static const Color lightTextPrimary = Color(0xFF0D1117); // Almost black
  static const Color lightTextSecondary = Color(0xFF57606A); // Dark grey
  static const Color lightTextTertiary = Color(0xFF8B95A1); // Medium grey

  // Legacy Compatibility - Default to dark theme colors
  static const Color backgroundDark = darkBackground;
  static const Color backgroundMedium = darkSurface;
  static const Color cardBackground = darkCard;
  static const Color surfaceColor = darkSurfaceVariant;
  static const Color textPrimary = darkTextPrimary;
  static const Color textSecondary = darkTextSecondary;
  static const Color textTertiary = darkTextTertiary;

  // Functional Colors - Modern and accessible
  static const Color success = Color(0xFF06D6A0); // Bright teal
  static const Color successDark = Color(0xFF05B083);
  static const Color warning = Color(0xFFFFBE0B); // Bright yellow
  static const Color warningDark = Color(0xFFE6AC09);
  static const Color error = Color(0xFFFF6B6B); // Same as accent
  static const Color errorDark = Color(0xFFE85555);
  static const Color info = Color(0xFF118AB2); // Deep blue
  static const Color infoDark = Color(0xFF0E7090);

  // Rating Colors
  static const Color ratingGold = Color(0xFFFFBE0B);
  static const Color ratingBackground = Color(0xFF2D3350);

  // Gradient Colors - Modern and vibrant
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFFFF6B6B), Color(0xFFFFBE0B)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient accentGradient = LinearGradient(
    colors: [Color(0xFFFF6B6B), Color(0xFFFF8E8E)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient cardGradient = LinearGradient(
    colors: [Color(0xFF1A1F3A), Color(0xFF252B47)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient overlayGradient = LinearGradient(
    colors: [Colors.transparent, Color(0xDD0A0E27)],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  // Glass morphism effect colors
  static Color darkGlass = const Color(0xFF1A1F3A).withValues(alpha: 0.7);
  static Color lightGlass = const Color(0xFFFFFFFF).withValues(alpha: 0.7);
}
