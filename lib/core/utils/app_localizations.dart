import 'package:flutter/material.dart';
import '../constants/app_strings.dart';

class AppLocalizations {

  AppLocalizations(this.locale);
  final Locale locale;

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  static final Map<String, Map<String, String>> _localizedValues = {
    'en': {
      AppStrings.home: 'Home',
      AppStrings.search: 'Search',
      AppStrings.favorites: 'Favorites',
      AppStrings.profile: 'Profile',
      AppStrings.trendingNow: 'Trending Now',
      AppStrings.popular: 'Popular',
      AppStrings.topRated: 'Top Rated',
      AppStrings.nowPlaying: 'Now Playing',
      AppStrings.seeAll: 'See All',
      AppStrings.searchMovies: 'Search',
      AppStrings.searchForMovies: 'Search movies...',
      AppStrings.findYourFavorite: 'Find your favorite movies by title',
      AppStrings.noResultsFound: 'No Results Found',
      AppStrings.tryDifferentKeywords: 'Try searching with different keywords',
      AppStrings.noFavoritesYet: 'No Favorites Yet',
      AppStrings.startAddingMovies:
          'Start adding movies to your favorites\nto see them here',
      AppStrings.movies: 'movies',
      AppStrings.movie: 'movie',
      AppStrings.movieEnthusiast: 'Movie Enthusiast',
      AppStrings.exploringCinema: 'Exploring the world of cinema',
      AppStrings.watched: 'Watched',
      AppStrings.reviews: 'Reviews',
      AppStrings.editProfile: 'Edit Profile',
      AppStrings.notifications: 'Notifications',
      AppStrings.language: 'Language',
      AppStrings.appearance: 'Appearance',
      AppStrings.helpSupport: 'Help & Support',
      AppStrings.privacyPolicy: 'Privacy Policy',
      AppStrings.termsOfService: 'Terms of Service',
      AppStrings.about: 'About',
      AppStrings.version: 'Version',
      AppStrings.settings: 'Settings',
      AppStrings.lightMode: 'Light',
      AppStrings.darkMode: 'Dark',
      AppStrings.systemDefault: 'System',
      AppStrings.overview: 'Overview',
      AppStrings.movieInfo: 'Movie Info',
      AppStrings.releaseDate: 'Release Date',
      AppStrings.popularity: 'Popularity',
      AppStrings.voteCount: 'Vote Count',
      AppStrings.play: 'Play',
      AppStrings.watchlist: 'Watchlist',
      AppStrings.addedToFavorites: 'Added to favorites',
      AppStrings.removedFromFavorites: 'Removed from favorites',
      AppStrings.english: 'English',
      AppStrings.chinese: '简体中文',
      AppStrings.videos: 'Videos',
      AppStrings.video: 'Video',
      AppStrings.tvShows: 'TV Shows',
      AppStrings.tvShow: 'TV Show',
      AppStrings.episodes: 'Episodes',
      AppStrings.episode: 'Episode',
      AppStrings.seasons: 'Seasons',
      AppStrings.season: 'Season',
      AppStrings.director: 'Director',
      AppStrings.cast: 'Cast',
      AppStrings.genre: 'Genre',
      AppStrings.duration: 'Duration',
      AppStrings.year: 'Year',
      AppStrings.area: 'Region',
      AppStrings.rating: 'Rating',
      AppStrings.updated: 'Updated',
      AppStrings.completed: 'Completed',
      AppStrings.ongoing: 'Ongoing',
      AppStrings.latest: 'Latest',
      AppStrings.recommended: 'Recommended',
      AppStrings.categories: 'Categories',
      AppStrings.allCategories: 'All Categories',
      AppStrings.filter: 'Filter',
      AppStrings.sortBy: 'Sort By',
      AppStrings.playNow: 'Play Now',
      AppStrings.trailer: 'Trailer',
      AppStrings.selectEpisode: 'Select Episode',
      AppStrings.selectSource: 'Select Source',
      AppStrings.loading: 'Loading...',
      AppStrings.loadMore: 'Load More',
      AppStrings.noMoreContent: 'No more content',
      AppStrings.retry: 'Retry',
      AppStrings.error: 'Error',
      AppStrings.networkError: 'Network Error',
      AppStrings.searchVideos: 'Search Videos',
      AppStrings.searchForVideos: 'Search videos...',
      AppStrings.apiSourceManagement: 'API Source Management',
      AppStrings.addSource: 'Add Source',
      AppStrings.editSource: 'Edit Source',
      AppStrings.deleteSource: 'Delete Source',
      AppStrings.sourceName: 'Source Name',
      AppStrings.sourceNameHint: 'e.g., My Video Source',
      AppStrings.apiUrl: 'API URL',
      AppStrings.detailUrl: 'Detail URL',
      AppStrings.optional: 'Optional',
      AppStrings.active: 'Active',
      AppStrings.defaultSource: 'Default',
      AppStrings.testConnection: 'Test Connection',
      AppStrings.connectionSuccessful: 'Connection successful!',
      AppStrings.connectionFailed: 'Connection failed',
      AppStrings.importConfig: 'Import Config',
      AppStrings.exportConfig: 'Export Config',
      AppStrings.importConfigDescription: 'Paste your JSON configuration below (LunaTV format supported)',
      AppStrings.exportConfigDescription: 'Copy this configuration to backup or share',
      AppStrings.configJson: 'Configuration JSON',
      AppStrings.import_: 'Import',
      AppStrings.importSuccessful: 'Configuration imported successfully',
      AppStrings.importFailed: 'Import failed',
      AppStrings.copiedToClipboard: 'Copied to clipboard',
      AppStrings.resetToDefaults: 'Reset to Defaults',
      AppStrings.resetToDefaultsConfirm: 'This will remove all custom sources and restore defaults. Continue?',
      AppStrings.resetSuccessful: 'Reset to defaults successfully',
      AppStrings.noApiSources: 'No API Sources',
      AppStrings.addSourceToGetStarted: 'Add a source to get started',
      AppStrings.sourceActivated: 'Source activated: %s',
      AppStrings.sourceAdded: 'Source added successfully',
      AppStrings.sourceUpdated: 'Source updated successfully',
      AppStrings.sourceDeleted: 'Source deleted successfully',
      AppStrings.deleteSourceConfirm: 'Delete source "%s"?',
      AppStrings.pleaseEnterSourceName: 'Please enter source name',
      AppStrings.pleaseEnterApiUrl: 'Please enter API URL',
      AppStrings.invalidUrl: 'Invalid URL format',
      AppStrings.cancel: 'Cancel',
      AppStrings.save: 'Save',
      AppStrings.add: 'Add',
      AppStrings.delete: 'Delete',
      AppStrings.edit: 'Edit',
      AppStrings.close: 'Close',
      AppStrings.copy: 'Copy',
      AppStrings.reset: 'Reset',
    },
    'zh': {
      AppStrings.home: '首页',
      AppStrings.search: '搜索',
      AppStrings.favorites: '收藏',
      AppStrings.profile: '我的',
      AppStrings.trendingNow: '热门趋势',
      AppStrings.popular: '流行电影',
      AppStrings.topRated: '高分电影',
      AppStrings.nowPlaying: '正在热映',
      AppStrings.seeAll: '查看全部',
      AppStrings.searchMovies: '搜索',
      AppStrings.searchForMovies: '搜索电影...',
      AppStrings.findYourFavorite: '通过标题查找你喜欢的电影',
      AppStrings.noResultsFound: '未找到结果',
      AppStrings.tryDifferentKeywords: '尝试使用不同的关键词搜索',
      AppStrings.noFavoritesYet: '暂无收藏',
      AppStrings.startAddingMovies: '开始添加你喜欢的电影\n到收藏夹吧',
      AppStrings.movies: '部电影',
      AppStrings.movie: '部电影',
      AppStrings.movieEnthusiast: '电影爱好者',
      AppStrings.exploringCinema: '探索电影的世界',
      AppStrings.watched: '已观看',
      AppStrings.reviews: '评论',
      AppStrings.editProfile: '编辑资料',
      AppStrings.notifications: '通知',
      AppStrings.language: '语言',
      AppStrings.appearance: '外观',
      AppStrings.helpSupport: '帮助与支持',
      AppStrings.privacyPolicy: '隐私政策',
      AppStrings.termsOfService: '服务条款',
      AppStrings.about: '关于',
      AppStrings.version: '版本',
      AppStrings.settings: '设置',
      AppStrings.lightMode: '浅色',
      AppStrings.darkMode: '深色',
      AppStrings.systemDefault: '跟随系统',
      AppStrings.overview: '简介',
      AppStrings.movieInfo: '影片信息',
      AppStrings.releaseDate: '上映日期',
      AppStrings.popularity: '热度',
      AppStrings.voteCount: '评分人数',
      AppStrings.play: '播放',
      AppStrings.watchlist: '想看',
      AppStrings.addedToFavorites: '已添加到收藏',
      AppStrings.removedFromFavorites: '已从收藏中移除',
      AppStrings.english: 'English',
      AppStrings.chinese: '简体中文',
      AppStrings.videos: '视频',
      AppStrings.video: '视频',
      AppStrings.tvShows: '电视剧',
      AppStrings.tvShow: '电视剧',
      AppStrings.episodes: '集数',
      AppStrings.episode: '集',
      AppStrings.seasons: '季',
      AppStrings.season: '季',
      AppStrings.director: '导演',
      AppStrings.cast: '演员',
      AppStrings.genre: '类型',
      AppStrings.duration: '时长',
      AppStrings.year: '年份',
      AppStrings.area: '地区',
      AppStrings.rating: '评分',
      AppStrings.updated: '更新',
      AppStrings.completed: '已完结',
      AppStrings.ongoing: '连载中',
      AppStrings.latest: '最新',
      AppStrings.recommended: '推荐',
      AppStrings.categories: '分类',
      AppStrings.allCategories: '全部分类',
      AppStrings.filter: '筛选',
      AppStrings.sortBy: '排序',
      AppStrings.playNow: '立即播放',
      AppStrings.trailer: '预告片',
      AppStrings.selectEpisode: '选择集数',
      AppStrings.selectSource: '选择播放源',
      AppStrings.loading: '加载中...',
      AppStrings.loadMore: '加载更多',
      AppStrings.noMoreContent: '没有更多内容了',
      AppStrings.retry: '重试',
      AppStrings.error: '错误',
      AppStrings.networkError: '网络错误',
      AppStrings.searchVideos: '搜索视频',
      AppStrings.searchForVideos: '搜索视频...',
      AppStrings.apiSourceManagement: 'API 源管理',
      AppStrings.addSource: '添加源',
      AppStrings.editSource: '编辑源',
      AppStrings.deleteSource: '删除源',
      AppStrings.sourceName: '源名称',
      AppStrings.sourceNameHint: '例如：我的视频源',
      AppStrings.apiUrl: 'API 地址',
      AppStrings.detailUrl: '详情地址',
      AppStrings.optional: '可选',
      AppStrings.active: '使用中',
      AppStrings.defaultSource: '默认',
      AppStrings.testConnection: '测试连接',
      AppStrings.connectionSuccessful: '连接成功！',
      AppStrings.connectionFailed: '连接失败',
      AppStrings.importConfig: '导入配置',
      AppStrings.exportConfig: '导出配置',
      AppStrings.importConfigDescription: '粘贴你的 JSON 配置（支持 LunaTV 格式）',
      AppStrings.exportConfigDescription: '复制此配置以备份或分享',
      AppStrings.configJson: '配置 JSON',
      AppStrings.import_: '导入',
      AppStrings.importSuccessful: '配置导入成功',
      AppStrings.importFailed: '导入失败',
      AppStrings.copiedToClipboard: '已复制到剪贴板',
      AppStrings.resetToDefaults: '恢复默认',
      AppStrings.resetToDefaultsConfirm: '这将删除所有自定义源并恢复默认设置。是否继续？',
      AppStrings.resetSuccessful: '已恢复默认设置',
      AppStrings.noApiSources: '暂无 API 源',
      AppStrings.addSourceToGetStarted: '添加一个源以开始使用',
      AppStrings.sourceActivated: '已激活源：%s',
      AppStrings.sourceAdded: '源添加成功',
      AppStrings.sourceUpdated: '源更新成功',
      AppStrings.sourceDeleted: '源删除成功',
      AppStrings.deleteSourceConfirm: '删除源"%s"？',
      AppStrings.pleaseEnterSourceName: '请输入源名称',
      AppStrings.pleaseEnterApiUrl: '请输入 API 地址',
      AppStrings.invalidUrl: 'URL 格式无效',
      AppStrings.cancel: '取消',
      AppStrings.save: '保存',
      AppStrings.add: '添加',
      AppStrings.delete: '删除',
      AppStrings.edit: '编辑',
      AppStrings.close: '关闭',
      AppStrings.copy: '复制',
      AppStrings.reset: '重置',
    },
  };

  String translate(String key) {
    return _localizedValues[locale.languageCode]?[key] ?? key;
  }

  String get home => translate(AppStrings.home);
  String get search => translate(AppStrings.search);
  String get favorites => translate(AppStrings.favorites);
  String get profile => translate(AppStrings.profile);
  String get trendingNow => translate(AppStrings.trendingNow);
  String get popular => translate(AppStrings.popular);
  String get topRated => translate(AppStrings.topRated);
  String get nowPlaying => translate(AppStrings.nowPlaying);
  String get seeAll => translate(AppStrings.seeAll);
  String get searchMovies => translate(AppStrings.searchMovies);
  String get searchForMovies => translate(AppStrings.searchForMovies);
  String get findYourFavorite => translate(AppStrings.findYourFavorite);
  String get noResultsFound => translate(AppStrings.noResultsFound);
  String get tryDifferentKeywords => translate(AppStrings.tryDifferentKeywords);
  String get noFavoritesYet => translate(AppStrings.noFavoritesYet);
  String get startAddingMovies => translate(AppStrings.startAddingMovies);
  String get movies => translate(AppStrings.movies);
  String get movie => translate(AppStrings.movie);
  String get movieEnthusiast => translate(AppStrings.movieEnthusiast);
  String get exploringCinema => translate(AppStrings.exploringCinema);
  String get watched => translate(AppStrings.watched);
  String get reviews => translate(AppStrings.reviews);
  String get editProfile => translate(AppStrings.editProfile);
  String get notifications => translate(AppStrings.notifications);
  String get language => translate(AppStrings.language);
  String get appearance => translate(AppStrings.appearance);
  String get helpSupport => translate(AppStrings.helpSupport);
  String get privacyPolicy => translate(AppStrings.privacyPolicy);
  String get termsOfService => translate(AppStrings.termsOfService);
  String get about => translate(AppStrings.about);
  String get version => translate(AppStrings.version);
  String get settings => translate(AppStrings.settings);
  String get lightMode => translate(AppStrings.lightMode);
  String get darkMode => translate(AppStrings.darkMode);
  String get systemDefault => translate(AppStrings.systemDefault);
  String get overview => translate(AppStrings.overview);
  String get movieInfo => translate(AppStrings.movieInfo);
  String get releaseDate => translate(AppStrings.releaseDate);
  String get popularity => translate(AppStrings.popularity);
  String get voteCount => translate(AppStrings.voteCount);
  String get play => translate(AppStrings.play);
  String get watchlist => translate(AppStrings.watchlist);
  String get addedToFavorites => translate(AppStrings.addedToFavorites);
  String get removedFromFavorites => translate(AppStrings.removedFromFavorites);
  String get english => translate(AppStrings.english);
  String get chinese => translate(AppStrings.chinese);
  String get videos => translate(AppStrings.videos);
  String get video => translate(AppStrings.video);
  String get tvShows => translate(AppStrings.tvShows);
  String get tvShow => translate(AppStrings.tvShow);
  String get episodes => translate(AppStrings.episodes);
  String get episode => translate(AppStrings.episode);
  String get seasons => translate(AppStrings.seasons);
  String get season => translate(AppStrings.season);
  String get director => translate(AppStrings.director);
  String get cast => translate(AppStrings.cast);
  String get genre => translate(AppStrings.genre);
  String get duration => translate(AppStrings.duration);
  String get year => translate(AppStrings.year);
  String get area => translate(AppStrings.area);
  String get rating => translate(AppStrings.rating);
  String get updated => translate(AppStrings.updated);
  String get completed => translate(AppStrings.completed);
  String get ongoing => translate(AppStrings.ongoing);
  String get latest => translate(AppStrings.latest);
  String get recommended => translate(AppStrings.recommended);
  String get categories => translate(AppStrings.categories);
  String get allCategories => translate(AppStrings.allCategories);
  String get filter => translate(AppStrings.filter);
  String get sortBy => translate(AppStrings.sortBy);
  String get playNow => translate(AppStrings.playNow);
  String get trailer => translate(AppStrings.trailer);
  String get selectEpisode => translate(AppStrings.selectEpisode);
  String get selectSource => translate(AppStrings.selectSource);
  String get loading => translate(AppStrings.loading);
  String get loadMore => translate(AppStrings.loadMore);
  String get noMoreContent => translate(AppStrings.noMoreContent);
  String get retry => translate(AppStrings.retry);
  String get error => translate(AppStrings.error);
  String get networkError => translate(AppStrings.networkError);
  String get searchVideos => translate(AppStrings.searchVideos);
  String get searchForVideos => translate(AppStrings.searchForVideos);
  String get apiSourceManagement => translate(AppStrings.apiSourceManagement);
  String get addSource => translate(AppStrings.addSource);
  String get editSource => translate(AppStrings.editSource);
  String get deleteSource => translate(AppStrings.deleteSource);
  String get sourceName => translate(AppStrings.sourceName);
  String get sourceNameHint => translate(AppStrings.sourceNameHint);
  String get apiUrl => translate(AppStrings.apiUrl);
  String get detailUrl => translate(AppStrings.detailUrl);
  String get optional => translate(AppStrings.optional);
  String get active => translate(AppStrings.active);
  String get defaultSource => translate(AppStrings.defaultSource);
  String get testConnection => translate(AppStrings.testConnection);
  String get connectionSuccessful => translate(AppStrings.connectionSuccessful);
  String get connectionFailed => translate(AppStrings.connectionFailed);
  String get importConfig => translate(AppStrings.importConfig);
  String get exportConfig => translate(AppStrings.exportConfig);
  String get importConfigDescription => translate(AppStrings.importConfigDescription);
  String get exportConfigDescription => translate(AppStrings.exportConfigDescription);
  String get configJson => translate(AppStrings.configJson);
  String get import_ => translate(AppStrings.import_);
  String get importSuccessful => translate(AppStrings.importSuccessful);
  String get importFailed => translate(AppStrings.importFailed);
  String get copiedToClipboard => translate(AppStrings.copiedToClipboard);
  String get resetToDefaults => translate(AppStrings.resetToDefaults);
  String get resetToDefaultsConfirm => translate(AppStrings.resetToDefaultsConfirm);
  String get resetSuccessful => translate(AppStrings.resetSuccessful);
  String get noApiSources => translate(AppStrings.noApiSources);
  String get addSourceToGetStarted => translate(AppStrings.addSourceToGetStarted);
  String sourceActivated(String name) => translate(AppStrings.sourceActivated).replaceAll('%s', name);
  String get sourceAdded => translate(AppStrings.sourceAdded);
  String get sourceUpdated => translate(AppStrings.sourceUpdated);
  String get sourceDeleted => translate(AppStrings.sourceDeleted);
  String deleteSourceConfirm(String name) => translate(AppStrings.deleteSourceConfirm).replaceAll('%s', name);
  String get pleaseEnterSourceName => translate(AppStrings.pleaseEnterSourceName);
  String get pleaseEnterApiUrl => translate(AppStrings.pleaseEnterApiUrl);
  String get invalidUrl => translate(AppStrings.invalidUrl);
  String get cancel => translate(AppStrings.cancel);
  String get save => translate(AppStrings.save);
  String get add => translate(AppStrings.add);
  String get delete => translate(AppStrings.delete);
  String get edit => translate(AppStrings.edit);
  String get close => translate(AppStrings.close);
  String get copy => translate(AppStrings.copy);
  String get reset => translate(AppStrings.reset);
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) {
    return ['en', 'zh'].contains(locale.languageCode);
  }

  @override
  Future<AppLocalizations> load(Locale locale) async {
    return AppLocalizations(locale);
  }

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}
