import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/douban.dart';

enum AppThemeMode { light, dark, system }

class AppSettingsService extends ChangeNotifier {

  AppSettingsService() {
    _loadSettings();
  }
  static const String _themeKey = 'theme_mode';
  static const String _languageKey = 'language_code';
  static const String _doubanProxyTypeKey = 'douban_proxy_type';
  static const String _doubanImageProxyTypeKey = 'douban_image_proxy_type';
  static const String _doubanCustomProxyKey = 'douban_custom_proxy_url';
  static const String _doubanCustomImageProxyKey = 'douban_custom_image_proxy_url';

  AppThemeMode _themeMode = AppThemeMode.system;
  Locale _locale = const Locale('zh');
  DoubanProxyType _doubanProxyType = DoubanProxyType.corsProxyZwei;
  DoubanProxyType _doubanImageProxyType = DoubanProxyType.cmliusssCdnTencent;
  String? _doubanCustomProxyUrl;
  String? _doubanCustomImageProxyUrl;

  AppThemeMode get themeMode => _themeMode;
  Locale get locale => _locale;
  DoubanProxyType get doubanProxyType => _doubanProxyType;
  DoubanProxyType get doubanImageProxyType => _doubanImageProxyType;
  String? get doubanCustomProxyUrl => _doubanCustomProxyUrl;
  String? get doubanCustomImageProxyUrl => _doubanCustomImageProxyUrl;

  DoubanProxyConfig get doubanProxyConfig => DoubanProxyConfig(
        type: _doubanProxyType,
        imageType: _doubanImageProxyType,
        customUrl: _doubanCustomProxyUrl,
        customImageUrl: _doubanCustomImageProxyUrl,
      );

  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();

    // Load theme
    final themeModeString = prefs.getString(_themeKey) ?? 'system';
    _themeMode = AppThemeMode.values.firstWhere(
      (e) => e.toString() == 'AppThemeMode.$themeModeString',
      orElse: () => AppThemeMode.system,
    );

    // Load language
    final languageCode = prefs.getString(_languageKey) ?? 'zh';
    _locale = Locale(languageCode);

    // Load Douban proxy type
    final proxyTypeString = prefs.getString(_doubanProxyTypeKey);
    if (proxyTypeString != null) {
      try {
        _doubanProxyType = DoubanProxyType.values.firstWhere(
          (e) => e.toString() == proxyTypeString,
          orElse: () => DoubanProxyType.corsProxyZwei,
        );
      } catch (e) {
        _doubanProxyType = DoubanProxyType.corsProxyZwei;
      }
    }

    // Load Douban image proxy type
    final imageProxyTypeString = prefs.getString(_doubanImageProxyTypeKey);
    if (imageProxyTypeString != null) {
      try {
        _doubanImageProxyType = DoubanProxyType.values.firstWhere(
          (e) => e.toString() == imageProxyTypeString,
          orElse: () => DoubanProxyType.cmliusssCdnTencent,
        );
      } catch (e) {
        _doubanImageProxyType = DoubanProxyType.cmliusssCdnTencent;
      }
    }

    // Load custom proxy URLs
    _doubanCustomProxyUrl = prefs.getString(_doubanCustomProxyKey);
    _doubanCustomImageProxyUrl = prefs.getString(_doubanCustomImageProxyKey);

    notifyListeners();
  }

  Future<void> setThemeMode(AppThemeMode mode) async {
    _themeMode = mode;
    notifyListeners();

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_themeKey, mode.toString().split('.').last);
  }

  Future<void> setLocale(Locale locale) async {
    _locale = locale;
    notifyListeners();

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_languageKey, locale.languageCode);
  }

  Future<void> setDoubanProxyType(DoubanProxyType type) async {
    _doubanProxyType = type;
    notifyListeners();

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_doubanProxyTypeKey, type.toString());
  }

  Future<void> setDoubanImageProxyType(DoubanProxyType type) async {
    _doubanImageProxyType = type;
    notifyListeners();

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_doubanImageProxyTypeKey, type.toString());
  }

  Future<void> setDoubanCustomProxyUrl(String? url) async {
    _doubanCustomProxyUrl = url;
    notifyListeners();

    final prefs = await SharedPreferences.getInstance();
    if (url != null && url.isNotEmpty) {
      await prefs.setString(_doubanCustomProxyKey, url);
    } else {
      await prefs.remove(_doubanCustomProxyKey);
    }
  }

  Future<void> setDoubanCustomImageProxyUrl(String? url) async {
    _doubanCustomImageProxyUrl = url;
    notifyListeners();

    final prefs = await SharedPreferences.getInstance();
    if (url != null && url.isNotEmpty) {
      await prefs.setString(_doubanCustomImageProxyKey, url);
    } else {
      await prefs.remove(_doubanCustomImageProxyKey);
    }
  }

  ThemeMode get flutterThemeMode {
    switch (_themeMode) {
      case AppThemeMode.light:
        return ThemeMode.light;
      case AppThemeMode.dark:
        return ThemeMode.dark;
      case AppThemeMode.system:
        return ThemeMode.system;
    }
  }

  String getDoubanProxyTypeName(DoubanProxyType type) {
    switch (type) {
      case DoubanProxyType.direct:
        return 'Direct';
      case DoubanProxyType.corsProxyZwei:
        return 'CORS Proxy';
      case DoubanProxyType.cmliusssCdnTencent:
        return 'Tencent CDN';
      case DoubanProxyType.cmliusssCdnAli:
        return 'Ali CDN';
      case DoubanProxyType.corsAnywhere:
        return 'CORS Anywhere';
      case DoubanProxyType.custom:
        return 'Custom';
    }
  }
}
