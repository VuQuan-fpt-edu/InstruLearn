import 'package:flutter/material.dart';
import 'detail/application_details_screen.dart';

class ApplicationScreen extends StatefulWidget {
  const ApplicationScreen({Key? key}) : super(key: key);

  @override
  State<ApplicationScreen> createState() => _ApplicationScreenState();
}

class _ApplicationScreenState extends State<ApplicationScreen> {
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
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            _buildApplicationCard(
              status: 'Approved',
              type: 'Yêu cầu được học kèm 1:1',
              date: '12/12/2025',
              description:
                  'Tôi mong muốn được thông thạo Guitar và chơi Guitar như một nghệ sĩ chuyên nghiệp',
              backgroundColor: Colors.green.shade100,
              headerColor: Colors.green,
            ),
            const SizedBox(height: 16),
            _buildApplicationCard(
              status: 'Declined',
              type: 'Yêu cầu được học kèm 1:1',
              date: '12/12/2025',
              description:
                  'Tôi mong muốn được thông thạo Guitar và chơi Guitar như một nghệ sĩ chuyên nghiệp',
              backgroundColor: Colors.red.shade100,
              headerColor: Colors.red,
            ),
            const SizedBox(height: 16),
            _buildApplicationCard(
              status: 'Processing',
              type: 'Yêu cầu được học kèm 1:1',
              date: 'dd/mm/yyyy',
              description:
                  'Tôi mong muốn được thông thạo Guitar và chơi Guitar như một nghệ sĩ chuyên nghiệp',
              backgroundColor: Colors.pink.shade100,
              headerColor: Colors.pink,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildApplicationCard({
    required String status,
    required String type,
    required String date,
    required String description,
    required Color backgroundColor,
    required Color headerColor,
  }) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder:
                (context) => ApplicationDetailsScreen(
                  status: status,
                  statusColor: headerColor,
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
                status,
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
                    'Type: $type',
                    style: const TextStyle(
                      color: Colors.blue,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Create date: $date',
                    style: const TextStyle(
                      color: Colors.black87,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Chào em, cô đã nhận được đơn yêu cầu học kèm của em, cô sẽ là người thực hiện yêu cầu học tập của em',
                    style: TextStyle(color: Colors.black87),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    description,
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
