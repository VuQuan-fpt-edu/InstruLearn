class TeacherLearningRegistration {
  final int learningRegisId;
  final int learnerId;
  final String fullName;
  final String phoneNumber;
  final int teacherId;
  final String teacherName;
  final int regisTypeId;
  final String regisTypeName;
  final int majorId;
  final String majorName;
  final int responseTypeId;
  final String responseTypeName;
  final int responseId;
  final String responseDescription;
  final int levelId;
  final String levelName;
  final int levelPrice;
  final String syllabusLink;
  final String startDay;
  final String timeStart;
  final int timeLearning;
  final String timeEnd;
  final String requestDate;
  final int numberOfSession;
  final String videoUrl;
  final String learningRequest;
  final List<String> learningDays;
  final int price;
  final int? remainingAmount;
  final String status;
  final String? acceptedDate;
  final String? paymentDeadline;
  final int? daysRemaining;
  final String paymentStatus;

  TeacherLearningRegistration({
    required this.learningRegisId,
    required this.learnerId,
    required this.fullName,
    required this.phoneNumber,
    required this.teacherId,
    required this.teacherName,
    required this.regisTypeId,
    required this.regisTypeName,
    required this.majorId,
    required this.majorName,
    required this.responseTypeId,
    required this.responseTypeName,
    required this.responseId,
    required this.responseDescription,
    required this.levelId,
    required this.levelName,
    required this.levelPrice,
    required this.syllabusLink,
    required this.startDay,
    required this.timeStart,
    required this.timeLearning,
    required this.timeEnd,
    required this.requestDate,
    required this.numberOfSession,
    required this.videoUrl,
    required this.learningRequest,
    required this.learningDays,
    required this.price,
    this.remainingAmount,
    required this.status,
    this.acceptedDate,
    this.paymentDeadline,
    this.daysRemaining,
    required this.paymentStatus,
  });

  factory TeacherLearningRegistration.fromJson(Map<String, dynamic> json) {
    return TeacherLearningRegistration(
      learningRegisId: _parseIntValue(json['learningRegisId']),
      learnerId: _parseIntValue(json['learnerId']),
      fullName: json['fullName'],
      phoneNumber: json['phoneNumber'],
      teacherId: _parseIntValue(json['teacherId']),
      teacherName: json['teacherName'],
      regisTypeId: _parseIntValue(json['regisTypeId']),
      regisTypeName: json['regisTypeName'],
      majorId: _parseIntValue(json['majorId']),
      majorName: json['majorName'],
      responseTypeId: _parseIntValue(json['responseTypeId']),
      responseTypeName: json['responseTypeName'],
      responseId: _parseIntValue(json['responseId']),
      responseDescription: json['responseDescription'],
      levelId: _parseIntValue(json['levelId']),
      levelName: json['levelName'],
      levelPrice: _parseIntValue(json['levelPrice']),
      syllabusLink: json['syllabusLink'],
      startDay: json['startDay'],
      timeStart: json['timeStart'],
      timeLearning: _parseIntValue(json['timeLearning']),
      timeEnd: json['timeEnd'],
      requestDate: json['requestDate'],
      numberOfSession: _parseIntValue(json['numberOfSession']),
      videoUrl: json['videoUrl'],
      learningRequest: json['learningRequest'],
      learningDays: List<String>.from(json['learningDays']),
      price: _parseIntValue(json['price']),
      remainingAmount: json['remainingAmount'] != null
          ? _parseIntValue(json['remainingAmount'])
          : null,
      status: json['status'],
      acceptedDate: json['acceptedDate'],
      paymentDeadline: json['paymentDeadline'],
      daysRemaining: json['daysRemaining'] != null
          ? _parseIntValue(json['daysRemaining'])
          : null,
      paymentStatus: json['paymentStatus'],
    );
  }

  static int _parseIntValue(dynamic value) {
    if (value is int) return value;
    if (value is double) return value.toInt();
    if (value is String) {
      try {
        return int.parse(value);
      } catch (e) {
        try {
          return double.parse(value).toInt();
        } catch (e) {
          return 0; // Giá trị mặc định nếu không thể chuyển đổi
        }
      }
    }
    return 0; // Giá trị mặc định cho các trường hợp khác
  }
}
