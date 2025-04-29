import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../models/course_package.dart';
import '../../../screens/service/detail/video_player_screen.dart';
import 'package:dio/dio.dart';
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:open_filex/open_filex.dart';
import 'dart:io';

class MyCourseScreen extends StatefulWidget {
  final CoursePackage course;

  const MyCourseScreen({Key? key, required this.course}) : super(key: key);

  @override
  State<MyCourseScreen> createState() => _MyCourseScreenState();
}

class _MyCourseScreenState extends State<MyCourseScreen> {
  int _selectedContentIndex = 0;
  int _selectedItemIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          _buildAppBar(),
          SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildCourseInfo(),
                _buildContentList(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAppBar() {
    return SliverAppBar(
      expandedHeight: 200.0,
      pinned: true,
      flexibleSpace: FlexibleSpaceBar(
        title: Text(
          widget.course.courseName,
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
        background: Stack(
          fit: StackFit.expand,
          children: [
            Image.network(
              widget.course.imageUrl,
              fit: BoxFit.cover,
            ),
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.transparent,
                    Colors.black.withOpacity(0.7),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCourseInfo() {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            widget.course.headline,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            widget.course.courseDescription,
            style: TextStyle(
              fontSize: 16,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: 12,
              vertical: 6,
            ),
            decoration: BoxDecoration(
              color: const Color(0xFF8C9EFF).withOpacity(0.2),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              widget.course.typeName,
              style: const TextStyle(
                color: Color(0xFF8C9EFF),
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContentList() {
    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: widget.course.courseContents.length,
      itemBuilder: (context, contentIndex) {
        final content = widget.course.courseContents[contentIndex];
        return _buildContentSection(content, contentIndex);
      },
    );
  }

  Widget _buildContentSection(CourseContent content, int contentIndex) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 6,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: ExpansionTile(
        title: Text(
          content.heading,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        children: content.courseContentItems.map((item) {
          return _buildContentItem(
              item, contentIndex, content.courseContentItems.indexOf(item));
        }).toList(),
      ),
    );
  }

  Widget _buildContentItem(
      CourseContentItem item, int contentIndex, int itemIndex) {
    final isSelected = _selectedContentIndex == contentIndex &&
        _selectedItemIndex == itemIndex;

    return ListTile(
      leading: Container(
        width: 48,
        height: 48,
        decoration: BoxDecoration(
          color: isSelected
              ? const Color(0xFF8C9EFF).withOpacity(0.1)
              : Colors.grey[100],
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(
          item.itemTypeId == 1
              ? Icons.image
              : item.itemTypeId == 2
                  ? Icons.play_circle_outline
                  : Icons.description,
          color: isSelected ? const Color(0xFF8C9EFF) : Colors.grey[600],
        ),
      ),
      title: Text(
        'Bài ${itemIndex + 1}',
        style: TextStyle(
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          color: isSelected ? const Color(0xFF8C9EFF) : Colors.black,
        ),
      ),
      subtitle: Text(
        item.itemTypeId == 1
            ? 'Hình ảnh'
            : item.itemTypeId == 2
                ? 'Video'
                : 'Tài liệu',
        style: TextStyle(
          color: Colors.grey[600],
        ),
      ),
      trailing: Icon(
        isSelected ? Icons.play_circle : Icons.play_circle_outline,
        color: isSelected ? const Color(0xFF8C9EFF) : Colors.grey,
      ),
      onTap: () => _handleContentTap(item, contentIndex, itemIndex),
    );
  }

  void _handleContentTap(
      CourseContentItem item, int contentIndex, int itemIndex) {
    setState(() {
      _selectedContentIndex = contentIndex;
      _selectedItemIndex = itemIndex;
    });

    if (item.itemTypeId == 1) {
      // Hiển thị hình ảnh
      _showImageDialog(item.itemDes);
    } else if (item.itemTypeId == 2) {
      // Mở video
      _launchVideo(item.itemDes);
    } else if (item.itemTypeId == 3) {
      // Tải tài liệu
      _downloadDocument(item.itemDes);
    }
  }

  void _showImageDialog(String imageUrl) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Image.network(
              imageUrl,
              fit: BoxFit.contain,
            ),
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Đóng'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _launchVideo(String videoUrl) async {
    try {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => VideoPlayerScreen(
            title: 'Bài học video',
            videoUrl: videoUrl,
          ),
        ),
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi khi mở video: $e'),
          ),
        );
      }
    }
  }

  Future<void> _downloadDocument(String url) async {
    try {
      // Kiểm tra và yêu cầu quyền truy cập bộ nhớ
      if (Platform.isAndroid) {
        var status = await Permission.storage.status;
        if (!status.isGranted) {
          status = await Permission.storage.request();
          if (!status.isGranted) {
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content:
                      Text('Cần cấp quyền truy cập bộ nhớ để tải tài liệu'),
                  duration: Duration(seconds: 2),
                ),
              );
            }
            return;
          }
        }

        // Kiểm tra quyền quản lý bộ nhớ ngoài (Android 11 trở lên)
        if (await Permission.manageExternalStorage.status.isDenied) {
          await Permission.manageExternalStorage.request();
        }
      }

      // Hiển thị dialog loading
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (BuildContext context) {
          return const Center(
            child: CircularProgressIndicator(),
          );
        },
      );

      // Tạo thư mục Downloads nếu chưa tồn tại
      final directory = await getExternalStorageDirectory();
      final downloadDir = Directory('${directory!.path}/Downloads');
      if (!await downloadDir.exists()) {
        await downloadDir.create(recursive: true);
      }

      // Lấy tên file từ URL
      final fileName = url.split('/').last;
      final filePath = '${downloadDir.path}/$fileName';

      // Tải file
      final dio = Dio();
      await dio.download(
        url,
        filePath,
        onReceiveProgress: (received, total) {
          if (total != -1) {
            final progress = (received / total * 100).toStringAsFixed(0);
            // Có thể cập nhật progress ở đây nếu muốn
          }
        },
      );

      // Đóng dialog loading
      if (mounted) {
        Navigator.pop(context);
      }

      // Mở file
      final result = await OpenFilex.open(filePath);
      if (result.type != ResultType.done) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Không thể mở file: ${result.message}'),
              duration: const Duration(seconds: 2),
            ),
          );
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Đã tải và mở tài liệu thành công'),
              duration: Duration(seconds: 2),
            ),
          );
        }
      }
    } catch (e) {
      // Đóng dialog loading nếu có lỗi
      if (mounted) {
        Navigator.pop(context);
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi khi tải tài liệu: $e'),
            duration: const Duration(seconds: 2),
          ),
        );
      }
    }
  }
}
