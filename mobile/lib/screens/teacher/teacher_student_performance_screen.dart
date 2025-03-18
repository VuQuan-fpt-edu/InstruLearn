import 'package:flutter/material.dart';
import 'detail/teacher_student_attendance_detail_screen.dart';
import 'detail/teacher_student_grade_detail_screen.dart';
import 'detail/teacher_class_attendance_detail_screen.dart';
import 'detail/teacher_class_grade_detail_screen.dart';

class TeacherStudentPerformanceScreen extends StatefulWidget {
  const TeacherStudentPerformanceScreen({Key? key}) : super(key: key);

  @override
  State<TeacherStudentPerformanceScreen> createState() =>
      _TeacherStudentPerformanceScreenState();
}

class _TeacherStudentPerformanceScreenState
    extends State<TeacherStudentPerformanceScreen> {
  bool isOneOnOne = true;
  bool isAttendance = true;
  final DateTime today = DateTime.now();

  final List<ClassInfo> classes = [
    ClassInfo(
      className: 'Guitar nâng cao',
      classCode: 'GUITAR-NC-8.0-10.03.2025-17:00',
      teacherName: 'HungLD',
      slot: 'Slot 5: 17:00 - 19:00',
    ),
    ClassInfo(
      className: 'Guitar nâng cao',
      classCode: 'GUITAR-NC-8.0-10.03.2025-17:00',
      teacherName: 'HungLD',
      slot: 'Slot 5: 17:00 - 19:00',
    ),
  ];

  final List<String> students = [
    'Nguyễn Văn A',
    'Nguyễn Văn B',
    'Nguyễn Văn C',
    'Nguyễn Văn D',
    'Nguyễn Văn E',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Student Performance'),
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
            const SizedBox(height: 16),
            _buildClassTypeSelector(),
            const SizedBox(height: 12),
            _buildPerformanceTypeSelector(),
            const SizedBox(height: 16),
            _buildDateSection(),
            const SizedBox(height: 16),
            Expanded(
              child: isOneOnOne ? _buildOneOnOneList() : _buildClassList(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildClassList() {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      itemCount: classes.length,
      itemBuilder: (context, index) {
        return _buildClassCard(classes[index]);
      },
    );
  }

  Widget _buildOneOnOneList() {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      itemCount: students.length,
      itemBuilder: (context, index) {
        return _buildStudentCard(students[index]);
      },
    );
  }

  Widget _buildClassCard(ClassInfo classInfo) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.grey[300],
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.2),
            spreadRadius: 1,
            blurRadius: 6,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            if (isAttendance) {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder:
                      (context) => TeacherClassAttendanceDetailScreen(
                        className: classInfo.className,
                        classCode: classInfo.classCode,
                      ),
                ),
              );
            } else {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder:
                      (context) => TeacherClassGradeDetailScreen(
                        className: classInfo.className,
                        classCode: classInfo.classCode,
                      ),
                ),
              );
            }
          },
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  classInfo.className,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  classInfo.classCode,
                  style: TextStyle(fontSize: 14, color: Colors.grey[700]),
                ),
                const SizedBox(height: 4),
                Text(
                  'GV: ${classInfo.teacherName}',
                  style: TextStyle(fontSize: 14, color: Colors.grey[700]),
                ),
                const SizedBox(height: 4),
                Text(
                  classInfo.slot,
                  style: TextStyle(fontSize: 14, color: Colors.grey[700]),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildClassTypeSelector() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(25),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.2),
            spreadRadius: 1,
            blurRadius: 6,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: GestureDetector(
              onTap: () => setState(() => isOneOnOne = true),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(
                  color: isOneOnOne ? Colors.blue : Colors.white,
                  borderRadius: BorderRadius.circular(25),
                ),
                child: Text(
                  'Kèm 1:1',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: isOneOnOne ? Colors.white : Colors.black,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ),
          Expanded(
            child: GestureDetector(
              onTap: () => setState(() => isOneOnOne = false),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(
                  color: !isOneOnOne ? Colors.blue : Colors.white,
                  borderRadius: BorderRadius.circular(25),
                ),
                child: Text(
                  'Lớp học',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: !isOneOnOne ? Colors.white : Colors.black,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPerformanceTypeSelector() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(25),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.2),
            spreadRadius: 1,
            blurRadius: 6,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: GestureDetector(
              onTap: () => setState(() => isAttendance = true),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(
                  color: isAttendance ? Colors.blue : Colors.white,
                  borderRadius: BorderRadius.circular(25),
                ),
                child: Text(
                  'Điểm danh',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: isAttendance ? Colors.white : Colors.black,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ),
          Expanded(
            child: GestureDetector(
              onTap: () => setState(() => isAttendance = false),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(
                  color: !isAttendance ? Colors.blue : Colors.white,
                  borderRadius: BorderRadius.circular(25),
                ),
                child: Text(
                  'Điểm thành phần',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: !isAttendance ? Colors.white : Colors.black,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDateSection() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      child: Text(
        'Hôm nay: ${today.day}/${today.month}/${today.year}',
        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
      ),
    );
  }

  Widget _buildStudentCard(String studentName) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.2),
            spreadRadius: 1,
            blurRadius: 6,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            if (isAttendance) {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder:
                      (context) => TeacherStudentAttendanceDetailScreen(
                        studentName: studentName,
                      ),
                ),
              );
            } else {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder:
                      (context) => TeacherStudentGradeDetailScreen(
                        studentName: studentName,
                        isOneOnOne: isOneOnOne,
                      ),
                ),
              );
            }
          },
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    'Học viên: $studentName',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
                const Icon(
                  Icons.arrow_forward_ios,
                  size: 16,
                  color: Colors.grey,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class ClassInfo {
  final String className;
  final String classCode;
  final String teacherName;
  final String slot;

  ClassInfo({
    required this.className,
    required this.classCode,
    required this.teacherName,
    required this.slot,
  });
}
