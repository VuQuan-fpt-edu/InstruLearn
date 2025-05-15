class TeacherNotification {
  final int notificationId;
  final String title;
  final String message;
  final int learningRegisId;
  final int learnerId;
  final String learnerName;
  final DateTime createdAt;
  final int status;
  final int type;

  TeacherNotification({
    required this.notificationId,
    required this.title,
    required this.message,
    required this.learningRegisId,
    required this.learnerId,
    required this.learnerName,
    required this.createdAt,
    required this.status,
    required this.type,
  });

  factory TeacherNotification.fromJson(Map<String, dynamic> json) {
    return TeacherNotification(
      notificationId: json['notificationId'],
      title: json['title'],
      message: json['message'],
      learningRegisId: json['learningRegisId'],
      learnerId: json['learnerId'],
      learnerName: json['learnerName'],
      createdAt: DateTime.parse(json['createdAt']),
      status: json['status'],
      type: json['type'],
    );
  }
}
