import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

class PaymentScreen extends StatefulWidget {
  final String paymentUrl;

  const PaymentScreen({Key? key, required this.paymentUrl}) : super(key: key);

  @override
  _PaymentScreenState createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  late final WebViewController _controller;
  bool _isPaymentComplete = false;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (String url) {
            print('Page started loading: $url');
          },
          onPageFinished: (String url) {
            print('Page finished loading: $url');
            _checkPaymentStatus(url);
          },
          onNavigationRequest: (NavigationRequest request) {
            print('Navigation request: ${request.url}');
            _checkPaymentStatus(request.url);
            return NavigationDecision.navigate;
          },
        ),
      )
      ..loadRequest(Uri.parse(widget.paymentUrl));
  }

  // Kiểm tra trạng thái thanh toán từ URL hoặc nội dung trang
  void _checkPaymentStatus(String url) {
    // Các URL hoặc chuỗi đánh dấu thanh toán thành công
    if (url.contains('success') ||
        url.contains('thanh-toan-thanh-cong') ||
        url.contains('payment-success') ||
        url.contains('return_url')) {
      setState(() {
        _isPaymentComplete = true;
      });

      // Hiển thị thông báo và quay lại màn hình wallet
      _showPaymentSuccessAndReturn();
    }
  }

  // Hiển thị thông báo và quay về màn hình wallet
  void _showPaymentSuccessAndReturn() {
    if (_isPaymentComplete) {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (BuildContext context) {
          return AlertDialog(
            title: const Text('Thanh toán thành công'),
            content: const Text(
                'Giao dịch nạp tiền của bạn đã được xử lý thành công.'),
            actions: [
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(context); // Đóng dialog
                  Navigator.pop(context,
                      true); // Quay về màn hình wallet với kết quả thành công
                },
                child: const Text('OK'),
              ),
            ],
          );
        },
      );
    }
  }

  // Hiển thị nút quay lại khi đã thanh toán xong
  Widget _buildCompleteButton() {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Align(
          alignment: Alignment.bottomCenter,
          child: ElevatedButton.icon(
            icon: const Icon(Icons.check_circle),
            label: const Text('Hoàn tất thanh toán'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.green,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            ),
            onPressed: () {
              Navigator.pop(context,
                  true); // Quay về màn hình wallet với kết quả thành công
            },
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Thanh toán"),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              _controller.reload();
            },
            tooltip: 'Làm mới trang',
          ),
        ],
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_isPaymentComplete) _buildCompleteButton(),
        ],
      ),
    );
  }
}
