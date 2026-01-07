import 'package:isar/isar.dart';
import '../entities/book_entity.dart';

/// 书籍 DAO (Data Access Object)
class BookDao {
  const BookDao(this.isar);

  final Isar isar;

  /// 查询所有书籍
  Query<BookEntity> getAllBooks() {
    return isar.bookEntitys
        .where()
        .sortByAddTime()
        .build();
  }

  /// 根据 ID 查询书籍
  Future<BookEntity?> getBookById(Id id) async {
    return await isar.bookEntitys.get(id);
  }

  /// 根据 URL 查询书籍
  Future<BookEntity?> getBookByUrl(String bookUrl) async {
    return await isar.bookEntitys
        .filter()
        .bookUrlEqualTo(bookUrl)
        .findFirst();
  }

  /// 查询正在阅读的书籍
  Query<BookEntity> getReadingBooks({
    int limit = 10,
  }) {
    return isar.bookEntitys
        .where()
        .sortByDurChapterTime()
        .build();
  }

  /// 查询置顶书籍
  Query<BookEntity> getTopBooks() {
    return isar.bookEntitys
        .filter()
        .isTopEqualTo(true)
        .sortByAddTime()
        .build();
  }

  /// 按分组查询书籍
  Query<BookEntity> getBooksByGroup(int group) {
    return isar.bookEntitys
        .filter()
        .groupEqualTo(group)
        .sortByAddTime()
        .build();
  }

  /// 搜索书籍 (按书名或作者)
  Query<BookEntity> searchBooks(String keyword) {
    return isar.bookEntitys
        .filter()
        .group((q) => q.nameContains(keyword, caseSensitive: false))
        .or()
        .group((q) => q.authorContains(keyword, caseSensitive: false))
        .sortByAddTime()
        .build();
  }

  /// 插入或更新书籍
  Future<Id> putBook(BookEntity book) async {
    return await isar.writeTxn(() async {
      return await isar.bookEntitys.put(book);
    });
  }

  /// 批量插入或更新书籍
  Future<int> putBooks(List<BookEntity> books) async {
    return await isar.writeTxn(() async {
      final ids = await isar.bookEntitys.putAll(books);
      return ids.length;
    });
  }

  /// 删除书籍
  Future<bool> deleteBook(Id id) async {
    return await isar.writeTxn(() async {
      return await isar.bookEntitys.delete(id);
    });
  }

  /// 批量删除书籍
  Future<bool> deleteBooks(List<Id> ids) async {
    return await isar.writeTxn(() async {
      final count = await isar.bookEntitys.deleteAll(ids);
      return count > 0;
    });
  }

  /// 根据 URL 删除书籍
  Future<bool> deleteBookByUrl(String bookUrl) async {
    final book = await getBookByUrl(bookUrl);
    if (book == null) return false;
    return await deleteBook(book.id);
  }

  /// 清空所有书籍
  Future<bool> clearAllBooks() async {
    return await isar.writeTxn(() async {
      await isar.bookEntitys.clear();
      return true;
    });
  }

  /// 更新阅读进度
  Future<void> updateReadingProgress({
    required String bookUrl,
    required int chapterIndex,
    required int chapterPos,
  }) async {
    await isar.writeTxn(() async {
      final book = await getBookByUrl(bookUrl);
      if (book != null) {
        book.durChapterIndex = chapterIndex;
        book.durChapterPos = chapterPos;
        book.durChapterTime = DateTime.now();
        await isar.bookEntitys.put(book);
      }
    });
  }

  /// 统计书籍数量
  Future<int> countBooks() async {
    return await isar.bookEntitys.count();
  }
}
