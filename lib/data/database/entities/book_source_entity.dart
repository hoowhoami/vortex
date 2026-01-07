import 'package:isar/isar.dart';

part 'book_source_entity.g.dart';

/// 书源实体 - 数据库表
@collection
class BookSourceEntity {
  /// 自增 ID
  Id id = Isar.autoIncrement;

  /// 书源 URL (唯一标识)
  late String bookSourceUrl;

  /// 书源名称
  late String bookSourceName;

  /// 书源类型 (0: 网络源, 1: 本地源)
  int bookSourceType = 0;

  /// 书源分组
  String? bookSourceGroup;

  /// 书源注释
  String? bookSourceComment;

  /// 是否启用
  bool enabled = true;

  /// 是否启用发现
  bool enabledExplore = true;

  /// 权重 (用于排序，数值越大优先级越高)
  int weight = 0;

  /// 自定义顺序
  int customOrder = 0;

  /// 最后更新时间
  DateTime? lastUpdateTime;

  /// 响应时间 (ms)
  int? respondTime;

  // ===== 规则相关 =====

  /// 搜索地址 (支持多个，用换行分隔)
  String? searchUrl;

  /// 发现地址 (JSON 格式)
  String? exploreUrl;

  /// 搜索规则 (JSON 格式)
  String? ruleSearch;

  /// 书籍信息规则 (JSON 格式)
  String? ruleBookInfo;

  /// 目录规则 (JSON 格式)
  String? ruleToc;

  /// 正文规则 (JSON 格式)
  String? ruleContent;

  /// 发现规则 (JSON 格式)
  String? ruleExplore;

  // ===== 请求头 =====

  /// 请求头 (JSON 格式)
  String? header;

  /// Cookie
  String? cookie;

  // ===== 登录相关 =====

  /// 登录 URL
  String? loginUrl;

  /// 登录 UI (JSON 格式)
  String? loginUi;

  /// 登录检查 JS
  String? loginCheckJs;

  // ===== 其他配置 =====

  /// 并发率 (同时请求的章节数)
  int? concurrentRate;

  /// 图片样式 (0: 默认, 1: 全屏, 2: 自适应)
  int? bookSourceImageStyle;

  /// 分类 URL (JSON 格式)
  String? bookSourceRuleCategory;

  /// 封面解密 JS
  String? coverDecodeJs;

  /// 是否启用 JS
  bool enableJs = true;

  /// 加载 JS (在加载页面前执行)
  String? loadJs;

  /// 变量说明 (给用户看的说明文档)
  String? variableComment;

  /// 构造函数
  BookSourceEntity();

  /// 从 Map 创建 (用于导入 Legado 书源)
  factory BookSourceEntity.fromMap(Map<String, dynamic> map) {
    return BookSourceEntity()
      ..bookSourceUrl = map['bookSourceUrl'] as String
      ..bookSourceName = map['bookSourceName'] as String
      ..bookSourceType = map['bookSourceType'] as int? ?? 0
      ..bookSourceGroup = map['bookSourceGroup'] as String?
      ..bookSourceComment = map['bookSourceComment'] as String?
      ..enabled = map['enabled'] as bool? ?? true
      ..enabledExplore = map['enabledExplore'] as bool? ?? true
      ..weight = map['weight'] as int? ?? 0
      ..customOrder = map['customOrder'] as int? ?? 0
      ..lastUpdateTime = map['lastUpdateTime'] != null
          ? DateTime.parse(map['lastUpdateTime'] as String)
          : null
      ..respondTime = map['respondTime'] as int?
      ..searchUrl = map['searchUrl'] as String?
      ..exploreUrl = map['exploreUrl'] as String?
      ..ruleSearch = _encodeRule(map['ruleSearch'])
      ..ruleBookInfo = _encodeRule(map['ruleBookInfo'])
      ..ruleToc = _encodeRule(map['ruleToc'])
      ..ruleContent = _encodeRule(map['ruleContent'])
      ..ruleExplore = _encodeRule(map['ruleExplore'])
      ..header = map['header'] as String?
      ..cookie = map['cookie'] as String?
      ..loginUrl = map['loginUrl'] as String?
      ..loginUi = map['loginUi'] as String?
      ..loginCheckJs = map['loginCheckJs'] as String?
      ..concurrentRate = map['concurrentRate'] as int?
      ..bookSourceImageStyle = map['bookSourceImageStyle'] as int?
      ..bookSourceRuleCategory = map['bookSourceRuleCategory'] as String?
      ..coverDecodeJs = map['coverDecodeJs'] as String?
      ..enableJs = map['enableJs'] as bool? ?? true
      ..loadJs = map['loadJs'] as String?
      ..variableComment = map['variableComment'] as String?;
  }

  /// 转换为 Map
  Map<String, dynamic> toMap() {
    return {
      'bookSourceUrl': bookSourceUrl,
      'bookSourceName': bookSourceName,
      'bookSourceType': bookSourceType,
      'bookSourceGroup': bookSourceGroup,
      'bookSourceComment': bookSourceComment,
      'enabled': enabled,
      'enabledExplore': enabledExplore,
      'weight': weight,
      'customOrder': customOrder,
      'lastUpdateTime': lastUpdateTime?.toIso8601String(),
      'respondTime': respondTime,
      'searchUrl': searchUrl,
      'exploreUrl': exploreUrl,
      'ruleSearch': ruleSearch,
      'ruleBookInfo': ruleBookInfo,
      'ruleToc': ruleToc,
      'ruleContent': ruleContent,
      'ruleExplore': ruleExplore,
      'header': header,
      'cookie': cookie,
      'loginUrl': loginUrl,
      'loginUi': loginUi,
      'loginCheckJs': loginCheckJs,
      'concurrentRate': concurrentRate,
      'bookSourceImageStyle': bookSourceImageStyle,
      'bookSourceRuleCategory': bookSourceRuleCategory,
      'coverDecodeJs': coverDecodeJs,
      'enableJs': enableJs,
      'loadJs': loadJs,
      'variableComment': variableComment,
    };
  }

  /// 编码规则为 JSON 字符串
  static String? _encodeRule(dynamic rule) {
    if (rule == null) return null;
    if (rule is String) return rule;
    // 如果是 Map，需要转换为 JSON
    // 这里简化处理，实际需要使用 json.encode
    return rule.toString();
  }
}
