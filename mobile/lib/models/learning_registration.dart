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
  final String? startDay;
  final String timeStart;
  final String timeEnd;
  final String requestDate;
  final int numberOfSession;
  final String videoUrl;
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
    this.startDay,
    required this.timeStart,
    required this.timeEnd,
    required this.requestDate,
    required this.numberOfSession,
    required this.videoUrl,
    this.score,
    this.levelAssigned,
    this.feedback,
    required this.learningDays,
    this.price,
    required this.status,
  });

  factory LearningRegistration.fromJson(Map<String, dynamic> json) {
    return LearningRegistration(
      learningRegisId: json['learningRegisId'],
      learnerId: json['learnerId'],
      fullName: json['fullName'],
      phoneNumber: json['phoneNumber'],
      teacherId: json['teacherId'],
      teacherName: json['teacherName'],
      regisTypeId: json['regisTypeId'],
      regisTypeName: json['regisTypeName'],
      majorId: json['majorId'],
      majorName: json['majorName'],
      startDay: json['startDay'],
      timeStart: json['timeStart'],
      timeEnd: json['timeEnd'],
      requestDate: json['requestDate'],
      numberOfSession: json['numberOfSession'],
      videoUrl: json['videoUrl'],
      score: json['score'],
      levelAssigned: json['levelAssigned'],
      feedback: json['feedback'],
      learningDays: List<String>.from(json['learningDays']),
      price: json['price']?.toDouble(),
      status: json['status'],
    );
  }
}
