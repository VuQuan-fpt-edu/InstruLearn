class LearnerNotification {
  final String title;
  final String message;
  final String recipientEmail;
  final DateTime sentDate;
  final int notificationType;
  final int status;
  final int learningRegisId;
  final String? learningRequest;
  final int? amount;
  final DateTime? deadline;

  LearnerNotification({
    required this.title,
    required this.message,
    required this.recipientEmail,
    required this.sentDate,
    required this.notificationType,
    required this.status,
    required this.learningRegisId,
    this.learningRequest,
    this.amount,
    this.deadline,
  });

  factory LearnerNotification.fromJson(Map<String, dynamic> json) {
    return LearnerNotification(
      title: json['title'],
      message: json['message'],
      recipientEmail: json['recipientEmail'],
      sentDate: DateTime.parse(json['sentDate']),
      notificationType: json['notificationType'],
      status: json['status'],
      learningRegisId: json['learningRegisId'],
      learningRequest: json['learningRequest'],
      amount: json['amount'] != null
          ? (json['amount'] is int
              ? json['amount']
              : (json['amount'] is double
                  ? (json['amount'] as double).toInt()
                  : int.tryParse(json['amount'].toString())))
          : null,
      deadline:
          json['deadline'] != null ? DateTime.parse(json['deadline']) : null,
    );
  }
}
