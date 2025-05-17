import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/course_package.dart';
import '../models/course_progress.dart';
import '../models/course_content_progress.dart';
import 'package:shared_preferences/shared_preferences.dart';

class CourseService {
  static const String baseUrl =
      'https://instrulearnapplication.azurewebsites.net/api';

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
                  coursePackageId: item['coursePackageId'],
                  typeName: coursePackage['courseTypeName'] ?? '',
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

  Future<List<CourseProgress>> getCourseProgress(int learnerId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token == null) {
        throw Exception('Vui lòng đăng nhập lại');
      }

      final response = await http.get(
        Uri.parse('$baseUrl/CourseProgress/learner/$learnerId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> jsonResponse = json.decode(response.body);

        if (jsonResponse['isSucceed'] == true && jsonResponse['data'] != null) {
          final List<dynamic> progressList = jsonResponse['data'];
          return progressList
              .map((json) => CourseProgress.fromJson(json))
              .toList();
        } else {
          return [];
        }
      } else if (response.statusCode == 401) {
        throw Exception('Phiên đăng nhập đã hết hạn');
      } else {
        throw Exception('Không thể tải tiến độ khóa học');
      }
    } catch (e) {
      throw Exception('Lỗi khi tải tiến độ khóa học: $e');
    }
  }

  Future<CourseContentProgress?> getCourseContentProgress(
      int learnerId, int coursePackageId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token == null) {
        throw Exception('Vui lòng đăng nhập lại');
      }

      final response = await http.get(
        Uri.parse(
            '$baseUrl/CourseProgress/all-course-packages/$learnerId/$coursePackageId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> jsonResponse = json.decode(response.body);

        if (jsonResponse['isSucceed'] == true && jsonResponse['data'] != null) {
          return CourseContentProgress.fromJson(jsonResponse['data']);
        }
      } else if (response.statusCode == 401) {
        throw Exception('Phiên đăng nhập đã hết hạn');
      }
      return null;
    } catch (e) {
      throw Exception('Lỗi khi tải tiến độ chi tiết: $e');
    }
  }

  Future<bool> updateVideoDuration(
      int learnerId, int itemId, int totalDuration) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token == null) {
        throw Exception('Vui lòng đăng nhập lại');
      }

      final response = await http.post(
        Uri.parse('$baseUrl/CourseProgress/update-video-duration'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: json.encode({
          'learnerId': learnerId,
          'itemId': itemId,
          'totalDuration': totalDuration,
        }),
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> jsonResponse = json.decode(response.body);
        return jsonResponse['isSucceed'] == true;
      }
      return false;
    } catch (e) {
      print('Lỗi khi cập nhật thời lượng video: $e');
      return false;
    }
  }

  Future<bool> updateVideoWatchTime(
      int learnerId, int itemId, int watchTimeInSeconds) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token == null) {
        throw Exception('Vui lòng đăng nhập lại');
      }

      final response = await http.post(
        Uri.parse('$baseUrl/CourseProgress/update-video-watchtime'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: json.encode({
          'learnerId': learnerId,
          'itemId': itemId,
          'watchTimeInSeconds': watchTimeInSeconds,
        }),
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> jsonResponse = json.decode(response.body);
        return jsonResponse['isSucceed'] == true;
      }
      return false;
    } catch (e) {
      print('Lỗi khi cập nhật thời gian xem video: $e');
      return false;
    }
  }

  Future<bool> updateContentItemProgress(int learnerId, int itemId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token == null) {
        throw Exception('Vui lòng đăng nhập lại');
      }

      final uri =
          Uri.parse('$baseUrl/CourseProgress/update-content-item').replace(
        queryParameters: {
          'learnerId': learnerId.toString(),
          'itemId': itemId.toString(),
        },
      );

      final response = await http.post(
        uri,
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> jsonResponse = json.decode(response.body);
        return jsonResponse['isSucceed'] == true;
      }
      return false;
    } catch (e) {
      print('Lỗi khi cập nhật tiến độ học tập: $e');
      return false;
    }
  }
}
