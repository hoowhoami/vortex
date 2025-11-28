import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/douban.dart';

/// Service for managing site configuration
class SiteConfigService extends ChangeNotifier {

  SiteConfigService() {
    _loadSettings();
  }
  static const String _siteNameKey = 'site_name';
  static const String _cacheTimeKey = 'site_cache_time';
  static const String _siteAnnouncementKey = 'site_announcement';
  static const String _doubanProxyTypeKey = 'douban_proxy_type';

  String _siteName = 'Lumina';
  int _cacheTime = 7200; // Default 2 hours in seconds
  String _siteAnnouncement = '';
  DoubanProxyType _doubanProxyType = DoubanProxyType.cmliusssCdnTencent;

  String get siteName => _siteName;
  int get cacheTime => _cacheTime;
  String get siteAnnouncement => _siteAnnouncement;
  DoubanProxyType get doubanProxyType => _doubanProxyType;

  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    _siteName = prefs.getString(_siteNameKey) ?? 'Lumina';
    _cacheTime = prefs.getInt(_cacheTimeKey) ?? 7200;
    _siteAnnouncement = prefs.getString(_siteAnnouncementKey) ?? '';

    // Load Douban proxy type with safe fallback
    try {
      final proxyTypeIndex = prefs.getInt(_doubanProxyTypeKey);
      if (proxyTypeIndex != null && proxyTypeIndex >= 0 && proxyTypeIndex < DoubanProxyType.values.length) {
        _doubanProxyType = DoubanProxyType.values[proxyTypeIndex];
      } else {
        _doubanProxyType = DoubanProxyType.cmliusssCdnTencent;
      }
    } catch (e) {
      _doubanProxyType = DoubanProxyType.cmliusssCdnTencent;
    }

    notifyListeners();
  }

  Future<void> setSiteName(String name) async {
    if (name.trim().isEmpty) {
      throw Exception('站点名称不能为空');
    }

    _siteName = name.trim();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_siteNameKey, _siteName);
    notifyListeners();
  }

  Future<void> setCacheTime(int seconds) async {
    if (seconds < 0) {
      throw Exception('缓存时间不能为负数');
    }

    _cacheTime = seconds;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(_cacheTimeKey, _cacheTime);
    notifyListeners();
  }

  Future<void> setSiteAnnouncement(String announcement) async {
    _siteAnnouncement = announcement.trim();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_siteAnnouncementKey, _siteAnnouncement);
    notifyListeners();
  }

  Future<void> setDoubanProxyType(DoubanProxyType type) async {
    _doubanProxyType = type;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(_doubanProxyTypeKey, type.index);
    notifyListeners();
  }

  /// Get Douban proxy config
  DoubanProxyConfig getDoubanProxyConfig() {
    return DoubanProxyConfig(
      type: _doubanProxyType,
      imageType: _doubanProxyType,
    );
  }

  /// Reset to default values
  Future<void> resetToDefaults() async {
    _siteName = 'Lumina';
    _cacheTime = 7200;
    _siteAnnouncement = '';
    _doubanProxyType = DoubanProxyType.cmliusssCdnTencent;

    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_siteNameKey);
    await prefs.remove(_cacheTimeKey);
    await prefs.remove(_siteAnnouncementKey);
    await prefs.remove(_doubanProxyTypeKey);

    notifyListeners();
  }
}
