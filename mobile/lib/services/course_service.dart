import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/course_package.dart';
import 'package:shared_preferences/shared_preferences.dart';

class CourseService {
  static const String baseUrl =
      'https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api';

  Future<List<CoursePackage>> getPurchasedCourses(int learnerId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token == null) {
        throw Exception('Vui lòng đăng nhập lại');
      }

      final response = await http.get(
        Uri.parse('$baseUrl/Purchase/by-learner/$learnerId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> jsonResponse = json.decode(response.body);

        if (jsonResponse['isSucceed'] == true && jsonResponse['data'] != null) {
          final List<dynamic> purchases = jsonResponse['data'];
          final List<CoursePackage> courses = [];

          for (var purchase in purchases) {
            final List<dynamic> purchaseItems = purchase['purchaseItems'] ?? [];
            for (var item in purchaseItems) {
              if (item['coursePackage'] != null) {
                final coursePackage = item['coursePackage'];
                courses.add(CoursePackage(
                  coursePackageId: coursePackage['coursePackageId'],
                  typeName: coursePackage['typeName'] ?? '',
                  courseName: coursePackage['courseName'] ?? '',
                  courseDescription: coursePackage['courseDescription'] ?? '',
                  headline: coursePackage['headline'] ?? '',
                  imageUrl: coursePackage['imageUrl'] ?? '',
                  courseContents: (coursePackage['courseContents']
                              as List<dynamic>?)
                          ?.map((content) => CourseContent(
                                contentId: content['contentId'] ?? 0,
                                coursePackageId:
                                    content['coursePackageId'] ?? 0,
                                heading: content['heading'] ?? '',
                                courseContentItems: (content[
                                                'courseContentItems']
                                            as List<dynamic>?)
                                        ?.map((item) => CourseContentItem(
                                              itemId: item['itemId'] ?? 0,
                                              itemTypeId:
                                                  item['itemTypeId'] ?? 0,
                                              contentId: item['contentId'] ?? 0,
                                              itemDes: item['itemDes'] ?? '',
                                            ))
                                        .toList() ??
                                    [],
                              ))
                          .toList() ??
                      [],
                  feedBacks: [],
                  qnAs: [],
                ));
              }
            }
          }
          return courses;
        } else {
          return [];
        }
      } else if (response.statusCode == 401) {
        throw Exception('Phiên đăng nhập đã hết hạn');
      } else {
        throw Exception('Không thể tải danh sách khóa học đã mua');
      }
    } catch (e) {
      throw Exception('Lỗi khi tải khóa học: $e');
    }
  }

  Future<List<CoursePackage>> getAllCourses() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/Course/get-all'),
      );

      if (response.statusCode == 200) {
        final List<dynamic> coursesJson = json.decode(response.body);
        return coursesJson.map((json) => CoursePackage.fromJson(json)).toList();
      } else {
        throw Exception('Không thể tải danh sách khóa học');
      }
    } catch (e) {
      throw Exception('Lỗi khi tải khóa học: $e');
    }
  }

  Future<CoursePackage?> getCourseDetails(int coursePackageId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token == null) {
        throw Exception('Vui lòng đăng nhập lại');
      }

      final response = await http.get(
        Uri.parse('$baseUrl/Course/$coursePackageId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> jsonResponse = json.decode(response.body);
        return CoursePackage.fromJson(jsonResponse);
      } else if (response.statusCode == 401) {
        print('Phiên đăng nhập đã hết hạn');
        return null;
      } else {
        print('Không thể tải thông tin khóa học có ID: $coursePackageId');
        return null;
      }
    } catch (e) {
      print('Lỗi khi tải thông tin khóa học: $e');
      return null;
    }
  }
}
