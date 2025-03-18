import 'package:flutter/material.dart';
import 'detail/teacher_notification_detail_screen.dart';

class TeacherNotificationScreen extends StatefulWidget {
  const TeacherNotificationScreen({Key? key}) : super(key: key);

  @override
  State<TeacherNotificationScreen> createState() =>
      _TeacherNotificationScreenState();
}

class _TeacherNotificationScreenState extends State<TeacherNotificationScreen> {
  final TextEditingController _searchController = TextEditingController();
  List<NotificationItem> notifications = [
    NotificationItem(
      title:
          '[Trung tâm âm nhạc InstruLearn]_THÔNG BÁO VỀ VIỆC LỊCH DẠY CỦA GIÁO VIÊN ĐÃ ĐƯỢC CẬP NHẬT',
      date: '12/12/2025',
    ),
    NotificationItem(
      title:
          '[Trung tâm âm nhạc InstruLearn]_THÔNG BÁO VỀ VIỆC KIỂM TRA CHẤT LƯỢNG ĐẦU VÀO LỚP [GUITAR-NC-8.0-10.03.2025-17:00]',
      date: '13/12/2025',
    ),
  ];
  List<NotificationItem> filteredNotifications = [];

  @override
  void initState() {
    super.initState();
    filteredNotifications = notifications;
  }

  void _filterNotifications(String query) {
    setState(() {
      if (query.isEmpty) {
        filteredNotifications = notifications;
      } else {
        filteredNotifications =
            notifications
                .where(
                  (notification) => notification.title.toLowerCase().contains(
                    query.toLowerCase(),
                  ),
                )
                .toList();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Thông báo'),
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
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.grey[200],
                  borderRadius: BorderRadius.circular(25),
                ),
                child: TextField(
                  controller: _searchController,
                  onChanged: _filterNotifications,
                  decoration: InputDecoration(
                    hintText: 'Tìm kiếm...',
                    prefixIcon: const Icon(Icons.search, color: Colors.grey),
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 15,
                    ),
                  ),
                ),
              ),
            ),
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: filteredNotifications.length,
                itemBuilder: (context, index) {
                  return _buildNotificationCard(filteredNotifications[index]);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNotificationCard(NotificationItem notification) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder:
                (context) => TeacherNotificationDetailScreen(
                  title: notification.title,
                  date: notification.date,
                ),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
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
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              RichText(
                text: TextSpan(
                  children: [
                    TextSpan(
                      text: '[Trung tâm âm nhạc InstruLearn]',
                      style: TextStyle(
                        color: Colors.red[700],
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                    TextSpan(
                      text: notification.title.substring(
                        notification.title.indexOf(']') + 1,
                      ),
                      style: const TextStyle(
                        color: Colors.black,
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'date: ${notification.date}',
                style: TextStyle(fontSize: 12, color: Colors.grey[600]),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }
}

class NotificationItem {
  final String title;
  final String date;

  NotificationItem({required this.title, required this.date});
}
