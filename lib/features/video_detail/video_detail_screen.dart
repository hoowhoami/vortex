import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/douban.dart';
import '../../models/video.dart';
import '../../services/video_service.dart';
import '../../services/video_source_manager.dart';
import '../../services/douban_service.dart';
import '../../services/favorites_service.dart';
import '../../core/theme/app_colors.dart';
import '../../core/constants/app_constants.dart';
import '../../core/utils/app_localizations.dart';
import '../video_player/video_player_screen.dart';

class VideoDetailScreen extends StatefulWidget {
  const VideoDetailScreen({
    this.doubanItem,
    this.video,
    super.key,
  }) : assert(doubanItem != null || video != null);

  final DoubanItem? doubanItem;
  final Video? video;

  @override
  State<VideoDetailScreen> createState() => _VideoDetailScreenState();
}

class _VideoDetailScreenState extends State<VideoDetailScreen> {
  Map<String, Video> _sourceVideos = {};
  List<String> _sourceNames = [];
  int _selectedSourceIndex = 0;
  int _selectedPlaySourceIndex = 0;
  int _selectedEpisodeIndex = 0;
  VideoPlayInfo? _playInfo;

  bool _isSearching = true;
  bool _isMetadataExpanded = false;
  bool _isDescriptionExpanded = false;
  DoubanItem? _detailItem;
  bool _isLoadingDetail = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    if (widget.doubanItem != null) {
      _loadDetail();
    } else {
      _isLoadingDetail = false;
    }
    _searchPlayableSources();
  }

  Future<void> _loadDetail() async {
    final doubanService = context.read<DoubanService>();
    final detail = await doubanService.getDetail(widget.doubanItem!.id);
    if (mounted) {
      setState(() {
        _detailItem = detail;
        _isLoadingDetail = false;
      });
    }
  }

  Future<void> _searchPlayableSources() async {
    setState(() {
      _isSearching = true;
      _errorMessage = null;
    });

    try {
      final videoService = context.read<VideoService>();
      final sourceManager = VideoSourceManager(videoService);
      final searchTitle = widget.doubanItem?.title ?? widget.video!.name;
      final results = await sourceManager.searchVideoSources(searchTitle);

      if (!mounted) return;

      if (results.isEmpty && widget.video != null && widget.video!.playUrl != null && widget.video!.playUrl!.isNotEmpty) {
        setState(() {
          _sourceVideos = {'原始数据': widget.video!};
          _sourceNames = ['原始数据'];
          _selectedSourceIndex = 0;
          _isSearching = false;
        });
        _parsePlayInfoForSource('原始数据');
      } else {
        setState(() {
          _sourceVideos = results;
          _sourceNames = results.keys.toList();
          _isSearching = false;
        });
        if (_sourceNames.isNotEmpty) {
          _parsePlayInfoForSource(_sourceNames[0]);
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isSearching = false;
          _errorMessage = e.toString();
        });
      }
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

  @override
  Widget build(BuildContext context) {
    final loc = AppLocalizations.of(context);
    final title = widget.doubanItem?.title ?? widget.video?.name ?? '';

    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: _isLoadingDetail
          ? const Center(child: CircularProgressIndicator(color: AppColors.accent))
          : ListView(
              children: [
                _buildVideoPlayerSection(),
                const SizedBox(height: AppConstants.spacingLg),
                _buildHeader(context, loc),
                const SizedBox(height: AppConstants.spacingLg),
                if (_isSearching)
                  const Center(child: Padding(
                    padding: EdgeInsets.all(AppConstants.spacingXl),
                    child: CircularProgressIndicator(color: AppColors.accent),
                  ))
                else if (_errorMessage != null)
                  _buildErrorState()
                else ...[
                  if (_sourceNames.isNotEmpty) ...[
                    _buildSourceSelection(context),
                    const SizedBox(height: AppConstants.spacingMd),
                  ],
                  if (_playInfo != null && _playInfo!.isNotEmpty) ...[
                    _buildPlaySources(context, loc),
                    const SizedBox(height: AppConstants.spacingMd),
                    _buildEpisodes(context, loc),
                    const SizedBox(height: AppConstants.spacingLg),
                  ],
                  _buildMetadataSection(),
                  const SizedBox(height: AppConstants.spacingLg),
                  _buildDescriptionSection(),
                  const SizedBox(height: AppConstants.spacingXl),
                ],
              ],
            ),
    );
  }

  Widget _buildVideoPlayerSection() {
    if (_playInfo == null || _playInfo!.isEmpty) {
      return Container(
        height: 250,
        color: Colors.black,
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.play_circle_outline, size: 64, color: Colors.white54),
              const SizedBox(height: 16),
              Text(_isSearching ? '加载中...' : '暂无播放源', style: const TextStyle(color: Colors.white70, fontSize: 16)),
            ],
          ),
        ),
      );
    }

    if (_selectedPlaySourceIndex >= _playInfo!.episodes.length) {
      return Container(height: 250, color: Colors.black);
    }

    final episodes = _playInfo!.episodes[_selectedPlaySourceIndex];
    if (_selectedEpisodeIndex >= episodes.length) {
      return Container(height: 250, color: Colors.black);
    }

    final currentEpisode = episodes[_selectedEpisodeIndex];
    final title = widget.doubanItem?.title ?? widget.video?.name ?? '';

    return SizedBox(
      height: 250,
      child: VideoPlayerScreen(
        key: ValueKey('${currentEpisode.url}_$_selectedEpisodeIndex'),
        videoUrl: currentEpisode.url,
        videoTitle: title,
        episodeName: currentEpisode.name,
        isEmbedded: true,
      ),
    );
  }

  Widget _buildHeader(BuildContext context, AppLocalizations loc) {
    final item = _detailItem ?? widget.doubanItem;
    final video = widget.video;

    if (item != null) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: AppConstants.spacingMd),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(item.title, style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold)),
            if (item.originalTitle != null && item.originalTitle!.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: AppConstants.spacingXs),
                child: Text(item.originalTitle!, style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: AppColors.textSecondary)),
              ),
            const SizedBox(height: AppConstants.spacingMd),
            Row(
              children: [
                if (item.rateValue > 0) ...[
                  const Icon(Icons.star, color: Colors.amber, size: 20),
                  const SizedBox(width: 4),
                  Text(item.rate, style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                  const SizedBox(width: AppConstants.spacingMd),
                ],
                if (item.year.isNotEmpty)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: Theme.of(context).brightness == Brightness.dark ? AppColors.darkSurfaceVariant : AppColors.lightSurfaceVariant,
                      borderRadius: BorderRadius.circular(AppConstants.radiusSm),
                    ),
                    child: Text(item.year),
                  ),
              ],
            ),
          ],
        ),
      );
    } else if (video != null) {
      final favoritesService = context.read<FavoritesService>();
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: AppConstants.spacingMd),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(video.name, style: Theme.of(context).textTheme.displaySmall),
            const SizedBox(height: AppConstants.spacingSm),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                if (video.displayScore > 0)
                  _buildChip(context, icon: Icons.star_rounded, label: video.formattedScore, color: AppColors.accent),
                if (video.displayYear.isNotEmpty)
                  _buildChip(context, icon: Icons.calendar_today_rounded, label: video.displayYear),
                if (video.area != null && video.area!.isNotEmpty)
                  _buildChip(context, icon: Icons.location_on_rounded, label: video.area!),
              ],
            ),
            const SizedBox(height: AppConstants.spacingSm),
            FutureBuilder<bool>(
              future: favoritesService.isVideoFavorite(video.id),
              builder: (context, snapshot) {
                final isFavorite = snapshot.data ?? false;
                return OutlinedButton.icon(
                  onPressed: () async {
                    if (isFavorite) {
                      await favoritesService.removeVideoFavorite(video.id);
                      if (mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(loc.removedFromFavorites), backgroundColor: AppColors.accent, behavior: SnackBarBehavior.floating));
                        setState(() {});
                      }
                    } else {
                      await favoritesService.addVideoFavorite(video);
                      if (mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(loc.addedToFavorites), backgroundColor: AppColors.accent, behavior: SnackBarBehavior.floating));
                        setState(() {});
                      }
                    }
                  },
                  icon: Icon(isFavorite ? Icons.favorite : Icons.favorite_border, size: 20),
                  label: Text(isFavorite ? '已收藏' : '收藏'),
                  style: OutlinedButton.styleFrom(foregroundColor: AppColors.accent, side: const BorderSide(color: AppColors.accent)),
                );
              },
            ),
          ],
        ),
      );
    }
    return const SizedBox.shrink();
  }

  Widget _buildChip(BuildContext context, {required IconData icon, required String label, Color? color}) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurfaceVariant : AppColors.lightSurfaceVariant,
        borderRadius: BorderRadius.circular(AppConstants.radiusSm),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: color ?? AppColors.textSecondary),
          const SizedBox(width: 4),
          Text(label, style: Theme.of(context).textTheme.bodySmall?.copyWith(color: color ?? (isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary), fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }

  Widget _buildErrorState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppConstants.spacingXl),
        child: Column(
          children: [
            const Icon(Icons.error_outline, size: 48, color: AppColors.textSecondary),
            const SizedBox(height: AppConstants.spacingMd),
            Text('搜索失败', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: AppConstants.spacingSm),
            Text(_errorMessage!, style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppColors.textSecondary), textAlign: TextAlign.center),
            const SizedBox(height: AppConstants.spacingMd),
            ElevatedButton.icon(onPressed: _searchPlayableSources, icon: const Icon(Icons.refresh), label: const Text('重试'), style: ElevatedButton.styleFrom(backgroundColor: AppColors.accent)),
          ],
        ),
      ),
    );
  }

  Widget _buildSourceSelection(BuildContext context) {
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
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 3, childAspectRatio: 2.5, crossAxisSpacing: 8, mainAxisSpacing: 8),
                      itemCount: _sourceNames.length,
                      itemBuilder: (context, index) {
                        final isSelected = index == _selectedSourceIndex;
                        return InkWell(
                          onTap: () {
                            setState(() => _selectedSourceIndex = index);
                            _parsePlayInfoForSource(_sourceNames[index]);
                            Navigator.pop(context);
                          },
                          child: Container(
                            decoration: BoxDecoration(color: isSelected ? AppColors.accent : Colors.grey.withOpacity(0.2), borderRadius: BorderRadius.circular(8)),
                            alignment: Alignment.center,
                            child: Text(_sourceNames[index], style: TextStyle(color: isSelected ? Colors.white : null, fontWeight: isSelected ? FontWeight.bold : null), textAlign: TextAlign.center, maxLines: 1, overflow: TextOverflow.ellipsis),
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
          decoration: const InputDecoration(labelText: '视频源', border: OutlineInputBorder(), contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8), suffixIcon: Icon(Icons.arrow_drop_down)),
          child: Text(_sourceNames[_selectedSourceIndex]),
        ),
      ),
    );
  }

  Widget _buildPlaySources(BuildContext context, AppLocalizations loc) {
    if (_playInfo == null || _playInfo!.isEmpty) return const SizedBox.shrink();

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
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 3, childAspectRatio: 2.5, crossAxisSpacing: 8, mainAxisSpacing: 8),
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
                            decoration: BoxDecoration(color: isSelected ? AppColors.accent : Colors.grey.withOpacity(0.2), borderRadius: BorderRadius.circular(8)),
                            alignment: Alignment.center,
                            child: Text(_playInfo!.playSources[index], style: TextStyle(color: isSelected ? Colors.white : null, fontWeight: isSelected ? FontWeight.bold : null), textAlign: TextAlign.center, maxLines: 1, overflow: TextOverflow.ellipsis),
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
          decoration: InputDecoration(labelText: loc.selectSource, border: const OutlineInputBorder(), contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8), suffixIcon: const Icon(Icons.arrow_drop_down)),
          child: Text(_playInfo!.playSources[_selectedPlaySourceIndex]),
        ),
      ),
    );
  }

  Widget _buildEpisodes(BuildContext context, AppLocalizations loc) {
    if (_playInfo == null || _playInfo!.isEmpty || _selectedPlaySourceIndex >= _playInfo!.episodes.length || _playInfo!.episodes[_selectedPlaySourceIndex].isEmpty) {
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
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 4, childAspectRatio: 2, crossAxisSpacing: 8, mainAxisSpacing: 8),
                      itemCount: episodes.length,
                      itemBuilder: (context, index) {
                        final isSelected = index == _selectedEpisodeIndex;
                        return InkWell(
                          onTap: () {
                            setState(() => _selectedEpisodeIndex = index);
                            Navigator.pop(context);
                          },
                          child: Container(
                            decoration: BoxDecoration(color: isSelected ? AppColors.accent : Colors.grey.withOpacity(0.2), borderRadius: BorderRadius.circular(8)),
                            alignment: Alignment.center,
                            child: Text(episodes[index].name, style: TextStyle(color: isSelected ? Colors.white : null, fontWeight: isSelected ? FontWeight.bold : null)),
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
          decoration: InputDecoration(labelText: loc.selectEpisode, border: const OutlineInputBorder(), contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8), suffixIcon: const Icon(Icons.arrow_drop_down)),
          child: Text(episodes[_selectedEpisodeIndex].name),
        ),
      ),
    );
  }

  Widget _buildMetadataSection() {
    final item = _detailItem ?? widget.doubanItem;
    final video = _sourceNames.isNotEmpty && _selectedSourceIndex < _sourceNames.length ? _sourceVideos[_sourceNames[_selectedSourceIndex]] : widget.video;

    final infoItems = <Widget>[];

    if (item != null) {
      if (item.genres?.isNotEmpty ?? false) infoItems.add(_buildMetadataRow('类型', item.genres!));
      if (item.directors?.isNotEmpty ?? false) infoItems.add(_buildMetadataRow('导演', item.directors!));
      if (item.actors?.isNotEmpty ?? false) infoItems.add(_buildMetadataRow('演员', item.actors!));
      if (item.regions?.isNotEmpty ?? false) infoItems.add(_buildMetadataRow('地区', item.regions!));
    } else if (video != null) {
      final loc = AppLocalizations.of(context);
      if (video.typeList.isNotEmpty) infoItems.add(_buildMetadataRow(loc.genre, video.typeList.join(', ')));
      if (video.directorList.isNotEmpty) infoItems.add(_buildMetadataRow(loc.director, video.directorList.join(', ')));
      if (video.actorList.isNotEmpty) infoItems.add(_buildMetadataRow(loc.cast, video.actorList.join(', ')));
      if (video.area != null && video.area!.isNotEmpty) infoItems.add(_buildMetadataRow(loc.area, video.area!));
      if (video.lang != null && video.lang!.isNotEmpty) infoItems.add(_buildMetadataRow(loc.language, video.lang!));
      if (video.displayYear.isNotEmpty) infoItems.add(_buildMetadataRow(loc.year, video.displayYear));
      if (video.displayRemarks.isNotEmpty) infoItems.add(_buildMetadataRow(loc.updated, video.displayRemarks));
    }

    if (infoItems.isEmpty) return const SizedBox.shrink();

    final loc = AppLocalizations.of(context);
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: AppConstants.spacingMd),
      padding: const EdgeInsets.all(AppConstants.spacingMd),
      decoration: BoxDecoration(color: Theme.of(context).cardColor, borderRadius: BorderRadius.circular(AppConstants.radiusMd)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          InkWell(
            onTap: () => setState(() => _isMetadataExpanded = !_isMetadataExpanded),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(loc.movieInfo, style: Theme.of(context).textTheme.titleMedium),
                Icon(_isMetadataExpanded ? Icons.expand_less : Icons.expand_more),
              ],
            ),
          ),
          if (_isMetadataExpanded) ...[
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

  Widget _buildMetadataRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppConstants.spacingSm),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(width: 60, child: Text(label, style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary))),
          Expanded(child: Text(value, style: Theme.of(context).textTheme.bodyMedium, maxLines: _isMetadataExpanded ? null : 1, overflow: _isMetadataExpanded ? null : TextOverflow.ellipsis)),
        ],
      ),
    );
  }

  Widget _buildDescriptionSection() {
    final item = _detailItem ?? widget.doubanItem;
    final video = _sourceNames.isNotEmpty && _selectedSourceIndex < _sourceNames.length ? _sourceVideos[_sourceNames[_selectedSourceIndex]] : widget.video;

    final description = item?.description ?? video?.displayContent;
    if (description == null || description.isEmpty) return const SizedBox.shrink();

    final loc = AppLocalizations.of(context);
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: AppConstants.spacingMd),
      padding: const EdgeInsets.all(AppConstants.spacingMd),
      decoration: BoxDecoration(color: Theme.of(context).cardColor, borderRadius: BorderRadius.circular(AppConstants.radiusMd)),
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
          Text(description, style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.6), maxLines: _isDescriptionExpanded ? null : 3, overflow: _isDescriptionExpanded ? null : TextOverflow.ellipsis),
        ],
      ),
    );
  }
}
