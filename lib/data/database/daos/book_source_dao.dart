import 'package:isar/isar.dart';
import '../entities/book_source_entity.dart';

/// 书源 DAO (Data Access Object)
class BookSourceDao {
  const BookSourceDao(this.isar);

  final Isar isar;

  /// 查询所有书源
  Query<BookSourceEntity> getAllSources() {
    return isar.bookSourceEntitys
        .where()
        .sortByWeightDesc()
        .thenByCustomOrder()
        .build();
  }

  /// 查询启用的书源
  Query<BookSourceEntity> getEnabledSources() {
    return isar.bookSourceEntitys
        .filter()
        .enabledEqualTo(true)
        .sortByWeightDesc()
        .thenByCustomOrder()
        .build();
  }

  /// 根据 URL 查询书源
  Future<BookSourceEntity?> getSourceByUrl(String sourceUrl) async {
    return await isar.bookSourceEntitys
        .filter()
        .bookSourceUrlEqualTo(sourceUrl)
        .findFirst();
  }

  /// 按分组查询书源
  Query<BookSourceEntity> getSourcesByGroup(String group) {
    return isar.bookSourceEntitys
        .filter()
        .bookSourceGroupEqualTo(group)
        .sortByWeightDesc()
        .build();
  }

  /// 搜索书源 (按名称)
  Query<BookSourceEntity> searchSources(String keyword) {
    return isar.bookSourceEntitys
        .filter()
        .bookSourceNameContains(keyword, caseSensitive: false)
        .sortByWeightDesc()
        .build();
  }

  /// 插入或更新书源
  Future<Id> putSource(BookSourceEntity source) async {
    return await isar.writeTxn(() async {
      return await isar.bookSourceEntitys.put(source);
    });
  }

  /// 批量插入或更新书源
  Future<int> putSources(List<BookSourceEntity> sources) async {
    return await isar.writeTxn(() async {
      final ids = await isar.bookSourceEntitys.putAll(sources);
      return ids.length;
    });
  }

  /// 删除书源
  Future<bool> deleteSource(Id id) async {
    return await isar.writeTxn(() async {
      return await isar.bookSourceEntitys.delete(id);
    });
  }

  /// 批量删除书源
  Future<bool> deleteSources(List<Id> ids) async {
    return await isar.writeTxn(() async {
      final count = await isar.bookSourceEntitys.deleteAll(ids);
      return count > 0;
    });
  }

  /// 根据 URL 删除书源
  Future<bool> deleteSourceByUrl(String sourceUrl) async {
    final source = await getSourceByUrl(sourceUrl);
    if (source == null) return false;
    return await deleteSource(source.id);
  }

  /// 清空所有书源
  Future<bool> clearAllSources() async {
    return await isar.writeTxn(() async {
      await isar.bookSourceEntitys.clear();
      return true;
    });
  }

  /// 启用/禁用书源
  Future<void> toggleSource({
    required String sourceUrl,
    required bool enabled,
  }) async {
    await isar.writeTxn(() async {
      final source = await getSourceByUrl(sourceUrl);
      if (source != null) {
        source.enabled = enabled;
        await isar.bookSourceEntitys.put(source);
      }
    });
  }

  /// 更新书源响应时间
  Future<void> updateRespondTime({
    required String sourceUrl,
    required int respondTime,
  }) async {
    await isar.writeTxn(() async {
      final source = await getSourceByUrl(sourceUrl);
      if (source != null) {
        source.respondTime = respondTime;
        source.lastUpdateTime = DateTime.now();
        await isar.bookSourceEntitys.put(source);
      }
    });
  }

  /// 统计书源数量
  Future<int> countSources() async {
    return await isar.bookSourceEntitys.count();
  }

  /// 统计启用的书源数量
  Future<int> countEnabledSources() async {
    return await isar.bookSourceEntitys
        .filter()
        .enabledEqualTo(true)
        .count();
  }

  /// 获取所有书源分组
  Future<List<String>> getSourceGroups() async {
    final sources = await getAllSources().findAll();
    final groups = sources
        .map((s) => s.bookSourceGroup)
        .whereType<String>()
        .toSet()
        .toList();
    groups.sort();
    return groups;
  }
}
