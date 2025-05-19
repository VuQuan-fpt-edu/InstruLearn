import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';

class TeacherEvaluationScreen extends StatefulWidget {
  final int learnerId;

  const TeacherEvaluationScreen({
    Key? key,
    required this.learnerId,
  }) : super(key: key);

  @override
  State<TeacherEvaluationScreen> createState() =>
      _TeacherEvaluationScreenState();
}

class _TeacherEvaluationScreenState extends State<TeacherEvaluationScreen> {
  bool isLoading = true;
  List<dynamic> evaluations = [];

  @override
  void initState() {
    super.initState();
    _fetchEvaluations();
  }

  Future<void> _fetchEvaluations() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token == null) {
        _showErrorMessage('Vui lòng đăng nhập lại');
        return;
      }

      final response = await http.get(
        Uri.parse(
          'https://instrulearnapplication.azurewebsites.net/api/TeacherEvaluation/by-learner/${widget.learnerId}',
        ),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['isSucceed'] == true) {
          setState(() {
            evaluations = data['data'];
            isLoading = false;
          });
        } else {
          setState(() {
            isLoading = false;
          });
          _showErrorMessage(data['message'] ?? 'Không thể tải đánh giá');
        }
      } else {
        setState(() {
          isLoading = false;
        });
        _showErrorMessage('Lỗi kết nối: ${response.statusCode}');
      }
    } catch (e) {
      setState(() {
        isLoading = false;
      });
      _showErrorMessage('Lỗi: ${e.toString()}');
    }
  }

  void _showErrorMessage(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(message)),
      );
    }
  }

  String _formatDate(String dateString) {
    final date = DateTime.parse(dateString);
    return DateFormat('dd/MM/yyyy HH:mm').format(date);
  }

  String _getStatusText(int status) {
    switch (status) {
      case 0:
        return 'Chưa hoàn thành';
      case 1:
        return 'Đang thực hiện';
      case 2:
        return 'Đã hoàn thành';
      default:
        return 'Không xác định';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        title: const Text('Báo cáo đánh giá'),
        backgroundColor: const Color(0xFF8C9EFF),
        elevation: 0,
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : evaluations.isEmpty
              ? const Center(
                  child: Text(
                    'Chưa có đánh giá nào',
                    style: TextStyle(fontSize: 16),
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: evaluations.length,
                  itemBuilder: (context, index) {
                    final evaluation = evaluations[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 16),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'Môn học: ${evaluation['majorName']}',
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 4,
                                  ),
                                  decoration: BoxDecoration(
                                    color: evaluation['status'] == 2
                                        ? Colors.green
                                        : Colors.orange,
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Text(
                                    _getStatusText(evaluation['status']),
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 12,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Text(
                              'Giáo viên: ${evaluation['teacherName']}',
                              style: const TextStyle(fontSize: 16),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Yêu cầu học: ${evaluation['learningRequest']}',
                              style: const TextStyle(fontSize: 16),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Ngày tạo: ${_formatDate(evaluation['createdAt'])}',
                              style: const TextStyle(fontSize: 14),
                            ),
                            if (evaluation['completedAt'] != null) ...[
                              const SizedBox(height: 4),
                              Text(
                                'Ngày hoàn thành: ${_formatDate(evaluation['completedAt'])}',
                                style: const TextStyle(fontSize: 14),
                              ),
                            ],
                            const SizedBox(height: 16),
                            const Divider(),
                            const SizedBox(height: 8),
                            const Text(
                              'Kết quả đánh giá:',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 8),
                            ...evaluation['answers'].map<Widget>((answer) {
                              return Padding(
                                padding: const EdgeInsets.only(bottom: 8),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      answer['questionText'],
                                      style: const TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      'Trả lời: ${answer['selectedOptionText']}',
                                      style: const TextStyle(
                                        fontSize: 14,
                                        color: Colors.blue,
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            }).toList(),
                            const SizedBox(height: 16),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'Đạt mục tiêu: ${evaluation['goalsAchieved'] ? 'Có' : 'Không'}',
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: evaluation['goalsAchieved']
                                        ? Colors.green
                                        : Colors.red,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                Text(
                                  'Buổi học: ${evaluation['completedSessions']}/${evaluation['totalSessions']}',
                                  style: const TextStyle(fontSize: 14),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
