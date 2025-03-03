import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class QnAReply {
  final int replyId;
  final int questionId;
  final String accountId;
  final String email;
  final String role;
  final String qnAContent;
  final DateTime createdAt;

  QnAReply({
    required this.replyId,
    required this.questionId,
    required this.accountId,
    required this.email,
    required this.role,
    required this.qnAContent,
    required this.createdAt,
  });

  factory QnAReply.fromJson(Map<String, dynamic> json) {
    return QnAReply(
      replyId: json['replyId'] as int,
      questionId: json['questionId'] as int,
      accountId: json['accountId'] as String,
      email: json['email'] as String,
      role: json['role'] as String,
      qnAContent: json['qnAContent'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}

class CourseQuestion {
  final int questionId;
  final int courseId;
  final String accountId;
  final String email;
  final String role;
  final String title;
  final String questionContent;
  final DateTime createdAt;
  final List<QnAReply> replies;

  CourseQuestion({
    required this.questionId,
    required this.courseId,
    required this.accountId,
    required this.email,
    required this.role,
    required this.title,
    required this.questionContent,
    required this.createdAt,
    required this.replies,
  });

  factory CourseQuestion.fromJson(Map<String, dynamic> json) {
    return CourseQuestion(
      questionId: json['questionId'] as int,
      courseId: json['courseId'] as int,
      accountId: json['accountId'] as String,
      email: json['email'] as String,
      role: json['role'] as String,
      title: json['title'] as String,
      questionContent: json['questionContent'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      replies:
          (json['replies'] as List<dynamic>)
              .map((replyJson) => QnAReply.fromJson(replyJson))
              .toList(),
    );
  }
}

class CourseQnAWidget extends StatefulWidget {
  final int courseId;

  const CourseQnAWidget({Key? key, required this.courseId}) : super(key: key);

  @override
  State<CourseQnAWidget> createState() => _CourseQnAWidgetState();
}

class _CourseQnAWidgetState extends State<CourseQnAWidget> {
  List<CourseQuestion> questions = [];
  bool isLoading = true;
  String errorMessage = '';
  bool isAddingQuestion = false;
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _questionController = TextEditingController();
  final TextEditingController _replyController = TextEditingController();
  String? _currentUserEmail;
  String? _currentUserRole;
  String? _currentUserId;

  @override
  void initState() {
    super.initState();
    _fetchUserInfo();
    _fetchQuestions();
  }

  @override
  void dispose() {
    _titleController.dispose();
    _questionController.dispose();
    _replyController.dispose();
    super.dispose();
  }

  Future<void> _fetchUserInfo() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _currentUserEmail = prefs.getString('email');
      _currentUserRole = prefs.getString('role');
      _currentUserId = prefs.getString('userId');
    });
  }

  Future<void> _fetchQuestions() async {
    setState(() {
      isLoading = true;
      errorMessage = '';
    });

    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token == null) {
        setState(() {
          isLoading = false;
          errorMessage = 'Bạn cần đăng nhập để xem câu hỏi';
        });
        return;
      }

      final response = await http.get(
        Uri.parse(
          'https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/QnA/get-all',
        ),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        setState(() {
          questions =
              data
                  .map((json) => CourseQuestion.fromJson(json))
                  .where((question) => question.courseId == widget.courseId)
                  .toList();
          isLoading = false;
        });
      } else if (response.statusCode == 401) {
        setState(() {
          isLoading = false;
          errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        });
      } else {
        setState(() {
          isLoading = false;
          errorMessage = 'Lỗi kết nối: ${response.statusCode}';
        });
      }
    } catch (e) {
      setState(() {
        isLoading = false;
        errorMessage = 'Lỗi: ${e.toString()}';
      });
    }
  }

  Future<void> _submitQuestion() async {
    if (_titleController.text.trim().isEmpty ||
        _questionController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Vui lòng nhập tiêu đề và nội dung câu hỏi'),
        ),
      );
      return;
    }

    setState(() {
      isLoading = true;
    });

    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token == null) {
        setState(() {
          isLoading = false;
          errorMessage = 'Bạn cần đăng nhập để gửi câu hỏi';
        });
        return;
      }

      final response = await http.post(
        Uri.parse(
          'https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/QnA/create',
        ),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer $token',
        },
        body: json.encode({
          'courseId': widget.courseId,
          'title': _titleController.text,
          'questionContent': _questionController.text,
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        _titleController.clear();
        _questionController.clear();
        setState(() {
          isAddingQuestion = false;
        });
        _fetchQuestions();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Câu hỏi đã được gửi thành công')),
        );
      } else {
        setState(() {
          isLoading = false;
          errorMessage = 'Không thể gửi câu hỏi: ${response.statusCode}';
        });
      }
    } catch (e) {
      setState(() {
        isLoading = false;
        errorMessage = 'Lỗi: ${e.toString()}';
      });
    }
  }

  Future<void> _submitReply(int questionId) async {
    if (_replyController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng nhập nội dung phản hồi')),
      );
      return;
    }

    setState(() {
      isLoading = true;
    });

    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token == null) {
        setState(() {
          isLoading = false;
          errorMessage = 'Bạn cần đăng nhập để gửi phản hồi';
        });
        return;
      }

      final response = await http.post(
        Uri.parse(
          'https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/QnA/reply',
        ),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer $token',
        },
        body: json.encode({
          'questionId': questionId,
          'qnAContent': _replyController.text,
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        _replyController.clear();
        _fetchQuestions();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Phản hồi đã được gửi thành công')),
        );
      } else {
        setState(() {
          isLoading = false;
          errorMessage = 'Không thể gửi phản hồi: ${response.statusCode}';
        });
      }
    } catch (e) {
      setState(() {
        isLoading = false;
        errorMessage = 'Lỗi: ${e.toString()}';
      });
    }
  }

  String _formatDateTime(DateTime dateTime) {
    return '${dateTime.day}/${dateTime.month}/${dateTime.year} ${dateTime.hour}:${dateTime.minute.toString().padLeft(2, '0')}';
  }

  Widget _buildReplyItem(QnAReply reply) {
    return Padding(
      padding: const EdgeInsets.only(left: 16, top: 8, bottom: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
                  children: [
                    const Icon(Icons.subdirectory_arrow_right, size: 16),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            reply.email,
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                            ),
                          ),
                          Text(
                            reply.role,
                            style: const TextStyle(
                              color: Colors.grey,
                              fontSize: 11,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              Text(
                _formatDateTime(reply.createdAt),
                style: const TextStyle(color: Colors.grey, fontSize: 11),
              ),
            ],
          ),
          Padding(
            padding: const EdgeInsets.only(left: 20),
            child: Text(reply.qnAContent, style: const TextStyle(fontSize: 14)),
          ),
        ],
      ),
    );
  }

  Widget _buildQuestionItem(CourseQuestion question) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8),
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        question.email,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                      Text(
                        question.role,
                        style: const TextStyle(
                          color: Colors.grey,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                Text(
                  _formatDateTime(question.createdAt),
                  style: const TextStyle(color: Colors.grey, fontSize: 12),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              question.title,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            Text(
              question.questionContent,
              style: const TextStyle(fontSize: 15),
            ),
            const SizedBox(height: 8),
            // Replies section
            if (question.replies.isNotEmpty) ...[
              const Divider(),
              ...question.replies.map((reply) => _buildReplyItem(reply)),
            ],
            // Reply button
            TextButton.icon(
              icon: const Icon(Icons.reply, size: 16),
              label: const Text('Trả lời'),
              onPressed: () {
                showModalBottomSheet(
                  context: context,
                  isScrollControlled: true,
                  builder:
                      (context) => Padding(
                        padding: EdgeInsets.only(
                          bottom: MediaQuery.of(context).viewInsets.bottom,
                          left: 16,
                          right: 16,
                          top: 16,
                        ),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Text(
                              'Trả lời câu hỏi',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 16),
                            TextField(
                              controller: _replyController,
                              decoration: const InputDecoration(
                                hintText: 'Nhập câu trả lời của bạn...',
                                border: OutlineInputBorder(),
                              ),
                              maxLines: 3,
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton(
                              onPressed: () {
                                Navigator.pop(context);
                                _submitReply(question.questionId);
                              },
                              child: const Text('Gửi trả lời'),
                            ),
                            const SizedBox(height: 16),
                          ],
                        ),
                      ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAddQuestionButton() {
    return ElevatedButton.icon(
      icon: const Icon(Icons.question_answer),
      label: const Text('Đặt câu hỏi'),
      onPressed: () {
        setState(() {
          isAddingQuestion = true;
        });
      },
      style: ElevatedButton.styleFrom(
        backgroundColor: Colors.blue[700],
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      ),
    );
  }

  Widget _buildQuestionForm() {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 16),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Câu hỏi của bạn',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _titleController,
              decoration: const InputDecoration(
                hintText: 'Tiêu đề câu hỏi',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _questionController,
              decoration: const InputDecoration(
                hintText: 'Nội dung câu hỏi của bạn về khóa học...',
                border: OutlineInputBorder(),
              ),
              maxLines: 4,
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton(
                  onPressed: () {
                    setState(() {
                      isAddingQuestion = false;
                      _titleController.clear();
                      _questionController.clear();
                    });
                  },
                  child: const Text('Hủy'),
                ),
                const SizedBox(width: 16),
                ElevatedButton(
                  onPressed: _submitQuestion,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue[700],
                  ),
                  child: const Text('Gửi câu hỏi'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorWidget() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 40, color: Colors.red),
            const SizedBox(height: 16),
            Text(
              errorMessage,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _fetchQuestions,
              child: const Text('Thử lại'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Divider(height: 32),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Hỏi đáp về khóa học',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              if (!isAddingQuestion && _currentUserEmail != null)
                _buildAddQuestionButton(),
            ],
          ),
          const SizedBox(height: 16),
          if (isAddingQuestion) _buildQuestionForm(),
          if (isLoading)
            const Center(child: CircularProgressIndicator())
          else if (errorMessage.isNotEmpty)
            _buildErrorWidget()
          else if (questions.isEmpty)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(20.0),
                child: Text(
                  'Chưa có câu hỏi nào cho khóa học này',
                  style: TextStyle(
                    fontStyle: FontStyle.italic,
                    color: Colors.grey,
                  ),
                ),
              ),
            )
          else
            Column(
              children:
                  questions
                      .map((question) => _buildQuestionItem(question))
                      .toList(),
            ),
        ],
      ),
    );
  }
}
