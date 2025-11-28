import 'package:flutter/foundation.dart';
import '../models/video.dart';
import 'video_service.dart';

/// Episode model for video playback
class Episode {
  Episode({
    required this.name,
    required this.url,
  });
  final String name;
  final String url;
}

/// Manages video source searching and play info parsing
class VideoSourceManager {
  VideoSourceManager(this._videoService);

  final VideoService _videoService;

  /// Search for video across all sources
  Future<Map<String, Video>> searchVideoSources(String videoName) async {
    return await _videoService.searchVideoAcrossSources(videoName);
  }

  /// Parse play sources and episodes from a video
  VideoPlayInfo parsePlayInfo(Video video) {
    final playSources = <String>[];
    final episodes = <List<Episode>>[];

    if (video.playFrom != null && video.playUrl != null) {
      // Parse play sources (e.g., "m3u8$$$mp4")
      final playSourceList = video.playFrom!
          .split(r'$$$')
          .map((e) => e.trim())
          .where((e) => e.isNotEmpty)
          .toList();

      // Parse play URLs
      final playUrlGroups = video.playUrl!
          .split(r'$$$')
          .map((e) => e.trim())
          .where((e) => e.isNotEmpty)
          .toList();

      for (var i = 0; i < playUrlGroups.length; i++) {
        final group = playUrlGroups[i];
        final episodeList = <Episode>[];
        final eps = group.split('#').where((e) => e.isNotEmpty);

        for (final ep in eps) {
          final parts = ep.split(r'$');
          if (parts.length >= 2) {
            final episodeUrl = parts[1];

            // Filter out invalid URLs
            if (!_isValidPlayUrl(episodeUrl)) {
              continue;
            }

            episodeList.add(Episode(
              name: parts[0],
              url: episodeUrl,
            ));
          }
        }

        if (episodeList.isNotEmpty) {
          episodes.add(episodeList);
          // Only add play source if we have episodes for it
          if (i < playSourceList.length) {
            playSources.add(playSourceList[i]);
          }
        }
      }
    }

    return VideoPlayInfo(
      playSources: playSources,
      episodes: episodes,
    );
  }

  /// Check if a URL is a valid playable URL
  bool _isValidPlayUrl(String url) {
    if (url.isEmpty) return false;

    // Check if URL contains valid video formats
    final validFormats = ['.m3u8', '.mp4', '.flv', '.avi', '.mkv', '.ts'];
    return validFormats.any((format) => url.toLowerCase().contains(format));
  }

  /// Get play sources as a list for bottom sheet display
  List<PlaySource> getPlaySourcesForBottomSheet(Video video) {
    final playFromList = video.playFrom?.split(r'$$$') ?? [];
    final playUrlList = video.playUrl?.split(r'$$$') ?? [];

    final playSources = <PlaySource>[];

    for (var i = 0; i < playFromList.length && i < playUrlList.length; i++) {
      final sourceName = playFromList[i];
      final episodesData = playUrlList[i].split('#');

      final episodes = <Episode>[];
      for (final episode in episodesData) {
        final parts = episode.split(r'$');
        if (parts.length >= 2) {
          final episodeName = parts[0];
          final episodeUrl = parts[1];

          // Filter out invalid URLs
          if (!_isValidPlayUrl(episodeUrl)) {
            continue;
          }
          episodes.add(Episode(
            name: episodeName,
            url: episodeUrl,
          ));
        }
      }

      if (episodes.isNotEmpty) {
        playSources.add(PlaySource(
          name: sourceName,
          episodes: episodes,
        ));
      }
    }

    return playSources;
  }
}

/// Container for parsed play information
class VideoPlayInfo {
  VideoPlayInfo({
    required this.playSources,
    required this.episodes,
  });

  final List<String> playSources;
  final List<List<Episode>> episodes;

  bool get isEmpty => playSources.isEmpty || episodes.isEmpty;
  bool get isNotEmpty => !isEmpty;
}

/// Play source with episodes for bottom sheet display
class PlaySource {
  PlaySource({
    required this.name,
    required this.episodes,
  });

  final String name;
  final List<Episode> episodes;
}
