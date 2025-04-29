class CourseContentProgress {
  final int coursePackageId;
  final String courseName;
  final int totalContents;
  final int totalContentItems;
  final double overallProgressPercentage;
  final List<ContentProgress> contents;

  CourseContentProgress({
    required this.coursePackageId,
    required this.courseName,
    required this.totalContents,
    required this.totalContentItems,
    required this.overallProgressPercentage,
    required this.contents,
  });

  factory CourseContentProgress.fromJson(Map<String, dynamic> json) {
    return CourseContentProgress(
      coursePackageId: json['coursePackageId'] ?? 0,
      courseName: json['courseName'] ?? '',
      totalContents: json['totalContents'] ?? 0,
      totalContentItems: json['totalContentItems'] ?? 0,
      overallProgressPercentage:
          (json['overallProgressPercentage'] ?? 0).toDouble(),
      contents: (json['contents'] as List<dynamic>?)
              ?.map((x) => ContentProgress.fromJson(x))
              .toList() ??
          [],
    );
  }
}

class ContentProgress {
  final int contentId;
  final String heading;
  final int totalContentItems;
  final List<ContentItemProgress> contentItems;

  ContentProgress({
    required this.contentId,
    required this.heading,
    required this.totalContentItems,
    required this.contentItems,
  });

  factory ContentProgress.fromJson(Map<String, dynamic> json) {
    return ContentProgress(
      contentId: json['contentId'] ?? 0,
      heading: json['heading'] ?? '',
      totalContentItems: json['totalContentItems'] ?? 0,
      contentItems: (json['contentItems'] as List<dynamic>?)
              ?.map((x) => ContentItemProgress.fromJson(x))
              .toList() ??
          [],
    );
  }
}

class ContentItemProgress {
  final int itemId;
  final String itemDes;
  final int itemTypeId;
  final String itemTypeName;
  final bool isLearned;
  final int? durationInSeconds;
  final int watchTimeInSeconds;
  final double completionPercentage;
  final DateTime? lastAccessDate;

  ContentItemProgress({
    required this.itemId,
    required this.itemDes,
    required this.itemTypeId,
    required this.itemTypeName,
    required this.isLearned,
    this.durationInSeconds,
    required this.watchTimeInSeconds,
    required this.completionPercentage,
    this.lastAccessDate,
  });

  factory ContentItemProgress.fromJson(Map<String, dynamic> json) {
    return ContentItemProgress(
      itemId: json['itemId'] ?? 0,
      itemDes: json['itemDes'] ?? '',
      itemTypeId: json['itemTypeId'] ?? 0,
      itemTypeName: json['itemTypeName'] ?? '',
      isLearned: json['isLearned'] ?? false,
      durationInSeconds: json['durationInSeconds'],
      watchTimeInSeconds: json['watchTimeInSeconds'] ?? 0,
      completionPercentage: (json['completionPercentage'] ?? 0).toDouble(),
      lastAccessDate: json['lastAccessDate'] != null
          ? DateTime.parse(json['lastAccessDate'])
          : null,
    );
  }
}
