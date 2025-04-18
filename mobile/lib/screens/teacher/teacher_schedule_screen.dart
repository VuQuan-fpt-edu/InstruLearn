import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../models/schedule.dart';
import '../../services/schedule_service.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

enum FilterType {
  day,
  week,
  month,
}

class TeacherScheduleScreen extends StatefulWidget {
  const TeacherScheduleScreen({Key? key}) : super(key: key);

  @override
  State<TeacherScheduleScreen> createState() => _TeacherScheduleScreenState();
}

class _TeacherScheduleScreenState extends State<TeacherScheduleScreen> {
  DateTime _selectedDate = DateTime.now();
  List<Schedule> schedules = [];
  bool isLoading = true;
  String? errorMessage;
  FilterType _currentFilter = FilterType.month;
  final ScheduleService _scheduleService = ScheduleService();

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

      final fetchedSchedules =
          await _scheduleService.getTeacherSchedules(teacherId);

      setState(() {
        if (fetchedSchedules.isEmpty) {
          errorMessage = 'Không có lịch dạy';
        } else {
          schedules = fetchedSchedules;
          errorMessage = null;
        }
        isLoading = false;
      });
    } catch (e) {
      if (e
          .toString()
          .contains('No Learning Registrations found for this teacher')) {
        setState(() {
          errorMessage = 'Không có lịch dạy';
          isLoading = false;
          schedules = [];
        });
      } else {
        setState(() {
          errorMessage = 'Lỗi: $e';
          isLoading = false;
          schedules = [];
        });
      }
    }
  }

  List<Schedule> _getFilteredSchedules() {
    final filteredSchedules = schedules.where((schedule) {
      return schedule.mode == 'OneOnOne';
    }).toList();

    // Sắp xếp theo ngày, tháng, năm và giờ từ bé đến lớn
    filteredSchedules.sort((a, b) {
      final dateA = DateTime.parse(a.startDate);
      final dateB = DateTime.parse(b.startDate);

      // So sánh ngày, tháng, năm trước
      if (dateA.year != dateB.year) return dateA.year.compareTo(dateB.year);
      if (dateA.month != dateB.month) return dateA.month.compareTo(dateB.month);
      if (dateA.day != dateB.day) return dateA.day.compareTo(dateB.day);

      // Nếu cùng ngày thì so sánh giờ
      final timeA = a.timeStart.split(':');
      final timeB = b.timeStart.split(':');

      final hourA = int.parse(timeA[0]);
      final minuteA = int.parse(timeA[1]);
      final hourB = int.parse(timeB[0]);
      final minuteB = int.parse(timeB[1]);

      if (hourA != hourB) return hourA.compareTo(hourB);
      return minuteA.compareTo(minuteB);
    });

    return filteredSchedules;
  }

  List<Schedule> _getSchedulesForDay() {
    return _getFilteredSchedules().where((schedule) {
      try {
        final scheduleDate = DateTime.parse(schedule.startDate);
        return scheduleDate.year == _selectedDate.year &&
            scheduleDate.month == _selectedDate.month &&
            scheduleDate.day == _selectedDate.day;
      } catch (e) {
        return false;
      }
    }).toList();
  }

  List<Schedule> _getSchedulesForWeek() {
    final startOfWeek = _getStartOfWeek(_selectedDate);
    final endOfWeek = startOfWeek.add(const Duration(days: 6));

    return _getFilteredSchedules().where((schedule) {
      try {
        final scheduleDate = DateTime.parse(schedule.startDate);
        return scheduleDate
                .isAfter(startOfWeek.subtract(const Duration(days: 1))) &&
            scheduleDate.isBefore(endOfWeek.add(const Duration(days: 1)));
      } catch (e) {
        // Nếu phân tích ngày bị lỗi, bỏ qua mục này
        return false;
      }
    }).toList();
  }

  List<Schedule> _getSchedulesForMonth() {
    final startOfMonth = DateTime(_selectedDate.year, _selectedDate.month, 1);
    final endOfMonth = DateTime(_selectedDate.year, _selectedDate.month + 1, 0);

    return _getFilteredSchedules().where((schedule) {
      try {
        final scheduleDate = DateTime.parse(schedule.startDate);
        return scheduleDate
                .isAfter(startOfMonth.subtract(const Duration(days: 1))) &&
            scheduleDate.isBefore(endOfMonth.add(const Duration(days: 1)));
      } catch (e) {
        return false;
      }
    }).toList();
  }

  List<Schedule> _getCurrentFilteredSchedules() {
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
                final scheduleDate = DateTime.parse(schedule.startDate);
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
            final scheduleDate = DateTime.parse(schedule.startDate);
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

    // Luôn hiển thị lịch, ngay cả khi có lỗi hoặc không có dữ liệu
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text('Lịch dạy'),
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
    // Tính toán ngày đầu tiên và cuối cùng của grid
    final firstDayOfMonth =
        DateTime(_selectedDate.year, _selectedDate.month, 1);
    final lastDayOfMonth =
        DateTime(_selectedDate.year, _selectedDate.month + 1, 0);

    // Tính số ngày cần hiển thị từ tháng trước
    final firstWeekday = firstDayOfMonth.weekday % 7;

    // Tính tổng số ngày cần hiển thị (gồm cả ngày từ tháng trước và tháng sau)
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
        // Tính ngày tương ứng với index
        DateTime date;
        bool isCurrentMonth = true;

        if (index < firstWeekday) {
          // Ngày từ tháng trước
          final daysToSubtract = firstWeekday - index;
          date = firstDayOfMonth.subtract(Duration(days: daysToSubtract));
          isCurrentMonth = false;
        } else if (index < firstWeekday + lastDayOfMonth.day) {
          // Ngày trong tháng hiện tại
          final day = index - firstWeekday + 1;
          date = DateTime(_selectedDate.year, _selectedDate.month, day);
        } else {
          // Ngày từ tháng sau
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
        return InkWell(
          onTap: () => _showAttendanceBottomSheet(context, schedule),
          child: _buildScheduleCard(schedule),
        );
      },
    );
  }

  Widget _buildScheduleCard(Schedule schedule) {
    final date = DateTime.parse(schedule.startDate);
    final dayName = _getVietnameseDayName(date.weekday);

    // Determine card color based on attendance status and date
    Color cardColor;
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final scheduleDate = DateTime(date.year, date.month, date.day);

    if (schedule.attendanceStatus == 1) {
      cardColor = Colors.green; // Present
    } else if (schedule.attendanceStatus == 2) {
      cardColor = Colors.red; // Absent
    } else {
      // attendanceStatus == 0 (or null/other)
      if (scheduleDate.isBefore(today)) {
        cardColor = Colors.grey; // Past and not attended
      } else {
        cardColor = const Color(
            0xFF536DFE); // Future or today, not attended (default blue)
      }
    }

    return Container(
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
            '${schedule.timeStart} - ${schedule.timeEnd}',
            style: const TextStyle(
              color: Colors.black54,
              fontWeight: FontWeight.w500,
            ),
          ),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: cardColor, // Use the determined color
              borderRadius: BorderRadius.circular(8),
              boxShadow: [
                BoxShadow(
                  color: cardColor
                      .withOpacity(0.3), // Use the determined color for shadow
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
                  schedule.learnerName,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Dạy kèm 1:1',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w400,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(
                      Icons.location_on,
                      color: Colors.white,
                      size: 16,
                    ),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        schedule.learnerAddress ?? 'Không có địa chỉ',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w400,
                          fontSize: 12,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
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

  void _showAttendanceBottomSheet(BuildContext context, Schedule schedule) {
    final scheduleDate = DateTime.parse(schedule.startDate);
    final now = DateTime.now();
    // Compare dates only, ignoring time
    final today = DateTime(now.year, now.month, now.day);
    final scheduleDateOnly =
        DateTime(scheduleDate.year, scheduleDate.month, scheduleDate.day);
    final isFutureDate = scheduleDateOnly.isAfter(today);

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (BuildContext bc) {
        return Container(
          padding: const EdgeInsets.all(20),
          child: Wrap(
            children: <Widget>[
              Center(
                child: Text(
                  'Điểm danh cho buổi học',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
              ),
              const SizedBox(height: 10),
              Text('Học viên: ${schedule.learnerName}',
                  style: const TextStyle(fontSize: 16)),
              Text('Thời gian: ${schedule.timeStart} - ${schedule.timeEnd}',
                  style: const TextStyle(fontSize: 16)),
              Text(
                  'Ngày: ${DateFormat('dd/MM/yyyy').format(DateTime.parse(schedule.startDate))}',
                  style: const TextStyle(fontSize: 16)),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: <Widget>[
                  ElevatedButton.icon(
                    icon: const Icon(Icons.check_circle, color: Colors.white),
                    label: const Text('Có mặt',
                        style: TextStyle(color: Colors.white)),
                    onPressed: () {
                      Navigator.pop(context); // Close bottom sheet first
                      if (isFutureDate) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text(
                                'Không thể điểm danh cho ngày trong tương lai.'),
                            backgroundColor: Colors.orange,
                          ),
                        );
                      } else {
                        _updateAttendance(schedule.scheduleId, 1);
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      padding: const EdgeInsets.symmetric(
                          horizontal: 20, vertical: 12),
                    ),
                  ),
                  ElevatedButton.icon(
                    icon: const Icon(Icons.cancel, color: Colors.white),
                    label: const Text('Vắng mặt',
                        style: TextStyle(color: Colors.white)),
                    onPressed: () {
                      Navigator.pop(context); // Close bottom sheet first
                      if (isFutureDate) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text(
                                'Không thể điểm danh cho ngày trong tương lai.'),
                            backgroundColor: Colors.orange,
                          ),
                        );
                      } else {
                        _updateAttendance(schedule.scheduleId, 2);
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red,
                      padding: const EdgeInsets.symmetric(
                          horizontal: 20, vertical: 12),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
            ],
          ),
        );
      },
    );
  }

  Future<void> _updateAttendance(int scheduleId, int status) async {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Đang cập nhật điểm danh...')),
    );

    try {
      final success =
          await _scheduleService.updateAttendance(scheduleId, status);
      if (success) {
        ScaffoldMessenger.of(context).removeCurrentSnackBar();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Cập nhật điểm danh thành công!'),
            backgroundColor: Colors.green,
          ),
        );
        await _fetchSchedules();
      } else {
        ScaffoldMessenger.of(context).removeCurrentSnackBar();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Cập nhật điểm danh thất bại.'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).removeCurrentSnackBar();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Lỗi khi cập nhật điểm danh: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }
}
