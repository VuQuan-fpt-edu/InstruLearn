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
  final int levelId;
  final String levelName;
  final String syllabusLink;
  final String testDay;
  final String classTime;
  final int maxStudents;
  final int totalDays;
  final int status;
  final double price;
  final String startDate;
  final List<String> sessionDates;
  final List<ClassDay> classDays;
  final int studentCount;
  final List<Student> students;
  final String imageUrl;

  ClassDetailModel({
    required this.classId,
    required this.className,
    required this.teacherId,
    required this.teacherName,
    required this.majorId,
    required this.majorName,
    required this.levelId,
    required this.levelName,
    required this.syllabusLink,
    required this.testDay,
    required this.classTime,
    required this.maxStudents,
    required this.totalDays,
    required this.status,
    required this.price,
    required this.startDate,
    required this.sessionDates,
    required this.classDays,
    required this.studentCount,
    required this.students,
    required this.imageUrl,
  });

  factory ClassDetailModel.fromJson(Map<String, dynamic> json) {
    return ClassDetailModel(
      classId: json['classId'],
      className: json['className'],
      teacherId: json['teacherId'],
      teacherName: json['teacherName'],
      majorId: json['majorId'],
      majorName: json['majorName'],
      levelId: json['levelId'],
      levelName: json['levelName'],
      syllabusLink: json['syllabusLink'],
      testDay: json['testDay'],
      classTime: json['classTime'],
      maxStudents: json['maxStudents'],
      totalDays: json['totalDays'],
      status: json['status'],
      price: json['price'].toDouble(),
      startDate: json['startDate'],
      sessionDates: List<String>.from(json['sessionDates']),
      classDays: (json['classDays'] as List)
          .map((day) => ClassDay.fromJson(day))
          .toList(),
      studentCount: json['studentCount'],
      students: (json['students'] as List)
          .map((student) => Student.fromJson(student))
          .toList(),
      imageUrl: json['imageUrl'] ?? '',
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

class TeacherDetailModel {
  final int teacherId;
  final String accountId;
  final String email;
  final String fullname;
  final String heading;
  final String details;
  final String links;
  final String phoneNumber;
  final String gender;
  final String address;
  final String avatar;
  final String dateOfEmployment;
  final int isActive;
  final List<TeacherMajor> majors;

  TeacherDetailModel({
    required this.teacherId,
    required this.accountId,
    required this.email,
    required this.fullname,
    required this.heading,
    required this.details,
    required this.links,
    required this.phoneNumber,
    required this.gender,
    required this.address,
    required this.avatar,
    required this.dateOfEmployment,
    required this.isActive,
    required this.majors,
  });

  factory TeacherDetailModel.fromJson(Map<String, dynamic> json) {
    return TeacherDetailModel(
      teacherId: json['teacherId'],
      accountId: json['accountId'] ?? 'Chưa có',
      email: json['email'] ?? 'Chưa có',
      fullname: json['fullname'] ?? 'Chưa có',
      heading: json['heading'] ?? 'Chưa có',
      details: json['details'] ?? 'Chưa có',
      links: json['links'] ?? 'Chưa có',
      phoneNumber: json['phoneNumber'] ?? 'Chưa có',
      gender: json['gender'] ?? 'Chưa có',
      address: json['address'] ?? 'Chưa có',
      avatar: json['avatar'] ?? 'Chưa có',
      dateOfEmployment: json['dateOfEmployment'] ?? 'Chưa có',
      isActive: json['isActive'],
      majors: (json['majors'] as List)
          .map((major) => TeacherMajor.fromJson(major))
          .toList(),
    );
  }
}

class TeacherMajor {
  final int majorId;
  final String majorName;
  final int status;

  TeacherMajor({
    required this.majorId,
    required this.majorName,
    required this.status,
  });

  factory TeacherMajor.fromJson(Map<String, dynamic> json) {
    return TeacherMajor(
      majorId: json['majorId'],
      majorName: json['majorName'],
      status: json['status'],
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
  TeacherDetailModel? teacherDetail;
  int? learnerId;
  bool isLoadingTeacher = false;

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

  void _showSuccessDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return Dialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          child: Container(
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: Colors.green.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.check_circle,
                    color: Colors.green,
                    size: 60,
                  ),
                ),
                const SizedBox(height: 20),
                const Text(
                  'Tham gia thành công!',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 16),
                const Text(
                  'Chúc mừng bạn đã đăng ký thành công lớp học. Vui lòng theo dõi phần Thông báo -> Lưu ý tại trung tâm để không bỏ lỡ những thông báo quan trọng',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 16),
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: () {
                    Navigator.of(context).pop();
                    Navigator.pop(context);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF8C9EFF),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 32,
                      vertical: 12,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: const Text(
                    'Đóng',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.white,
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
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
          'https://instrulearnapplication.azurewebsites.net/api/LearningRegis/join-class',
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
            _showSuccessDialog();
          }
        } else {
          if (mounted) {
            showDialog(
              context: context,
              builder: (BuildContext context) {
                return AlertDialog(
                  title: const Text('Thông báo từ hệ thống'),
                  content: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        jsonResponse['message'] ?? 'Không thể tham gia lớp học',
                        style: const TextStyle(fontSize: 14),
                      ),
                    ],
                  ),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.of(context).pop(),
                      child: const Text('Đóng'),
                    ),
                  ],
                );
              },
            );
          }
        }
      } else {
        if (mounted) {
          String? errorMessage;
          try {
            final jsonResponse = json.decode(response.body);
            errorMessage = jsonResponse['message'];
          } catch (_) {}
          showDialog(
            context: context,
            builder: (BuildContext context) {
              return AlertDialog(
                title: const Text('Thông báo từ hệ thống'),
                content: Text(
                  errorMessage ?? 'Đã có lỗi xảy ra khi tham gia lớp học',
                  style: const TextStyle(fontSize: 14),
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.of(context).pop(),
                    child: const Text('Đóng'),
                  ),
                ],
              );
            },
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

    final depositAmount =
        (classDetail!.price * classDetail!.totalDays * 0.1).round();

    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Xác nhận tham gia'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Bạn có chắc muốn tham gia ${classDetail!.className}?',
                style: const TextStyle(fontSize: 16),
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.red.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.red.withOpacity(0.3)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Lưu ý quan trọng:',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.red,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '• Phí giữ chỗ: ${_formatCurrency(depositAmount)} (10% học phí)',
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      '• Phí giữ chỗ sẽ KHÔNG được hoàn trả nếu:',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                        '  - Không tham gia kiểm tra chất lượng đầu vào'),
                    const Text(
                        '  - Không thanh toán phần học phí còn lại sau khi kiểm tra'),
                  ],
                ),
              ),
            ],
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
            'https://instrulearnapplication.azurewebsites.net/api/Class/${widget.classId}'),
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

  Future<void> _fetchTeacherDetail(int teacherId) async {
    try {
      setState(() {
        isLoadingTeacher = true;
      });

      final response = await http.get(
        Uri.parse(
            'https://instrulearnapplication.azurewebsites.net/api/Teacher/$teacherId'),
      );

      if (response.statusCode == 200) {
        final jsonResponse = json.decode(response.body);
        if (jsonResponse['isSucceed']) {
          setState(() {
            teacherDetail = TeacherDetailModel.fromJson(jsonResponse['data']);
            isLoadingTeacher = false;
          });
          _showTeacherDetailDialog();
        } else {
          setState(() {
            isLoadingTeacher = false;
          });
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Không thể tải thông tin giáo viên'),
              ),
            );
          }
        }
      } else {
        setState(() {
          isLoadingTeacher = false;
        });
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Không thể tải thông tin giáo viên'),
            ),
          );
        }
      }
    } catch (e) {
      setState(() {
        isLoadingTeacher = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi: ${e.toString()}'),
          ),
        );
      }
    }
  }

  void _showTeacherDetailDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return Dialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          child: Container(
            padding: const EdgeInsets.all(20),
            constraints: BoxConstraints(
              maxHeight: MediaQuery.of(context).size.height * 0.8,
            ),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Thông tin giáo viên',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF8C9EFF),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () => Navigator.of(context).pop(),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Center(
                    child: Stack(
                      children: [
                        CircleAvatar(
                          radius: 50,
                          backgroundColor:
                              const Color(0xFF8C9EFF).withOpacity(0.1),
                          backgroundImage: teacherDetail!.avatar != "string"
                              ? NetworkImage(teacherDetail!.avatar)
                              : null,
                          child: teacherDetail!.avatar == "string"
                              ? Text(
                                  teacherDetail!.fullname[0].toUpperCase(),
                                  style: const TextStyle(
                                    fontSize: 32,
                                    color: Color(0xFF8C9EFF),
                                    fontWeight: FontWeight.bold,
                                  ),
                                )
                              : null,
                        ),
                        if (teacherDetail!.isActive == 1)
                          Positioned(
                            right: 0,
                            bottom: 0,
                            child: Container(
                              padding: const EdgeInsets.all(4),
                              decoration: const BoxDecoration(
                                color: Colors.green,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.check,
                                color: Colors.white,
                                size: 12,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF8C9EFF).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildTeacherInfoRow(
                            'Họ và tên', teacherDetail!.fullname),
                        _buildTeacherInfoRow('Email', teacherDetail!.email),
                        _buildTeacherInfoRow(
                            'Số điện thoại', teacherDetail!.phoneNumber),
                        _buildTeacherInfoRow('Địa chỉ', teacherDetail!.address),
                        _buildTeacherInfoRow(
                            'Kinh nghiệm', teacherDetail!.heading),
                        _buildTeacherInfoRow('Giới tính',
                            teacherDetail!.gender == 'male' ? 'Nam' : 'Nữ'),
                        _buildTeacherInfoRow(
                            'Ngày vào làm', teacherDetail!.dateOfEmployment),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF8C9EFF).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Mô tả',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF8C9EFF),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          teacherDetail!.details,
                          style: const TextStyle(fontSize: 14),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF8C9EFF).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Chuyên môn',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF8C9EFF),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: teacherDetail!.majors.map((major) {
                            return Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 6,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(
                                  color: const Color(0xFF8C9EFF),
                                ),
                              ),
                              child: Text(
                                major.majorName,
                                style: const TextStyle(
                                  fontSize: 14,
                                  color: Color(0xFF8C9EFF),
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildTeacherInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 14,
                color: Colors.grey,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
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

  String _formatCurrency(num amount) {
    final formatted = amount.toStringAsFixed(0);
    final chars = formatted.split('').reversed.toList();
    final withCommas = <String>[];
    for (var i = 0; i < chars.length; i++) {
      if (i > 0 && i % 3 == 0) {
        withCommas.add(',');
      }
      withCommas.add(chars[i]);
    }
    return withCommas.reversed.join('') + ' VNĐ';
  }

  Map<String, List<String>> _groupDatesByMonth(List<String> dates) {
    Map<String, List<String>> groupedDates = {};
    for (String date in dates) {
      DateTime dateTime = DateTime.parse(date);
      String monthKey = '${dateTime.month}/${dateTime.year}';
      if (!groupedDates.containsKey(monthKey)) {
        groupedDates[monthKey] = [];
      }
      groupedDates[monthKey]!.add(date);
    }
    return groupedDates;
  }

  String _formatMonthYear(String monthYear) {
    List<String> parts = monthYear.split('/');
    DateTime date = DateTime(int.parse(parts[1]), int.parse(parts[0]));
    return 'Tháng ${date.month}/${date.year}';
  }

  String _formatDate(String date) {
    DateTime dateTime = DateTime.parse(date);
    return '${dateTime.day}/${dateTime.month}/${dateTime.year}';
  }

  Widget _buildSessionDatesCard() {
    Map<String, List<String>> groupedDates =
        _groupDatesByMonth(classDetail!.sessionDates);

    return _buildInfoCard(
      'Lịch học chi tiết',
      groupedDates.entries.map((entry) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Text(
                _formatMonthYear(entry.key),
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF8C9EFF),
                ),
              ),
            ),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: entry.value.map((date) {
                return Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFF8C9EFF).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: const Color(0xFF8C9EFF).withOpacity(0.3),
                    ),
                  ),
                  child: Text(
                    _formatDate(date),
                    style: const TextStyle(
                      fontSize: 14,
                      color: Colors.black,
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 16),
          ],
        );
      }).toList(),
    );
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
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (classDetail!.imageUrl.isNotEmpty)
                            Container(
                              width: double.infinity,
                              height: 250,
                              decoration: BoxDecoration(
                                image: DecorationImage(
                                  image: NetworkImage(classDetail!.imageUrl),
                                  fit: BoxFit.cover,
                                ),
                              ),
                              child: Container(
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    begin: Alignment.topCenter,
                                    end: Alignment.bottomCenter,
                                    colors: [
                                      Colors.transparent,
                                      Colors.black.withOpacity(0.7),
                                    ],
                                  ),
                                ),
                                padding: const EdgeInsets.all(20),
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.end,
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      classDetail!.className,
                                      style: const TextStyle(
                                        fontSize: 24,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.white,
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    Row(
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 12,
                                            vertical: 6,
                                          ),
                                          decoration: BoxDecoration(
                                            color:
                                                Colors.white.withOpacity(0.2),
                                            borderRadius:
                                                BorderRadius.circular(20),
                                          ),
                                          child: Text(
                                            classDetail!.majorName,
                                            style: const TextStyle(
                                              color: Colors.white,
                                              fontWeight: FontWeight.w500,
                                            ),
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                        Container(
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 12,
                                            vertical: 6,
                                          ),
                                          decoration: BoxDecoration(
                                            color:
                                                Colors.white.withOpacity(0.2),
                                            borderRadius:
                                                BorderRadius.circular(20),
                                          ),
                                          child: Text(
                                            classDetail!.levelName,
                                            style: const TextStyle(
                                              color: Colors.white,
                                              fontWeight: FontWeight.w500,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            )
                          else
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.all(20),
                              decoration: BoxDecoration(
                                color: const Color(0xFF8C9EFF),
                                borderRadius: const BorderRadius.only(
                                  bottomLeft: Radius.circular(30),
                                  bottomRight: Radius.circular(30),
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.grey.withOpacity(0.3),
                                    spreadRadius: 2,
                                    blurRadius: 5,
                                    offset: const Offset(0, 3),
                                  ),
                                ],
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    classDetail!.className,
                                    style: const TextStyle(
                                      fontSize: 24,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 12,
                                          vertical: 6,
                                        ),
                                        decoration: BoxDecoration(
                                          color: Colors.white.withOpacity(0.2),
                                          borderRadius:
                                              BorderRadius.circular(20),
                                        ),
                                        child: Text(
                                          classDetail!.majorName,
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontWeight: FontWeight.w500,
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 12,
                                          vertical: 6,
                                        ),
                                        decoration: BoxDecoration(
                                          color: Colors.white.withOpacity(0.2),
                                          borderRadius:
                                              BorderRadius.circular(20),
                                        ),
                                        child: Text(
                                          classDetail!.levelName,
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontWeight: FontWeight.w500,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          Padding(
                            padding: const EdgeInsets.all(20),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildInfoCard(
                                  'Thông tin cơ bản',
                                  [
                                    _buildInfoRow(
                                      Icons.person,
                                      'Giáo viên',
                                      classDetail!.teacherName,
                                    ),
                                    _buildInfoRow(
                                      Icons.calendar_today,
                                      'Ngày bắt đầu',
                                      classDetail!.startDate,
                                    ),
                                    _buildInfoRow(
                                      Icons.access_time,
                                      'Thời gian học',
                                      '${classDetail!.classTime.substring(0, 5)}',
                                    ),
                                    _buildInfoRow(
                                      Icons.people,
                                      'Số học viên',
                                      '${classDetail!.studentCount}/${classDetail!.maxStudents}',
                                    ),
                                    _buildInfoRow(
                                      Icons.attach_money,
                                      'Học phí một buổi',
                                      _formatCurrency(classDetail!.price),
                                    ),
                                    _buildInfoRow(
                                      Icons.payments,
                                      'Tổng học phí',
                                      _formatCurrency(classDetail!.price *
                                          classDetail!.totalDays),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 16),
                                _buildInfoCard(
                                  'Thông tin khóa học',
                                  [
                                    _buildInfoRow(
                                      Icons.event,
                                      'Ngày kiểm tra chất lượng đầu vào',
                                      classDetail!.testDay,
                                    ),
                                    _buildInfoRow(
                                      Icons.calendar_month,
                                      'Số buổi học',
                                      '${classDetail!.totalDays} buổi',
                                    ),
                                    _buildInfoRow(
                                      Icons.schedule,
                                      'Các ngày học trong tuần',
                                      classDetail!.classDays
                                          .map((d) => d.day)
                                          .join(", "),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 16),
                                _buildSessionDatesCard(),
                                if (classDetail!.students.isNotEmpty) ...[
                                  const SizedBox(height: 16),
                                  _buildInfoCard(
                                    'Danh sách học viên',
                                    classDetail!.students
                                        .map(
                                          (student) =>
                                              _buildStudentRow(student),
                                        )
                                        .toList(),
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
                                            borderRadius:
                                                BorderRadius.circular(12),
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
                                              onPressed:
                                                  _showJoinConfirmationDialog,
                                              style: ElevatedButton.styleFrom(
                                                backgroundColor: Colors.red,
                                                padding:
                                                    const EdgeInsets.symmetric(
                                                  vertical: 16,
                                                ),
                                                shape: RoundedRectangleBorder(
                                                  borderRadius:
                                                      BorderRadius.circular(12),
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
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                vertical: 16,
                                              ),
                                              decoration: BoxDecoration(
                                                color: Colors.grey[300],
                                                borderRadius:
                                                    BorderRadius.circular(12),
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
                        ],
                      ),
                    ),
    );
  }

  Widget _buildInfoCard(String title, List<Widget> children) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 6,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Color(0xFF8C9EFF),
            ),
          ),
          const SizedBox(height: 12),
          ...children,
        ],
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value,
      {bool isLink = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: const Color(0xFF8C9EFF)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 14,
                    color: Colors.grey,
                  ),
                ),
                const SizedBox(height: 4),
                if (label == 'Giáo viên')
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFF8C9EFF).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: const Color(0xFF8C9EFF).withOpacity(0.3),
                      ),
                    ),
                    child: InkWell(
                      onTap: () => _fetchTeacherDetail(classDetail!.teacherId),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            value,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w500,
                              color: Color(0xFF8C9EFF),
                            ),
                          ),
                          const SizedBox(width: 4),
                          const Icon(
                            Icons.arrow_forward_ios,
                            size: 12,
                            color: Color(0xFF8C9EFF),
                          ),
                          const SizedBox(width: 4),
                          const Text(
                            '(Xem chi tiết)',
                            style: TextStyle(
                              fontSize: 12,
                              color: Color(0xFF8C9EFF),
                            ),
                          ),
                        ],
                      ),
                    ),
                  )
                else if (isLink)
                  InkWell(
                    onTap: () {},
                    child: Text(
                      value,
                      style: const TextStyle(
                        fontSize: 16,
                        color: Colors.blue,
                        decoration: TextDecoration.underline,
                      ),
                    ),
                  )
                else
                  Text(
                    value,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStudentRow(Student student) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          CircleAvatar(
            radius: 20,
            backgroundColor: Colors.grey[200],
            backgroundImage: student.avatar != "string"
                ? NetworkImage(student.avatar)
                : null,
            child: student.avatar == "string"
                ? Text(
                    student.fullName[0].toUpperCase(),
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  )
                : null,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  student.fullName,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                Text(
                  student.email,
                  style: const TextStyle(
                    fontSize: 14,
                    color: Colors.grey,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
