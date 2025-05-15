import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../models/course_package.dart';
import '../../../models/course_content_progress.dart';
import '../../../screens/service/detail/video_player_screen.dart';
import 'package:dio/dio.dart';
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:open_filex/open_filex.dart';
import 'dart:io';
import 'package:video_player/video_player.dart';
import 'package:flutter_cached_pdfview/flutter_cached_pdfview.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../services/course_service.dart';

class MyCourseScreen extends StatefulWidget {
  final CoursePackage course;

  const MyCourseScreen({Key? key, required this.course}) : super(key: key);

  @override
  State<MyCourseScreen> createState() => _MyCourseScreenState();
}

class _MyCourseScreenState extends State<MyCourseScreen> {
  int _selectedContentIndex = 0;
  int _selectedItemIndex = 0;
  VideoPlayerController? _videoPlayerController;
  bool _isVideoPlaying = false;
  String? _currentVideoUrl;
  String? _currentImageUrl;
  String? _currentDocumentUrl;
  bool _isImageVisible = false;
  bool _isDocumentVisible = false;
  bool _isVideoEnded = false;
  bool _showControls = true;
  WebViewController? _webViewController;
  bool _isFullScreen = false;
  CourseContentProgress? _courseProgress;
  bool _isLoadingProgress = true;
  int _currentPage = 0;
  int _totalPages = 0;
  PDFViewController? _pdfController;
  bool _isVideoLearned = false;

  @override
  void initState() {
    super.initState();
    _hideControlsAfterDelay();
    _loadCourseProgress();
  }

  Future<void> _loadCourseProgress() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final learnerId = prefs.getInt('learnerId');

      if (learnerId != null) {
        final courseService = CourseService();
        final progress = await courseService.getCourseContentProgress(
          learnerId,
          widget.course.coursePackageId ?? 0,
        );

        if (mounted) {
          setState(() {
            _courseProgress = progress;
            _isLoadingProgress = false;
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoadingProgress = false;
        });
      }
    }
  }

  void _hideControlsAfterDelay() {
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted && _isVideoPlaying && !_isVideoEnded) {
        setState(() {
          _showControls = false;
        });
      }
    });
  }

  void _toggleControls() {
    setState(() {
      _showControls = !_showControls;
    });
    if (_showControls) {
      _hideControlsAfterDelay();
    }
  }

  void _toggleFullScreen() {
    setState(() {
      _isFullScreen = !_isFullScreen;
    });
  }

  @override
  void dispose() {
    _videoPlayerController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          CustomScrollView(
            slivers: [
              _buildAppBar(),
              SliverToBoxAdapter(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildCourseInfo(),
                    _buildContentList(),
                  ],
                ),
              ),
            ],
          ),
          if (_isVideoPlaying && _videoPlayerController != null)
            Positioned(
              top: _isFullScreen ? 0 : 0,
              left: 0,
              right: 0,
              bottom: _isFullScreen ? 0 : null,
              child: Container(
                color: Colors.black,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    GestureDetector(
                      onTap: _toggleControls,
                      child: AspectRatio(
                        aspectRatio: _isFullScreen
                            ? MediaQuery.of(context).size.width /
                                MediaQuery.of(context).size.height
                            : _videoPlayerController!.value.aspectRatio,
                        child: VideoPlayer(_videoPlayerController!),
                      ),
                    ),
                    if (_showControls || _isVideoEnded)
                      Container(
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.3),
                        ),
                      ),
                    if (_showControls || _isVideoEnded)
                      Positioned(
                        left: 0,
                        right: 0,
                        bottom: 0,
                        child: _buildVideoControls(),
                      ),
                  ],
                ),
              ),
            ),
          if (_isImageVisible && _currentImageUrl != null)
            Positioned(
              top: 0,
              left: 0,
              right: 0,
              child: Container(
                color: Colors.black,
                child: Stack(
                  alignment: Alignment.topRight,
                  children: [
                    InteractiveViewer(
                      child: Image.network(
                        _currentImageUrl!,
                        fit: BoxFit.contain,
                        height: 300,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: Colors.white),
                      onPressed: () {
                        setState(() {
                          _isImageVisible = false;
                        });
                      },
                    ),
                  ],
                ),
              ),
            ),
          if (_isDocumentVisible && _currentDocumentUrl != null)
            Positioned(
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              child: Container(
                color: Colors.white,
                child: Stack(
                  children: [
                    _buildDocumentViewer(_currentDocumentUrl!),
                    Positioned(
                      top: 0,
                      right: 0,
                      child: IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () {
                          setState(() {
                            _isDocumentVisible = false;
                          });
                        },
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildAppBar() {
    return SliverAppBar(
      expandedHeight: 200.0,
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
    );
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

  Widget _buildContentList() {
    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: widget.course.courseContents.length,
      itemBuilder: (context, contentIndex) {
        final content = widget.course.courseContents[contentIndex];
        return _buildContentSection(content, contentIndex);
      },
    );
  }

  Widget _buildContentSection(CourseContent content, int contentIndex) {
    // Tìm tiến độ tương ứng cho content này
    final contentProgress = _courseProgress?.contents
        .firstWhere((c) => c.contentId == content.contentId,
            orElse: () => ContentProgress(
                  contentId: content.contentId,
                  heading: content.heading,
                  totalContentItems: 0,
                  contentItems: [],
                ));

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 6,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: ExpansionTile(
        title: Row(
          children: [
            Expanded(
              child: Text(
                content.heading,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            if (!_isLoadingProgress && contentProgress != null)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.blue.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '${_calculateContentProgress(contentProgress)}%',
                  style: const TextStyle(
                    color: Colors.blue,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
          ],
        ),
        children: content.courseContentItems.map((item) {
          return _buildContentItem(item, contentIndex,
              content.courseContentItems.indexOf(item), contentProgress);
        }).toList(),
      ),
    );
  }

  double _calculateContentProgress(ContentProgress contentProgress) {
    if (contentProgress.contentItems.isEmpty) return 0;

    double totalProgress = 0;
    for (var item in contentProgress.contentItems) {
      if (item.itemTypeId == 3) {
        // Document
        totalProgress += item.isLearned ? 100 : 0;
      } else if (item.itemTypeId == 2) {
        // Video
        totalProgress += item.completionPercentage;
      }
    }
    return (totalProgress / contentProgress.contentItems.length)
        .roundToDouble();
  }

  Widget _buildContentItem(CourseContentItem item, int contentIndex,
      int itemIndex, ContentProgress? contentProgress) {
    final isSelected = _selectedContentIndex == contentIndex &&
        _selectedItemIndex == itemIndex;

    // Tìm tiến độ tương ứng cho item này
    final itemProgress =
        contentProgress?.contentItems.firstWhere((i) => i.itemId == item.itemId,
            orElse: () => ContentItemProgress(
                  itemId: item.itemId,
                  itemDes: item.itemDes,
                  itemTypeId: item.itemTypeId,
                  itemTypeName: '',
                  isLearned: false,
                  watchTimeInSeconds: 0,
                  completionPercentage: 0,
                ));

    // Tính toán giá trị progress dựa vào loại nội dung
    double progressValue = 0;
    if (itemProgress != null) {
      if (item.itemTypeId == 3) {
        // Tài liệu
        progressValue = itemProgress.isLearned ? 1.0 : 0.0;
      } else if (item.itemTypeId == 2) {
        // Video
        progressValue = itemProgress.completionPercentage / 100;
      }
    }

    return ListTile(
      leading: Container(
        width: 48,
        height: 48,
        decoration: BoxDecoration(
          color: isSelected
              ? const Color(0xFF8C9EFF).withOpacity(0.1)
              : Colors.grey[100],
          borderRadius: BorderRadius.circular(8),
        ),
        child: Stack(
          children: [
            Center(
              child: Icon(
                item.itemTypeId == 1
                    ? Icons.image
                    : item.itemTypeId == 2
                        ? Icons.play_circle_outline
                        : Icons.description,
                color: isSelected ? const Color(0xFF8C9EFF) : Colors.grey[600],
              ),
            ),
            if (!_isLoadingProgress && itemProgress != null)
              Positioned(
                right: 0,
                bottom: 0,
                child: Container(
                  width: 16,
                  height: 16,
                  decoration: BoxDecoration(
                    color: item.itemTypeId == 3
                        ? (itemProgress.isLearned ? Colors.green : Colors.grey)
                        : (itemProgress.completionPercentage >= 100
                            ? Colors.green
                            : itemProgress.completionPercentage > 0
                                ? Colors.orange
                                : Colors.grey),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    item.itemTypeId == 3
                        ? (itemProgress.isLearned ? Icons.check : Icons.remove)
                        : (itemProgress.completionPercentage >= 100
                            ? Icons.check
                            : itemProgress.completionPercentage > 0
                                ? Icons.play_arrow
                                : Icons.remove),
                    size: 12,
                    color: Colors.white,
                  ),
                ),
              ),
          ],
        ),
      ),
      title: Text(
        'Bài ${itemIndex + 1}',
        style: TextStyle(
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          color: isSelected ? const Color(0xFF8C9EFF) : Colors.black,
        ),
      ),
      subtitle: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            item.itemTypeId == 1
                ? 'Hình ảnh'
                : item.itemTypeId == 2
                    ? 'Video'
                    : 'Tài liệu',
            style: TextStyle(
              color: Colors.grey[600],
            ),
          ),
          if (!_isLoadingProgress && itemProgress != null)
            Container(
              margin: const EdgeInsets.only(top: 4),
              child: LinearProgressIndicator(
                value: progressValue,
                backgroundColor: Colors.grey[200],
                valueColor: AlwaysStoppedAnimation<Color>(
                  item.itemTypeId == 3
                      ? (itemProgress.isLearned
                          ? Colors.green
                          : const Color(0xFF8C9EFF))
                      : (itemProgress.completionPercentage >= 100
                          ? Colors.green
                          : const Color(0xFF8C9EFF)),
                ),
              ),
            ),
        ],
      ),
      trailing: Icon(
        isSelected ? Icons.play_circle : Icons.play_circle_outline,
        color: isSelected ? const Color(0xFF8C9EFF) : Colors.grey,
      ),
      onTap: () => _handleContentTap(item, contentIndex, itemIndex),
    );
  }

  void _handleContentTap(
      CourseContentItem item, int contentIndex, int itemIndex) async {
    setState(() {
      _selectedContentIndex = contentIndex;
      _selectedItemIndex = itemIndex;
    });

    if (item.itemTypeId == 1) {
      // Hiển thị hình ảnh
      setState(() {
        _currentImageUrl = item.itemDes;
        _isImageVisible = true;
        _isVideoPlaying = false;
        _isDocumentVisible = false;
      });
    } else if (item.itemTypeId == 2) {
      // Mở video
      setState(() {
        _isImageVisible = false;
        _isDocumentVisible = false;
      });
      _launchVideo(item.itemDes, item);
    } else if (item.itemTypeId == 3) {
      // Hiển thị tài liệu
      setState(() {
        _currentDocumentUrl = item.itemDes;
        _isDocumentVisible = true;
        _isImageVisible = false;
        _isVideoPlaying = false;
      });

      // Cập nhật tiến độ khi mở tài liệu PDF
      try {
        final prefs = await SharedPreferences.getInstance();
        final learnerId = prefs.getInt('learnerId');
        if (learnerId != null) {
          final courseService = CourseService();
          await courseService.updateContentItemProgress(learnerId, item.itemId);

          // Fetch lại tiến độ sau khi cập nhật
          if (mounted) {
            final progress = await courseService.getCourseContentProgress(
              learnerId,
              widget.course.coursePackageId ?? 0,
            );
            setState(() {
              _courseProgress = progress;
            });
          }
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Lỗi khi cập nhật tiến độ: $e'),
            ),
          );
        }
      }
    }
  }

  String _formatDuration(Duration duration) {
    String twoDigits(int n) => n.toString().padLeft(2, '0');
    final hours = twoDigits(duration.inHours);
    final minutes = twoDigits(duration.inMinutes.remainder(60));
    final seconds = twoDigits(duration.inSeconds.remainder(60));
    return duration.inHours > 0
        ? '$hours:$minutes:$seconds'
        : '$minutes:$seconds';
  }

  Future<void> _launchVideo(String videoUrl, CourseContentItem item) async {
    try {
      if (_currentVideoUrl == videoUrl && _isVideoPlaying) {
        setState(() {
          _isVideoPlaying = false;
          _videoPlayerController?.pause();
        });
        return;
      }

      // Tìm tiến độ của video hiện tại
      final itemProgress = _courseProgress?.contents
          .expand((content) => content.contentItems)
          .firstWhere((i) => i.itemId == item.itemId,
              orElse: () => ContentItemProgress(
                    itemId: item.itemId,
                    itemDes: item.itemDes,
                    itemTypeId: item.itemTypeId,
                    itemTypeName: '',
                    isLearned: false,
                    watchTimeInSeconds: 0,
                    completionPercentage: 0,
                  ));

      setState(() {
        _currentVideoUrl = videoUrl;
        _isVideoPlaying = true;
        _isVideoEnded = false;
        _showControls = true;
        _isVideoLearned = itemProgress?.isLearned ?? false;
      });

      _videoPlayerController?.dispose();
      _videoPlayerController = VideoPlayerController.network(videoUrl)
        ..initialize().then((_) async {
          setState(() {});

          // Tua video đến thời điểm đã xem trước đó
          if (itemProgress != null && itemProgress.watchTimeInSeconds > 0) {
            await _videoPlayerController?.seekTo(
              Duration(seconds: itemProgress.watchTimeInSeconds),
            );
          }

          _videoPlayerController?.play();

          // Cập nhật tổng thời lượng video
          final prefs = await SharedPreferences.getInstance();
          final learnerId = prefs.getInt('learnerId');
          if (learnerId != null) {
            final courseService = CourseService();
            final durationInSeconds =
                _videoPlayerController!.value.duration.inSeconds;
            await courseService.updateVideoDuration(
              learnerId,
              item.itemId,
              durationInSeconds,
            );

            // Thêm listener để theo dõi thời gian xem video
            int lastReportedTime = 0;
            _videoPlayerController?.addListener(() async {
              final currentPosition =
                  _videoPlayerController!.value.position.inSeconds;

              // Cập nhật thời gian xem mỗi 1 giây hoặc khi video kết thúc
              if ((currentPosition - lastReportedTime >= 1) ||
                  (_videoPlayerController!.value.position ==
                      _videoPlayerController!.value.duration)) {
                lastReportedTime = currentPosition;
                await courseService.updateVideoWatchTime(
                  learnerId,
                  item.itemId,
                  currentPosition,
                );

                // Fetch lại tiến độ sau mỗi lần cập nhật
                if (mounted) {
                  final progress = await courseService.getCourseContentProgress(
                    learnerId,
                    widget.course.coursePackageId ?? 0,
                  );
                  setState(() {
                    _courseProgress = progress;
                    // Cập nhật lại trạng thái học video
                    _isVideoLearned = progress?.contents
                            .expand((content) => content.contentItems)
                            .firstWhere((i) => i.itemId == item.itemId,
                                orElse: () => ContentItemProgress(
                                      itemId: item.itemId,
                                      itemDes: item.itemDes,
                                      itemTypeId: item.itemTypeId,
                                      itemTypeName: '',
                                      isLearned: false,
                                      watchTimeInSeconds: 0,
                                      completionPercentage: 0,
                                    ))
                            .isLearned ??
                        false;
                  });
                }

                // Kiểm tra nếu video kết thúc
                if (_videoPlayerController!.value.position ==
                    _videoPlayerController!.value.duration) {
                  setState(() {
                    _isVideoEnded = true;
                    _showControls = true;
                  });
                }
              }
            });
          }
        });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi khi mở video: $e'),
          ),
        );
      }
    }
  }

  Future<void> _downloadDocument(String url) async {
    try {
      // Kiểm tra và yêu cầu quyền truy cập bộ nhớ
      if (Platform.isAndroid) {
        var status = await Permission.storage.status;
        if (!status.isGranted) {
          status = await Permission.storage.request();
          if (!status.isGranted) {
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content:
                      Text('Cần cấp quyền truy cập bộ nhớ để tải tài liệu'),
                  duration: Duration(seconds: 2),
                ),
              );
            }
            return;
          }
        }

        // Kiểm tra quyền quản lý bộ nhớ ngoài (Android 11 trở lên)
        if (await Permission.manageExternalStorage.status.isDenied) {
          await Permission.manageExternalStorage.request();
        }
      }

      // Hiển thị dialog loading
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (BuildContext context) {
          return const Center(
            child: CircularProgressIndicator(),
          );
        },
      );

      // Tạo thư mục Downloads nếu chưa tồn tại
      final directory = await getExternalStorageDirectory();
      final downloadDir = Directory('${directory!.path}/Downloads');
      if (!await downloadDir.exists()) {
        await downloadDir.create(recursive: true);
      }

      // Lấy tên file từ URL
      final fileName = url.split('/').last;
      final filePath = '${downloadDir.path}/$fileName';

      // Tải file
      final dio = Dio();
      await dio.download(
        url,
        filePath,
        onReceiveProgress: (received, total) {
          if (total != -1) {
            final progress = (received / total * 100).toStringAsFixed(0);
            // Có thể cập nhật progress ở đây nếu muốn
          }
        },
      );

      // Đóng dialog loading
      if (mounted) {
        Navigator.pop(context);
      }

      // Mở file
      final result = await OpenFilex.open(filePath);
      if (result.type != ResultType.done) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Không thể mở file: ${result.message}'),
              duration: const Duration(seconds: 2),
            ),
          );
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Đã tải và mở tài liệu thành công'),
              duration: Duration(seconds: 2),
            ),
          );
        }
      }
    } catch (e) {
      // Đóng dialog loading nếu có lỗi
      if (mounted) {
        Navigator.pop(context);
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi khi tải tài liệu: $e'),
            duration: const Duration(seconds: 2),
          ),
        );
      }
    }
  }

  Widget _buildDocumentViewer(String url) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF8C9EFF),
        title: const Text('Xem tài liệu'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () {
            setState(() {
              _isDocumentVisible = false;
            });
          },
        ),
      ),
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: BoxDecoration(
          color: Colors.blue[50],
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: Colors.blue[200]!),
        ),
        child: Column(
          children: [
            Expanded(
              child: ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: PDF(
                  enableSwipe: true,
                  swipeHorizontal: false,
                  autoSpacing: true,
                  pageFling: true,
                  defaultPage: 0,
                  fitPolicy: FitPolicy.BOTH,
                  fitEachPage: true,
                  pageSnap: true,
                  onViewCreated: (PDFViewController pdfViewController) async {
                    setState(() {
                      _pdfController = pdfViewController;
                    });
                    try {
                      final prefs = await SharedPreferences.getInstance();
                      final learnerId = prefs.getInt('learnerId');
                      if (learnerId != null) {
                        final courseService = CourseService();
                        await courseService.updateContentItemProgress(
                          learnerId,
                          widget.course.courseContents[_selectedContentIndex]
                              .courseContentItems[_selectedItemIndex].itemId,
                        );

                        if (mounted) {
                          final progress =
                              await courseService.getCourseContentProgress(
                            learnerId,
                            widget.course.coursePackageId ?? 0,
                          );
                          setState(() {
                            _courseProgress = progress;
                          });
                        }
                      }
                    } catch (e) {
                      print('Lỗi khi cập nhật tiến độ PDF: $e');
                    }
                  },
                  onPageChanged: (page, total) {
                    setState(() {
                      _currentPage = page!;
                      _totalPages = total!;
                    });
                  },
                ).fromUrl(
                  url,
                  placeholder: (progress) => Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        CircularProgressIndicator(
                          value: progress / 100,
                        ),
                        const SizedBox(height: 8),
                        Text('Đang tải tài liệu: $progress%'),
                      ],
                    ),
                  ),
                  errorWidget: (error) => Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(
                          Icons.error_outline,
                          color: Colors.red,
                          size: 32,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Không thể tải tài liệu\n$error',
                          textAlign: TextAlign.center,
                          style: const TextStyle(color: Colors.red),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: const BorderRadius.only(
                  bottomLeft: Radius.circular(8),
                  bottomRight: Radius.circular(8),
                ),
              ),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.first_page),
                      onPressed: _currentPage > 0 && _pdfController != null
                          ? () => _pdfController!.setPage(0)
                          : null,
                      tooltip: 'Trang đầu',
                    ),
                    IconButton(
                      icon: const Icon(Icons.navigate_before),
                      onPressed: _currentPage > 0 && _pdfController != null
                          ? () => _pdfController!.setPage(_currentPage - 1)
                          : null,
                      tooltip: 'Trang trước',
                    ),
                    Container(
                      constraints: const BoxConstraints(minWidth: 80),
                      child: Text(
                        'Trang ${_currentPage + 1}/${_totalPages}',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.navigate_next),
                      onPressed: _currentPage < _totalPages - 1 &&
                              _pdfController != null
                          ? () => _pdfController!.setPage(_currentPage + 1)
                          : null,
                      tooltip: 'Trang sau',
                    ),
                    IconButton(
                      icon: const Icon(Icons.last_page),
                      onPressed: _currentPage < _totalPages - 1 &&
                              _pdfController != null
                          ? () => _pdfController!.setPage(_totalPages - 1)
                          : null,
                      tooltip: 'Trang cuối',
                    ),
                    const VerticalDivider(
                      width: 16,
                      thickness: 1,
                    ),
                    IconButton(
                      icon: const Icon(Icons.fullscreen),
                      onPressed: () => _openFullScreen(url),
                      tooltip: 'Xem toàn màn hình',
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _openFullScreen(String url) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => Scaffold(
          appBar: AppBar(
            backgroundColor: const Color(0xFF8C9EFF),
            title: const Text('Xem PDF'),
            leading: IconButton(
              icon: const Icon(Icons.arrow_back),
              onPressed: () => Navigator.pop(context),
            ),
          ),
          body: PDF(
            enableSwipe: true,
            swipeHorizontal: false,
            autoSpacing: true,
            pageFling: true,
            defaultPage: _currentPage,
            fitPolicy: FitPolicy.BOTH,
            fitEachPage: true,
            pageSnap: true,
            onPageChanged: (page, total) {
              setState(() {
                _currentPage = page!;
                _totalPages = total!;
              });
            },
          ).fromUrl(
            url,
            placeholder: (progress) => Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(
                    value: progress / 100,
                  ),
                  const SizedBox(height: 8),
                  Text('Đang tải PDF: $progress%'),
                ],
              ),
            ),
            errorWidget: (error) => Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.error_outline,
                    color: Colors.red,
                    size: 32,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Không thể tải file PDF\n$error',
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: Colors.red),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildVideoControls() {
    return Container(
      padding: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.bottomCenter,
          end: Alignment.topCenter,
          colors: [
            Colors.black.withOpacity(0.7),
            Colors.transparent,
          ],
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            height: 40,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    if (_isVideoEnded)
                      IconButton(
                        icon: const Icon(
                          Icons.replay,
                          color: Colors.white,
                          size: 24,
                        ),
                        onPressed: () {
                          _videoPlayerController?.seekTo(Duration.zero);
                          _videoPlayerController?.play();
                          setState(() {
                            _isVideoEnded = false;
                          });
                        },
                      )
                    else
                      IconButton(
                        icon: Icon(
                          _videoPlayerController!.value.isPlaying
                              ? Icons.pause
                              : Icons.play_arrow,
                          color: Colors.white,
                          size: 24,
                        ),
                        onPressed: () {
                          setState(() {
                            if (_videoPlayerController!.value.isPlaying) {
                              _videoPlayerController?.pause();
                            } else {
                              _videoPlayerController?.play();
                            }
                          });
                        },
                      ),
                    const SizedBox(width: 8),
                    Text(
                      _formatDuration(_videoPlayerController!.value.position),
                      style: const TextStyle(color: Colors.white),
                    ),
                    Text(
                      ' / ${_formatDuration(_videoPlayerController!.value.duration)}',
                      style: const TextStyle(color: Colors.white70),
                    ),
                  ],
                ),
                Row(
                  children: [
                    IconButton(
                      icon: Icon(
                        _isFullScreen
                            ? Icons.fullscreen_exit
                            : Icons.fullscreen,
                        color: Colors.white,
                        size: 24,
                      ),
                      onPressed: _toggleFullScreen,
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: Colors.white),
                      onPressed: () {
                        setState(() {
                          _isVideoPlaying = false;
                          _isFullScreen = false;
                          _videoPlayerController?.pause();
                        });
                      },
                    ),
                  ],
                ),
              ],
            ),
          ),
          GestureDetector(
            onHorizontalDragStart: (details) {
              if (!_isVideoLearned) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Bạn cần xem hết video trước khi có thể tua'),
                    duration: Duration(seconds: 2),
                  ),
                );
              }
            },
            child: VideoProgressIndicator(
              _videoPlayerController!,
              allowScrubbing: _isVideoLearned,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 0),
              colors: const VideoProgressColors(
                playedColor: Colors.red,
                bufferedColor: Colors.grey,
                backgroundColor: Colors.white24,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
