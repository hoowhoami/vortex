import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';
import 'package:media_kit/media_kit.dart';

import 'core/theme/app_theme.dart';
import 'core/utils/app_localizations.dart';
import 'features/favorites/favorites_screen.dart';
import 'features/home/home_screen.dart';
import 'features/profile/profile_screen.dart';
import 'features/search/search_screen.dart';
import 'models/douban.dart';
import 'services/api_source_service.dart';
import 'services/app_settings_service.dart';
import 'services/config_subscription_service.dart';
import 'services/douban_service.dart';
import 'services/favorites_service.dart';
import 'services/site_config_service.dart';
import 'services/video_service.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  MediaKit.ensureInitialized();

  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Colors.black,
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );

  runApp(const LuminaApp());
}

class LuminaApp extends StatelessWidget {
  const LuminaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider<AppSettingsService>(
          create: (_) => AppSettingsService(),
        ),
        ChangeNotifierProvider<ApiSourceService>(
          create: (_) => ApiSourceService(),
        ),
        ChangeNotifierProvider<ConfigSubscriptionService>(
          create: (_) => ConfigSubscriptionService(),
        ),
        ChangeNotifierProvider<SiteConfigService>(
          create: (_) => SiteConfigService(),
        ),
        Provider<FavoritesService>(
          create: (_) => FavoritesService(),
        ),
        ProxyProvider<SiteConfigService, DoubanService>(
          create: (context) => DoubanService(
            proxyConfig: context.read<SiteConfigService>().getDoubanProxyConfig(),
          ),
          update: (context, siteConfig, previous) {
            if (previous != null) {
              // Reuse existing instance and update config
              previous.updateProxyConfig(siteConfig.getDoubanProxyConfig());
              return previous;
            }
            return DoubanService(
              proxyConfig: siteConfig.getDoubanProxyConfig(),
            );
          },
          dispose: (_, service) => service.dispose(),
        ),
        ChangeNotifierProxyProvider<ApiSourceService, VideoService>(
          create: (context) => VideoService(
            apiSourceService: context.read<ApiSourceService>(),
          ),
          update: (context, apiSourceService, previous) =>
              previous ?? VideoService(apiSourceService: apiSourceService),
        ),
      ],
      child: Consumer<AppSettingsService>(
        builder: (context, settings, _) {
          return MaterialApp(
            title: 'Lumina',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.lightTheme,
            darkTheme: AppTheme.darkTheme,
            themeMode: settings.flutterThemeMode,
            locale: settings.locale,
            localizationsDelegates: const [
              AppLocalizations.delegate,
              GlobalMaterialLocalizations.delegate,
              GlobalWidgetsLocalizations.delegate,
              GlobalCupertinoLocalizations.delegate,
            ],
            supportedLocales: const [
              Locale('zh', ''),
              Locale('en', ''),
            ],
            home: const MainScreen(),
          );
        },
      ),
    );
  }
}

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    HomeScreen(),
    SearchScreen(),
    FavoritesScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final loc = AppLocalizations.of(context);

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: SafeArea(
        child: Container(
          decoration: BoxDecoration(
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.3),
                blurRadius: 10,
                offset: const Offset(0, -2),
              ),
            ],
          ),
          child: BottomNavigationBar(
            currentIndex: _currentIndex,
            onTap: (index) {
              setState(() {
                _currentIndex = index;
              });
            },
            items: [
              BottomNavigationBarItem(
                icon: const Icon(Icons.home_rounded),
                activeIcon: const Icon(Icons.home_rounded),
                label: loc.home,
              ),
              BottomNavigationBarItem(
                icon: const Icon(Icons.search_rounded),
                activeIcon: const Icon(Icons.search_rounded),
                label: loc.search,
              ),
              BottomNavigationBarItem(
                icon: const Icon(Icons.favorite_rounded),
                activeIcon: const Icon(Icons.favorite_rounded),
                label: loc.favorites,
              ),
              BottomNavigationBarItem(
                icon: const Icon(Icons.person_rounded),
                activeIcon: const Icon(Icons.person_rounded),
                label: loc.profile,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
