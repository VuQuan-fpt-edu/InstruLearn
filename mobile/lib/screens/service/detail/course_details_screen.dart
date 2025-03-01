import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../buy_course_screen.dart';

class CourseContent {
  final int contentId;
  final int courseId;
  final String heading;

  CourseContent({
    required this.contentId,
    required this.courseId,
    required this.heading,
  });

  factory CourseContent.fromJson(Map<String, dynamic> json) {
    return CourseContent(
      contentId: json['contentId'] as int,
      courseId: json['courseId'] as int,
      heading: json['heading'] as String,
    );
  }
}

class CourseDetailsScreen extends StatefulWidget {
  final Course course;

  const CourseDetailsScreen({Key? key, required this.course}) : super(key: key);

  @override
  State<CourseDetailsScreen> createState() => _CourseDetailsScreenState();
}

class _CourseDetailsScreenState extends State<CourseDetailsScreen> {
  List<CourseContent> contents = [];
  bool isLoading = true;
  String errorMessage = '';
  bool isInCart = false;

  @override
  void initState() {
    super.initState();
    _fetchCourseContents();
  }

  Future<void> _fetchCourseContents() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token == null) {
        setState(() {
          isLoading = false;
          errorMessage = 'Bạn cần đăng nhập để xem nội dung khóa học';
        });
        return;
      }

      final response = await http.get(
        Uri.parse(
          'https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/CourseContent/get-all',
        ),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['isSucceed'] == true) {
          final List<dynamic> contentsData = data['data'];
          setState(() {
            contents =
                contentsData
                    .map((json) => CourseContent.fromJson(json))
                    .where(
                      (content) => content.courseId == widget.course.courseId,
                    )
                    .toList();
            isLoading = false;
          });
        } else {
          setState(() {
            isLoading = false;
            errorMessage = data['message'] ?? 'Không thể tải nội dung khóa học';
          });
        }
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

  String _formatCurrency(int amount) {
    return '${amount.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')} VND';
  }

  Widget _buildErrorWidget() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 60, color: Colors.red),
            const SizedBox(height: 20),
            Text(
              errorMessage,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _fetchCourseContents,
              child: const Text('Thử lại'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Chi tiết khóa học'),
        backgroundColor: const Color(0xFF8C9EFF),
      ),
      body:
          isLoading
              ? const Center(child: CircularProgressIndicator())
              : errorMessage.isNotEmpty
              ? _buildErrorWidget()
              : _buildCourseDetails(),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          children: [
            Expanded(
              child: ElevatedButton(
                onPressed: () {
                  setState(() {
                    isInCart = !isInCart;
                  });
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        isInCart
                            ? 'Đã thêm khóa học ${widget.course.courseName} vào giỏ hàng'
                            : 'Đã xóa khóa học ${widget.course.courseName} khỏi giỏ hàng',
                      ),
                      duration: const Duration(seconds: 2),
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: isInCart ? Colors.grey : Colors.blue[700],
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: Text(
                  isInCart ? 'Xóa khỏi giỏ hàng' : 'Thêm vào giỏ hàng',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: ElevatedButton(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        'Đang mua khóa học ${widget.course.courseName}',
                      ),
                      duration: const Duration(seconds: 2),
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.orange,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: const Text(
                  'Mua ngay',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCourseDetails() {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Course Image
          AspectRatio(
            aspectRatio: 16 / 9,
            child: Image.network(
              widget.course.imageUrl,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) {
                return Container(
                  color: Colors.grey[300],
                  child: const Center(
                    child: Icon(
                      Icons.broken_image,
                      size: 50,
                      color: Colors.grey,
                    ),
                  ),
                );
              },
            ),
          ),

          // Course Info Section
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Category and Rating
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 5,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.blue[100],
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        widget.course.typeName,
                        style: TextStyle(
                          color: Colors.blue[800],
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    Row(
                      children: [
                        Icon(Icons.star, color: Colors.amber[700], size: 20),
                        const SizedBox(width: 4),
                        Text(
                          widget.course.rating.toString(),
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),

                const SizedBox(height: 16),

                // Course Name
                Text(
                  widget.course.courseName,
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),

                const SizedBox(height: 8),

                // Course Headline
                Text(
                  widget.course.headline,
                  style: const TextStyle(fontSize: 16, color: Colors.black87),
                ),

                const SizedBox(height: 16),

                // Price Information
                Row(
                  children: [
                    Text(
                      _formatCurrency(widget.course.price),
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: Colors.blue,
                      ),
                    ),
                    if (widget.course.discount > 0) ...[
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.red[100],
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          '-${widget.course.discount}%',
                          style: TextStyle(
                            color: Colors.red[800],
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),

                const Divider(height: 32),

                // Course Description
                const Text(
                  'Mô tả khóa học',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Text(
                  widget.course.courseDescription,
                  style: const TextStyle(fontSize: 15, height: 1.5),
                ),

                const Divider(height: 32),

                // Course Contents
                const Text(
                  'Nội dung khóa học',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                if (contents.isEmpty)
                  const Text(
                    'Không có nội dung khóa học',
                    style: TextStyle(
                      fontStyle: FontStyle.italic,
                      color: Colors.grey,
                    ),
                  )
                else
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: contents.length,
                    itemBuilder: (context, index) {
                      final content = contents[index];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 8),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: Colors.blue[100],
                            child: Text(
                              (index + 1).toString(),
                              style: TextStyle(
                                color: Colors.blue[800],
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          title: Text(
                            content.heading,
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                          trailing: const Icon(Icons.lock),
                          onTap: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text(
                                  'Bạn cần mua khóa học để xem nội dung này',
                                ),
                                duration: Duration(seconds: 2),
                              ),
                            );
                          },
                        ),
                      );
                    },
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
