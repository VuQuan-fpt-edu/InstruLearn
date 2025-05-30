import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

class CenterNotificationScreen extends StatefulWidget {
  const CenterNotificationScreen({Key? key}) : super(key: key);

  @override
  State<CenterNotificationScreen> createState() =>
      _CenterNotificationScreenState();
}

class _CenterNotificationScreenState extends State<CenterNotificationScreen> {
  bool isLoading = true;
  List<dynamic> notifications = [];

  @override
  void initState() {
    super.initState();
    fetchNotifications();
  }

  Future<void> fetchNotifications() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    final learnerId = prefs.getInt('learnerId');
    if (token == null || learnerId == null) {
      setState(() {
        isLoading = false;
      });
      return;
    }
    final url =
        'https://instrulearnapplication.azurewebsites.net/api/LearnerNotification/entrance-test-notifications/$learnerId';
    final response = await http.get(
      Uri.parse(url),
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Authorization': 'Bearer $token',
      },
    );
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      if (data['isSucceed'] == true) {
        setState(() {
          notifications = (data['data'] is List) ? data['data'] : [];
          isLoading = false;
        });
      } else {
        setState(() {
          isLoading = false;
        });
      }
    } else {
      setState(() {
        isLoading = false;
      });
    }
  }

  String _parseHtmlString(String htmlString) {
    String text = htmlString.replaceAll(RegExp(r'<br ?/?>'), '\n');
    text = text.replaceAll(RegExp(r'<p>|</p>'), '\n');
    text = text.replaceAll(RegExp(r'<li>'), '\n- ');
    text = text.replaceAll(RegExp(r'</li>'), '');
    text = text.replaceAll(RegExp(r'<[^>]*>'), '');
    return text.replaceAll('\\n', '\n');
  }

  String _formatDateTime(String? dateTimeStr) {
    if (dateTimeStr == null || dateTimeStr.isEmpty) return '';
    try {
      final dt = DateTime.parse(dateTimeStr);
      return '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year} ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
    } catch (e) {
      return dateTimeStr;
    }
  }

  void _showFullContentDialog(String title, String content, String sentDate) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            Container(
              decoration: BoxDecoration(
                color: const Color(0xFF8C9EFF),
                borderRadius: BorderRadius.circular(8),
              ),
              padding: const EdgeInsets.all(8),
              child: const Icon(Icons.campaign, color: Colors.white, size: 22),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(title,
                  style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                      color: Color(0xFF536DFE))),
            ),
          ],
        ),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(content, style: const TextStyle(fontSize: 15, height: 1.6)),
              const SizedBox(height: 14),
              Row(
                children: [
                  const Icon(Icons.access_time, size: 15, color: Colors.grey),
                  const SizedBox(width: 6),
                  Text('Gửi lúc: ${_formatDateTime(sentDate)}',
                      style: const TextStyle(fontSize: 12, color: Colors.grey)),
                ],
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Đóng',
                style: TextStyle(
                    color: Color(0xFF536DFE), fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (notifications.isEmpty) {
      return const Center(child: Text('Không có lưu ý nào từ trung tâm'));
    }
    return ListView.builder(
      itemCount: notifications.length,
      itemBuilder: (context, index) {
        final item = notifications[index];
        final fullContent = _parseHtmlString(item['message'] ?? '');
        final lines =
            fullContent.split('\n').where((e) => e.trim().isNotEmpty).toList();
        final preview = lines.length > 3
            ? lines.sublist(0, 3).join('\n') + '...'
            : fullContent;
        return Container(
          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          decoration: BoxDecoration(
            color: const Color(0xFFF1F6FF),
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.grey.withOpacity(0.08),
                blurRadius: 8,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFF8C9EFF),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      padding: const EdgeInsets.all(8),
                      child: const Icon(Icons.campaign,
                          color: Colors.white, size: 22),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        item['title'] ?? '',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                          color: Color(0xFF536DFE),
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
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    preview,
                    style: const TextStyle(
                        fontSize: 15, height: 1.6, color: Colors.black87),
                  ),
                ),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.access_time,
                            size: 16, color: Colors.grey),
                        const SizedBox(width: 6),
                        Text(
                          'Gửi lúc: ${_formatDateTime(item['sentDate'])}',
                          style:
                              const TextStyle(fontSize: 13, color: Colors.grey),
                        ),
                      ],
                    ),
                    if (lines.length > 3)
                      TextButton(
                        style: TextButton.styleFrom(
                            minimumSize: Size.zero,
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 4)),
                        onPressed: () => _showFullContentDialog(
                            item['title'] ?? '',
                            fullContent,
                            item['sentDate'] ?? ''),
                        child: const Text('Xem thêm',
                            style: TextStyle(
                                fontSize: 13, color: Color(0xFF536DFE))),
                      ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
