import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/douban.dart';
import '../../models/video.dart';
import '../../services/video_service.dart';
import '../../services/video_source_manager.dart';
import '../../services/douban_service.dart';
import '../../core/theme/app_colors.dart';
import '../../core/constants/app_constants.dart';
import '../../core/utils/app_localizations.dart';
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
  bool _isMetadataExpanded = false;
  bool _isDescriptionExpanded = false;
  DoubanItem? _detailItem;
  bool _isLoadingDetail = true;

  @override
  void initState() {
    super.initState();
    _loadDetail();
    _searchPlayableSources();
  }

  Future<void> _loadDetail() async {
    final doubanService = context.read<DoubanService>();
    final detail = await doubanService.getDetail(widget.doubanItem.id);
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
    final item = _detailItem ?? widget.doubanItem;
    final posterUrl = doubanService.getProxiedImageUrl(item.poster);

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.doubanItem.title),
      ),
      body: _isLoadingDetail
          ? const Center(child: CircularProgressIndicator(color: AppColors.accent))
          : ListView(
              padding: const EdgeInsets.all(AppConstants.spacingLg),
              children: [
                if (posterUrl.isNotEmpty)
                  ClipRRect(
                    borderRadius: BorderRadius.circular(AppConstants.radiusMd),
                    child: Image.network(
                      posterUrl,
                      height: 200,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          height: 200,
                          color: AppColors.darkSurface,
                          child: const Icon(Icons.movie, size: 64, color: AppColors.textSecondary),
                        );
                      },
                    ),
                  ),
                const SizedBox(height: AppConstants.spacingLg),
                _buildHeader(),
                const SizedBox(height: AppConstants.spacingLg),
                _buildMetadataSection(),
                const SizedBox(height: AppConstants.spacingLg),
                _buildDescriptionSection(),
                const SizedBox(height: AppConstants.spacingLg),
                _buildPlayableSourcesSection(),
              ],
            ),
    );
  }

  Widget _buildHeader() {
    final item = _detailItem ?? widget.doubanItem;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          item.title,
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
        ),
        if (item.originalTitle != null && item.originalTitle!.isNotEmpty)
          Padding(
            padding: const EdgeInsets.only(top: AppConstants.spacingXs),
            child: Text(
              item.originalTitle!,
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: AppColors.textSecondary,
                  ),
            ),
          ),
        const SizedBox(height: AppConstants.spacingMd),
        Row(
          children: [
            if (item.rateValue > 0) ...[
              const Icon(Icons.star, color: Colors.amber, size: 20),
              const SizedBox(width: 4),
              Text(
                item.rate,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(width: AppConstants.spacingMd),
            ],
            if (item.year.isNotEmpty)
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: Theme.of(context).brightness == Brightness.dark
                      ? AppColors.darkSurfaceVariant
                      : AppColors.lightSurfaceVariant,
                  borderRadius: BorderRadius.circular(AppConstants.radiusSm),
                ),
                child: Text(item.year),
              ),
          ],
        ),
      ],
    );
  }

  Widget _buildMetadataSection() {
    final item = _detailItem ?? widget.doubanItem;
    final loc = AppLocalizations.of(context);
    final hasMetadata = (item.genres?.isNotEmpty ?? false) ||
        (item.directors?.isNotEmpty ?? false) ||
        (item.actors?.isNotEmpty ?? false) ||
        (item.regions?.isNotEmpty ?? false);

    if (!hasMetadata) return const SizedBox.shrink();

    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(AppConstants.radiusMd),
      ),
      child: InkWell(
        onTap: () => setState(() => _isMetadataExpanded = !_isMetadataExpanded),
        child: Padding(
          padding: const EdgeInsets.all(AppConstants.spacingMd),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(loc.movieInfo, style: Theme.of(context).textTheme.titleMedium),
                  Icon(_isMetadataExpanded ? Icons.expand_less : Icons.expand_more),
                ],
              ),
              const SizedBox(height: AppConstants.spacingSm),
              Column(
                children: [
                  if (item.genres?.isNotEmpty ?? false)
                    _buildMetadataRow('类型', item.genres!, maxLines: _isMetadataExpanded ? null : 1),
                  if (item.directors?.isNotEmpty ?? false)
                    _buildMetadataRow('导演', item.directors!, maxLines: _isMetadataExpanded ? null : 1),
                  if (item.actors?.isNotEmpty ?? false)
                    _buildMetadataRow('演员', item.actors!, maxLines: _isMetadataExpanded ? null : 1),
                  if (item.regions?.isNotEmpty ?? false)
                    _buildMetadataRow('地区', item.regions!, maxLines: _isMetadataExpanded ? null : 1),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDescriptionSection() {
    final item = _detailItem ?? widget.doubanItem;
    final loc = AppLocalizations.of(context);
    final hasDescription = item.description != null && item.description!.isNotEmpty;

    if (!hasDescription) return const SizedBox.shrink();

    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(AppConstants.radiusMd),
      ),
      child: InkWell(
        onTap: () => setState(() => _isDescriptionExpanded = !_isDescriptionExpanded),
        child: Padding(
          padding: const EdgeInsets.all(AppConstants.spacingMd),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(loc.overview, style: Theme.of(context).textTheme.titleMedium),
                  Icon(_isDescriptionExpanded ? Icons.expand_less : Icons.expand_more),
                ],
              ),
              const SizedBox(height: AppConstants.spacingSm),
              Text(
                item.description!,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(height: 1.6),
                maxLines: _isDescriptionExpanded ? null : 3,
                overflow: _isDescriptionExpanded ? null : TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMetadataRow(String label, String value, {int? maxLines}) {
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
              maxLines: maxLines,
              overflow: maxLines != null ? TextOverflow.ellipsis : null,
            ),
          ),
        ],
      ),
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
          SizedBox(
            height: 120,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: _sourceNames.length,
              itemBuilder: (context, index) {
                final sourceName = _sourceNames[index];
                final video = _sourceVideos[sourceName]!;
                return Container(
                  width: 140,
                  margin: EdgeInsets.only(right: index < _sourceNames.length - 1 ? AppConstants.spacingMd : 0),
                  child: Card(
                    child: InkWell(
                      onTap: () => _launchVideo(video),
                      borderRadius: BorderRadius.circular(AppConstants.radiusMd),
                      child: Padding(
                        padding: const EdgeInsets.all(AppConstants.spacingMd),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(
                              Icons.play_circle_outline,
                              color: AppColors.accent,
                              size: 32,
                            ),
                            const SizedBox(height: AppConstants.spacingSm),
                            Text(
                              sourceName,
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              textAlign: TextAlign.center,
                            ),
                            if (video.remarks != null && video.remarks!.isNotEmpty)
                              Text(
                                video.remarks!,
                                style: const TextStyle(
                                  color: AppColors.accent,
                                  fontSize: 12,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                textAlign: TextAlign.center,
                              ),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
      ],
    );
  }
}
