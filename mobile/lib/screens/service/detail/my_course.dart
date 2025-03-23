import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../models/course_package.dart';
import 'package:video_player/video_player.dart';
import 'package:chewie/chewie.dart';

class MyCourseScreen extends StatefulWidget {
  final CoursePackage course;

  const MyCourseScreen({Key? key, required this.course}) : super(key: key);

  @override
  State<MyCourseScreen> createState() => _MyCourseScreenState();
}

class _MyCourseScreenState extends State<MyCourseScreen> {
  late VideoPlayerController? _videoController;
  ChewieController? _chewieController;
  int _selectedContentIndex = 0;
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _initializeVideo();
  }

  Future<void> _initializeVideo() async {
    if (widget.course.courseContents.isNotEmpty &&
        widget.course.courseContents[_selectedContentIndex].videoUrl != null) {
      _videoController = VideoPlayerController.network(
        widget.course.courseContents[_selectedContentIndex].videoUrl!,
      );

      try {
        await _videoController!.initialize();
        _chewieController = ChewieController(
          videoPlayerController: _videoController!,
          autoPlay: false,
          looping: false,
          aspectRatio: _videoController!.value.aspectRatio,
          placeholder: Container(
            color: Colors.black,
          ),
          materialProgressColors: ChewieProgressColors(
            playedColor: const Color(0xFF8C9EFF),
            handleColor: const Color(0xFF8C9EFF),
            backgroundColor: Colors.grey,
            bufferedColor: Colors.grey[400]!,
          ),
          showControlsOnInitialize: false,
          allowFullScreen: true,
          deviceOrientationsAfterFullScreen: [DeviceOrientation.portraitUp],
        );
        setState(() {});
      } catch (e) {
        print('Lỗi khi khởi tạo video: $e');
      }
    }
  }

  Future<void> _changeVideo(int index) async {
    if (_videoController != null) {
      await _videoController!.dispose();
    }
    if (_chewieController != null) {
      _chewieController!.dispose();
    }

    setState(() {
      _selectedContentIndex = index;
      _videoController = null;
      _chewieController = null;
    });

    await _initializeVideo();
  }

  @override
  void dispose() {
    if (_videoController != null) {
      _videoController!.dispose();
    }
    if (_chewieController != null) {
      _chewieController!.dispose();
    }
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        controller: _scrollController,
        slivers: [
          _buildSliverAppBar(),
          SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildVideoPlayer(),
                _buildCourseInfo(),
                const Padding(
                  padding: EdgeInsets.all(16.0),
                  child: Text(
                    'Nội dung khóa học',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ),
          _buildLessonsList(),
        ],
      ),
    );
  }

  Widget _buildSliverAppBar() {
    return SliverAppBar(
      expandedHeight: 200.0,
      floating: false,
      pinned: true,
      flexibleSpace: FlexibleSpaceBar(
        title: Text(
          widget.course.courseName,
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
        background: Stack(
          fit: StackFit.expand,
          children: [
            Image.network(
              widget.course.imageUrl,
              fit: BoxFit.cover,
            ),
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.transparent,
                    Colors.black.withOpacity(0.7),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
      backgroundColor: const Color(0xFF8C9EFF),
    );
  }

  Widget _buildVideoPlayer() {
    if (_chewieController != null) {
      return AspectRatio(
        aspectRatio: _videoController!.value.aspectRatio,
        child: Container(
          color: Colors.black,
          child: Stack(
            fit: StackFit.expand,
            children: [
              Chewie(controller: _chewieController!),
            ],
          ),
        ),
      );
    } else {
      return Container(
        height: 200,
        color: Colors.black,
        child: const Center(
          child: CircularProgressIndicator(
            color: Colors.white,
          ),
        ),
      );
    }
  }

  Widget _buildCourseInfo() {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            widget.course.headline,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            widget.course.courseDescription,
            style: TextStyle(
              fontSize: 16,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: 12,
              vertical: 6,
            ),
            decoration: BoxDecoration(
              color: const Color(0xFF8C9EFF).withOpacity(0.2),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              widget.course.typeName,
              style: const TextStyle(
                color: Color(0xFF8C9EFF),
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLessonsList() {
    return SliverList(
      delegate: SliverChildBuilderDelegate(
        (context, index) {
          final content = widget.course.courseContents[index];
          final hasVideo = content.videoUrl != null;
          final isSelected = _selectedContentIndex == index;

          return Container(
            margin: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 4,
            ),
            decoration: BoxDecoration(
              color: isSelected
                  ? const Color(0xFF8C9EFF).withOpacity(0.1)
                  : Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isSelected ? const Color(0xFF8C9EFF) : Colors.grey[300]!,
                width: 1,
              ),
            ),
            child: ListTile(
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 8,
              ),
              leading: Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: isSelected
                      ? const Color(0xFF8C9EFF)
                      : const Color(0xFF8C9EFF).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Icon(
                  hasVideo ? Icons.play_circle_outline : Icons.image,
                  color: isSelected ? Colors.white : const Color(0xFF8C9EFF),
                ),
              ),
              title: Text(
                content.title,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                  color: isSelected ? const Color(0xFF8C9EFF) : Colors.black,
                ),
              ),
              subtitle: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 4),
                  Text(
                    hasVideo ? 'Video bài học' : 'Tài liệu học tập',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
              onTap: hasVideo ? () => _changeVideo(index) : null,
              enabled: hasVideo,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          );
        },
        childCount: widget.course.courseContents.length,
      ),
    );
  }
}
