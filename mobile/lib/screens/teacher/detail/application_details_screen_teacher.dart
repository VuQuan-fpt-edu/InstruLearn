import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:video_player/video_player.dart';
import 'package:chewie/chewie.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:flutter_cached_pdfview/flutter_cached_pdfview.dart';
import '../../../models/teacher_learning_registration.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class ApplicationDetailsScreenTeacher extends StatefulWidget {
  final String status;
  final Color statusColor;
  final TeacherLearningRegistration registration;

  const ApplicationDetailsScreenTeacher({
    Key? key,
    required this.status,
    required this.statusColor,
    required this.registration,
  }) : super(key: key);

  @override
  State<ApplicationDetailsScreenTeacher> createState() =>
      _ApplicationDetailsScreenTeacherState();
}

class _ApplicationDetailsScreenTeacherState
    extends State<ApplicationDetailsScreenTeacher> {
  VideoPlayerController? _videoController;
  ChewieController? _chewieController;
  bool _isVideoInitialized = false;
  List<Map<String, dynamic>> _sessions = [];
  final List<TextEditingController> _titleControllers = [];
  final List<TextEditingController> _descriptionControllers = [];
  bool _isCreatingSession = false;
  bool _isLoadingExistingSessions = false;
  List<Map<String, dynamic>>? _existingSessions;
  int _currentPage = 0;
  int _totalPages = 0;
  PDFViewController? _pdfController;

  String _getStatusText(String status) {
    if (status == null) return 'Không xác định';

    switch (status.toLowerCase()) {
      case 'accepted':
        return 'Đang đợi giáo trình từ giảng viên';
      case 'pending':
        return 'Đang chờ';
      case 'declined':
        return 'Từ chối';
      case 'fourty':
        return 'Đã thanh toán 40% học phí';
      case 'sixty':
        return 'Đã hoàn tất thanh toán học phí';
      default:
        return status;
    }
  }

  @override
  void initState() {
    super.initState();
    _initializeVideo();
    _checkExistingSessions();
  }

  Future<void> _checkExistingSessions() async {
    try {
      setState(() {
        _isLoadingExistingSessions = true;
      });

      final response = await http.get(
        Uri.parse(
            'https://instrulearnapplication.azurewebsites.net/api/LearningPathSession/${widget.registration.learningRegisId}/learning-path-sessions'),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['isSucceed'] == true && data['data'] != null) {
          final sessions = List<Map<String, dynamic>>.from(data['data']);
          if (sessions.isNotEmpty) {
            setState(() {
              _existingSessions = sessions;
            });
          } else {
            setState(() {
              _existingSessions = null;
            });
          }
        }
      }
    } catch (e) {
      print('Error checking existing sessions: $e');
    } finally {
      setState(() {
        _isLoadingExistingSessions = false;
      });

      if (_existingSessions == null &&
          widget.registration.numberOfSession > 0) {
        _initializeSessionControllers();
      }
    }
  }

  void _initializeSessionControllers() {
    for (var controller in _titleControllers) {
      controller.dispose();
    }
    for (var controller in _descriptionControllers) {
      controller.dispose();
    }
    _titleControllers.clear();
    _descriptionControllers.clear();

    if (widget.registration.numberOfSession > 0) {
      for (int i = 0; i < widget.registration.numberOfSession; i++) {
        _titleControllers.add(TextEditingController());
        _descriptionControllers.add(TextEditingController());
      }
    }
  }

  Future<void> _initializeVideo() async {
    if (widget.registration.videoUrl != null &&
        widget.registration.videoUrl.isNotEmpty &&
        widget.registration.videoUrl.startsWith('http')) {
      try {
        _videoController =
            VideoPlayerController.network(widget.registration.videoUrl);
        await _videoController!
            .initialize()
            .timeout(const Duration(seconds: 15), onTimeout: () {
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

  void _onVideoPositionChanged() {
    if (_videoController != null &&
        _videoController!.value.position >= _videoController!.value.duration) {
      if (mounted) {
        setState(() {});
      }
    }

    if (_videoController != null &&
        _videoController!.value.position == Duration.zero &&
        !_videoController!.value.isPlaying) {
      _videoController!.play();
    }
  }

  @override
  void dispose() {
    for (var controller in _titleControllers) {
      controller.dispose();
    }
    for (var controller in _descriptionControllers) {
      controller.dispose();
    }
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

  Future<void> _createLearningPathSessions() async {
    bool isValid = true;
    String errorMessage = '';
    int emptyFields = 0;

    for (int i = 0; i < widget.registration.numberOfSession; i++) {
      if (_titleControllers[i].text.isEmpty) {
        isValid = false;
        emptyFields++;
      }
      if (_descriptionControllers[i].text.isEmpty) {
        isValid = false;
        emptyFields++;
      }
    }

    if (!isValid) {
      errorMessage =
          'Vui lòng điền đầy đủ thông tin cho tất cả các buổi học (còn $emptyFields trường chưa điền)';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(errorMessage),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    try {
      setState(() {
        _isCreatingSession = true;
      });

      List<Map<String, dynamic>> sessions = [];
      for (int i = 0; i < widget.registration.numberOfSession; i++) {
        sessions.add({
          "learningRegisId": widget.registration.learningRegisId,
          "sessionNumber": i + 1,
          "title": _titleControllers[i].text,
          "description": _descriptionControllers[i].text,
          "isCompleted": false
        });
      }

      Map<String, dynamic> requestBody = {
        "learningRegisId": widget.registration.learningRegisId,
        "learningPathSessions": sessions
      };

      final response = await http.post(
        Uri.parse(
            'https://instrulearnapplication.azurewebsites.net/api/LearningRegis/create-learning-path-sessions'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode(requestBody),
      );

      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Đã gửi giáo án thành công!'),
            backgroundColor: Colors.green,
          ),
        );
        await _checkExistingSessions();
      } else {
        throw Exception('Không thể tạo giáo án: ${response.statusCode}');
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Lỗi: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      setState(() {
        _isCreatingSession = false;
      });
    }
  }

  void _openFullScreen() {
    if (widget.registration.syllabusLink == null ||
        widget.registration.syllabusLink.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Không tìm thấy file PDF để hiển thị'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

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
            widget.registration.syllabusLink,
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

  void _showPreviewDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Xem trước lộ trình đã soạn'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              for (int i = 0; i < widget.registration.numberOfSession; i++)
                Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.blue[50],
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.blue[200]!),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Buổi ${i + 1}',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          color: Colors.blue,
                          fontSize: 16,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Tiêu đề: ${_titleControllers[i].text}',
                        style: const TextStyle(fontWeight: FontWeight.w500),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Nội dung: ${_descriptionControllers[i].text}',
                        style: const TextStyle(color: Colors.black87),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Hủy'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _createLearningPathSessions();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.green,
              foregroundColor: Colors.white,
            ),
            child: const Text('Xác nhận gửi'),
          ),
        ],
      ),
    );
  }

  void _showEditSessionDialog(Map<String, dynamic> session) {
    final titleController = TextEditingController(text: session['title']);
    final descriptionController =
        TextEditingController(text: session['description']);

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Chỉnh sửa buổi ${session['sessionNumber']}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: titleController,
              decoration: InputDecoration(labelText: 'Tiêu đề'),
            ),
            SizedBox(height: 12),
            TextField(
              controller: descriptionController,
              decoration: InputDecoration(labelText: 'Nội dung'),
              maxLines: 3,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Hủy'),
          ),
          ElevatedButton(
            onPressed: () async {
              await _updateLearningPathSession(
                session['learningPathSessionId'],
                session['sessionNumber'],
                titleController.text,
                descriptionController.text,
              );
              Navigator.pop(context);
            },
            child: Text('Lưu'),
          ),
        ],
      ),
    );
  }

  Future<void> _updateLearningPathSession(
    int learningPathSessionId,
    int sessionNumber,
    String title,
    String description,
  ) async {
    try {
      final response = await http.put(
        Uri.parse(
            'https://instrulearnapplication.azurewebsites.net/api/LearningPathSession/update-learning-path-session'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          "learningPathSessionId": learningPathSessionId,
          "sessionNumber": sessionNumber,
          "title": title,
          "description": description,
          "isCompleted": false,
        }),
      );
      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text('Cập nhật thành công!'),
              backgroundColor: Colors.green),
        );
        await _checkExistingSessions();
      } else {
        throw Exception('Lỗi cập nhật: [${response.statusCode}');
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Lỗi: $e'), backgroundColor: Colors.red),
      );
    }
  }

  Future<void> _confirmLearningPath() async {
    try {
      final response = await http.post(
        Uri.parse(
            'https://instrulearnapplication.azurewebsites.net/api/LearningPathSession/confirm-learning-path/${widget.registration.learningRegisId}'),
      );
      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text('Đã xác nhận lộ trình!'),
              backgroundColor: Colors.green),
        );
        await _checkExistingSessions();
      } else {
        throw Exception('Lỗi xác nhận: ${response.statusCode}');
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Lỗi: $e'), backgroundColor: Colors.red),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Chi tiết đơn yêu cầu của học viên'),
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
                    _buildStudentInfo(),
                    const SizedBox(height: 16),
                    _buildLearningInfo(),
                    const SizedBox(height: 16),
                    if (widget.registration.videoUrl != null &&
                        widget.registration.videoUrl.isNotEmpty) ...[
                      _buildAssessmentVideo(),
                      const SizedBox(height: 16),
                    ],
                    if (widget.registration.syllabusLink != null &&
                        widget.registration.syllabusLink.isNotEmpty) ...[
                      const Text(
                        'Giáo trình mà trung tâm đề xuất:',
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
                                  widget.registration.syllabusLink,
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
                    const Text(
                      'Hãy soạn giáo án cho học viên:',
                      style:
                          TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: _existingSessions != null
                            ? Colors.grey[50]
                            : Colors.green[50],
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                            color: _existingSessions != null
                                ? Colors.grey[300]!
                                : Colors.green[200]!),
                      ),
                      child: _isLoadingExistingSessions
                          ? const Center(
                              child: CircularProgressIndicator(),
                            )
                          : _existingSessions != null
                              ? Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        const Icon(
                                          Icons.menu_book,
                                          color: Colors.blue,
                                          size: 24,
                                        ),
                                        const SizedBox(width: 8),
                                        const Text(
                                          'Giáo án đã được tạo',
                                          style: TextStyle(
                                            fontSize: 18,
                                            fontWeight: FontWeight.bold,
                                            color: Colors.blue,
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 16),
                                    ..._existingSessions!.map((session) =>
                                        Container(
                                          margin:
                                              const EdgeInsets.only(bottom: 16),
                                          decoration: BoxDecoration(
                                            color: Colors.white,
                                            borderRadius:
                                                BorderRadius.circular(12),
                                            boxShadow: [
                                              BoxShadow(
                                                color: Colors.grey
                                                    .withOpacity(0.1),
                                                spreadRadius: 1,
                                                blurRadius: 6,
                                                offset: const Offset(0, 2),
                                              ),
                                            ],
                                          ),
                                          child: Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              Container(
                                                padding:
                                                    const EdgeInsets.symmetric(
                                                        horizontal: 16,
                                                        vertical: 12),
                                                decoration: BoxDecoration(
                                                  color: Colors.blue.shade50,
                                                  borderRadius:
                                                      const BorderRadius.only(
                                                    topLeft:
                                                        Radius.circular(12),
                                                    topRight:
                                                        Radius.circular(12),
                                                  ),
                                                ),
                                                child: Row(
                                                  children: [
                                                    Container(
                                                      padding: const EdgeInsets
                                                          .symmetric(
                                                          horizontal: 12,
                                                          vertical: 6),
                                                      decoration: BoxDecoration(
                                                        color: Colors
                                                            .blue.shade100,
                                                        borderRadius:
                                                            BorderRadius
                                                                .circular(20),
                                                      ),
                                                      child: Text(
                                                        'Buổi ${session['sessionNumber']}',
                                                        style: const TextStyle(
                                                          fontWeight:
                                                              FontWeight.bold,
                                                          color: Colors.blue,
                                                        ),
                                                      ),
                                                    ),
                                                    if (session[
                                                            'isCompleted'] ==
                                                        false)
                                                      Spacer(),
                                                    if (session[
                                                            'isCompleted'] ==
                                                        false)
                                                      TextButton.icon(
                                                        icon: Icon(Icons.edit,
                                                            color:
                                                                Colors.orange),
                                                        label: Text('Chỉnh sửa',
                                                            style: TextStyle(
                                                                color: Colors
                                                                    .orange)),
                                                        onPressed: () {
                                                          _showEditSessionDialog(
                                                              session);
                                                        },
                                                      ),
                                                  ],
                                                ),
                                              ),
                                              Padding(
                                                padding:
                                                    const EdgeInsets.all(16),
                                                child: Column(
                                                  crossAxisAlignment:
                                                      CrossAxisAlignment.start,
                                                  children: [
                                                    Row(
                                                      children: [
                                                        const Icon(
                                                          Icons.title,
                                                          size: 20,
                                                          color: Colors.grey,
                                                        ),
                                                        const SizedBox(
                                                            width: 8),
                                                        Expanded(
                                                          child: Text(
                                                            session['title'],
                                                            style:
                                                                const TextStyle(
                                                              fontSize: 16,
                                                              fontWeight:
                                                                  FontWeight
                                                                      .w500,
                                                            ),
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                    const SizedBox(height: 12),
                                                    Row(
                                                      crossAxisAlignment:
                                                          CrossAxisAlignment
                                                              .start,
                                                      children: [
                                                        const Icon(
                                                          Icons.description,
                                                          size: 20,
                                                          color: Colors.grey,
                                                        ),
                                                        const SizedBox(
                                                            width: 8),
                                                        Expanded(
                                                          child: Text(
                                                            session[
                                                                'description'],
                                                            style:
                                                                const TextStyle(
                                                              color: Colors
                                                                  .black87,
                                                            ),
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                  ],
                                                ),
                                              ),
                                            ],
                                          ),
                                        )),
                                    if (_existingSessions != null &&
                                        _existingSessions!.isNotEmpty &&
                                        _existingSessions!.any(
                                            (s) => s['isCompleted'] == false))
                                      Padding(
                                        padding: const EdgeInsets.only(
                                            top: 8.0, bottom: 16.0),
                                        child: SizedBox(
                                          width: double.infinity,
                                          child: ElevatedButton.icon(
                                            icon: Icon(Icons.check_circle,
                                                color: Colors.white),
                                            label: Text('Xác nhận lộ trình',
                                                style: TextStyle(
                                                    fontWeight:
                                                        FontWeight.bold)),
                                            style: ElevatedButton.styleFrom(
                                              backgroundColor: Colors.blue,
                                              foregroundColor: Colors.white,
                                              padding: EdgeInsets.symmetric(
                                                  vertical: 14),
                                              shape: RoundedRectangleBorder(
                                                  borderRadius:
                                                      BorderRadius.circular(8)),
                                            ),
                                            onPressed: _confirmLearningPath,
                                          ),
                                        ),
                                      ),
                                  ],
                                )
                              : Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        const Icon(
                                          Icons.edit_note,
                                          color: Colors.green,
                                          size: 24,
                                        ),
                                        const SizedBox(width: 8),
                                        Text(
                                          'Soạn giáo án cho ${widget.registration.numberOfSession} buổi học',
                                          style: const TextStyle(
                                            fontSize: 18,
                                            fontWeight: FontWeight.bold,
                                            color: Colors.green,
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 16),
                                    ...List.generate(
                                      widget.registration.numberOfSession,
                                      (index) => Container(
                                        margin:
                                            const EdgeInsets.only(bottom: 16.0),
                                        decoration: BoxDecoration(
                                          color: Colors.white,
                                          borderRadius:
                                              BorderRadius.circular(12),
                                          boxShadow: [
                                            BoxShadow(
                                              color:
                                                  Colors.grey.withOpacity(0.1),
                                              spreadRadius: 1,
                                              blurRadius: 6,
                                              offset: const Offset(0, 2),
                                            ),
                                          ],
                                        ),
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Container(
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                      horizontal: 16,
                                                      vertical: 12),
                                              decoration: BoxDecoration(
                                                color: Colors.green.shade50,
                                                borderRadius:
                                                    const BorderRadius.only(
                                                  topLeft: Radius.circular(12),
                                                  topRight: Radius.circular(12),
                                                ),
                                              ),
                                              child: Row(
                                                children: [
                                                  Container(
                                                    padding: const EdgeInsets
                                                        .symmetric(
                                                        horizontal: 12,
                                                        vertical: 6),
                                                    decoration: BoxDecoration(
                                                      color:
                                                          Colors.green.shade100,
                                                      borderRadius:
                                                          BorderRadius.circular(
                                                              20),
                                                    ),
                                                    child: Text(
                                                      'Buổi ${index + 1}',
                                                      style: const TextStyle(
                                                        fontWeight:
                                                            FontWeight.bold,
                                                        color: Colors.green,
                                                      ),
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ),
                                            Padding(
                                              padding: const EdgeInsets.all(16),
                                              child: Column(
                                                crossAxisAlignment:
                                                    CrossAxisAlignment.start,
                                                children: [
                                                  TextField(
                                                    controller:
                                                        _titleControllers[
                                                            index],
                                                    decoration:
                                                        const InputDecoration(
                                                      labelText: 'Tiêu đề',
                                                      prefixIcon:
                                                          Icon(Icons.title),
                                                      border:
                                                          OutlineInputBorder(),
                                                      filled: true,
                                                      fillColor: Colors.white,
                                                    ),
                                                  ),
                                                  const SizedBox(height: 12),
                                                  TextField(
                                                    controller:
                                                        _descriptionControllers[
                                                            index],
                                                    decoration:
                                                        const InputDecoration(
                                                      labelText: 'Nội dung',
                                                      prefixIcon: Icon(
                                                          Icons.description),
                                                      border:
                                                          OutlineInputBorder(),
                                                      filled: true,
                                                      fillColor: Colors.white,
                                                    ),
                                                    maxLines: 3,
                                                  ),
                                                ],
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                    const SizedBox(height: 16),
                                    if (!_isCreatingSession)
                                      Container(
                                        width: double.infinity,
                                        height: 50,
                                        decoration: BoxDecoration(
                                          borderRadius:
                                              BorderRadius.circular(25),
                                          gradient: LinearGradient(
                                            colors: [
                                              Colors.green.shade400,
                                              Colors.green.shade600,
                                            ],
                                          ),
                                          boxShadow: [
                                            BoxShadow(
                                              color:
                                                  Colors.green.withOpacity(0.3),
                                              spreadRadius: 1,
                                              blurRadius: 8,
                                              offset: const Offset(0, 2),
                                            ),
                                          ],
                                        ),
                                        child: ElevatedButton.icon(
                                          onPressed: () {
                                            bool isValid = true;
                                            String errorMessage = '';
                                            int emptyFields = 0;

                                            for (int i = 0;
                                                i <
                                                    widget.registration
                                                        .numberOfSession;
                                                i++) {
                                              if (_titleControllers[i]
                                                  .text
                                                  .isEmpty) {
                                                isValid = false;
                                                emptyFields++;
                                              }
                                              if (_descriptionControllers[i]
                                                  .text
                                                  .isEmpty) {
                                                isValid = false;
                                                emptyFields++;
                                              }
                                            }

                                            if (!isValid) {
                                              errorMessage =
                                                  'Vui lòng điền đầy đủ thông tin cho tất cả các buổi học (còn $emptyFields trường chưa điền)';
                                              ScaffoldMessenger.of(context)
                                                  .showSnackBar(
                                                SnackBar(
                                                  content: Text(errorMessage),
                                                  backgroundColor: Colors.red,
                                                ),
                                              );
                                              return;
                                            }

                                            _showPreviewDialog();
                                          },
                                          icon: const Icon(Icons.send),
                                          label: const Text(
                                            'Gửi giáo án',
                                            style: TextStyle(
                                              fontSize: 16,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: Colors.transparent,
                                            foregroundColor: Colors.white,
                                            elevation: 0,
                                            shape: RoundedRectangleBorder(
                                              borderRadius:
                                                  BorderRadius.circular(25),
                                            ),
                                          ),
                                        ),
                                      ),
                                    if (_isCreatingSession)
                                      const Center(
                                        child: CircularProgressIndicator(
                                          valueColor:
                                              AlwaysStoppedAnimation<Color>(
                                                  Colors.green),
                                        ),
                                      ),
                                  ],
                                ),
                    ),
                    const SizedBox(height: 16),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStudentInfo() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Thông tin học viên:',
          style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        Text('Học viên: ${widget.registration.fullName}'),
        Text('Số điện thoại: ${widget.registration.phoneNumber}'),
        if (widget.registration.levelName != null) ...[
          Text('Trình độ: ${widget.registration.levelName}'),
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
        if (widget.registration.responseDescription != null) ...[
          const SizedBox(height: 16),
          const Text(
            'Thông báo từ trung tâm:',
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.green[50],
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.green[200]!),
            ),
            child: RichText(
              text: TextSpan(
                children: [
                  const TextSpan(
                    text: '[Trung Tâm InstruLearn]: ',
                    style: TextStyle(
                      color: Colors.blue,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  TextSpan(
                    text: widget.registration.responseDescription ?? '',
                    style: const TextStyle(color: Colors.black87),
                  ),
                ],
              ),
            ),
          ),
        ],
        if (widget.registration.learningRequest?.isNotEmpty == true) ...[
          const SizedBox(height: 16),
          const Text(
            'Mục tiêu học tập:',
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
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
        ],
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
                      Chewie(controller: _chewieController!),
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
                          const Center(
                            child: Icon(
                              Icons.video_library,
                              size: 64,
                              color: Colors.white54,
                            ),
                          ),
                          Center(
                            child: InkWell(
                              onTap: () {
                                _initializeVideo();
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
                          Positioned(
                            right: 8,
                            bottom: 8,
                            child: IconButton(
                              icon: const Icon(
                                Icons.open_in_new,
                                color: Colors.white,
                              ),
                              onPressed: () {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text(
                                        'Video URL: ${widget.registration.videoUrl}'),
                                    action: SnackBarAction(
                                      label: 'Copy',
                                      onPressed: () {
                                        Clipboard.setData(ClipboardData(
                                            text:
                                                widget.registration.videoUrl));
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
}
