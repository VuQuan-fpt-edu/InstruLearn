import 'package:flutter/material.dart';
import 'detail/my_course.dart';

class LibraryScreen extends StatefulWidget {
  const LibraryScreen({Key? key}) : super(key: key);

  @override
  State<LibraryScreen> createState() => _LibraryScreenState();
}

class _LibraryScreenState extends State<LibraryScreen> {
  final TextEditingController _searchController = TextEditingController();
  List<Course> courses = [
    Course(
      title: 'Dạy đánh đàn Piano cơ bản - DÀNH CHO NGƯỜI MỚI NHẬP MÔN',
      imageUrl: 'https://images.unsplash.com/photo-1552422535-c45813c61732',
      rating: 4.5,
    ),
    Course(
      title: 'Dạy đánh đàn Piano cơ bản - DÀNH CHO NGƯỜI MỚI NHẬP MÔN',
      imageUrl: 'https://images.unsplash.com/photo-1552422535-c45813c61732',
      rating: 5.0,
    ),
    Course(
      title: 'Dạy đánh đàn Piano cơ bản - DÀNH CHO NGƯỜI MỚI NHẬP MÔN',
      imageUrl: 'https://images.unsplash.com/photo-1552422535-c45813c61732',
      rating: 4.0,
    ),
  ];
  List<Course> filteredCourses = [];

  @override
  void initState() {
    super.initState();
    filteredCourses = courses;
  }

  void _filterCourses(String query) {
    setState(() {
      if (query.isEmpty) {
        filteredCourses = courses;
      } else {
        filteredCourses =
            courses
                .where(
                  (course) =>
                      course.title.toLowerCase().contains(query.toLowerCase()),
                )
                .toList();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Library'),
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
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.grey[200],
                  borderRadius: BorderRadius.circular(25),
                ),
                child: TextField(
                  controller: _searchController,
                  onChanged: _filterCourses,
                  decoration: InputDecoration(
                    hintText: 'Search for your Course.....',
                    prefixIcon: const Icon(Icons.search, color: Colors.grey),
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 15,
                    ),
                  ),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Các Khóa Học Của Tôi',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  IconButton(
                    icon: const Icon(Icons.menu),
                    onPressed: () {
                      // Xử lý khi nhấn nút menu
                    },
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: filteredCourses.length,
                itemBuilder: (context, index) {
                  return _buildCourseCard(filteredCourses[index]);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCourseCard(Course course) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => MyCourseScreen(courseTitle: course.title),
          ),
        );
      },
      child: Container(
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
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(12),
                topRight: Radius.circular(12),
              ),
              child: Image.network(
                course.imageUrl,
                height: 150,
                width: double.infinity,
                fit: BoxFit.cover,
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    course.title,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      ...List.generate(5, (index) {
                        if (index < course.rating.floor()) {
                          return const Icon(
                            Icons.star,
                            color: Colors.amber,
                            size: 16,
                          );
                        } else if (index < course.rating) {
                          return const Icon(
                            Icons.star_half,
                            color: Colors.amber,
                            size: 16,
                          );
                        }
                        return const Icon(
                          Icons.star_border,
                          color: Colors.amber,
                          size: 16,
                        );
                      }),
                    ],
                  ),
                ],
              ),
            ),
            const Divider(height: 1),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }
}

class Course {
  final String title;
  final String imageUrl;
  final double rating;

  Course({required this.title, required this.imageUrl, required this.rating});
}
