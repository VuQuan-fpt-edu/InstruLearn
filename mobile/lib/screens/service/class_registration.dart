import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'detail/class_detail_screen.dart';

class MajorModel {
  final int majorId;
  final String majorName;
  final int status;

  MajorModel({
    required this.majorId,
    required this.majorName,
    required this.status,
  });

  factory MajorModel.fromJson(Map<String, dynamic> json) {
    return MajorModel(
      majorId: json['majorId'],
      majorName: json['majorName'],
      status: json['status'],
    );
  }
}

class ClassModel {
  final int classId;
  final int teacherId;
  final String teacherName;
  final int majorId;
  final String majorName;
  final String className;
  final String startDate;
  final String endDate;
  final String classTime;
  final String classEndTime;
  final int maxStudents;
  final int totalDays;
  final int status;
  final double price;
  final String imageUrl;
  final List<ClassDay> classDays;

  ClassModel({
    required this.classId,
    required this.teacherId,
    required this.teacherName,
    required this.majorId,
    required this.majorName,
    required this.className,
    required this.startDate,
    required this.endDate,
    required this.classTime,
    required this.classEndTime,
    required this.maxStudents,
    required this.totalDays,
    required this.status,
    required this.price,
    required this.imageUrl,
    required this.classDays,
  });

  factory ClassModel.fromJson(Map<String, dynamic> json) {
    return ClassModel(
      classId: json['classId'],
      teacherId: json['teacherId'],
      teacherName: json['teacherName'],
      majorId: json['majorId'],
      majorName: json['majorName'],
      className: json['className'],
      startDate: json['startDate'],
      endDate: json['endDate'],
      classTime: json['classTime'],
      classEndTime: json['classEndTime'],
      maxStudents: json['maxStudents'],
      totalDays: json['totalDays'],
      status: json['status'],
      price: json['price'].toDouble(),
      imageUrl: json['imageUrl'] ?? '',
      classDays: (json['classDays'] as List)
          .map((day) => ClassDay.fromJson(day))
          .toList(),
    );
  }

  String getStatusText() {
    switch (status) {
      case 0:
        return 'Đang mở';
      case 1:
        return 'Đang kiểm tra';
      case 2:
        return 'Đang diễn ra';
      case 3:
        return 'Đã hoàn thành';
      default:
        return 'Không xác định';
    }
  }

  Color getStatusColor() {
    switch (status) {
      case 0:
        return Colors.green;
      case 1:
        return Colors.orange;
      case 2:
        return Colors.blue;
      case 3:
        return Colors.grey;
      default:
        return Colors.grey;
    }
  }
}

class ClassDay {
  final String day;

  ClassDay({required this.day});

  factory ClassDay.fromJson(Map<String, dynamic> json) {
    return ClassDay(day: json['day']);
  }
}

class ClassRegistrationScreen extends StatefulWidget {
  const ClassRegistrationScreen({Key? key}) : super(key: key);

  @override
  State<ClassRegistrationScreen> createState() =>
      _ClassRegistrationScreenState();
}

class _ClassRegistrationScreenState extends State<ClassRegistrationScreen> {
  String selectedInstrument = 'Tất cả';
  String selectedStatus = 'Tất cả';
  List<ClassModel> classes = [];
  List<MajorModel> majors = [];
  bool isLoading = true;
  String error = '';

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

  @override
  void initState() {
    super.initState();
    fetchMajors();
    fetchClasses();
  }

  Future<void> fetchMajors() async {
    try {
      final response = await http.get(
        Uri.parse(
            'https://instrulearnapplication.azurewebsites.net/api/Major/get-all'),
      );

      if (response.statusCode == 200) {
        final jsonResponse = json.decode(response.body);
        if (jsonResponse['isSucceed']) {
          setState(() {
            majors = (jsonResponse['data'] as List)
                .map((json) => MajorModel.fromJson(json))
                .where((major) => major.status == 1)
                .toList();
          });
        }
      }
    } catch (e) {
      print('Error fetching majors: $e');
    }
  }

  Future<void> fetchClasses() async {
    try {
      setState(() {
        isLoading = true;
        error = '';
      });

      final response = await http.get(
        Uri.parse(
            'https://instrulearnapplication.azurewebsites.net/api/Class/get-all'),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        setState(() {
          classes = data.map((json) => ClassModel.fromJson(json)).toList();
          isLoading = false;
        });
      } else {
        setState(() {
          error = 'Không thể tải dữ liệu lớp học';
          isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        error = 'Đã xảy ra lỗi khi tải dữ liệu';
        isLoading = false;
      });
    }
  }

  List<ClassModel> getFilteredClasses() {
    var filteredClasses = classes;

    if (selectedInstrument != 'Tất cả') {
      filteredClasses = filteredClasses
          .where((c) => c.majorName == selectedInstrument)
          .toList();
    }

    if (selectedStatus != 'Tất cả') {
      filteredClasses = filteredClasses
          .where((c) => c.getStatusText() == selectedStatus)
          .toList();
    }

    return filteredClasses;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text('Lớp Học Offline tại trung tâm'),
        backgroundColor: const Color(0xFF8C9EFF),
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [const Color(0xFF8C9EFF).withOpacity(0.2), Colors.white],
          ),
        ),
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Bạn muốn chơi loại nhạc cụ gì?',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.grey[300]!),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: selectedInstrument,
                        items: [
                          const DropdownMenuItem(
                            value: 'Tất cả',
                            child: Text('Tất cả'),
                          ),
                          ...majors.map((major) => DropdownMenuItem(
                                value: major.majorName,
                                child: Text(major.majorName),
                              )),
                        ],
                        onChanged: (newValue) {
                          setState(() {
                            selectedInstrument = newValue!;
                          });
                        },
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Trạng thái lớp học',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.grey[300]!),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: selectedStatus,
                        items: [
                          const DropdownMenuItem(
                            value: 'Tất cả',
                            child: Text('Tất cả'),
                          ),
                          const DropdownMenuItem(
                            value: 'Đang mở',
                            child: Text('Đang mở'),
                          ),
                          const DropdownMenuItem(
                            value: 'Đang kiểm tra',
                            child: Text('Đang kiểm tra'),
                          ),
                          const DropdownMenuItem(
                            value: 'Đang diễn ra',
                            child: Text('Đang diễn ra'),
                          ),
                          const DropdownMenuItem(
                            value: 'Đã hoàn thành',
                            child: Text('Đã hoàn thành'),
                          ),
                        ],
                        onChanged: (newValue) {
                          setState(() {
                            selectedStatus = newValue!;
                          });
                        },
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : error.isNotEmpty
                      ? Center(child: Text(error))
                      : getFilteredClasses().isEmpty
                          ? const Center(
                              child: Text(
                                'Hiện tại trung tâm đang không có lớp',
                                style: TextStyle(fontSize: 16),
                              ),
                            )
                          : ListView.builder(
                              padding: const EdgeInsets.all(16),
                              itemCount: getFilteredClasses().length,
                              itemBuilder: (context, index) {
                                final classInfo = getFilteredClasses()[index];
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
                                            builder: (context) =>
                                                ClassDetailScreen(
                                              classId: classInfo.classId,
                                            ),
                                          ),
                                        );
                                      },
                                      borderRadius: BorderRadius.circular(15),
                                      child: Padding(
                                        padding: const EdgeInsets.all(16.0),
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            if (classInfo.imageUrl.isNotEmpty)
                                              Container(
                                                height: 200,
                                                width: double.infinity,
                                                margin: const EdgeInsets.only(
                                                    bottom: 16),
                                                decoration: BoxDecoration(
                                                  borderRadius:
                                                      BorderRadius.circular(10),
                                                  image: DecorationImage(
                                                    image: NetworkImage(
                                                        classInfo.imageUrl),
                                                    fit: BoxFit.cover,
                                                  ),
                                                ),
                                              ),
                                            Row(
                                              mainAxisAlignment:
                                                  MainAxisAlignment
                                                      .spaceBetween,
                                              children: [
                                                Expanded(
                                                  child: Text(
                                                    classInfo.className,
                                                    style: const TextStyle(
                                                      fontWeight:
                                                          FontWeight.bold,
                                                      fontSize: 18,
                                                      color: Color(0xFF1A237E),
                                                    ),
                                                  ),
                                                ),
                                                Container(
                                                  padding: const EdgeInsets
                                                      .symmetric(
                                                      horizontal: 12,
                                                      vertical: 6),
                                                  decoration: BoxDecoration(
                                                    color: classInfo
                                                        .getStatusColor(),
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                            20),
                                                  ),
                                                  child: Text(
                                                    classInfo.getStatusText(),
                                                    style: const TextStyle(
                                                      color: Colors.white,
                                                      fontWeight:
                                                          FontWeight.bold,
                                                    ),
                                                  ),
                                                ),
                                              ],
                                            ),
                                            const SizedBox(height: 12),
                                            _buildInfoRow(Icons.person,
                                                'Giáo viên: ${classInfo.teacherName}'),
                                            _buildInfoRow(Icons.school,
                                                'Môn: ${classInfo.majorName}'),
                                            _buildInfoRow(Icons.calendar_today,
                                                'Ngày bắt đầu: ${classInfo.startDate}'),
                                            _buildInfoRow(Icons.calendar_today,
                                                'Ngày kết thúc: ${classInfo.endDate}'),
                                            _buildInfoRow(Icons.access_time,
                                                'Thời gian: ${classInfo.classTime.substring(0, 5)} - ${classInfo.classEndTime.substring(0, 5)}'),
                                            _buildInfoRow(Icons.calendar_month,
                                                'Số ngày học: ${classInfo.totalDays} ngày'),
                                            _buildInfoRow(Icons.people,
                                                'Số lượng học viên tối đa: ${classInfo.maxStudents}'),
                                            _buildInfoRow(Icons.attach_money,
                                                'Học phí một buổi: ${_formatCurrency(classInfo.price)}'),
                                            _buildInfoRow(Icons.calculate,
                                                'Tổng học phí: ${_formatCurrency(classInfo.price * classInfo.totalDays)}'),
                                            _buildInfoRow(Icons.event,
                                                'Các ngày học: ${classInfo.classDays.map((d) => d.day).join(", ")}'),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ),
                                );
                              },
                            ),
            ),
          ],
        ),
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
