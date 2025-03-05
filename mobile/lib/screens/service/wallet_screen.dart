import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';
import './payment_screen.dart';

class WalletScreen extends StatefulWidget {
  final int learnerId;

  const WalletScreen({Key? key, required this.learnerId}) : super(key: key);

  @override
  _WalletScreenState createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  double balance = 0;
  bool isLoading = true;
  List<Transaction> transactions = [];
  final TextEditingController _depositController = TextEditingController();
  final TextEditingController _withdrawController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchWalletDetails();
  }

  Future<void> _fetchWalletDetails() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token == null) return;

      final response = await http.get(
        Uri.parse(
          'https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/wallet/${widget.learnerId}',
        ),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['isSucceed'] == true) {
          setState(() {
            balance = data['data']['balance'].toDouble();
            isLoading = false;

            _fetchTransactionHistory();
          });
        }
      }
    } catch (e) {
      setState(() {
        isLoading = false;
      });
      _showErrorMessage('Lỗi tải thông tin ví: ${e.toString()}');
    }
  }

  Future<void> _fetchTransactionHistory() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token == null) return;

      final response = await http.get(
        Uri.parse(
          'https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/wallet/transactions/${widget.learnerId}',
        ),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['isSucceed'] == true) {
          setState(() {
            transactions =
                (data['data'] as List)
                    .map(
                      (transactionData) => Transaction(
                        id: transactionData['id'],
                        type: transactionData['type'],
                        amount: transactionData['amount'].toDouble(),
                        date: DateTime.parse(transactionData['date']),
                        status: transactionData['status'],
                      ),
                    )
                    .toList();
          });
        }
      }
    } catch (e) {
      _showErrorMessage('Lỗi tải lịch sử giao dịch: ${e.toString()}');
    }
  }

  Future<void> _createDepositTransaction() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token == null) {
        _showErrorMessage('Vui lòng đăng nhập');
        return;
      }

      final amount = int.tryParse(_depositController.text.trim());
      if (amount == null || amount <= 0) {
        _showErrorMessage('Số tiền không hợp lệ');
        return;
      }

      Navigator.of(context).pop();

      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (BuildContext context) {
          return const Center(child: CircularProgressIndicator());
        },
      );

      final response = await http.post(
        Uri.parse(
          'https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/wallet/add-funds',
        ),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer $token',
        },
        body: json.encode({'learnerId': widget.learnerId, 'amount': amount}),
      );

      Navigator.of(context).pop();

      final data = json.decode(response.body);
      if (data['isSucceed'] == true) {
        final paymentUrl = data['data']['paymentUrl'];

        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (context) => PaymentScreen(paymentUrl: paymentUrl),
          ),
        );
      } else {
        _showErrorMessage(data['message'] ?? 'Lỗi tạo giao dịch');
      }
    } catch (e) {
      Navigator.of(context).pop();
      _showErrorMessage('Lỗi: ${e.toString()}');
    }
  }

  Future<void> _createWithdrawTransaction() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');

      if (token == null) {
        _showErrorMessage('Vui lòng đăng nhập');
        return;
      }

      final amount = int.tryParse(_withdrawController.text.trim());
      if (amount == null || amount <= 0) {
        _showErrorMessage('Số tiền không hợp lệ');
        return;
      }

      if (amount > balance) {
        _showErrorMessage('Số dư không đủ');
        return;
      }

      Navigator.of(context).pop();

      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (BuildContext context) {
          return const Center(child: CircularProgressIndicator());
        },
      );

      final response = await http.post(
        Uri.parse(
          'https://instrulearnapplication-hqdkh8bedhb9e0ec.southeastasia-01.azurewebsites.net/api/wallet/withdraw',
        ),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer $token',
        },
        body: json.encode({'learnerId': widget.learnerId, 'amount': amount}),
      );

      Navigator.of(context).pop();

      final data = json.decode(response.body);
      if (data['isSucceed'] == true) {
        _fetchWalletDetails();
        _showErrorMessage('Rút tiền thành công');
      } else {
        _showErrorMessage(data['message'] ?? 'Lỗi rút tiền');
      }
    } catch (e) {
      Navigator.of(context).pop();
      _showErrorMessage('Lỗi: ${e.toString()}');
    }
  }

  void _showErrorMessage(String message) {
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message)));
  }

  void _showDepositDialog() {
    _depositController.clear();
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Nạp Tiền'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: _depositController,
                decoration: const InputDecoration(
                  hintText: 'Nhập số tiền',
                  suffixText: 'VND',
                ),
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 10),
              ElevatedButton(
                onPressed: _createDepositTransaction,
                child: const Text('Xác Nhận'),
              ),
            ],
          ),
        );
      },
    );
  }

  void _showWithdrawDialog() {
    _withdrawController.clear();
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Rút Tiền'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: _withdrawController,
                decoration: const InputDecoration(
                  hintText: 'Nhập số tiền',
                  suffixText: 'VND',
                ),
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 10),
              ElevatedButton(
                onPressed: _createWithdrawTransaction,
                child: const Text('Xác Nhận'),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Ví của tôi'),
        backgroundColor: const Color(0xFF8C9EFF),
      ),
      body:
          isLoading
              ? const Center(child: CircularProgressIndicator())
              : SingleChildScrollView(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: const Color(0xFF8C9EFF),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Số dư khả dụng:',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 16,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              '${balance.toStringAsFixed(0)} VND',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: _showDepositDialog,
                              icon: const Icon(Icons.add_circle),
                              label: const Text('Nạp Tiền'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.green,
                                padding: const EdgeInsets.symmetric(
                                  vertical: 12,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: _showWithdrawDialog,
                              icon: const Icon(Icons.remove_circle),
                              label: const Text('Rút Tiền'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.red,
                                padding: const EdgeInsets.symmetric(
                                  vertical: 12,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'Lịch Sử Giao Dịch',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      transactions.isEmpty
                          ? const Center(child: Text('Chưa có giao dịch nào'))
                          : ListView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: transactions.length,
                            itemBuilder: (context, index) {
                              final transaction = transactions[index];
                              return Card(
                                child: ListTile(
                                  title: Text(transaction.type),
                                  subtitle: Text(
                                    '${transaction.date.day}/${transaction.date.month}/${transaction.date.year}',
                                  ),
                                  trailing: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    crossAxisAlignment: CrossAxisAlignment.end,
                                    children: [
                                      Text(
                                        '${transaction.amount.toStringAsFixed(0)} VND',
                                        style: TextStyle(
                                          color:
                                              transaction.type == 'Nạp tiền'
                                                  ? Colors.green
                                                  : Colors.red,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      Text(
                                        transaction.status,
                                        style: const TextStyle(
                                          fontSize: 12,
                                          color: Colors.grey,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                    ],
                  ),
                ),
              ),
    );
  }
}

class Transaction {
  final int id;
  final String type;
  final double amount;
  final DateTime date;
  final String status;

  Transaction({
    required this.id,
    required this.type,
    required this.amount,
    required this.date,
    required this.status,
  });
}
