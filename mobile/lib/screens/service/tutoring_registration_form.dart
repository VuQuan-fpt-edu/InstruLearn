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
import '../../services/schedule_service.dart';

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
  final _scheduleService = ScheduleService();

  int learnerId = 0;
  int? selectedTeacherId;
  int regisTypeId = 1;
  int? selectedMajorId;
  String? videoUrl;
  DateTime? selectedTimeStart;
  DateTime? startDay;
  int timeLearning = 60;
  int numberOfSession = 1;
  int numberOfWeeks = 1;
  Set<int> selectedLearningDays = {};
  final TextEditingController learningGoalController = TextEditingController();

  List<Teacher> teachers = [];
  List<Teacher> availableTeachers = [];
  List<Major> majors = [];
  bool isLoading = true;
  bool isLoadingAvailableTeachers = false;
  String? errorMessage;
  String? selectedExperience;
  MajorTest? majorTest;
  bool isLoadingMajorTest = false;
  VideoPlayerController? _videoController;

  final List<String> experiences = [
    "Tôi chưa chơi nhạc cụ này bao giờ",
    "Tôi đã chơi nhạc cụ này được 1-3 tháng",
    "Tôi đã chơi nhạc cụ này được 3-6 tháng",
    "Tôi đã chơi nhạc cụ này được 6-9 tháng",
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
          'https://instrulearnapplication.azurewebsites.net/api/Auth/Profile',
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
          'https://instrulearnapplication.azurewebsites.net/api/MajorTest/by-major/$selectedMajorId',
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
    if (selectedLearningDays.isEmpty) {
      _showError('Vui lòng chọn ngày học trước');
      return;
    }

    final List<String> availableTimes = [];
    for (int hour = 7; hour <= 21; hour++) {
      availableTimes.add('${hour.toString().padLeft(2, '0')}:00');
      if (hour < 21) {
        availableTimes.add('${hour.toString().padLeft(2, '0')}:30');
      }
    }

    final String? selectedTime = await showDialog<String>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Chọn giờ bắt đầu'),
          content: SizedBox(
            width: double.maxFinite,
            child: ListView.builder(
              shrinkWrap: true,
              itemCount: availableTimes.length,
              itemBuilder: (BuildContext context, int index) {
                final time = availableTimes[index];
                final timeParts = time.split(':');
                final startMinutes =
                    int.parse(timeParts[0]) * 60 + int.parse(timeParts[1]);
                final endMinutes = startMinutes + timeLearning;

                return Container(
                  decoration: BoxDecoration(
                    border: Border(
                      bottom: BorderSide(color: Colors.grey[300]!, width: 0.5),
                    ),
                  ),
                  child: ListTile(
                    title: Text(time),
                    subtitle: Text(
                      'Kết thúc: ${(endMinutes ~/ 60).toString().padLeft(2, '0')}:${(endMinutes % 60).toString().padLeft(2, '0')}',
                      style: const TextStyle(color: Colors.grey, fontSize: 12),
                    ),
                    onTap: () {
                      Navigator.of(context).pop(time);
                    },
                  ),
                );
              },
            ),
          ),
        );
      },
    );

    if (selectedTime != null) {
      final timeParts = selectedTime.split(':');
      setState(() {
        selectedTimeStart = DateTime(
          DateTime.now().year,
          DateTime.now().month,
          DateTime.now().day,
          int.parse(timeParts[0]),
          int.parse(timeParts[1]),
        );
        // Reset danh sách giáo viên khả dụng và giáo viên đã chọn
        availableTeachers = [];
        selectedTeacherId = null;
      });
      // Kiểm tra và cập nhật giáo viên khả dụng nếu đã có đủ thông tin
      _checkAndFetchAvailableTeachers();
    }
  }

  Future<void> _selectStartDay() async {
    if (selectedLearningDays.isEmpty) {
      _showError('Vui lòng chọn ngày học trước');
      return;
    }

    // Tính toán thời gian hợp lệ
    final DateTime now = DateTime.now();

    // Tính ngày đầu tiên của tuần tiếp theo (Thứ 2 của tuần sau)
    final DateTime startOfNextWeek =
        now.add(Duration(days: (7 - now.weekday) + 1));

    // Tính ngày cuối cùng của tháng kế tiếp
    final int nextMonth = now.month < 12 ? now.month + 1 : 1;
    final int yearOfNextMonth = now.month < 12 ? now.year : now.year + 1;
    final DateTime lastDayOfNextMonth =
        DateTime(yearOfNextMonth, nextMonth + 1, 0);

    // Tạo danh sách ngày hợp lệ (chỉ những ngày thỏa mãn điều kiện ngày học và nằm trong khoảng thời gian)
    List<DateTime> availableDays = [];
    DateTime currentDate = startOfNextWeek;

    while (!currentDate.isAfter(lastDayOfNextMonth)) {
      if (selectedLearningDays.contains(currentDate.weekday % 7)) {
        availableDays.add(currentDate);
      }
      currentDate = currentDate.add(const Duration(days: 1));
    }

    // Hiển thị thông báo nếu không có ngày nào phù hợp
    if (availableDays.isEmpty) {
      _showError(
          'Không có ngày học nào phù hợp trong khoảng thời gian cho phép');
      return;
    }

    // Hiển thị dialog chọn ngày
    final DateTime? selectedDate = await showDialog<DateTime>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Chọn ngày bắt đầu học'),
          content: Container(
            width: double.maxFinite,
            height: 300,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Chọn ngày bắt đầu trong khoảng từ ${_formatDate(startOfNextWeek)} đến ${_formatDate(lastDayOfNextMonth)}',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                    fontStyle: FontStyle.italic,
                  ),
                ),
                const SizedBox(height: 12),
                Expanded(
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
                        title: Text('$dayName ${_formatDate(date)}'),
                        onTap: () {
                          Navigator.of(context).pop(date);
                        },
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );

    if (selectedDate != null) {
      setState(() {
        startDay = selectedDate;
        // Reset danh sách giáo viên khả dụng và giáo viên đã chọn
        availableTeachers = [];
        selectedTeacherId = null;
      });
      // Kiểm tra và cập nhật giáo viên khả dụng nếu đã có đủ thông tin
      _checkAndFetchAvailableTeachers();
    }
  }

  // Hàm hỗ trợ định dạng ngày
  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }

  Future<void> _submitForm() async {
    if (learnerId == 0) {
      _showError('Vui lòng đăng nhập lại');
      return;
    }

    if (selectedMajorId == null) {
      _showError('Vui lòng chọn chuyên ngành');
      return;
    }

    if (selectedLearningDays.isEmpty) {
      _showError('Vui lòng chọn ít nhất một ngày học');
      return;
    }

    if (selectedTimeStart == null) {
      _showError('Vui lòng chọn thời gian bắt đầu');
      return;
    }

    if (startDay == null) {
      _showError('Vui lòng chọn ngày bắt đầu học');
      return;
    }

    if (selectedTeacherId == null) {
      _showError('Vui lòng chọn giáo viên');
      return;
    }

    if (selectedExperience == null) {
      _showError('Vui lòng chọn kinh nghiệm của bạn');
      return;
    }

    if (selectedExperience != "Tôi chưa chơi nhạc cụ này bao giờ" &&
        videoUrl == null) {
      _showError('Vui lòng tải video đánh giá trình độ lên');
      return;
    }

    if (learningGoalController.text.trim().isEmpty) {
      _showError('Vui lòng nhập mục tiêu học tập');
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
          '${selectedTimeStart!.hour.toString().padLeft(2, '0')}:${selectedTimeStart!.minute.toString().padLeft(2, '0')}:00';

      final response = await http.post(
        Uri.parse(
          'https://instrulearnapplication.azurewebsites.net/api/LearningRegis/create',
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
          'learningRequest': learningGoalController.text.trim(),
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

  Future<void> _fetchAvailableTeachers() async {
    if (selectedMajorId == null ||
        selectedTimeStart == null ||
        startDay == null) {
      return;
    }

    setState(() {
      isLoadingAvailableTeachers = true;
      availableTeachers = [];
    });

    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token == null) {
        _showError('Vui lòng đăng nhập lại');
        return;
      }

      final String formattedTime =
          '${selectedTimeStart!.hour.toString().padLeft(2, '0')}:${selectedTimeStart!.minute.toString().padLeft(2, '0')}:00';

      final String formattedStartDay = startDay != null
          ? '${startDay!.year}-${startDay!.month.toString().padLeft(2, '0')}-${startDay!.day.toString().padLeft(2, '0')}'
          : '';

      // Sử dụng Uri để đảm bảo các tham số được mã hóa đúng
      final uri = Uri.https(
        'instrulearnapplication.azurewebsites.net',
        '/api/Schedules/available-teachers',
        {
          'majorId': selectedMajorId.toString(),
          'timeStart': formattedTime,
          'timeLearning': timeLearning.toString(),
          'startDay': formattedStartDay,
        },
      );

      final response = await http.get(
        uri,
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer $token',
        },
      );

      print('URL request: ${uri.toString()}');
      print('Response status: ${response.statusCode}');
      print('Response body: ${response.body}');

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);

        final List<Teacher> fetchedTeachers = data.map<Teacher>((item) {
          return Teacher(
            teacherId: item['teacherId'] ?? 0,
            accountId: (item['accountId'] ?? 0)
                .toString(), // Chuyển đổi int thành String
            fullname: item['fullname'] ?? '',
            isActive: 1,
            heading: null,
            majors: (item['majors'] as List<dynamic>).map<Major>((major) {
              return Major(
                majorId: major['majorId'] ?? 0,
                majorName: major['majorName'] ?? '',
                status: major['status'] ?? 0,
              );
            }).toList(),
          );
        }).toList();

        setState(() {
          availableTeachers = fetchedTeachers;
          isLoadingAvailableTeachers = false;
        });
      } else {
        setState(() {
          isLoadingAvailableTeachers = false;
        });
        _showError('Lỗi khi tải danh sách giáo viên khả dụng');
      }
    } catch (e) {
      setState(() {
        isLoadingAvailableTeachers = false;
      });
      print('Lỗi tải danh sách giáo viên khả dụng: $e');
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
            _buildSectionTitle('Chọn chuyên ngành'),
            _buildMajorSelector(),
            const SizedBox(height: 24),
            _buildSectionTitle('Chọn ngày học'),
            _buildLearningDaysSelector(),
            const SizedBox(height: 24),
            _buildSectionTitle('Thời gian học mỗi buổi'),
            _buildTimeLearningSelector(),
            const SizedBox(height: 24),
            _buildSectionTitle('Số tuần học'),
            _buildSessionCountSelector(),
            const SizedBox(height: 24),
            _buildSectionTitle('Chọn thời gian bắt đầu'),
            _buildDateTimeSelector(),
            const SizedBox(height: 24),
            _buildSectionTitle('Chọn ngày bắt đầu học'),
            _buildStartDaySelector(),
            const SizedBox(height: 24),
            if (startDay != null &&
                selectedTimeStart != null &&
                selectedMajorId != null) ...[
              _buildSectionTitle('Chọn giáo viên'),
              _buildAvailableTeacherSelector(),
              const SizedBox(height: 24),
            ],
            _buildSectionTitle('Kinh nghiệm của bạn'),
            _buildExperienceSelector(),
            const SizedBox(height: 24),
            if (selectedExperience != null &&
                selectedExperience != "Tôi chưa chơi nhạc cụ này bao giờ") ...[
              _buildSectionTitle('Tải video đánh giá trình độ'),
              _buildVideoUploadSection(),
              const SizedBox(height: 24),
            ],
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
                teacher.majors.any((major) =>
                    major.majorId == selectedMajorId && major.status == 1) &&
                teacher.isActive == 1)
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
                    // Reset các giá trị liên quan đến thời gian khi đổi giáo viên
                    selectedTimeStart = null;
                    selectedLearningDays.clear();
                    startDay = null;
                  });
                },
        ),
      ),
    );
  }

  Widget _buildMajorSelector() {
    // Lọc ra các major có giáo viên đảm nhận
    final availableMajors = majors.where((major) {
      return teachers.any((teacher) => teacher.majors
          .any((m) => m.majorId == major.majorId && m.status == 1));
    }).toList();

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
          items: availableMajors.map((Major major) {
            return DropdownMenuItem<int>(
              value: major.majorId,
              child: Text(major.majorName),
            );
          }).toList(),
          onChanged: availableMajors.isEmpty
              ? null
              : (int? value) {
                  setState(() {
                    selectedMajorId = value;
                    // Reset giáo viên khi đổi major
                    selectedTeacherId = null;
                    majorTest = null;
                    // Reset danh sách giáo viên khả dụng
                    availableTeachers = [];
                  });
                  if (selectedExperience != null &&
                      selectedExperience !=
                          "Tôi chưa chơi nhạc cụ này bao giờ") {
                    _fetchMajorTest();
                  }
                  // Kiểm tra và cập nhật giáo viên khả dụng nếu đã có đủ thông tin
                  _checkAndFetchAvailableTeachers();
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
              if (value == "Tôi chưa chơi nhạc cụ này bao giờ") {
                if (_videoController != null) {
                  _videoController!.dispose();
                  _videoController = null;
                }
                videoUrl = null;
              }
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
    if (selectedExperience == null ||
        selectedExperience == "Tôi chưa chơi nhạc cụ này bao giờ") {
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
          ],
          const Text(
            'Vui lòng quay video theo yêu cầu trên và tải lên:',
            style: TextStyle(
              fontSize: 14,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            '* Bắt buộc tải video lên để đánh giá trình độ',
            style: TextStyle(
              fontSize: 12,
              color: Colors.red,
              fontStyle: FontStyle.italic,
            ),
          ),
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
                    color: Colors.blue,
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
                  ? '${selectedTimeStart!.hour.toString().padLeft(2, '0')}:${selectedTimeStart!.minute.toString().padLeft(2, '0')}'
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

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Wrap(
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
                    // Tự động tính số buổi khi thêm ngày học
                    numberOfSession =
                        selectedLearningDays.length * numberOfWeeks;
                  } else {
                    selectedLearningDays.remove(index);
                    // Tự động tính số buổi khi xóa ngày học
                    if (selectedLearningDays.isNotEmpty) {
                      numberOfSession =
                          selectedLearningDays.length * numberOfWeeks;
                    } else {
                      numberOfSession = 1;
                    }
                  }
                  // Reset danh sách giáo viên khả dụng và giáo viên đã chọn khi thay đổi ngày học
                  availableTeachers = [];
                  selectedTeacherId = null;
                  // Reset ngày bắt đầu khi thay đổi ngày học trong tuần
                  startDay = null;
                });
              },
            );
          }),
        ),
        if (selectedLearningDays.isNotEmpty) ...[
          const SizedBox(height: 8),
          Text(
            'Số buổi học: $numberOfSession',
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildStartDaySelector() {
    return InkWell(
      onTap: selectedLearningDays.isEmpty ? null : () => _selectStartDay(),
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
                      : 'Chọn ngày bắt đầu học (tuần tiếp theo)',
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
              // Reset danh sách giáo viên khả dụng và giáo viên đã chọn
              availableTeachers = [];
              selectedTeacherId = null;
            });
            // Kiểm tra và cập nhật giáo viên khả dụng nếu đã có đủ thông tin
            _checkAndFetchAvailableTeachers();
          },
        ),
      ),
    );
  }

  Widget _buildSessionCountSelector() {
    // Tự động tính số buổi dựa trên số ngày học và số tuần
    numberOfSession = selectedLearningDays.isEmpty
        ? 1
        : selectedLearningDays.length * numberOfWeeks;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                'Số tuần học: $numberOfWeeks',
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.remove_circle_outline),
                  onPressed: numberOfWeeks > 1
                      ? () {
                          setState(() {
                            numberOfWeeks--;
                            // Tự động tính số buổi khi thay đổi số tuần
                            if (selectedLearningDays.isNotEmpty) {
                              numberOfSession =
                                  selectedLearningDays.length * numberOfWeeks;
                            }
                          });
                        }
                      : null,
                ),
                Text(
                  '$numberOfWeeks',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.add_circle_outline),
                  onPressed: numberOfWeeks < 12 // Giới hạn tối đa 12 tuần
                      ? () {
                          setState(() {
                            numberOfWeeks++;
                            // Tự động tính số buổi khi thay đổi số tuần
                            if (selectedLearningDays.isNotEmpty) {
                              numberOfSession =
                                  selectedLearningDays.length * numberOfWeeks;
                            }
                          });
                        }
                      : null,
                ),
              ],
            ),
          ],
        ),
        if (selectedLearningDays.isNotEmpty) ...[
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey[300]!),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Số buổi học:',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                Text(
                  '$numberOfSession',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF8C9EFF),
                  ),
                ),
              ],
            ),
          ),
        ],
      ],
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
        errorText: learningGoalController.text.trim().isEmpty
            ? 'Vui lòng nhập mục tiêu học tập'
            : null,
      ),
      onChanged: (value) {
        setState(() {});
      },
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

  Widget _buildAvailableTeacherSelector() {
    if (isLoadingAvailableTeachers) {
      return const Center(child: CircularProgressIndicator());
    }

    if (availableTeachers.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.orange[50],
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: Colors.orange[100]!),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.warning_amber_rounded, color: Colors.orange[800]),
                const SizedBox(width: 8),
                const Text(
                  'Không tìm thấy giáo viên khả dụng',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            const Text(
              'Vui lòng thử thay đổi thời gian hoặc ngày học.',
              style: TextStyle(fontSize: 14),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.orange[100],
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
                onPressed: _fetchAvailableTeachers,
                child: const Text('Thử lại',
                    style: TextStyle(color: Colors.black87)),
              ),
            ),
          ],
        ),
      );
    }

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
          hint: const Text('Chọn giáo viên khả dụng'),
          items: availableTeachers
              .map((teacher) => DropdownMenuItem<int>(
                    value: teacher.teacherId,
                    child: Text(
                      teacher.fullname,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ))
              .toList(),
          onChanged: (int? value) {
            setState(() {
              selectedTeacherId = value;
            });
          },
        ),
      ),
    );
  }

  void _showError(String message) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Thông báo'),
          content: Text(message),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: const Text('Đóng'),
            ),
          ],
        );
      },
    );
  }

  void _showSuccess(String message) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Thành công'),
          content: Text(message),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                Navigator.pop(context); // Quay lại màn hình trước
              },
              child: const Text('Đóng'),
            ),
          ],
        );
      },
    );
  }

  // Thêm lại phương thức để kiểm tra và tìm giáo viên khả dụng
  void _checkAndFetchAvailableTeachers() {
    if (selectedMajorId != null &&
        selectedTimeStart != null &&
        startDay != null) {
      _fetchAvailableTeachers();
    }
  }
}
