import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class TeacherScheduleScreen extends StatefulWidget {
  const TeacherScheduleScreen({Key? key}) : super(key: key);

  @override
  State<TeacherScheduleScreen> createState() => _TeacherScheduleScreenState();
}

class _TeacherScheduleScreenState extends State<TeacherScheduleScreen> {
  DateTime _selectedDate = DateTime.now();
  bool _isOneOnOne = true;

  @override
  Widget build(BuildContext context) {
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
            _buildCurrentWeek(),
            _buildMonthSelector(),
            _buildCalendarGrid(),
            _buildScheduleTypeSelector(),
            Expanded(child: _buildScheduleList()),
          ],
        ),
      ),
    );
  }

  Widget _buildCurrentWeek() {
    DateTime startOfWeek = _getStartOfWeek(_selectedDate);
    DateTime endOfWeek = startOfWeek.add(const Duration(days: 6));
    String startDate = DateFormat('dd/MM/yyyy').format(startOfWeek);
    String endDate = DateFormat('dd/MM/yyyy').format(endOfWeek);

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Text(
        'Tuần hiện tại: $startDate-$endDate',
        style: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: Colors.black87,
        ),
      ),
    );
  }

  Widget _buildMonthSelector() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
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
                _selectedDate = DateTime(
                  _selectedDate.year,
                  _selectedDate.month - 1,
                );
              });
            },
          ),
          Text(
            'Tháng ${_selectedDate.month} ${_selectedDate.year}',
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
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
                _selectedDate = DateTime(
                  _selectedDate.year,
                  _selectedDate.month + 1,
                );
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
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 7,
              childAspectRatio: 1,
            ),
            itemCount: 35,
            itemBuilder: (context, index) {
              return _buildCalendarDay(index);
            },
          ),
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
        children:
            weekDays
                .map(
                  (day) => Text(
                    day,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                )
                .toList(),
      ),
    );
  }

  Widget _buildCalendarDay(int index) {
    final firstDayOfMonth = DateTime(
      _selectedDate.year,
      _selectedDate.month,
      1,
    );
    final dayOffset = firstDayOfMonth.weekday - 1;
    final day = index - dayOffset + 1;

    final date = DateTime(_selectedDate.year, _selectedDate.month, day);
    final isCurrentMonth = date.month == _selectedDate.month;

    final hasClass = day >= 20 && day <= 22 && isCurrentMonth;

    return Container(
      decoration: BoxDecoration(
        color: hasClass ? const Color(0xFF536DFE) : Colors.transparent,
        border: Border.all(color: Colors.grey[300]!),
      ),
      child: Center(
        child:
            isCurrentMonth
                ? Text(
                  day.toString(),
                  style: TextStyle(
                    color: hasClass ? Colors.white : Colors.black,
                    fontWeight: hasClass ? FontWeight.bold : FontWeight.normal,
                  ),
                )
                : null,
      ),
    );
  }

  Widget _buildScheduleTypeSelector() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          Expanded(
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor:
                    _isOneOnOne ? const Color(0xFF536DFE) : Colors.grey[300],
                foregroundColor: _isOneOnOne ? Colors.white : Colors.black,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              onPressed: () => setState(() => _isOneOnOne = true),
              child: const Text('Lịch dạy 1:1'),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor:
                    !_isOneOnOne ? const Color(0xFF536DFE) : Colors.grey[300],
                foregroundColor: !_isOneOnOne ? Colors.white : Colors.black,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              onPressed: () => setState(() => _isOneOnOne = false),
              child: const Text('Lịch dạy tại TT'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildScheduleList() {
    final scheduleItems = [
      _buildScheduleCard(
        'Thứ 2',
        '20-12-2025',
        '7:00 AM',
        'Nguyễn Văn A',
        'Guitar cơ bản - Buổi 1',
        const Color(0xFF4CAF50),
      ),
      _buildScheduleCard(
        'Thứ 2',
        '20-12-2025',
        '9:00 AM',
        'Trần Thị B',
        'Piano nâng cao - Buổi 5',
        const Color(0xFF536DFE),
      ),
      _buildScheduleCard(
        'Thứ 3',
        '21-12-2025',
        '7:00 AM',
        'Lê Văn C',
        'Violin cơ bản - Buổi 3',
        Colors.grey[400]!,
      ),
      _buildScheduleCard(
        'Thứ 4',
        '22-12-2025',
        '7:00 AM',
        'Phạm Thị D',
        'Guitar nâng cao - Buổi 8',
        Colors.grey[400]!,
      ),
    ];

    return ListView(padding: const EdgeInsets.all(16), children: scheduleItems);
  }

  Widget _buildScheduleCard(
    String weekDay,
    String date,
    String time,
    String studentName,
    String lessonInfo,
    Color color,
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '$weekDay    Ngày $date',
            style: const TextStyle(
              color: Colors.black87,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            time,
            style: const TextStyle(
              color: Colors.black54,
              fontWeight: FontWeight.w500,
            ),
          ),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(8),
              boxShadow: [
                BoxShadow(
                  color: color.withOpacity(0.3),
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
                  studentName,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  lessonInfo,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w400,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  DateTime _getStartOfWeek(DateTime date) {
    return date.subtract(Duration(days: date.weekday - 1));
  }
}
