import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/constants/app_constants.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/app_localizations.dart';
import '../../models/video.dart';
import '../../services/favorites_service.dart';
import '../../services/video_service.dart';
import '../../services/video_source_manager.dart';
import '../video_player/video_player_screen.dart';

class VideoDetailScreen extends StatefulWidget {

  const VideoDetailScreen({
    super.key,
    required this.video,
  });
  final Video video;

  @override
  State<VideoDetailScreen> createState() => _VideoDetailScreenState();
}

class _VideoDetailScreenState extends State<VideoDetailScreen> {
  int _selectedSourceIndex = 0;
  int _selectedPlaySourceIndex = 0;
  int _selectedEpisodeIndex = 0;

  // Map of API source name to video data
  Map<String, Video> _sourceVideos = {};
  List<String> _sourceNames = [];

  // Current selected source's play info
  VideoPlayInfo? _playInfo;

  bool _isLoading = true;
  String? _errorMessage;
  bool _isInfoExpanded = false;
  bool _isDescriptionExpanded = false;

  @override
  void initState() {
    super.initState();
    _loadVideoFromAllSources();
  }

  Future<void> _loadVideoFromAllSources() async {
    if (!mounted) return;
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final videoService = context.read<VideoService>();
      final sourceManager = VideoSourceManager(videoService);
      final results = await sourceManager.searchVideoSources(widget.video.name);

      if (!mounted) return;
      if (results.isEmpty) {
        if (widget.video.playUrl != null && widget.video.playUrl!.isNotEmpty) {
          setState(() {
            _sourceVideos = {'原始数据': widget.video};
            _sourceNames = ['原始数据'];
            _selectedSourceIndex = 0;
            _isLoading = false;
          });
          _parsePlayInfoForSource('原始数据');
        } else {
          setState(() {
            _isLoading = false;
            _errorMessage = '未在任何视频源中找到该影片，且原始数据无播放链接';
          });
        }
        return;
      }

      setState(() {
        _sourceVideos = results;
        _sourceNames = results.keys.toList();
        _selectedSourceIndex = 0;
        _isLoading = false;
      });

      _parsePlayInfoForSource(_sourceNames[0]);
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _errorMessage = '加载失败: $e';
      });
    }
  }

  void _parsePlayInfoForSource(String sourceName) {
    final video = _sourceVideos[sourceName];
    if (video == null) return;

    final videoService = context.read<VideoService>();
    final sourceManager = VideoSourceManager(videoService);
    final playInfo = sourceManager.parsePlayInfo(video);

    if (!mounted) return;
    setState(() {
      _playInfo = playInfo;
      _selectedPlaySourceIndex = 0;
      _selectedEpisodeIndex = 0;
    });
  }

  void _playVideo(String url) {
    // Video is already playing in the embedded player at the top
    // Just trigger a rebuild to update the player
    if (!mounted) return;
    setState(() {
      // The player will automatically update based on _selectedEpisodeIndex
    });
  }

  @override
  Widget build(BuildContext context) {
    final loc = AppLocalizations.of(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.video.name),
      ),
      body: ListView(
        children: [
          _buildVideoPlayerSection(),
          const SizedBox(height: AppConstants.spacingLg),
          _buildHeader(context, loc, isDark),
          const SizedBox(height: AppConstants.spacingLg),
          if (_isLoading)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(AppConstants.spacingXl),
                child: CircularProgressIndicator(
                  color: AppColors.accent,
                ),
              ),
            )
          else if (_errorMessage != null)
            Center(
              child: Padding(
                padding: const EdgeInsets.all(AppConstants.spacingXl),
                child: Column(
                  children: [
                    const Icon(
                      Icons.error_outline,
                      size: 48,
                      color: AppColors.error,
                    ),
                    const SizedBox(height: AppConstants.spacingMd),
                    Text(
                      _errorMessage!,
                      style: Theme.of(context).textTheme.bodyMedium,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: AppConstants.spacingMd),
                    ElevatedButton.icon(
                      onPressed: _loadVideoFromAllSources,
                      icon: const Icon(Icons.refresh),
                      label: const Text('重试'),
                    ),
                  ],
                ),
              ),
            )
          else ...[
            if (_sourceNames.isNotEmpty) ...[
              _buildSourceSelection(context, loc),
              const SizedBox(height: AppConstants.spacingMd),
            ],
            if (_playInfo != null && _playInfo!.isNotEmpty) ...[
              _buildPlaySources(context, loc),
              const SizedBox(height: AppConstants.spacingMd),
              _buildEpisodes(context, loc),
              const SizedBox(height: AppConstants.spacingLg),
            ],
            _buildInfo(context, loc, isDark),
            const SizedBox(height: AppConstants.spacingLg),
            _buildDescription(context, loc, isDark),
            const SizedBox(height: AppConstants.spacingXl),
          ],
        ],
      ),
    );
  }

  Widget _buildVideoPlayerSection() {
    // Check if we have valid play info
    if (_playInfo == null || _playInfo!.isEmpty) {
      return Container(
        height: 250,
        color: Colors.black,
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.play_circle_outline,
                size: 64,
                color: Colors.white54,
              ),
              const SizedBox(height: 16),
              Text(
                _isLoading ? '加载中...' : '暂无播放源',
                style: const TextStyle(
                  color: Colors.white70,
                  fontSize: 16,
                ),
              ),
            ],
          ),
        ),
      );
    }

    // Get current episode URL
    if (_selectedPlaySourceIndex >= _playInfo!.episodes.length) {
      return Container(height: 250, color: Colors.black);
    }

    final episodes = _playInfo!.episodes[_selectedPlaySourceIndex];
    if (_selectedEpisodeIndex >= episodes.length) {
      return Container(height: 250, color: Colors.black);
    }

    final currentEpisode = episodes[_selectedEpisodeIndex];

    // Embed video player directly in the detail page
    // Chewie's built-in fullscreen button will handle fullscreen mode
    return SizedBox(
      height: 250,
      child: VideoPlayerScreen(
        key: ValueKey('${currentEpisode.url}_$_selectedEpisodeIndex'),
        videoUrl: currentEpisode.url,
        videoTitle: widget.video.name,
        episodeName: currentEpisode.name,
        isEmbedded: true, // Flag to indicate this is embedded mode
      ),
    );
  }

  Widget _buildHeader(
      BuildContext context, AppLocalizations loc, bool isDark) {
    final favoritesService = context.read<FavoritesService>();

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppConstants.spacingMd),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            widget.video.name,
            style: Theme.of(context).textTheme.displaySmall,
          ),
          const SizedBox(height: AppConstants.spacingSm),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              if (widget.video.displayScore > 0)
                _buildChip(
                  context,
                  icon: Icons.star_rounded,
                  label: widget.video.formattedScore,
                  color: AppColors.accent,
                ),
              if (widget.video.displayYear.isNotEmpty)
                _buildChip(
                  context,
                  icon: Icons.calendar_today_rounded,
                  label: widget.video.displayYear,
                ),
              if (widget.video.area != null && widget.video.area!.isNotEmpty)
                _buildChip(
                  context,
                  icon: Icons.location_on_rounded,
                  label: widget.video.area!,
                ),
            ],
          ),
          const SizedBox(height: AppConstants.spacingSm),
          Row(
            children: [
              FutureBuilder<bool>(
                future: favoritesService.isVideoFavorite(widget.video.id),
                builder: (context, snapshot) {
                  final isFavorite = snapshot.data ?? false;
                  return OutlinedButton.icon(
                    onPressed: () async {
                      if (isFavorite) {
                        await favoritesService
                            .removeVideoFavorite(widget.video.id);
                        if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(loc.removedFromFavorites),
                              backgroundColor: AppColors.accent,
                              behavior: SnackBarBehavior.floating,
                            ),
                          );
                          setState(() {});
                        }
                      } else {
                        await favoritesService.addVideoFavorite(widget.video);
                        if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(loc.addedToFavorites),
                              backgroundColor: AppColors.accent,
                              behavior: SnackBarBehavior.floating,
                            ),
                          );
                          setState(() {});
                        }
                      }
                    },
                    icon: Icon(
                      isFavorite ? Icons.favorite : Icons.favorite_border,
                      size: 20,
                    ),
                    label: Text(isFavorite ? '已收藏' : '收藏'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.accent,
                      side: const BorderSide(color: AppColors.accent),
                    ),
                  );
                },
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildChip(
    BuildContext context, {
    required IconData icon,
    required String label,
    Color? color,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 12,
        vertical: 6,
      ),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurfaceVariant : AppColors.lightSurfaceVariant,
        borderRadius: BorderRadius.circular(AppConstants.radiusSm),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 16,
            color: color ?? AppColors.textSecondary,
          ),
          const SizedBox(width: 4),
          Text(
            label,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: color ?? (isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary),
                  fontWeight: FontWeight.w500,
                ),
          ),
        ],
      ),
    );
  }

  Widget _buildSourceSelection(BuildContext context, AppLocalizations loc) {
    if (_sourceNames.isEmpty) {
      return const SizedBox.shrink();
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppConstants.spacingMd),
      child: InkWell(
        onTap: () {
          showModalBottomSheet(
            context: context,
            builder: (context) => Container(
              padding: const EdgeInsets.all(AppConstants.spacingMd),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('视频源', style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: AppConstants.spacingMd),
                  Expanded(
                    child: GridView.builder(
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 3,
                        childAspectRatio: 2.5,
                        crossAxisSpacing: 8,
                        mainAxisSpacing: 8,
                      ),
                      itemCount: _sourceNames.length,
                      itemBuilder: (context, index) {
                        final isSelected = index == _selectedSourceIndex;
                        return InkWell(
                          onTap: () {
                            setState(() {
                              _selectedSourceIndex = index;
                            });
                            _parsePlayInfoForSource(_sourceNames[index]);
                            Navigator.pop(context);
                          },
                          child: Container(
                            decoration: BoxDecoration(
                              color: isSelected ? AppColors.accent : Colors.grey.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              _sourceNames[index],
                              style: TextStyle(
                                color: isSelected ? Colors.white : null,
                                fontWeight: isSelected ? FontWeight.bold : null,
                              ),
                              textAlign: TextAlign.center,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
          );
        },
        child: InputDecorator(
          decoration: const InputDecoration(
            labelText: '视频源',
            border: OutlineInputBorder(),
            contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            suffixIcon: Icon(Icons.arrow_drop_down),
          ),
          child: Text(_sourceNames[_selectedSourceIndex]),
        ),
      ),
    );
  }

  Widget _buildPlaySources(BuildContext context, AppLocalizations loc) {
    if (_playInfo == null || _playInfo!.isEmpty) {
      return const SizedBox.shrink();
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppConstants.spacingMd),
      child: InkWell(
        onTap: () {
          showModalBottomSheet(
            context: context,
            builder: (context) => Container(
              padding: const EdgeInsets.all(AppConstants.spacingMd),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(loc.selectSource, style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: AppConstants.spacingMd),
                  Expanded(
                    child: GridView.builder(
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 3,
                        childAspectRatio: 2.5,
                        crossAxisSpacing: 8,
                        mainAxisSpacing: 8,
                      ),
                      itemCount: _playInfo!.playSources.length,
                      itemBuilder: (context, index) {
                        final isSelected = index == _selectedPlaySourceIndex;
                        return InkWell(
                          onTap: () {
                            setState(() {
                              _selectedPlaySourceIndex = index;
                              _selectedEpisodeIndex = 0;
                            });
                            Navigator.pop(context);
                          },
                          child: Container(
                            decoration: BoxDecoration(
                              color: isSelected ? AppColors.accent : Colors.grey.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              _playInfo!.playSources[index],
                              style: TextStyle(
                                color: isSelected ? Colors.white : null,
                                fontWeight: isSelected ? FontWeight.bold : null,
                              ),
                              textAlign: TextAlign.center,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
          );
        },
        child: InputDecorator(
          decoration: InputDecoration(
            labelText: loc.selectSource,
            border: const OutlineInputBorder(),
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            suffixIcon: const Icon(Icons.arrow_drop_down),
          ),
          child: Text(_playInfo!.playSources[_selectedPlaySourceIndex]),
        ),
      ),
    );
  }

  Widget _buildEpisodes(BuildContext context, AppLocalizations loc) {
    if (_playInfo == null || _playInfo!.isEmpty) {
      return const SizedBox.shrink();
    }
    if (_selectedPlaySourceIndex >= _playInfo!.episodes.length) {
      return const SizedBox.shrink();
    }
    if (_playInfo!.episodes[_selectedPlaySourceIndex].isEmpty) {
      return const SizedBox.shrink();
    }

    final episodes = _playInfo!.episodes[_selectedPlaySourceIndex];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppConstants.spacingMd),
      child: InkWell(
        onTap: () {
          showModalBottomSheet(
            context: context,
            builder: (context) => Container(
              padding: const EdgeInsets.all(AppConstants.spacingMd),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(loc.selectEpisode, style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: AppConstants.spacingMd),
                  Expanded(
                    child: GridView.builder(
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 4,
                        childAspectRatio: 2,
                        crossAxisSpacing: 8,
                        mainAxisSpacing: 8,
                      ),
                      itemCount: episodes.length,
                      itemBuilder: (context, index) {
                        final isSelected = index == _selectedEpisodeIndex;
                        return InkWell(
                          onTap: () {
                            setState(() {
                              _selectedEpisodeIndex = index;
                            });
                            _playVideo(episodes[index].url);
                            Navigator.pop(context);
                          },
                          child: Container(
                            decoration: BoxDecoration(
                              color: isSelected ? AppColors.accent : Colors.grey.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              episodes[index].name,
                              style: TextStyle(
                                color: isSelected ? Colors.white : null,
                                fontWeight: isSelected ? FontWeight.bold : null,
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
          );
        },
        child: InputDecorator(
          decoration: InputDecoration(
            labelText: loc.selectEpisode,
            border: const OutlineInputBorder(),
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            suffixIcon: const Icon(Icons.arrow_drop_down),
          ),
          child: Text(episodes[_selectedEpisodeIndex].name),
        ),
      ),
    );
  }

  Widget _buildInfo(BuildContext context, AppLocalizations loc, bool isDark) {
    final video = _sourceNames.isNotEmpty && _selectedSourceIndex < _sourceNames.length
        ? _sourceVideos[_sourceNames[_selectedSourceIndex]] ?? widget.video
        : widget.video;

    final infoItems = <Widget>[];
    if (video.typeList.isNotEmpty) infoItems.add(_buildInfoRow(context, loc.genre, video.typeList.join(', ')));
    if (video.directorList.isNotEmpty) infoItems.add(_buildInfoRow(context, loc.director, video.directorList.join(', ')));
    if (video.actorList.isNotEmpty) infoItems.add(_buildInfoRow(context, loc.cast, video.actorList.join(', ')));
    if (video.area != null && video.area!.isNotEmpty) infoItems.add(_buildInfoRow(context, loc.area, video.area!));
    if (video.lang != null && video.lang!.isNotEmpty) infoItems.add(_buildInfoRow(context, loc.language, video.lang!));
    if (video.displayYear.isNotEmpty) infoItems.add(_buildInfoRow(context, loc.year, video.displayYear));
    if (video.displayRemarks.isNotEmpty) infoItems.add(_buildInfoRow(context, loc.updated, video.displayRemarks));

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: AppConstants.spacingMd),
      padding: const EdgeInsets.all(AppConstants.spacingMd),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(AppConstants.radiusMd),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          InkWell(
            onTap: () => setState(() => _isInfoExpanded = !_isInfoExpanded),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(loc.movieInfo, style: Theme.of(context).textTheme.titleMedium),
                Icon(_isInfoExpanded ? Icons.expand_less : Icons.expand_more),
              ],
            ),
          ),
          if (_isInfoExpanded) ...[
            const SizedBox(height: AppConstants.spacingMd),
            ...infoItems,
          ] else if (infoItems.isNotEmpty) ...[
            const SizedBox(height: AppConstants.spacingMd),
            infoItems.first,
          ],
        ],
      ),
    );
  }

  Widget _buildInfoRow(BuildContext context, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 80,
            child: Text(
              label,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppColors.textSecondary,
                  ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDescription(
      BuildContext context, AppLocalizations loc, bool isDark) {
    final video = _sourceNames.isNotEmpty && _selectedSourceIndex < _sourceNames.length
        ? _sourceVideos[_sourceNames[_selectedSourceIndex]] ?? widget.video
        : widget.video;

    if (video.displayContent.isEmpty) {
      return const SizedBox.shrink();
    }

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: AppConstants.spacingMd),
      padding: const EdgeInsets.all(AppConstants.spacingMd),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(AppConstants.radiusMd),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          InkWell(
            onTap: () => setState(() => _isDescriptionExpanded = !_isDescriptionExpanded),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(loc.overview, style: Theme.of(context).textTheme.titleMedium),
                Icon(_isDescriptionExpanded ? Icons.expand_less : Icons.expand_more),
              ],
            ),
          ),
          const SizedBox(height: AppConstants.spacingSm),
          Text(
            video.displayContent,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.6),
            maxLines: _isDescriptionExpanded ? null : 3,
            overflow: _isDescriptionExpanded ? null : TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
