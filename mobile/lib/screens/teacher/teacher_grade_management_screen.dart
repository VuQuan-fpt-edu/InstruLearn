import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import '../../models/class_model.dart';
import 'teacher_grade_detail_screen.dart';

class TeacherGradeManagementScreen extends StatefulWidget {
  const TeacherGradeManagementScreen({Key? key}) : super(key: key);

  @override
  State<TeacherGradeManagementScreen> createState() =>
      _TeacherGradeManagementScreenState();
}

class _TeacherGradeManagementScreenState
    extends State<TeacherGradeManagementScreen> {
  List<ClassModel> classes = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchClasses();
  }

  Future<void> _fetchClasses() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');
      final teacherId = prefs.getInt('teacherId');

      if (token == null || teacherId == null) {
        _showErrorMessage('Không thể lấy thông tin người dùng');
        return;
      }

      final response = await http.get(
        Uri.parse(
            'https://instrulearnapplication.azurewebsites.net/api/Class/teacher/$teacherId'),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['isSucceed'] == true) {
          setState(() {
            classes = (data['data'] as List)
                .map((json) => ClassModel.fromJson(json))
                .toList();
            isLoading = false;
          });
        } else {
          _showErrorMessage(
              data['message'] ?? 'Không thể tải danh sách lớp học');
        }
      } else {
        _showErrorMessage('Lỗi kết nối: ${response.statusCode}');
      }
    } catch (e) {
      _showErrorMessage('Lỗi: ${e.toString()}');
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  void _showErrorMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.red),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        title: const Text('Quản lý điểm'),
        backgroundColor: const Color(0xFF8C9EFF),
        elevation: 0,
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : classes.isEmpty
              ? const Center(
                  child: Text(
                    'Không có lớp học nào',
                    style: TextStyle(fontSize: 16),
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: classes.length,
                  itemBuilder: (context, index) {
                    final classItem = classes[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 20),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(15),
                      ),
                      elevation: 4,
                      color: Colors.white,
                      child: Container(
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(15),
                          gradient: LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: [
                              Colors.white,
                              const Color(0xFFE3F2FD),
                            ],
                          ),
                        ),
                        child: InkWell(
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => TeacherGradeDetailScreen(
                                  classDetail: classItem,
                                ),
                              ),
                            );
                          },
                          borderRadius: BorderRadius.circular(15),
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Expanded(
                                      child: Text(
                                        classItem.className,
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 18,
                                          color: Color(0xFF1A237E),
                                        ),
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 12, vertical: 6),
                                      decoration: BoxDecoration(
                                        color: classItem.status == 0
                                            ? Colors.green
                                            : Colors.red,
                                        borderRadius: BorderRadius.circular(20),
                                      ),
                                      child: Text(
                                        classItem.status == 0
                                            ? 'Đang mở'
                                            : 'Đã đóng',
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                _buildInfoRow(Icons.school,
                                    'Môn: ${classItem.majorName}'),
                                _buildInfoRow(Icons.trending_up,
                                    'Trình độ: ${classItem.levelName}'),
                                _buildInfoRow(Icons.people,
                                    'Học viên: ${classItem.studentCount}/${classItem.maxStudents}'),
                                _buildInfoRow(Icons.calendar_today,
                                    'Ngày bắt đầu: ${classItem.startDate}'),
                                _buildInfoRow(Icons.calendar_today,
                                    'Ngày kết thúc: ${classItem.endDate}'),
                                _buildInfoRow(Icons.access_time,
                                    'Thời gian học: ${classItem.classTime} - ${classItem.classEndTime}'),
                                const SizedBox(height: 8),
                                ElevatedButton(
                                  onPressed: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) =>
                                            TeacherGradeDetailScreen(
                                          classDetail: classItem,
                                        ),
                                      ),
                                    );
                                  },
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF536DFE),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                  ),
                                  child: const Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(Icons.grade, color: Colors.white),
                                      SizedBox(width: 8),
                                      Text(
                                        'Xem và nhập điểm',
                                        style: TextStyle(color: Colors.white),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                ),
    );
  }

  Widget _buildInfoRow(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(icon, size: 20, color: const Color(0xFF1A237E)),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(
                fontSize: 14,
                color: Color(0xFF424242),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
