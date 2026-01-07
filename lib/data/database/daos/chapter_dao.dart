import 'package:isar/isar.dart';
import '../entities/chapter_entity.dart';

/// 章节 DAO (Data Access Object)
class ChapterDao {
  const ChapterDao(this.isar);

  final Isar isar;

  /// 查询书籍的所有章节
  Query<ChapterEntity> getChaptersByBook(String bookUrl) {
    return isar.chapterEntitys
        .filter()
        .bookUrlEqualTo(bookUrl)
        .sortByIndex()
        .build();
  }

  /// 根据索引查询章节
  Future<ChapterEntity?> getChapterByIndex({
    required String bookUrl,
    required int index,
  }) async {
    return await isar.chapterEntitys
        .filter()
        .bookUrlEqualTo(bookUrl)
        .and()
        .indexEqualTo(index)
        .findFirst();
  }

  /// 根据 URL 查询章节
  Future<ChapterEntity?> getChapterByUrl(String url) async {
    return await isar.chapterEntitys
        .filter()
        .urlEqualTo(url)
        .findFirst();
  }

  /// 查询下一章
  Future<ChapterEntity?> getNextChapter({
    required String bookUrl,
    required int currentIndex,
  }) async {
    return await isar.chapterEntitys
        .filter()
        .bookUrlEqualTo(bookUrl)
        .and()
        .indexGreaterThan(currentIndex)
        .sortByIndex()
        .findFirst();
  }

  /// 查询上一章
  Future<ChapterEntity?> getPreviousChapter({
    required String bookUrl,
    required int currentIndex,
  }) async {
    return await isar.chapterEntitys
        .filter()
        .bookUrlEqualTo(bookUrl)
        .and()
        .indexLessThan(currentIndex)
        .sortByIndexDesc()
        .findFirst();
  }

  /// 插入或更新章节
  Future<Id> putChapter(ChapterEntity chapter) async {
    return await isar.writeTxn(() async {
      return await isar.chapterEntitys.put(chapter);
    });
  }

  /// 批量插入或更新章节
  Future<int> putChapters(List<ChapterEntity> chapters) async {
    return await isar.writeTxn(() async {
      final ids = await isar.chapterEntitys.putAll(chapters);
      return ids.length;
    });
  }

  /// 删除书籍的所有章节
  Future<bool> deleteChaptersByBook(String bookUrl) async {
    return await isar.writeTxn(() async {
      final count = await isar.chapterEntitys
          .filter()
          .bookUrlEqualTo(bookUrl)
          .deleteAll();
      return count > 0;
    });
  }

  /// 统计书籍的章节数
  Future<int> countChapters(String bookUrl) async {
    return await isar.chapterEntitys
        .filter()
        .bookUrlEqualTo(bookUrl)
        .count();
  }

  /// 查询已缓存的章节
  Query<ChapterEntity> getCachedChapters(String bookUrl) {
    return isar.chapterEntitys
        .filter()
        .bookUrlEqualTo(bookUrl)
        .and()
        .isCachedEqualTo(true)
        .sortByIndex()
        .build();
  }

  /// 更新章节缓存状态
  Future<void> updateChapterCache({
    required String url,
    required bool isCached,
  }) async {
    await isar.writeTxn(() async {
      final chapter = await getChapterByUrl(url);
      if (chapter != null) {
        chapter.isCached = isCached;
        chapter.cacheTime = isCached ? DateTime.now() : null;
        await isar.chapterEntitys.put(chapter);
      }
    });
  }
}
