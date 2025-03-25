import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:image_picker/image_picker.dart';
import 'package:video_player/video_player.dart';
import 'dart:io';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:path/path.dart' as path;
import '../../models/teacher.dart';
import '../../services/teacher_service.dart';
import '../../services/major_service.dart';

class LearningRegisType {
  final int regisTypeId;
  final String regisTypeName;

  LearningRegisType({required this.regisTypeId, required this.regisTypeName});

  factory LearningRegisType.fromJson(Map<String, dynamic> json) {
    return LearningRegisType(
      regisTypeId: json['regisTypeId'],
      regisTypeName: json['regisTypeName'],
    );
  }
}

class MajorTest {
  final int majorTestId;
  final int majorId;
  final String majorTestName;

  MajorTest({
    required this.majorTestId,
    required this.majorId,
    required this.majorTestName,
  });

  factory MajorTest.fromJson(Map<String, dynamic> json) {
    return MajorTest(
      majorTestId: json['majorTestId'],
      majorId: json['majorId'],
      majorTestName: json['majorTestName'],
    );
  }
}

class TutoringRegistrationForm extends StatefulWidget {
  const TutoringRegistrationForm({Key? key}) : super(key: key);

  @override
  State<TutoringRegistrationForm> createState() =>
      _TutoringRegistrationFormState();
}

class _TutoringRegistrationFormState extends State<TutoringRegistrationForm> {
  final _teacherService = TeacherService();
  final _majorService = MajorService();

  int learnerId = 0;
  int? selectedTeacherId;
  int regisTypeId = 1;
  int? selectedMajorId;
  String? videoUrl;
  DateTime? selectedTimeStart;
  DateTime? startDay;
  int timeLearning = 60;
  int numberOfSession = 5;
  Set<int> selectedLearningDays = {};
  final TextEditingController learningGoalController = TextEditingController();

  List<Teacher> teachers = [];
  List<Major> majors = [];
  bool isLoading = true;
  String? errorMessage;
  String? selectedExperience;
  MajorTest? majorTest;
  bool isLoadingMajorTest = false;
  VideoPlayerController? _videoController;

  final List<String> experiences = [
    "Tôi chưa chơi nhạc cụ này bao giờ",
    "Tôi đã chơi nhạc cụ này được 1-3 tháng",
    "Tôi đã chơi nhạc cụ này được 3-9 tháng",
    "Tôi đã chơi nhạc cụ này được hơn 1 năm rồi"
  ];

  @override
  void initState() {
    super.initState();
    _fetchUserProfile();
    _fetchMajors();
    _fetchTeachers();
  }

  @override
  void dispose() {
    _videoController?.dispose();
    super.dispose();
  }

  Future<void> _fetchUserProfile() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token == null) {
        setState(() {
          errorMessage = 'Vui lòng đăng nhập lại';
          isLoading = false;
        });
        return;
      }

      final response = await http.get(
        Uri.parse(
          'https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Auth/Profile',
        ),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['isSucceed'] == true) {
          setState(() {
            learnerId = data['data']['learnerId'];
            isLoading = false;
          });
        } else {
          setState(() {
            errorMessage =
                data['message'] ?? 'Không thể tải thông tin người dùng';
            isLoading = false;
          });
        }
      } else {
        setState(() {
          errorMessage = 'Lỗi kết nối: ${response.statusCode}';
          isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        errorMessage = 'Lỗi: ${e.toString()}';
        isLoading = false;
      });
    }
  }

  Future<void> _fetchMajors() async {
    try {
      final fetchedMajors = await _majorService.getAllMajors();
      setState(() {
        majors = fetchedMajors;
      });
    } catch (e) {
      print('Lỗi tải danh sách chuyên ngành: $e');
    }
  }

  Future<void> _fetchTeachers() async {
    try {
      final fetchedTeachers = await _teacherService.getAllTeachers();
      setState(() {
        teachers = fetchedTeachers;
      });
    } catch (e) {
      print('Lỗi tải danh sách giáo viên: $e');
    }
  }

  Future<void> _fetchMajorTest() async {
    if (selectedMajorId == null) return;

    setState(() {
      isLoadingMajorTest = true;
    });

    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token == null) return;

      print('Fetching major test for majorId: $selectedMajorId');

      final response = await http.get(
        Uri.parse(
          'https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/MajorTest/by-major/$selectedMajorId',
        ),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer $token',
        },
      );

      print('Response status: ${response.statusCode}');
      print('Response body: ${response.body}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['isSucceed'] == true &&
            data['data'] != null &&
            data['data'].isNotEmpty) {
          setState(() {
            majorTest = MajorTest.fromJson(data['data'][0]);
            isLoadingMajorTest = false;
          });
        } else {
          setState(() {
            majorTest = null;
            isLoadingMajorTest = false;
          });
        }
      } else {
        print('Error fetching major test: ${response.statusCode}');
        setState(() {
          isLoadingMajorTest = false;
        });
      }
    } catch (e) {
      print('Lỗi tải thông tin bài test: $e');
      setState(() {
        isLoadingMajorTest = false;
      });
    }
  }

  @override
  void didUpdateWidget(TutoringRegistrationForm oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (selectedMajorId != null && selectedExperience != null) {
      if (selectedExperience != "Tôi chưa chơi nhạc cụ này bao giờ") {
        _fetchMajorTest();
      } else {
        setState(() {
          majorTest = null;
        });
      }
    }
  }

  Future<void> _pickVideo() async {
    try {
      final ImagePicker picker = ImagePicker();
      final XFile? video = await picker.pickVideo(source: ImageSource.gallery);

      if (video != null) {
        await _videoController?.dispose();

        _videoController = VideoPlayerController.file(File(video.path));
        await _videoController!.initialize();

        setState(() {
          videoUrl = video.path;
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Lỗi khi chọn video: $e')),
      );
    }
  }

  void _showVideoPreview() {
    if (_videoController == null) return;

    showDialog(
      context: context,
      builder: (BuildContext context) {
        return Dialog(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              AspectRatio(
                aspectRatio: _videoController!.value.aspectRatio,
                child: VideoPlayer(_videoController!),
              ),
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    IconButton(
                      icon: Icon(
                        _videoController!.value.isPlaying
                            ? Icons.pause
                            : Icons.play_arrow,
                      ),
                      onPressed: () {
                        setState(() {
                          _videoController!.value.isPlaying
                              ? _videoController!.pause()
                              : _videoController!.play();
                        });
                      },
                    ),
                    IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () {
                        Navigator.of(context).pop();
                      },
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _selectDateTime() async {
    final List<int> availableHours = List.generate(15, (index) => index + 7);

    final int? selectedHour = await showDialog<int>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Chọn giờ bắt đầu'),
          content: SizedBox(
            width: double.maxFinite,
            child: ListView.builder(
              shrinkWrap: true,
              itemCount: availableHours.length,
              itemBuilder: (BuildContext context, int index) {
                return ListTile(
                  title: Text('${availableHours[index]}:00'),
                  onTap: () {
                    Navigator.of(context).pop(availableHours[index]);
                  },
                );
              },
            ),
          ),
        );
      },
    );

    if (selectedHour != null) {
      setState(() {
        selectedTimeStart = DateTime(
          DateTime.now().year,
          DateTime.now().month,
          DateTime.now().day,
          selectedHour,
          0,
        );
      });
    }
  }

  Future<void> _submitForm() async {
    if (learnerId == 0) {
      _showError('Vui lòng đăng nhập lại');
      return;
    }

    if (selectedTeacherId == null) {
      _showError('Vui lòng chọn giáo viên');
      return;
    }

    if (selectedMajorId == null) {
      _showError('Vui lòng chọn chuyên ngành');
      return;
    }

    if (selectedTimeStart == null) {
      _showError('Vui lòng chọn thời gian bắt đầu');
      return;
    }

    if (selectedLearningDays.isEmpty) {
      _showError('Vui lòng chọn ít nhất một ngày học');
      return;
    }

    bool? confirmed = await showDialog<bool>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Xác nhận đăng ký'),
          content: const Text(
            'Bạn sẽ tốn 50.000đ phí làm đơn yêu cầu học theo yêu cầu.\nBạn có chắc chắn muốn tiếp tục?',
            style: TextStyle(fontSize: 16),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: const Text('Hủy'),
            ),
            TextButton(
              onPressed: () => Navigator.of(context).pop(true),
              child: const Text(
                'Xác nhận',
                style: TextStyle(color: Color(0xFF8C9EFF)),
              ),
            ),
          ],
        );
      },
    );

    if (confirmed != true) return;

    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token == null) {
        _showError('Vui lòng đăng nhập lại');
        return;
      }

      String uploadedVideoUrl = '';

      if (videoUrl != null) {
        try {
          final videoFile = File(videoUrl!);
          final fileName = path.basename(videoFile.path);
          final storageRef = FirebaseStorage.instance.ref().child('videos').child(
              '$learnerId-${DateTime.now().millisecondsSinceEpoch}-$fileName');

          showDialog(
            context: context,
            barrierDismissible: false,
            builder: (BuildContext context) {
              return const Center(
                child: CircularProgressIndicator(),
              );
            },
          );

          final uploadTask = storageRef.putFile(videoFile);
          await uploadTask.whenComplete(() => null);

          uploadedVideoUrl = await storageRef.getDownloadURL();

          Navigator.pop(context);
        } catch (e) {
          Navigator.pop(context);
          _showError('Lỗi khi upload video: $e');
          return;
        }
      }

      final String formattedTime =
          '${selectedTimeStart!.hour.toString().padLeft(2, '0')}:00:00';

      final response = await http.post(
        Uri.parse(
          'https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/LearningRegis/create',
        ),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer $token',
        },
        body: json.encode({
          'learnerId': learnerId,
          'teacherId': selectedTeacherId,
          'regisTypeId': regisTypeId,
          'majorId': selectedMajorId,
          'videoUrl': uploadedVideoUrl,
          'timeStart': formattedTime,
          'requestDate': DateTime.now().toIso8601String(),
          'numberOfSession': numberOfSession,
          'learningDays': selectedLearningDays.toList(),
          'startDay': startDay?.toIso8601String().split('T')[0] ??
              DateTime.now()
                  .add(const Duration(days: 7))
                  .toIso8601String()
                  .split('T')[0],
          'timeLearning': timeLearning,
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['isSucceed'] == true) {
          _showSuccess('Đăng ký thành công!');
          Navigator.pop(context);
        } else {
          _showError(data['message'] ?? 'Đăng ký thất bại');
        }
      } else {
        _showError('Lỗi kết nối: ${response.statusCode}');
      }
    } catch (e) {
      _showError('Lỗi: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (errorMessage != null) {
      return Scaffold(body: Center(child: Text(errorMessage!)));
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Đăng ký học theo yêu cầu'),
        backgroundColor: const Color(0xFF8C9EFF),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSectionTitle('Chọn giáo viên'),
            _buildTeacherSelector(),
            const SizedBox(height: 24),
            _buildSectionTitle('Chọn chuyên ngành'),
            _buildMajorSelector(),
            const SizedBox(height: 24),
            _buildSectionTitle('Kinh nghiệm của bạn'),
            _buildExperienceSelector(),
            const SizedBox(height: 24),
            if (selectedExperience != null &&
                selectedExperience != "Tôi chưa chơi nhạc cụ này bao giờ") ...[
              _buildSectionTitle('Tải video đánh giá trình độ'),
              _buildVideoUploadSection(),
              const SizedBox(height: 24),
            ],
            _buildSectionTitle('Chọn thời gian bắt đầu'),
            _buildDateTimeSelector(),
            const SizedBox(height: 24),
            _buildSectionTitle('Chọn ngày học'),
            _buildLearningDaysSelector(),
            const SizedBox(height: 24),
            _buildSectionTitle('Chọn ngày bắt đầu học'),
            _buildStartDaySelector(),
            const SizedBox(height: 24),
            _buildSectionTitle('Thời gian học mỗi buổi'),
            _buildTimeLearningSelector(),
            const SizedBox(height: 24),
            _buildSectionTitle('Số buổi học'),
            _buildSessionCountSelector(),
            const SizedBox(height: 24),
            _buildSectionTitle('Mục tiêu học tập'),
            _buildLearningGoalInput(),
            const SizedBox(height: 32),
            _buildSubmitButton(),
          ],
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

  Widget _buildTeacherSelector() {
    final filteredTeachers = selectedMajorId != null
        ? teachers
            .where((teacher) =>
                teacher.majors.any((major) => major.majorId == selectedMajorId))
            .toList()
        : [];

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey[300]!),
        borderRadius: BorderRadius.circular(8),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<int>(
          isExpanded: true,
          value: selectedTeacherId,
          hint: Text(selectedMajorId == null
              ? 'Vui lòng chọn chuyên ngành trước'
              : filteredTeachers.isEmpty
                  ? 'Không có giáo viên cho chuyên ngành này'
                  : 'Chọn giáo viên'),
          items: filteredTeachers
              .map((teacher) => DropdownMenuItem<int>(
                    value: teacher.teacherId,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          teacher.fullname,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        if (teacher.heading != null)
                          Text(
                            teacher.heading!,
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[600],
                            ),
                          ),
                      ],
                    ),
                  ))
              .toList(),
          onChanged: selectedMajorId == null || filteredTeachers.isEmpty
              ? null
              : (int? value) {
                  setState(() {
                    selectedTeacherId = value;
                  });
                },
        ),
      ),
    );
  }

  Widget _buildMajorSelector() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey[300]!),
        borderRadius: BorderRadius.circular(8),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<int>(
          isExpanded: true,
          value: selectedMajorId,
          hint: const Text('Chọn chuyên ngành'),
          items: majors.map((Major major) {
            return DropdownMenuItem<int>(
              value: major.majorId,
              child: Text(major.majorName),
            );
          }).toList(),
          onChanged: (int? value) {
            setState(() {
              selectedMajorId = value;
              majorTest = null;
            });
            if (selectedExperience != null &&
                selectedExperience != "Tôi chưa chơi nhạc cụ này bao giờ") {
              _fetchMajorTest();
            }
          },
        ),
      ),
    );
  }

  Widget _buildExperienceSelector() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey[300]!),
        borderRadius: BorderRadius.circular(8),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          isExpanded: true,
          value: selectedExperience,
          hint: const Text('Chọn kinh nghiệm của bạn'),
          items: experiences.map((String experience) {
            return DropdownMenuItem<String>(
              value: experience,
              child: Text(experience),
            );
          }).toList(),
          onChanged: (String? value) {
            setState(() {
              selectedExperience = value;
              majorTest = null;
            });
            if (selectedMajorId != null &&
                value != "Tôi chưa chơi nhạc cụ này bao giờ") {
              _fetchMajorTest();
            }
          },
        ),
      ),
    );
  }

  Widget _buildVideoUploadSection() {
    if (selectedExperience == null) {
      return const SizedBox.shrink();
    }

    if (selectedExperience == "Tôi chưa chơi nhạc cụ này bao giờ") {
      return const SizedBox.shrink();
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.blue[50],
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.blue[100]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (isLoadingMajorTest)
            const Center(child: CircularProgressIndicator())
          else if (majorTest != null) ...[
            const Text(
              'Đề bài:',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Colors.black87,
              ),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.blue[200]!),
              ),
              child: Text(
                majorTest!.majorTestName,
                style: const TextStyle(
                  fontSize: 14,
                  color: Colors.black87,
                ),
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Vui lòng quay video theo yêu cầu trên và tải lên:',
              style: TextStyle(
                fontSize: 14,
                color: Colors.black87,
              ),
            ),
          ],
          const SizedBox(height: 16),
          if (videoUrl != null) ...[
            Container(
              height: 200,
              decoration: BoxDecoration(
                color: Colors.black,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.green[300]!),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: VideoPlayer(_videoController!),
              ),
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                IconButton(
                  icon: Icon(
                    _videoController!.value.isPlaying
                        ? Icons.pause
                        : Icons.play_arrow,
                    color: Colors.white,
                  ),
                  onPressed: () {
                    setState(() {
                      _videoController!.value.isPlaying
                          ? _videoController!.pause()
                          : _videoController!.play();
                    });
                  },
                ),
              ],
            ),
            const SizedBox(height: 8),
          ],
          InkWell(
            onTap: _pickVideo,
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFF8C9EFF)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    videoUrl != null ? Icons.check_circle : Icons.upload_file,
                    color: const Color(0xFF8C9EFF),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    videoUrl != null ? 'Tải video khác' : 'Tải video lên',
                    style: const TextStyle(
                      color: Color(0xFF8C9EFF),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDateTimeSelector() {
    return InkWell(
      onTap: _selectDateTime,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey[300]!),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              selectedTimeStart != null
                  ? '${selectedTimeStart!.hour}:00'
                  : 'Chọn giờ bắt đầu (7:00 - 21:00)',
              style: TextStyle(
                color:
                    selectedTimeStart != null ? Colors.black : Colors.grey[600],
              ),
            ),
            const Icon(Icons.access_time, color: Colors.grey),
          ],
        ),
      ),
    );
  }

  Widget _buildLearningDaysSelector() {
    final List<String> days = [
      'Chủ nhật',
      'Thứ 2',
      'Thứ 3',
      'Thứ 4',
      'Thứ 5',
      'Thứ 6',
      'Thứ 7',
    ];

    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: List.generate(7, (index) {
        return FilterChip(
          label: Text(days[index]),
          selected: selectedLearningDays.contains(index),
          onSelected: (bool selected) {
            setState(() {
              if (selected) {
                selectedLearningDays.add(index);
              } else {
                selectedLearningDays.remove(index);
              }
            });
          },
        );
      }),
    );
  }

  Widget _buildStartDaySelector() {
    final DateTime minDate = DateTime.now().add(const Duration(days: 7));
    final DateTime maxDate = DateTime(
      DateTime.now().year,
      DateTime.now().month + 2,
      0,
    );
    List<DateTime> availableDays = [];
    DateTime currentDate = minDate;

    while (!currentDate.isAfter(maxDate)) {
      if (selectedLearningDays.contains(currentDate.weekday % 7)) {
        availableDays.add(currentDate);
      }
      currentDate = currentDate.add(const Duration(days: 1));
    }

    return InkWell(
      onTap: selectedLearningDays.isEmpty
          ? null
          : () async {
              final DateTime? selectedDate = await showDialog<DateTime>(
                context: context,
                builder: (BuildContext context) {
                  return AlertDialog(
                    title: const Text('Chọn ngày bắt đầu học'),
                    content: SizedBox(
                      width: double.maxFinite,
                      child: ListView.builder(
                        shrinkWrap: true,
                        itemCount: availableDays.length,
                        itemBuilder: (BuildContext context, int index) {
                          final date = availableDays[index];
                          final String dayName = [
                            'Chủ nhật',
                            'Thứ 2',
                            'Thứ 3',
                            'Thứ 4',
                            'Thứ 5',
                            'Thứ 6',
                            'Thứ 7',
                          ][date.weekday % 7];

                          return ListTile(
                            title: Text(
                                '$dayName ${date.day}/${date.month}/${date.year}'),
                            onTap: () {
                              Navigator.of(context).pop(date);
                            },
                          );
                        },
                      ),
                    ),
                  );
                },
              );

              if (selectedDate != null) {
                setState(() {
                  startDay = selectedDate;
                });
              }
            },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey[300]!),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              selectedLearningDays.isEmpty
                  ? 'Vui lòng chọn ngày học trước'
                  : startDay != null
                      ? '${[
                          'Chủ nhật',
                          'Thứ 2',
                          'Thứ 3',
                          'Thứ 4',
                          'Thứ 5',
                          'Thứ 6',
                          'Thứ 7',
                        ][startDay!.weekday % 7]} ${startDay!.day}/${startDay!.month}/${startDay!.year}'
                      : 'Chọn ngày bắt đầu học (sau ${minDate.day}/${minDate.month}/${minDate.year})',
              style: TextStyle(
                color: selectedLearningDays.isEmpty || startDay == null
                    ? Colors.grey[600]
                    : Colors.black,
              ),
            ),
            const Icon(Icons.calendar_today, color: Colors.grey),
          ],
        ),
      ),
    );
  }

  Widget _buildTimeLearningSelector() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey[300]!),
        borderRadius: BorderRadius.circular(8),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<int>(
          isExpanded: true,
          value: timeLearning,
          hint: const Text('Chọn thời gian học mỗi buổi'),
          items: [45, 60, 90, 120].map((int minutes) {
            return DropdownMenuItem<int>(
              value: minutes,
              child: Text('$minutes phút'),
            );
          }).toList(),
          onChanged: (int? value) {
            setState(() {
              timeLearning = value ?? 60;
            });
          },
        ),
      ),
    );
  }

  Widget _buildSessionCountSelector() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey[300]!),
        borderRadius: BorderRadius.circular(8),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<int>(
          isExpanded: true,
          value: numberOfSession,
          items: List.generate(16, (index) => index + 5).map((int count) {
            return DropdownMenuItem<int>(
              value: count,
              child: Text('$count buổi'),
            );
          }).toList(),
          onChanged: (int? value) {
            setState(() {
              numberOfSession = value ?? 5;
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

  Widget _buildSubmitButton() {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF8C9EFF),
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
        onPressed: _submitForm,
        child: const Text('Đăng ký học', style: TextStyle(fontSize: 16)),
      ),
    );
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
