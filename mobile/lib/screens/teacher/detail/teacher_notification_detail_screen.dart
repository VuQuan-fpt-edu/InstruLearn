import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../models/teacher_notification.dart';
import '../teacher_schedule_screen.dart';
import '../application_screen_teacher.dart';

class TeacherNotificationDetailScreen extends StatelessWidget {
  final TeacherNotification notification;

  const TeacherNotificationDetailScreen({
    Key? key,
    required this.notification,
  }) : super(key: key);

  String _formatDate(DateTime date) {
    return DateFormat('HH:mm - dd/MM/yyyy').format(date);
  }

  void _handleButtonPress(BuildContext context) {
    if (notification.title == "Lịch trình đã tạo - Thanh toán đã nhận") {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => const TeacherScheduleScreen(),
        ),
      );
    } else if (notification.title == "Yêu cầu tạo lộ trình học tập") {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => const ApplicationScreenTeacher(),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Chi tiết thông báo'),
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
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.grey.withOpacity(0.2),
                        spreadRadius: 1,
                        blurRadius: 6,
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
                            width: 50,
                            height: 50,
                            decoration: BoxDecoration(
                              color: const Color(0xFF8C9EFF).withOpacity(0.2),
                              borderRadius: BorderRadius.circular(25),
                            ),
                            child: const Icon(
                              Icons.notifications,
                              color: Color(0xFF8C9EFF),
                              size: 30,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  notification.title,
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  _formatDate(notification.createdAt),
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: Colors.grey[600],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                      Text(
                        notification.message,
                        style: const TextStyle(
                          fontSize: 16,
                          height: 1.5,
                        ),
                      ),
                      const SizedBox(height: 20),
                      const Divider(),
                      const SizedBox(height: 16),
                      _buildInfoRow('Mã đơn đăng ký:',
                          '#${notification.learningRegisId}'),
                      _buildInfoRow(
                          'Mã học viên:', '#${notification.learnerId}'),
                      _buildInfoRow('Tên học viên:', notification.learnerName),
                      _buildInfoRow('Trạng thái:',
                          notification.status == 0 ? 'Chưa đọc' : 'Đã đọc'),
                      _buildInfoRow(
                          'Loại thông báo:',
                          notification.type == 1
                              ? 'Yêu cầu tạo lộ trình'
                              : 'Khác'),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => _handleButtonPress(context),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF8C9EFF),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: Text(
                      notification.title ==
                              "Lịch trình đã tạo - Thanh toán đã nhận"
                          ? 'Xem lịch dạy'
                          : 'Tạo lộ trình học tập',
                      style: const TextStyle(
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
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 140,
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: Colors.black54,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: Colors.black87,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
