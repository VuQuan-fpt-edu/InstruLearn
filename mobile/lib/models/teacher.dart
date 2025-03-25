class Major {
  final int majorId;
  final String majorName;

  Major({
    required this.majorId,
    required this.majorName,
  });

  factory Major.fromJson(Map<String, dynamic> json) {
    return Major(
      majorId: json['majorId'],
      majorName: json['majorName'],
    );
  }
}

class Teacher {
  final int teacherId;
  final String accountId;
  final String fullname;
  final String? heading;
  final String? details;
  final String? links;
  final String phoneNumber;
  final String gender;
  final String? address;
  final String avatar;
  final DateTime dateOfEmployment;
  final int isActive;
  final List<Major> majors;

  Teacher({
    required this.teacherId,
    required this.accountId,
    required this.fullname,
    this.heading,
    this.details,
    this.links,
    required this.phoneNumber,
    required this.gender,
    this.address,
    required this.avatar,
    required this.dateOfEmployment,
    required this.isActive,
    required this.majors,
  });

  factory Teacher.fromJson(Map<String, dynamic> json) {
    return Teacher(
      teacherId: json['teacherId'],
      accountId: json['accountId'],
      fullname: json['fullname'],
      heading: json['heading'],
      details: json['details'],
      links: json['links'],
      phoneNumber: json['phoneNumber'],
      gender: json['gender'],
      address: json['address'],
      avatar: json['avatar'],
      dateOfEmployment: DateTime.parse(json['dateOfEmployment']),
      isActive: json['isActive'],
      majors: (json['majors'] as List)
          .map((majorJson) => Major.fromJson(majorJson))
          .toList(),
    );
  }
}
