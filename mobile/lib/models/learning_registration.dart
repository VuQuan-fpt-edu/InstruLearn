class LearningRegistration {
  final int? learningRegisId;
  final int? learnerId;
  final String? fullName;
  final String? phoneNumber;
  final int? teacherId;
  final String? teacherName;
  final int? regisTypeId;
  final String? regisTypeName;
  final int? majorId;
  final String? majorName;
  final int? responseId;
  final String? responseName;
  final String? responseDescription;
  final int? levelId;
  final String? levelName;
  final int? levelPrice;
  final String? syllabusLink;
  final String? startDay;
  final String? timeStart;
  final int? timeLearning;
  final String? timeEnd;
  final String? requestDate;
  final int? numberOfSession;
  final String? videoUrl;
  final String? learningRequest;
  final List<String>? learningDays;
  final int? price;
  final String? status;
  final int? score;
  final String? levelAssigned;
  final String? feedback;
  final int? remainingAmount;
  final String? acceptedDate;
  final String? paymentDeadline;
  final int? daysRemaining;
  final String? paymentStatus;
  final String? previousStatus;
  final Map<String, dynamic>? firstPaymentPeriod;
  final Map<String, dynamic>? secondPaymentPeriod;

  LearningRegistration({
    this.learningRegisId,
    this.learnerId,
    this.fullName,
    this.phoneNumber,
    this.teacherId,
    this.teacherName,
    this.regisTypeId,
    this.regisTypeName,
    this.majorId,
    this.majorName,
    this.responseId,
    this.responseName,
    this.responseDescription,
    this.levelId,
    this.levelName,
    this.levelPrice,
    this.syllabusLink,
    this.startDay,
    this.timeStart,
    this.timeLearning,
    this.timeEnd,
    this.requestDate,
    this.numberOfSession,
    this.videoUrl,
    this.learningRequest,
    this.learningDays,
    this.price,
    this.status,
    this.score,
    this.levelAssigned,
    this.feedback,
    this.remainingAmount,
    this.acceptedDate,
    this.paymentDeadline,
    this.daysRemaining,
    this.paymentStatus,
    this.previousStatus,
    this.firstPaymentPeriod,
    this.secondPaymentPeriod,
  });

  factory LearningRegistration.fromJson(Map<String, dynamic> json) {
    return LearningRegistration(
      learningRegisId:
          _parseIntValue(json['LearningRegisId'] ?? json['learningRegisId']),
      learnerId: _parseIntValue(json['LearnerId'] ?? json['learnerId']),
      fullName: json['FullName'] ?? json['fullName'] as String?,
      phoneNumber: json['PhoneNumber'] ?? json['phoneNumber'] as String?,
      teacherId: _parseIntValue(json['TeacherId'] ?? json['teacherId']),
      teacherName: json['TeacherName'] ?? json['teacherName'] as String?,
      regisTypeId: _parseIntValue(json['RegisTypeId'] ?? json['regisTypeId']),
      regisTypeName: json['RegisTypeName'] ?? json['regisTypeName'] as String?,
      majorId: _parseIntValue(json['MajorId'] ?? json['majorId']),
      majorName: json['MajorName'] ?? json['majorName'] as String?,
      responseId: (json['ResponseId'] ?? json['responseId']) != null
          ? _parseIntValue(json['ResponseId'] ?? json['responseId'])
          : null,
      responseName: json['ResponseTypeName'] ?? json['responseName'] as String?,
      responseDescription:
          json['ResponseDescription'] ?? json['responseDescription'] as String?,
      levelId: (json['LevelId'] ?? json['levelId']) != null
          ? _parseIntValue(json['LevelId'] ?? json['levelId'])
          : null,
      levelName: json['LevelName'] ?? json['levelName'] as String?,
      levelPrice: (json['LevelPrice'] ?? json['levelPrice']) != null
          ? _parseIntValue(json['LevelPrice'] ?? json['levelPrice'])
          : null,
      syllabusLink: json['SyllabusLink'] ?? json['syllabusLink'] as String?,
      startDay: json['StartDay'] ?? json['startDay'] as String?,
      timeStart: json['TimeStart'] ?? json['timeStart'] as String?,
      timeLearning:
          _parseIntValue(json['TimeLearning'] ?? json['timeLearning']),
      timeEnd: json['TimeEnd'] ?? json['timeEnd'] as String?,
      requestDate: json['RequestDate'] ?? json['requestDate'] as String?,
      numberOfSession:
          _parseIntValue(json['NumberOfSession'] ?? json['numberOfSession']),
      videoUrl: json['VideoUrl'] ?? json['videoUrl'] as String?,
      learningRequest:
          json['LearningRequest'] ?? json['learningRequest'] as String?,
      learningDays: (json['LearningDays'] ?? json['learningDays']) != null
          ? List<String>.from(json['LearningDays'] ?? json['learningDays'])
          : null,
      price: (json['Price'] ?? json['price']) != null
          ? _parseIntValue(json['Price'] ?? json['price'])
          : null,
      status: json['Status'] ?? json['status'] as String?,
      score: (json['Score'] ?? json['score']) != null
          ? _parseIntValue(json['Score'] ?? json['score'])
          : null,
      levelAssigned: json['LevelAssigned'] ?? json['levelAssigned'] as String?,
      feedback: json['Feedback'] ?? json['feedback'] as String?,
      remainingAmount: (json['RemainingAmount'] ?? json['remainingAmount']) !=
              null
          ? _parseIntValue(json['RemainingAmount'] ?? json['remainingAmount'])
          : null,
      acceptedDate: json['AcceptedDate'] ?? json['acceptedDate'] as String?,
      paymentDeadline:
          json['PaymentDeadline'] ?? json['paymentDeadline'] as String?,
      daysRemaining: (json['DaysRemaining'] ?? json['daysRemaining']) != null
          ? _parseIntValue(json['DaysRemaining'] ?? json['daysRemaining'])
          : null,
      paymentStatus: json['PaymentStatus'] ?? json['paymentStatus'] as String?,
      previousStatus:
          json['PreviousStatus'] ?? json['previousStatus'] as String?,
      firstPaymentPeriod: (json['firstPaymentPeriod'] ??
          json['FirstPaymentPeriod']) as Map<String, dynamic>?,
      secondPaymentPeriod: (json['secondPaymentPeriod'] ??
          json['SecondPaymentPeriod']) as Map<String, dynamic>?,
    );
  }

  static int? _parseIntValue(dynamic value) {
    if (value == null) return null;
    if (value is int) return value;
    if (value is double) return value.toInt();
    if (value is String) {
      try {
        return int.parse(value);
      } catch (e) {
        try {
          return double.parse(value).toInt();
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  }
}
