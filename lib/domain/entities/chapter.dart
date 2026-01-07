/// 领域层实体 - 章节
class Chapter {
  final String url;
  final String bookUrl;
  final int index;
  final String title;
  final String? tag;
  final bool isVip;
  final bool isPay;
  final String? resourceUrl;
  final int? startPos;
  final int? endPos;
  final int? wordCount;
  final bool isCached;
  final DateTime? cacheTime;
  final DateTime? updateTime;

  Chapter({
    required this.url,
    required this.bookUrl,
    required this.index,
    required this.title,
    this.tag,
    this.isVip = false,
    this.isPay = false,
    this.resourceUrl,
    this.startPos,
    this.endPos,
    this.wordCount,
    this.isCached = false,
    this.cacheTime,
    this.updateTime,
  });

  /// 复制并更新部分字段
  Chapter copyWith({
    String? url,
    String? bookUrl,
    int? index,
    String? title,
    String? tag,
    bool? isVip,
    bool? isPay,
    String? resourceUrl,
    int? startPos,
    int? endPos,
    int? wordCount,
    bool? isCached,
    DateTime? cacheTime,
    DateTime? updateTime,
  }) {
    return Chapter(
      url: url ?? this.url,
      bookUrl: bookUrl ?? this.bookUrl,
      index: index ?? this.index,
      title: title ?? this.title,
      tag: tag ?? this.tag,
      isVip: isVip ?? this.isVip,
      isPay: isPay ?? this.isPay,
      resourceUrl: resourceUrl ?? this.resourceUrl,
      startPos: startPos ?? this.startPos,
      endPos: endPos ?? this.endPos,
      wordCount: wordCount ?? this.wordCount,
      isCached: isCached ?? this.isCached,
      cacheTime: cacheTime ?? this.cacheTime,
      updateTime: updateTime ?? this.updateTime,
    );
  }

  /// 转换为 JSON
  Map<String, dynamic> toJson() {
    return {
      'url': url,
      'bookUrl': bookUrl,
      'index': index,
      'title': title,
      'tag': tag,
      'isVip': isVip,
      'isPay': isPay,
      'resourceUrl': resourceUrl,
      'startPos': startPos,
      'endPos': endPos,
      'wordCount': wordCount,
      'isCached': isCached,
      'cacheTime': cacheTime?.toIso8601String(),
      'updateTime': updateTime?.toIso8601String(),
    };
  }

  /// 从 JSON 创建
  factory Chapter.fromJson(Map<String, dynamic> json) {
    return Chapter(
      url: json['url'] as String,
      bookUrl: json['bookUrl'] as String,
      index: json['index'] as int,
      title: json['title'] as String,
      tag: json['tag'] as String?,
      isVip: json['isVip'] as bool? ?? false,
      isPay: json['isPay'] as bool? ?? false,
      resourceUrl: json['resourceUrl'] as String?,
      startPos: json['startPos'] as int?,
      endPos: json['endPos'] as int?,
      wordCount: json['wordCount'] as int?,
      isCached: json['isCached'] as bool? ?? false,
      cacheTime: json['cacheTime'] != null
          ? DateTime.parse(json['cacheTime'] as String)
          : null,
      updateTime: json['updateTime'] != null
          ? DateTime.parse(json['updateTime'] as String)
          : null,
    );
  }

  @override
  String toString() {
    return 'Chapter(index: $index, title: $title, url: $url)';
  }
}
