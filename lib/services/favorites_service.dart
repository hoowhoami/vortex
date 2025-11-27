import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../models/video.dart';

/// Service for managing favorites
class FavoritesService {
  static const String _videoFavoritesKey = 'video_favorites';

  // Video favorites methods
  Future<List<Video>> getVideoFavorites() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final favoritesJson = prefs.getStringList(_videoFavoritesKey) ?? [];
      return favoritesJson
          .map((json) => Video.fromJson(jsonDecode(json)))
          .toList();
    } catch (e) {
      return [];
    }
  }

  Future<bool> addVideoFavorite(Video video) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final favorites = await getVideoFavorites();

      if (!favorites.any((v) => v.id == video.id)) {
        favorites.add(video);
        final favoritesJson =
            favorites.map((v) => jsonEncode(v.toJson())).toList();
        return await prefs.setStringList(_videoFavoritesKey, favoritesJson);
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  Future<bool> removeVideoFavorite(int videoId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final favorites = await getVideoFavorites();
      favorites.removeWhere((v) => v.id == videoId);
      final favoritesJson =
          favorites.map((v) => jsonEncode(v.toJson())).toList();
      return await prefs.setStringList(_videoFavoritesKey, favoritesJson);
    } catch (e) {
      return false;
    }
  }

  Future<bool> isVideoFavorite(int videoId) async {
    final favorites = await getVideoFavorites();
    return favorites.any((v) => v.id == videoId);
  }

  Future<bool> toggleVideoFavorite(Video video) async {
    final isFav = await isVideoFavorite(video.id);
    if (isFav) {
      return removeVideoFavorite(video.id);
    } else {
      return addVideoFavorite(video);
    }
  }
}
