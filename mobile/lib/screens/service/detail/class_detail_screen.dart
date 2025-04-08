import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class ClassDetailModel {
  final int classId;
  final String className;
  final int teacherId;
  final String teacherName;
  final int majorId;
  final String majorName;
  final int syllabusId;
  final String syllabusName;
  final String classTime;
  final int maxStudents;
  final int totalDays;
  final int status;
  final double price;
  final String startDate;
  final List<ClassDay> classDays;
  final int studentCount;
  final List<Student> students;

  ClassDetailModel({
    required this.classId,
    required this.className,
    required this.teacherId,
    required this.teacherName,
    required this.majorId,
    required this.majorName,
    required this.syllabusId,
    required this.syllabusName,
    required this.classTime,
    required this.maxStudents,
    required this.totalDays,
    required this.status,
    required this.price,
    required this.startDate,
    required this.classDays,
    required this.studentCount,
    required this.students,
  });

  factory ClassDetailModel.fromJson(Map<String, dynamic> json) {
    return ClassDetailModel(
      classId: json['classId'],
      className: json['className'],
      teacherId: json['teacherId'],
      teacherName: json['teacherName'],
      majorId: json['majorId'],
      majorName: json['majorName'],
      syllabusId: json['syllabusId'],
      syllabusName: json['syllabusName'],
      classTime: json['classTime'],
      maxStudents: json['maxStudents'],
      totalDays: json['totalDays'],
      status: json['status'],
      price: json['price'].toDouble(),
      startDate: json['startDate'],
      classDays: (json['classDays'] as List)
          .map((day) => ClassDay.fromJson(day))
          .toList(),
      studentCount: json['studentCount'],
      students: (json['students'] as List)
          .map((student) => Student.fromJson(student))
          .toList(),
    );
  }
}

class ClassDay {
  final String day;

  ClassDay({required this.day});

  factory ClassDay.fromJson(Map<String, dynamic> json) {
    return ClassDay(day: json['day']);
  }
}

class Student {
  final int learnerId;
  final String fullName;
  final String email;
  final String phoneNumber;
  final String avatar;

  Student({
    required this.learnerId,
    required this.fullName,
    required this.email,
    required this.phoneNumber,
    required this.avatar,
  });

  factory Student.fromJson(Map<String, dynamic> json) {
    return Student(
      learnerId: json['learnerId'],
      fullName: json['fullName'],
      email: json['email'],
      phoneNumber: json['phoneNumber'],
      avatar: json['avatar'],
    );
  }
}

class ClassDetailScreen extends StatefulWidget {
  final int classId;

  const ClassDetailScreen({
    Key? key,
    required this.classId,
  }) : super(key: key);

  @override
  State<ClassDetailScreen> createState() => _ClassDetailScreenState();
}

class _ClassDetailScreenState extends State<ClassDetailScreen> {
  bool isLoading = true;
  String error = '';
  ClassDetailModel? classDetail;
  int? learnerId;

  @override
  void initState() {
    super.initState();
    _initData();
  }

  Future<void> _initData() async {
    await _getLearnerId();
    await fetchClassDetail();
  }

  Future<void> _getLearnerId() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final id = prefs.getInt('learnerId');
      if (mounted) {
        setState(() {
          learnerId = id;
        });
      }
    } catch (e) {
      print('Error getting learnerId: $e');
    }
  }

  Future<void> _joinClass() async {
    if (learnerId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Vui lòng đăng nhập để tham gia lớp học'),
        ),
      );
      return;
    }

    try {
      final response = await http.post(
        Uri.parse(
          'https://instrulearnapplication2025-h7hfdte3etdth7av.southeastasia-01.azurewebsites.net/api/LearningRegis/join-class',
        ),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'learnerId': learnerId,
          'classId': widget.classId,
        }),
      );

      if (response.statusCode == 200) {
        final jsonResponse = json.decode(response.body);
        if (jsonResponse['isSucceed']) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text(
                  'Chúc mừng bạn đã tham gia lớp thành công, Lưu ý bấm vào phần Application để xem lại đơn đăng ký',
                ),
                duration: Duration(seconds: 3),
              ),
            );
            Navigator.pop(context);
          }
        } else {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(
                  jsonResponse['message'] ?? 'Không thể tham gia lớp học',
                ),
              ),
            );
          }
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Đã có lỗi xảy ra khi tham gia lớp học'),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi: ${e.toString()}'),
          ),
        );
      }
    }
  }

  void _showJoinConfirmationDialog() {
    if (classDetail == null) return;

    final depositAmount = (classDetail!.price * 0.1).round(); // 10% học phí

    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Xác nhận tham gia'),
          content: Text(
            'Bạn có chắc muốn tham gia ${classDetail!.className}. Bạn sẽ phải đóng ${depositAmount.toStringAsFixed(0)}đ (10% học phí) chi phí giữ chỗ',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Hủy'),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                _joinClass();
              },
              child: const Text('Xác nhận'),
            ),
          ],
        );
      },
    );
  }

  Future<void> fetchClassDetail() async {
    try {
      setState(() {
        isLoading = true;
        error = '';
      });

      final response = await http.get(
        Uri.parse(
            'https://instrulearnapplication2025-h7hfdte3etdth7av.southeastasia-01.azurewebsites.net/api/Class/${widget.classId}'),
      );

      if (response.statusCode == 200) {
        final jsonResponse = json.decode(response.body);
        if (jsonResponse['isSucceed']) {
          setState(() {
            classDetail = ClassDetailModel.fromJson(jsonResponse['data']);
            isLoading = false;
          });
        } else {
          setState(() {
            error =
                jsonResponse['message'] ?? 'Không thể tải thông tin lớp học';
            isLoading = false;
          });
        }
      } else {
        setState(() {
          error = 'Không thể tải thông tin lớp học';
          isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        error = 'Đã xảy ra lỗi khi tải thông tin';
        isLoading = false;
      });
    }
  }

  bool _hasJoinedClass() {
    if (learnerId == null ||
        classDetail == null ||
        classDetail!.students.isEmpty) {
      return false;
    }
    return classDetail!.students
        .any((student) => student.learnerId == learnerId);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text('Chi tiết lớp học'),
        backgroundColor: const Color(0xFF8C9EFF),
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : error.isNotEmpty
              ? Center(child: Text(error))
              : classDetail == null
                  ? const Center(child: Text('Không có thông tin lớp học'))
                  : SingleChildScrollView(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            classDetail!.className,
                            style: const TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 16),
                          _buildInfoSection('Thông tin lớp học', [
                            'Mã lớp: ${classDetail!.classId}',
                            'Môn học: ${classDetail!.majorName}',
                            'Giáo viên: ${classDetail!.teacherName}',
                            'Giáo trình: ${classDetail!.syllabusName}',
                            'Thời gian học: ${classDetail!.classTime.substring(0, 5)}',
                            'Ngày bắt đầu: ${classDetail!.startDate}',
                            'Số buổi học: ${classDetail!.totalDays} buổi',
                            'Học phí: ${classDetail!.price.toStringAsFixed(0)}đ',
                            'Số học viên hiện tại: ${classDetail!.studentCount}/${classDetail!.maxStudents}',
                            'Các ngày học trong tuần: ${classDetail!.classDays.map((d) => d.day).join(", ")}',
                            'Trạng thái lớp: ${classDetail!.status == 0 ? 'Đang mở đăng ký' : 'Đã đóng đăng ký'}',
                          ]),
                          const SizedBox(height: 16),
                          if (classDetail!.students.isNotEmpty) ...[
                            const Text(
                              'Danh sách học viên',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 8),
                            ListView.builder(
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              itemCount: classDetail!.students.length,
                              itemBuilder: (context, index) {
                                final student = classDetail!.students[index];
                                return Card(
                                  child: ListTile(
                                    leading: CircleAvatar(
                                      backgroundImage:
                                          student.avatar != "string"
                                              ? NetworkImage(student.avatar)
                                              : null,
                                      child: student.avatar == "string"
                                          ? Text(
                                              student.fullName[0].toUpperCase())
                                          : null,
                                    ),
                                    title: Text(student.fullName),
                                    subtitle: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(student.email),
                                        Text(student.phoneNumber),
                                      ],
                                    ),
                                  ),
                                );
                              },
                            ),
                          ],
                          const SizedBox(height: 16),
                          SizedBox(
                            width: double.infinity,
                            child: _hasJoinedClass()
                                ? Container(
                                    padding: const EdgeInsets.symmetric(
                                      vertical: 16,
                                    ),
                                    decoration: BoxDecoration(
                                      color: Colors.grey[300],
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: const Text(
                                      'Bạn đã tham gia lớp học',
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                      ),
                                      textAlign: TextAlign.center,
                                    ),
                                  )
                                : classDetail!.status == 0
                                    ? ElevatedButton(
                                        onPressed: _showJoinConfirmationDialog,
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: Colors.red,
                                          padding: const EdgeInsets.symmetric(
                                            vertical: 16,
                                          ),
                                          shape: RoundedRectangleBorder(
                                            borderRadius:
                                                BorderRadius.circular(8),
                                          ),
                                        ),
                                        child: const Text(
                                          'Tham gia lớp học',
                                          style: TextStyle(
                                            fontSize: 16,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      )
                                    : Container(
                                        padding: const EdgeInsets.symmetric(
                                          vertical: 16,
                                        ),
                                        decoration: BoxDecoration(
                                          color: Colors.grey[300],
                                          borderRadius:
                                              BorderRadius.circular(8),
                                        ),
                                        child: const Text(
                                          'Lớp học đã đóng đăng ký',
                                          style: TextStyle(
                                            fontSize: 16,
                                            fontWeight: FontWeight.bold,
                                          ),
                                          textAlign: TextAlign.center,
                                        ),
                                      ),
                          ),
                        ],
                      ),
                    ),
    );
  }

  Widget _buildInfoSection(String title, List<String> items) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        ...items.map((item) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Text(item),
            )),
      ],
    );
  }
}
