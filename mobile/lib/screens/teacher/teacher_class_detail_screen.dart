import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../../models/class_model.dart';
import 'package:intl/intl.dart';
import 'package:flutter_cached_pdfview/flutter_cached_pdfview.dart';
import 'package:shared_preferences/shared_preferences.dart';

class TeacherClassDetailScreen extends StatefulWidget {
  final ClassModel classDetail;
  const TeacherClassDetailScreen({Key? key, required this.classDetail})
      : super(key: key);

  @override
  State<TeacherClassDetailScreen> createState() =>
      _TeacherClassDetailScreenState();
}

class _TeacherClassDetailScreenState extends State<TeacherClassDetailScreen> {
  int _currentPage = 0;
  int _totalPages = 0;
  PDFViewController? _pdfController;
  bool _isUpdating = false;

  String formatCurrency(int amount) {
    final formatter = NumberFormat.currency(
      locale: 'vi_VN',
      symbol: '₫',
      decimalDigits: 0,
    );
    return formatter.format(amount);
  }

  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        elevation: 0,
        backgroundColor: Colors.transparent,
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                spreadRadius: 1,
                blurRadius: 10,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(15),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.error_outline,
                  color: Colors.red.shade700,
                  size: 40,
                ),
              ),
              const SizedBox(height: 20),
              const Text(
                'Thông báo lỗi',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1A237E),
                ),
              ),
              const SizedBox(height: 15),
              Container(
                padding: const EdgeInsets.all(15),
                decoration: BoxDecoration(
                  color: Colors.grey.shade50,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: Text(
                  message,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 16,
                    color: Color(0xFF424242),
                  ),
                ),
              ),
              const SizedBox(height: 25),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1A237E),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 15),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                    elevation: 0,
                  ),
                  child: const Text(
                    'Đóng',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _updateStudentEligibility(int learnerId, bool isEligible) async {
    try {
      setState(() {
        _isUpdating = true;
      });

      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token == null) {
        _showErrorDialog('Không thể lấy thông tin người dùng');
        return;
      }

      final response = await http.put(
        Uri.parse(
            'https://instrulearnapplication.azurewebsites.net/api/Class/update-learner-eligibility'),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer $token',
        },
        body: json.encode({
          'learnerId': learnerId,
          'classId': widget.classDetail.classId,
          'isEligible': isEligible,
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['isSucceed'] == true) {
          _showSuccessMessage('Cập nhật trạng thái học viên thành công');
          setState(() {
            final student = widget.classDetail.students.firstWhere(
              (s) => s.learnerId == learnerId,
            );
            student.isEligible = isEligible;
          });
        } else {
          _showErrorDialog('Lỗi: ${data['message']}');
        }
      } else {
        final errorData = json.decode(response.body);
        _showErrorDialog(
            'Lỗi: ${errorData['message'] ?? 'Không thể cập nhật trạng thái học viên'}');
      }
    } catch (e) {
      _showErrorDialog('Lỗi: ${e.toString()}');
    } finally {
      setState(() {
        _isUpdating = false;
      });
    }
  }

  void _showErrorMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.red),
    );
  }

  void _showSuccessMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.green),
    );
  }

  void _showEvaluationDialog(
      int learnerId, String studentName, bool currentStatus) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Đánh giá học viên'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Học viên: $studentName',
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              currentStatus
                  ? 'Bạn có muốn đánh giá học viên này là không đủ điều kiện không?'
                  : 'Bạn có muốn đánh giá học viên này là đủ điều kiện không?',
              style: const TextStyle(fontSize: 14),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Hủy'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              await _updateStudentEligibility(learnerId, !currentStatus);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: currentStatus ? Colors.red : Colors.green,
              foregroundColor: Colors.white,
            ),
            child: Text(currentStatus ? 'Không đủ điều kiện' : 'Đủ điều kiện'),
          ),
        ],
      ),
    );
  }

  void _openFullScreen() {
    if (widget.classDetail.syllabusLink.isEmpty) {
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
            widget.classDetail.syllabusLink,
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Chi tiết lớp học'),
        backgroundColor: const Color(0xFF8C9EFF),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    const Color(0xFF8C9EFF),
                    const Color(0xFF8C9EFF).withOpacity(0.8),
                  ],
                ),
                borderRadius: BorderRadius.circular(15),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          widget.classDetail.className,
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: widget.classDetail.status == 0
                              ? Colors.green
                              : Colors.red,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          widget.classDetail.status == 0
                              ? 'Đang mở'
                              : 'Đã đóng',
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 15),
                  _buildInfoRow(
                      Icons.person,
                      'Giáo viên: ${widget.classDetail.teacherName}',
                      Colors.white),
                  _buildInfoRow(Icons.school,
                      'Môn: ${widget.classDetail.majorName}', Colors.white),
                  _buildInfoRow(
                      Icons.trending_up,
                      'Trình độ: ${widget.classDetail.levelName}',
                      Colors.white),
                ],
              ),
            ),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(15),
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.withOpacity(0.1),
                    spreadRadius: 1,
                    blurRadius: 5,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Thông tin khóa học',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1A237E),
                    ),
                  ),
                  const SizedBox(height: 15),
                  _buildInfoRow(
                      Icons.calendar_today,
                      'Ngày bắt đầu: ${widget.classDetail.startDate}',
                      const Color(0xFF424242)),
                  _buildInfoRow(
                      Icons.calendar_today,
                      'Ngày kết thúc: ${widget.classDetail.endDate}',
                      const Color(0xFF424242)),
                  _buildInfoRow(
                      Icons.access_time,
                      'Giờ học: ${widget.classDetail.classTime} - ${widget.classDetail.classEndTime}',
                      const Color(0xFF424242)),
                  _buildInfoRow(
                      Icons.people,
                      'Số học viên: ${widget.classDetail.studentCount}/${widget.classDetail.maxStudents}',
                      const Color(0xFF424242)),
                  Container(
                    margin: const EdgeInsets.only(top: 8),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE3F2FD),
                      borderRadius: BorderRadius.circular(10),
                      border:
                          Border.all(color: const Color(0xFF8C9EFF), width: 1),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Thông tin học phí',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF1A237E),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Học phí mỗi buổi: ${formatCurrency(widget.classDetail.price)}',
                          style: const TextStyle(
                            fontSize: 14,
                            color: Color(0xFF424242),
                          ),
                        ),
                        Text(
                          'Tổng số buổi: ${widget.classDetail.totalDays} buổi',
                          style: const TextStyle(
                            fontSize: 14,
                            color: Color(0xFF424242),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Tổng học phí: ${formatCurrency(widget.classDetail.price * widget.classDetail.totalDays)}',
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF1A237E),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  Container(
                    margin: const EdgeInsets.only(top: 8),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFEBEE),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: Colors.red.shade300, width: 1),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.red.withOpacity(0.1),
                          spreadRadius: 1,
                          blurRadius: 5,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: Colors.red.shade50,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Icon(
                                Icons.warning_amber_rounded,
                                color: Colors.red,
                                size: 24,
                              ),
                            ),
                            const SizedBox(width: 12),
                            const Expanded(
                              child: Text(
                                'Lưu ý quan trọng',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.red,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Colors.red.shade200),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  const Icon(
                                    Icons.calendar_today,
                                    color: Colors.red,
                                    size: 16,
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    'Ngày kiểm tra: ${widget.classDetail.testDay}',
                                    style: const TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF424242),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  const Icon(
                                    Icons.access_time,
                                    color: Colors.red,
                                    size: 16,
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    'Thời gian: ${widget.classDetail.classTime} - ${widget.classDetail.classEndTime}',
                                    style: const TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF424242),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 12),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.red.shade50,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Row(
                            children: [
                              Icon(
                                Icons.info_outline,
                                color: Colors.red,
                                size: 20,
                              ),
                              SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  'Giáo viên lưu ý có mặt đúng giờ để thực hiện đánh giá chất lượng đầu vào của học viên',
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: Color(0xFF424242),
                                    fontStyle: FontStyle.italic,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (widget.classDetail.syllabusLink.isNotEmpty) ...[
                    const SizedBox(height: 20),
                    Container(
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: Colors.blue[50],
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.blue[200]!),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.blue[100],
                              borderRadius: const BorderRadius.only(
                                topLeft: Radius.circular(8),
                                topRight: Radius.circular(8),
                              ),
                            ),
                            child: Row(
                              children: [
                                const Icon(
                                  Icons.menu_book,
                                  color: Color(0xFF1A237E),
                                  size: 24,
                                ),
                                const SizedBox(width: 12),
                                const Text(
                                  'Giáo trình trung tâm chỉ định',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF1A237E),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Container(
                            height: 400,
                            padding: const EdgeInsets.all(16),
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
                                preventLinkNavigation: true,
                              ).fromUrl(
                                widget.classDetail.syllabusLink,
                                placeholder: (progress) => Center(
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      CircularProgressIndicator(
                                        value: progress / 100,
                                        valueColor:
                                            const AlwaysStoppedAnimation<Color>(
                                                Color(0xFF1A237E)),
                                      ),
                                      const SizedBox(height: 12),
                                      Text(
                                        'Đang tải giáo trình: $progress%',
                                        style: const TextStyle(
                                          color: Color(0xFF1A237E),
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
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
                                        size: 48,
                                      ),
                                      const SizedBox(height: 16),
                                      const Text(
                                        'Không thể tải giáo trình',
                                        style: TextStyle(
                                          fontSize: 18,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.red,
                                        ),
                                      ),
                                      const SizedBox(height: 8),
                                      Text(
                                        error.toString(),
                                        textAlign: TextAlign.center,
                                        style:
                                            const TextStyle(color: Colors.red),
                                      ),
                                      const SizedBox(height: 16),
                                      ElevatedButton.icon(
                                        onPressed: () {
                                          setState(() {});
                                        },
                                        icon: const Icon(Icons.refresh),
                                        label: const Text('Thử lại'),
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor:
                                              const Color(0xFF1A237E),
                                          foregroundColor: Colors.white,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                vertical: 8, horizontal: 16),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: const BorderRadius.only(
                                bottomLeft: Radius.circular(8),
                                bottomRight: Radius.circular(8),
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.grey.withOpacity(0.1),
                                  spreadRadius: 1,
                                  blurRadius: 5,
                                  offset: const Offset(0, -2),
                                ),
                              ],
                            ),
                            child: SingleChildScrollView(
                              scrollDirection: Axis.horizontal,
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  IconButton(
                                    icon: const Icon(Icons.first_page),
                                    onPressed: _currentPage > 0 &&
                                            _pdfController != null
                                        ? () => _pdfController!.setPage(0)
                                        : null,
                                    tooltip: 'Trang đầu',
                                    color: const Color(0xFF1A237E),
                                  ),
                                  IconButton(
                                    icon: const Icon(Icons.navigate_before),
                                    onPressed: _currentPage > 0 &&
                                            _pdfController != null
                                        ? () => _pdfController!
                                            .setPage(_currentPage - 1)
                                        : null,
                                    tooltip: 'Trang trước',
                                    color: const Color(0xFF1A237E),
                                  ),
                                  Container(
                                    constraints:
                                        const BoxConstraints(minWidth: 80),
                                    child: Text(
                                      'Trang ${_currentPage + 1}/${_totalPages}',
                                      style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        color: Color(0xFF1A237E),
                                      ),
                                      textAlign: TextAlign.center,
                                    ),
                                  ),
                                  IconButton(
                                    icon: const Icon(Icons.navigate_next),
                                    onPressed: _currentPage < _totalPages - 1 &&
                                            _pdfController != null
                                        ? () => _pdfController!
                                            .setPage(_currentPage + 1)
                                        : null,
                                    tooltip: 'Trang sau',
                                    color: const Color(0xFF1A237E),
                                  ),
                                  IconButton(
                                    icon: const Icon(Icons.last_page),
                                    onPressed: _currentPage < _totalPages - 1 &&
                                            _pdfController != null
                                        ? () => _pdfController!
                                            .setPage(_totalPages - 1)
                                        : null,
                                    tooltip: 'Trang cuối',
                                    color: const Color(0xFF1A237E),
                                  ),
                                  const VerticalDivider(
                                    width: 16,
                                    thickness: 1,
                                  ),
                                  IconButton(
                                    icon: const Icon(Icons.fullscreen),
                                    onPressed: _openFullScreen,
                                    tooltip: 'Xem toàn màn hình',
                                    color: const Color(0xFF1A237E),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(15),
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.withOpacity(0.1),
                    spreadRadius: 1,
                    blurRadius: 5,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Danh sách học viên',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1A237E),
                        ),
                      ),
                      if (_isUpdating)
                        const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(
                                Color(0xFF1A237E)),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 15),
                  ...widget.classDetail.students.map((student) => Card(
                        margin: const EdgeInsets.only(bottom: 10),
                        elevation: 2,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: const Color(0xFF8C9EFF),
                            backgroundImage: student.avatar.isNotEmpty
                                ? NetworkImage(student.avatar)
                                : null,
                            child: student.avatar.isEmpty
                                ? Text(
                                    student.fullName[0].toUpperCase(),
                                    style: const TextStyle(color: Colors.white),
                                  )
                                : null,
                          ),
                          title: Text(
                            student.fullName,
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF1A237E),
                            ),
                          ),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const SizedBox(height: 4),
                              Text('Email: ${student.email}'),
                              Text('SĐT: ${student.phoneNumber}'),
                              const SizedBox(height: 4),
                              InkWell(
                                onTap: () => _showEvaluationDialog(
                                  student.learnerId,
                                  student.fullName,
                                  student.isEligible,
                                ),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: student.isEligible
                                        ? Colors.green.withOpacity(0.1)
                                        : Colors.red.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(
                                      color: student.isEligible
                                          ? Colors.green
                                          : Colors.red,
                                      width: 1,
                                    ),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(
                                        student.isEligible
                                            ? Icons.check_circle
                                            : Icons.cancel,
                                        color: student.isEligible
                                            ? Colors.green
                                            : Colors.red,
                                        size: 16,
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        student.isEligible
                                            ? 'Đủ điều kiện'
                                            : 'Chưa đủ điều kiện',
                                        style: TextStyle(
                                          color: student.isEligible
                                              ? Colors.green
                                              : Colors.red,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      const SizedBox(width: 4),
                                      Icon(
                                        Icons.edit,
                                        color: student.isEligible
                                            ? Colors.green
                                            : Colors.red,
                                        size: 16,
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      )),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String text, Color textColor) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(icon, size: 20, color: textColor),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                fontSize: 14,
                color: textColor,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
