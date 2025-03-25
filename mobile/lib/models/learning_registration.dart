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
  final String startDay;
  final String timeStart;
  final int timeLearning;
  final String timeEnd;
  final String requestDate;
  final int numberOfSession;
  final String videoUrl;
  final String? learningRequest;
  final int? score;
  final String? levelAssigned;
  final String? feedback;
  final List<String> learningDays;
  final double? price;
  final String status;

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
    required this.startDay,
    required this.timeStart,
    required this.timeLearning,
    required this.timeEnd,
    required this.requestDate,
    required this.numberOfSession,
    required this.videoUrl,
    this.learningRequest,
    this.score,
    this.levelAssigned,
    this.feedback,
    required this.learningDays,
    this.price,
    required this.status,
  });

  factory LearningRegistration.fromJson(Map<String, dynamic> json) {
    return LearningRegistration(
      learningRegisId: json['learningRegisId'] as int,
      learnerId: json['learnerId'] as int,
      fullName: json['fullName'] as String,
      phoneNumber: json['phoneNumber'] as String,
      teacherId: json['teacherId'] as int,
      teacherName: json['teacherName'] as String,
      regisTypeId: json['regisTypeId'] as int,
      regisTypeName: json['regisTypeName'] as String,
      majorId: json['majorId'] as int,
      majorName: json['majorName'] as String,
      startDay: json['startDay'] as String,
      timeStart: json['timeStart'] as String,
      timeLearning: json['timeLearning'] as int,
      timeEnd: json['timeEnd'] as String,
      requestDate: json['requestDate'] as String,
      numberOfSession: json['numberOfSession'] as int,
      videoUrl: json['videoUrl'] as String,
      learningRequest: json['learningRequest'] as String?,
      score: json['score'] as int?,
      levelAssigned: json['levelAssigned'] as String?,
      feedback: json['feedback'] as String?,
      learningDays: List<String>.from(json['learningDays']),
      price: json['price'] == null ? null : (json['price'] as num).toDouble(),
      status: json['status'] as String,
    );
  }
}
