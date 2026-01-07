/// 领域层实体 - 书籍
class Book {
  final String bookUrl;
  final String name;
  final String? author;
  final String? intro;
  final String? coverUrl;
  final String? tocUrl;
  final String origin;
  final String? originName;
  final String? kind;
  final String? wordCount;
  final String? latestChapterTitle;
  final DateTime? latestChapterTime;
  final int durChapterIndex;
  final int durChapterPos;
  final DateTime? durChapterTime;
  final int totalChapterCount;
  final int group;
  final bool isTop;
  final DateTime addTime;
  final DateTime? updateTime;
  final DateTime? lastCheckTime;
  final int order;
  final bool isUpdating;
  final bool isComplete;
  final String? tags;
  final String? note;

  Book({
    required this.bookUrl,
    required this.name,
    this.author,
    this.intro,
    this.coverUrl,
    this.tocUrl,
    required this.origin,
    this.originName,
    this.kind,
    this.wordCount,
    this.latestChapterTitle,
    this.latestChapterTime,
    this.durChapterIndex = 0,
    this.durChapterPos = 0,
    this.durChapterTime,
    this.totalChapterCount = 0,
    this.group = 0,
    this.isTop = false,
    required this.addTime,
    this.updateTime,
    this.lastCheckTime,
    this.order = 0,
    this.isUpdating = false,
    this.isComplete = false,
    this.tags,
    this.note,
  });

  /// 复制并更新部分字段
  Book copyWith({
    String? bookUrl,
    String? name,
    String? author,
    String? intro,
    String? coverUrl,
    String? tocUrl,
    String? origin,
    String? originName,
    String? kind,
    String? wordCount,
    String? latestChapterTitle,
    DateTime? latestChapterTime,
    int? durChapterIndex,
    int? durChapterPos,
    DateTime? durChapterTime,
    int? totalChapterCount,
    int? group,
    bool? isTop,
    DateTime? addTime,
    DateTime? updateTime,
    DateTime? lastCheckTime,
    int? order,
    bool? isUpdating,
    bool? isComplete,
    String? tags,
    String? note,
  }) {
    return Book(
      bookUrl: bookUrl ?? this.bookUrl,
      name: name ?? this.name,
      author: author ?? this.author,
      intro: intro ?? this.intro,
      coverUrl: coverUrl ?? this.coverUrl,
      tocUrl: tocUrl ?? this.tocUrl,
      origin: origin ?? this.origin,
      originName: originName ?? this.originName,
      kind: kind ?? this.kind,
      wordCount: wordCount ?? this.wordCount,
      latestChapterTitle: latestChapterTitle ?? this.latestChapterTitle,
      latestChapterTime: latestChapterTime ?? this.latestChapterTime,
      durChapterIndex: durChapterIndex ?? this.durChapterIndex,
      durChapterPos: durChapterPos ?? this.durChapterPos,
      durChapterTime: durChapterTime ?? this.durChapterTime,
      totalChapterCount: totalChapterCount ?? this.totalChapterCount,
      group: group ?? this.group,
      isTop: isTop ?? this.isTop,
      addTime: addTime ?? this.addTime,
      updateTime: updateTime ?? this.updateTime,
      lastCheckTime: lastCheckTime ?? this.lastCheckTime,
      order: order ?? this.order,
      isUpdating: isUpdating ?? this.isUpdating,
      isComplete: isComplete ?? this.isComplete,
      tags: tags ?? this.tags,
      note: note ?? this.note,
    );
  }

  /// 转换为 JSON
  Map<String, dynamic> toJson() {
    return {
      'bookUrl': bookUrl,
      'name': name,
      'author': author,
      'intro': intro,
      'coverUrl': coverUrl,
      'tocUrl': tocUrl,
      'origin': origin,
      'originName': originName,
      'kind': kind,
      'wordCount': wordCount,
      'latestChapterTitle': latestChapterTitle,
      'latestChapterTime': latestChapterTime?.toIso8601String(),
      'durChapterIndex': durChapterIndex,
      'durChapterPos': durChapterPos,
      'durChapterTime': durChapterTime?.toIso8601String(),
      'totalChapterCount': totalChapterCount,
      'group': group,
      'isTop': isTop,
      'addTime': addTime.toIso8601String(),
      'updateTime': updateTime?.toIso8601String(),
      'lastCheckTime': lastCheckTime?.toIso8601String(),
      'order': order,
      'isUpdating': isUpdating,
      'isComplete': isComplete,
      'tags': tags,
      'note': note,
    };
  }

  /// 从 JSON 创建
  factory Book.fromJson(Map<String, dynamic> json) {
    return Book(
      bookUrl: json['bookUrl'] as String,
      name: json['name'] as String,
      author: json['author'] as String?,
      intro: json['intro'] as String?,
      coverUrl: json['coverUrl'] as String?,
      tocUrl: json['tocUrl'] as String?,
      origin: json['origin'] as String,
      originName: json['originName'] as String?,
      kind: json['kind'] as String?,
      wordCount: json['wordCount'] as String?,
      latestChapterTitle: json['latestChapterTitle'] as String?,
      latestChapterTime: json['latestChapterTime'] != null
          ? DateTime.parse(json['latestChapterTime'] as String)
          : null,
      durChapterIndex: json['durChapterIndex'] as int? ?? 0,
      durChapterPos: json['durChapterPos'] as int? ?? 0,
      durChapterTime: json['durChapterTime'] != null
          ? DateTime.parse(json['durChapterTime'] as String)
          : null,
      totalChapterCount: json['totalChapterCount'] as int? ?? 0,
      group: json['group'] as int? ?? 0,
      isTop: json['isTop'] as bool? ?? false,
      addTime: DateTime.parse(json['addTime'] as String),
      updateTime: json['updateTime'] != null
          ? DateTime.parse(json['updateTime'] as String)
          : null,
      lastCheckTime: json['lastCheckTime'] != null
          ? DateTime.parse(json['lastCheckTime'] as String)
          : null,
      order: json['order'] as int? ?? 0,
      isUpdating: json['isUpdating'] as bool? ?? false,
      isComplete: json['isComplete'] as bool? ?? false,
      tags: json['tags'] as String?,
      note: json['note'] as String?,
    );
  }

  @override
  String toString() {
    return 'Book(bookUrl: $bookUrl, name: $name, author: $author)';
  }
}
