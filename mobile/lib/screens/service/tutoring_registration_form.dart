import 'package:flutter/material.dart';

class TutoringRegistrationForm extends StatefulWidget {
  const TutoringRegistrationForm({Key? key}) : super(key: key);

  @override
  State<TutoringRegistrationForm> createState() =>
      _TutoringRegistrationFormState();
}

class _TutoringRegistrationFormState extends State<TutoringRegistrationForm> {
  // Các biến để lưu trữ lựa chọn của người dùng
  String? selectedInstrument;
  Set<String> selectedDays = {};
  TimeOfDay? selectedTime;
  int selectedDuration = 45; // Mặc định 45 phút
  Teacher? selectedTeacher;
  bool showTeacherDetail = false;
  int? selectedLessonCount;
  final TextEditingController learningGoalController = TextEditingController();

  // Danh sách các loại nhạc cụ
  final List<String> instruments = ['Piano', 'Violin', 'Guitar'];

  // Danh sách các ngày trong tuần
  final List<String> weekDays = [
    'Thứ 2',
    'Thứ 3',
    'Thứ 4',
    'Thứ 5',
    'Thứ 6',
    'Thứ 7',
    'Chủ nhật',
  ];

  // Danh sách các khung giờ học
  final List<TimeOfDay> timeSlots = List.generate(
    15,
    (index) => TimeOfDay(hour: 7 + index, minute: 0),
  );

  // Danh sách thời lượng học (phút)
  final List<int> durations = List.generate(6, (index) => 45 + (index * 15));

  // Danh sách số buổi học
  final List<int> lessonCounts = List.generate(16, (index) => index + 5);

  // Danh sách giáo viên mẫu
  final List<Teacher> teachers = [
    Teacher(
      id: 1,
      name: 'Trần Ngọc Như Quỳnh',
      specialization: 'Chuyên viên âm nhạc',
      instruments: ['Piano', 'Violin', 'Guitar'],
      description:
          'Cô là một giáo viên âm nhạc tận tâm, tốt nghiệp Học viện Âm nhạc TP.HCM. Với nền tảng chuyên môn vững chắc và kinh nghiệm giảng dạy phong phú, cô luôn truyền cảm hứng cho học viên bằng phương pháp giảng dạy sáng tạo, dễ hiểu và phù hợp với từng cá nhân.',
      avatarUrl: 'assets/images/teacher1.jpg',
    ),
    // Thêm các giáo viên khác ở đây
  ];

  @override
  void initState() {
    super.initState();
    selectedLessonCount = lessonCounts.first;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Đăng ký học kèm'),
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
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildSectionTitle('Chọn nhạc cụ'),
              _buildInstrumentSelector(),
              const SizedBox(height: 24),

              _buildSectionTitle('Chọn ngày học'),
              _buildDaySelector(),
              const SizedBox(height: 24),

              _buildSectionTitle('Chọn giờ học'),
              _buildTimeSelector(),
              const SizedBox(height: 24),

              _buildSectionTitle('Thời lượng mỗi buổi'),
              _buildDurationSelector(),
              const SizedBox(height: 24),

              _buildSectionTitle('Chọn giáo viên'),
              _buildTeacherSelector(),
              const SizedBox(height: 24),

              _buildSectionTitle('Số buổi học'),
              _buildLessonCountSelector(),
              const SizedBox(height: 24),

              _buildSectionTitle('Mục tiêu học tập'),
              _buildLearningGoalInput(),
              const SizedBox(height: 32),

              _buildRegisterButton(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.bold,
          color: Colors.black87,
        ),
      ),
    );
  }

  Widget _buildInstrumentSelector() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey[300]!),
        borderRadius: BorderRadius.circular(8),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          isExpanded: true,
          value: selectedInstrument,
          hint: const Text('Chọn nhạc cụ'),
          items:
              instruments.map((String instrument) {
                return DropdownMenuItem<String>(
                  value: instrument,
                  child: Text(instrument),
                );
              }).toList(),
          onChanged: (String? value) {
            setState(() {
              selectedInstrument = value;
            });
          },
        ),
      ),
    );
  }

  Widget _buildDaySelector() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey[300]!),
        borderRadius: BorderRadius.circular(8),
      ),
      child: MenuAnchor(
        builder: (context, controller, child) {
          return InkWell(
            onTap: () {
              if (controller.isOpen) {
                controller.close();
              } else {
                controller.open();
              }
            },
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    selectedDays.isEmpty
                        ? 'Chọn ngày học'
                        : 'Đã chọn ${selectedDays.length} ngày',
                    style: TextStyle(
                      color:
                          selectedDays.isEmpty ? Colors.black54 : Colors.black,
                    ),
                  ),
                  const Icon(Icons.arrow_drop_down, color: Colors.black54),
                ],
              ),
            ),
          );
        },
        menuChildren:
            weekDays.map((String day) {
              return MenuItemButton(
                onPressed: () {
                  setState(() {
                    if (selectedDays.contains(day)) {
                      selectedDays.remove(day);
                    } else {
                      selectedDays.add(day);
                    }
                  });
                },
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.start,
                  children: [
                    Checkbox(
                      value: selectedDays.contains(day),
                      onChanged: (bool? value) {
                        setState(() {
                          if (value == true) {
                            selectedDays.add(day);
                          } else {
                            selectedDays.remove(day);
                          }
                        });
                      },
                    ),
                    const SizedBox(width: 8),
                    Text(day),
                  ],
                ),
              );
            }).toList(),
      ),
    );
  }

  Widget _buildTimeSelector() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey[300]!),
        borderRadius: BorderRadius.circular(8),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<TimeOfDay>(
          isExpanded: true,
          value: selectedTime,
          hint: const Text('Chọn giờ học'),
          items:
              timeSlots.map((TimeOfDay time) {
                return DropdownMenuItem<TimeOfDay>(
                  value: time,
                  child: Text(
                    '${time.hour}:${time.minute.toString().padLeft(2, '0')}',
                  ),
                );
              }).toList(),
          onChanged: (TimeOfDay? value) {
            setState(() {
              selectedTime = value;
            });
          },
        ),
      ),
    );
  }

  Widget _buildDurationSelector() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey[300]!),
        borderRadius: BorderRadius.circular(8),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<int>(
          isExpanded: true,
          value: selectedDuration,
          items:
              durations.map((int duration) {
                return DropdownMenuItem<int>(
                  value: duration,
                  child: Text('$duration phút'),
                );
              }).toList(),
          onChanged: (int? value) {
            setState(() {
              selectedDuration = value ?? 45;
            });
          },
        ),
      ),
    );
  }

  Widget _buildTeacherSelector() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey[300]!),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        children: [
          DropdownButtonHideUnderline(
            child: DropdownButton<Teacher>(
              isExpanded: true,
              value: selectedTeacher,
              hint: const Text('Chọn giáo viên'),
              items:
                  teachers.map((Teacher teacher) {
                    return DropdownMenuItem<Teacher>(
                      value: teacher,
                      child: Row(
                        children: [
                          CircleAvatar(
                            backgroundColor: Colors.grey[200],
                            radius: 15,
                            child: const Icon(Icons.person, size: 20),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  teacher.name,
                                  style: const TextStyle(fontSize: 14),
                                ),
                                Text(
                                  teacher.specialization,
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey[600],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
              onChanged: (Teacher? value) {
                setState(() {
                  selectedTeacher = value;
                  showTeacherDetail = false;
                });
              },
            ),
          ),
          if (selectedTeacher != null) ...[
            const SizedBox(height: 8),
            _buildViewTeacherDetailButton(),
            if (showTeacherDetail) _buildTeacherDetail(),
          ],
        ],
      ),
    );
  }

  Widget _buildViewTeacherDetailButton() {
    return Padding(
      padding: const EdgeInsets.only(top: 8),
      child: TextButton.icon(
        onPressed: () {
          setState(() {
            showTeacherDetail = !showTeacherDetail;
          });
        },
        icon: Icon(
          showTeacherDetail
              ? Icons.keyboard_arrow_up
              : Icons.keyboard_arrow_down,
          color: const Color(0xFF8C9EFF),
        ),
        label: Text(
          showTeacherDetail
              ? 'Ẩn thông tin chi tiết'
              : 'Xem thông tin chi tiết',
          style: const TextStyle(color: Color(0xFF8C9EFF)),
        ),
      ),
    );
  }

  Widget _buildTeacherDetail() {
    return Container(
      margin: const EdgeInsets.only(top: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 30,
                backgroundColor: Colors.grey[300],
                child: const Icon(Icons.person, size: 40),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      selectedTeacher!.name,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    Text(selectedTeacher!.specialization),
                    Text(
                      'Có thể dạy loại nhạc cụ: ${selectedTeacher!.instruments.join(", ")}',
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            'Thông tin giới thiệu:',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: Colors.grey[700],
            ),
          ),
          const SizedBox(height: 8),
          Text(selectedTeacher!.description),
        ],
      ),
    );
  }

  Widget _buildLessonCountSelector() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey[300]!),
        borderRadius: BorderRadius.circular(8),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<int>(
          isExpanded: true,
          value: selectedLessonCount,
          hint: const Text('Chọn số buổi học'),
          items:
              lessonCounts.map((int count) {
                return DropdownMenuItem<int>(
                  value: count,
                  child: Text('$count buổi'),
                );
              }).toList(),
          onChanged: (int? value) {
            setState(() {
              selectedLessonCount = value;
            });
          },
        ),
      ),
    );
  }

  Widget _buildLearningGoalInput() {
    return TextField(
      controller: learningGoalController,
      maxLines: 3,
      decoration: InputDecoration(
        hintText: 'Nhập mục tiêu học tập của bạn...',
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(color: Colors.grey[300]!),
        ),
      ),
    );
  }

  Widget _buildRegisterButton() {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF8C9EFF),
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
        onPressed: _validateAndSubmit,
        child: const Text('Đăng ký học', style: TextStyle(fontSize: 16)),
      ),
    );
  }

  void _validateAndSubmit() {
    // Kiểm tra các điều kiện
    if (selectedInstrument == null) {
      _showError('Vui lòng chọn nhạc cụ');
      return;
    }

    if (selectedDays.isEmpty) {
      _showError('Vui lòng chọn ít nhất một ngày học');
      return;
    }

    if (selectedTime == null) {
      _showError('Vui lòng chọn giờ học');
      return;
    }

    if (selectedTeacher == null) {
      _showError('Vui lòng chọn giáo viên');
      return;
    }

    if (selectedLessonCount == null) {
      _showError('Vui lòng chọn số buổi học');
      return;
    }

    if (learningGoalController.text.isEmpty) {
      _showError('Vui lòng nhập mục tiêu học tập');
      return;
    }

    // Nếu tất cả điều kiện đều thỏa mãn, tiến hành đăng ký
    // TODO: Implement registration logic
    _showSuccess('Đăng ký thành công!');
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.red),
    );
  }

  void _showSuccess(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.green),
    );
  }
}

class Teacher {
  final int id;
  final String name;
  final String specialization;
  final List<String> instruments;
  final String description;
  final String avatarUrl;

  Teacher({
    required this.id,
    required this.name,
    required this.specialization,
    required this.instruments,
    required this.description,
    required this.avatarUrl,
  });
}
