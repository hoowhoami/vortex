import 'package:vortex/domain/entities/book.dart';

/// 书籍仓储接口
abstract class BookRepository {
  /// 获取所有书籍
  Future<List<Book>> getAllBooks();

  /// 根据 URL 获取书籍
  Future<Book?> getBookByUrl(String bookUrl);

  /// 获取正在阅读的书籍
  Future<List<Book>> getReadingBooks({int limit = 10});

  /// 获取置顶书籍
  Future<List<Book>> getTopBooks();

  /// 按分组获取书籍
  Future<List<Book>> getBooksByGroup(int group);

  /// 搜索书籍
  Future<List<Book>> searchBooks(String keyword);

  /// 添加或更新书籍
  Future<void> saveBook(Book book);

  /// 批量添加或更新书籍
  Future<void> saveBooks(List<Book> books);

  /// 删除书籍
  Future<bool> deleteBook(String bookUrl);

  /// 批量删除书籍
  Future<bool> deleteBooks(List<String> bookUrls);

  /// 清空所有书籍
  Future<bool> clearAllBooks();

  /// 更新阅读进度
  Future<void> updateReadingProgress({
    required String bookUrl,
    required int chapterIndex,
    required int chapterPos,
  });

  /// 统计书籍数量
  Future<int> countBooks();
}
