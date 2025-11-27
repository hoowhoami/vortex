class AppConstants {
  AppConstants._();

  // App Info
  static const String appName = 'Lumina';
  static const String appVersion = '1.0.0';

  // Spacing
  static const double spacingXs = 4;
  static const double spacingSm = 8;
  static const double spacingMd = 16;
  static const double spacingLg = 24;
  static const double spacingXl = 32;
  static const double spacingXxl = 48;

  // Border Radius
  static const double radiusSm = 8;
  static const double radiusMd = 12;
  static const double radiusLg = 16;
  static const double radiusXl = 24;
  static const double radiusFull = 999;

  // Icon Sizes
  static const double iconSizeSm = 16;
  static const double iconSizeMd = 24;
  static const double iconSizeLg = 32;
  static const double iconSizeXl = 48;

  // Animation Durations
  static const Duration animationFast = Duration(milliseconds: 200);
  static const Duration animationNormal = Duration(milliseconds: 300);
  static const Duration animationSlow = Duration(milliseconds: 500);

  // Video/Movie Card Dimensions
  static const double movieCardWidth = 140;
  static const double movieCardHeight = 210;
  static const double movieCardAspectRatio = 2 / 3;

  // Featured Card Dimensions
  static const double featuredCardHeight = 400;
  static const double featuredCardAspectRatio = 16 / 9;

  // Video API Configuration (Apple CMS V10 Format)
  // Reference: https://github.com/MoonTechLab/LunaTV
  static const String defaultVideoApiUrl = '';
  static const int videoApiTimeout = 30; // seconds
  static const int videoCacheTime = 7200; // seconds (2 hours)

  // Multi-source API configuration
  // You can configure multiple video sources in a JSON file
  // Example format:
  // {
  //   "cache_time": 7200,
  //   "api_site": {
  //     "source1": {
  //       "api": "https://api.example.com/api.php/provide/vod",
  //       "name": "Example Source",
  //       "detail": "https://api.example.com"
  //     }
  //   }
  // }

  // Grid Settings
  static const int gridCrossAxisCount = 2;
  static const double gridChildAspectRatio = 0.65;
  static const double gridSpacing = 12;

  // Pagination
  static const int itemsPerPage = 20;
  static const int maxCacheSize = 100;
}
