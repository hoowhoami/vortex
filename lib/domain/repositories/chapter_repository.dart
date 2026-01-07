import 'package:vortex/domain/entities/chapter.dart';

/// 章节仓储接口
abstract class ChapterRepository {
  /// 获取书籍的所有章节
  Future<List<Chapter>> getChaptersByBook(String bookUrl);

  /// 根据索引获取章节
  Future<Chapter?> getChapterByIndex({
    required String bookUrl,
    required int index,
  });

  /// 根据 URL 获取章节
  Future<Chapter?> getChapterByUrl(String url);

  /// 获取下一章
  Future<Chapter?> getNextChapter({
    required String bookUrl,
    required int currentIndex,
  });

  /// 获取上一章
  Future<Chapter?> getPreviousChapter({
    required String bookUrl,
    required int currentIndex,
  });

  /// 添加或更新章节
  Future<void> saveChapter(Chapter chapter);

  /// 批量添加或更新章节
  Future<void> saveChapters(List<Chapter> chapters);

  /// 删除书籍的所有章节
  Future<bool> deleteChaptersByBook(String bookUrl);

  /// 统计书籍的章节数
  Future<int> countChapters(String bookUrl);

  /// 获取已缓存的章节
  Future<List<Chapter>> getCachedChapters(String bookUrl);

  /// 更新章节缓存状态
  Future<void> updateChapterCache({
    required String url,
    required bool isCached,
  });
}
