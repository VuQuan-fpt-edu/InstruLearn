import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../models/schedule.dart';
import '../../services/schedule_service.dart';

enum FilterType {
  day,
  week,
  month,
}

class ScheduleScreen extends StatefulWidget {
  const ScheduleScreen({Key? key}) : super(key: key);

  @override
  State<ScheduleScreen> createState() => _ScheduleScreenState();
}

class _ScheduleScreenState extends State<ScheduleScreen> {
  DateTime _selectedDate = DateTime.now();
  List<Schedule> schedules = [];
  bool isLoading = true;
  String? errorMessage;
  FilterType _currentFilter = FilterType.week;

  @override
  void initState() {
    super.initState();
    _fetchSchedules();
  }

  Future<void> _fetchSchedules() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final learnerId = prefs.getInt('learnerId');

      if (learnerId == null) {
        setState(() {
          errorMessage = 'Không tìm thấy ID học viên';
          isLoading = false;
        });
        return;
      }

      final scheduleService = ScheduleService();
      final fetchedSchedules =
          await scheduleService.getLearnerSchedules(learnerId);

      setState(() {
        schedules = fetchedSchedules;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        schedules = [];
        isLoading = false;
      });
    }
  }

  List<Schedule> _getFilteredSchedules() {
    final filteredSchedules = schedules.where((schedule) {
      return schedule.mode == "OneOnOne";
    }).toList();

    filteredSchedules.sort((a, b) {
      final dateA = DateTime.parse(a.startDate);
      final dateB = DateTime.parse(b.startDate);

      if (dateA.year != dateB.year) return dateA.year.compareTo(dateB.year);
      if (dateA.month != dateB.month) return dateA.month.compareTo(dateB.month);
      if (dateA.day != dateB.day) return dateA.day.compareTo(dateB.day);

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
        title: const Text('Lịch học'),
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
            _buildNavigation(),
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

  Widget _buildNavigation() {
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
              'Không có lịch học vào ngày ${DateFormat('dd/MM/yyyy').format(_selectedDate)}';
          break;
        case FilterType.week:
          final startOfWeek = _getStartOfWeek(_selectedDate);
          final endOfWeek = startOfWeek.add(const Duration(days: 6));
          message =
              'Không có lịch học trong tuần từ ${DateFormat('dd/MM/yyyy').format(startOfWeek)} đến ${DateFormat('dd/MM/yyyy').format(endOfWeek)}';
          break;
        case FilterType.month:
          message =
              'Không có lịch học trong tháng ${_selectedDate.month}/${_selectedDate.year}';
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
            const SizedBox(height: 8),
            Text(
              'Bạn có thể đăng ký học kèm 1:1 để có lịch học',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[600],
              ),
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

  Widget _buildScheduleCard(Schedule schedule) {
    final date = DateTime.parse(schedule.startDate);
    final dayName = _getVietnameseDayName(date.weekday);

    Color cardColor;
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final scheduleDate = DateTime(date.year, date.month, date.day);

    if (schedule.attendanceStatus == 1) {
      cardColor = Colors.green;
    } else if (schedule.attendanceStatus == 2) {
      cardColor = Colors.red;
    } else {
      if (scheduleDate.isBefore(today)) {
        cardColor = Colors.grey;
      } else {
        cardColor = const Color(0xFF536DFE);
      }
    }

    String? preferenceText;
    Color? preferenceColor;
    if (schedule.attendanceStatus == 2) {
      switch (schedule.preferenceStatus) {
        case 1:
          preferenceText = 'Yêu cầu đổi giáo viên';
          preferenceColor = Colors.orange;
          break;
        case 2:
          preferenceText = 'Yêu cầu học bù';
          preferenceColor = Colors.purple;
          break;
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
              color: cardColor,
              borderRadius: BorderRadius.circular(8),
              boxShadow: [
                BoxShadow(
                  color: cardColor.withOpacity(0.3),
                  spreadRadius: 1,
                  blurRadius: 3,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        schedule.teacherName,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    if (preferenceText != null)
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: preferenceColor,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          preferenceText,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  'Môn học: ${schedule.majorName}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w400,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Học kèm 1:1',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w400,
                  ),
                ),
                if (schedule.sessionTitle != null) ...[
                  const SizedBox(height: 8),
                  Text(
                    'Buổi ${schedule.sessionNumber}: ${schedule.sessionTitle}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  if (schedule.sessionDescription != null &&
                      schedule.sessionDescription!.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: Text(
                        schedule.sessionDescription!,
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
}
