import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class TeacherCenterScheduleScreen extends StatefulWidget {
  const TeacherCenterScheduleScreen({Key? key}) : super(key: key);

  @override
  State<TeacherCenterScheduleScreen> createState() =>
      _TeacherCenterScheduleScreenState();
}

class _TeacherCenterScheduleScreenState
    extends State<TeacherCenterScheduleScreen> {
  DateTime _selectedDate = DateTime.now();
  List<dynamic> schedules = [];
  bool isLoading = true;
  String? errorMessage;
  FilterType _currentFilter = FilterType.month;

  @override
  void initState() {
    super.initState();
    _fetchSchedules();
  }

  Future<void> _fetchSchedules() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final teacherId = prefs.getInt('teacherId');

      if (teacherId == null) {
        setState(() {
          errorMessage = 'Không tìm thấy ID giáo viên';
          isLoading = false;
        });
        return;
      }

      final response = await http.get(
        Uri.parse(
          'https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Schedules/teacher/$teacherId/classs',
        ),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer ${prefs.getString('token')}',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['isSucceed'] == true) {
          setState(() {
            schedules = data['data'];
            errorMessage = null;
            isLoading = false;
          });
        } else {
          setState(() {
            errorMessage = data['message'] ?? 'Không thể tải lịch dạy';
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
        errorMessage = 'Lỗi: $e';
        isLoading = false;
      });
    }
  }

  List<dynamic> _getFilteredSchedules() {
    return schedules.where((schedule) {
      return schedule['mode'] == 'Center';
    }).toList();
  }

  List<dynamic> _getSchedulesForDay() {
    return _getFilteredSchedules().where((schedule) {
      try {
        final scheduleDate = DateTime.parse(schedule['startDay']);
        return scheduleDate.year == _selectedDate.year &&
            scheduleDate.month == _selectedDate.month &&
            scheduleDate.day == _selectedDate.day;
      } catch (e) {
        return false;
      }
    }).toList();
  }

  List<dynamic> _getSchedulesForWeek() {
    final startOfWeek = _getStartOfWeek(_selectedDate);
    final endOfWeek = startOfWeek.add(const Duration(days: 6));

    return _getFilteredSchedules().where((schedule) {
      try {
        final scheduleDate = DateTime.parse(schedule['startDay']);
        return scheduleDate
                .isAfter(startOfWeek.subtract(const Duration(days: 1))) &&
            scheduleDate.isBefore(endOfWeek.add(const Duration(days: 1)));
      } catch (e) {
        return false;
      }
    }).toList();
  }

  List<dynamic> _getSchedulesForMonth() {
    final startOfMonth = DateTime(_selectedDate.year, _selectedDate.month, 1);
    final endOfMonth = DateTime(_selectedDate.year, _selectedDate.month + 1, 0);

    return _getFilteredSchedules().where((schedule) {
      try {
        final scheduleDate = DateTime.parse(schedule['startDay']);
        return scheduleDate
                .isAfter(startOfMonth.subtract(const Duration(days: 1))) &&
            scheduleDate.isBefore(endOfMonth.add(const Duration(days: 1)));
      } catch (e) {
        return false;
      }
    }).toList();
  }

  List<dynamic> _getCurrentFilteredSchedules() {
    switch (_currentFilter) {
      case FilterType.day:
        return _getSchedulesForDay();
      case FilterType.week:
        return _getSchedulesForWeek();
      case FilterType.month:
        return _getSchedulesForMonth();
    }
  }

  bool _hasScheduleOnDate(DateTime date) {
    switch (_currentFilter) {
      case FilterType.day:
        return _selectedDate.year == date.year &&
            _selectedDate.month == date.month &&
            _selectedDate.day == date.day &&
            _getSchedulesForDay().isNotEmpty;
      case FilterType.week:
        final startOfWeek = _getStartOfWeek(_selectedDate);
        final endOfWeek = startOfWeek.add(const Duration(days: 6));
        final isInSelectedWeek =
            date.isAfter(startOfWeek.subtract(const Duration(days: 1))) &&
                date.isBefore(endOfWeek.add(const Duration(days: 1)));

        return isInSelectedWeek &&
            _getFilteredSchedules().any((schedule) {
              try {
                final scheduleDate = DateTime.parse(schedule['startDay']);
                return scheduleDate.year == date.year &&
                    scheduleDate.month == date.month &&
                    scheduleDate.day == date.day;
              } catch (e) {
                return false;
              }
            });
      case FilterType.month:
        return _getFilteredSchedules().any((schedule) {
          try {
            final scheduleDate = DateTime.parse(schedule['startDay']);
            return scheduleDate.year == date.year &&
                scheduleDate.month == date.month &&
                scheduleDate.day == date.day;
          } catch (e) {
            return false;
          }
        });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Lịch dạy tại trung tâm'),
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
            _buildFilterButtons(),
            _buildMonthNavigation(),
            _buildCalendarGrid(),
            if (errorMessage != null)
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    Text(
                      errorMessage!,
                      style: const TextStyle(color: Colors.red),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: _fetchSchedules,
                      child: const Text('Thử lại'),
                    ),
                  ],
                ),
              ),
            Expanded(child: _buildScheduleList()),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterButtons() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          _buildFilterButton('Ngày', FilterType.day),
          const SizedBox(width: 8),
          _buildFilterButton('Tuần', FilterType.week),
          const SizedBox(width: 8),
          _buildFilterButton('Tháng', FilterType.month),
        ],
      ),
    );
  }

  Widget _buildFilterButton(String label, FilterType filterType) {
    final isSelected = _currentFilter == filterType;

    return ElevatedButton(
      onPressed: () {
        setState(() {
          _currentFilter = filterType;
        });
      },
      style: ElevatedButton.styleFrom(
        foregroundColor: isSelected ? Colors.white : Colors.black87,
        backgroundColor: isSelected ? const Color(0xFF536DFE) : Colors.white,
        elevation: isSelected ? 4 : 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
          side: BorderSide(
            color: isSelected ? const Color(0xFF536DFE) : Colors.grey[300]!,
          ),
        ),
      ),
      child: Text(label),
    );
  }

  Widget _buildMonthNavigation() {
    String title;
    final dateFormat = DateFormat('dd/MM/yyyy');

    switch (_currentFilter) {
      case FilterType.day:
        title = 'Ngày: ${dateFormat.format(_selectedDate)}';
        break;
      case FilterType.week:
        final startOfWeek = _getStartOfWeek(_selectedDate);
        final endOfWeek = startOfWeek.add(const Duration(days: 6));
        title =
            'Tuần: ${dateFormat.format(startOfWeek)} - ${dateFormat.format(endOfWeek)}';
        break;
      case FilterType.month:
        title = 'Tháng ${_selectedDate.month}/${_selectedDate.year}';
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          IconButton(
            icon: Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.grey[300]!),
              ),
              child: const Icon(Icons.chevron_left),
            ),
            onPressed: () {
              setState(() {
                switch (_currentFilter) {
                  case FilterType.day:
                    _selectedDate =
                        _selectedDate.subtract(const Duration(days: 1));
                    break;
                  case FilterType.week:
                    _selectedDate =
                        _selectedDate.subtract(const Duration(days: 7));
                    break;
                  case FilterType.month:
                    _selectedDate = DateTime(_selectedDate.year,
                        _selectedDate.month - 1, _selectedDate.day);
                    break;
                }
              });
            },
          ),
          Expanded(
            child: Text(
              title,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Colors.black87,
              ),
              textAlign: TextAlign.center,
            ),
          ),
          IconButton(
            icon: Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.grey[300]!),
              ),
              child: const Icon(Icons.chevron_right),
            ),
            onPressed: () {
              setState(() {
                switch (_currentFilter) {
                  case FilterType.day:
                    _selectedDate = _selectedDate.add(const Duration(days: 1));
                    break;
                  case FilterType.week:
                    _selectedDate = _selectedDate.add(const Duration(days: 7));
                    break;
                  case FilterType.month:
                    _selectedDate = DateTime(_selectedDate.year,
                        _selectedDate.month + 1, _selectedDate.day);
                    break;
                }
              });
            },
          ),
        ],
      ),
    );
  }

  Widget _buildCalendarGrid() {
    return Container(
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 5,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          _buildWeekDayHeader(),
          _buildMonthGrid(),
        ],
      ),
    );
  }

  Widget _buildWeekDayHeader() {
    final weekDays = ['CN', 'Thứ2', 'Thứ3', 'Thứ4', 'Thứ5', 'Thứ6', 'Thứ7'];
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Colors.grey)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: weekDays
            .map(
              (day) => SizedBox(
                width: 30,
                child: Text(
                  day,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            )
            .toList(),
      ),
    );
  }

  Widget _buildMonthGrid() {
    final firstDayOfMonth =
        DateTime(_selectedDate.year, _selectedDate.month, 1);
    final lastDayOfMonth =
        DateTime(_selectedDate.year, _selectedDate.month + 1, 0);

    final firstWeekday = firstDayOfMonth.weekday % 7;

    final daysInGrid = firstWeekday + lastDayOfMonth.day;
    final rowsRequired = (daysInGrid / 7).ceil();
    final totalDays = rowsRequired * 7;

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 7,
        childAspectRatio: 1,
      ),
      itemCount: totalDays,
      itemBuilder: (context, index) {
        DateTime date;
        bool isCurrentMonth = true;

        if (index < firstWeekday) {
          final daysToSubtract = firstWeekday - index;
          date = firstDayOfMonth.subtract(Duration(days: daysToSubtract));
          isCurrentMonth = false;
        } else if (index < firstWeekday + lastDayOfMonth.day) {
          final day = index - firstWeekday + 1;
          date = DateTime(_selectedDate.year, _selectedDate.month, day);
        } else {
          final daysToAdd = index - firstWeekday - lastDayOfMonth.day + 1;
          date =
              DateTime(_selectedDate.year, _selectedDate.month + 1, daysToAdd);
          isCurrentMonth = false;
        }

        final hasSchedule = isCurrentMonth && _hasScheduleOnDate(date);
        final isSelectedDay = date.year == _selectedDate.year &&
            date.month == _selectedDate.month &&
            date.day == _selectedDate.day;

        return GestureDetector(
          onTap: () {
            if (isCurrentMonth) {
              setState(() {
                _selectedDate = date;
              });
            }
          },
          child: Container(
            decoration: BoxDecoration(
              color: hasSchedule
                  ? const Color(0xFF536DFE)
                  : isSelectedDay
                      ? const Color(0xFFE3F2FD)
                      : Colors.transparent,
              border: Border.all(
                color:
                    isSelectedDay ? const Color(0xFF536DFE) : Colors.grey[300]!,
                width: isSelectedDay ? 2 : 1,
              ),
            ),
            child: Center(
              child: Text(
                date.day.toString(),
                style: TextStyle(
                  color: !isCurrentMonth
                      ? Colors.grey
                      : hasSchedule
                          ? Colors.white
                          : isSelectedDay
                              ? const Color(0xFF536DFE)
                              : Colors.black,
                  fontWeight: hasSchedule || isSelectedDay
                      ? FontWeight.bold
                      : FontWeight.normal,
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildScheduleList() {
    final filteredSchedules = _getCurrentFilteredSchedules();
    if (filteredSchedules.isEmpty) {
      String message;
      switch (_currentFilter) {
        case FilterType.day:
          message =
              'Không có lịch dạy vào ngày ${DateFormat('dd/MM/yyyy').format(_selectedDate)}';
          break;
        case FilterType.week:
          final startOfWeek = _getStartOfWeek(_selectedDate);
          final endOfWeek = startOfWeek.add(const Duration(days: 6));
          message =
              'Không có lịch dạy trong tuần từ ${DateFormat('dd/MM/yyyy').format(startOfWeek)} đến ${DateFormat('dd/MM/yyyy').format(endOfWeek)}';
          break;
        case FilterType.month:
          message =
              'Không có lịch dạy trong tháng ${_selectedDate.month}/${_selectedDate.year}';
          break;
      }

      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.calendar_today,
              size: 64,
              color: Colors.grey,
            ),
            const SizedBox(height: 16),
            Text(
              message,
              style: const TextStyle(
                fontSize: 16,
                color: Colors.grey,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: filteredSchedules.length,
      itemBuilder: (context, index) {
        final schedule = filteredSchedules[index];
        return _buildScheduleCard(schedule);
      },
    );
  }

  Widget _buildScheduleCard(Map<String, dynamic> schedule) {
    final date = DateTime.parse(schedule['startDay']);
    final dayName = _getVietnameseDayName(date.weekday);

    return GestureDetector(
      onTap: () => _showClassDetailDialog(schedule),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '$dayName    Ngày ${date.day}/${date.month}/${date.year}',
              style: const TextStyle(
                color: Colors.black87,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              '${schedule['timeStart']} - ${schedule['timeEnd']}',
              style: const TextStyle(
                color: Colors.black54,
                fontWeight: FontWeight.w500,
              ),
            ),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF536DFE),
                borderRadius: BorderRadius.circular(8),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF536DFE).withOpacity(0.3),
                    spreadRadius: 1,
                    blurRadius: 3,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    schedule['className'],
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Dạy tại trung tâm',
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w400,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Số học viên: ${schedule['participants'].length}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w400,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showClassDetailDialog(Map<String, dynamic> schedule) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return Dialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(15),
          ),
          child: Container(
            padding: const EdgeInsets.all(20),
            constraints: BoxConstraints(
              maxHeight: MediaQuery.of(context).size.height * 0.8,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        schedule['className'],
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF536DFE),
                        ),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () => Navigator.of(context).pop(),
                    ),
                  ],
                ),
                const Divider(),
                const SizedBox(height: 10),
                _buildDetailItem('Thời gian',
                    '${schedule['timeStart']} - ${schedule['timeEnd']}'),
                _buildDetailItem(
                    'Ngày học',
                    _getVietnameseDayName(
                        _getDayNumber(schedule['dayOfWeek']))),
                _buildDetailItem(
                    'Ngày bắt đầu', _formatDate(schedule['startDay'])),
                _buildDetailItem(
                    'Số học viên', '${schedule['participants'].length}'),
                const SizedBox(height: 15),
                const Text(
                  'Danh sách học viên',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 10),
                Flexible(
                  child: ListView.builder(
                    shrinkWrap: true,
                    itemCount: schedule['participants'].length,
                    itemBuilder: (context, index) {
                      final participant = schedule['participants'][index];
                      return Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: participant['attendanceStatus'] == 1
                              ? Colors.green.withOpacity(0.1)
                              : participant['attendanceStatus'] == 2
                                  ? Colors.red.withOpacity(0.1)
                                  : Colors.grey[100],
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: participant['attendanceStatus'] == 1
                                ? Colors.green
                                : participant['attendanceStatus'] == 2
                                    ? Colors.red
                                    : Colors.grey[300]!,
                            width: 1,
                          ),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                color: participant['attendanceStatus'] == 1
                                    ? Colors.green
                                    : participant['attendanceStatus'] == 2
                                        ? Colors.red
                                        : const Color(0xFF536DFE),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Center(
                                child: Text(
                                  participant['learnerName'][0].toUpperCase(),
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    participant['learnerName'],
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  Text(
                                    'ID: ${participant['learnerId']}',
                                    style: TextStyle(
                                      color: Colors.grey[600],
                                      fontSize: 12,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                IconButton(
                                  onPressed: () {
                                    _markAttendance(
                                        participant['scheduleId'], 1);
                                    Navigator.of(context).pop();
                                  },
                                  icon: const Icon(Icons.check_circle),
                                  color: Colors.green,
                                  iconSize: 32,
                                  tooltip: 'Có mặt',
                                ),
                                const SizedBox(width: 16),
                                IconButton(
                                  onPressed: () {
                                    _markAttendance(
                                        participant['scheduleId'], 2);
                                    Navigator.of(context).pop();
                                  },
                                  icon: const Icon(Icons.cancel),
                                  color: Colors.red,
                                  iconSize: 32,
                                  tooltip: 'Vắng mặt',
                                ),
                              ],
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
      },
    );
  }

  Widget _buildDetailItem(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Text(
            '$label: ',
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
          Text(
            value,
            style: const TextStyle(
              color: Colors.black54,
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(String dateString) {
    final date = DateTime.parse(dateString);
    return '${date.day}/${date.month}/${date.year}';
  }

  int _getDayNumber(String dayOfWeek) {
    final days = {
      'Monday': 1,
      'Tuesday': 2,
      'Wednesday': 3,
      'Thursday': 4,
      'Friday': 5,
      'Saturday': 6,
      'Sunday': 7,
    };
    return days[dayOfWeek] ?? 1;
  }

  DateTime _getStartOfWeek(DateTime date) {
    return date.subtract(Duration(days: date.weekday % 7));
  }

  String _getVietnameseDayName(int weekday) {
    final dayNames = [
      'Chủ nhật',
      'Thứ 2',
      'Thứ 3',
      'Thứ 4',
      'Thứ 5',
      'Thứ 6',
      'Thứ 7',
    ];
    return dayNames[weekday % 7];
  }

  Future<void> _markAttendance(int scheduleId, int status) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Vui lòng đăng nhập lại')),
        );
        return;
      }

      final response = await http.put(
        Uri.parse(
          'https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Schedules/update-attendance/$scheduleId',
        ),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer $token',
        },
        body: json.encode(status),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['isSucceed'] == true) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                status == 1
                    ? 'Đã điểm danh thành công'
                    : 'Đã đánh dấu vắng mặt',
              ),
              backgroundColor: status == 1 ? Colors.green : Colors.red,
            ),
          );
          await _fetchSchedules(); // Refresh data
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
                content: Text(data['message'] ?? 'Lỗi cập nhật điểm danh')),
          );
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi kết nối: ${response.statusCode}')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Lỗi: $e')),
      );
    }
  }
}

enum FilterType {
  day,
  week,
  month,
}
