import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/self_assessment.dart';

class SelfAssessmentService {
  Future<List<SelfAssessment>> getAllSelfAssessments() async {
    try {
      final response = await http.get(
        Uri.parse(
            'https://instrulearnapplication.azurewebsites.net/api/SelfAssessment/GetAll'),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['isSucceed'] == true) {
          final List<dynamic> assessments = data['data'];
          return assessments
              .map((json) => SelfAssessment.fromJson(json))
              .toList();
        }
      }
      return [];
    } catch (e) {
      print('Lỗi khi lấy danh sách đánh giá trình độ: $e');
      return [];
    }
  }
}
