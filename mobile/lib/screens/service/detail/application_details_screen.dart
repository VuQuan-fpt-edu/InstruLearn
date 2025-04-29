import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:video_player/video_player.dart';
import 'package:chewie/chewie.dart';
import 'package:flutter_cached_pdfview/flutter_cached_pdfview.dart';
import '../../../models/learning_registration.dart';
import '../../../models/learning_path_session.dart';
import '../../../services/learning_path_session_service.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';

class ApplicationDetailsScreen extends StatefulWidget {
  final String status;
  final Color statusColor;
  final LearningRegistration registration;

  const ApplicationDetailsScreen({
    Key? key,
    required this.status,
    required this.statusColor,
    required this.registration,
  }) : super(key: key);

  @override
  State<ApplicationDetailsScreen> createState() =>
      _ApplicationDetailsScreenState();
}

class _ApplicationDetailsScreenState extends State<ApplicationDetailsScreen> {
  VideoPlayerController? _videoController;
  ChewieController? _chewieController;
  bool _isVideoInitialized = false;
  final LearningPathSessionService _learningPathSessionService =
      LearningPathSessionService();
  List<LearningPathSession> _learningPathSessions = [];
  bool _isLoadingSessions = true;
  String? _sessionError;
  int _currentPage = 0;
  int _totalPages = 0;
  PDFViewController? _pdfController;

  String _getStatusText(String status) {
    switch (status.toLowerCase()) {
      case 'accepted':
        return 'Chờ thanh toán';
      case 'pending':
        return 'Đang chờ';
      case 'rejected':
        return 'Từ chối';
      case 'fourty':
        return 'Đã thanh toán 40% học phí';
      case 'fourtyfeedbackdone':
        return 'Đã phản hồi - Chờ thanh toán 60%';
      case 'sixty':
        return 'Đã hoàn tất thanh toán học phí';
      case 'cancelled':
        return 'Lịch học đã bị hủy';
      default:
        return status;
    }
  }

  @override
  void initState() {
    super.initState();
    _initializeVideo();
    _loadLearningPathSessions();
  }

  Future<void> _initializeVideo() async {
    if (widget.registration.videoUrl.isNotEmpty &&
        widget.registration.videoUrl.startsWith('http')) {
      try {
        _videoController =
            VideoPlayerController.network(widget.registration.videoUrl);
        await _videoController!
            .initialize()
            .timeout(const Duration(seconds: 15), onTimeout: () {
          // Nếu quá thời gian, đánh dấu lỗi nhưng không gây crash
          print('Video initialization timed out');
          return;
        });

        if (_videoController!.value.isInitialized) {
          _chewieController = ChewieController(
            videoPlayerController: _videoController!,
            autoPlay: false,
            looping: false,
            showControls: true,
            allowPlaybackSpeedChanging: true,
            showControlsOnInitialize: false,
            allowFullScreen: true,
            placeholder: Container(
              color: Colors.black,
              child: const Center(
                child: CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                ),
              ),
            ),
            hideControlsTimer: const Duration(seconds: 3),
            materialProgressColors: ChewieProgressColors(
              playedColor: Colors.blue,
              handleColor: Colors.blue,
              backgroundColor: Colors.grey,
              bufferedColor: Colors.grey[300]!,
            ),
            errorBuilder: (context, errorMessage) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.error_outline,
                      color: Colors.white,
                      size: 32,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Lỗi: $errorMessage',
                      style: const TextStyle(color: Colors.white),
                    ),
                    const SizedBox(height: 8),
                    ElevatedButton(
                      onPressed: _initializeVideo,
                      child: const Text('Thử lại'),
                    ),
                  ],
                ),
              );
            },
          );

          _videoController!.addListener(_onVideoPositionChanged);

          setState(() {
            _isVideoInitialized = true;
          });
        } else {
          print('Video could not be initialized');
        }
      } catch (e) {
        print('Error initializing video: $e');
        setState(() {
          _isVideoInitialized = false;
        });
      }
    } else {
      setState(() {
        _isVideoInitialized = false;
      });
    }
  }

  // Theo dõi trạng thái video
  void _onVideoPositionChanged() {
    // Kiểm tra nếu video kết thúc
    if (_videoController != null &&
        _videoController!.value.position >= _videoController!.value.duration) {
      // Video đã kết thúc, hiển thị nút replay nếu cần
      if (mounted) {
        setState(() {
          // Có thể cập nhật trạng thái ở đây nếu cần hiển thị nút replay
        });
      }
    }

    // Kiểm tra nếu video bị tua về đầu nhưng không chạy
    if (_videoController != null &&
        _videoController!.value.position == Duration.zero &&
        !_videoController!.value.isPlaying) {
      // Video đã bị tua về đầu nhưng không chạy, tự động play lại
      _videoController!.play();
    }
  }

  @override
  void dispose() {
    // Dọn dẹp listeners trước khi dispose controller
    if (_videoController != null) {
      _videoController!.removeListener(_onVideoPositionChanged);
    }
    _chewieController?.dispose();
    _videoController?.dispose();
    super.dispose();
  }

  Widget _buildInfoSection(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        text,
        style: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: Colors.blue,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Chi tiết đơn đăng ký'),
        backgroundColor: const Color(0xFF8C9EFF),
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [const Color(0xFF8C9EFF).withOpacity(0.2), Colors.white],
          ),
        ),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildStatusStepper(),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(
                  vertical: 12,
                  horizontal: 16,
                ),
                color: widget.statusColor,
                child: Text(
                  _getStatusText(widget.status),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildTeacherInfo(),
                    const SizedBox(height: 16),
                    _buildLearningInfo(),
                    const SizedBox(height: 16),
                    if (widget.registration.videoUrl.isNotEmpty) ...[
                      _buildAssessmentVideo(),
                      const SizedBox(height: 16),
                    ],
                    if (widget.registration.learningRequest?.isNotEmpty ==
                        true) ...[
                      const Text(
                        'Mục tiêu học tập:',
                        style: TextStyle(
                            fontSize: 15, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.blue[50],
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.blue[200]!),
                        ),
                        child: Text(
                          widget.registration.learningRequest!,
                          style: const TextStyle(
                            fontSize: 14,
                            color: Colors.black87,
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],
                    if (widget.registration.responseDescription != null) ...[
                      const Text(
                        'Phản hồi từ trung tâm:',
                        style: TextStyle(
                            fontSize: 15, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.blue[50],
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.blue[200]!),
                        ),
                        child: Text(
                          widget.registration.responseDescription ?? '',
                          style: const TextStyle(
                            fontSize: 14,
                            color: Colors.black87,
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],
                    if (widget.registration.syllabusLink != null &&
                        widget.registration.syllabusLink!.isNotEmpty) ...[
                      const Text(
                        'Giáo trình trung tâm đề xuất:',
                        style: TextStyle(
                            fontSize: 15, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      Container(
                        width: double.infinity,
                        height: 400,
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
                                  onViewCreated: (controller) {
                                    setState(() {
                                      _pdfController = controller;
                                    });
                                  },
                                  onPageChanged: (page, total) {
                                    setState(() {
                                      _currentPage = page!;
                                      _totalPages = total!;
                                    });
                                  },
                                  enableSwipe: true,
                                  swipeHorizontal: false,
                                  autoSpacing: true,
                                  pageFling: true,
                                  defaultPage: 0,
                                  fitPolicy: FitPolicy.BOTH,
                                  fitEachPage: true,
                                  pageSnap: true,
                                ).fromUrl(
                                  widget.registration.syllabusLink!,
                                  placeholder: (progress) => Center(
                                    child: Column(
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: [
                                        CircularProgressIndicator(
                                          value: progress / 100,
                                        ),
                                        SizedBox(height: 8),
                                        Text('Đang tải PDF: $progress%'),
                                      ],
                                    ),
                                  ),
                                  errorWidget: (error) => Center(
                                    child: Column(
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: [
                                        Icon(
                                          Icons.error_outline,
                                          color: Colors.red,
                                          size: 32,
                                        ),
                                        SizedBox(height: 8),
                                        Text(
                                          'Không thể tải file PDF\n$error',
                                          textAlign: TextAlign.center,
                                          style: TextStyle(color: Colors.red),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                            ),
                            Container(
                              padding: EdgeInsets.symmetric(
                                  vertical: 8, horizontal: 16),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.only(
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
                                      icon: Icon(Icons.first_page),
                                      onPressed: _currentPage > 0 &&
                                              _pdfController != null
                                          ? () => _pdfController!.setPage(0)
                                          : null,
                                      tooltip: 'Trang đầu',
                                    ),
                                    IconButton(
                                      icon: Icon(Icons.navigate_before),
                                      onPressed: _currentPage > 0 &&
                                              _pdfController != null
                                          ? () => _pdfController!
                                              .setPage(_currentPage - 1)
                                          : null,
                                      tooltip: 'Trang trước',
                                    ),
                                    Container(
                                      constraints: BoxConstraints(minWidth: 80),
                                      child: Text(
                                        'Trang ${_currentPage + 1}/${_totalPages}',
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                        ),
                                        textAlign: TextAlign.center,
                                      ),
                                    ),
                                    IconButton(
                                      icon: Icon(Icons.navigate_next),
                                      onPressed:
                                          _currentPage < _totalPages - 1 &&
                                                  _pdfController != null
                                              ? () => _pdfController!
                                                  .setPage(_currentPage + 1)
                                              : null,
                                      tooltip: 'Trang sau',
                                    ),
                                    IconButton(
                                      icon: Icon(Icons.last_page),
                                      onPressed:
                                          _currentPage < _totalPages - 1 &&
                                                  _pdfController != null
                                              ? () => _pdfController!
                                                  .setPage(_totalPages - 1)
                                              : null,
                                      tooltip: 'Trang cuối',
                                    ),
                                    const VerticalDivider(
                                      width: 16,
                                      thickness: 1,
                                    ),
                                    IconButton(
                                      icon: const Icon(Icons.fullscreen),
                                      onPressed: _openFullScreen,
                                      tooltip: 'Xem toàn màn hình',
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],
                    _buildLearningPathSessions(),
                    const SizedBox(height: 16),
                    if (widget.registration.price != null) ...[
                      const Text(
                        'Thông tin học phí:',
                        style: TextStyle(
                            fontSize: 15, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      Text(
                          'Tổng học phí: ${_formatCurrency(widget.registration.price)} VNĐ'),
                      if (widget.registration.remainingAmount != null)
                        Text(
                          'Số tiền còn lại cần thanh toán (60%): ${_formatCurrency(widget.registration.remainingAmount)} VNĐ',
                          style: const TextStyle(
                            color: Colors.red,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      if (widget.registration.acceptedDate != null)
                        Text(
                            'Ngày duyệt đơn: ${widget.registration.acceptedDate!.split('T')[0]}'),
                      if (widget.registration.paymentDeadline != null &&
                          widget.status != 'Fourty')
                        Text(
                            'Hạn thanh toán: ${widget.registration.paymentDeadline!.split('T')[0]}'),
                      if (widget.registration.daysRemaining != null &&
                          widget.status != 'Fourty')
                        Container(
                          margin: const EdgeInsets.only(top: 8),
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: widget.registration.daysRemaining! <= 3
                                ? Colors.red[50]
                                : Colors.blue[50],
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: widget.registration.daysRemaining! <= 3
                                  ? Colors.red
                                  : Colors.blue,
                            ),
                          ),
                          child: Row(
                            children: [
                              Icon(
                                widget.registration.daysRemaining! <= 3
                                    ? Icons.warning
                                    : Icons.info_outline,
                                color: widget.registration.daysRemaining! <= 3
                                    ? Colors.red
                                    : Colors.blue,
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  widget.registration.daysRemaining! <= 3
                                      ? 'Còn ${widget.registration.daysRemaining} ngày để thanh toán học phí!'
                                      : 'Còn ${widget.registration.daysRemaining} ngày để thanh toán học phí',
                                  style: TextStyle(
                                    color:
                                        widget.registration.daysRemaining! <= 3
                                            ? Colors.red
                                            : Colors.blue,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      if (widget.registration.regisTypeId == 1) ...[
                        if (widget.status == 'Accepted') ...[
                          Text(
                            'Học phí cần thanh toán trước (40%): ${_formatCurrency((widget.registration.price ?? 0) ~/ 100 * 40)} VNĐ',
                            style: const TextStyle(
                              color: Colors.red,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                        if (widget.status == 'FourtyFeedbackDone') ...[
                          Text(
                            'Học phí cần thanh toán (60% còn lại): ${_formatCurrency((widget.registration.price ?? 0) ~/ 100 * 60)} VNĐ',
                            style: const TextStyle(
                              color: Colors.red,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                        if (widget.status == 'Sixty') ...[
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.green[50],
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: Colors.green),
                            ),
                            child: const Row(
                              children: [
                                Icon(Icons.check_circle, color: Colors.green),
                                SizedBox(width: 8),
                                Text(
                                  'Bạn đã thanh toán toàn bộ học phí',
                                  style: TextStyle(
                                    color: Colors.green,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ],
                      if (widget.registration.regisTypeId == 3 &&
                          widget.status == 'Accepted') ...[
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.blue[50],
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Colors.blue),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Icon(Icons.payment, color: Colors.blue[700]),
                                  const SizedBox(width: 8),
                                  Text(
                                    'Phí đã thanh toán (10%): ${_formatCurrency((widget.registration.price ?? 0) ~/ 100 * 10)} VNĐ',
                                    style: TextStyle(
                                      color: Colors.blue[700],
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  Icon(Icons.pending_actions,
                                      color: Colors.red[700]),
                                  const SizedBox(width: 8),
                                  Text(
                                    'Phí cần thanh toán còn lại (90%): ${_formatCurrency((widget.registration.price ?? 0) ~/ 100 * 90)} VNĐ',
                                    style: TextStyle(
                                      color: Colors.red[700],
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                      if (widget.registration.regisTypeId == 1 &&
                          widget.status == 'Accepted' &&
                          _learningPathSessions
                              .any((s) => s.isCompleted == true)) ...[
                        const SizedBox(height: 16),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: _showPaymentConfirmationDialog,
                            icon: const Icon(Icons.payment),
                            label: const Text('Thanh toán học phí'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.green,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                            ),
                          ),
                        ),
                      ],
                      if (widget.registration.regisTypeId == 1 &&
                          widget.status == 'FourtyFeedbackDone') ...[
                        const SizedBox(height: 16),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: _showRemainingPaymentConfirmationDialog,
                            icon: const Icon(Icons.payment),
                            label: const Text('Thanh toán 60% còn lại'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.blue,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                            ),
                          ),
                        ),
                      ],
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTeacherInfo() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Giáo viên chỉ định:',
          style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        Text('Giáo viên: ${widget.registration.teacherName}'),
        Text('Nhạc cụ: ${widget.registration.majorName}'),
        if (widget.registration.levelName != null) ...[
          Text('Trình độ: ${widget.registration.levelName}'),
        ],
        if (widget.registration.levelPrice != null) ...[
          Text(
              'Giá theo trình độ: ${_formatCurrency(widget.registration.levelPrice)} VNĐ / buổi'),
        ],
      ],
    );
  }

  Widget _buildLearningInfo() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Thông tin học tập:',
          style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        Text('Loại học: ${widget.registration.regisTypeName}'),
        Text('Ngày bắt đầu: ${widget.registration.startDay}'),
        Text('Học vào: ${widget.registration.learningDays.join(", ")}'),
        Text('Thời gian bắt đầu: ${widget.registration.timeStart}'),
        Text('Thời gian kết thúc: ${widget.registration.timeEnd}'),
        Text('Thời lượng học: ${widget.registration.timeLearning} phút'),
        Text('Tổng số buổi: ${widget.registration.numberOfSession}'),
      ],
    );
  }

  Widget _buildAssessmentInfo() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Đánh giá:',
          style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        Text('Điểm đánh giá: ${widget.registration.score}/10'),
        if (widget.registration.levelAssigned != null)
          Text('Trình độ: ${widget.registration.levelAssigned}'),
      ],
    );
  }

  Widget _buildAssessmentVideo() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Video đánh giá trình độ:',
          style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        Container(
          width: double.infinity,
          height: 200,
          decoration: BoxDecoration(
            color: Colors.black,
            borderRadius: BorderRadius.circular(8),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: _isVideoInitialized && _chewieController != null
                ? Stack(
                    fit: StackFit.expand,
                    children: [
                      // Video player
                      Chewie(controller: _chewieController!),

                      // Nút replay khi video kết thúc
                      if (_videoController != null &&
                          _videoController!.value.position >=
                              _videoController!.value.duration)
                        Center(
                          child: IconButton(
                            icon: const Icon(
                              Icons.replay,
                              color: Colors.white,
                              size: 48,
                            ),
                            onPressed: () {
                              _videoController!.seekTo(Duration.zero);
                              _videoController!.play();
                            },
                          ),
                        ),
                    ],
                  )
                : widget.registration.videoUrl.startsWith('http')
                    ? Stack(
                        fit: StackFit.expand,
                        children: [
                          // Hiển thị hình thu nhỏ hoặc backdrop
                          const Center(
                            child: Icon(
                              Icons.video_library,
                              size: 64,
                              color: Colors.white54,
                            ),
                          ),

                          // Nút play
                          Center(
                            child: InkWell(
                              onTap: () {
                                // Thử khởi tạo lại video
                                _initializeVideo();

                                // Hiển thị thông báo cho người dùng
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('Đang tải video...'),
                                    duration: Duration(seconds: 2),
                                  ),
                                );
                              },
                              child: Container(
                                width: 64,
                                height: 64,
                                decoration: BoxDecoration(
                                  color: Colors.blue.withOpacity(0.7),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(
                                  Icons.play_arrow,
                                  color: Colors.white,
                                  size: 40,
                                ),
                              ),
                            ),
                          ),

                          // Nút mở trong trình duyệt ở góc phải dưới
                          Positioned(
                            right: 8,
                            bottom: 8,
                            child: IconButton(
                              icon: const Icon(
                                Icons.open_in_new,
                                color: Colors.white,
                              ),
                              onPressed: () {
                                // Hiển thị URL của video
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(
                                        'Video URL: ${widget.registration.videoUrl}'),
                                    action: SnackBarAction(
                                      label: 'Copy',
                                      onPressed: () {
                                        // Copy URL vào clipboard
                                      },
                                    ),
                                  ),
                                );
                              },
                              tooltip: 'Mở trong trình duyệt',
                            ),
                          ),
                        ],
                      )
                    : const Center(
                        child: Icon(
                          Icons.video_file,
                          size: 50,
                          color: Colors.white,
                        ),
                      ),
          ),
        ),
        // Thêm nút tải lại video
        if (_isVideoInitialized && _videoController != null)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                TextButton.icon(
                  icon: const Icon(Icons.replay),
                  label: const Text('Xem lại từ đầu'),
                  onPressed: () {
                    _videoController!.seekTo(Duration.zero);
                    _videoController!.play();
                  },
                ),
              ],
            ),
          ),
      ],
    );
  }

  Widget _buildFeedback() {
    if (widget.registration.feedback == null) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Phản hồi:',
          style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.yellow[100],
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.yellow[700]!),
          ),
          child: RichText(
            text: TextSpan(
              children: [
                const TextSpan(
                  text: '[Trung tâm âm nhạc instruLearn]: ',
                  style: TextStyle(
                    color: Colors.blue,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                TextSpan(
                  text: widget.registration.feedback ?? '',
                  style: const TextStyle(color: Colors.black87),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  int _calculateDuration(String start, String end) {
    final startTime = TimeOfDay(
      hour: int.parse(start.split(':')[0]),
      minute: int.parse(start.split(':')[1]),
    );
    final endTime = TimeOfDay(
      hour: int.parse(end.split(':')[0]),
      minute: int.parse(end.split(':')[1]),
    );

    final startMinutes = startTime.hour * 60 + startTime.minute;
    final endMinutes = endTime.hour * 60 + endTime.minute;
    return endMinutes - startMinutes;
  }

  String _formatCurrency(num? amount) {
    if (amount == null) return '0';
    final formatted = amount.toStringAsFixed(0);
    final chars = formatted.split('').reversed.toList();
    final withCommas = <String>[];
    for (var i = 0; i < chars.length; i++) {
      if (i > 0 && i % 3 == 0) {
        withCommas.add(',');
      }
      withCommas.add(chars[i]);
    }
    return withCommas.reversed.join('');
  }

  // Hàm hiển thị dialog xác nhận thanh toán
  void _showPaymentConfirmationDialog() async {
    try {
      // Lấy thông tin số dư ví
      final prefs = await SharedPreferences.getInstance();
      final learnerId = prefs.getInt('learnerId');
      final token = prefs.getString('token');

      if (learnerId == null || token == null) {
        _showErrorMessage('Vui lòng đăng nhập lại');
        return;
      }

      // Hiển thị dialog loading
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => const Center(child: CircularProgressIndicator()),
      );

      // Gọi API lấy số dư
      final walletResponse = await http.get(
        Uri.parse(
          'https://instrulearnapplication.azurewebsites.net/api/wallet/$learnerId',
        ),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer $token',
        },
      );

      // Đóng dialog loading
      Navigator.pop(context);

      if (walletResponse.statusCode != 200) {
        _showErrorMessage('Không thể tải thông tin ví');
        return;
      }

      final walletData = json.decode(walletResponse.body);
      if (walletData['isSucceed'] != true) {
        _showErrorMessage(
            walletData['message'] ?? 'Không thể tải thông tin ví');
        return;
      }

      final double balance = walletData['data']['balance'].toDouble();
      final int totalFee = widget.registration.price ?? 0;
      final int amountToPay = (totalFee * 40) ~/ 100; // Tính 40% học phí
      final double remainingBalance = balance - amountToPay;

      // Hiển thị dialog xác nhận thanh toán
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Xác nhận thanh toán'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Số dư hiện tại: ${_formatCurrency(balance)} VNĐ'),
              const SizedBox(height: 8),
              Text('Tổng học phí: ${_formatCurrency(totalFee)} VNĐ'),
              const SizedBox(height: 8),
              Text(
                  'Số tiền cần thanh toán (40%): ${_formatCurrency(amountToPay)} VNĐ',
                  style: const TextStyle(
                      color: Colors.red, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Text(
                  'Số dư sau khi thanh toán: ${_formatCurrency(remainingBalance)} VNĐ'),
              const SizedBox(height: 16),
              if (remainingBalance < 0)
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.red[50],
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.red),
                  ),
                  child: const Text(
                    'Số dư không đủ để thanh toán. Vui lòng nạp thêm tiền vào ví.',
                    style: TextStyle(color: Colors.red),
                  ),
                ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Hủy'),
            ),
            ElevatedButton(
              onPressed: remainingBalance < 0
                  ? null // Disable nếu không đủ tiền
                  : () {
                      Navigator.pop(context);
                      _processPayment();
                    },
              child: const Text('Xác nhận thanh toán'),
            ),
          ],
        ),
      );
    } catch (e) {
      _showErrorMessage('Lỗi: ${e.toString()}');
    }
  }

  // Xử lý thanh toán
  Future<void> _processPayment() async {
    try {
      final int totalFee = widget.registration.price ?? 0;
      final int amountToPay = (totalFee * 40) ~/ 100; // Tính 40% học phí

      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => const Center(child: CircularProgressIndicator()),
      );

      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token == null) {
        Navigator.pop(context);
        _showErrorMessage('Vui lòng đăng nhập lại');
        return;
      }

      // Gọi API thanh toán
      final paymentResponse = await http.post(
        Uri.parse(
          'https://instrulearnapplication.azurewebsites.net/api/Payment/process-learning-payment',
        ),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer $token',
        },
        body: json.encode({
          'learningRegisId': widget.registration.learningRegisId,
          'paymentMethod': 0,
          'amount': amountToPay // Thêm số tiền thanh toán (40%)
        }),
      );

      Navigator.pop(context);

      if (paymentResponse.statusCode == 200) {
        final paymentData = json.decode(paymentResponse.body);
        if (paymentData['isSucceed'] == true) {
          _showSuccessDialog();
        } else {
          _showErrorMessage(
              paymentData['message'] ?? 'Thanh toán không thành công');
        }
      } else {
        _showErrorMessage('Lỗi kết nối: ${paymentResponse.statusCode}');
      }
    } catch (e) {
      Navigator.pop(context);
      _showErrorMessage('Lỗi: ${e.toString()}');
    }
  }

  // Hiển thị dialog thành công
  void _showSuccessDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Thanh toán thành công'),
        content: const Text(
            'Học phí đã được thanh toán thành công. Chúc bạn học tốt!'),
        actions: [
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context); // Đóng dialog

              // Quay về màn hình home (pop đến khi hết stack)
              Navigator.of(context).popUntil((route) => route.isFirst);
            },
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  // Hiển thị thông báo lỗi
  void _showErrorMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  // Hiển thị dialog xác nhận thanh toán 60% còn lại
  void _showRemainingPaymentConfirmationDialog() async {
    try {
      // Lấy thông tin số dư ví
      final prefs = await SharedPreferences.getInstance();
      final learnerId = prefs.getInt('learnerId');
      final token = prefs.getString('token');

      if (learnerId == null || token == null) {
        _showErrorMessage('Vui lòng đăng nhập lại');
        return;
      }

      // Hiển thị dialog loading
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => const Center(child: CircularProgressIndicator()),
      );

      // Gọi API lấy số dư
      final walletResponse = await http.get(
        Uri.parse(
          'https://instrulearnapplication.azurewebsites.net/api/wallet/$learnerId',
        ),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer $token',
        },
      );

      // Đóng dialog loading
      Navigator.pop(context);

      if (walletResponse.statusCode != 200) {
        _showErrorMessage('Không thể tải thông tin ví');
        return;
      }

      final walletData = json.decode(walletResponse.body);
      if (walletData['isSucceed'] != true) {
        _showErrorMessage(
            walletData['message'] ?? 'Không thể tải thông tin ví');
        return;
      }

      final double balance = walletData['data']['balance'].toDouble();
      final int totalFee = widget.registration.price ?? 0;
      final int amountToPay = (totalFee * 60) ~/ 100; // Tính 60% học phí
      final double remainingBalance = balance - amountToPay;

      // Hiển thị dialog xác nhận thanh toán
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Xác nhận thanh toán 60% còn lại'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Số dư hiện tại: ${_formatCurrency(balance)} VNĐ'),
              const SizedBox(height: 8),
              Text('Tổng học phí: ${_formatCurrency(totalFee)} VNĐ'),
              const SizedBox(height: 8),
              Text(
                  'Số tiền cần thanh toán (60%): ${_formatCurrency(amountToPay)} VNĐ',
                  style: const TextStyle(
                      color: Colors.red, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Text(
                  'Số dư sau khi thanh toán: ${_formatCurrency(remainingBalance)} VNĐ'),
              const SizedBox(height: 16),
              if (remainingBalance < 0)
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.red[50],
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.red),
                  ),
                  child: const Text(
                    'Số dư không đủ để thanh toán. Vui lòng nạp thêm tiền vào ví.',
                    style: TextStyle(color: Colors.red),
                  ),
                ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Hủy'),
            ),
            ElevatedButton(
              onPressed: remainingBalance < 0
                  ? null // Disable nếu không đủ tiền
                  : () {
                      Navigator.pop(context);
                      _processRemainingPayment();
                    },
              child: const Text('Xác nhận thanh toán'),
            ),
          ],
        ),
      );
    } catch (e) {
      _showErrorMessage('Lỗi: ${e.toString()}');
    }
  }

  // Xử lý thanh toán 60% còn lại
  Future<void> _processRemainingPayment() async {
    try {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => const Center(child: CircularProgressIndicator()),
      );

      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token == null) {
        Navigator.pop(context);
        _showErrorMessage('Vui lòng đăng nhập lại');
        return;
      }

      // Gọi API thanh toán 60% còn lại
      final paymentResponse = await http.post(
        Uri.parse(
          'https://instrulearnapplication.azurewebsites.net/api/Payment/process-remaining-payment/${widget.registration.learningRegisId}',
        ),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer $token',
        },
      );

      Navigator.pop(context);

      if (paymentResponse.statusCode == 200) {
        final paymentData = json.decode(paymentResponse.body);
        if (paymentData['isSucceed'] == true) {
          _showSuccessDialog();
        } else {
          _showErrorMessage(
              paymentData['message'] ?? 'Thanh toán không thành công');
        }
      } else {
        _showErrorMessage('Lỗi kết nối: ${paymentResponse.statusCode}');
      }
    } catch (e) {
      Navigator.pop(context);
      _showErrorMessage('Lỗi: ${e.toString()}');
    }
  }

  Future<void> _loadLearningPathSessions() async {
    try {
      setState(() {
        _isLoadingSessions = true;
        _sessionError = null;
      });

      final sessions =
          await _learningPathSessionService.getLearningPathSessions(
        widget.registration.learningRegisId,
      );

      setState(() {
        _learningPathSessions = sessions;
        _isLoadingSessions = false;
      });
    } catch (e) {
      setState(() {
        _sessionError = e.toString();
        _isLoadingSessions = false;
      });
    }
  }

  Widget _buildLearningPathSessions() {
    // Nếu trạng thái là pending thì không hiển thị lộ trình học tập
    if (widget.status.toLowerCase() == 'pending') {
      return const SizedBox.shrink();
    }

    if (_isLoadingSessions) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_sessionError != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Lỗi: $_sessionError',
              style: const TextStyle(color: Colors.red),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _loadLearningPathSessions,
              child: const Text('Thử lại'),
            ),
          ],
        ),
      );
    }

    // Ẩn hoàn toàn nếu tất cả session đều isCompleted == false
    if (_learningPathSessions.isEmpty ||
        _learningPathSessions.every((s) => s.isCompleted == false)) {
      if (widget.status.toLowerCase() == 'accepted') {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Lộ trình học tập:',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.blue[50],
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.blue[200]!),
              ),
              child: const Text(
                'Lộ trình học tập của học viên đang được giáo viên soạn, nếu giáo viên đã soạn xong lộ trình học viên sẽ nhận được thông báo sớm nhất trong Email',
                style: TextStyle(
                  color: Colors.black87,
                  fontSize: 14,
                ),
              ),
            ),
          ],
        );
      } else {
        return const SizedBox.shrink();
      }
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Lộ trình học tập:',
          style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: _learningPathSessions.length,
          itemBuilder: (context, index) {
            final session = _learningPathSessions[index];
            return Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor:
                      session.isCompleted ? Colors.green : Colors.blue,
                  child: Icon(
                    session.isCompleted ? Icons.check : Icons.schedule,
                    color: Colors.white,
                  ),
                ),
                title: Text(
                  session.title,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                subtitle: Text(session.description),
                trailing: Text(
                  'Buổi ${session.sessionNumber}',
                  style: TextStyle(
                    color: session.isCompleted ? Colors.green : Colors.blue,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  void _openFullScreen() {
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
            widget.registration.syllabusLink!,
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

  Widget _buildStatusStepper() {
    // Xác định các bước
    final List<Map<String, String>> steps = [
      {'key': 'pending', 'label': 'Chờ duyệt'},
      {'key': 'accepted', 'label': 'Chờ giáo viên tạo lộ trình'},
      {'key': 'accepted_path', 'label': 'Đã có lộ trình học'},
      {'key': 'fourty', 'label': 'Đã thanh toán 40%'},
      {'key': 'fourtyfeedbackdone', 'label': 'Chờ thanh toán 60%'},
      {'key': 'sixty', 'label': 'Hoàn tất học phí'},
    ];

    // Xác định trạng thái hiện tại
    String status = widget.status.toLowerCase();
    bool hasLearningPath =
        _learningPathSessions.any((s) => s.isCompleted == true);

    int currentStep = 0;
    if (status == 'pending') {
      currentStep = 0;
    } else if (status == 'rejected') {
      // Nếu bị từ chối thì chỉ hiện rejected
      return Container(
        margin: const EdgeInsets.symmetric(vertical: 16),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.red[50],
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: Colors.red),
        ),
        child: Row(
          children: const [
            Icon(Icons.cancel, color: Colors.red),
            SizedBox(width: 8),
            Text('Đơn đã bị từ chối bởi trung tâm',
                style:
                    TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
          ],
        ),
      );
    } else if (status == 'cancelled') {
      return Container(
        margin: const EdgeInsets.symmetric(vertical: 16),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.red[50],
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: Colors.red),
        ),
        child: Row(
          children: const [
            Icon(Icons.cancel, color: Colors.red),
            SizedBox(width: 8),
            Text('Lịch học đã bị hủy',
                style:
                    TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
          ],
        ),
      );
    } else if (status == 'accepted') {
      currentStep = hasLearningPath ? 2 : 1;
    } else if (status == 'fourty') {
      currentStep = 3;
    } else if (status == 'fourtyfeedbackdone') {
      currentStep = 4;
    } else if (status == 'sixty') {
      currentStep = 5;
    }

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: List.generate(steps.length, (index) {
          final isActive = index == currentStep;
          final isDone = index < currentStep;
          // Ẩn bước "Đã có lộ trình học" nếu chưa có lộ trình
          if (steps[index]['key'] == 'accepted_path' && !hasLearningPath) {
            return const SizedBox.shrink();
          }
          // Ẩn bước "Chờ giáo viên tạo lộ trình" nếu đã có lộ trình
          if (steps[index]['key'] == 'accepted' && hasLearningPath) {
            return const SizedBox.shrink();
          }
          return Expanded(
            child: Column(
              children: [
                CircleAvatar(
                  radius: 16,
                  backgroundColor: isActive
                      ? Colors.blue
                      : isDone
                          ? Colors.green
                          : Colors.grey[300],
                  child: isDone
                      ? const Icon(Icons.check, color: Colors.white, size: 18)
                      : Text(
                          '${index + 1}',
                          style: TextStyle(
                            color: isActive ? Colors.white : Colors.black,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                ),
                const SizedBox(height: 4),
                Text(
                  steps[index]['label']!,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 12,
                    color: isActive
                        ? Colors.blue
                        : isDone
                            ? Colors.green
                            : Colors.grey,
                    fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
                  ),
                ),
              ],
            ),
          );
        }),
      ),
    );
  }
}
