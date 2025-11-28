import 'package:equatable/equatable.dart';

/// Douban movie/TV item model
class DoubanItem extends Equatable {

  const DoubanItem({
    required this.id,
    required this.title,
    required this.poster,
    required this.rate,
    required this.year,
    this.originalTitle,
    this.directors,
    this.actors,
    this.genres,
    this.regions,
    this.description,
  });

  factory DoubanItem.fromJson(Map<String, dynamic> json) {
    // Extract year from card_subtitle or year field
    String extractYear(dynamic data) {
      if (data is Map) {
        final cardSubtitle = data['card_subtitle'] as String? ?? '';
        final yearMatch = RegExp(r'(\d{4})').firstMatch(cardSubtitle);
        if (yearMatch != null) {
          return yearMatch.group(1) ?? '';
        }
        return data['year'] as String? ?? '';
      }
      return '';
    }

    String extractPoster(dynamic data) {
      final poster = data['poster'];
      if (poster is String) return poster;

      final cover = data['cover'];
      if (cover is String) return cover;

      final pic = data['pic'];
      if (pic is Map) return pic['large'] as String? ?? '';

      return '';
    }

    return DoubanItem(
      id: json['id']?.toString() ?? '',
      title: json['title'] as String? ?? json['name'] as String? ?? '',
      poster: extractPoster(json),
      rate: _formatRate(json['rate'] ?? json['rating']?['value']),
      year: extractYear(json),
      originalTitle: json['original_title'] as String?,
      directors: _extractList(json['directors']),
      actors: _extractList(json['actors']),
      genres: _extractList(json['genres']),
      regions: _extractList(json['regions'] ?? json['countries']),
      description: json['description'] as String? ?? json['intro'] as String?,
    );
  }
  final String id;
  final String title;
  final String poster;
  final String rate;
  final String year;
  final String? originalTitle;
  final String? directors;
  final String? actors;
  final String? genres;
  final String? regions;
  final String? description;

  static String _formatRate(dynamic rate) {
    if (rate == null) return '0.0';
    if (rate is num) {
      return rate.toStringAsFixed(1);
    }
    if (rate is String) {
      final parsed = double.tryParse(rate);
      return parsed?.toStringAsFixed(1) ?? '0.0';
    }
    return '0.0';
  }

  static String? _extractList(dynamic data) {
    if (data == null) return null;
    if (data is List) {
      if (data.isEmpty) return null;
      return data.map((e) => e is Map ? e['name'] ?? e.toString() : e.toString()).join(', ');
    }
    if (data is String) return data;
    return null;
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'poster': poster,
      'rate': rate,
      'year': year,
      'original_title': originalTitle,
      'directors': directors,
      'actors': actors,
      'genres': genres,
      'regions': regions,
      'description': description,
    };
  }

  double get rateValue {
    return double.tryParse(rate) ?? 0.0;
  }

  @override
  List<Object?> get props => [
        id,
        title,
        poster,
        rate,
        year,
        originalTitle,
        directors,
        actors,
        genres,
        regions,
        description,
      ];
}

/// Douban API response model
class DoubanResult extends Equatable {

  const DoubanResult({
    required this.code,
    required this.message,
    required this.list,
  });

  factory DoubanResult.fromJson(Map<String, dynamic> json) {
    List<DoubanItem> parseList(dynamic data) {
      if (data is List) {
        return data
            .map((e) => DoubanItem.fromJson(e as Map<String, dynamic>))
            .toList();
      }
      return [];
    }

    return DoubanResult(
      code: json['code'] as int? ?? 200,
      message: json['message'] as String? ?? json['msg'] as String? ?? 'Success',
      list: parseList(json['list'] ?? json['subjects'] ?? json['items']),
    );
  }
  final int code;
  final String message;
  final List<DoubanItem> list;

  Map<String, dynamic> toJson() {
    return {
      'code': code,
      'message': message,
      'list': list.map((e) => e.toJson()).toList(),
    };
  }

  bool get isSuccess => code == 200;

  @override
  List<Object?> get props => [code, message, list];
}

/// Douban proxy configuration
enum DoubanProxyType {
  direct,
  corsProxyZwei,
  cmliusssCdnTencent,
  cmliusssCdnAli,
  corsAnywhere,
  custom,
}

class DoubanProxyConfig {

  const DoubanProxyConfig({
    this.type = DoubanProxyType.cmliusssCdnTencent,
    this.imageType = DoubanProxyType.cmliusssCdnTencent,
    this.customUrl,
    this.customImageUrl,
  });
  final DoubanProxyType type;
  final DoubanProxyType imageType;
  final String? customUrl;
  final String? customImageUrl;

  String _getProxyUrl(DoubanProxyType proxyType, String? customUrl) {
    switch (proxyType) {
      case DoubanProxyType.direct:
        return '';
      case DoubanProxyType.corsProxyZwei:
        return 'https://ciao-cors.is-an.org/';
      case DoubanProxyType.cmliusssCdnTencent:
        return 'https://m.douban.cmliussss.net';
      case DoubanProxyType.cmliusssCdnAli:
        return 'https://m.douban.cmliussss.com';
      case DoubanProxyType.corsAnywhere:
        return 'https://cors-anywhere.com/';
      case DoubanProxyType.custom:
        return customUrl ?? '';
    }
  }

  String get proxyUrl => _getProxyUrl(type, customUrl);
  String get imageProxyUrl => _getProxyUrl(imageType, customImageUrl);

  bool get useCdn =>
      type == DoubanProxyType.cmliusssCdnTencent ||
      type == DoubanProxyType.cmliusssCdnAli;

  bool get useImageCdn =>
      imageType == DoubanProxyType.cmliusssCdnTencent ||
      imageType == DoubanProxyType.cmliusssCdnAli;

  String getBaseUrl(String originalUrl) {
    if (type == DoubanProxyType.direct) {
      return originalUrl;
    }

    if (useCdn) {
      return originalUrl.replaceAll('douban.com', proxyUrl.replaceAll('https://m.', ''));
    }

    return '$proxyUrl$originalUrl';
  }

  String getProxiedImageUrl(String imageUrl) {
    if (imageUrl.isEmpty) return imageUrl;

    var proxiedUrl = imageUrl;

    if (useImageCdn) {
      final cdnDomain = imageProxyUrl.replaceAll('https://m.douban.', '');
      proxiedUrl = proxiedUrl.replaceAllMapped(
        RegExp(r'img\d*\.doubanio\.com'),
        (match) => 'img.doubanio.$cdnDomain',
      );
    }

    return proxiedUrl.replaceAll('/m_ratio_poster/', '/s_ratio_poster/');
  }
}
