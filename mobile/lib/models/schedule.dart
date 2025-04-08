class Schedule {
  final int scheduleId;
  final int teacherId;
  final String teacherName;
  final int learnerId;
  final String learnerName;
  final String timeStart;
  final String timeEnd;
  final String dayOfWeek;
  final String startDate;
  final String mode;
  final String registrationStartDay;
  final int learningRegisId;
  final List<ScheduleDay> scheduleDays;

  Schedule({
    required this.scheduleId,
    required this.teacherId,
    required this.teacherName,
    required this.learnerId,
    required this.learnerName,
    required this.timeStart,
    required this.timeEnd,
    required this.dayOfWeek,
    required this.startDate,
    required this.mode,
    required this.registrationStartDay,
    required this.learningRegisId,
    required this.scheduleDays,
  });

  factory Schedule.fromJson(Map<String, dynamic> json) {
    return Schedule(
      scheduleId: json['scheduleId'] ?? 0,
      teacherId: json['teacherId'] ?? 0,
      teacherName: json['teacherName'] ?? '',
      learnerId: json['learnerId'] ?? 0,
      learnerName: json['learnerName'] ?? '',
      timeStart: json['timeStart'] ?? '',
      timeEnd: json['timeEnd'] ?? '',
      dayOfWeek: json['dayOfWeek'] ?? '',
      startDate: json['startDay'] ?? '',
      mode: json['mode']?.toString() ?? '',
      registrationStartDay: json['registrationStartDay'] ?? '',
      learningRegisId: json['learningRegisId'] ?? 0,
      scheduleDays: json['scheduleDays'] != null
          ? (json['scheduleDays'] as List)
              .map((day) => ScheduleDay.fromJson(day))
              .toList()
          : [],
    );
  }
}

class ScheduleDay {
  final String dayOfWeeks;

  ScheduleDay({required this.dayOfWeeks});

  factory ScheduleDay.fromJson(Map<String, dynamic> json) {
    return ScheduleDay(
      dayOfWeeks: json['dayOfWeeks'] ?? '',
    );
  }
}
