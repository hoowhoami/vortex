import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/constants/app_constants.dart';

/// API Source configuration model
class ApiSource {

  const ApiSource({
    required this.id,
    required this.name,
    required this.apiUrl,
    this.detailUrl,
    this.isActive = true,
    this.isDefault = false,
  });

  factory ApiSource.fromJson(Map<String, dynamic> json) {
    return ApiSource(
      id: json['id'] as String,
      name: json['name'] as String,
      apiUrl: json['api'] as String? ?? json['apiUrl'] as String,
      detailUrl: json['detail'] as String? ?? json['detailUrl'] as String?,
      isActive: json['isActive'] as bool? ?? true,
      isDefault: json['isDefault'] as bool? ?? false,
    );
  }
  final String id;
  final String name;
  final String apiUrl;
  final String? detailUrl;
  final bool isActive;
  final bool isDefault;

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'api': apiUrl,
      'apiUrl': apiUrl,
      'detail': detailUrl,
      'detailUrl': detailUrl,
      'isActive': isActive,
      'isDefault': isDefault,
    };
  }

  ApiSource copyWith({
    String? id,
    String? name,
    String? apiUrl,
    String? detailUrl,
    bool? isActive,
    bool? isDefault,
  }) {
    return ApiSource(
      id: id ?? this.id,
      name: name ?? this.name,
      apiUrl: apiUrl ?? this.apiUrl,
      detailUrl: detailUrl ?? this.detailUrl,
      isActive: isActive ?? this.isActive,
      isDefault: isDefault ?? this.isDefault,
    );
  }
}

/// Service for managing API sources with persistence
class ApiSourceService extends ChangeNotifier {

  ApiSourceService() {
    _loadSources();
  }
  static const String _sourcesKey = 'api_sources';
  static const String _activeSourceKey = 'active_api_source';

  List<ApiSource> _sources = [];
  String? _activeSourceId;

  List<ApiSource> get sources => List.unmodifiable(_sources);

  ApiSource? get activeSource {
    if (_activeSourceId != null) {
      try {
        return _sources.firstWhere((s) => s.id == _activeSourceId);
      } catch (e) {
        return _sources.isNotEmpty ? _sources.first : null;
      }
    }
    return _sources.isNotEmpty ? _sources.first : null;
  }

  List<ApiSource> get activeSources => _sources.where((s) => s.isActive).toList();

  /// Load sources from SharedPreferences
  Future<void> _loadSources() async {
    final prefs = await SharedPreferences.getInstance();

    final sourcesJson = prefs.getString(_sourcesKey);
    if (sourcesJson != null) {
      try {
        final List<dynamic> decoded = json.decode(sourcesJson);
        _sources = decoded.map((e) => ApiSource.fromJson(e as Map<String, dynamic>)).toList();
      } catch (e) {
        _sources = _getDefaultSources();
      }
    } else {
      _sources = _getDefaultSources();
    }

    _activeSourceId = prefs.getString(_activeSourceKey);

    // If no active source or active source not found, use first source
    if (_activeSourceId == null || !_sources.any((s) => s.id == _activeSourceId)) {
      _activeSourceId = _sources.isNotEmpty ? _sources.first.id : null;
    }

    notifyListeners();
  }

  /// Get default sources
  List<ApiSource> _getDefaultSources() {
    // No default sources - user must configure their own
    return [];
  }

  /// Save sources to SharedPreferences
  Future<void> _saveSources() async {
    final prefs = await SharedPreferences.getInstance();
    final sourcesJson = json.encode(_sources.map((e) => e.toJson()).toList());
    await prefs.setString(_sourcesKey, sourcesJson);

    if (_activeSourceId != null) {
      await prefs.setString(_activeSourceKey, _activeSourceId!);
    }
  }

  /// Add a new source
  Future<void> addSource(ApiSource source) async {
    // Check if ID already exists
    if (_sources.any((s) => s.id == source.id)) {
      throw Exception('Source with ID ${source.id} already exists');
    }

    _sources.add(source);

    // If this is the first source, make it active
    if (_sources.length == 1) {
      _activeSourceId = source.id;
    }

    await _saveSources();
    notifyListeners();
  }

  /// Update an existing source
  Future<void> updateSource(String id, ApiSource updatedSource) async {
    final index = _sources.indexWhere((s) => s.id == id);
    if (index == -1) {
      throw Exception('Source with ID $id not found');
    }

    _sources[index] = updatedSource.copyWith(id: id);
    await _saveSources();
    notifyListeners();
  }

  /// Delete a source
  Future<void> deleteSource(String id) async {
    final source = _sources.firstWhere((s) => s.id == id);

    // Cannot delete default source
    if (source.isDefault) {
      throw Exception('Cannot delete default source');
    }

    _sources.removeWhere((s) => s.id == id);

    // If deleted source was active, switch to first available source
    if (_activeSourceId == id) {
      _activeSourceId = _sources.isNotEmpty ? _sources.first.id : null;
    }

    await _saveSources();
    notifyListeners();
  }

  /// Set active source
  Future<void> setActiveSource(String id) async {
    if (!_sources.any((s) => s.id == id)) {
      throw Exception('Source with ID $id not found');
    }

    _activeSourceId = id;
    await _saveSources();
    notifyListeners();
  }

  /// Toggle source active state
  Future<void> toggleSourceActive(String id) async {
    final index = _sources.indexWhere((s) => s.id == id);
    if (index == -1) {
      throw Exception('Source with ID $id not found');
    }

    _sources[index] = _sources[index].copyWith(isActive: !_sources[index].isActive);

    // If deactivated source was active, switch to first active source
    if (_activeSourceId == id && !_sources[index].isActive) {
      final firstActive = _sources.firstWhere(
        (s) => s.isActive,
        orElse: () => _sources.first,
      );
      _activeSourceId = firstActive.id;
    }

    await _saveSources();
    notifyListeners();
  }

  /// Import sources from JSON (LunaTV format)
  Future<void> importFromJson(Map<String, dynamic> config) async {
    final apiSite = config['api_site'] as Map<String, dynamic>?;
    if (apiSite == null) {
      throw Exception('Invalid config format: missing api_site');
    }

    final importedSources = <ApiSource>[];
    for (final entry in apiSite.entries) {
      final sourceData = entry.value as Map<String, dynamic>;
      importedSources.add(ApiSource(
        id: entry.key,
        name: sourceData['name'] as String,
        apiUrl: sourceData['api'] as String,
        detailUrl: sourceData['detail'] as String?,
      ));
    }

    // Add imported sources (skip duplicates)
    for (final source in importedSources) {
      if (!_sources.any((s) => s.id == source.id)) {
        _sources.add(source);
      }
    }

    await _saveSources();
    notifyListeners();
  }

  /// Export sources to JSON (LunaTV format)
  Map<String, dynamic> exportToJson() {
    final apiSite = <String, dynamic>{};
    for (final source in _sources) {
      apiSite[source.id] = {
        'api': source.apiUrl,
        'name': source.name,
        if (source.detailUrl != null) 'detail': source.detailUrl,
      };
    }

    return {
      'cache_time': AppConstants.videoCacheTime,
      'api_site': apiSite,
    };
  }

  /// Test API source connectivity
  Future<bool> testSource(String apiUrl) async {
    try {
      // This would be implemented with actual HTTP request
      // For now, just validate URL format
      final uri = Uri.parse(apiUrl);
      return uri.isAbsolute && (uri.scheme == 'http' || uri.scheme == 'https');
    } catch (e) {
      return false;
    }
  }

  /// Reset to default sources
  Future<void> resetToDefaults() async {
    _sources = _getDefaultSources();
    _activeSourceId = _sources.first.id;
    await _saveSources();
    notifyListeners();
  }
}
