import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/douban.dart';

/// Douban API service for fetching movie and TV show data
/// Reference: https://github.com/MoonTechLab/LunaTV
class DoubanService {

  DoubanService({
    http.Client? client,
    DoubanProxyConfig proxyConfig = const DoubanProxyConfig(),
  })  : _client = client ?? http.Client(),
        _proxyConfig = proxyConfig;
  final http.Client _client;
  DoubanProxyConfig _proxyConfig;

  /// Update proxy configuration
  void updateProxyConfig(DoubanProxyConfig config) {
    _proxyConfig = config;
  }
  static const Duration _timeout = Duration(seconds: 10);

  // Mobile User-Agent for Douban API
  static const String _mobileUserAgent =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148';

  /// Get headers for Douban API requests
  Map<String, String> get _headers => {
        'User-Agent': _mobileUserAgent,
        'Referer': 'https://m.douban.com/',
      };

  /// Search Douban by title
  /// This is the main method to get movie/TV metadata
  Future<DoubanResult> searchByTitle(
    String title, {
    String type = 'movie', // 'movie' or 'tv'
    int pageLimit = 10,
    int pageStart = 0,
  }) async {
    try {
      const baseUrl = 'https://movie.douban.com/j/search_subjects';
      final url = _proxyConfig.getBaseUrl(baseUrl);

      final uri = Uri.parse(url).replace(queryParameters: {
        'type': type,
        'tag': title,
        'sort': 'recommend',
        'page_limit': pageLimit.toString(),
        'page_start': pageStart.toString(),
      });

      final response = await _client.get(uri, headers: _headers).timeout(_timeout);

      if (response.statusCode == 200) {
        final data = json.decode(response.body) as Map<String, dynamic>;

        // Douban search API returns { subjects: [...] }
        final subjects = data['subjects'] as List<dynamic>? ?? [];
        final items = subjects
            .map((e) => DoubanItem.fromJson(e as Map<String, dynamic>))
            .toList();

        return DoubanResult(
          code: 200,
          message: '获取成功',
          list: items,
        );
      } else {
        return DoubanResult(
          code: response.statusCode,
          message: 'Request failed: ${response.statusCode}',
          list: const [],
        );
      }
    } catch (e) {
      return DoubanResult(
        code: 500,
        message: 'Error: $e',
        list: const [],
      );
    }
  }

  /// Get Douban categories (hot movies/TV shows)
  Future<DoubanResult> getCategories({
    required String kind, // 'movie' or 'tv'
    String? category,
    String? type,
    int pageLimit = 20,
    int pageStart = 0,
  }) async {
    if (kind != 'movie' && kind != 'tv') {
      return const DoubanResult(
        code: 400,
        message: 'Invalid kind parameter. Must be "movie" or "tv"',
        list: [],
      );
    }

    if (pageLimit < 1 || pageLimit > 100) {
      return const DoubanResult(
        code: 400,
        message: 'pageLimit must be between 1 and 100',
        list: [],
      );
    }

    try {
      final baseUrl = 'https://m.douban.com/rexxar/api/v2/subject/recent_hot/$kind';
      final url = _proxyConfig.getBaseUrl(baseUrl);

      final queryParams = <String, String>{
        'start': pageStart.toString(),
        'limit': pageLimit.toString(),
      };

      if (category != null && category.isNotEmpty) {
        queryParams['category'] = category;
      }
      if (type != null && type.isNotEmpty) {
        queryParams['type'] = type;
      }

      final uri = Uri.parse(url).replace(queryParameters: queryParams);
      final response = await _client.get(uri, headers: _headers).timeout(_timeout);

      if (response.statusCode == 200) {
        final data = json.decode(response.body) as Map<String, dynamic>;
        final subjects = data['subjects'] as List<dynamic>? ?? [];
        final items = subjects
            .map((e) => DoubanItem.fromJson(e as Map<String, dynamic>))
            .toList();

        return DoubanResult(
          code: 200,
          message: '获取成功',
          list: items,
        );
      } else {
        return DoubanResult(
          code: response.statusCode,
          message: 'Request failed: ${response.statusCode}',
          list: const [],
        );
      }
    } catch (e) {
      return DoubanResult(
        code: 500,
        message: 'Error: $e',
        list: const [],
      );
    }
  }

  /// Get Douban recommendations with advanced filters
  Future<DoubanResult> getRecommendations({
    required String kind, // 'movie' or 'tv'
    String? category,
    String? format,
    String? region,
    String? year,
    String? platform,
    String? sort,
    List<String>? tags,
    int pageLimit = 20,
    int pageStart = 0,
  }) async {
    if (kind != 'movie' && kind != 'tv') {
      return const DoubanResult(
        code: 400,
        message: 'Invalid kind parameter. Must be "movie" or "tv"',
        list: [],
      );
    }

    try {
      final baseUrl = 'https://m.douban.com/rexxar/api/v2/$kind/recommend';
      final url = _proxyConfig.getBaseUrl(baseUrl);

      final selectedCategories = <String, String>{};
      if (category != null) selectedCategories['类型'] = category;
      if (format != null) selectedCategories['形式'] = format;
      if (region != null) selectedCategories['地区'] = region;
      if (year != null) selectedCategories['年代'] = year;
      if (platform != null) selectedCategories['平台'] = platform;

      final queryParams = <String, String>{
        'start': pageStart.toString(),
        'count': pageLimit.toString(),
        'selected_categories': json.encode(selectedCategories),
        'uncollect': 'false',
        'score_range': '0,10',
      };

      // Add sort as a separate query parameter
      if (sort != null && sort.isNotEmpty) {
        queryParams['sort'] = sort;
      }

      if (tags != null && tags.isNotEmpty) {
        queryParams['tags'] = tags.join(',');
      }

      final uri = Uri.parse(url).replace(queryParameters: queryParams);
      final response = await _client.get(uri, headers: _headers).timeout(_timeout);

      if (response.statusCode == 200) {
        final data = json.decode(response.body) as Map<String, dynamic>;
        final items = data['items'] as List<dynamic>? ?? [];

        // Filter only movie or tv type
        final filteredItems = items
            .where((e) {
              final type = e['type'] as String?;
              return type == 'movie' || type == 'tv';
            })
            .map((e) => DoubanItem.fromJson(e as Map<String, dynamic>))
            .toList();

        return DoubanResult(
          code: 200,
          message: '获取成功',
          list: filteredItems,
        );
      } else {
        return DoubanResult(
          code: response.statusCode,
          message: 'Request failed: ${response.statusCode}',
          list: const [],
        );
      }
    } catch (e) {
      return DoubanResult(
        code: 500,
        message: 'Error: $e',
        list: const [],
      );
    }
  }

  /// Get hot movies
  Future<DoubanResult> getHotMovies({
    int pageLimit = 20,
    int pageStart = 0,
  }) {
    return getCategories(
      kind: 'movie',
      pageLimit: pageLimit,
      pageStart: pageStart,
    );
  }

  /// Get hot TV shows
  Future<DoubanResult> getHotTVShows({
    int pageLimit = 20,
    int pageStart = 0,
  }) {
    return getCategories(
      kind: 'tv',
      pageLimit: pageLimit,
      pageStart: pageStart,
    );
  }

  /// Get movie recommendations
  Future<DoubanResult> getMovieRecommendations({
    String? category,
    String? region,
    String? year,
    int pageLimit = 20,
    int pageStart = 0,
  }) {
    return getRecommendations(
      kind: 'movie',
      category: category,
      region: region,
      year: year,
      pageLimit: pageLimit,
      pageStart: pageStart,
    );
  }

  /// Get TV show recommendations
  Future<DoubanResult> getTVRecommendations({
    String? category,
    String? region,
    String? year,
    int pageLimit = 20,
    int pageStart = 0,
  }) {
    return getRecommendations(
      kind: 'tv',
      category: category,
      region: region,
      year: year,
      pageLimit: pageLimit,
      pageStart: pageStart,
    );
  }

  /// Get detailed information for a specific Douban item by ID
  Future<DoubanItem?> getDetail(String id) async {
    try {
      final baseUrl = 'https://m.douban.com/rexxar/api/v2/subject/$id';
      final url = _proxyConfig.getBaseUrl(baseUrl);
      final uri = Uri.parse(url);

      final response = await _client.get(uri, headers: _headers).timeout(_timeout);

      if (response.statusCode == 200) {
        final data = json.decode(response.body) as Map<String, dynamic>;
        return DoubanItem.fromJson(data);
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  /// Find best match for a video title
  /// This is useful for enriching video data with Douban metadata
  Future<DoubanItem?> findBestMatch(
    String title, {
    String type = 'movie',
    String? year,
  }) async {
    try {
      final result = await searchByTitle(title, type: type);

      if (result.list.isEmpty) {
        return null;
      }

      // If year is provided, try to find exact match
      if (year != null && year.isNotEmpty) {
        final yearMatch = result.list.firstWhere(
          (item) => item.year == year,
          orElse: () => result.list.first,
        );
        return yearMatch;
      }

      // Return first result (most relevant)
      return result.list.first;
    } catch (e) {
      return null;
    }
  }

  /// Get proxied image URL to avoid CORS issues
  String getProxiedImageUrl(String imageUrl) {
    return _proxyConfig.getProxiedImageUrl(imageUrl);
  }

  void dispose() {
    _client.close();
  }
}
