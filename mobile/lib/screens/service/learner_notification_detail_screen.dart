import 'package:flutter/material.dart';
import '../../models/learner_notification.dart';
import 'package:intl/intl.dart';

class LearnerNotificationDetailScreen extends StatelessWidget {
  final LearnerNotification notification;
  const LearnerNotificationDetailScreen({Key? key, required this.notification})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    final dateFormat = DateFormat('dd/MM/yyyy HH:mm');
    return Scaffold(
      appBar: AppBar(
        title: const Text('Chi tiết thông báo lưu ý'),
        backgroundColor: const Color(0xFF8C9EFF),
      ),
      body: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [const Color(0xFF8C9EFF).withOpacity(0.2), Colors.white],
          ),
        ),
        child: Card(
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          elevation: 4,
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(notification.title,
                    style: const TextStyle(
                        fontSize: 20, fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                Row(
                  children: [
                    const Icon(Icons.email, size: 18, color: Colors.grey),
                    const SizedBox(width: 6),
                    Expanded(
                        child: Text(notification.recipientEmail,
                            style: const TextStyle(
                                fontSize: 14, color: Colors.grey))),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(Icons.access_time, size: 18, color: Colors.grey),
                    const SizedBox(width: 6),
                    Text(dateFormat.format(notification.sentDate),
                        style:
                            const TextStyle(fontSize: 14, color: Colors.grey)),
                  ],
                ),
                const Divider(height: 28),
                Text(notification.message,
                    style: const TextStyle(fontSize: 16)),
                const SizedBox(height: 18),
                if (notification.learningRequest != null &&
                    notification.learningRequest!.isNotEmpty) ...[
                  const Text('Yêu cầu đơn học:',
                      style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Text(notification.learningRequest!,
                      style: TextStyle(fontSize: 15)),
                  const SizedBox(height: 12),
                ],
                if (notification.amount != null) ...[
                  const Text('Số tiền cần thanh toán:',
                      style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Text('${notification.amount} VND',
                      style: const TextStyle(fontSize: 15, color: Colors.red)),
                  const SizedBox(height: 12),
                ],
                if (notification.deadline != null) ...[
                  const Text('Hạn thanh toán:',
                      style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Text(dateFormat.format(notification.deadline!),
                      style: const TextStyle(fontSize: 15)),
                  const SizedBox(height: 12),
                ],
                Row(
                  children: [
                    const Text('Mã đơn học:',
                        style: TextStyle(fontWeight: FontWeight.bold)),
                    const SizedBox(width: 8),
                    Text(notification.learningRegisId.toString()),
                  ],
                ),
                const SizedBox(height: 8),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
