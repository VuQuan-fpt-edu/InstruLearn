import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'buy_course_screen.dart';

class InstrumentType {
  final int courseTypeId;
  final String courseTypeName;

  InstrumentType({
    required this.courseTypeId,
    required this.courseTypeName,
  });

  factory InstrumentType.fromJson(Map<String, dynamic> json) {
    return InstrumentType(
      courseTypeId: json['courseTypeId'] as int,
      courseTypeName: json['courseTypeName'] as String,
    );
  }
}

class FilterScreen extends StatefulWidget {
  final FilterOptions initialFilters;
  final int courseCount;

  const FilterScreen({
    Key? key,
    required this.initialFilters,
    required this.courseCount,
  }) : super(key: key);

  @override
  State<FilterScreen> createState() => _FilterScreenState();
}

class _FilterScreenState extends State<FilterScreen> {
  late FilterOptions filters;
  List<InstrumentType> instrumentTypes = [];
  bool isLoading = true;
  String? errorMessage;

  @override
  void initState() {
    super.initState();
    filters = widget.initialFilters;
    fetchInstrumentTypes();
  }

  Future<void> fetchInstrumentTypes() async {
    try {
      final response = await http.get(
        Uri.parse(
          'https://instrulearnapplication.azurewebsites.net/api/CourseType/get-all',
        ),
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> responseData = json.decode(response.body);
        if (responseData['isSucceed'] == true) {
          final List<dynamic> data = responseData['data'];
          setState(() {
            instrumentTypes =
                data.map((item) => InstrumentType.fromJson(item)).toList();
            isLoading = false;
          });
        } else {
          setState(() {
            errorMessage = responseData['message'] ??
                'Không thể tải danh sách loại khóa học';
            isLoading = false;
          });
        }
      } else {
        setState(() {
          errorMessage = 'Lỗi máy chủ: ${response.statusCode}';
          isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        errorMessage = 'Lỗi kết nối: $e';
        isLoading = false;
      });
    }
  }

  Widget _buildRatingRadio(String label, double value) {
    return RadioListTile<double>(
      title: Text(label, style: const TextStyle(color: Colors.black87)),
      value: value,
      groupValue: filters.minRating,
      onChanged: (double? newValue) {
        setState(() {
          filters = filters.copyWith(minRating: newValue);
        });
      },
      activeColor: const Color(0xFF8C9EFF),
      contentPadding: EdgeInsets.zero,
      dense: true,
    );
  }

  Widget _buildInstrumentTypeSection() {
    if (isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: Color(0xFF8C9EFF)),
      );
    }

    if (errorMessage != null) {
      return Column(
        children: [
          Text(
            'Error: $errorMessage',
            style: const TextStyle(color: Colors.black87),
          ),
          ElevatedButton(
            onPressed: () {
              setState(() {
                isLoading = true;
                errorMessage = null;
              });
              fetchInstrumentTypes();
            },
            child: const Text('Retry'),
          ),
        ],
      );
    }

    return Column(
      children: instrumentTypes.map((type) {
        return RadioListTile<String>(
          title: Text(
            type.courseTypeName,
            style: const TextStyle(color: Colors.black87),
          ),
          value: type.courseTypeName,
          groupValue: filters.selectedType,
          onChanged: (value) {
            setState(() {
              filters = filters.copyWith(selectedType: value);
            });
          },
          activeColor: const Color(0xFF8C9EFF),
          contentPadding: EdgeInsets.zero,
          dense: true,
        );
      }).toList(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [const Color(0xFF8C9EFF).withOpacity(0.2), Colors.white],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.arrow_back,
                          color: Color(0xFF8C9EFF)),
                      onPressed: () => Navigator.of(context).pop(),
                    ),
                    Text(
                      '${widget.courseCount} Khóa Học',
                      style: const TextStyle(
                        color: Colors.black87,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                Expanded(
                  child: SingleChildScrollView(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 20),
                        const Text(
                          'Giá',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                        ),
                        RangeSlider(
                          values: RangeValues(
                            filters.minPrice.toDouble(),
                            filters.maxPrice.toDouble(),
                          ),
                          min: 0,
                          max: 5000000,
                          divisions: 50,
                          labels: RangeLabels(
                            '${filters.minPrice}đ',
                            '${filters.maxPrice}đ',
                          ),
                          onChanged: (RangeValues values) {
                            setState(() {
                              filters = filters.copyWith(
                                minPrice: values.start.toInt(),
                                maxPrice: values.end.toInt(),
                              );
                            });
                          },
                          activeColor: const Color(0xFF8C9EFF),
                          inactiveColor:
                              const Color(0xFF8C9EFF).withOpacity(0.3),
                        ),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              '0đ',
                              style: TextStyle(color: Colors.black87),
                            ),
                            const Text(
                              '5,000,000đ',
                              style: TextStyle(color: Colors.black87),
                            ),
                          ],
                        ),
                        const SizedBox(height: 20),
                        const Text(
                          'Loại Nhạc Cụ',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                        ),
                        const SizedBox(height: 10),
                        _buildInstrumentTypeSection(),
                        const SizedBox(height: 20),
                        const Text(
                          'Xếp hạng',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                        ),
                        const SizedBox(height: 10),
                        Column(
                          children: [
                            _buildRatingRadio('Từ 4.5 trở lên (76)', 4.5),
                            _buildRatingRadio('Từ 4 trở lên (70)', 4.0),
                            _buildRatingRadio('Từ 3,5 trở lên (30)', 3.5),
                            _buildRatingRadio('Từ 3 trở lên (10)', 3.0),
                          ],
                        ),
                        const SizedBox(height: 20),
                        const Text(
                          'Sắp xếp theo',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                        ),
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: const Color(0xFF8C9EFF).withOpacity(0.1),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: DropdownButton<String>(
                            isExpanded: true,
                            value: filters.sortOption,
                            dropdownColor: Colors.white,
                            style: const TextStyle(color: Colors.black87),
                            icon: const Icon(
                              Icons.arrow_drop_down,
                              color: Color(0xFF8C9EFF),
                            ),
                            underline: Container(),
                            onChanged: (String? newValue) {
                              setState(() {
                                filters = filters.copyWith(
                                  sortOption: newValue,
                                );
                              });
                            },
                            items: <String>[
                              'Xếp hạng',
                              'Giá: Thấp đến cao',
                              'Giá: Cao đến thấp',
                              'Tên: A-Z',
                            ].map<DropdownMenuItem<String>>((String value) {
                              return DropdownMenuItem<String>(
                                value: value,
                                child: Text(value),
                              );
                            }).toList(),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(top: 16.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      TextButton(
                        onPressed: () {
                          setState(() {
                            filters = FilterOptions();
                          });
                        },
                        child: const Text(
                          'Thiết Lập lại',
                          style: TextStyle(
                            color: Color(0xFF8C9EFF),
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      ElevatedButton(
                        onPressed: () {
                          Navigator.of(context).pop(filters);
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF8C9EFF),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 20,
                            vertical: 10,
                          ),
                        ),
                        child: const Text(
                          'Áp dụng',
                          style: TextStyle(fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
