import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../../models/feedback_notification.dart';
import 'detail/notification_detail_screen.dart';
import 'learner_notification_screen.dart';
import 'center_notification_screen.dart';

class NotificationScreen extends StatefulWidget {
  const NotificationScreen({Key? key}) : super(key: key);

  @override
  State<NotificationScreen> createState() => _NotificationScreenState();
}

class _NotificationScreenState extends State<NotificationScreen>
    with SingleTickerProviderStateMixin {
  final TextEditingController _searchController = TextEditingController();
  List<FeedbackNotification> feedbackNotifications = [];
  List<FeedbackNotification> filteredNotifications = [];
  bool isLoading = true;
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _fetchFeedbackNotifications();
  }

  Future<void> _fetchFeedbackNotifications() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');
      final learnerId = prefs.getInt('learnerId');

      print('Token: $token');
      print('LearnerId: $learnerId');

      if (token == null || learnerId == null) {
        print('Token hoặc learnerId null');
        _showErrorMessage('Vui lòng đăng nhập lại');
        return;
      }

      final url =
          'https://instrulearnapplication.azurewebsites.net/api/FeedbackNotification/check-notifications/$learnerId';
      print('API URL: $url');

      final response = await http.get(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer $token',
        },
      );

      print('Response status code: ${response.statusCode}');
      print('Response body: ${response.body}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['isSucceed'] == true) {
          setState(() {
            feedbackNotifications = (data['data'] as List)
                .map((item) => FeedbackNotification.fromJson(item))
                .toList();
            filteredNotifications = feedbackNotifications;
            isLoading = false;
          });
          print('Số lượng feedback: ${feedbackNotifications.length}');
        } else {
          setState(() {
            isLoading = false;
          });
          _showErrorMessage(data['message'] ?? 'Không thể tải thông báo');
        }
      } else if (response.statusCode == 401) {
        _showErrorMessage(
            'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else {
        setState(() {
          isLoading = false;
        });
        _showErrorMessage('Lỗi kết nối: ${response.statusCode}');
      }
    } catch (e) {
      print('Error: $e');
      setState(() {
        isLoading = false;
      });
      _showErrorMessage('Lỗi: ${e.toString()}');
    }
  }

  void _showErrorMessage(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(message)));
    }
  }

  void _filterNotifications(String query) {
    setState(() {
      if (query.isEmpty) {
        filteredNotifications = feedbackNotifications;
      } else {
        filteredNotifications = feedbackNotifications
            .where((notification) => notification.teacherName
                .toLowerCase()
                .contains(query.toLowerCase()))
            .toList();
      }
    });
  }

  String _formatDateTime(String? dateTimeStr) {
    if (dateTimeStr == null || dateTimeStr.isEmpty) return '';
    try {
      final dt = DateTime.parse(dateTimeStr);
      return '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year} ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
    } catch (e) {
      return dateTimeStr ?? '';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Thông báo'),
        backgroundColor: const Color(0xFF8C9EFF),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Feedback học theo yêu cầu'),
            Tab(text: 'Lưu ý đơn học học theo yêu cầu'),
            Tab(text: 'Lưu ý tại trung tâm'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // Tab 1: Đánh giá học kèm 1:1
          Column(
            children: [
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                color: Colors.blue[50],
                child: const Text(
                  'Đây là các thông báo feedback dành cho học viên học theo yêu cầu',
                  style: TextStyle(
                      fontWeight: FontWeight.bold, color: Colors.blue),
                ),
              ),
              Expanded(
                child: Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        const Color(0xFF8C9EFF).withOpacity(0.2),
                        Colors.white
                      ],
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
                              hintText: 'Tìm kiếm theo tên giáo viên...',
                              prefixIcon:
                                  const Icon(Icons.search, color: Colors.grey),
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
                        child: isLoading
                            ? const Center(child: CircularProgressIndicator())
                            : filteredNotifications.isEmpty
                                ? const Center(
                                    child:
                                        Text('Không có thông báo đánh giá nào'),
                                  )
                                : ListView.builder(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 16),
                                    itemCount: filteredNotifications.length,
                                    itemBuilder: (context, index) {
                                      return _buildFeedbackCard(
                                          filteredNotifications[index]);
                                    },
                                  ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          // Tab 2: Lưu ý đơn học kèm 1:1
          Column(
            children: [
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                color: Colors.purple[50],
                child: const Text(
                  'Đây là các lưu ý liên quan đến đơn học theo yêu cầu của bạn',
                  style: TextStyle(
                      fontWeight: FontWeight.bold, color: Colors.purple),
                ),
              ),
              const Expanded(child: LearnerNotificationScreen()),
            ],
          ),
          // Tab 3: Lưu ý tại trung tâm
          Column(
            children: [
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                color: Colors.orange[50],
                child: const Text(
                  'Đây là các lưu ý, thông báo từ trung tâm (ví dụ: kiểm tra đầu vào, lịch học chung...)',
                  style: TextStyle(
                      fontWeight: FontWeight.bold, color: Colors.orange),
                ),
              ),
              const Expanded(child: CenterNotificationScreen()),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFeedbackCard(FeedbackNotification notification) {
    return GestureDetector(
      onTap: () async {
        final result = await Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => NotificationDetailScreen(
              feedbackNotification: notification,
            ),
          ),
        );
        if (result == true) {
          _fetchFeedbackNotifications();
        }
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
              Text(
                'Giáo viên: 	${notification.teacherName}',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Số buổi đã học: 	${notification.completedSessions}/${notification.totalSessions}',
                style: const TextStyle(fontSize: 14),
              ),
              const SizedBox(height: 4),
              Text(
                'Cần thanh toán: 	${notification.remainingPayment} VND',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.red[700],
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Trạng thái: 	${notification.feedbackStatus}',
                style: const TextStyle(fontSize: 14),
              ),
              const SizedBox(height: 4),
              Text(
                'Hạn chót: \t${_formatDateTime(notification.deadlineDate)} (${notification.deadlineMessage ?? ""})',
                style: const TextStyle(fontSize: 13, color: Colors.orange),
              ),
              const SizedBox(height: 4),
              if (notification.message.isNotEmpty)
                Text(
                  notification.message,
                  style: const TextStyle(fontSize: 13, color: Colors.blue),
                ),
              const SizedBox(height: 8),
              if (notification.questions.isNotEmpty)
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Các câu hỏi đánh giá:',
                      style:
                          TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                    ...notification.questions.map((q) => Padding(
                          padding: const EdgeInsets.only(top: 2, left: 8),
                          child: Text('- ${q.questionText}',
                              style: const TextStyle(fontSize: 13)),
                        )),
                  ],
                ),
              const SizedBox(height: 8),
              Text(
                'Nhấn để xem chi tiết và đánh giá',
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey[600],
                  fontStyle: FontStyle.italic,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }
}
