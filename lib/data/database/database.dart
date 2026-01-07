import 'package:isar/isar.dart';
import 'package:path_provider/path_provider.dart';
import 'entities/book_entity.dart';
import 'entities/chapter_entity.dart';
import 'entities/book_source_entity.dart';

/// Isar 数据库管理器
class IsarDatabase {
  IsarDatabase._();

  static IsarDatabase? _instance;
  static Isar? _isar;

  /// 获取单例实例
  static IsarDatabase get instance {
    _instance ??= IsarDatabase._();
    return _instance!;
  }

  /// 初始化数据库
  static Future<void> init() async {
    final dir = await getApplicationDocumentsDirectory();

    _isar = await Isar.open(
      [
        BookEntitySchema,
        ChapterEntitySchema,
        BookSourceEntitySchema,
      ],
      directory: dir.path,
      name: 'vortex_db',
      inspector: true, // 开发模式下启用 Isar Inspector
    );

    print('✅ Isar 数据库初始化成功');
  }

  /// 获取 Isar 实例
  static Isar get isar {
    if (_isar == null) {
      throw Exception('Isar 数据库未初始化，请先调用 init() 方法');
    }
    return _isar!;
  }

  /// 清空所有数据 (开发调试用)
  Future<void> clearAll() async {
    await _isar!.writeTxn(() async {
      await _isar!.clear();
    });
    print('✅ 数据库已清空');
  }

  /// 关闭数据库
  static Future<void> close() async {
    await _isar!.close();
    _isar = null;
    print('✅ 数据库已关闭');
  }
}
