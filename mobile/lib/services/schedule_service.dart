import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/schedule.dart';

class ScheduleService {
  final String _baseUrl =
      'https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api';

  Future<List<Schedule>> getTeacherSchedules(int teacherId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token == null) {
        throw Exception('Không tìm thấy token');
      }

      final response = await http.get(
        Uri.parse(
          'https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Schedules/teacher/$teacherId/register',
        ),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['isSucceed'] == true) {
          return (data['data'] as List)
              .map((schedule) => Schedule.fromJson(schedule))
              .toList();
        } else {
          throw Exception(data['message'] ?? 'Không thể lấy lịch học');
        }
      } else {
        throw Exception('Lỗi kết nối: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Lỗi: $e');
    }
  }

  Future<List<Schedule>> getLearnerSchedules(int learnerId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token == null) {
        throw Exception('Không tìm thấy token');
      }

      final response = await http.get(
        Uri.parse(
          'https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api/Schedules/learner/$learnerId/schedules',
        ),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['isSucceed'] == true) {
          final List<dynamic> schedulesJson = data['data'];
          return schedulesJson.map((json) => Schedule.fromJson(json)).toList();
        } else {
          throw Exception(data['message'] ?? 'Không thể lấy lịch học');
        }
      } else {
        throw Exception('Lỗi kết nối: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Lỗi: $e');
    }
  }

  Future<bool> updateAttendance(int scheduleId, int status) async {
    final url = Uri.parse('$_baseUrl/Schedules/update-attendance/$scheduleId');
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');

    if (token == null) {
      throw Exception('Không tìm thấy token');
    }

    try {
      final response = await http.put(
        url,
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(status), // Send status as the request body
      );

      if (response.statusCode == 200 || response.statusCode == 204) {
        final responseBody = jsonDecode(response.body);
        return responseBody['isSucceed'] ?? false; // Check isSucceed field
      } else {
        print(
            'Failed to update attendance. Status code: ${response.statusCode}');
        print('Response body: ${response.body}');
        return false;
      }
    } catch (e) {
      print('Error updating attendance: $e');
      return false;
    }
  }
}
