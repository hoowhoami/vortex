import 'package:isar/isar.dart';

part 'chapter_entity.g.dart';

/// 章节实体 - 数据库表
@collection
class ChapterEntity {
  /// 自增 ID
  Id id = Isar.autoIncrement;

  /// 章节 URL (唯一标识)
  late String url;

  /// 所属书籍 URL
  late String bookUrl;

  /// 章节索引 (从 0 开始)
  late int index;

  /// 章节标题
  late String title;

  /// 章节标签 (卷名等)
  String? tag;

  /// 是否 VIP 章节
  bool isVip = false;

  /// 是否已付费
  bool isPay = false;

  /// 资源 URL (用于多页章节)
  String? resourceUrl;

  /// 开始位置 (用于长章节分段)
  int? startPos;

  /// 结束位置 (用于长章节分段)
  int? endPos;

  /// 字数
  int? wordCount;

  /// 是否已缓存
  bool isCached = false;

  /// 缓存时间
  DateTime? cacheTime;

  /// 更新时间
  DateTime? updateTime;

  /// 构造函数
  ChapterEntity();

  /// 从 Map 创建
  factory ChapterEntity.fromMap(Map<String, dynamic> map) {
    return ChapterEntity()
      ..url = map['url'] as String
      ..bookUrl = map['bookUrl'] as String
      ..index = map['index'] as int
      ..title = map['title'] as String
      ..tag = map['tag'] as String?
      ..isVip = map['isVip'] as bool? ?? false
      ..isPay = map['isPay'] as bool? ?? false
      ..resourceUrl = map['resourceUrl'] as String?
      ..startPos = map['startPos'] as int?
      ..endPos = map['endPos'] as int?
      ..wordCount = map['wordCount'] as int?
      ..isCached = map['isCached'] as bool? ?? false
      ..cacheTime = map['cacheTime'] != null
          ? DateTime.parse(map['cacheTime'] as String)
          : null
      ..updateTime = map['updateTime'] != null
          ? DateTime.parse(map['updateTime'] as String)
          : null;
  }

  /// 转换为 Map
  Map<String, dynamic> toMap() {
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
}
