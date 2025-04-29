import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/learning_path_session.dart';

class LearningPathSessionService {
  static const String baseUrl =
      'https://instrulearnapplication.azurewebsites.net/api';

  Future<List<LearningPathSession>> getLearningPathSessions(
      int learningRegisId) async {
    try {
      final response = await http.get(
        Uri.parse(
            '$baseUrl/LearningPathSession/$learningRegisId/learning-path-sessions'),
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> jsonResponse = json.decode(response.body);

        if (jsonResponse['isSucceed'] == true) {
          final List<dynamic> data = jsonResponse['data'];
          return data
              .map((json) => LearningPathSession.fromJson(json))
              .toList();
        } else {
          throw Exception(jsonResponse['message']);
        }
      } else {
        throw Exception('Failed to load learning path sessions');
      }
    } catch (e) {
      throw Exception('Error fetching learning path sessions: $e');
    }
  }
}
