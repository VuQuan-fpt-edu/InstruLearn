import 'package:flutter/material.dart';
import 'detail/class_detail_screen.dart';

class ClassRegistrationScreen extends StatefulWidget {
  const ClassRegistrationScreen({Key? key}) : super(key: key);

  @override
  State<ClassRegistrationScreen> createState() =>
      _ClassRegistrationScreenState();
}

class _ClassRegistrationScreenState extends State<ClassRegistrationScreen> {
  String selectedInstrument = 'Guitar';

  final List<ClassInfo> classes = [
    ClassInfo(
      name: 'Guitar nâng cao',
      code: 'GUITAR-NC-8.0-10.03.2025-17:00',
      teacher: 'GV: HungLD',
      startDate: '10/03/2025',
      endDate: '10/06/2025',
      timeSlot: 'Slot 5: 17:00 - 19:00',
      currentStudents: 5,
      maxStudents: 20,
      fee: 5000000,
    ),
    ClassInfo(
      name: 'Guitar cơ bản',
      code: 'GUITAR-CB-8.0-10.03.2025-07:00',
      teacher: 'GV: TriPT',
      startDate: '10/03/2025',
      endDate: '10/06/2025',
      timeSlot: 'Slot 1: 07:00 - 09:00',
      currentStudents: 5,
      maxStudents: 20,
      fee: 5000000,
    ),
  ];

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
            // Image Grid
            Container(
              height: 200,
              padding: const EdgeInsets.all(8),
              child: GridView.count(
                crossAxisCount: 3,
                mainAxisSpacing: 8,
                crossAxisSpacing: 8,
                children: List.generate(
                  9,
                  (index) => ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.network(
                      'https://images.unsplash.com/photo-1510915361894-db8b60106cb1',
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
              ),
            ),

            // Instrument Selection
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
                        items:
                            ['Guitar', 'Piano', 'Violin', 'Drums'].map((
                              String value,
                            ) {
                              return DropdownMenuItem<String>(
                                value: value,
                                child: Text(value),
                              );
                            }).toList(),
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

            // Class List
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: classes.length,
                itemBuilder: (context, index) {
                  final classInfo = classes[index];
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
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        InkWell(
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder:
                                    (context) => ClassDetailScreen(
                                      className: classInfo.name,
                                      classCode: classInfo.code,
                                      startDate: classInfo.startDate,
                                      endDate: classInfo.endDate,
                                      timeSlot: classInfo.timeSlot,
                                      teacherName: classInfo.teacher,
                                      teacherSpecialty: 'Nghệ sĩ Guitar',
                                      teacherSchool:
                                          'Giáo viên hướng dẫn - HungLD\nTốt nghiệp Học viện âm nhạc TP.HCM',
                                      currentStudents:
                                          classInfo.currentStudents,
                                      maxStudents: classInfo.maxStudents,
                                    ),
                              ),
                            );
                          },
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  classInfo.name,
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                Text(
                                  classInfo.code,
                                  style: const TextStyle(
                                    fontSize: 14,
                                    color: Colors.grey,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(classInfo.teacher),
                                Text('Ngày bắt đầu: ${classInfo.startDate}'),
                                Text('Ngày kết thúc: ${classInfo.endDate}'),
                                Text(classInfo.timeSlot),
                                Text(
                                  'Số lượng học viên: ${classInfo.currentStudents}/${classInfo.maxStudents}',
                                ),
                                Text(
                                  'Học phí: ${classInfo.fee.toStringAsFixed(0)} đ',
                                ),
                              ],
                            ),
                          ),
                        ),
                        InkWell(
                          onTap: () {
                            // Xử lý khi nhấn nút tham gia
                          },
                          child: Container(
                            width: double.infinity,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            decoration: BoxDecoration(
                              color: Colors.red,
                              borderRadius: const BorderRadius.only(
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

class ClassInfo {
  final String name;
  final String code;
  final String teacher;
  final String startDate;
  final String endDate;
  final String timeSlot;
  final int currentStudents;
  final int maxStudents;
  final double fee;

  ClassInfo({
    required this.name,
    required this.code,
    required this.teacher,
    required this.startDate,
    required this.endDate,
    required this.timeSlot,
    required this.currentStudents,
    required this.maxStudents,
    required this.fee,
  });
}
