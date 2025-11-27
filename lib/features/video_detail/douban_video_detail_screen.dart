import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/douban.dart';
import '../../models/video.dart';
import '../../services/video_service.dart';
import '../../services/video_source_manager.dart';
import '../../services/douban_service.dart';
import '../../core/theme/app_colors.dart';
import '../../core/constants/app_constants.dart';
import 'video_detail_screen.dart';

class DoubanVideoDetailScreen extends StatefulWidget {

  const DoubanVideoDetailScreen({
    required this.doubanItem,
    super.key,
  });
  final DoubanItem doubanItem;

  @override
  State<DoubanVideoDetailScreen> createState() => _DoubanVideoDetailScreenState();
}

class _DoubanVideoDetailScreenState extends State<DoubanVideoDetailScreen> {
  Map<String, Video> _sourceVideos = {};
  List<String> _sourceNames = [];
  bool _isSearching = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _searchPlayableSources();
  }

  Future<void> _searchPlayableSources() async {
    setState(() {
      _isSearching = true;
      _errorMessage = null;
    });

    try {
      final videoService = context.read<VideoService>();
      final sourceManager = VideoSourceManager(videoService);

      // Search for playable sources across all active sources using the Douban title
      final results = await sourceManager.searchVideoSources(
        widget.doubanItem.title,
      );

      if (mounted) {
        setState(() {
          _sourceVideos = results;
          _sourceNames = results.keys.toList();
          _isSearching = false;
        });
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

  Future<void> _launchVideo(Video video) async {
    if (!mounted) return;

    // Navigate to VideoDetailScreen which shows video player at top and episode selection below
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => VideoDetailScreen(video: video),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final doubanService = context.read<DoubanService>();
    final posterUrl = doubanService.getProxiedImageUrl(widget.doubanItem.poster);

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          _buildAppBar(posterUrl),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(AppConstants.spacingLg),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildHeader(),
                  const SizedBox(height: AppConstants.spacingLg),
                  _buildMetadata(),
                  const SizedBox(height: AppConstants.spacingLg),
                  if (widget.doubanItem.description != null &&
                      widget.doubanItem.description!.isNotEmpty)
                    _buildDescription(),
                  const SizedBox(height: AppConstants.spacingLg),
                  _buildPlayableSourcesSection(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAppBar(String posterUrl) {
    return SliverAppBar(
      expandedHeight: 300,
      pinned: true,
      backgroundColor: AppColors.backgroundDark,
      flexibleSpace: FlexibleSpaceBar(
        background: Stack(
          fit: StackFit.expand,
          children: [
            if (posterUrl.isNotEmpty)
              Image.network(
                posterUrl,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    color: AppColors.primaryMedium,
                    child: const Icon(Icons.movie, size: 64, color: AppColors.textSecondary),
                  );
                },
              ),
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.transparent,
                    AppColors.backgroundDark.withOpacity(0.8),
                    AppColors.backgroundDark,
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          widget.doubanItem.title,
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        if (widget.doubanItem.originalTitle != null &&
            widget.doubanItem.originalTitle!.isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(top: AppConstants.spacingXs),
            child: Text(
              widget.doubanItem.originalTitle!,
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: AppColors.textSecondary,
                  ),
            ),
          ),
        const SizedBox(height: AppConstants.spacingMd),
        Row(
          children: [
            if (widget.doubanItem.rateValue > 0) ...[
              const Icon(Icons.star, color: Colors.amber, size: 20),
              const SizedBox(width: 4),
              Text(
                widget.doubanItem.rate,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(width: AppConstants.spacingMd),
            ],
            if (widget.doubanItem.year.isNotEmpty)
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: AppColors.primaryMedium,
                  borderRadius: BorderRadius.circular(AppConstants.radiusSm),
                ),
                child: Text(widget.doubanItem.year),
              ),
          ],
        ),
      ],
    );
  }

  Widget _buildMetadata() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (widget.doubanItem.genres != null && widget.doubanItem.genres!.isNotEmpty)
          _buildMetadataRow('类型', widget.doubanItem.genres!),
        if (widget.doubanItem.directors != null && widget.doubanItem.directors!.isNotEmpty)
          _buildMetadataRow('导演', widget.doubanItem.directors!),
        if (widget.doubanItem.actors != null && widget.doubanItem.actors!.isNotEmpty)
          _buildMetadataRow('演员', widget.doubanItem.actors!),
        if (widget.doubanItem.regions != null && widget.doubanItem.regions!.isNotEmpty)
          _buildMetadataRow('地区', widget.doubanItem.regions!),
      ],
    );
  }

  Widget _buildMetadataRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppConstants.spacingSm),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 60,
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

  Widget _buildDescription() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '简介',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        const SizedBox(height: AppConstants.spacingSm),
        Text(
          widget.doubanItem.description!,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: AppColors.textSecondary,
                height: 1.6,
              ),
        ),
      ],
    );
  }

  Widget _buildPlayableSourcesSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              '视频源',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            if (_isSearching)
              const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: AppColors.accent,
                ),
              ),
          ],
        ),
        const SizedBox(height: AppConstants.spacingMd),
        if (_isSearching)
          const Center(
            child: Padding(
              padding: EdgeInsets.all(AppConstants.spacingLg),
              child: Text('正在搜索视频源...'),
            ),
          )
        else if (_errorMessage != null)
          Center(
            child: Padding(
              padding: const EdgeInsets.all(AppConstants.spacingLg),
              child: Column(
                children: [
                  const Icon(
                    Icons.error_outline,
                    size: 48,
                    color: AppColors.textSecondary,
                  ),
                  const SizedBox(height: AppConstants.spacingMd),
                  Text(
                    '搜索失败',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: AppConstants.spacingSm),
                  Text(
                    _errorMessage!,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.textSecondary,
                        ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: AppConstants.spacingMd),
                  ElevatedButton.icon(
                    onPressed: _searchPlayableSources,
                    icon: const Icon(Icons.refresh),
                    label: const Text('重试'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.accent,
                    ),
                  ),
                ],
              ),
            ),
          )
        else if (_sourceVideos.isEmpty)
          Center(
            child: Padding(
              padding: const EdgeInsets.all(AppConstants.spacingLg),
              child: Column(
                children: [
                  const Icon(
                    Icons.video_library_outlined,
                    size: 48,
                    color: AppColors.textSecondary,
                  ),
                  const SizedBox(height: AppConstants.spacingMd),
                  Text(
                    '暂无视频源',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: AppConstants.spacingSm),
                  Text(
                    '未在任何视频源中找到该影片',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppColors.textSecondary,
                        ),
                  ),
                ],
              ),
            ),
          )
        else
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _sourceNames.length,
            itemBuilder: (context, index) {
              final sourceName = _sourceNames[index];
              final video = _sourceVideos[sourceName]!;
              return Card(
                color: AppColors.primaryMedium,
                margin: const EdgeInsets.only(bottom: AppConstants.spacingMd),
                child: ListTile(
                  leading: ClipRRect(
                    borderRadius: BorderRadius.circular(AppConstants.radiusSm),
                    child: Container(
                      width: 60,
                      height: 80,
                      color: AppColors.accent.withOpacity(0.2),
                      child: video.pic.isNotEmpty
                          ? Image.network(
                              video.pic,
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) {
                                return const Icon(
                                  Icons.video_library,
                                  color: AppColors.accent,
                                  size: 32,
                                );
                              },
                            )
                          : const Icon(
                              Icons.video_library,
                              color: AppColors.accent,
                              size: 32,
                            ),
                    ),
                  ),
                  title: Text(
                    sourceName,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 4),
                      Text('影片: ${video.name}'),
                      if (video.remarks != null && video.remarks!.isNotEmpty)
                        Text(
                          video.remarks!,
                          style: const TextStyle(
                            color: AppColors.accent,
                            fontSize: 12,
                          ),
                        ),
                    ],
                  ),
                  trailing: const Icon(Icons.play_circle_outline, color: AppColors.accent, size: 32),
                  onTap: () => _launchVideo(video),
                ),
              );
            },
          ),
      ],
    );
  }
}
