import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/teacher.dart';

class TeacherService {
  static const String baseUrl =
      'https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api';

  Future<List<Teacher>> getAllTeachers() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token == null) {
        throw Exception('Vui lòng đăng nhập lại');
      }

      final response = await http.get(
        Uri.parse('$baseUrl/Teacher/get-all'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> jsonResponse = json.decode(response.body);
        List<Teacher> teachers = [];

        for (var item in jsonResponse) {
          if (item['isSucceed'] == true && item['data'] != null) {
            teachers.add(Teacher.fromJson(item['data']));
          }
        }

        return teachers;
      } else if (response.statusCode == 401) {
        throw Exception('Phiên đăng nhập đã hết hạn');
      } else {
        throw Exception('Không thể tải danh sách giáo viên');
      }
    } catch (e) {
      throw Exception('Lỗi khi tải danh sách giáo viên: $e');
    }
  }

  Future<Teacher?> getTeacherById(int teacherId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token == null) {
        throw Exception('Vui lòng đăng nhập lại');
      }

      final response = await http.get(
        Uri.parse('$baseUrl/Teacher/$teacherId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> jsonResponse = json.decode(response.body);
        if (jsonResponse['isSucceed'] == true && jsonResponse['data'] != null) {
          return Teacher.fromJson(jsonResponse['data']);
        }
        return null;
      } else if (response.statusCode == 401) {
        throw Exception('Phiên đăng nhập đã hết hạn');
      } else {
        throw Exception('Không thể tải thông tin giáo viên');
      }
    } catch (e) {
      throw Exception('Lỗi khi tải thông tin giáo viên: $e');
    }
  }
}
