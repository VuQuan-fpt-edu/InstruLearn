class ClassModel {
  final int classId;
  final int teacherId;
  final String teacherName;
  final int majorId;
  final String majorName;
  final int levelId;
  final String levelName;
  final String syllabusLink;
  final String className;
  final String testDay;
  final String startDate;
  final String endDate;
  final String classTime;
  final String classEndTime;
  final int maxStudents;
  final int studentCount;
  final int totalDays;
  final int status;
  final int price;
  final List<String> sessionDates;
  final List<ClassDay> classDays;
  final List<Student> students;

  ClassModel({
    required this.classId,
    required this.teacherId,
    required this.teacherName,
    required this.majorId,
    required this.majorName,
    required this.levelId,
    required this.levelName,
    required this.syllabusLink,
    required this.className,
    required this.testDay,
    required this.startDate,
    required this.endDate,
    required this.classTime,
    required this.classEndTime,
    required this.maxStudents,
    required this.studentCount,
    required this.totalDays,
    required this.status,
    required this.price,
    required this.sessionDates,
    required this.classDays,
    required this.students,
  });

  factory ClassModel.fromJson(Map<String, dynamic> json) {
    return ClassModel(
      classId: (json['classId'] as num?)?.toInt() ?? 0,
      teacherId: (json['teacherId'] as num?)?.toInt() ?? 0,
      teacherName: json['teacherName']?.toString() ?? '',
      majorId: (json['majorId'] as num?)?.toInt() ?? 0,
      majorName: json['majorName']?.toString() ?? '',
      levelId: (json['levelId'] as num?)?.toInt() ?? 0,
      levelName: json['levelName']?.toString() ?? '',
      syllabusLink: json['syllabusLink']?.toString() ?? '',
      className: json['className']?.toString() ?? '',
      testDay: json['testDay']?.toString() ?? '',
      startDate: json['startDate']?.toString() ?? '',
      endDate: json['endDate']?.toString() ?? '',
      classTime: json['classTime']?.toString() ?? '',
      classEndTime: json['classEndTime']?.toString() ?? '',
      maxStudents: (json['maxStudents'] as num?)?.toInt() ?? 0,
      studentCount: (json['studentCount'] as num?)?.toInt() ?? 0,
      totalDays: (json['totalDays'] as num?)?.toInt() ?? 0,
      status: (json['status'] as num?)?.toInt() ?? 0,
      price: (json['price'] as num?)?.toInt() ?? 0,
      sessionDates: (json['sessionDates'] as List?)
              ?.map((e) => e?.toString() ?? '')
              .toList() ??
          [],
      classDays: (json['classDays'] as List?)
              ?.map((day) => ClassDay.fromJson(day))
              .toList() ??
          [],
      students: (json['students'] as List?)
              ?.map((student) => Student.fromJson(student))
              .toList() ??
          [],
    );
  }
}

class ClassDay {
  final String day;

  ClassDay({required this.day});

  factory ClassDay.fromJson(Map<String, dynamic> json) {
    return ClassDay(day: json['day']);
  }
}

class Student {
  final int learnerId;
  final String fullName;
  final String email;
  final String phoneNumber;
  final String avatar;
  bool isEligible;

  Student({
    required this.learnerId,
    required this.fullName,
    required this.email,
    required this.phoneNumber,
    required this.avatar,
    required this.isEligible,
  });

  factory Student.fromJson(Map<String, dynamic> json) {
    return Student(
      learnerId: (json['learnerId'] as num?)?.toInt() ?? 0,
      fullName: json['fullName']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      phoneNumber: json['phoneNumber']?.toString() ?? '',
      avatar: json['avatar']?.toString() ?? '',
      isEligible: json['isEligible'] ?? false,
    );
  }
}
