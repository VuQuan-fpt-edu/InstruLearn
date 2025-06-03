import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/schedule.dart';

class ScheduleService {
  final String _baseUrl =
      'https://instrulearnapplication.azurewebsites.net/api';

  Future<List<Schedule>> getTeacherSchedules(int teacherId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token == null) {
        throw Exception('Không tìm thấy token');
      }

      final response = await http.get(
        Uri.parse(
          'https://instrulearnapplication.azurewebsites.net/api/Schedules/teacher/$teacherId/register',
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
          'https://instrulearnapplication.azurewebsites.net/api/Schedules/learner/$learnerId/schedules',
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

  Future<bool> updateAttendance(int scheduleId, int status,
      {int preferenceStatus = 0}) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token == null) {
        throw Exception('Không tìm thấy token');
      }

      final response = await http.put(
        Uri.parse('$_baseUrl/Schedules/update-attendance/$scheduleId'),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer $token',
        },
        body: json.encode({
          'status': status,
          'preferenceStatus': preferenceStatus,
        }),
      );

      final data = json.decode(response.body);
      if (data['isSucceed'] == true) {
        return true;
      } else {
        throw Exception(data['message']);
      }
    } catch (e) {
      throw Exception(e.toString().replaceAll('Exception: ', ''));
    }
  }
}
