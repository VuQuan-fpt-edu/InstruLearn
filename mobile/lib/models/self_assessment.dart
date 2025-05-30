class SelfAssessment {
  final int selfAssessmentId;
  final String description;

  SelfAssessment({
    required this.selfAssessmentId,
    required this.description,
  });

  factory SelfAssessment.fromJson(Map<String, dynamic> json) {
    return SelfAssessment(
      selfAssessmentId: json['selfAssessmentId'],
      description: json['description'],
    );
  }
}
