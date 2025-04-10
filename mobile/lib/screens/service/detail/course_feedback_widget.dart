import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../../../services/cart_service.dart';

class FeedbackReply {
  final int feedbackRepliesId;
  final int feedbackId;
  final String accountId;
  final String email;
  final String role;
  final String repliesContent;
  final DateTime createdAt;

  FeedbackReply({
    required this.feedbackRepliesId,
    required this.feedbackId,
    required this.accountId,
    required this.email,
    required this.role,
    required this.repliesContent,
    required this.createdAt,
  });

  factory FeedbackReply.fromJson(Map<String, dynamic> json) {
    return FeedbackReply(
      feedbackRepliesId: (json['feedbackRepliesId'] as num?)?.toInt() ?? 0,
      feedbackId: (json['feedbackId'] as num?)?.toInt() ?? 0,
      accountId: (json['accountId'] as String?) ?? '',
      email: (json['email'] as String?) ?? '',
      role: (json['role'] as String?) ?? '',
      repliesContent: (json['repliesContent'] as String?) ?? '',
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : DateTime.now(),
    );
  }
}

class CourseFeedback {
  final int feedbackId;
  final int coursePackageId;
  final String accountId;
  final String email;
  final String role;
  final String feedbackContent;
  final int rating;
  final DateTime createdAt;
  final List<FeedbackReply> replies;

  CourseFeedback({
    required this.feedbackId,
    required this.coursePackageId,
    required this.accountId,
    required this.email,
    required this.role,
    required this.feedbackContent,
    required this.rating,
    required this.createdAt,
    required this.replies,
  });

  factory CourseFeedback.fromJson(Map<String, dynamic> json) {
    return CourseFeedback(
      feedbackId: (json['feedbackId'] as num?)?.toInt() ?? 0,
      coursePackageId: (json['coursePackageId'] as num?)?.toInt() ?? 0,
      accountId: (json['accountId'] as String?) ?? '',
      email: (json['email'] as String?) ?? '',
      role: (json['role'] as String?) ?? '',
      feedbackContent: (json['feedbackContent'] as String?) ?? '',
      rating: (json['rating'] as num?)?.toInt() ?? 0,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : DateTime.now(),
      replies: ((json['replies'] as List<dynamic>?) ?? [])
          .map((replyJson) => FeedbackReply.fromJson(replyJson))
          .toList(),
    );
  }
}

class CourseFeedbackWidget extends StatefulWidget {
  final int courseId;

  const CourseFeedbackWidget({Key? key, required this.courseId})
      : super(key: key);

  @override
  State<CourseFeedbackWidget> createState() => _CourseFeedbackWidgetState();
}

class _CourseFeedbackWidgetState extends State<CourseFeedbackWidget> {
  List<CourseFeedback> feedbacks = [];
  bool isLoading = true;
  String errorMessage = '';
  bool isAddingFeedback = false;
  bool hasPurchasedCourse = false;
  final TextEditingController _feedbackController = TextEditingController();
  final TextEditingController _replyController = TextEditingController();
  int _selectedRating = 5;
  String? _currentUserId;
  String? _currentUserEmail;
  String? _currentUserRole;
  final CartService _cartService = CartService();

  @override
  void initState() {
    super.initState();
    _fetchUserInfo();
    _fetchFeedbacks();
    _checkCoursePurchase();
  }

  @override
  void dispose() {
    _feedbackController.dispose();
    _replyController.dispose();
    super.dispose();
  }

  Future<void> _fetchUserInfo() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token == null) {
        print('Debug - Token not found');
        return;
      }

      final response = await http.get(
        Uri.parse(
          'https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Auth/Profile',
        ),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['isSucceed'] == true && data['data'] != null) {
          final accountId = data['data']['accountId'];
          await prefs.setString('accountId', accountId);
          print('Debug - Fetched accountId: $accountId');
          setState(() {
            _currentUserId = accountId;
          });
        }
      }
    } catch (e) {
      print('Debug - Error fetching user info: $e');
    }
  }

  Future<void> _fetchFeedbacks() async {
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
          errorMessage = 'Bạn cần đăng nhập để xem đánh giá';
        });
        return;
      }

      final response = await http.get(
        Uri.parse(
          'https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Feedback/get-all',
        ),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        setState(() {
          feedbacks = data
              .map((json) => CourseFeedback.fromJson(json))
              .where((feedback) => feedback.coursePackageId == widget.courseId)
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

  Future<void> _checkCoursePurchase() async {
    try {
      final purchased = await _cartService.isCoursePurchased(widget.courseId);
      setState(() {
        hasPurchasedCourse = purchased;
      });
      print('Debug - Course ID: ${widget.courseId}, Has Purchased: $purchased');
    } catch (e) {
      print('Lỗi kiểm tra mua khóa học: $e');
      setState(() {
        hasPurchasedCourse = false;
      });
    }
  }

  Future<void> _submitFeedback() async {
    if (_feedbackController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng nhập nội dung đánh giá')),
      );
      return;
    }

    setState(() {
      isLoading = true;
    });

    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');
      final accountId = prefs.getString('accountId');

      if (token == null) {
        setState(() {
          isLoading = false;
          errorMessage = 'Bạn cần đăng nhập để gửi đánh giá';
        });
        return;
      }

      if (accountId == null) {
        setState(() {
          isLoading = false;
          errorMessage = 'Không tìm thấy thông tin người dùng';
        });
        return;
      }

      final response = await http.post(
        Uri.parse(
          'https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Feedback/create',
        ),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer $token',
        },
        body: json.encode({
          'coursePackageId': widget.courseId,
          'accountId': accountId,
          'feedbackContent': _feedbackController.text,
          'rating': _selectedRating,
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        _feedbackController.clear();
        setState(() {
          isAddingFeedback = false;
        });
        _fetchFeedbacks();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Đánh giá đã được gửi thành công')),
        );
      } else {
        final errorData = json.decode(response.body);
        setState(() {
          isLoading = false;
          errorMessage = errorData['message'] ?? 'Không thể gửi đánh giá';
        });
      }
    } catch (e) {
      setState(() {
        isLoading = false;
        errorMessage = 'Lỗi: ${e.toString()}';
      });
    }
  }

  Future<void> _submitReply(int feedbackId) async {
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
      final accountId = prefs.getString('accountId');

      if (token == null) {
        setState(() {
          isLoading = false;
          errorMessage = 'Bạn cần đăng nhập để gửi phản hồi';
        });
        return;
      }

      if (accountId == null) {
        setState(() {
          isLoading = false;
          errorMessage = 'Không tìm thấy thông tin người dùng';
        });
        return;
      }

      final response = await http.post(
        Uri.parse(
          'https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/FeedbackReplies/create',
        ),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer $token',
        },
        body: json.encode({
          'feedbackId': feedbackId,
          'accountId': accountId,
          'repliesContent': _replyController.text,
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        _replyController.clear();
        _fetchFeedbacks();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Phản hồi đã được gửi thành công')),
        );
      } else {
        final errorData = json.decode(response.body);
        setState(() {
          isLoading = false;
          errorMessage = errorData['message'] ?? 'Không thể gửi phản hồi';
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

  Widget _buildStarRating(int rating) {
    return Row(
      children: List.generate(5, (index) {
        return Icon(
          index < rating ? Icons.star : Icons.star_border,
          color: Colors.amber,
          size: 18,
        );
      }),
    );
  }

  Widget _buildRatingSelection() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(5, (index) {
        return IconButton(
          icon: Icon(
            index < _selectedRating ? Icons.star : Icons.star_border,
            color: Colors.amber,
          ),
          onPressed: () {
            setState(() {
              _selectedRating = index + 1;
            });
          },
        );
      }),
    );
  }

  Widget _buildFeedbackItem(CourseFeedback feedback) {
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
                        feedback.email,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                      Text(
                        feedback.role,
                        style: const TextStyle(
                          color: Colors.grey,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    _buildStarRating(feedback.rating),
                    Text(
                      _formatDateTime(feedback.createdAt),
                      style: const TextStyle(color: Colors.grey, fontSize: 12),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              feedback.feedbackContent,
              style: const TextStyle(fontSize: 15),
            ),
            const SizedBox(height: 8),
            if (feedback.replies.isNotEmpty) ...[
              const Divider(),
              ...feedback.replies.map((reply) => _buildReplyItem(reply)),
            ],
            if (!hasPurchasedCourse)
              TextButton.icon(
                icon: const Icon(Icons.lock, size: 16),
                label: const Text('Mua khóa học để trả lời'),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Bạn cần mua khóa học để trả lời'),
                      duration: Duration(seconds: 3),
                    ),
                  );
                },
              )
            else
              TextButton.icon(
                icon: const Icon(Icons.reply, size: 16),
                label: const Text('Trả lời'),
                onPressed: () {
                  showModalBottomSheet(
                    context: context,
                    isScrollControlled: true,
                    builder: (context) => Padding(
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
                            'Phản hồi đánh giá',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 16),
                          TextField(
                            controller: _replyController,
                            decoration: const InputDecoration(
                              hintText: 'Nhập phản hồi của bạn...',
                              border: OutlineInputBorder(),
                            ),
                            maxLines: 3,
                          ),
                          const SizedBox(height: 16),
                          ElevatedButton(
                            onPressed: () {
                              Navigator.pop(context);
                              _submitReply(feedback.feedbackId);
                            },
                            child: const Text('Gửi phản hồi'),
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

  Widget _buildReplyItem(FeedbackReply reply) {
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
            child: Text(
              reply.repliesContent,
              style: const TextStyle(fontSize: 14),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAddFeedbackButton() {
    if (!hasPurchasedCourse) {
      return Container(
        height: 40,
        child: ElevatedButton.icon(
          icon: const Icon(Icons.lock, size: 16),
          label: const Text('Mua khóa học'),
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Bạn cần mua khóa học để đánh giá'),
                duration: Duration(seconds: 3),
              ),
            );
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.grey[700],
            padding: const EdgeInsets.symmetric(horizontal: 12),
          ),
        ),
      );
    }

    return Container(
      height: 40,
      child: ElevatedButton.icon(
        icon: const Icon(Icons.rate_review, size: 16),
        label: const Text('Viết đánh giá'),
        onPressed: () {
          setState(() {
            isAddingFeedback = true;
          });
        },
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.blue[700],
          padding: const EdgeInsets.symmetric(horizontal: 12),
        ),
      ),
    );
  }

  Widget _buildFeedbackForm() {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 16),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Đánh giá của bạn',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            _buildRatingSelection(),
            const SizedBox(height: 16),
            TextField(
              controller: _feedbackController,
              decoration: const InputDecoration(
                hintText: 'Nhập đánh giá của bạn về khóa học...',
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
                      isAddingFeedback = false;
                      _feedbackController.clear();
                    });
                  },
                  child: const Text('Hủy'),
                ),
                const SizedBox(width: 16),
                ElevatedButton(
                  onPressed: _submitFeedback,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue[700],
                  ),
                  child: const Text('Gửi đánh giá'),
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
              onPressed: _fetchFeedbacks,
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
                'Đánh giá từ học viên',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              if (!isAddingFeedback && _currentUserId != null)
                _buildAddFeedbackButton(),
            ],
          ),
          const SizedBox(height: 16),
          if (isAddingFeedback) _buildFeedbackForm(),
          if (isLoading)
            const Center(child: CircularProgressIndicator())
          else if (errorMessage.isNotEmpty)
            _buildErrorWidget()
          else if (feedbacks.isEmpty)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(20.0),
                child: Text(
                  'Chưa có đánh giá nào cho khóa học này',
                  style: TextStyle(
                    fontStyle: FontStyle.italic,
                    color: Colors.grey,
                  ),
                ),
              ),
            )
          else
            Column(
              children: feedbacks
                  .map((feedback) => _buildFeedbackItem(feedback))
                  .toList(),
            ),
        ],
      ),
    );
  }
}
