import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class AuthService {
  static const String baseUrl =
      'https://instrulearnapplication2025-h7hfdte3etdth7av.southeastasia-01.azurewebsites.net/api';

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  static Future<String?> getRefreshToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('refreshToken');
  }

  static Future<bool> isLoggedIn() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }

  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('refreshToken');
  }

  static Future<Map<String, String>> getAuthHeaders() async {
    final token = await getToken();
    return {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer $token',
    };
  }

  static Future<http.Response> authorizedGet(String endpoint) async {
    final headers = await getAuthHeaders();
    return http.get(Uri.parse('$baseUrl/$endpoint'), headers: headers);
  }

  static Future<http.Response> authorizedPost(
    String endpoint,
    dynamic body,
  ) async {
    final headers = await getAuthHeaders();
    return http.post(
      Uri.parse('$baseUrl/$endpoint'),
      headers: headers,
      body: jsonEncode(body),
    );
  }

  static Future<http.Response> authorizedPut(
    String endpoint,
    dynamic body,
  ) async {
    final headers = await getAuthHeaders();
    return http.put(
      Uri.parse('$baseUrl/$endpoint'),
      headers: headers,
      body: jsonEncode(body),
    );
  }

  static Future<http.Response> authorizedDelete(String endpoint) async {
    final headers = await getAuthHeaders();
    return http.delete(Uri.parse('$baseUrl/$endpoint'), headers: headers);
  }

  static Future<bool> refreshAuthToken() async {
    try {
      final refreshToken = await getRefreshToken();
      if (refreshToken == null) return false;

      final response = await http.post(
        Uri.parse('$baseUrl/Auth/RefreshToken'),
        headers: {'Content-Type': 'application/json; charset=UTF-8'},
        body: jsonEncode({'refreshToken': refreshToken}),
      );

      if (response.statusCode == 200) {
        final responseData = json.decode(response.body);
        if (responseData['isSucceed'] == true) {
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('token', responseData['data']['token']);
          await prefs.setString(
            'refreshToken',
            responseData['data']['refreshToken'],
          );
          return true;
        }
      }
      return false;
    } catch (e) {
      return false;
    }
  }
}
