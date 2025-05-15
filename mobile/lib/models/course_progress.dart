class CourseProgress {
  final int learnerCourseId;
  final int learnerId;
  final String learnerName;
  final int coursePackageId;
  final String courseName;
  final double completionPercentage;
  final DateTime enrollmentDate;
  final DateTime lastAccessDate;
  final int totalContentItems;

  CourseProgress({
    required this.learnerCourseId,
    required this.learnerId,
    required this.learnerName,
    required this.coursePackageId,
    required this.courseName,
    required this.completionPercentage,
    required this.enrollmentDate,
    required this.lastAccessDate,
    required this.totalContentItems,
  });

  factory CourseProgress.fromJson(Map<String, dynamic> json) {
    return CourseProgress(
      learnerCourseId: json['learnerCourseId'] ?? 0,
      learnerId: json['learnerId'] ?? 0,
      learnerName: json['learnerName'] ?? '',
      coursePackageId: json['coursePackageId'] ?? 0,
      courseName: json['courseName'] ?? '',
      completionPercentage: (json['completionPercentage'] ?? 0).toDouble(),
      enrollmentDate: DateTime.parse(json['enrollmentDate'] ?? ''),
      lastAccessDate: DateTime.parse(json['lastAccessDate'] ?? ''),
      totalContentItems: json['totalContentItems'] ?? 0,
    );
  }
}
