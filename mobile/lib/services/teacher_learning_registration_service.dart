import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/teacher_learning_registration.dart';

class TeacherLearningRegistrationService {
  Future<List<TeacherLearningRegistration>> getRegistrationsByTeacherId(
      int teacherId) async {
    try {
      final response = await http.get(
        Uri.parse(
            'https://instrulearnapplication.azurewebsites.net/api/LearningRegis/LearningRegis/$teacherId'),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['isSucceed'] == true) {
          final List<dynamic> registrationsJson = data['data'];
          return registrationsJson
              .map((json) => TeacherLearningRegistration.fromJson(json))
              .toList();
        } else {
          throw Exception(data['message'] ?? 'Không thể tải danh sách đăng ký');
        }
      } else {
        throw Exception('Lỗi kết nối: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Lỗi: ${e.toString()}');
    }
  }
}
