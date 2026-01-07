// Vortex Widget Tests

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:vortex/main.dart';

void main() {
  testWidgets('App loads successfully', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const ProviderScope(child: VortexApp()));

    // Verify that the app loads with the title
    expect(find.text('Vortex'), findsWidgets);

    // Verify bottom navigation exists
    expect(find.byType(NavigationBar), findsOneWidget);

    // Verify navigation destinations
    expect(find.text('书架'), findsOneWidget);
    expect(find.text('发现'), findsOneWidget);
    expect(find.text('我的'), findsOneWidget);
  });

  testWidgets('Theme system works', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: VortexApp()));

    // Verify Material 3 is being used
    final MaterialApp app = tester.widget(find.byType(MaterialApp));
    expect(app.theme?.useMaterial3, isTrue);
    expect(app.darkTheme?.useMaterial3, isTrue);
  });
}
