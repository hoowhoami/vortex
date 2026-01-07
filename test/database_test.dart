import 'package:flutter_test/flutter_test.dart';
import 'package:vortex/data/database/database.dart';
import 'package:vortex/data/database/entities/book_entity.dart';

void main() {
  group('Database Tests', () {
    testWidgets('Database can be initialized', (tester) async {
      // 测试数据库初始化
      await IsarDatabase.init();
      expect(IsarDatabase.isar, isNotNull);
      print('✅ Database initialized successfully');
    });

    test('BookEntity can be created', () {
      // 测试 BookEntity 创建
      final book = BookEntity()
        ..bookUrl = 'https://example.com/book1'
        ..name = '测试书籍'
        ..author = '测试作者'
        ..addTime = DateTime.now();

      expect(book.bookUrl, 'https://example.com/book1');
      expect(book.name, '测试书籍');
      expect(book.author, '测试作者');
      print('✅ BookEntity created successfully');
    });
  });
}
