import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../models/video.dart';
import 'api_source_service.dart';

class VideoService extends ChangeNotifier {

  VideoService({
    required ApiSourceService apiSourceService,
    http.Client? client,
  })  : _apiSourceService = apiSourceService,
        _client = client ?? http.Client() {
    // Listen to API source changes
    _apiSourceService.addListener(_onApiSourceChanged);
  }
  final ApiSourceService _apiSourceService;
  final http.Client _client;

  void _onApiSourceChanged() {
    notifyListeners();
  }

  List<String> get _activeApiUrls {
    final activeSources = _apiSourceService.activeSources;
    if (activeSources.isEmpty) {
      throw Exception('没有可用的视频源，请在设置中配置');
    }
    return activeSources.map((s) => s.apiUrl).toList();
  }

  String get _currentApiUrl {
    final urls = _activeApiUrls;
    if (urls.isEmpty) {
      throw Exception('没有可用的视频源，请在设置中配置');
    }
    // Use the first active source as primary
    return urls.first;
  }

  /// Get video list with optional filters
  ///
  /// Parameters:
  /// - [page]: Page number (default: 1)
  /// - [limit]: Items per page (default: 20)
  /// - [typeId]: Category type ID
  /// - [area]: Region filter
  /// - [year]: Year filter
  /// - [lang]: Language filter
  /// - [keyword]: Search keyword
  /// - [ids]: Specific video IDs (comma-separated)
  Future<VideoApiResponse> getVideoList({
    int page = 1,
    int limit = 20,
    int? typeId,
    String? area,
    String? year,
    String? lang,
    String? keyword,
    String? ids,
  }) async {
    final activeUrls = _activeApiUrls;

    // Try each active source until one succeeds
    Exception? lastError;

    for (final apiUrl in activeUrls) {
      try {
        final queryParams = <String, String>{
          'ac': 'list',
          'pg': page.toString(),
          'pagesize': limit.toString(),
        };

        if (typeId != null) queryParams['t'] = typeId.toString();
        if (area != null && area.isNotEmpty) queryParams['area'] = area;
        if (year != null && year.isNotEmpty) queryParams['year'] = year;
        if (lang != null && lang.isNotEmpty) queryParams['lang'] = lang;
        if (keyword != null && keyword.isNotEmpty) queryParams['wd'] = keyword;
        if (ids != null && ids.isNotEmpty) queryParams['ids'] = ids;

        final uri = Uri.parse(apiUrl).replace(queryParameters: queryParams);
        final response = await _client.get(uri).timeout(
          const Duration(seconds: 10),
        );

        if (response.statusCode == 200) {
          final jsonData = json.decode(response.body) as Map<String, dynamic>;
          return VideoApiResponse.fromJson(jsonData);
        }
      } catch (e) {
        lastError = Exception('Error from $apiUrl: $e');
        // Continue to next source
        continue;
      }
    }

    // If all sources failed, throw the last error
    throw lastError ?? Exception('所有视频源都无法访问');
  }

  /// Get video detail by ID
  Future<Video?> getVideoDetail(int id) async {
    try {
      final response = await getVideoList(ids: id.toString());
      if (response.list.isNotEmpty) {
        return response.list.first;
      }
      return null;
    } catch (e) {
      throw Exception('Error fetching video detail: $e');
    }
  }

  /// Search video by name across all active sources (concurrent)
  /// Returns a stream that emits results as they are found
  Stream<MapEntry<String, Video>> searchVideoAcrossSourcesStream(String videoName) async* {
    final activeSources = _apiSourceService.activeSources;

    // Create futures for all sources
    final futures = activeSources.map((source) async {
      try {

        final queryParams = <String, String>{
          'ac': 'list',
          'wd': videoName,
          'pg': '1',
          'pagesize': '20',
        };

        final uri = Uri.parse(source.apiUrl).replace(queryParameters: queryParams);
        final response = await _client.get(uri).timeout(
          const Duration(seconds: 10),
        );

        if (response.statusCode == 200) {
          final jsonData = json.decode(response.body) as Map<String, dynamic>;
          final apiResponse = VideoApiResponse.fromJson(jsonData);


          // Take first result and fetch its detail to get play URLs
          if (apiResponse.list.isNotEmpty) {
            final firstVideo = apiResponse.list.first;

            // Fetch detail to get play URLs
            try {
              final detailParams = <String, String>{
                'ac': 'detail',
                'ids': firstVideo.id.toString(),
              };

              final detailUri = Uri.parse(source.apiUrl).replace(queryParameters: detailParams);
              final detailResponse = await _client.get(detailUri).timeout(
                const Duration(seconds: 10),
              );

              if (detailResponse.statusCode == 200) {
                final detailJson = json.decode(detailResponse.body) as Map<String, dynamic>;
                final detailApiResponse = VideoApiResponse.fromJson(detailJson);


                if (detailApiResponse.list.isNotEmpty) {
                  final videoWithPlayUrl = detailApiResponse.list.first;


                  if (videoWithPlayUrl.playUrl != null && videoWithPlayUrl.playUrl!.isNotEmpty) {                   
                    return MapEntry(source.name, videoWithPlayUrl);
                  }
                }
              }
            } catch (e) {
              if (kDebugMode) {
                print('${source.name} 获取详情失败: $e');
              }
            }
          }
        }
      } catch (e) {
        if (kDebugMode) {
          print('✗ ${source.name} 搜索失败: $e');
        }
      }
      return null;
    }).toList();

    // Emit results as they complete
    for (final future in futures) {
      final result = await future;
      if (result != null) {
        yield result;
      }
    }
  }

  /// Search video by name across all active sources (returns all at once)
  /// Returns a map of source name to video list
  Future<Map<String, Video>> searchVideoAcrossSources(String videoName) async {
    final activeSources = _apiSourceService.activeSources;

    // Create futures for all sources and execute concurrently
    final futures = activeSources.map((source) async {
      try {

        final queryParams = <String, String>{
          'ac': 'list',
          'wd': videoName,
          'pg': '1',
          'pagesize': '20',
        };

        final uri = Uri.parse(source.apiUrl).replace(queryParameters: queryParams);
        final response = await _client.get(uri).timeout(
          const Duration(seconds: 10),
        );

        if (response.statusCode == 200) {
          final jsonData = json.decode(response.body) as Map<String, dynamic>;
          final apiResponse = VideoApiResponse.fromJson(jsonData);

          // Take first result and fetch its detail to get play URLs
          if (apiResponse.list.isNotEmpty) {
            final firstVideo = apiResponse.list.first;

            // Fetch detail to get play URLs
            try {
              final detailParams = <String, String>{
                'ac': 'detail',
                'ids': firstVideo.id.toString(),
              };

              final detailUri = Uri.parse(source.apiUrl).replace(queryParameters: detailParams);
              final detailResponse = await _client.get(detailUri).timeout(
                const Duration(seconds: 10),
              );

              if (detailResponse.statusCode == 200) {
                final detailJson = json.decode(detailResponse.body) as Map<String, dynamic>;
                final detailApiResponse = VideoApiResponse.fromJson(detailJson);

                if (detailApiResponse.list.isNotEmpty) {
                  final videoWithPlayUrl = detailApiResponse.list.first;

                  if (videoWithPlayUrl.playUrl != null && videoWithPlayUrl.playUrl!.isNotEmpty) {                    
                    return MapEntry(source.name, videoWithPlayUrl);
                  }
                }
              }
            } catch (e) {
              if (kDebugMode) {
                print('${source.name} 获取详情失败: $e');
              }
            }
          }
        }
      } catch (e) {
        if (kDebugMode) {
          print('✗ ${source.name} 搜索失败: $e');
        }
      }
      return null;
    }).toList();

    // Wait for all futures to complete
    final results = await Future.wait(futures);

    // Convert to map, filtering out nulls
    final resultMap = <String, Video>{};
    for (final entry in results) {
      if (entry != null) {
        resultMap[entry.key] = entry.value;
      }
    }

    return resultMap;
  }

  /// Search videos by keyword
  Future<VideoApiResponse> searchVideos(
    String keyword, {
    int page = 1,
    int limit = 20,
  }) async {
    return getVideoList(
      keyword: keyword,
      page: page,
      limit: limit,
    );
  }

  /// Get categories
  Future<List<VideoCategory>> getCategories() async {
    final activeUrls = _activeApiUrls;
    Exception? lastError;

    for (final apiUrl in activeUrls) {
      try {
        final queryParams = <String, String>{
          'ac': 'list',
        };

        final uri = Uri.parse(apiUrl).replace(queryParameters: queryParams);
        final response = await _client.get(uri).timeout(
          const Duration(seconds: 10),
        );

        if (response.statusCode == 200) {
          final jsonData = json.decode(response.body) as Map<String, dynamic>;
          final apiResponse = VideoApiResponse.fromJson(jsonData);
          return apiResponse.categories ?? [];
        }
      } catch (e) {
        lastError = Exception('Error from $apiUrl: $e');
        continue;
      }
    }

    throw lastError ?? Exception('所有视频源都无法访问');
  }

  /// Get trending/hot videos
  Future<VideoApiResponse> getTrendingVideos({
    int page = 1,
    int limit = 20,
  }) async {
    return getVideoList(
      page: page,
      limit: limit,
    );
  }

  /// Get videos by category
  Future<VideoApiResponse> getVideosByCategory(
    int typeId, {
    int page = 1,
    int limit = 20,
  }) async {
    return getVideoList(
      typeId: typeId,
      page: page,
      limit: limit,
    );
  }

  /// Get latest videos
  Future<VideoApiResponse> getLatestVideos({
    int page = 1,
    int limit = 20,
  }) async {
    return getVideoList(
      page: page,
      limit: limit,
    );
  }

  /// Get videos by region
  Future<VideoApiResponse> getVideosByRegion(
    String area, {
    int page = 1,
    int limit = 20,
  }) async {
    return getVideoList(
      area: area,
      page: page,
      limit: limit,
    );
  }

  /// Get videos by year
  Future<VideoApiResponse> getVideosByYear(
    String year, {
    int page = 1,
    int limit = 20,
  }) async {
    return getVideoList(
      year: year,
      page: page,
      limit: limit,
    );
  }

  /// Get recommended videos (using high-rated videos as recommendation)
  Future<VideoApiResponse> getRecommendedVideos({
    int page = 1,
    int limit = 20,
  }) async {
    return getVideoList(
      page: page,
      limit: limit,
    );
  }

  @override
  void dispose() {
    _apiSourceService.removeListener(_onApiSourceChanged);
    _client.close();
    super.dispose();
  }
}
