import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../../models/feedback_notification.dart';
import 'detail/notification_detail_screen.dart';
import 'learner_notification_screen.dart';

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
    _tabController = TabController(length: 2, vsync: this);
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Thông báo'),
        backgroundColor: const Color(0xFF8C9EFF),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Đánh giá'),
            Tab(text: 'Lưu ý'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          Container(
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
                              child: Text('Không có thông báo đánh giá nào'),
                            )
                          : ListView.builder(
                              padding:
                                  const EdgeInsets.symmetric(horizontal: 16),
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
          const LearnerNotificationScreen(),
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
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      'Giáo viên: ${notification.teacherName}',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.red[50],
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      'Cần thanh toán: ${notification.remainingPayment} VND',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.red[700],
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
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
