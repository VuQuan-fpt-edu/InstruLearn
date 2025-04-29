class Schedule {
  final int scheduleId;
  final int teacherId;
  final String teacherName;
  final int learnerId;
  final String learnerName;
  final String? learnerAddress;
  final int? classId;
  final String? className;
  final String timeStart;
  final String timeEnd;
  final String dayOfWeek;
  final String startDate;
  final String mode;
  final String registrationStartDay;
  final int learningRegisId;
  final int attendanceStatus;
  final List<ScheduleDay>? scheduleDays;
  final List<ClassDay>? classDayDTOs;
  final int? learningPathSessionId;
  final int? sessionNumber;
  final String? sessionTitle;
  final String? sessionDescription;
  final bool? isSessionCompleted;

  Schedule({
    required this.scheduleId,
    required this.teacherId,
    required this.teacherName,
    required this.learnerId,
    required this.learnerName,
    this.learnerAddress,
    this.classId,
    this.className,
    required this.timeStart,
    required this.timeEnd,
    required this.dayOfWeek,
    required this.startDate,
    required this.mode,
    required this.registrationStartDay,
    required this.learningRegisId,
    required this.attendanceStatus,
    this.scheduleDays,
    this.classDayDTOs,
    this.learningPathSessionId,
    this.sessionNumber,
    this.sessionTitle,
    this.sessionDescription,
    this.isSessionCompleted,
  });

  factory Schedule.fromJson(Map<String, dynamic> json) {
    return Schedule(
      scheduleId: json['scheduleId'],
      teacherId: json['teacherId'],
      teacherName: json['teacherName'],
      learnerId: json['learnerId'],
      learnerName: json['learnerName'],
      learnerAddress: json['learnerAddress'],
      classId: json['classId'],
      className: json['className'],
      timeStart: json['timeStart'],
      timeEnd: json['timeEnd'],
      dayOfWeek: json['dayOfWeek'],
      startDate: json['startDay'],
      mode: json['mode'],
      registrationStartDay: json['registrationStartDay'],
      learningRegisId: json['learningRegisId'],
      attendanceStatus: json['attendanceStatus'] ?? 0,
      scheduleDays: json['scheduleDays'] != null
          ? (json['scheduleDays'] as List)
              .map((day) => ScheduleDay.fromJson(day))
              .toList()
          : null,
      classDayDTOs: json['classDayDTOs'] != null
          ? (json['classDayDTOs'] as List)
              .map((day) => ClassDay.fromJson(day))
              .toList()
          : null,
      learningPathSessionId: json['learningPathSessionId'],
      sessionNumber: json['sessionNumber'],
      sessionTitle: json['sessionTitle'],
      sessionDescription: json['sessionDescription'],
      isSessionCompleted: json['isSessionCompleted'],
    );
  }
}

class ScheduleDay {
  final String dayOfWeeks;

  ScheduleDay({required this.dayOfWeeks});

  factory ScheduleDay.fromJson(Map<String, dynamic> json) {
    return ScheduleDay(
      dayOfWeeks: json['dayOfWeeks'],
    );
  }
}

class ClassDay {
  final String dayOfWeeks;

  ClassDay({required this.dayOfWeeks});

  factory ClassDay.fromJson(Map<String, dynamic> json) {
    return ClassDay(
      dayOfWeeks: json['dayOfWeeks'],
    );
  }
}
