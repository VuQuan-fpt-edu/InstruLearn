import 'package:flutter/material.dart';

class TeacherStudentAttendanceDetailScreen extends StatefulWidget {
  final String studentName;

  const TeacherStudentAttendanceDetailScreen({
    Key? key,
    required this.studentName,
  }) : super(key: key);

  @override
  State<TeacherStudentAttendanceDetailScreen> createState() =>
      _TeacherStudentAttendanceDetailScreenState();
}

class _TeacherStudentAttendanceDetailScreenState
    extends State<TeacherStudentAttendanceDetailScreen> {
  final List<LessonSlot> slots = [
    LessonSlot(
      id: 1,
      title: 'Học cách cầm nhạc cụ',
      dayOfWeek: 'Thứ 2',
      date: '20/12/2025',
      status: AttendanceStatus.present,
    ),
    LessonSlot(
      id: 2,
      title: 'Học cách cầm nhạc cụ',
      dayOfWeek: 'Thứ 3',
      date: '21/12/2025',
      status: AttendanceStatus.present,
    ),
    LessonSlot(
      id: 3,
      title: 'Học cách cầm nhạc cụ',
      dayOfWeek: 'Thứ 4',
      date: '22/12/2025',
      status: AttendanceStatus.present,
    ),
    LessonSlot(
      id: 4,
      title: 'Học cách cầm nhạc cụ',
      dayOfWeek: 'Thứ 2',
      date: '27/12/2025',
      status: AttendanceStatus.absent,
    ),
    LessonSlot(
      id: 5,
      title: 'Học cách cầm nhạc cụ',
      dayOfWeek: 'Thứ 3',
      date: '28/12/2025',
      status: AttendanceStatus.notYet,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Details'),
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
        child: ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: slots.length,
          itemBuilder: (context, index) {
            return _buildLessonSlot(slots[index]);
          },
        ),
      ),
    );
  }

  Widget _buildLessonSlot(LessonSlot slot) {
    Color backgroundColor;
    bool isCurrentDay = slot.status != AttendanceStatus.notYet;

    switch (slot.status) {
      case AttendanceStatus.present:
        backgroundColor = Colors.green;
        break;
      case AttendanceStatus.absent:
        backgroundColor = Colors.red;
        break;
      case AttendanceStatus.notYet:
        backgroundColor = Colors.grey;
        break;
    }

    return GestureDetector(
      onTap: isCurrentDay ? () => _showAttendanceDialog(slot) : null,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: backgroundColor,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Slot ${slot.id}: ${slot.title}',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              '${slot.dayOfWeek}    ${slot.date}',
              style: const TextStyle(color: Colors.white, fontSize: 14),
            ),
          ],
        ),
      ),
    );
  }

  void _showAttendanceDialog(LessonSlot slot) {
    showDialog(
      context: context,
      builder:
          (context) => AlertDialog(
            title: Text('Điểm danh buổi ${slot.id}'),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('${widget.studentName} - ${slot.date}'),
                const SizedBox(height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    ElevatedButton(
                      onPressed: () {
                        setState(() {
                          slot.status = AttendanceStatus.absent;
                        });
                        Navigator.pop(context);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red,
                        foregroundColor: Colors.white,
                      ),
                      child: const Text('Vắng'),
                    ),
                    ElevatedButton(
                      onPressed: () {
                        setState(() {
                          slot.status = AttendanceStatus.present;
                        });
                        Navigator.pop(context);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green,
                        foregroundColor: Colors.white,
                      ),
                      child: const Text('Có mặt'),
                    ),
                  ],
                ),
              ],
            ),
          ),
    );
  }
}

class LessonSlot {
  final int id;
  final String title;
  final String dayOfWeek;
  final String date;
  AttendanceStatus status;

  LessonSlot({
    required this.id,
    required this.title,
    required this.dayOfWeek,
    required this.date,
    required this.status,
  });
}

enum AttendanceStatus { present, absent, notYet }
