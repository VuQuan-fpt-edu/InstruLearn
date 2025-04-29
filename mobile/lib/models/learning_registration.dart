class LearningRegistration {
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
  final int? responseId;
  final String? responseName;
  final int? levelId;
  final String? levelName;
  final int? levelPrice;
  final String startDay;
  final String timeStart;
  final int timeLearning;
  final String timeEnd;
  final String requestDate;
  final int numberOfSession;
  final String videoUrl;
  final String? learningRequest;
  final List<String> learningDays;
  final int? price;
  final String status;
  final int? score;
  final String? levelAssigned;
  final String? feedback;
  final int? remainingAmount;
  final String? acceptedDate;
  final String? paymentDeadline;
  final int? daysRemaining;

  LearningRegistration({
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
    this.responseId,
    this.responseName,
    this.levelId,
    this.levelName,
    this.levelPrice,
    required this.startDay,
    required this.timeStart,
    required this.timeLearning,
    required this.timeEnd,
    required this.requestDate,
    required this.numberOfSession,
    required this.videoUrl,
    this.learningRequest,
    required this.learningDays,
    this.price,
    required this.status,
    this.score,
    this.levelAssigned,
    this.feedback,
    this.remainingAmount,
    this.acceptedDate,
    this.paymentDeadline,
    this.daysRemaining,
  });

  factory LearningRegistration.fromJson(Map<String, dynamic> json) {
    return LearningRegistration(
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
      responseId: json['responseId'] != null
          ? _parseIntValue(json['responseId'])
          : null,
      responseName: json['responseName'],
      levelId: json['levelId'] != null ? _parseIntValue(json['levelId']) : null,
      levelName: json['levelName'],
      levelPrice: json['levelPrice'] != null
          ? _parseIntValue(json['levelPrice'])
          : null,
      startDay: json['startDay'],
      timeStart: json['timeStart'],
      timeLearning: _parseIntValue(json['timeLearning']),
      timeEnd: json['timeEnd'],
      requestDate: json['requestDate'],
      numberOfSession: _parseIntValue(json['numberOfSession']),
      videoUrl: json['videoUrl'],
      learningRequest: json['learningRequest'],
      learningDays: List<String>.from(json['learningDays']),
      price: json['price'] != null ? _parseIntValue(json['price']) : null,
      status: json['status'],
      score: json['score'] != null ? _parseIntValue(json['score']) : null,
      levelAssigned: json['levelAssigned'],
      feedback: json['feedback'],
      remainingAmount: json['remainingAmount'] != null
          ? _parseIntValue(json['remainingAmount'])
          : null,
      acceptedDate: json['acceptedDate'],
      paymentDeadline: json['paymentDeadline'],
      daysRemaining: json['daysRemaining'] != null
          ? _parseIntValue(json['daysRemaining'])
          : null,
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
