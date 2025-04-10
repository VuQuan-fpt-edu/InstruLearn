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
      classDays: (json['classDays'] as List)
          .map((day) => ClassDay.fromJson(day))
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

class ClassRegistrationScreen extends StatefulWidget {
  const ClassRegistrationScreen({Key? key}) : super(key: key);

  @override
  State<ClassRegistrationScreen> createState() =>
      _ClassRegistrationScreenState();
}

class _ClassRegistrationScreenState extends State<ClassRegistrationScreen> {
  String selectedInstrument = 'Tất cả';
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
            'https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Major/get-all'),
      );

      if (response.statusCode == 200) {
        final jsonResponse = json.decode(response.body);
        if (jsonResponse['isSucceed']) {
          setState(() {
            majors = (jsonResponse['data'] as List)
                .map((json) => MajorModel.fromJson(json))
                .where((major) =>
                    major.status == 1) // Chỉ lấy các major có status = 1
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
            'https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Class/get-all'),
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
    if (selectedInstrument == 'Tất cả') {
      return classes;
    }
    return classes.where((c) => c.majorName == selectedInstrument).toList();
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
                                return Container(
                                  margin: const EdgeInsets.only(bottom: 16),
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
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      InkWell(
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
                                        child: Padding(
                                          padding: const EdgeInsets.all(16),
                                          child: Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                classInfo.className,
                                                style: const TextStyle(
                                                  fontSize: 16,
                                                  fontWeight: FontWeight.bold,
                                                ),
                                              ),
                                              Text(
                                                'Mã lớp: ${classInfo.majorName}-${classInfo.classId}',
                                                style: const TextStyle(
                                                  fontSize: 14,
                                                  color: Colors.grey,
                                                ),
                                              ),
                                              const SizedBox(height: 8),
                                              Text(
                                                  'Giáo viên: ${classInfo.teacherName}'),
                                              Text(
                                                  'Ngày bắt đầu: ${classInfo.startDate}'),
                                              Text(
                                                  'Ngày kết thúc: ${classInfo.endDate}'),
                                              Text(
                                                  'Thời gian: ${classInfo.classTime.substring(0, 5)} - ${classInfo.classEndTime.substring(0, 5)}'),
                                              Text(
                                                  'Số ngày học: ${classInfo.totalDays} ngày'),
                                              Text(
                                                  'Số lượng học viên tối đa: ${classInfo.maxStudents}'),
                                              Text(
                                                  'Học phí: ${_formatCurrency(classInfo.price)}'),
                                              Text(
                                                  'Các ngày học: ${classInfo.classDays.map((d) => d.day).join(", ")}'),
                                            ],
                                          ),
                                        ),
                                      ),
                                      InkWell(
                                        onTap: () {},
                                        child: Container(
                                          width: double.infinity,
                                          padding: const EdgeInsets.symmetric(
                                              vertical: 12),
                                          decoration: const BoxDecoration(
                                            color: Colors.red,
                                            borderRadius: BorderRadius.only(
                                              bottomLeft: Radius.circular(12),
                                              bottomRight: Radius.circular(12),
                                            ),
                                          ),
                                          child: const Text(
                                            'Tham gia',
                                            style: TextStyle(
                                              color: Colors.white,
                                              fontWeight: FontWeight.bold,
                                            ),
                                            textAlign: TextAlign.center,
                                          ),
                                        ),
                                      ),
                                    ],
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
}
