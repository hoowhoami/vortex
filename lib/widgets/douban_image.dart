import 'package:flutter/material.dart';

/// Custom image widget for loading Douban images
/// Simple wrapper around Image.network with error handling
class DoubanImage extends StatelessWidget {
  const DoubanImage({
    required this.imageUrl,
    this.fit = BoxFit.cover,
    this.width,
    this.height,
    this.errorWidget,
    this.loadingWidget,
    super.key,
  });

  final String imageUrl;
  final BoxFit fit;
  final double? width;
  final double? height;
  final Widget? errorWidget;
  final Widget? loadingWidget;

  @override
  Widget build(BuildContext context) {
    if (imageUrl.isEmpty) {
      return errorWidget ?? _buildDefaultError();
    }

    return Image.network(
      imageUrl,
      fit: fit,
      width: width,
      height: height,
      loadingBuilder: (context, child, loadingProgress) {
        if (loadingProgress == null) return child;
        return loadingWidget ?? _buildDefaultLoading();
      },
      errorBuilder: (context, error, stackTrace) {
        return errorWidget ?? _buildDefaultError();
      },
    );
  }

  Widget _buildDefaultLoading() {
    return Container(
      color: Colors.grey[900],
      child: const Center(
        child: CircularProgressIndicator(
          strokeWidth: 2,
          valueColor: AlwaysStoppedAnimation<Color>(Colors.white24),
        ),
      ),
    );
  }

  Widget _buildDefaultError() {
    return Container(
      color: Colors.grey[900],
      child: const Icon(
        Icons.movie,
        color: Colors.white24,
        size: 48,
      ),
    );
  }
}
