import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'teacher_service.dart';

class MajorService {
  static const String baseUrl =
      'https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api';

  Future<List<Major>> getAllMajors() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token == null) {
        throw Exception('Vui lòng đăng nhập lại');
      }

      final response = await http.get(
        Uri.parse('$baseUrl/Major/get-all'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> jsonResponse = json.decode(response.body);
        if (jsonResponse['isSucceed'] == true && jsonResponse['data'] != null) {
          final List<dynamic> majorsJson = jsonResponse['data'];
          return majorsJson.map((json) => Major.fromJson(json)).toList();
        }
        return [];
      } else if (response.statusCode == 401) {
        throw Exception('Phiên đăng nhập đã hết hạn');
      } else {
        throw Exception('Không thể tải danh sách chuyên ngành');
      }
    } catch (e) {
      throw Exception('Lỗi khi tải danh sách chuyên ngành: $e');
    }
  }

  Future<Major?> getMajorById(int majorId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token == null) {
        throw Exception('Vui lòng đăng nhập lại');
      }

      final response = await http.get(
        Uri.parse('$baseUrl/Major/$majorId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> jsonResponse = json.decode(response.body);
        if (jsonResponse['isSucceed'] == true && jsonResponse['data'] != null) {
          return Major.fromJson(jsonResponse['data']);
        }
        return null;
      } else if (response.statusCode == 401) {
        throw Exception('Phiên đăng nhập đã hết hạn');
      } else {
        throw Exception('Không thể tải thông tin chuyên ngành');
      }
    } catch (e) {
      throw Exception('Lỗi khi tải thông tin chuyên ngành: $e');
    }
  }
}
