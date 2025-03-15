import 'package:flutter/material.dart';

class MyCourseScreen extends StatefulWidget {
  final String courseTitle;

  const MyCourseScreen({Key? key, required this.courseTitle}) : super(key: key);

  @override
  State<MyCourseScreen> createState() => _MyCourseScreenState();
}

class _MyCourseScreenState extends State<MyCourseScreen> {
  bool isVideoPlaying = false;
  int selectedLessonIndex = 0;

  final List<CourseSection> sections = [
    CourseSection(
      title: 'Phần 1 - Chào mừng đến với Piano',
      lessons: [
        Lesson(
          title: 'Giới thiệu về Piano',
          duration: '01:42 phút',
          type: 'Video',
          isCompleted: false,
        ),
        Lesson(
          title: 'Các phím đàn và âm thanh cơ bản',
          duration: '01:42 phút',
          type: 'Video',
          isCompleted: false,
        ),
        Lesson(
          title: 'Vị trí đặt tay trên phím đàn',
          duration: '01:42 phút',
          type: 'Video',
          isCompleted: false,
        ),
      ],
    ),
    CourseSection(
      title: 'Phần 2 - Các bài tập cơ bản',
      lessons: [
        Lesson(
          title: 'Bài tập 1: Làm quen với phím đàn',
          duration: '02:15 phút',
          type: 'Video',
          isCompleted: false,
        ),
        Lesson(
          title: 'Bài tập 2: Điều chỉnh âm lượng',
          duration: '01:55 phút',
          type: 'Video',
          isCompleted: false,
        ),
      ],
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(widget.courseTitle, style: const TextStyle(fontSize: 16)),
        backgroundColor: const Color(0xFF8C9EFF),
      ),
      body: Column(
        children: [
          // Video Player Section
          Container(
            height: 200,
            width: double.infinity,
            color: Colors.black,
            child: Stack(
              alignment: Alignment.center,
              children: [
                if (!isVideoPlaying)
                  Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.play_circle_fill,
                        size: 50,
                        color: Colors.white.withOpacity(0.8),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        sections[0].lessons[selectedLessonIndex].title,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
              ],
            ),
          ),

          // Course Content
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    const Color(0xFF8C9EFF).withOpacity(0.2),
                    Colors.white,
                  ],
                ),
              ),
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: sections.length,
                itemBuilder: (context, sectionIndex) {
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        sections[sectionIndex].title,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 10),
                      ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: sections[sectionIndex].lessons.length,
                        itemBuilder: (context, lessonIndex) {
                          final lesson =
                              sections[sectionIndex].lessons[lessonIndex];
                          return Card(
                            margin: const EdgeInsets.only(bottom: 8),
                            child: ListTile(
                              onTap: () {
                                setState(() {
                                  selectedLessonIndex = lessonIndex;
                                });
                              },
                              leading: Container(
                                width: 40,
                                height: 40,
                                decoration: BoxDecoration(
                                  color:
                                      selectedLessonIndex == lessonIndex
                                          ? Colors.blue.withOpacity(0.1)
                                          : Colors.grey.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Icon(
                                  lesson.isCompleted
                                      ? Icons.check_circle
                                      : Icons.play_circle_outline,
                                  color:
                                      selectedLessonIndex == lessonIndex
                                          ? Colors.blue
                                          : Colors.grey,
                                ),
                              ),
                              title: Text(
                                lesson.title,
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight:
                                      selectedLessonIndex == lessonIndex
                                          ? FontWeight.bold
                                          : FontWeight.normal,
                                ),
                              ),
                              subtitle: Text(
                                '${lesson.type} - ${lesson.duration}',
                                style: const TextStyle(fontSize: 12),
                              ),
                              trailing:
                                  lesson.isCompleted
                                      ? const Icon(
                                        Icons.check,
                                        color: Colors.green,
                                      )
                                      : null,
                            ),
                          );
                        },
                      ),
                      const SizedBox(height: 20),
                    ],
                  );
                },
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Implement download functionality
        },
        backgroundColor: Colors.blue,
        child: const Icon(Icons.download),
      ),
    );
  }
}

class CourseSection {
  final String title;
  final List<Lesson> lessons;

  CourseSection({required this.title, required this.lessons});
}

class Lesson {
  final String title;
  final String duration;
  final String type;
  final bool isCompleted;

  Lesson({
    required this.title,
    required this.duration,
    required this.type,
    required this.isCompleted,
  });
}
