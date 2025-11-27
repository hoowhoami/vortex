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

  @override
  void initState() {
    super.initState();
    _loadVideoFromAllSources();
  }

  Future<void> _loadVideoFromAllSources() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final videoService = context.read<VideoService>();
      final sourceManager = VideoSourceManager(videoService);
      final results = await sourceManager.searchVideoSources(widget.video.name);

      print('搜索结果: ${results.length} 个视频源找到了影片');
      print('视频源: ${results.keys.join(", ")}');

      if (results.isEmpty) {
        // 如果没有找到，使用原始视频数据作为后备
        print('未找到视频源，使用原始数据');
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
      print('加载失败: $e');
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

    setState(() {
      _playInfo = playInfo;
      _selectedPlaySourceIndex = 0;
      _selectedEpisodeIndex = 0;
    });
  }

  void _playVideo(String url) {
    if (_playInfo == null || _playInfo!.isEmpty) return;
    if (_selectedPlaySourceIndex >= _playInfo!.episodes.length) return;

    final episodes = _playInfo!.episodes[_selectedPlaySourceIndex];
    if (_selectedEpisodeIndex >= episodes.length) return;

    final episode = episodes[_selectedEpisodeIndex];

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => VideoPlayerScreen(
          videoUrl: url,
          videoTitle: widget.video.name,
          episodeName: episode.name,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final loc = AppLocalizations.of(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          _buildAppBar(context, loc),
          SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
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
          ),
        ],
      ),
    );
  }

  Widget _buildAppBar(BuildContext context, AppLocalizations loc) {
    return SliverAppBar(
      expandedHeight: 300,
      pinned: true,
      flexibleSpace: FlexibleSpaceBar(
        background: Stack(
          fit: StackFit.expand,
          children: [
            CachedNetworkImage(
              imageUrl: widget.video.backdropUrl,
              fit: BoxFit.cover,
              placeholder: (context, url) => Container(
                color: AppColors.surfaceColor,
              ),
              errorWidget: (context, url, error) => Container(
                color: AppColors.surfaceColor,
                child: const Icon(
                  Icons.movie_rounded,
                  size: 64,
                  color: AppColors.textTertiary,
                ),
              ),
            ),
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.transparent,
                    Theme.of(context).scaffoldBackgroundColor,
                  ],
                  stops: const [0.5, 1.0],
                ),
              ),
            ),
          ],
        ),
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
          const SizedBox(height: AppConstants.spacingMd),
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: _playInfo != null && _playInfo!.isNotEmpty
                      ? () {
                          if (_playInfo!.episodes[_selectedPlaySourceIndex].isNotEmpty) {
                            _playVideo(_playInfo!.episodes[_selectedPlaySourceIndex]
                                    [_selectedEpisodeIndex]
                                .url);
                          }
                        }
                      : null,
                  icon: const Icon(Icons.play_arrow_rounded),
                  label: Text(loc.playNow),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),
              const SizedBox(width: AppConstants.spacingMd),
              FutureBuilder<bool>(
                future: favoritesService.isVideoFavorite(widget.video.id),
                builder: (context, snapshot) {
                  final isFavorite = snapshot.data ?? false;
                  return IconButton(
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
                      color: AppColors.accent,
                    ),
                    iconSize: 28,
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
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 12,
        vertical: 6,
      ),
      decoration: BoxDecoration(
        color: (color ?? AppColors.textSecondary).withOpacity(0.1),
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
                  color: color ?? AppColors.textSecondary,
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

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding:
              const EdgeInsets.symmetric(horizontal: AppConstants.spacingMd),
          child: Text(
            '视频源',
            style: Theme.of(context).textTheme.titleMedium,
          ),
        ),
        const SizedBox(height: AppConstants.spacingSm),
        SizedBox(
          height: 40,
          child: ListView.builder(
            padding:
                const EdgeInsets.symmetric(horizontal: AppConstants.spacingMd),
            scrollDirection: Axis.horizontal,
            itemCount: _sourceNames.length,
            itemBuilder: (context, index) {
              final isSelected = index == _selectedSourceIndex;
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: ChoiceChip(
                  label: Text(_sourceNames[index]),
                  selected: isSelected,
                  onSelected: (selected) {
                    if (selected) {
                      setState(() {
                        _selectedSourceIndex = index;
                      });
                      _parsePlayInfoForSource(_sourceNames[index]);
                    }
                  },
                  selectedColor: AppColors.accent,
                  labelStyle: TextStyle(
                    color: isSelected ? Colors.white : AppColors.textPrimary,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildPlaySources(BuildContext context, AppLocalizations loc) {
    if (_playInfo == null || _playInfo!.isEmpty) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding:
              const EdgeInsets.symmetric(horizontal: AppConstants.spacingMd),
          child: Text(
            loc.selectSource,
            style: Theme.of(context).textTheme.titleMedium,
          ),
        ),
        const SizedBox(height: AppConstants.spacingSm),
        SizedBox(
          height: 40,
          child: ListView.builder(
            padding:
                const EdgeInsets.symmetric(horizontal: AppConstants.spacingMd),
            scrollDirection: Axis.horizontal,
            itemCount: _playInfo!.playSources.length,
            itemBuilder: (context, index) {
              final isSelected = index == _selectedPlaySourceIndex;
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: ChoiceChip(
                  label: Text(_playInfo!.playSources[index]),
                  selected: isSelected,
                  onSelected: (selected) {
                    if (selected) {
                      setState(() {
                        _selectedPlaySourceIndex = index;
                        _selectedEpisodeIndex = 0;
                      });
                    }
                  },
                  selectedColor: AppColors.accent,
                  labelStyle: TextStyle(
                    color: isSelected ? Colors.white : AppColors.textPrimary,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              );
            },
          ),
        ),
      ],
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

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding:
              const EdgeInsets.symmetric(horizontal: AppConstants.spacingMd),
          child: Text(
            loc.selectEpisode,
            style: Theme.of(context).textTheme.titleMedium,
          ),
        ),
        const SizedBox(height: AppConstants.spacingSm),
        Padding(
          padding:
              const EdgeInsets.symmetric(horizontal: AppConstants.spacingMd),
          child: Wrap(
            spacing: 8,
            runSpacing: 8,
            children: List.generate(episodes.length, (index) {
              final isSelected = index == _selectedEpisodeIndex;
              return InkWell(
                onTap: () {
                  setState(() {
                    _selectedEpisodeIndex = index;
                  });
                  _playVideo(episodes[index].url);
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? AppColors.accent
                        : AppColors.surfaceColor,
                    borderRadius:
                        BorderRadius.circular(AppConstants.radiusSm),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (isSelected)
                        const Padding(
                          padding: EdgeInsets.only(right: 4),
                          child: Icon(
                            Icons.play_arrow,
                            size: 16,
                            color: Colors.white,
                          ),
                        ),
                      Text(
                        episodes[index].name,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: isSelected
                                  ? Colors.white
                                  : AppColors.textPrimary,
                              fontWeight:
                                  isSelected ? FontWeight.w600 : FontWeight.normal,
                            ),
                      ),
                    ],
                  ),
                ),
              );
            }),
          ),
        ),
      ],
    );
  }

  Widget _buildInfo(BuildContext context, AppLocalizations loc, bool isDark) {
    // Use current selected source video if available, otherwise use original
    final video = _sourceNames.isNotEmpty && _selectedSourceIndex < _sourceNames.length
        ? _sourceVideos[_sourceNames[_selectedSourceIndex]] ?? widget.video
        : widget.video;

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
          Text(
            loc.movieInfo,
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: AppConstants.spacingMd),
          if (video.typeList.isNotEmpty)
            _buildInfoRow(context, loc.genre, video.typeList.join(', ')),
          if (video.directorList.isNotEmpty)
            _buildInfoRow(
                context, loc.director, video.directorList.join(', ')),
          if (video.actorList.isNotEmpty)
            _buildInfoRow(context, loc.cast, video.actorList.join(', ')),
          if (video.area != null && video.area!.isNotEmpty)
            _buildInfoRow(context, loc.area, video.area!),
          if (video.lang != null && video.lang!.isNotEmpty)
            _buildInfoRow(context, loc.language, video.lang!),
          if (video.displayYear.isNotEmpty)
            _buildInfoRow(context, loc.year, video.displayYear),
          if (video.displayRemarks.isNotEmpty)
            _buildInfoRow(context, loc.updated, video.displayRemarks),
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
    // Use current selected source video if available, otherwise use original
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
          Text(
            loc.overview,
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: AppConstants.spacingSm),
          Text(
            video.displayContent,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  height: 1.6,
                ),
          ),
        ],
      ),
    );
  }
}
