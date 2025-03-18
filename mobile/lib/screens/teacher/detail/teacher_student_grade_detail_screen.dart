import 'package:flutter/material.dart';

class TeacherStudentGradeDetailScreen extends StatefulWidget {
  final String studentName;
  final bool isOneOnOne;

  const TeacherStudentGradeDetailScreen({
    Key? key,
    required this.studentName,
    required this.isOneOnOne,
  }) : super(key: key);

  @override
  State<TeacherStudentGradeDetailScreen> createState() =>
      _TeacherStudentGradeDetailScreenState();
}

class _TeacherStudentGradeDetailScreenState
    extends State<TeacherStudentGradeDetailScreen> {
  // Danh sách tiêu chí đánh giá mẫu
  final List<GradeCriteria> criteria = [
    GradeCriteria(
      name: 'Kỹ thuật cơ bản',
      maxWeight: 30,
      currentValue: 20,
      comment:
          'Chơi được cả hai tay động đều, đúng nhịp, Không bị cứng tay, di chuyển mượt mà',
    ),
    GradeCriteria(
      name: 'Nhịp điệu & tiết tấu',
      maxWeight: 20,
      currentValue: 17,
      comment:
          'Không bị lệch tốc độ, không ngập ngừng, Không tăng giảm tốc độ đột ngột khi hit cho 2 âm nhạc',
    ),
    GradeCriteria(
      name: 'Kỹ thuật nâng cao',
      maxWeight: 20,
      currentValue: 17,
      comment:
          'Không bị lạm dụng pedal, pedal không làm âm thanh bị rối, kiểm soát độ mượt và ngắt âm theo yêu cầu bài nhạc, thay đổi âm lượng, không chơi đều tầm tập thiếu cảm xúc',
    ),
    GradeCriteria(
      name: 'Cảm xúc & diễn tấu',
      maxWeight: 15,
      currentValue: 13,
      comment:
          'Chơi có hồn, không chỉ đánh đúng nốt, Không bị lạc tone/lạc nhịp khi chơi cùng người khác',
    ),
    GradeCriteria(
      name: 'Đọc bản nhạc & khả năng ghi nhớ',
      maxWeight: 15,
      currentValue: 15,
      comment:
          'Có thể chơi theo bản nhạc chuẩn xác, Không cần nhìn sheet vẫn có thể chơi lại bài đã tập luyện',
    ),
  ];

  double get totalWeight =>
      criteria.fold(0, (sum, item) => sum + item.maxWeight);

  double get currentTotal =>
      criteria.fold(0, (sum, item) => sum + (item.currentValue ?? 0));

  String get performanceLevel {
    final percentage = (currentTotal / totalWeight) * 100;
    if (percentage >= 85) return 'Excellent';
    if (percentage >= 70) return 'Good';
    if (percentage >= 50) return 'Fair';
    return 'Need Improvement';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Details'),
        backgroundColor: Colors.blue[900],
      ),
      body: Column(
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            color: Colors.blue[900],
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 60,
                      height: 60,
                      decoration: BoxDecoration(
                        color: Colors.pink[500],
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Center(
                        child: Text(
                          'Ex',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.studentName,
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          const Text(
                            'Học chơi Guitar như nghệ sĩ chuyên nghiệp',
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.white70,
                            ),
                          ),
                          Text(
                            'AVG: ${(currentTotal / totalWeight * 100).toStringAsFixed(0)}%',
                            style: const TextStyle(
                              fontSize: 14,
                              color: Colors.white70,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          Expanded(
            child: SingleChildScrollView(
              child: Table(
                border: TableBorder.all(color: Colors.grey[300]!, width: 1),
                columnWidths: const {
                  0: FlexColumnWidth(2.5),
                  1: FlexColumnWidth(1),
                  2: FlexColumnWidth(1),
                  3: FlexColumnWidth(3),
                },
                children: [
                  TableRow(
                    decoration: BoxDecoration(color: Colors.blue[900]),
                    children: const [
                      TableCell(
                        child: Padding(
                          padding: EdgeInsets.all(8),
                          child: Text(
                            'Grade Category',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                      TableCell(
                        child: Padding(
                          padding: EdgeInsets.all(8),
                          child: Text(
                            'Weight',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                      TableCell(
                        child: Padding(
                          padding: EdgeInsets.all(8),
                          child: Text(
                            'Value',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                      TableCell(
                        child: Padding(
                          padding: EdgeInsets.all(8),
                          child: Text(
                            'Comment',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  ...criteria.map((criterion) => _buildCriterionRow(criterion)),
                  TableRow(
                    decoration: const BoxDecoration(color: Colors.white),
                    children: [
                      const TableCell(
                        child: Padding(
                          padding: EdgeInsets.all(8),
                          child: Text(
                            'Course Total',
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                      TableCell(
                        child: Padding(
                          padding: const EdgeInsets.all(8),
                          child: Text(
                            '${totalWeight}%',
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                      TableCell(
                        child: Padding(
                          padding: const EdgeInsets.all(8),
                          child: Text(
                            '${currentTotal.toStringAsFixed(0)}%',
                            style: TextStyle(
                              color: Colors.pink[500],
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                      TableCell(
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          color: Colors.pink[500],
                          child: Text(
                            performanceLevel,
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            child: ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: const Text(
                'Save',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ],
      ),
    );
  }

  TableRow _buildCriterionRow(GradeCriteria criterion) {
    final backgroundColor = Colors.grey[100];

    return TableRow(
      decoration: BoxDecoration(color: backgroundColor),
      children: [
        TableCell(
          child: GestureDetector(
            onTap: () => _showGradeDialog(criterion),
            child: Padding(
              padding: const EdgeInsets.all(8),
              child: Text(criterion.name),
            ),
          ),
        ),
        TableCell(
          child: GestureDetector(
            onTap: () => _showGradeDialog(criterion),
            child: Padding(
              padding: const EdgeInsets.all(8),
              child: Text('${criterion.maxWeight}%'),
            ),
          ),
        ),
        TableCell(
          child: GestureDetector(
            onTap: () => _showGradeDialog(criterion),
            child: Padding(
              padding: const EdgeInsets.all(8),
              child: Text(
                '${criterion.currentValue}%',
                style: TextStyle(
                  color: Colors.pink[500],
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        ),
        TableCell(
          child: GestureDetector(
            onTap: () => _showGradeDialog(criterion),
            child: Padding(
              padding: const EdgeInsets.all(8),
              child: Text(criterion.comment ?? '-'),
            ),
          ),
        ),
      ],
    );
  }

  void _showGradeDialog(GradeCriteria criterion) {
    final TextEditingController valueController = TextEditingController(
      text: criterion.currentValue?.toString() ?? '',
    );
    final TextEditingController commentController = TextEditingController(
      text: criterion.comment ?? '',
    );

    showDialog(
      context: context,
      builder:
          (context) => AlertDialog(
            title: Text('Chấm điểm ${criterion.name}'),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('Trọng số: ${criterion.maxWeight}%'),
                const SizedBox(height: 20),
                TextField(
                  controller: valueController,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(
                    labelText: 'Điểm (0-${criterion.maxWeight})',
                    border: const OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: commentController,
                  maxLines: 3,
                  decoration: const InputDecoration(
                    labelText: 'Nhận xét',
                    border: OutlineInputBorder(),
                  ),
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Hủy'),
              ),
              ElevatedButton(
                onPressed: () {
                  final double? value = double.tryParse(valueController.text);
                  if (value != null &&
                      value >= 0 &&
                      value <= criterion.maxWeight) {
                    setState(() {
                      criterion.currentValue = value;
                      criterion.comment = commentController.text.trim();
                    });
                    Navigator.pop(context);
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                          'Vui lòng nhập điểm hợp lệ (0-${criterion.maxWeight})',
                        ),
                      ),
                    );
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.pink[500],
                ),
                child: const Text('Lưu'),
              ),
            ],
          ),
    );
  }
}

class GradeCriteria {
  final String name;
  final int maxWeight;
  double? currentValue;
  String? comment;

  GradeCriteria({
    required this.name,
    required this.maxWeight,
    this.currentValue,
    this.comment,
  });
}
