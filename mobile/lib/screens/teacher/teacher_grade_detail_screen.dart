import 'package:flutter/material.dart';
import '../../models/class_model.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class TeacherGradeDetailScreen extends StatefulWidget {
  final ClassModel classDetail;

  const TeacherGradeDetailScreen({
    Key? key,
    required this.classDetail,
  }) : super(key: key);

  @override
  State<TeacherGradeDetailScreen> createState() =>
      _TeacherGradeDetailScreenState();
}

class _TeacherGradeDetailScreenState extends State<TeacherGradeDetailScreen> {
  final Map<int, TextEditingController> _gradeControllers = {};
  final Map<int, TextEditingController> _commentControllers = {};

  @override
  void initState() {
    super.initState();
    for (var student in widget.classDetail.students) {
      _gradeControllers[student.learnerId] = TextEditingController();
      _commentControllers[student.learnerId] = TextEditingController();
    }
  }

  @override
  void dispose() {
    for (var controller in _gradeControllers.values) {
      controller.dispose();
    }
    for (var controller in _commentControllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  void _saveGrades() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Đã lưu điểm thành công'),
        backgroundColor: Colors.green,
      ),
    );
  }

  void _showGradeDialog(student) async {
    final classId = widget.classDetail.classId;
    final learnerId = student.learnerId;
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    if (token == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Không tìm thấy token đăng nhập!'),
            backgroundColor: Colors.red),
      );
      return;
    }
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        return FutureBuilder<http.Response>(
          future: http.get(
            Uri.parse(
                'https://instrulearnapplication.azurewebsites.net/api/ClassFeedback/class/$classId/learner/$learnerId'),
            headers: {
              'Content-Type': 'application/json; charset=UTF-8',
              'Authorization': 'Bearer $token',
            },
          ),
          builder: (context, snapshot) {
            if (!snapshot.hasData) {
              return const Center(child: CircularProgressIndicator());
            }
            if (snapshot.data!.statusCode != 200) {
              return AlertDialog(
                title: const Text('Lỗi'),
                content: Text(
                    'Form nhập điểm chỉ tồn tại khi đến buổi cuối cùng của lớp học!'),
                actions: [
                  TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Đóng')),
                ],
              );
            }
            final data = json.decode(snapshot.data!.body);
            if (data == null || data['evaluations'] == null) {
              return AlertDialog(
                title: const Text('Lỗi'),
                content: const Text('Không có dữ liệu chấm điểm!'),
                actions: [
                  TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Đóng')),
                ],
              );
            }
            final List evals = data['evaluations'];
            final Map<int, TextEditingController> gradeCtrls = {
              for (var e in evals)
                e['criterionId']: TextEditingController(
                    text: e['achievedPercentage']?.toString() ?? '')
            };
            final Map<int, TextEditingController> commentCtrls = {
              for (var e in evals)
                e['criterionId']:
                    TextEditingController(text: e['comment'] ?? '')
            };
            TextEditingController additionalCommentCtrl =
                TextEditingController(text: data['additionalComments'] ?? '');
            bool isLoading = false;
            return StatefulBuilder(
              builder: (context, setState) => AlertDialog(
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(18)),
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
                content: Container(
                  width: 600,
                  child: SingleChildScrollView(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Column(
                          children: [
                            const Icon(Icons.grade,
                                color: Color(0xFF536DFE), size: 36),
                            const SizedBox(height: 8),
                            Text(
                              'Chấm điểm học viên',
                              style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 20,
                                  color: Color(0xFF1A237E)),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 4),
                            Text(student.fullName,
                                style: const TextStyle(fontSize: 16)),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              vertical: 8, horizontal: 12),
                          decoration: BoxDecoration(
                            color: const Color(0xFFE3F2FD),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            data['templateName'] ?? '',
                            style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF1A237E)),
                          ),
                        ),
                        const SizedBox(height: 16),
                        ...evals.map<Widget>((e) => Card(
                              margin: const EdgeInsets.only(bottom: 14),
                              color: const Color(0xFFF5F7FB),
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12)),
                              child: Padding(
                                padding: const EdgeInsets.all(12),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        const Icon(Icons.check_circle_outline,
                                            color: Color(0xFF536DFE), size: 20),
                                        const SizedBox(width: 8),
                                        Expanded(
                                          child: Text(
                                            '${e['gradeCategory']} (${e['weight']}%)',
                                            style: const TextStyle(
                                                fontWeight: FontWeight.bold,
                                                color: Color(0xFF1A237E)),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 4),
                                    Container(
                                      width: double.infinity,
                                      margin: const EdgeInsets.only(bottom: 6),
                                      padding: const EdgeInsets.symmetric(
                                          vertical: 8, horizontal: 12),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFEEF7FF),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Row(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          const Icon(Icons.info_outline,
                                              color: Color(0xFF1976D2),
                                              size: 18),
                                          const SizedBox(width: 8),
                                          Expanded(
                                            child: Text(
                                              e['description'] ?? '',
                                              style: const TextStyle(
                                                  fontSize: 14,
                                                  color: Color(0xFF1976D2),
                                                  fontWeight: FontWeight.w500),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    const SizedBox(height: 10),
                                    Row(
                                      children: [
                                        const Icon(Icons.percent,
                                            size: 18, color: Color(0xFF536DFE)),
                                        const SizedBox(width: 6),
                                        Expanded(
                                          child: TextField(
                                            controller:
                                                gradeCtrls[e['criterionId']],
                                            keyboardType: TextInputType.number,
                                            decoration: InputDecoration(
                                              labelText:
                                                  'Điểm (%) (tối đa ${e['weight']}%)',
                                              border:
                                                  const OutlineInputBorder(),
                                            ),
                                            onChanged: (val) {
                                              double max = (e['weight'] ?? 100)
                                                  .toDouble();
                                              double? v = double.tryParse(val);
                                              if (v != null && v > max) {
                                                if (gradeCtrls[
                                                            e['criterionId']]!
                                                        .text !=
                                                    max.toString()) {
                                                  gradeCtrls[e['criterionId']]!
                                                      .text = max.toString();
                                                  gradeCtrls[e['criterionId']]!
                                                          .selection =
                                                      TextSelection.fromPosition(
                                                          TextPosition(
                                                              offset: gradeCtrls[
                                                                      e['criterionId']]!
                                                                  .text
                                                                  .length));
                                                }
                                              } else if (v != null && v < 0) {
                                                if (gradeCtrls[
                                                            e['criterionId']]!
                                                        .text !=
                                                    '0') {
                                                  gradeCtrls[e['criterionId']]!
                                                      .text = '0';
                                                  gradeCtrls[e['criterionId']]!
                                                          .selection =
                                                      TextSelection
                                                          .fromPosition(
                                                              TextPosition(
                                                                  offset: 1));
                                                }
                                              }
                                            },
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 8),
                                    Row(
                                      children: [
                                        const Icon(Icons.comment,
                                            size: 18, color: Color(0xFF536DFE)),
                                        const SizedBox(width: 6),
                                        Expanded(
                                          child: TextField(
                                            controller:
                                                commentCtrls[e['criterionId']],
                                            decoration: const InputDecoration(
                                              labelText: 'Nhận xét',
                                              border: OutlineInputBorder(),
                                            ),
                                            maxLines: 2,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            )),
                        const SizedBox(height: 8),
                        const Text('Nhận xét chung',
                            style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF1A237E))),
                        const SizedBox(height: 4),
                        TextField(
                          controller: additionalCommentCtrl,
                          decoration: const InputDecoration(
                            hintText: 'Nhận xét chung (tuỳ chọn)',
                            border: OutlineInputBorder(),
                          ),
                          maxLines: 2,
                        ),
                      ],
                    ),
                  ),
                ),
                actionsPadding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                actions: [
                  TextButton(
                    onPressed: isLoading ? null : () => Navigator.pop(context),
                    child: const Text('Đóng'),
                  ),
                  ElevatedButton.icon(
                    icon: isLoading
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(
                                strokeWidth: 2, color: Colors.white))
                        : const Icon(Icons.save),
                    label: const Text('Lưu'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF536DFE),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8)),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 24, vertical: 12),
                    ),
                    onPressed: isLoading
                        ? null
                        : () async {
                            bool hasError = false;
                            String errorMsg = '';
                            for (var e in evals) {
                              double max = (e['weight'] ?? 100).toDouble();
                              double val = double.tryParse(
                                      gradeCtrls[e['criterionId']]?.text ??
                                          '') ??
                                  0.0;
                              if (val > max) {
                                hasError = true;
                                errorMsg =
                                    'Điểm phần "${e['gradeCategory']}" không được lớn hơn ${max}%.';
                                break;
                              }
                              if (val < 0) {
                                hasError = true;
                                errorMsg =
                                    'Điểm phần "${e['gradeCategory']}" không được nhỏ hơn 0%.';
                                break;
                              }
                            }
                            if (hasError) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                    content: Text(errorMsg),
                                    backgroundColor: Colors.red),
                              );
                              return;
                            }
                            setState(() => isLoading = true);
                            List evalBody = evals
                                .map((e) => {
                                      'criterionId': e['criterionId'],
                                      'achievedPercentage': double.tryParse(
                                              gradeCtrls[e['criterionId']]
                                                      ?.text ??
                                                  '') ??
                                          0.0,
                                      'comment': commentCtrls[e['criterionId']]
                                              ?.text ??
                                          '',
                                    })
                                .toList();
                            final body = {
                              'classId': classId,
                              'learnerId': learnerId,
                              'additionalComments': additionalCommentCtrl.text,
                              'evaluations': evalBody,
                            };
                            final res = await http.post(
                              Uri.parse(
                                  'https://instrulearnapplication.azurewebsites.net/api/ClassFeedback/CreateFeedback'),
                              headers: {
                                'Content-Type':
                                    'application/json; charset=UTF-8',
                                'Authorization': 'Bearer $token',
                              },
                              body: json.encode(body),
                            );
                            setState(() => isLoading = false);
                            Navigator.pop(context);
                            if (res.statusCode == 200) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                    content: Text('Lưu điểm thành công!'),
                                    backgroundColor: Colors.green),
                              );
                            } else if (res.statusCode == 400) {
                              final errorData = json.decode(res.body);
                              showDialog(
                                context: context,
                                builder: (context) => AlertDialog(
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(15),
                                  ),
                                  contentPadding: const EdgeInsets.symmetric(
                                      horizontal: 24, vertical: 20),
                                  content: Container(
                                    width: 500,
                                    child: Column(
                                      mainAxisSize: MainAxisSize.min,
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          children: [
                                            const Icon(
                                              Icons.warning_amber_rounded,
                                              color: Colors.orange,
                                              size: 28,
                                            ),
                                            const SizedBox(width: 8),
                                            const Text('Không thể nhập điểm'),
                                          ],
                                        ),
                                        const SizedBox(height: 16),
                                        Text(errorData['message'] ??
                                            'Không thể lưu điểm!'),
                                        const SizedBox(height: 16),
                                        const Text(
                                          'Lưu ý:',
                                          style: TextStyle(
                                            fontWeight: FontWeight.bold,
                                            color: Color(0xFF1A237E),
                                          ),
                                        ),
                                        const SizedBox(height: 8),
                                        const Text(
                                          '• Giáo viên chỉ có thể nhập điểm sau khi khóa học kết thúc\n'
                                          '• Vui lòng đợi đến ngày kết thúc khóa học để nhập điểm cho học viên\n'
                                          '• Giáo viên chỉ có thể nhập điểm một lần và không thể sửa sau khi đã lưu điểm',
                                          style: TextStyle(
                                            color: Colors.black87,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  actions: [
                                    TextButton(
                                      onPressed: () => Navigator.pop(context),
                                      child: const Text('Đóng'),
                                    ),
                                  ],
                                ),
                              );
                            } else {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                    content: Text(
                                        'Lưu điểm thất bại! (${res.statusCode})'),
                                    backgroundColor: Colors.red),
                              );
                            }
                          },
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final classDetail = widget.classDetail;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Quản lý điểm lớp học'),
        backgroundColor: const Color(0xFF8C9EFF),
      ),
      backgroundColor: const Color(0xFFF5F5F5),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    const Color(0xFF8C9EFF),
                    const Color(0xFF8C9EFF).withOpacity(0.8),
                  ],
                ),
                borderRadius: BorderRadius.circular(15),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          classDetail.className,
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: classDetail.status == 0
                              ? Colors.green
                              : Colors.red,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          classDetail.status == 0 ? 'Đang mở' : 'Đã đóng',
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 15),
                  _buildInfoRow(Icons.person,
                      'Giáo viên: ${classDetail.teacherName}', Colors.white),
                  _buildInfoRow(Icons.school, 'Môn: ${classDetail.majorName}',
                      Colors.white),
                  _buildInfoRow(Icons.trending_up,
                      'Trình độ: ${classDetail.levelName}', Colors.white),
                ],
              ),
            ),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(15),
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.withOpacity(0.1),
                    spreadRadius: 1,
                    blurRadius: 5,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Thông tin khóa học',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1A237E),
                    ),
                  ),
                  const SizedBox(height: 15),
                  _buildInfoRow(
                      Icons.calendar_today,
                      'Ngày bắt đầu: ${classDetail.startDate}',
                      const Color(0xFF424242)),
                  _buildInfoRow(
                      Icons.calendar_today,
                      'Ngày kết thúc: ${classDetail.endDate}',
                      const Color(0xFF424242)),
                  _buildInfoRow(
                      Icons.access_time,
                      'Giờ học: ${classDetail.classTime} - ${classDetail.classEndTime}',
                      const Color(0xFF424242)),
                  _buildInfoRow(
                      Icons.people,
                      'Số học viên: ${classDetail.studentCount}/${classDetail.maxStudents}',
                      const Color(0xFF424242)),
                  _buildInfoRow(
                      Icons.attach_money,
                      'Học phí: ${classDetail.price} VNĐ',
                      const Color(0xFF424242)),
                  _buildInfoRow(
                      Icons.library_books,
                      'Tổng số buổi: ${classDetail.totalDays}',
                      const Color(0xFF424242)),
                ],
              ),
            ),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(15),
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.withOpacity(0.1),
                    spreadRadius: 1,
                    blurRadius: 5,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Danh sách học viên',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1A237E),
                    ),
                  ),
                  const SizedBox(height: 15),
                  ...classDetail.students.map((student) => Card(
                        margin: const EdgeInsets.only(bottom: 10),
                        elevation: 2,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  CircleAvatar(
                                    backgroundColor: const Color(0xFF8C9EFF),
                                    backgroundImage: student.avatar.isNotEmpty
                                        ? NetworkImage(student.avatar)
                                        : null,
                                    child: student.avatar.isEmpty
                                        ? Text(
                                            student.fullName[0].toUpperCase(),
                                            style: const TextStyle(
                                                color: Colors.white),
                                          )
                                        : null,
                                  ),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          student.fullName,
                                          style: const TextStyle(
                                            fontWeight: FontWeight.bold,
                                            color: Color(0xFF1A237E),
                                            fontSize: 16,
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          'Email: ${student.email}',
                                          style: const TextStyle(
                                              fontSize: 14,
                                              color: Colors.black87),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          'SĐT: ${student.phoneNumber}',
                                          style: const TextStyle(
                                              fontSize: 14,
                                              color: Colors.black87),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              Align(
                                alignment: Alignment.centerRight,
                                child: ElevatedButton.icon(
                                  onPressed: () => _showGradeDialog(student),
                                  icon: const Icon(Icons.edit, size: 18),
                                  label: const Text('Nhập điểm'),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF536DFE),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      )),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String text, Color textColor) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(icon, size: 20, color: textColor),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                fontSize: 14,
                color: textColor,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
