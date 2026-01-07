import 'package:isar/isar.dart';

part 'book_entity.g.dart';

/// 书籍实体 - 数据库表
@collection
class BookEntity {
  /// 自增 ID
  Id id = Isar.autoIncrement;

  /// 书籍 URL (唯一标识)
  late String bookUrl;

  /// 书名
  late String name;

  /// 作者
  String? author;

  /// 简介
  String? intro;

  /// 封面 URL
  String? coverUrl;

  /// 目录 URL
  String? tocUrl;

  /// 书源 URL
  late String origin;

  /// 书源名称
  String? originName;

  /// 分类
  String? kind;

  /// 字数
  String? wordCount;

  /// 最新章节标题
  String? latestChapterTitle;

  /// 最新章节时间
  DateTime? latestChapterTime;

  /// 当前阅读章节索引
  @Index()
  int durChapterIndex = 0;

  /// 当前章节阅读位置 (字符位置)
  int durChapterPos = 0;

  /// 当前章节阅读时间
  DateTime? durChapterTime;

  /// 总章节数
  int totalChapterCount = 0;

  /// 分组 ID (0: 默认分组)
  @Index()
  int group = 0;

  /// 是否置顶
  bool isTop = false;

  /// 添加时间
  late DateTime addTime;

  /// 最后更新时间
  DateTime? updateTime;

  /// 最后检查更新时间
  DateTime? lastCheckTime;

  /// 自定义顺序
  int order = 0;

  /// 是否正在更新
  bool isUpdating = false;

  /// 是否已完结
  bool isComplete = false;

  /// 自定义标签 (JSON 数组)
  String? tags;

  /// 备注
  String? note;

  /// 构造函数
  BookEntity();

  /// 从 Map 创建
  factory BookEntity.fromMap(Map<String, dynamic> map) {
    return BookEntity()
      ..bookUrl = map['bookUrl'] as String
      ..name = map['name'] as String
      ..author = map['author'] as String?
      ..intro = map['intro'] as String?
      ..coverUrl = map['coverUrl'] as String?
      ..tocUrl = map['tocUrl'] as String?
      ..origin = map['origin'] as String
      ..originName = map['originName'] as String?
      ..kind = map['kind'] as String?
      ..wordCount = map['wordCount'] as String?
      ..latestChapterTitle = map['latestChapterTitle'] as String?
      ..latestChapterTime = map['latestChapterTime'] != null
          ? DateTime.parse(map['latestChapterTime'] as String)
          : null
      ..durChapterIndex = map['durChapterIndex'] as int? ?? 0
      ..durChapterPos = map['durChapterPos'] as int? ?? 0
      ..durChapterTime = map['durChapterTime'] != null
          ? DateTime.parse(map['durChapterTime'] as String)
          : null
      ..totalChapterCount = map['totalChapterCount'] as int? ?? 0
      ..group = map['group'] as int? ?? 0
      ..isTop = map['isTop'] as bool? ?? false
      ..addTime = map['addTime'] != null
          ? DateTime.parse(map['addTime'] as String)
          : DateTime.now()
      ..updateTime = map['updateTime'] != null
          ? DateTime.parse(map['updateTime'] as String)
          : null
      ..lastCheckTime = map['lastCheckTime'] != null
          ? DateTime.parse(map['lastCheckTime'] as String)
          : null
      ..order = map['order'] as int? ?? 0
      ..isUpdating = map['isUpdating'] as bool? ?? false
      ..isComplete = map['isComplete'] as bool? ?? false
      ..tags = map['tags'] as String?
      ..note = map['note'] as String?;
  }

  /// 转换为 Map
  Map<String, dynamic> toMap() {
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
}
