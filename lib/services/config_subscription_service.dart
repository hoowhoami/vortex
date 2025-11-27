import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'api_source_service.dart';

/// Service for managing configuration subscriptions
/// Supports pulling configuration from remote URLs and auto-updating
class ConfigSubscriptionService extends ChangeNotifier {

  ConfigSubscriptionService() {
    _loadSettings();
  }
  static const String _subscriptionUrlKey = 'config_subscription_url';
  static const String _autoUpdateKey = 'config_auto_update';
  static const String _lastUpdateKey = 'config_last_update';

  String _subscriptionUrl = '';
  bool _autoUpdate = false;
  DateTime? _lastUpdate;

  String get subscriptionUrl => _subscriptionUrl;
  bool get autoUpdate => _autoUpdate;
  DateTime? get lastUpdate => _lastUpdate;

  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    _subscriptionUrl = prefs.getString(_subscriptionUrlKey) ?? '';
    _autoUpdate = prefs.getBool(_autoUpdateKey) ?? false;

    final lastUpdateStr = prefs.getString(_lastUpdateKey);
    if (lastUpdateStr != null) {
      _lastUpdate = DateTime.tryParse(lastUpdateStr);
    }

    notifyListeners();
  }

  Future<void> setSubscriptionUrl(String url) async {
    _subscriptionUrl = url;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_subscriptionUrlKey, url);
    notifyListeners();
  }

  Future<void> setAutoUpdate(bool enabled) async {
    _autoUpdate = enabled;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_autoUpdateKey, enabled);
    notifyListeners();
  }

  /// Pull configuration from the subscription URL
  Future<Map<String, dynamic>> pullConfiguration() async {
    if (_subscriptionUrl.isEmpty) {
      throw Exception('订阅URL为空');
    }

    try {
      final uri = Uri.parse(_subscriptionUrl);
      final response = await http.get(uri).timeout(
        const Duration(seconds: 30),
      );

      if (response.statusCode != 200) {
        throw Exception('HTTP ${response.statusCode}: ${response.reasonPhrase}');
      }

      // Try to decode as JSON
      Map<String, dynamic> config;
      try {
        config = json.decode(response.body) as Map<String, dynamic>;
      } catch (e) {
        // If JSON decode fails, try Base58 decode (as mentioned in LunaTV)
        // For now, we'll just support JSON
        throw Exception('配置格式错误，仅支持 JSON 格式');
      }

      // Update last update time
      _lastUpdate = DateTime.now();
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_lastUpdateKey, _lastUpdate!.toIso8601String());
      notifyListeners();

      return config;
    } catch (e) {
      throw Exception('拉取配置失败: $e');
    }
  }

  /// Apply configuration to API sources
  Future<void> applyConfiguration(
    Map<String, dynamic> config,
    ApiSourceService apiSourceService,
  ) async {
    // Extract API sources from config
    final apiSite = config['api_site'] as Map<String, dynamic>?;
    if (apiSite == null) {
      throw Exception('配置中未找到 api_site');
    }

    final sources = <ApiSource>[];

    // Parse each API source
    apiSite.forEach((key, value) {
      if (value is Map<String, dynamic>) {
        final api = value['api'] as String?;
        final name = value['name'] as String?;
        final detail = value['detail'] as String?;

        if (api != null && name != null) {
          if (kDebugMode) {
            print('Adding source: $name ($key) - API: $api');
          }
          sources.add(ApiSource(
            id: key,
            name: name,
            apiUrl: api,
            detailUrl: detail,
          ));
        } else {
          if (kDebugMode) {
            print('Skipping invalid source: $key - api: $api, name: $name');
          }
        }
      }
    });

    if (sources.isEmpty) {
      throw Exception('配置中未找到有效的视频源');
    }

    if (kDebugMode) {
      print('Parsed ${sources.length} sources from configuration');
    }

    // Clear existing non-default sources
    final existingSources = apiSourceService.sources.toList();
    for (final source in existingSources) {
      if (!source.isDefault) {
        if (kDebugMode) {
          print('Deleting existing source: ${source.name} (${source.id})');
        }
        await apiSourceService.deleteSource(source.id);
      }
    }

    // Add new sources
    for (final source in sources) {
      if (kDebugMode) {
        print('Adding new source: ${source.name} (${source.id})');
      }
      await apiSourceService.addSource(source);
    }

    // Activate the first source
    if (sources.isNotEmpty) {
      if (kDebugMode) {
        print('Activating source: ${sources.first.name} (${sources.first.id})');
      }
      await apiSourceService.setActiveSource(sources.first.id);
    }

    if (kDebugMode) {
      print('Configuration applied successfully. Total sources: ${apiSourceService.sources.length}');
    }
  }

  /// Check if auto-update should run and execute if needed
  Future<bool> checkAndRunAutoUpdate(ApiSourceService apiSourceService) async {
    if (!_autoUpdate || _subscriptionUrl.isEmpty) {
      return false;
    }

    // Check if we should update (e.g., once per day)
    if (_lastUpdate != null) {
      final hoursSinceUpdate = DateTime.now().difference(_lastUpdate!).inHours;
      if (hoursSinceUpdate < 24) {
        return false; // Too soon to update
      }
    }

    try {
      final config = await pullConfiguration();
      await applyConfiguration(config, apiSourceService);
      return true;
    } catch (e) {
      if (kDebugMode) {
        print('Auto-update failed: $e');
      }
      return false;
    }
  }
}
