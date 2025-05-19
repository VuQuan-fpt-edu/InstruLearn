import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class TeacherEvaluationScreen extends StatefulWidget {
  const TeacherEvaluationScreen({Key? key}) : super(key: key);

  @override
  State<TeacherEvaluationScreen> createState() =>
      _TeacherEvaluationScreenState();
}

class _TeacherEvaluationScreenState extends State<TeacherEvaluationScreen> {
  List<EvaluationFeedback> evaluations = [];
  List<EvaluationQuestion> questions = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      // Lấy danh sách đánh giá
      final evaluationResponse = await http.get(
        Uri.parse(
            'https://instrulearnapplication.azurewebsites.net/api/TeacherEvaluation/by-teacher/1'),
      );

      // Lấy danh sách câu hỏi
      final questionsResponse = await http.get(
        Uri.parse(
            'https://instrulearnapplication.azurewebsites.net/api/TeacherEvaluation/questions/active'),
      );

      if (evaluationResponse.statusCode == 200 &&
          questionsResponse.statusCode == 200) {
        final evaluationData = json.decode(evaluationResponse.body);
        final questionsData = json.decode(questionsResponse.body);

        setState(() {
          evaluations = (evaluationData['data'] as List)
              .map((e) => EvaluationFeedback.fromJson(e))
              .toList();
          questions = (questionsData['data'] as List)
              .map((e) => EvaluationQuestion.fromJson(e))
              .toList();
          isLoading = false;
        });
      }
    } catch (e) {
      print('Error loading data: $e');
      setState(() {
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Đánh giá học viên'),
        backgroundColor: const Color(0xFF8C9EFF),
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    const Color(0xFF8C9EFF).withOpacity(0.2),
                    Colors.white
                  ],
                ),
              ),
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: evaluations.length,
                itemBuilder: (context, index) {
                  final evaluation = evaluations[index];
                  return _buildEvaluationCard(evaluation);
                },
              ),
            ),
    );
  }

  Widget _buildEvaluationCard(EvaluationFeedback evaluation) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
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
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => _showEvaluationDialog(evaluation),
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Học viên: ${evaluation.learnerName}',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text('Môn học: ${evaluation.majorName}'),
                Text('Yêu cầu học tập: ${evaluation.learningRequest}'),
                Text(
                    'Số buổi học: ${evaluation.completedSessions}/${evaluation.totalSessions}'),
                const SizedBox(height: 8),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color:
                        evaluation.status == 2 ? Colors.green : Colors.orange,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    evaluation.status == 2
                        ? 'Đã hoàn thành'
                        : 'Chưa hoàn thành',
                    style: const TextStyle(color: Colors.white),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showEvaluationDialog(EvaluationFeedback evaluation) {
    if (evaluation.status == 2) {
      // Hiển thị kết quả đánh giá nếu đã hoàn thành
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Text('Đánh giá cho ${evaluation.learnerName}'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                  'Mục tiêu đạt được: ${evaluation.goalsAchieved ? "Có" : "Không"}'),
              const SizedBox(height: 16),
              ...evaluation.answers.map((answer) => Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        answer.questionText,
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                      Text('Trả lời: ${answer.selectedOptionText}'),
                      const SizedBox(height: 8),
                    ],
                  )),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Đóng'),
            ),
          ],
        ),
      );
    } else {
      // Hiển thị form đánh giá nếu chưa hoàn thành
      showDialog(
        context: context,
        builder: (context) => EvaluationFormDialog(
          evaluation: evaluation,
          questions: questions,
        ),
      );
    }
  }
}

class EvaluationFormDialog extends StatefulWidget {
  final EvaluationFeedback evaluation;
  final List<EvaluationQuestion> questions;

  const EvaluationFormDialog({
    Key? key,
    required this.evaluation,
    required this.questions,
  }) : super(key: key);

  @override
  State<EvaluationFormDialog> createState() => _EvaluationFormDialogState();
}

class _EvaluationFormDialogState extends State<EvaluationFormDialog> {
  bool goalsAchieved = false;
  Map<int, int> selectedOptions = {};

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text('Đánh giá cho ${widget.evaluation.learnerName}'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SwitchListTile(
              title: const Text('Mục tiêu đạt được'),
              value: goalsAchieved,
              onChanged: (value) => setState(() => goalsAchieved = value),
            ),
            const SizedBox(height: 16),
            ...widget.questions.map((question) => Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      question.questionText,
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    ...question.options.map((option) => RadioListTile<int>(
                          title: Text(option.optionText),
                          value: option.evaluationOptionId,
                          groupValue:
                              selectedOptions[question.evaluationQuestionId],
                          onChanged: (value) {
                            setState(() {
                              selectedOptions[question.evaluationQuestionId] =
                                  value!;
                            });
                          },
                        )),
                    const SizedBox(height: 16),
                  ],
                )),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Hủy'),
        ),
        ElevatedButton(
          onPressed: _submitEvaluation,
          child: const Text('Gửi đánh giá'),
        ),
      ],
    );
  }

  Future<void> _submitEvaluation() async {
    if (selectedOptions.length != widget.questions.length) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng trả lời tất cả các câu hỏi')),
      );
      return;
    }

    try {
      final response = await http.post(
        Uri.parse(
            'https://instrulearnapplication.azurewebsites.net/api/TeacherEvaluation/submit-evaluation-feedback'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'learningRegistrationId': widget.evaluation.learningRegistrationId,
          'learnerId': widget.evaluation.learnerId,
          'goalsAchieved': goalsAchieved,
          'answers': selectedOptions.entries
              .map((e) => {
                    'evaluationQuestionId': e.key,
                    'selectedOptionId': e.value,
                  })
              .toList(),
        }),
      );

      if (response.statusCode == 200) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Đánh giá đã được gửi thành công')),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Có lỗi xảy ra khi gửi đánh giá')),
        );
      }
    } catch (e) {
      print('Error submitting evaluation: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Có lỗi xảy ra khi gửi đánh giá')),
      );
    }
  }
}

class EvaluationFeedback {
  final int evaluationFeedbackId;
  final int learningRegistrationId;
  final int teacherId;
  final String teacherName;
  final int learnerId;
  final String learnerName;
  final String majorName;
  final String learningRequest;
  final DateTime createdAt;
  final DateTime? completedAt;
  final int status;
  final bool goalsAchieved;
  final int completedSessions;
  final int totalSessions;
  final List<EvaluationAnswer> answers;

  EvaluationFeedback({
    required this.evaluationFeedbackId,
    required this.learningRegistrationId,
    required this.teacherId,
    required this.teacherName,
    required this.learnerId,
    required this.learnerName,
    required this.majorName,
    required this.learningRequest,
    required this.createdAt,
    this.completedAt,
    required this.status,
    required this.goalsAchieved,
    required this.completedSessions,
    required this.totalSessions,
    required this.answers,
  });

  factory EvaluationFeedback.fromJson(Map<String, dynamic> json) {
    return EvaluationFeedback(
      evaluationFeedbackId: json['evaluationFeedbackId'],
      learningRegistrationId: json['learningRegistrationId'],
      teacherId: json['teacherId'],
      teacherName: json['teacherName'],
      learnerId: json['learnerId'],
      learnerName: json['learnerName'],
      majorName: json['majorName'],
      learningRequest: json['learningRequest'],
      createdAt: DateTime.parse(json['createdAt']),
      completedAt: json['completedAt'] != null
          ? DateTime.parse(json['completedAt'])
          : null,
      status: json['status'],
      goalsAchieved: json['goalsAchieved'],
      completedSessions: json['completedSessions'],
      totalSessions: json['totalSessions'],
      answers: (json['answers'] as List)
          .map((e) => EvaluationAnswer.fromJson(e))
          .toList(),
    );
  }
}

class EvaluationAnswer {
  final int evaluationAnswerId;
  final int evaluationFeedbackId;
  final int evaluationQuestionId;
  final int selectedOptionId;
  final String questionText;
  final String selectedOptionText;

  EvaluationAnswer({
    required this.evaluationAnswerId,
    required this.evaluationFeedbackId,
    required this.evaluationQuestionId,
    required this.selectedOptionId,
    required this.questionText,
    required this.selectedOptionText,
  });

  factory EvaluationAnswer.fromJson(Map<String, dynamic> json) {
    return EvaluationAnswer(
      evaluationAnswerId: json['evaluationAnswerId'],
      evaluationFeedbackId: json['evaluationFeedbackId'],
      evaluationQuestionId: json['evaluationQuestionId'],
      selectedOptionId: json['selectedOptionId'],
      questionText: json['questionText'],
      selectedOptionText: json['selectedOptionText'],
    );
  }
}

class EvaluationQuestion {
  final int evaluationQuestionId;
  final String questionText;
  final int displayOrder;
  final bool isRequired;
  final bool isActive;
  final List<EvaluationOption> options;

  EvaluationQuestion({
    required this.evaluationQuestionId,
    required this.questionText,
    required this.displayOrder,
    required this.isRequired,
    required this.isActive,
    required this.options,
  });

  factory EvaluationQuestion.fromJson(Map<String, dynamic> json) {
    return EvaluationQuestion(
      evaluationQuestionId: json['evaluationQuestionId'],
      questionText: json['questionText'],
      displayOrder: json['displayOrder'],
      isRequired: json['isRequired'],
      isActive: json['isActive'],
      options: (json['options'] as List)
          .map((e) => EvaluationOption.fromJson(e))
          .toList(),
    );
  }
}

class EvaluationOption {
  final int evaluationOptionId;
  final int evaluationQuestionId;
  final String optionText;

  EvaluationOption({
    required this.evaluationOptionId,
    required this.evaluationQuestionId,
    required this.optionText,
  });

  factory EvaluationOption.fromJson(Map<String, dynamic> json) {
    return EvaluationOption(
      evaluationOptionId: json['evaluationOptionId'],
      evaluationQuestionId: json['evaluationQuestionId'],
      optionText: json['optionText'],
    );
  }
}
