import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/learning_registration.dart';

class LearningRegistrationService {
  static const String baseUrl =
      'https://instrulearnapplication-h4dvbdgef2eaeufy.southeastasia-01.azurewebsites.net/api';

  Future<List<LearningRegistration>> getRegistrationsByLearnerId(
      int learnerId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/LearningRegis/status/$learnerId'),
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> jsonResponse = json.decode(response.body);

        if (jsonResponse['isSucceed'] == true) {
          final List<dynamic> data = jsonResponse['data'];
          return data
              .map((json) => LearningRegistration.fromJson(json))
              .toList();
        } else {
          throw Exception(jsonResponse['message']);
        }
      } else {
        throw Exception('Failed to load registrations');
      }
    } catch (e) {
      throw Exception('Error fetching registrations: $e');
    }
  }
}
