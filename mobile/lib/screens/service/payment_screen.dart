import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

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

  Future<void> updatePaymentStatus(String orderCode, String status) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token == null) return;

      print('Updating payment status - orderCode: $orderCode, status: $status');

      final response = await http.put(
        Uri.parse(
          'https://instrulearnapplication.azurewebsites.net/api/wallet/update-payment-status-by-ordercode',
        ),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer $token',
        },
        body:
            json.encode({"orderCode": int.parse(orderCode), "status": status}),
      );

      print('Update payment status response: ${response.body}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['isSucceed'] == true) {
          print('Payment status updated successfully');
        } else {
          print('Failed to update payment status: ${data['message']}');
        }
      } else {
        print(
            'Failed to update payment status. Status code: ${response.statusCode}');
      }
    } catch (e) {
      print('Error updating payment status: $e');
    }
  }

  void _checkPaymentStatus(String url) {
    print('Checking payment status for URL: $url');

    try {
      final uri = Uri.parse(url);
      final queryParams = uri.queryParameters;

      if (queryParams.containsKey('orderCode') &&
          queryParams.containsKey('status')) {
        final orderCode = queryParams['orderCode'];
        final status = queryParams['status'];

        if (orderCode != null && status != null) {
          print('Found orderCode: $orderCode and status: $status');
          updatePaymentStatus(orderCode, status);

          if (status.toUpperCase() == 'PAID') {
            setState(() {
              _isPaymentComplete = true;
            });
            _showPaymentSuccessAndReturn();
          }
        }
      } else if (url.contains('vnpay-return')) {
        _handleVNPayReturn(url);
      } else if (url.contains('success') ||
          url.contains('thanh-toan-thanh-cong') ||
          url.contains('payment-success') ||
          url.contains('return_url')) {
        setState(() {
          _isPaymentComplete = true;
        });
        _showPaymentSuccessAndReturn();
      }
    } catch (e) {
      print('Error parsing URL: $e');
    }
  }

  Future<void> _handleVNPayReturn(String url) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token == null) return;

      final response = await http.get(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['isSucceed'] == true) {
          final String? imageUrl = data['data']?['link'];
          if (imageUrl != null) {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(
                builder: (context) => PaymentSuccessScreen(imageUrl: imageUrl),
              ),
            );
          }
        }
      }
    } catch (e) {
      print('Error handling VNPay return: $e');
    }
  }

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
                  Navigator.pop(context);
                  Navigator.pop(context, true);
                },
                child: const Text('OK'),
              ),
            ],
          );
        },
      );
    }
  }

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
              Navigator.pop(context, true);
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

class PaymentSuccessScreen extends StatelessWidget {
  final String imageUrl;

  const PaymentSuccessScreen({Key? key, required this.imageUrl})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              mainAxisSize: MainAxisSize.min,
              children: [
                Flexible(
                  child: Image.network(
                    imageUrl,
                    fit: BoxFit.contain,
                    loadingBuilder: (context, child, loadingProgress) {
                      if (loadingProgress == null) return child;
                      return const Center(child: CircularProgressIndicator());
                    },
                    errorBuilder: (context, error, stackTrace) {
                      return const Center(
                        child: Icon(
                          Icons.error,
                          color: Colors.red,
                          size: 48,
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context, true);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    padding: const EdgeInsets.symmetric(
                        horizontal: 32, vertical: 16),
                  ),
                  child: const Text(
                    'Hoàn tất',
                    style: TextStyle(fontSize: 16),
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
