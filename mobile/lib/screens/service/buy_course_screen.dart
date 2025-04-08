import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'detail/course_details_screen.dart';
import 'filter_screen.dart';

class Course {
  final int coursePackageId;
  final String courseName;
  final String courseDescription;
  final String headline;
  final double rating;
  final int price;
  final int discount;
  final String imageUrl;
  final String typeName;
  final int durationInHours;
  final int coursePackageType;

  Course({
    required this.coursePackageId,
    required this.courseName,
    required this.courseDescription,
    required this.headline,
    required this.rating,
    required this.price,
    required this.discount,
    required this.imageUrl,
    required this.typeName,
    this.durationInHours = 0,
    this.coursePackageType = 0,
  });

  factory Course.fromJson(Map<String, dynamic> json) {
    return Course(
      coursePackageId: json['coursePackageId'],
      courseName: json['courseName'] as String,
      courseDescription: json['courseDescription'] as String,
      headline: json['headline'] as String,
      rating: (json['rating'] as num).toDouble(),
      price: (json['price'] as num).toInt(),
      discount: (json['discount'] as num).toInt(),
      imageUrl: json['imageUrl'] as String,
      typeName: json['typeName'] as String,
      durationInHours: json['durationInHours'] != null
          ? (json['durationInHours'] as num).toInt()
          : 0,
      coursePackageType: json['coursePackageType'] != null
          ? (json['coursePackageType'] as num).toInt()
          : 0,
    );
  }
}

class FilterOptions {
  double? minRating;
  int minPrice;
  int maxPrice;
  String? selectedType;
  String? selectedDuration;
  String sortOption;
  int? selectedTypeId;

  FilterOptions({
    this.minRating,
    this.minPrice = 0,
    this.maxPrice = 5000000,
    this.selectedType,
    this.selectedDuration,
    this.sortOption = 'Xếp hạng',
    this.selectedTypeId,
  });

  FilterOptions copyWith({
    double? minRating,
    int? minPrice,
    int? maxPrice,
    String? selectedType,
    String? selectedDuration,
    String? sortOption,
    int? selectedTypeId,
  }) {
    return FilterOptions(
      minRating: minRating ?? this.minRating,
      minPrice: minPrice ?? this.minPrice,
      maxPrice: maxPrice ?? this.maxPrice,
      selectedType: selectedType ?? this.selectedType,
      selectedDuration: selectedDuration ?? this.selectedDuration,
      sortOption: sortOption ?? this.sortOption,
      selectedTypeId: selectedTypeId ?? this.selectedTypeId,
    );
  }
}

class BuyCourseScreen extends StatefulWidget {
  final Course? course;

  const BuyCourseScreen({Key? key, this.course}) : super(key: key);

  @override
  State<BuyCourseScreen> createState() => _BuyCourseScreenState();
}

class _BuyCourseScreenState extends State<BuyCourseScreen> {
  List<Course> courses = [];
  List<Course> filteredCourses = [];
  bool isLoading = true;
  String errorMessage = '';

  String searchQuery = '';
  double? minRating;
  int minPrice = 0;
  int maxPrice = 5000000;
  String? selectedType;
  String? selectedDuration;
  String sortOption = 'Xếp hạng';

  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchCourses();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _fetchCourses() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token == null) {
        setState(() {
          isLoading = false;
          errorMessage = 'Bạn cần đăng nhập để xem khóa học';
        });
        return;
      }

      final response = await http.get(
        Uri.parse(
          'https://instrulearnapplication2025-h7hfdte3etdth7av.southeastasia-01.azurewebsites.net/api/Course/get-all',
        ),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        try {
          final List<dynamic> data = json.decode(response.body);

          setState(() {
            courses = data.map((item) => Course.fromJson(item)).toList();
            filteredCourses = courses
                .where((course) =>
                    course.coursePackageType == 0 ||
                    course.coursePackageType == 2)
                .toList();
            isLoading = false;
          });
        } catch (e) {
          setState(() {
            isLoading = false;
            errorMessage = 'Lỗi xử lý dữ liệu: ${e.toString()}';
          });
        }
      } else if (response.statusCode == 401) {
        setState(() {
          isLoading = false;
          errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        });
      } else {
        setState(() {
          isLoading = false;
          errorMessage = 'Lỗi kết nối: ${response.statusCode}';
        });
      }
    } catch (e) {
      setState(() {
        isLoading = false;
        errorMessage = 'Lỗi: ${e.toString()}';
      });
    }
  }

  void _applyFilters() {
    setState(() {
      filteredCourses = courses.where((course) {
        if (course.coursePackageType != 0 && course.coursePackageType != 2) {
          return false;
        }

        final matchesSearch = searchQuery.isEmpty ||
            course.courseName.toLowerCase().contains(
                  searchQuery.toLowerCase(),
                ) ||
            course.headline.toLowerCase().contains(
                  searchQuery.toLowerCase(),
                ) ||
            course.courseDescription.toLowerCase().contains(
                  searchQuery.toLowerCase(),
                );

        final matchesRating = minRating == null || course.rating >= minRating!;

        final matchesMinPrice = course.price >= minPrice;
        final matchesMaxPrice = course.price <= maxPrice;

        final matchesType =
            selectedType == null || course.typeName == selectedType;

        final matchesDuration = selectedDuration == null ||
            _matchesDuration(course.durationInHours, selectedDuration!);

        return matchesSearch &&
            matchesRating &&
            matchesMinPrice &&
            matchesMaxPrice &&
            matchesType &&
            matchesDuration;
      }).toList();
      _applySorting();
    });
  }

  bool _matchesDuration(int hours, String durationFilter) {
    switch (durationFilter) {
      case '0-1 giờ':
        return hours >= 0 && hours <= 1;
      case '1-3 giờ':
        return hours > 1 && hours <= 3;
      case '6-17 giờ':
        return hours >= 6 && hours <= 17;
      case 'Hơn 17 giờ':
        return hours > 17;
      default:
        return true;
    }
  }

  void _applySorting() {
    switch (sortOption) {
      case 'Xếp hạng':
        filteredCourses.sort((a, b) => b.rating.compareTo(a.rating));
        break;
      case 'Giá: Thấp đến cao':
        filteredCourses.sort((a, b) => a.price.compareTo(b.price));
        break;
      case 'Giá: Cao đến thấp':
        filteredCourses.sort((a, b) => b.price.compareTo(a.price));
        break;
      case 'Tên: A-Z':
        filteredCourses.sort((a, b) => a.courseName.compareTo(b.courseName));
        break;
    }
  }

  void _openFilterScreen() async {
    final currentFilters = FilterOptions(
      minRating: minRating,
      minPrice: minPrice,
      maxPrice: maxPrice,
      selectedType: selectedType,
      selectedDuration: selectedDuration,
      sortOption: sortOption,
    );

    final result = await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => FilterScreen(
          initialFilters: currentFilters,
          courseCount: filteredCourses.length,
        ),
      ),
    );

    if (result != null && result is FilterOptions) {
      setState(() {
        minRating = result.minRating;
        minPrice = result.minPrice;
        maxPrice = result.maxPrice;
        selectedType = result.selectedType;
        selectedDuration = result.selectedDuration;
        sortOption = result.sortOption;
      });
      _applyFilters();
    }
  }

  String _formatCurrency(int amount) {
    return '${amount.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')} đ';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Purchase'),
        backgroundColor: Colors.blue,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.of(context).pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: _openFilterScreen,
          ),
        ],
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            color: Colors.grey[200],
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search for your Course.....',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: const Icon(Icons.menu),
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(30),
                  borderSide: BorderSide.none,
                ),
              ),
              onChanged: (value) {
                setState(() {
                  searchQuery = value;
                  _applyFilters();
                });
              },
            ),
          ),
          Expanded(
            child: isLoading
                ? const Center(child: CircularProgressIndicator())
                : errorMessage.isNotEmpty
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.all(20.0),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(
                                Icons.error_outline,
                                size: 60,
                                color: Colors.red,
                              ),
                              const SizedBox(height: 20),
                              Text(
                                errorMessage,
                                textAlign: TextAlign.center,
                                style: const TextStyle(fontSize: 16),
                              ),
                              const SizedBox(height: 20),
                              ElevatedButton(
                                onPressed: _fetchCourses,
                                child: const Text('Thử lại'),
                              ),
                            ],
                          ),
                        ),
                      )
                    : filteredCourses.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(
                                  Icons.search_off,
                                  size: 60,
                                  color: Colors.grey,
                                ),
                                const SizedBox(height: 10),
                                const Text(
                                  'Không tìm thấy khóa học phù hợp',
                                  style: TextStyle(fontSize: 16),
                                ),
                                const SizedBox(height: 20),
                                ElevatedButton(
                                  onPressed: () {
                                    setState(() {
                                      minRating = null;
                                      minPrice = 0;
                                      maxPrice = 5000000;
                                      selectedType = null;
                                      selectedDuration = null;
                                      searchQuery = '';
                                      _searchController.clear();
                                      filteredCourses = courses
                                          .where((course) =>
                                              course.coursePackageType == 0 ||
                                              course.coursePackageType == 2)
                                          .toList();
                                    });
                                  },
                                  child: const Text('Xóa bộ lọc'),
                                ),
                              ],
                            ),
                          )
                        : ListView.separated(
                            itemCount: filteredCourses.length,
                            separatorBuilder: (context, index) =>
                                const Divider(height: 1),
                            itemBuilder: (context, index) {
                              final course = filteredCourses[index];
                              return _buildCourseListItem(course);
                            },
                          ),
          ),
        ],
      ),
    );
  }

  Widget _buildCourseListItem(Course course) {
    return GestureDetector(
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (context) => CourseDetailsScreen(course: course),
          ),
        );
      },
      child: Container(
        padding: const EdgeInsets.all(10),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: Image.network(
                course.imageUrl,
                width: 80,
                height: 60,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    width: 80,
                    height: 60,
                    color: Colors.grey[300],
                    child: const Icon(Icons.broken_image, color: Colors.grey),
                  );
                },
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    course.courseName,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      ...List.generate(
                        5,
                        (index) => Icon(
                          Icons.star,
                          size: 14,
                          color: index < course.rating.floor()
                              ? Colors.orange
                              : Colors.grey[300],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _formatCurrency(course.price),
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                    ),
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
