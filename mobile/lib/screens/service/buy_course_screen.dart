import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../service/detail/course_details_screen.dart';

class Course {
  final int courseId;
  final String courseName;
  final String courseDescription;
  final String headline;
  final double rating;
  final int price;
  final int discount;
  final String imageUrl;
  final String typeName;

  Course({
    required this.courseId,
    required this.courseName,
    required this.courseDescription,
    required this.headline,
    required this.rating,
    required this.price,
    required this.discount,
    required this.imageUrl,
    required this.typeName,
  });

  factory Course.fromJson(Map<String, dynamic> json) {
    return Course(
      courseId: json['courseId'] as int,
      courseName: json['courseName'] as String,
      courseDescription: json['courseDescription'] as String,
      headline: json['headline'] as String,
      rating: (json['rating'] as num).toDouble(),
      price: json['price'] as int,
      discount: json['discount'] as int,
      imageUrl: json['imageUrl'] as String,
      typeName: json['typeName'] as String,
    );
  }
}

class BuyCourseScreen extends StatefulWidget {
  const BuyCourseScreen({Key? key}) : super(key: key);

  @override
  State<BuyCourseScreen> createState() => _BuyCourseScreenState();
}

class _BuyCourseScreenState extends State<BuyCourseScreen> {
  List<Course> courses = [];
  List<Course> filteredCourses = [];
  bool isLoading = true;
  String errorMessage = '';

  // Khai báo các biến để lưu trữ bộ lọc
  String searchQuery = '';
  double? minRating;
  int? minPrice;
  int? maxPrice;
  String? selectedType;

  // Danh sách các loại nhạc cụ duy nhất
  List<String> instrumentTypes = [];

  // Controller cho text field tìm kiếm
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
          'https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/Course/get-all',
        ),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['isSucceed'] == true) {
          final List<dynamic> coursesData = data['data'];
          setState(() {
            courses = coursesData.map((json) => Course.fromJson(json)).toList();
            filteredCourses = List.from(courses);
            isLoading = false;

            // Lấy danh sách các loại nhạc cụ duy nhất
            instrumentTypes =
                courses.map((course) => course.typeName).toSet().toList()
                  ..sort();
          });
        } else {
          setState(() {
            isLoading = false;
            errorMessage =
                data['message'] ?? 'Không thể tải danh sách khóa học';
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

  // Áp dụng bộ lọc vào danh sách khóa học
  void _applyFilters() {
    setState(() {
      filteredCourses =
          courses.where((course) {
            // Lọc theo từ khóa tìm kiếm
            final matchesSearch =
                searchQuery.isEmpty ||
                course.courseName.toLowerCase().contains(
                  searchQuery.toLowerCase(),
                ) ||
                course.headline.toLowerCase().contains(
                  searchQuery.toLowerCase(),
                ) ||
                course.courseDescription.toLowerCase().contains(
                  searchQuery.toLowerCase(),
                );

            // Lọc theo rating
            final matchesRating =
                minRating == null || course.rating >= minRating!;

            // Lọc theo giá
            final matchesMinPrice =
                minPrice == null || course.price >= minPrice!;
            final matchesMaxPrice =
                maxPrice == null || course.price <= maxPrice!;

            // Lọc theo loại nhạc cụ
            final matchesType =
                selectedType == null || course.typeName == selectedType;

            return matchesSearch &&
                matchesRating &&
                matchesMinPrice &&
                matchesMaxPrice &&
                matchesType;
          }).toList();
    });
  }

  // Hiển thị dialog để chọn bộ lọc
  void _showFilterDialog() {
    // Giá trị tạm thời để lưu các lựa chọn trong dialog
    double? tempMinRating = minRating;
    int? tempMinPrice = minPrice;
    int? tempMaxPrice = maxPrice;
    String? tempSelectedType = selectedType;

    showDialog(
      context: context,
      builder: (BuildContext context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              title: const Text('Lọc khóa học'),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Lọc theo rating
                    const Text(
                      'Rating tối thiểu:',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    Slider(
                      value: tempMinRating ?? 0,
                      min: 0,
                      max: 5,
                      divisions: 10,
                      label: tempMinRating?.toStringAsFixed(1) ?? '0.0',
                      onChanged: (value) {
                        setDialogState(() {
                          tempMinRating = value;
                        });
                      },
                    ),

                    const SizedBox(height: 20),

                    // Lọc theo khoảng giá
                    const Text(
                      'Khoảng giá:',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            decoration: const InputDecoration(
                              labelText: 'Giá tối thiểu',
                              hintText: '0',
                              border: OutlineInputBorder(),
                            ),
                            keyboardType: TextInputType.number,
                            controller: TextEditingController(
                              text: tempMinPrice?.toString() ?? '',
                            ),
                            onChanged: (value) {
                              tempMinPrice =
                                  value.isNotEmpty ? int.tryParse(value) : null;
                            },
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: TextField(
                            decoration: const InputDecoration(
                              labelText: 'Giá tối đa',
                              hintText: '1.000.000',
                              border: OutlineInputBorder(),
                            ),
                            keyboardType: TextInputType.number,
                            controller: TextEditingController(
                              text: tempMaxPrice?.toString() ?? '',
                            ),
                            onChanged: (value) {
                              tempMaxPrice =
                                  value.isNotEmpty ? int.tryParse(value) : null;
                            },
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 20),

                    // Lọc theo loại nhạc cụ
                    const Text(
                      'Loại nhạc cụ:',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    DropdownButton<String>(
                      isExpanded: true,
                      value: tempSelectedType,
                      hint: const Text('Tất cả loại nhạc cụ'),
                      onChanged: (String? newValue) {
                        setDialogState(() {
                          tempSelectedType = newValue;
                        });
                      },
                      items: [
                        // Thêm lựa chọn "Tất cả"
                        const DropdownMenuItem<String>(
                          value: null,
                          child: Text('Tất cả'),
                        ),
                        ...instrumentTypes.map<DropdownMenuItem<String>>((
                          String value,
                        ) {
                          return DropdownMenuItem<String>(
                            value: value,
                            child: Text(value),
                          );
                        }).toList(),
                      ],
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () {
                    Navigator.of(context).pop();
                  },
                  child: const Text('Hủy'),
                ),
                TextButton(
                  onPressed: () {
                    // Áp dụng bộ lọc
                    setState(() {
                      minRating = tempMinRating;
                      minPrice = tempMinPrice;
                      maxPrice = tempMaxPrice;
                      selectedType = tempSelectedType;
                    });
                    _applyFilters();
                    Navigator.of(context).pop();
                  },
                  child: const Text('Áp dụng'),
                ),
                TextButton(
                  onPressed: () {
                    // Xóa bộ lọc
                    setState(() {
                      minRating = null;
                      minPrice = null;
                      maxPrice = null;
                      selectedType = null;
                      searchQuery = '';
                      _searchController.clear();
                      filteredCourses = List.from(courses);
                    });
                    Navigator.of(context).pop();
                  },
                  child: const Text('Xóa bộ lọc'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  String _formatCurrency(int amount) {
    return '${amount.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.')} VND';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mua khóa học'),
        backgroundColor: const Color(0xFF8C9EFF),
        actions: [
          // Nút hiển thị dialog lọc
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: _showFilterDialog,
          ),
        ],
      ),
      body: Column(
        children: [
          // Thanh tìm kiếm
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Tìm kiếm khóa học...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon:
                    searchQuery.isNotEmpty
                        ? IconButton(
                          icon: const Icon(Icons.clear),
                          onPressed: () {
                            setState(() {
                              _searchController.clear();
                              searchQuery = '';
                              _applyFilters();
                            });
                          },
                        )
                        : null,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
                filled: true,
                fillColor: Colors.white,
              ),
              onChanged: (value) {
                setState(() {
                  searchQuery = value;
                  _applyFilters();
                });
              },
            ),
          ),

          // Hiển thị các bộ lọc đã chọn
          if (minRating != null ||
              minPrice != null ||
              maxPrice != null ||
              selectedType != null)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8.0),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    if (minRating != null)
                      _buildFilterChip(
                        'Rating ≥ ${minRating!.toStringAsFixed(1)}',
                        () {
                          setState(() {
                            minRating = null;
                            _applyFilters();
                          });
                        },
                      ),
                    if (minPrice != null)
                      _buildFilterChip(
                        'Giá từ ${_formatCurrency(minPrice!)}',
                        () {
                          setState(() {
                            minPrice = null;
                            _applyFilters();
                          });
                        },
                      ),
                    if (maxPrice != null)
                      _buildFilterChip(
                        'Giá đến ${_formatCurrency(maxPrice!)}',
                        () {
                          setState(() {
                            maxPrice = null;
                            _applyFilters();
                          });
                        },
                      ),
                    if (selectedType != null)
                      _buildFilterChip('Loại: $selectedType', () {
                        setState(() {
                          selectedType = null;
                          _applyFilters();
                        });
                      }),
                  ],
                ),
              ),
            ),

          // Hiển thị số lượng kết quả
          Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: 12.0,
              vertical: 4.0,
            ),
            child: Row(
              children: [
                Text(
                  'Đã tìm thấy ${filteredCourses.length} khóa học',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
                const Spacer(),
                // Nút sắp xếp
                PopupMenuButton<String>(
                  icon: const Row(
                    children: [
                      Icon(Icons.sort),
                      SizedBox(width: 4),
                      Text('Sắp xếp', style: TextStyle(fontSize: 14)),
                    ],
                  ),
                  onSelected: (String value) {
                    setState(() {
                      switch (value) {
                        case 'price_asc':
                          filteredCourses.sort(
                            (a, b) => a.price.compareTo(b.price),
                          );
                          break;
                        case 'price_desc':
                          filteredCourses.sort(
                            (a, b) => b.price.compareTo(a.price),
                          );
                          break;
                        case 'rating_desc':
                          filteredCourses.sort(
                            (a, b) => b.rating.compareTo(a.rating),
                          );
                          break;
                        case 'name_asc':
                          filteredCourses.sort(
                            (a, b) => a.courseName.compareTo(b.courseName),
                          );
                          break;
                      }
                    });
                  },
                  itemBuilder:
                      (BuildContext context) => <PopupMenuEntry<String>>[
                        const PopupMenuItem<String>(
                          value: 'price_asc',
                          child: Text('Giá: Thấp đến cao'),
                        ),
                        const PopupMenuItem<String>(
                          value: 'price_desc',
                          child: Text('Giá: Cao đến thấp'),
                        ),
                        const PopupMenuItem<String>(
                          value: 'rating_desc',
                          child: Text('Rating: Cao nhất'),
                        ),
                        const PopupMenuItem<String>(
                          value: 'name_asc',
                          child: Text('Tên: A-Z'),
                        ),
                      ],
                ),
              ],
            ),
          ),

          // Phần còn lại của giao diện
          Expanded(
            child:
                isLoading
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
                                minPrice = null;
                                maxPrice = null;
                                selectedType = null;
                                searchQuery = '';
                                _searchController.clear();
                                filteredCourses = List.from(courses);
                              });
                            },
                            child: const Text('Xóa bộ lọc'),
                          ),
                        ],
                      ),
                    )
                    : Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: GridView.builder(
                        gridDelegate:
                            const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 2,
                              crossAxisSpacing: 8,
                              mainAxisSpacing: 10,
                              childAspectRatio: 0.8,
                            ),
                        itemCount: filteredCourses.length,
                        itemBuilder: (context, index) {
                          final course = filteredCourses[index];
                          return _buildCourseCard(course);
                        },
                      ),
                    ),
          ),
        ],
      ),
    );
  }

  // Widget hiển thị chip cho bộ lọc
  Widget _buildFilterChip(String label, VoidCallback onDelete) {
    return Padding(
      padding: const EdgeInsets.only(right: 8.0),
      child: Chip(
        label: Text(label, style: const TextStyle(fontSize: 12)),
        deleteIcon: const Icon(Icons.close, size: 16),
        onDeleted: onDelete,
        backgroundColor: Colors.blue[100],
        deleteIconColor: Colors.blue[800],
        labelStyle: TextStyle(color: Colors.blue[800]),
        visualDensity: VisualDensity.compact,
      ),
    );
  }

  Widget _buildCourseCard(Course course) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => CourseDetailsScreen(course: course),
          ),
        );
      },
      child: Card(
        elevation: 3,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(10),
              ),
              child: Image.network(
                course.imageUrl,
                height: 120,
                width: double.infinity,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    height: 120,
                    width: double.infinity,
                    color: Colors.grey[300],
                    child: const Icon(
                      Icons.broken_image,
                      size: 40,
                      color: Colors.grey,
                    ),
                  );
                },
              ),
            ),

            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(8.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Flexible(
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 6,
                                  vertical: 2,
                                ),
                                decoration: BoxDecoration(
                                  color: Colors.blue[100],
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  course.typeName,
                                  style: TextStyle(
                                    fontSize: 10,
                                    color: Colors.blue[800],
                                    fontWeight: FontWeight.bold,
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                  maxLines: 1,
                                ),
                              ),
                            ),
                            Row(
                              children: [
                                Icon(
                                  Icons.star,
                                  size: 12,
                                  color: Colors.amber[700],
                                ),
                                const SizedBox(width: 2),
                                Text(
                                  course.rating.toString(),
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 11,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),

                        const SizedBox(height: 8),

                        Text(
                          course.courseName,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),

                        const SizedBox(height: 4),

                        Text(
                          course.headline,
                          style: const TextStyle(
                            fontSize: 11,
                            color: Colors.black87,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),

                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _formatCurrency(course.price),
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: Colors.blue,
                          ),
                        ),

                        const SizedBox(height: 8),

                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(
                                    'Đã thêm khóa học ${course.courseName} vào giỏ hàng',
                                  ),
                                  duration: const Duration(seconds: 2),
                                ),
                              );
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.blue[700],
                              padding: const EdgeInsets.symmetric(
                                horizontal: 6,
                                vertical: 0,
                              ),
                              minimumSize: const Size(0, 32),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(6),
                              ),
                            ),
                            child: const Text(
                              'Mua ngay',
                              style: TextStyle(fontSize: 12),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
