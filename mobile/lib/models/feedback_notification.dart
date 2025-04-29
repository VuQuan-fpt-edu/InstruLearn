class FeedbackNotification {
  final int feedbackId;
  final int learningRegisId;
  final int teacherId;
  final String teacherName;
  final int totalSessions;
  final int completedSessions;
  final double progressPercentage;
  final int totalPrice;
  final int remainingPayment;
  final String feedbackStatus;
  final String createdAt;
  final List<Question> questions;
  final String message;

  FeedbackNotification({
    required this.feedbackId,
    required this.learningRegisId,
    required this.teacherId,
    required this.teacherName,
    required this.totalSessions,
    required this.completedSessions,
    required this.progressPercentage,
    required this.totalPrice,
    required this.remainingPayment,
    required this.feedbackStatus,
    required this.createdAt,
    required this.questions,
    required this.message,
  });

  factory FeedbackNotification.fromJson(Map<String, dynamic> json) {
    return FeedbackNotification(
      feedbackId: json['feedbackId']?.toInt() ?? 0,
      learningRegisId: json['learningRegisId']?.toInt() ?? 0,
      teacherId: json['teacherId']?.toInt() ?? 0,
      teacherName: json['teacherName'] ?? '',
      totalSessions: json['totalSessions']?.toInt() ?? 0,
      completedSessions: json['completedSessions']?.toInt() ?? 0,
      progressPercentage: _parseDouble(json['progressPercentage']),
      totalPrice: json['totalPrice']?.toInt() ?? 0,
      remainingPayment: json['remainingPayment']?.toInt() ?? 0,
      feedbackStatus: json['feedbackStatus'] ?? '',
      createdAt: json['createdAt'] ?? '',
      questions: (json['questions'] as List?)
              ?.map((q) => Question.fromJson(q))
              .toList() ??
          [],
      message: json['message'] ?? '',
    );
  }

  static double _parseDouble(dynamic value) {
    if (value == null) return 0.0;
    if (value is int) return value.toDouble();
    if (value is double) return value;
    if (value is String) {
      try {
        return double.parse(value);
      } catch (e) {
        return 0.0;
      }
    }
    return 0.0;
  }
}

class Question {
  final int questionId;
  final String questionText;
  final int displayOrder;
  final bool isRequired;
  final bool isActive;
  final List<Option> options;

  Question({
    required this.questionId,
    required this.questionText,
    required this.displayOrder,
    required this.isRequired,
    required this.isActive,
    required this.options,
  });

  factory Question.fromJson(Map<String, dynamic> json) {
    return Question(
      questionId: json['questionId']?.toInt() ?? 0,
      questionText: json['questionText'] ?? '',
      displayOrder: json['displayOrder']?.toInt() ?? 0,
      isRequired: json['isRequired'] ?? false,
      isActive: json['isActive'] ?? false,
      options:
          (json['options'] as List?)?.map((o) => Option.fromJson(o)).toList() ??
              [],
    );
  }
}

class Option {
  final int optionId;
  final String optionText;
  final int questionId;

  Option({
    required this.optionId,
    required this.optionText,
    required this.questionId,
  });

  factory Option.fromJson(Map<String, dynamic> json) {
    return Option(
      optionId: json['optionId']?.toInt() ?? 0,
      optionText: json['optionText'] ?? '',
      questionId: json['questionId']?.toInt() ?? 0,
    );
  }
}
