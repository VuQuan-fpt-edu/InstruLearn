import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../models/teacher_learning_registration.dart';
import '../../services/teacher_learning_registration_service.dart';
import 'detail/application_details_screen_teacher.dart';

class ApplicationScreenTeacher extends StatefulWidget {
  const ApplicationScreenTeacher({Key? key}) : super(key: key);

  @override
  State<ApplicationScreenTeacher> createState() =>
      _ApplicationScreenTeacherState();
}

class _ApplicationScreenTeacherState extends State<ApplicationScreenTeacher> {
  final TeacherLearningRegistrationService _service =
      TeacherLearningRegistrationService();
  List<TeacherLearningRegistration> _registrations = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadRegistrations();
  }

  Future<void> _loadRegistrations() async {
    try {
      setState(() {
        _isLoading = true;
        _error = null;
      });

      final prefs = await SharedPreferences.getInstance();
      final teacherId = prefs.getInt('teacherId');

      if (teacherId == null) {
        setState(() {
          _error = 'Không tìm thấy thông tin giáo viên';
          _isLoading = false;
        });
        return;
      }

      final registrations =
          await _service.getRegistrationsByTeacherId(teacherId);

      setState(() {
        _registrations = registrations;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'accepted':
        return Colors.green;
      case 'pending':
        return Colors.pink;
      case 'declined':
        return Colors.red;
      case 'fourty':
        return Colors.blue;
      case 'sixty':
        return Colors.green;
      default:
        return Colors.grey;
    }
  }

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

  String _formatCurrency(dynamic amount) {
    if (amount == null) return '0';
    if (amount is int || amount is double) {
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
    return '0';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Đơn yêu cầu của học viên'),
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
        child: RefreshIndicator(
          onRefresh: _loadRegistrations,
          child: _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _error != null
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            'Error: $_error',
                            style: const TextStyle(color: Colors.red),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 16),
                          ElevatedButton(
                            onPressed: _loadRegistrations,
                            child: const Text('Thử lại'),
                          ),
                        ],
                      ),
                    )
                  : _registrations.isEmpty
                      ? Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(
                                Icons.description_outlined,
                                size: 64,
                                color: Colors.grey,
                              ),
                              const SizedBox(height: 16),
                              const Text(
                                'Chưa có đơn đăng ký nào',
                                style: TextStyle(
                                  fontSize: 16,
                                  color: Colors.grey,
                                ),
                              ),
                            ],
                          ),
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: _registrations.length,
                          itemBuilder: (context, index) {
                            final registration = _registrations[index];
                            final statusColor =
                                _getStatusColor(registration.status);

                            return Padding(
                              padding: const EdgeInsets.only(bottom: 16),
                              child: _buildApplicationCard(
                                registration: registration,
                                backgroundColor: statusColor.withOpacity(0.1),
                                headerColor: statusColor,
                              ),
                            );
                          },
                        ),
        ),
      ),
    );
  }

  Widget _buildApplicationCard({
    required TeacherLearningRegistration registration,
    required Color backgroundColor,
    required Color headerColor,
  }) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ApplicationDetailsScreenTeacher(
              status: registration.status,
              statusColor: headerColor,
              registration: registration,
            ),
          ),
        );
      },
      child: Container(
        decoration: BoxDecoration(
          color: backgroundColor,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.3),
              spreadRadius: 1,
              blurRadius: 5,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
              decoration: BoxDecoration(
                color: headerColor,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(12),
                  topRight: Radius.circular(12),
                ),
              ),
              child: Text(
                _getStatusText(registration.status),
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Học viên: ${registration.fullName}',
                    style: const TextStyle(
                      color: Colors.blue,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Số điện thoại: ${registration.phoneNumber}',
                    style: const TextStyle(
                      color: Colors.black87,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Nhạc cụ: ${registration.majorName}',
                    style: const TextStyle(color: Colors.black87),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Trình độ: ${registration.levelName}',
                    style: const TextStyle(color: Colors.black87),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Thời gian bắt đầu: ${registration.timeStart}',
                    style: const TextStyle(color: Colors.black87),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Học vào thứ: ${registration.learningDays.join(", ")}',
                    style: const TextStyle(color: Colors.black87),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Học phí: ${_formatCurrency(registration.price)} VNĐ',
                    style: const TextStyle(
                      color: Colors.green,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
