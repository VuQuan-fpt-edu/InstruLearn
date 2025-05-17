import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:fl_chart/fl_chart.dart';

class AttendanceCheckingScreen extends StatefulWidget {
  final int learnerId;

  const AttendanceCheckingScreen({Key? key, required this.learnerId})
      : super(key: key);

  @override
  State<AttendanceCheckingScreen> createState() =>
      _AttendanceCheckingScreenState();
}

class _AttendanceCheckingScreenState extends State<AttendanceCheckingScreen> {
  bool isLoading = true;
  Map<String, dynamic>? attendanceData;

  @override
  void initState() {
    super.initState();
    _fetchAttendanceData();
  }

  Future<void> _fetchAttendanceData() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token == null) {
        _showErrorMessage('Vui lòng đăng nhập lại');
        return;
      }

      final response = await http.get(
        Uri.parse(
          'https://instrulearnapplication.azurewebsites.net/api/Schedules/attendance-stats/learner/${widget.learnerId}',
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
            attendanceData = data['data'];
            isLoading = false;
          });
        } else {
          _showErrorMessage(
              data['message'] ?? 'Không thể tải dữ liệu điểm danh');
        }
      } else {
        _showErrorMessage('Lỗi kết nối: ${response.statusCode}');
      }
    } catch (e) {
      _showErrorMessage('Lỗi: ${e.toString()}');
    }
  }

  void _showErrorMessage(String message) {
    if (mounted) {
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(message)));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Báo cáo điểm danh'),
        backgroundColor: const Color(0xFF8C9EFF),
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : attendanceData == null
              ? const Center(child: Text('Không có dữ liệu'))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: attendanceData!['registrationStatistics'].length,
                  itemBuilder: (context, index) {
                    final registration =
                        attendanceData!['registrationStatistics'][index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 16),
                      child: InkWell(
                        onTap: () =>
                            _showAttendanceDetails(context, registration),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'Giáo viên: ${registration['teacherName']}',
                                          style: const TextStyle(
                                            fontSize: 16,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          'Nhạc cụ: ${registration['majorName']}',
                                          style: const TextStyle(fontSize: 14),
                                        ),
                                      ],
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 12,
                                      vertical: 6,
                                    ),
                                    decoration: BoxDecoration(
                                      color: Colors.blue[100],
                                      borderRadius: BorderRadius.circular(20),
                                    ),
                                    child: Text(
                                      registration['type'] == 'One-on-One'
                                          ? 'Học kèm 1:1'
                                          : registration['type'],
                                      style: TextStyle(
                                        color: Colors.blue[900],
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              Text(
                                'Yêu cầu: ${registration['learningRequest']}',
                                style: const TextStyle(fontSize: 14),
                              ),
                              const SizedBox(height: 12),
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  _buildStatItem(
                                    'Tổng số buổi',
                                    registration['totalSessions'].toString(),
                                  ),
                                  _buildStatItem(
                                    'Đã điểm danh',
                                    registration['attendedSessions'].toString(),
                                  ),
                                  _buildStatItem(
                                    'Vắng mặt',
                                    registration['absentSessions'].toString(),
                                  ),
                                  _buildStatItem(
                                    'Chưa điểm danh',
                                    registration['pendingSessions'].toString(),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              LinearProgressIndicator(
                                value: registration['attendanceRate'] / 100,
                                backgroundColor: Colors.grey[200],
                                valueColor: AlwaysStoppedAnimation<Color>(
                                  _getAttendanceColor(
                                      registration['attendanceRate']),
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Tỷ lệ điểm danh: ${registration['attendanceRate']}%',
                                style: TextStyle(
                                  color: _getAttendanceColor(
                                      registration['attendanceRate']),
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
    );
  }

  Widget _buildStatItem(String label, String value) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            color: Colors.grey,
          ),
        ),
      ],
    );
  }

  Color _getAttendanceColor(int rate) {
    if (rate >= 80) return Colors.green;
    if (rate >= 50) return Colors.orange;
    return Colors.red;
  }

  void _showAttendanceDetails(
      BuildContext context, Map<String, dynamic> registration) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'Chi tiết điểm danh',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                height: 200,
                child: PieChart(
                  PieChartData(
                    sections: [
                      PieChartSectionData(
                        value: registration['attendedSessions'].toDouble(),
                        title: 'Có mặt',
                        color: Colors.green,
                        radius: 50,
                      ),
                      PieChartSectionData(
                        value: registration['absentSessions'].toDouble(),
                        title: 'Vắng mặt',
                        color: Colors.red,
                        radius: 50,
                      ),
                      PieChartSectionData(
                        value: registration['pendingSessions'].toDouble(),
                        title: 'Chưa điểm danh',
                        color: Colors.grey,
                        radius: 50,
                      ),
                    ],
                    sectionsSpace: 2,
                    centerSpaceRadius: 40,
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _buildLegendItem('Có mặt', Colors.green),
                  _buildLegendItem('Vắng mặt', Colors.red),
                  _buildLegendItem('Chưa điểm danh', Colors.grey),
                ],
              ),
              const SizedBox(height: 20),
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Đóng'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLegendItem(String label, Color color) {
    return Row(
      children: [
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 4),
        Text(label),
      ],
    );
  }
}
