class CoursePackage {
  final int? coursePackageId;
  final String typeName;
  final String courseName;
  final String courseDescription;
  final String headline;
  final double? price;
  final double? discount;
  final String imageUrl;
  final List<CourseContent> courseContents;
  final List<Feedback> feedBacks;
  final List<QnA> qnAs;

  CoursePackage({
    this.coursePackageId,
    required this.typeName,
    required this.courseName,
    required this.courseDescription,
    required this.headline,
    this.price,
    this.discount,
    required this.imageUrl,
    required this.courseContents,
    required this.feedBacks,
    required this.qnAs,
  });

  factory CoursePackage.fromJson(Map<String, dynamic> json) {
    return CoursePackage(
      coursePackageId: json['coursePackageId'],
      typeName: json['typeName'] ?? '',
      courseName: json['courseName'] ?? '',
      courseDescription: json['courseDescription'] ?? '',
      headline: json['headline'] ?? '',
      price: json['price']?.toDouble(),
      discount: json['discount']?.toDouble(),
      imageUrl: json['imageUrl'] ?? '',
      courseContents: (json['courseContents'] as List<dynamic>?)
              ?.map((x) => CourseContent.fromJson(x))
              .toList() ??
          [],
      feedBacks: (json['feedBacks'] as List?)
              ?.map((x) => Feedback.fromJson(x))
              .toList() ??
          [],
      qnAs: (json['qnAs'] as List?)?.map((x) => QnA.fromJson(x)).toList() ?? [],
    );
  }
}

class CourseContent {
  final int contentId;
  final int coursePackageId;
  final String title;
  final List<CourseContentItem> courseContentItems;

  CourseContent({
    required this.contentId,
    required this.coursePackageId,
    required this.title,
    required this.courseContentItems,
  });

  String? get videoUrl {
    final videoItem = courseContentItems.firstWhere(
      (item) => item.itemTypeId == 1,
      orElse: () => CourseContentItem(
        itemId: 0,
        itemTypeId: 0,
        contentId: 0,
        itemDes: '',
      ),
    );
    return videoItem.itemTypeId == 1 ? videoItem.itemDes : null;
  }

  factory CourseContent.fromJson(Map<String, dynamic> json) {
    return CourseContent(
      contentId: json['contentId'] ?? 0,
      coursePackageId: json['coursePackageId'] ?? 0,
      title: json['heading'] ?? '',
      courseContentItems: (json['courseContentItems'] as List<dynamic>?)
              ?.map((x) => CourseContentItem.fromJson(x))
              .toList() ??
          [],
    );
  }
}

class CourseContentItem {
  final int itemId;
  final int itemTypeId;
  final int contentId;
  final String itemDes;

  CourseContentItem({
    required this.itemId,
    required this.itemTypeId,
    required this.contentId,
    required this.itemDes,
  });

  factory CourseContentItem.fromJson(Map<String, dynamic> json) {
    return CourseContentItem(
      itemId: json['itemId'] ?? 0,
      itemTypeId: json['itemTypeId'] ?? 0,
      contentId: json['contentId'] ?? 0,
      itemDes: json['itemDes'] ?? '',
    );
  }
}

class Feedback {
  final int feedbackId;
  final int coursePackageId;
  final String accountId;
  final String email;
  final String role;
  final String feedbackContent;
  final double rating;
  final String createdAt;
  final List<FeedbackReply> replies;

  Feedback({
    required this.feedbackId,
    required this.coursePackageId,
    required this.accountId,
    required this.email,
    required this.role,
    required this.feedbackContent,
    required this.rating,
    required this.createdAt,
    required this.replies,
  });

  factory Feedback.fromJson(Map<String, dynamic> json) {
    return Feedback(
      feedbackId: json['feedbackId'],
      coursePackageId: json['coursePackageId'],
      accountId: json['accountId'],
      email: json['email'],
      role: json['role'],
      feedbackContent: json['feedbackContent'],
      rating: json['rating']?.toDouble() ?? 0.0,
      createdAt: json['createdAt'],
      replies: (json['replies'] as List?)
              ?.map((x) => FeedbackReply.fromJson(x))
              .toList() ??
          [],
    );
  }
}

class FeedbackReply {
  final int feedbackRepliesId;
  final int feedbackId;
  final String accountId;
  final String email;
  final String role;
  final String repliesContent;
  final String createdAt;

  FeedbackReply({
    required this.feedbackRepliesId,
    required this.feedbackId,
    required this.accountId,
    required this.email,
    required this.role,
    required this.repliesContent,
    required this.createdAt,
  });

  factory FeedbackReply.fromJson(Map<String, dynamic> json) {
    return FeedbackReply(
      feedbackRepliesId: json['feedbackRepliesId'],
      feedbackId: json['feedbackId'],
      accountId: json['accountId'],
      email: json['email'],
      role: json['role'],
      repliesContent: json['repliesContent'],
      createdAt: json['createdAt'],
    );
  }
}

class QnA {
  final int questionId;
  final int coursePackageId;
  final String accountId;
  final String email;
  final String role;
  final String title;
  final String questionContent;
  final String createdAt;
  final List<QnAReply> replies;

  QnA({
    required this.questionId,
    required this.coursePackageId,
    required this.accountId,
    required this.email,
    required this.role,
    required this.title,
    required this.questionContent,
    required this.createdAt,
    required this.replies,
  });

  factory QnA.fromJson(Map<String, dynamic> json) {
    return QnA(
      questionId: json['questionId'],
      coursePackageId: json['coursePackageId'],
      accountId: json['accountId'],
      email: json['email'],
      role: json['role'],
      title: json['title'],
      questionContent: json['questionContent'],
      createdAt: json['createdAt'],
      replies: (json['replies'] as List?)
              ?.map((x) => QnAReply.fromJson(x))
              .toList() ??
          [],
    );
  }
}

class QnAReply {
  final int replyId;
  final int questionId;
  final String accountId;
  final String email;
  final String role;
  final String qnAContent;
  final String createdAt;

  QnAReply({
    required this.replyId,
    required this.questionId,
    required this.accountId,
    required this.email,
    required this.role,
    required this.qnAContent,
    required this.createdAt,
  });

  factory QnAReply.fromJson(Map<String, dynamic> json) {
    return QnAReply(
      replyId: json['replyId'],
      questionId: json['questionId'],
      accountId: json['accountId'],
      email: json['email'],
      role: json['role'],
      qnAContent: json['qnAContent'],
      createdAt: json['createdAt'],
    );
  }
}
