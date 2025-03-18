import 'package:flutter/material.dart';
import 'teacher_student_grade_detail_screen.dart';

class TeacherClassGradeDetailScreen extends StatefulWidget {
  final String className;
  final String classCode;

  const TeacherClassGradeDetailScreen({
    Key? key,
    required this.className,
    required this.classCode,
  }) : super(key: key);

  @override
  State<TeacherClassGradeDetailScreen> createState() =>
      _TeacherClassGradeDetailScreenState();
}

class _TeacherClassGradeDetailScreenState
    extends State<TeacherClassGradeDetailScreen> {
  final List<StudentGrade> students = [
    StudentGrade(
      imageUrl: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d',
      firstName: 'Nguyễn',
      lastName: 'Văn',
      nickname: 'A',
    ),
    StudentGrade(
      imageUrl: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d',
      firstName: 'Nguyễn',
      lastName: 'Văn',
      nickname: 'B',
    ),
    StudentGrade(
      imageUrl: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d',
      firstName: 'Nguyễn',
      lastName: 'Văn',
      nickname: 'C',
    ),
    StudentGrade(
      imageUrl: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d',
      firstName: 'Nguyễn',
      lastName: 'Văn',
      nickname: 'D',
    ),
    StudentGrade(
      imageUrl: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d',
      firstName: 'Nguyễn',
      lastName: 'Văn',
      nickname: 'E',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Details'),
        backgroundColor: const Color(0xFF8C9EFF),
      ),
      body: Column(
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.className,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  widget.classCode,
                  style: const TextStyle(fontSize: 14, color: Colors.grey),
                ),
              ],
            ),
          ),
          Expanded(
            child: Container(
              decoration: const BoxDecoration(color: Colors.white),
              child: Table(
                border: TableBorder.all(color: Colors.grey[300]!, width: 1),
                columnWidths: const {
                  0: FlexColumnWidth(1.2),
                  1: FlexColumnWidth(1),
                  2: FlexColumnWidth(1),
                  3: FlexColumnWidth(0.8),
                  4: FlexColumnWidth(1),
                },
                children: [
                  TableRow(
                    decoration: const BoxDecoration(color: Color(0xFF000080)),
                    children: const [
                      TableCell(
                        child: Padding(
                          padding: EdgeInsets.all(8),
                          child: Text(
                            'Ảnh',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                      TableCell(
                        child: Padding(
                          padding: EdgeInsets.all(8),
                          child: Text(
                            'Họ',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                      TableCell(
                        child: Padding(
                          padding: EdgeInsets.all(8),
                          child: Text(
                            'Tên lót',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                      TableCell(
                        child: Padding(
                          padding: EdgeInsets.all(8),
                          child: Text(
                            'Tên',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                      TableCell(
                        child: Padding(
                          padding: EdgeInsets.all(8),
                          child: Text(
                            'Điểm TP',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  ...students.map((student) => _buildStudentRow(student)),
                ],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: const Text(
                  'Save',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  TableRow _buildStudentRow(StudentGrade student) {
    return TableRow(
      decoration: const BoxDecoration(color: Colors.white),
      children: [
        TableCell(
          child: Padding(
            padding: const EdgeInsets.all(8),
            child: CircleAvatar(
              radius: 20,
              backgroundColor: Colors.grey[200],
              backgroundImage: NetworkImage(student.imageUrl),
            ),
          ),
        ),
        TableCell(
          child: Padding(
            padding: const EdgeInsets.all(8),
            child: Text(student.firstName),
          ),
        ),
        TableCell(
          child: Padding(
            padding: const EdgeInsets.all(8),
            child: Text(student.lastName),
          ),
        ),
        TableCell(
          child: Padding(
            padding: const EdgeInsets.all(8),
            child: Text(student.nickname),
          ),
        ),
        TableCell(
          child: Padding(
            padding: const EdgeInsets.all(8),
            child: Center(
              child: IconButton(
                icon: const Icon(Icons.edit, color: Colors.grey),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder:
                          (context) => TeacherStudentGradeDetailScreen(
                            studentName:
                                '${student.firstName} ${student.lastName} ${student.nickname}',
                            isOneOnOne: false,
                          ),
                    ),
                  );
                },
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class StudentGrade {
  final String imageUrl;
  final String firstName;
  final String lastName;
  final String nickname;

  StudentGrade({
    required this.imageUrl,
    required this.firstName,
    required this.lastName,
    required this.nickname,
  });
}
