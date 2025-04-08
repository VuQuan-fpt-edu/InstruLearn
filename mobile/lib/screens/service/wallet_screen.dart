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
  List<Transaction> filteredTransactions = [];
  int? selectedMonth;
  int currentYear = DateTime.now().year;
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
          'https://instrulearnapplication2025-h7hfdte3etdth7av.southeastasia-01.azurewebsites.net/api/wallet/${widget.learnerId}',
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
          'https://instrulearnapplication2025-h7hfdte3etdth7av.southeastasia-01.azurewebsites.net/api/WalletTransactions/wallet/${widget.learnerId}',
        ),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body) as List;
        setState(() {
          transactions = data
              .map(
                (transactionData) => Transaction(
                  id: transactionData['transactionId'],
                  type: transactionData['transactionType'],
                  amount: transactionData['amount'].toDouble(),
                  date: DateTime.parse(transactionData['transactionDate']),
                  status: transactionData['status'],
                  signedAmount: transactionData['signedAmount'].toDouble(),
                ),
              )
              .toList();
          _filterTransactions();
        });
      }
    } catch (e) {
      _showErrorMessage('Lỗi tải lịch sử giao dịch: ${e.toString()}');
    }
  }

  void _filterTransactions() {
    setState(() {
      if (selectedMonth == null) {
        filteredTransactions = List.from(transactions);
      } else {
        filteredTransactions = transactions
            .where((transaction) =>
                transaction.date.month == selectedMonth &&
                transaction.date.year == currentYear)
            .toList();
      }
    });
  }

  String _getMonthName(int month) {
    switch (month) {
      case 1:
        return 'Tháng 1';
      case 2:
        return 'Tháng 2';
      case 3:
        return 'Tháng 3';
      case 4:
        return 'Tháng 4';
      case 5:
        return 'Tháng 5';
      case 6:
        return 'Tháng 6';
      case 7:
        return 'Tháng 7';
      case 8:
        return 'Tháng 8';
      case 9:
        return 'Tháng 9';
      case 10:
        return 'Tháng 10';
      case 11:
        return 'Tháng 11';
      case 12:
        return 'Tháng 12';
      default:
        return 'Tất cả';
    }
  }

  Widget _buildMonthFilter() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const Text(
            'Lọc theo tháng:',
            style: TextStyle(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(width: 10),
          DropdownButton<int?>(
            value: selectedMonth,
            hint: const Text('Tất cả'),
            onChanged: (newValue) {
              setState(() {
                selectedMonth = newValue;
                _filterTransactions();
              });
            },
            items: [
              const DropdownMenuItem<int?>(
                value: null,
                child: Text('Tất cả'),
              ),
              ...List.generate(12, (index) => index + 1).map((month) {
                return DropdownMenuItem<int?>(
                  value: month,
                  child: Text(_getMonthName(month)),
                );
              }).toList(),
            ],
          ),
        ],
      ),
    );
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
          'https://instrulearnapplication2025-h7hfdte3etdth7av.southeastasia-01.azurewebsites.net/api/wallet/add-funds',
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

        final result = await Navigator.of(context).push(
          MaterialPageRoute(
            builder: (context) => PaymentScreen(paymentUrl: paymentUrl),
          ),
        );

        if (result == true) {
          _fetchWalletDetails();
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Nạp tiền thành công! Số dư đã được cập nhật.'),
              backgroundColor: Colors.green,
            ),
          );
        }
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
          'https://instrulearnapplication2025-h7hfdte3etdth7av.southeastasia-01.azurewebsites.net/api/wallet/withdraw',
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
      body: isLoading
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
                    _buildMonthFilter(),
                    filteredTransactions.isEmpty
                        ? const Center(
                            child: Text(
                                'Không có giao dịch nào trong khoảng thời gian này'))
                        : ListView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: filteredTransactions.length,
                            itemBuilder: (context, index) {
                              final transaction = filteredTransactions[index];
                              final bool isPositive =
                                  transaction.signedAmount >= 0;
                              final bool isComplete =
                                  transaction.status == 'Complete';

                              String formattedDate =
                                  '${transaction.date.day}/${transaction.date.month}/${transaction.date.year}';
                              String formattedTime =
                                  '${transaction.date.hour}:${transaction.date.minute.toString().padLeft(2, '0')}';

                              String transactionTypeText =
                                  transaction.type == 'AddFuns'
                                      ? 'Nạp tiền'
                                      : transaction.type == 'Payment'
                                          ? 'Thanh toán'
                                          : transaction.type;

                              // Xác định màu sắc dựa trên trạng thái và loại giao dịch
                              Color iconColor;
                              Color backgroundColor;

                              if (!isComplete) {
                                // Nếu đang pending thì hiển thị màu cam
                                iconColor = Colors.orange;
                                backgroundColor = Colors.orange[100]!;
                              } else {
                                // Nếu complete thì dựa vào dấu cộng/trừ
                                iconColor =
                                    isPositive ? Colors.green : Colors.red;
                                backgroundColor = isPositive
                                    ? Colors.green[100]!
                                    : Colors.red[100]!;
                              }

                              return Card(
                                elevation: 2,
                                margin: const EdgeInsets.symmetric(
                                    vertical: 8, horizontal: 4),
                                child: ListTile(
                                  leading: CircleAvatar(
                                    backgroundColor: backgroundColor,
                                    child: Icon(
                                      isPositive ? Icons.add : Icons.remove,
                                      color: iconColor,
                                    ),
                                  ),
                                  title: Text(
                                    transactionTypeText,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  subtitle: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text('$formattedDate $formattedTime'),
                                      Text(
                                        transaction.status,
                                        style: TextStyle(
                                          color: isComplete
                                              ? (isPositive
                                                  ? Colors.green
                                                  : Colors.red)
                                              : Colors.orange,
                                          fontSize: 12,
                                        ),
                                      ),
                                    ],
                                  ),
                                  trailing: Text(
                                    '${isPositive ? '+' : ''}${transaction.signedAmount.toStringAsFixed(0)} VND',
                                    style: TextStyle(
                                      color: isComplete
                                          ? (isPositive
                                              ? Colors.green
                                              : Colors.red)
                                          : Colors.orange,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 16,
                                    ),
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
  final String id;
  final String type;
  final double amount;
  final DateTime date;
  final String status;
  final double signedAmount;

  Transaction({
    required this.id,
    required this.type,
    required this.amount,
    required this.date,
    required this.status,
    required this.signedAmount,
  });
}
