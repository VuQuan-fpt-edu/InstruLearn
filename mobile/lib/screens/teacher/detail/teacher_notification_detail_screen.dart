import 'package:flutter/material.dart';

class TeacherNotificationDetailScreen extends StatelessWidget {
  final String title;
  final String date;

  const TeacherNotificationDetailScreen({
    Key? key,
    required this.title,
    required this.date,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Chi tiết thông báo'),
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
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.grey.withOpacity(0.2),
                        spreadRadius: 1,
                        blurRadius: 6,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      RichText(
                        text: TextSpan(
                          children: [
                            TextSpan(
                              text: '[Trung tâm âm nhạc InstruLearn]',
                              style: TextStyle(
                                color: Colors.red[700],
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                            TextSpan(
                              text: title.substring(title.indexOf(']') + 1),
                              style: const TextStyle(
                                color: Colors.black,
                                fontSize: 16,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'Ngày: $date',
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey[600],
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                if (title.contains('LỊCH DẠY')) ...[
                  _buildScheduleSection(),
                ] else if (title.contains('KIỂM TRA CHẤT LƯỢNG')) ...[
                  _buildQualityCheckSection(),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildScheduleSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.2),
            spreadRadius: 1,
            blurRadius: 6,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Thông tin lịch dạy:',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Color(0xFF536DFE),
            ),
          ),
          const SizedBox(height: 12),
          _buildInfoRow('Ngày dạy:', '20/12/2025'),
          _buildInfoRow('Thời gian:', '7:00 - 9:00'),
          _buildInfoRow('Lớp:', 'Guitar cơ bản - Buổi 1'),
          _buildInfoRow('Học viên:', 'Nguyễn Văn A'),
          _buildInfoRow('Địa điểm:', 'Phòng 101, Cơ sở 1'),
        ],
      ),
    );
  }

  Widget _buildQualityCheckSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.2),
            spreadRadius: 1,
            blurRadius: 6,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          RichText(
            text: TextSpan(
              children: [
                TextSpan(
                  text: '[Trung tâm âm nhạc InstruLearn]',
                  style: TextStyle(
                    color: Colors.red[700],
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                const TextSpan(
                  text:
                      ' Thông báo về việc kiểm tra chất lượng đầu vào lớp [GUITAR-NC-8.0-10.03.2025-17:00]',
                  style: TextStyle(
                    color: Colors.black,
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'date: 03/03/2025',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[600],
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 16),
          RichText(
            text: TextSpan(
              style: const TextStyle(
                fontSize: 14,
                color: Colors.black87,
                height: 1.5,
              ),
              children: [
                const TextSpan(
                  text:
                      'THÔNG BÁO VỀ VIỆC KIỂM TRA CHẤT LƯỢNG ĐẦU VÀO CỦA HỌC VIÊN. GIÁO VIÊN PHỤ TRÁCH LỚP [',
                ),
                TextSpan(
                  text: 'GUITAR-NC-8.0-10.03.2025-17:00',
                  style: TextStyle(
                    color: Colors.red[700],
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const TextSpan(text: '] VUI LÒNG CÓ MẶT ĐÚNG THỜI GIAN ĐÃ HẸN'),
              ],
            ),
          ),
          const SizedBox(height: 16),
          _buildInfoRow('Địa chỉ:', '123 Phan Văn Trị, Gò Vấp'),
          _buildInfoRow('Ngày kiểm tra:', '06/03/2025 Vào lúc 10:00'),
          _buildInfoRow('Số Phòng:', '600'),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 140,
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: Colors.black54,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: Colors.black87,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
