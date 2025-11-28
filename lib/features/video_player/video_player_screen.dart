import 'package:chewie/chewie.dart';
import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';

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
  late VideoPlayerController _videoPlayerController;
  ChewieController? _chewieController;
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _initializePlayer();
  }

  Future<void> _initializePlayer() async {
    try {
      _videoPlayerController = VideoPlayerController.networkUrl(
        Uri.parse(widget.videoUrl),
        httpHeaders: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': '*/*',
        },
        videoPlayerOptions: VideoPlayerOptions(mixWithOthers: true),
      );

      await _videoPlayerController.initialize();

      if (!_videoPlayerController.value.isInitialized) {
        throw Exception('视频初始化失败');
      }

      _chewieController = ChewieController(
        videoPlayerController: _videoPlayerController,
        autoPlay: !widget.isEmbedded,
        looping: false,
        aspectRatio: _videoPlayerController.value.aspectRatio,
        materialProgressColors: ChewieProgressColors(
          playedColor: AppColors.accent,
          handleColor: AppColors.accent,
        ),
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
    _videoPlayerController.dispose();
    _chewieController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // If embedded mode, return just the player without Scaffold
    if (widget.isEmbedded) {
      return Container(
        color: Colors.black,
        child: Center(
          child: _isLoading
              ? const CircularProgressIndicator(
                  color: AppColors.accent,
                )
              : _errorMessage != null
                  ? Text(_errorMessage!, style: const TextStyle(color: Colors.white), textAlign: TextAlign.center)
                  : _chewieController != null
                      ? Chewie(key: ValueKey(widget.videoUrl), controller: _chewieController!)
                      : const SizedBox.shrink(),
        ),
      );
    }

    // Full screen mode with Scaffold
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        toolbarHeight: widget.episodeName != null ? 64 : 56,
        title: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.videoTitle,
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            if (widget.episodeName != null) ...[
              const SizedBox(height: 2),
              Text(
                widget.episodeName!,
                style: const TextStyle(
                  fontSize: 11,
                  color: Color(0xFFB0B0B0),
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ],
        ),
      ),
      body: Center(
        child: _isLoading
            ? const CircularProgressIndicator(
                color: AppColors.accent,
              )
            : _errorMessage != null
                ? Text(_errorMessage!, style: const TextStyle(color: Colors.white), textAlign: TextAlign.center)
                : _chewieController != null
                    ? Chewie(key: ValueKey(widget.videoUrl), controller: _chewieController!)
                    : const SizedBox.shrink(),
      ),
    );
  }

}
