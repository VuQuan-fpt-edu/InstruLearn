import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import '../auth/login_screen.dart';
import 'profile_screen.dart';
import '../service/buy_course_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Student App',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: const HomeScreen(),
    );
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String fullName = 'Loading...';
  String email = 'Loading...';
  String username = 'Loading...';
  bool isLoading = true;
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    _fetchUserProfile();
  }

  Future<void> _fetchUserProfile() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token == null) {
        _navigateToLogin();
        return;
      }

      final response = await http.get(
        Uri.parse(
          'https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Auth/Profile',
        ),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['isSucceed'] == true) {
          setState(() {
            fullName = data['data']['fullName'] ?? 'Không có thông tin';
            email = data['data']['email'] ?? 'Không có thông tin';
            username = data['data']['username'] ?? 'Không có thông tin';
            isLoading = false;
          });
        } else {
          setState(() {
            fullName = 'Không thể tải thông tin';
            email = 'Không thể tải thông tin';
            username = 'Không thể tải thông tin';
            isLoading = false;
          });
          _showErrorMessage(
            data['message'] ?? 'Không thể tải thông tin người dùng',
          );
        }
      } else if (response.statusCode == 401) {
        _showErrorMessage(
          'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
        );
        _logout();
      } else {
        setState(() {
          fullName = 'Không thể tải thông tin';
          email = 'Không thể tải thông tin';
          username = 'Không thể tải thông tin';
          isLoading = false;
        });
        _showErrorMessage('Lỗi kết nối: ${response.statusCode}');
      }
    } catch (e) {
      setState(() {
        fullName = 'Không thể tải thông tin';
        email = 'Không thể tải thông tin';
        username = 'Không thể tải thông tin';
        isLoading = false;
      });
      _showErrorMessage('Lỗi: ${e.toString()}');
    }
  }

  void _showErrorMessage(String message) {
    if (mounted) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(message)));
    }
  }

  void _navigateToLogin() {
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (context) => const LoginScreen()),
      (route) => false,
    );
  }

  void _navigateToBuyCourse() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const BuyCourseScreen()),
    );
  }

  Future<void> _logout() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('token');
      await prefs.remove('refreshToken');

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Đã đăng xuất thành công')),
        );
        _navigateToLogin();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi khi đăng xuất: ${e.toString()}')),
        );
        _navigateToLogin();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.only(
              top: 40,
              bottom: 20,
              left: 20,
              right: 20,
            ),
            decoration: const BoxDecoration(
              color: Color(0xFF8C9EFF),
              borderRadius: BorderRadius.only(
                bottomLeft: Radius.circular(25),
                bottomRight: Radius.circular(25),
              ),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: const [
                    Text(
                      'Nạp Tiền',
                      style: TextStyle(
                        color: Colors.black,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 70,
                      height: 70,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(15),
                      ),
                      child:
                          isLoading
                              ? const CircularProgressIndicator()
                              : Center(
                                child: Text(
                                  username.isNotEmpty
                                      ? username[0].toUpperCase()
                                      : 'U',
                                  style: const TextStyle(
                                    fontSize: 24,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                Text(
                  isLoading ? 'Loading...' : fullName,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 5),
                Text(
                  isLoading ? 'Loading...' : email,
                  style: const TextStyle(fontSize: 14),
                ),
                const SizedBox(height: 5),
                const Text(
                  'Số dư hiện tại trong ví:',
                  style: TextStyle(fontSize: 14),
                ),
                const Text(
                  '********** VND',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                ),

                const SizedBox(height: 20),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 15),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(25),
                  ),
                  child: Row(
                    children: const [
                      Expanded(
                        child: TextField(
                          decoration: InputDecoration(
                            hintText: 'Search For your Course........',
                            border: InputBorder.none,
                          ),
                        ),
                      ),
                      Icon(Icons.search),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Thêm hai nút lớn cho "Mua khóa học" và "Đăng ký lớp học"
          Padding(
            padding: const EdgeInsets.all(15.0),
            child: Row(
              children: [
                Expanded(
                  child: _buildFeatureButton(
                    title: 'Mua khóa học',
                    icon: Icons.school,
                    onTap: _navigateToBuyCourse,
                    color: Colors.blue[700]!,
                  ),
                ),
                const SizedBox(width: 15),
                Expanded(
                  child: _buildFeatureButton(
                    title: 'Đăng ký lớp học',
                    icon: Icons.class_outlined,
                    color: Colors.green[700]!,
                  ),
                ),
              ],
            ),
          ),

          Expanded(
            child: GridView.count(
              padding: const EdgeInsets.all(20),
              crossAxisCount: 3,
              mainAxisSpacing: 15,
              crossAxisSpacing: 15,
              children: [
                _buildMenuItem(
                  context: context,
                  title: 'Schedule',
                  icon: Icons.calendar_today,
                ),
                _buildMenuItem(
                  context: context,
                  title: 'Library',
                  icon: Icons.book,
                ),
                _buildMenuItem(
                  context: context,
                  title: 'Application',
                  icon: Icons.app_registration,
                ),
                _buildMenuItem(
                  context: context,
                  title: 'Notification',
                  icon: Icons.notifications,
                ),
                _buildMenuItem(
                  context: context,
                  title: 'Mark Report',
                  icon: Icons.assessment,
                ),
                _buildMenuItem(
                  context: context,
                  title: 'đăng ký học kèm',
                  icon: Icons.class_,
                ),
                _buildMenuItem(
                  context: context,
                  title: 'Lịch sử đơn học',
                  icon: Icons.history,
                ),
                _buildMenuItem(
                  context: context,
                  title: 'Ví',
                  icon: Icons.account_balance_wallet,
                ),
                _buildMenuItem(
                  context: context,
                  title: 'Logout',
                  icon: Icons.logout,
                  onTap: () => _logout(),
                ),
              ],
            ),
          ),
        ],
      ),

      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        selectedItemColor: Colors.blue[800],
        unselectedItemColor: Colors.grey,
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });

          if (index == 1) {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const ProfileScreen()),
            ).then((_) {
              setState(() {
                _currentIndex = 0;
              });
            });
          }
        },
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
          BottomNavigationBarItem(
            icon: Icon(Icons.support_agent),
            label: 'Support',
          ),
          BottomNavigationBarItem(icon: Icon(Icons.settings), label: 'Setting'),
        ],
      ),
    );
  }

  Widget _buildFeatureButton({
    required String title,
    required IconData icon,
    VoidCallback? onTap,
    required Color color,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 80,
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: color.withOpacity(0.3),
              spreadRadius: 1,
              blurRadius: 3,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 32, color: Colors.white),
            const SizedBox(height: 8),
            Text(
              title,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuItem({
    required BuildContext context,
    required String title,
    required IconData icon,
    VoidCallback? onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(10),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              spreadRadius: 1,
              blurRadius: 2,
              offset: const Offset(0, 1),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 30,
              color: title == 'Logout' ? Colors.red : Colors.blue,
            ),
            const SizedBox(height: 8),
            Text(
              title,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 12,
                fontWeight:
                    title == 'Logout' ? FontWeight.bold : FontWeight.normal,
                color: title == 'Logout' ? Colors.red : Colors.black87,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
