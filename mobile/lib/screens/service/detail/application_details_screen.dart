import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:video_player/video_player.dart';
import 'package:chewie/chewie.dart';
import '../../../models/learning_registration.dart';

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

  @override
  void initState() {
    super.initState();
    _initializeVideo();
  }

  Future<void> _initializeVideo() async {
    if (widget.registration.videoUrl.startsWith('http')) {
      _videoController =
          VideoPlayerController.network(widget.registration.videoUrl);
      try {
        await _videoController!.initialize();
        _chewieController = ChewieController(
          videoPlayerController: _videoController!,
          autoPlay: false,
          looping: false,
          showControlsOnInitialize: false,
          allowFullScreen: true,
          deviceOrientationsAfterFullScreen: [DeviceOrientation.portraitUp],
          placeholder: Container(
            color: Colors.black,
            child: const Center(child: CircularProgressIndicator()),
          ),
          materialProgressColors: ChewieProgressColors(
            playedColor: Colors.blue,
            handleColor: Colors.blue,
            backgroundColor: Colors.grey,
            bufferedColor: Colors.grey[300]!,
          ),
        );
        setState(() {
          _isVideoInitialized = true;
        });
      } catch (e) {
        print('Error initializing video: $e');
      }
    }
  }

  @override
  void dispose() {
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
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(
                  vertical: 12,
                  horizontal: 16,
                ),
                color: widget.statusColor,
                child: Text(
                  widget.status,
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
                    _buildInfoSection(
                        'Type: ${widget.registration.regisTypeName}'),
                    _buildInfoSection(
                        'Create date: ${widget.registration.requestDate.split('T')[0]}'),
                    const SizedBox(height: 16),
                    _buildTeacherInfo(),
                    const SizedBox(height: 16),
                    _buildLearningInfo(),
                    const SizedBox(height: 16),
                    if (widget.registration.score != null) ...[
                      _buildAssessmentInfo(),
                      const SizedBox(height: 16),
                    ],
                    if (widget.registration.videoUrl.isNotEmpty) ...[
                      _buildAssessmentVideo(),
                      const SizedBox(height: 16),
                    ],
                    if (widget.registration.feedback != null) ...[
                      _buildFeedback(),
                      const SizedBox(height: 16),
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
        Text(widget.registration.teacherName),
        Text('Nhạc cụ: ${widget.registration.majorName}'),
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
        Text('Học vào: ${widget.registration.learningDays.join(", ")}'),
        Text('Vào lúc: ${widget.registration.timeStart}'),
        Text(
            'Thời lượng học: ${_calculateDuration(widget.registration.timeStart, widget.registration.timeEnd)} phút'),
        Text('Tổng số buổi: ${widget.registration.numberOfSession}'),
        if (widget.registration.status == 'Accepted' &&
            widget.registration.price != null) ...[
          const SizedBox(height: 16),
          const Text(
            'Thông tin học phí:',
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Text(
              'Học phí mỗi buổi: ${_formatCurrency(widget.registration.price!)} VNĐ'),
          Text(
              'Tổng học phí: ${_formatCurrency(widget.registration.price! * widget.registration.numberOfSession)} VNĐ'),
          Text(
            'Học phí cần thanh toán trước (40%): ${_formatCurrency((widget.registration.price! * widget.registration.numberOfSession * 0.4).round())} VNĐ',
            style: const TextStyle(
              color: Colors.red,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
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
            child: Stack(
              fit: StackFit.expand,
              children: [
                if (_isVideoInitialized && _chewieController != null)
                  Chewie(controller: _chewieController!)
                else if (widget.registration.videoUrl.startsWith('http'))
                  const Center(
                    child: CircularProgressIndicator(
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  )
                else
                  const Center(
                    child: Icon(
                      Icons.video_file,
                      size: 50,
                      color: Colors.white,
                    ),
                  ),
              ],
            ),
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

  String _formatCurrency(num amount) {
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
}
