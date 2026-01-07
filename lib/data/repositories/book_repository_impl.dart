import 'package:vortex/domain/entities/book.dart';
import '../../domain/repositories/book_repository.dart';
import '../database/database.dart';
import '../database/entities/book_entity.dart';
import '../database/daos/book_dao.dart';

/// 书籍仓储实现
class BookRepositoryImpl implements BookRepository {
  const BookRepositoryImpl();

  BookDao _getDao() => BookDao(IsarDatabase.isar);

  @override
  Future<List<Book>> getAllBooks() async {
    final dao = _getDao();
    final entities = await dao.getAllBooks().findAll();
    return entities.map((e) => _toDomain(e)).toList();
  }

  @override
  Future<Book?> getBookByUrl(String bookUrl) async {
    final dao = _getDao();
    final entity = await dao.getBookByUrl(bookUrl);
    return entity != null ? _toDomain(entity) : null;
  }

  @override
  Future<List<Book>> getReadingBooks({int limit = 10}) async {
    final dao = _getDao();
    final entities = await dao.getReadingBooks(limit: limit).findAll();
    return entities.map((e) => _toDomain(e)).toList();
  }

  @override
  Future<List<Book>> getTopBooks() async {
    final dao = _getDao();
    final entities = await dao.getTopBooks().findAll();
    return entities.map((e) => _toDomain(e)).toList();
  }

  @override
  Future<List<Book>> getBooksByGroup(int group) async {
    final dao = _getDao();
    final entities = await dao.getBooksByGroup(group).findAll();
    return entities.map((e) => _toDomain(e)).toList();
  }

  @override
  Future<List<Book>> searchBooks(String keyword) async {
    final dao = _getDao();
    final entities = await dao.searchBooks(keyword).findAll();
    return entities.map((e) => _toDomain(e)).toList();
  }

  @override
  Future<void> saveBook(Book book) async {
    final dao = _getDao();
    final entity = _toEntity(book);
    await dao.putBook(entity);
  }

  @override
  Future<void> saveBooks(List<Book> books) async {
    final dao = _getDao();
    final entities = books.map(_toEntity).toList();
    await dao.putBooks(entities);
  }

  @override
  Future<bool> deleteBook(String bookUrl) async {
    final dao = _getDao();
    return await dao.deleteBookByUrl(bookUrl);
  }

  @override
  Future<bool> deleteBooks(List<String> bookUrls) async {
    final dao = _getDao();
    final ids = <int>[];
    for (final url in bookUrls) {
      final book = await dao.getBookByUrl(url);
      if (book != null) {
        ids.add(book.id);
      }
    }
    return await dao.deleteBooks(ids);
  }

  @override
  Future<bool> clearAllBooks() async {
    final dao = _getDao();
    return await dao.clearAllBooks();
  }

  @override
  Future<void> updateReadingProgress({
    required String bookUrl,
    required int chapterIndex,
    required int chapterPos,
  }) async {
    final dao = _getDao();
    await dao.updateReadingProgress(
      bookUrl: bookUrl,
      chapterIndex: chapterIndex,
      chapterPos: chapterPos,
    );
  }

  @override
  Future<int> countBooks() async {
    final dao = _getDao();
    return await dao.countBooks();
  }

  // === 私有方法 ===

  /// 实体转领域模型
  Book _toDomain(BookEntity entity) {
    return Book(
      bookUrl: entity.bookUrl,
      name: entity.name,
      author: entity.author,
      intro: entity.intro,
      coverUrl: entity.coverUrl,
      tocUrl: entity.tocUrl,
      origin: entity.origin,
      originName: entity.originName,
      kind: entity.kind,
      wordCount: entity.wordCount,
      latestChapterTitle: entity.latestChapterTitle,
      latestChapterTime: entity.latestChapterTime,
      durChapterIndex: entity.durChapterIndex,
      durChapterPos: entity.durChapterPos,
      durChapterTime: entity.durChapterTime,
      totalChapterCount: entity.totalChapterCount,
      group: entity.group,
      isTop: entity.isTop,
      addTime: entity.addTime,
      updateTime: entity.updateTime,
      lastCheckTime: entity.lastCheckTime,
      order: entity.order,
      isUpdating: entity.isUpdating,
      isComplete: entity.isComplete,
      tags: entity.tags,
      note: entity.note,
    );
  }

  /// 领域模型转实体
  BookEntity _toEntity(Book book) {
    return BookEntity()
      ..bookUrl = book.bookUrl
      ..name = book.name
      ..author = book.author
      ..intro = book.intro
      ..coverUrl = book.coverUrl
      ..tocUrl = book.tocUrl
      ..origin = book.origin
      ..originName = book.originName
      ..kind = book.kind
      ..wordCount = book.wordCount
      ..latestChapterTitle = book.latestChapterTitle
      ..latestChapterTime = book.latestChapterTime
      ..durChapterIndex = book.durChapterIndex
      ..durChapterPos = book.durChapterPos
      ..durChapterTime = book.durChapterTime
      ..totalChapterCount = book.totalChapterCount
      ..group = book.group
      ..isTop = book.isTop
      ..addTime = book.addTime
      ..updateTime = book.updateTime
      ..lastCheckTime = book.lastCheckTime
      ..order = book.order
      ..isUpdating = book.isUpdating
      ..isComplete = book.isComplete
      ..tags = book.tags
      ..note = book.note;
  }
}
