import 'package:flutter/material.dart';
import 'package:media_kit/media_kit.dart';
import 'package:media_kit_video/media_kit_video.dart';

import '../../core/theme/app_colors.dart';

class VideoPlayerScreen extends StatefulWidget {
  const VideoPlayerScreen({
    super.key,
    required this.videoUrl,
    required this.videoTitle,
    this.episodeName,
    this.isEmbedded = false,
  });

  final String videoUrl;
  final String videoTitle;
  final String? episodeName;
  final bool isEmbedded;

  @override
  State<VideoPlayerScreen> createState() => _VideoPlayerScreenState();
}

class _VideoPlayerScreenState extends State<VideoPlayerScreen> {
  late final Player player;
  late final VideoController controller;
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    player = Player();
    controller = VideoController(player);
    _initializePlayer();
  }

  Future<void> _initializePlayer() async {
    try {
      await player.open(
        Media(widget.videoUrl),
        play: !widget.isEmbedded,
      );

      setState(() => _isLoading = false);
    } catch (e) {
      setState(() {
        _isLoading = false;
        _errorMessage = '视频源不支持\n请尝试其他视频源\n错误: ${e.toString()}';
      });
    }
  }

  @override
  void dispose() {
    player.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.isEmbedded) {
      return Container(
        color: Colors.black,
        child: Center(
          child: _isLoading
              ? const CircularProgressIndicator(color: AppColors.accent)
              : _errorMessage != null
                  ? Text(_errorMessage!, style: const TextStyle(color: Colors.white), textAlign: TextAlign.center)
                  : Video(controller: controller),
        ),
      );
    }

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              widget.videoTitle,
              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Colors.white),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            if (widget.episodeName != null) ...[
              const SizedBox(height: 2),
              Text(
                widget.episodeName!,
                style: const TextStyle(fontSize: 11, color: Color(0xFFB0B0B0)),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ],
        ),
      ),
      body: Center(
        child: _isLoading
            ? const CircularProgressIndicator(color: AppColors.accent)
            : _errorMessage != null
                ? Text(_errorMessage!, style: const TextStyle(color: Colors.white), textAlign: TextAlign.center)
                : Video(controller: controller),
      ),
    );
  }
}
