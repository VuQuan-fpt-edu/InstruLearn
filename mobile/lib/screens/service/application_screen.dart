import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'detail/application_details_screen.dart';
import '../../models/learning_registration.dart';
import '../../services/learning_registration_service.dart';

class ApplicationScreen extends StatefulWidget {
  const ApplicationScreen({Key? key}) : super(key: key);

  @override
  State<ApplicationScreen> createState() => _ApplicationScreenState();
}

class _ApplicationScreenState extends State<ApplicationScreen> {
  final LearningRegistrationService _service = LearningRegistrationService();
  List<LearningRegistration> _registrations = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadRegistrations();
  }

  Future<void> _loadRegistrations() async {
    try {
      setState(() {
        _isLoading = true;
        _error = null;
      });

      final prefs = await SharedPreferences.getInstance();
      final learnerId = prefs.getInt('learnerId');

      if (learnerId == null) {
        setState(() {
          _error = 'Không tìm thấy thông tin người dùng';
          _isLoading = false;
        });
        return;
      }

      final registrations =
          await _service.getRegistrationsByLearnerId(learnerId);

      setState(() {
        _registrations = registrations;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'accepted':
        return Colors.green;
      case 'pending':
        return Colors.pink;
      case 'declined':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Application'),
        backgroundColor: const Color(0xFF8C9EFF),
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [const Color(0xFF8C9EFF).withOpacity(0.2), Colors.white],
          ),
        ),
        child: RefreshIndicator(
          onRefresh: _loadRegistrations,
          child: _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _error != null
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            'Error: $_error',
                            style: const TextStyle(color: Colors.red),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 16),
                          ElevatedButton(
                            onPressed: _loadRegistrations,
                            child: const Text('Retry'),
                          ),
                        ],
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _registrations.length,
                      itemBuilder: (context, index) {
                        final registration = _registrations[index];
                        final statusColor =
                            _getStatusColor(registration.status);

                        return Padding(
                          padding: const EdgeInsets.only(bottom: 16),
                          child: _buildApplicationCard(
                            registration: registration,
                            backgroundColor: statusColor.withOpacity(0.1),
                            headerColor: statusColor,
                          ),
                        );
                      },
                    ),
        ),
      ),
    );
  }

  Widget _buildApplicationCard({
    required LearningRegistration registration,
    required Color backgroundColor,
    required Color headerColor,
  }) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ApplicationDetailsScreen(
              status: registration.status,
              statusColor: headerColor,
              registration: registration,
            ),
          ),
        );
      },
      child: Container(
        decoration: BoxDecoration(
          color: backgroundColor,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.3),
              spreadRadius: 1,
              blurRadius: 5,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
              decoration: BoxDecoration(
                color: headerColor,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(12),
                  topRight: Radius.circular(12),
                ),
              ),
              child: Text(
                registration.status,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Type: ${registration.regisTypeName}',
                    style: const TextStyle(
                      color: Colors.blue,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Create date: ${registration.requestDate.split('T')[0]}',
                    style: const TextStyle(
                      color: Colors.black87,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Teacher: ${registration.teacherName}',
                    style: const TextStyle(color: Colors.black87),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Major: ${registration.majorName}',
                    style: const TextStyle(color: Colors.black87),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Time: ${registration.timeStart} - ${registration.timeEnd}',
                    style: const TextStyle(color: Colors.black87),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Learning Days: ${registration.learningDays.join(", ")}',
                    style: const TextStyle(color: Colors.black87),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
