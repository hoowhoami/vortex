import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/constants/app_constants.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/app_localizations.dart';
import '../../models/douban.dart';
import '../../services/douban_service.dart';
import '../../widgets/douban_image.dart';
import '../video_detail/video_detail_screen.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final TextEditingController _searchController = TextEditingController();

  List<DoubanItem> _searchResults = [];
  bool _isSearching = false;
  bool _hasSearched = false;
  int _searchType = 1; // 1 = movie, 2 = tv

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _performSearch(String query) async {
    if (query.trim().isEmpty) {
      setState(() {
        _searchResults = [];
        _hasSearched = false;
      });
      return;
    }

    setState(() {
      _isSearching = true;
      _hasSearched = true;
    });

    try {
      final doubanService = context.read<DoubanService>();

      // Search using Douban API
      final result = await doubanService.searchByTitle(
        query,
        type: _searchType == 1 ? 'movie' : 'tv',
        pageLimit: 50,
      );

      if (mounted) {
        setState(() {
          _searchResults = result.list;
          _isSearching = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _searchResults = [];
          _isSearching = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('搜索失败: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final loc = AppLocalizations.of(context);

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            _buildSearchBar(loc),
            Expanded(
              child: _buildContent(loc),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchBar(AppLocalizations loc) {
    return Container(
      padding: const EdgeInsets.all(AppConstants.spacingMd),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            loc.search,
            style: Theme.of(context).textTheme.displayMedium,
          ),
          const SizedBox(height: AppConstants.spacingMd),
          TextField(
            controller: _searchController,
            onChanged: (value) {
              if (value.isEmpty) {
                _performSearch(value);
              }
            },
            onSubmitted: _performSearch,
            decoration: InputDecoration(
              hintText: loc.searchForMovies,
              prefixIcon: const Icon(
                Icons.search_rounded,
                color: AppColors.textTertiary,
              ),
              suffixIcon: _searchController.text.isNotEmpty
                  ? IconButton(
                      icon: const Icon(
                        Icons.clear_rounded,
                        color: AppColors.textTertiary,
                      ),
                      onPressed: () {
                        _searchController.clear();
                        _performSearch('');
                      },
                    )
                  : null,
            ),
          ),
          const SizedBox(height: AppConstants.spacingMd),
          Row(
            children: [
              _buildTypeChip('电影', 1),
              const SizedBox(width: AppConstants.spacingSm),
              _buildTypeChip('剧集', 2),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTypeChip(String label, int type) {
    final isSelected = _searchType == type;

    return FilterChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (selected) {
        if (selected) {
          setState(() {
            _searchType = type;
          });
          if (_searchController.text.isNotEmpty) {
            _performSearch(_searchController.text);
          }
        }
      },
      selectedColor: AppColors.accent,
      checkmarkColor: Colors.white,
      labelStyle: TextStyle(
        color: isSelected ? Colors.white : AppColors.textPrimary,
      ),
    );
  }

  Widget _buildContent(AppLocalizations loc) {
    if (_isSearching) {
      return const Center(
        child: CircularProgressIndicator(
          color: AppColors.accent,
        ),
      );
    }

    if (!_hasSearched) {
      return _buildEmptyState(
        icon: Icons.search_rounded,
        title: loc.searchMovies,
        subtitle: loc.findYourFavorite,
      );
    }

    if (_searchResults.isEmpty) {
      return _buildEmptyState(
        icon: Icons.movie_filter_outlined,
        title: loc.noResultsFound,
        subtitle: loc.tryDifferentKeywords,
      );
    }

    return _buildSearchResults();
  }

  Widget _buildEmptyState({
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppConstants.spacingXl),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 80,
              color: AppColors.textTertiary,
            ),
            const SizedBox(height: AppConstants.spacingLg),
            Text(
              title,
              style: Theme.of(context).textTheme.headlineMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppConstants.spacingSm),
            Text(
              subtitle,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppColors.textSecondary,
                  ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchResults() {
    return GridView.builder(
      padding: const EdgeInsets.all(AppConstants.spacingMd),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: AppConstants.gridCrossAxisCount,
        childAspectRatio: AppConstants.gridChildAspectRatio,
        crossAxisSpacing: AppConstants.gridSpacing,
        mainAxisSpacing: AppConstants.gridSpacing,
      ),
      itemCount: _searchResults.length,
      itemBuilder: (context, index) {
        return _buildResultCard(_searchResults[index]);
      },
    );
  }

  Widget _buildResultCard(DoubanItem item) {
    final doubanService = context.read<DoubanService>();
    final posterUrl = item.poster.isNotEmpty
        ? doubanService.getProxiedImageUrl(item.poster)
        : '';

    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => VideoDetailScreen(doubanItem: item),
          ),
        );
      },
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(AppConstants.radiusMd),
              child: Stack(
                fit: StackFit.expand,
                children: [
                  DoubanImage(
                    imageUrl: posterUrl,
                    fit: BoxFit.cover,
                    errorWidget: Container(
                      color: AppColors.darkSurface,
                      child: const Icon(
                        Icons.movie,
                        color: AppColors.textSecondary,
                        size: 48,
                      ),
                    ),
                  ),
                  if (item.rateValue > 0)
                    Positioned(
                      top: 8,
                      right: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.7),
                          borderRadius: BorderRadius.circular(AppConstants.radiusSm),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.star, color: Colors.amber, size: 12),
                            const SizedBox(width: 4),
                            Text(
                              item.rate,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  if (item.genres != null && item.genres!.isNotEmpty)
                    Positioned(
                      top: 8,
                      left: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.accent.withOpacity(0.9),
                          borderRadius: BorderRadius.circular(AppConstants.radiusSm),
                        ),
                        child: Text(
                          item.genres!.split(', ').first,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),
          const SizedBox(height: AppConstants.spacingSm),
          Text(
            item.title,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          if (item.year.isNotEmpty)
            Text(
              item.year,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppColors.textSecondary,
                  ),
            ),
        ],
      ),
    );
  }
}
