class LearningPathSession {
  final int learningPathSessionId;
  final int learningRegisId;
  final int sessionNumber;
  final String title;
  final String description;
  final bool isCompleted;

  LearningPathSession({
    required this.learningPathSessionId,
    required this.learningRegisId,
    required this.sessionNumber,
    required this.title,
    required this.description,
    required this.isCompleted,
  });

  factory LearningPathSession.fromJson(Map<String, dynamic> json) {
    return LearningPathSession(
      learningPathSessionId: json['learningPathSessionId'],
      learningRegisId: json['learningRegisId'],
      sessionNumber: json['sessionNumber'],
      title: json['title'],
      description: json['description'],
      isCompleted: json['isCompleted'],
    );
  }
}
