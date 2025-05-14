import 'package:flutter/material.dart';
import '../../../models/feedback_notification.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

class NotificationDetailScreen extends StatefulWidget {
  final FeedbackNotification feedbackNotification;

  const NotificationDetailScreen({
    Key? key,
    required this.feedbackNotification,
  }) : super(key: key);

  @override
  State<NotificationDetailScreen> createState() =>
      _NotificationDetailScreenState();
}

class _NotificationDetailScreenState extends State<NotificationDetailScreen> {
  Map<int, int?> selectedOptions = {};
  bool? continueStudying;
  bool? changeTeacher;
  final TextEditingController _additionalCommentsController =
      TextEditingController();
  final TextEditingController _teacherChangeReasonController =
      TextEditingController();
  final FocusNode _teacherChangeReasonFocusNode = FocusNode();
  bool _hasShownTeacherChangeWarning = false;

  @override
  void initState() {
    super.initState();
    for (var question in widget.feedbackNotification.questions) {
      selectedOptions[question.questionId] = null;
    }
    _teacherChangeReasonFocusNode.addListener(_onTeacherChangeReasonFocus);
  }

  void _onTeacherChangeReasonFocus() {
    if (_teacherChangeReasonFocusNode.hasFocus &&
        !_hasShownTeacherChangeWarning) {
      _hasShownTeacherChangeWarning = true;
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Lưu ý khi đổi giáo viên'),
          content: RichText(
            text: TextSpan(
              style: const TextStyle(
                  color: Colors.black, fontSize: 16, height: 1.5),
              children: [
                const TextSpan(text: 'Học viên lưu ý ghi rõ '),
                const TextSpan(
                  text: 'lý do cụ thể, chính đáng',
                  style:
                      TextStyle(fontWeight: FontWeight.bold, color: Colors.red),
                ),
                const TextSpan(
                    text: ' khi muốn đổi giáo viên. Việc đổi giáo viên '),
                const TextSpan(
                  text: 'chỉ được chấp nhận khi có lý do hợp lý, trung thực',
                  style:
                      TextStyle(fontWeight: FontWeight.bold, color: Colors.red),
                ),
                const TextSpan(text: '.\n\nNếu phát hiện '),
                const TextSpan(
                  text: 'viện cớ hoặc khai báo không đúng sự thật',
                  style:
                      TextStyle(fontWeight: FontWeight.bold, color: Colors.red),
                ),
                const TextSpan(text: ', trung tâm có quyền '),
                const TextSpan(
                  text: 'từ chối yêu cầu đổi giáo viên.',
                  style:
                      TextStyle(fontWeight: FontWeight.bold, color: Colors.red),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Đã hiểu'),
            ),
          ],
        ),
      );
    }
  }

  @override
  void dispose() {
    _additionalCommentsController.dispose();
    _teacherChangeReasonController.dispose();
    _teacherChangeReasonFocusNode.dispose();
    super.dispose();
  }

  Future<void> _submitFeedback() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');
      final learnerId = prefs.getInt('learnerId');

      if (token == null || learnerId == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Vui lòng đăng nhập lại')),
        );
        return;
      }

      if (continueStudying == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text('Vui lòng chọn lựa chọn về việc tiếp tục học')),
        );
        return;
      }

      // Kiểm tra nếu học viên muốn tiếp tục học thì phải chọn đổi giáo viên
      if (continueStudying == true && changeTeacher == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text('Vui lòng chọn lựa chọn về việc đổi giáo viên')),
        );
        return;
      }

      // Hiển thị dialog xác nhận
      final bool? confirm = await showDialog<bool>(
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            title: const Text('Xác nhận gửi đánh giá'),
            content: const Text(
                'Học viên có chắc sẽ gửi đánh giá này chứ? Sau khi gửi thì đánh giá không thể sửa.'),
            actions: <Widget>[
              TextButton(
                child: const Text('Hủy'),
                onPressed: () {
                  Navigator.of(context).pop(false);
                },
              ),
              TextButton(
                child: const Text('Xác nhận'),
                onPressed: () {
                  Navigator.of(context).pop(true);
                },
              ),
            ],
          );
        },
      );

      if (confirm != true) {
        return;
      }

      final answers = selectedOptions.entries
          .where((entry) => entry.value != null)
          .map((entry) => {
                "questionId": entry.key,
                "selectedOptionId": entry.value,
              })
          .toList();

      final requestBody = {
        "learningRegistrationId": widget.feedbackNotification.learningRegisId,
        "learnerId": learnerId,
        "additionalComments": _additionalCommentsController.text,
        "teacherChangeReason":
            changeTeacher == true ? _teacherChangeReasonController.text : null,
        "answers": answers,
        "continueStudying": continueStudying,
        "changeTeacher": continueStudying == true ? changeTeacher : false,
      };

      final response = await http.post(
        Uri.parse(
            'https://instrulearnapplication.azurewebsites.net/api/LearningRegisFeedback/SubmitFeedback'),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer $token',
        },
        body: json.encode(requestBody),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['isSucceed'] == true) {
          // Hiển thị thông báo tương ứng với lựa chọn của học viên
          String message = continueStudying == true
              ? 'Cảm ơn vì đóng góp ý kiến của bạn. Bạn lưu ý trong phần "Đơn của học viên" để theo dõi và thanh toán phần học phí còn lại.'
              : 'Cảm ơn bạn đã đồng hành cùng khóa học vừa qua!\nChúng tôi rất tiếc vì khóa học chưa mang lại trải nghiệm như mong đợi. Mọi phản hồi của bạn đều giúp chúng tôi cải thiện tốt hơn trong tương lai.';

          await showDialog(
            context: context,
            builder: (BuildContext context) {
              return AlertDialog(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(15),
                ),
                title: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF8C9EFF),
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(15),
                      topRight: Radius.circular(15),
                    ),
                  ),
                  child: const Text(
                    'Gửi đánh giá thành công',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                content: Container(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.check_circle,
                        color: Colors.green[600],
                        size: 60,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        message,
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontSize: 16,
                          height: 1.5,
                        ),
                      ),
                    ],
                  ),
                ),
                actions: <Widget>[
                  TextButton(
                    child: const Text(
                      'OK',
                      style: TextStyle(
                        color: Color(0xFF8C9EFF),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    onPressed: () {
                      Navigator.of(context).pop();
                      Navigator.pop(context,
                          true); // Trả về true để báo hiệu cần fetch lại
                    },
                  ),
                ],
              );
            },
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
                content: Text(data['message'] ?? 'Không thể gửi đánh giá')),
          );
        }
      } else if (response.statusCode == 401) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content:
                  Text('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Lỗi kết nối: ${response.statusCode}')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Lỗi: ${e.toString()}')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Chi tiết đánh giá'),
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
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: double.infinity,
                margin: const EdgeInsets.all(16),
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
                    Text(
                      'Giáo viên: ${widget.feedbackNotification.teacherName}',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Số buổi đã học:'),
                        Text(
                          '${widget.feedbackNotification.completedSessions}/${widget.feedbackNotification.totalSessions}',
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Học phí cần thanh toán:'),
                        Text(
                          '${widget.feedbackNotification.remainingPayment} VND',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Colors.red[700],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              Container(
                width: double.infinity,
                margin: const EdgeInsets.symmetric(horizontal: 16),
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
                      'Đánh giá của bạn',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    ...widget.feedbackNotification.questions.map((question) {
                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            question.questionText,
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          if (question.isRequired)
                            Text(
                              '(Bắt buộc)',
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.red[700],
                                fontStyle: FontStyle.italic,
                              ),
                            ),
                          const SizedBox(height: 8),
                          ...question.options.map((option) {
                            return RadioListTile<int>(
                              title: Text(option.optionText),
                              value: option.optionId,
                              groupValue: selectedOptions[question.questionId],
                              onChanged: (value) {
                                setState(() {
                                  selectedOptions[question.questionId] = value;
                                });
                              },
                            );
                          }).toList(),
                          const SizedBox(height: 16),
                        ],
                      );
                    }).toList(),
                    const SizedBox(height: 16),
                    const Text(
                      'Học viên có muốn tiếp tục học không?',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 8),
                    RadioListTile<bool>(
                      title: const Text('Tôi muốn tiếp tục học'),
                      value: true,
                      groupValue: continueStudying,
                      onChanged: (value) {
                        setState(() {
                          continueStudying = value;
                        });
                      },
                    ),
                    RadioListTile<bool>(
                      title: const Text('Tôi không muốn học nữa'),
                      value: false,
                      groupValue: continueStudying,
                      onChanged: (value) {
                        setState(() {
                          continueStudying = value;
                          // Reset changeTeacher khi chọn không tiếp tục học
                          changeTeacher = null;
                        });
                      },
                    ),
                    if (continueStudying == true) ...[
                      const SizedBox(height: 16),
                      const Text(
                        'Học viên có muốn đổi giáo viên không?',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 8),
                      RadioListTile<bool>(
                        title: const Text('Có, tôi muốn đổi'),
                        value: true,
                        groupValue: changeTeacher,
                        onChanged: (value) {
                          setState(() {
                            changeTeacher = value;
                          });
                        },
                      ),
                      RadioListTile<bool>(
                        title: const Text('Không, đừng đổi'),
                        value: false,
                        groupValue: changeTeacher,
                        onChanged: (value) {
                          setState(() {
                            changeTeacher = value;
                          });
                        },
                      ),
                      if (changeTeacher == true) ...[
                        const SizedBox(height: 16),
                        Container(
                          decoration: BoxDecoration(
                            color: Colors.grey[100],
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.grey[300]!),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Padding(
                                padding: const EdgeInsets.only(
                                    left: 16, top: 12, right: 16),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                      'Lý do muốn đổi giáo viên (Bắt buộc):',
                                      style: TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Icon(
                                      Icons.warning,
                                      size: 16,
                                      color: Colors.red[600],
                                    ),
                                  ],
                                ),
                              ),
                              Padding(
                                padding: const EdgeInsets.all(12),
                                child: TextField(
                                  controller: _teacherChangeReasonController,
                                  focusNode: _teacherChangeReasonFocusNode,
                                  maxLines: 3,
                                  decoration: InputDecoration(
                                    hintText:
                                        'Vui lòng nhập lý do muốn đổi giáo viên...',
                                    hintStyle: TextStyle(
                                      fontSize: 14,
                                      fontStyle: FontStyle.italic,
                                      color: Colors.grey[500],
                                    ),
                                    filled: true,
                                    fillColor: Colors.white,
                                    contentPadding: const EdgeInsets.all(16),
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(8),
                                      borderSide:
                                          BorderSide(color: Colors.grey[300]!),
                                    ),
                                    enabledBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(8),
                                      borderSide:
                                          BorderSide(color: Colors.grey[300]!),
                                    ),
                                    focusedBorder: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(8),
                                      borderSide: BorderSide(
                                          color: const Color(0xFF8C9EFF),
                                          width: 2),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ],
                    const SizedBox(height: 24),
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.grey[100],
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.grey[300]!),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Padding(
                            padding: const EdgeInsets.only(
                                left: 16, top: 12, right: 16),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Đánh giá tổng quát (không bắt buộc):',
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Icon(
                                  Icons.comment,
                                  size: 16,
                                  color: Colors.grey[600],
                                ),
                              ],
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.all(12),
                            child: TextField(
                              controller: _additionalCommentsController,
                              maxLines: 4,
                              decoration: InputDecoration(
                                hintText:
                                    'Chia sẻ cảm nhận của bạn về khóa học...',
                                hintStyle: TextStyle(
                                  fontSize: 14,
                                  fontStyle: FontStyle.italic,
                                  color: Colors.grey[500],
                                ),
                                filled: true,
                                fillColor: Colors.white,
                                contentPadding: const EdgeInsets.all(16),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(8),
                                  borderSide:
                                      BorderSide(color: Colors.grey[300]!),
                                ),
                                enabledBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(8),
                                  borderSide:
                                      BorderSide(color: Colors.grey[300]!),
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(8),
                                  borderSide: BorderSide(
                                      color: const Color(0xFF8C9EFF), width: 2),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.red,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                            ),
                            onPressed: () {
                              Navigator.pop(context);
                            },
                            child: const Text('Hủy'),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.green,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                            ),
                            onPressed: () {
                              bool allRequiredAnswered = true;
                              for (var question
                                  in widget.feedbackNotification.questions) {
                                if (question.isRequired &&
                                    selectedOptions[question.questionId] ==
                                        null) {
                                  allRequiredAnswered = false;
                                  break;
                                }
                              }

                              if (!allRequiredAnswered) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text(
                                        'Vui lòng trả lời tất cả các câu hỏi bắt buộc'),
                                  ),
                                );
                                return;
                              }

                              if (changeTeacher == true &&
                                  _teacherChangeReasonController.text
                                      .trim()
                                      .isEmpty) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text(
                                        'Vui lòng nhập lý do muốn đổi giáo viên'),
                                  ),
                                );
                                return;
                              }

                              _submitFeedback();
                            },
                            child: const Text('Gửi đánh giá'),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }
}
