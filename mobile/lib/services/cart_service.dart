import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/cart_item.dart';
import 'package:http/http.dart' as http;

class CartService {
  static const String _cartKey = 'shopping_cart';

  Future<bool> isCoursePurchased(int coursePackageId) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');
      final learnerId = prefs.getInt('learnerId');

      if (token == null || learnerId == null) {
        return false;
      }

      final response = await http.get(
        Uri.parse(
          'https://instrulearnapplication2025-h7hfdte3etdth7av.southeastasia-01.azurewebsites.net/api/Purchase/get-all',
        ),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> purchases = json.decode(response.body);

        for (var purchase in purchases) {
          if (purchase['data']['learnerId'] == learnerId) {
            final purchaseItems = purchase['data']['purchaseItems'] as List;
            if (purchaseItems
                .any((item) => item['coursePackageId'] == coursePackageId)) {
              return true;
            }
          }
        }
      }
      return false;
    } catch (e) {
      print('Lỗi khi kiểm tra khóa học đã mua: $e');
      return false;
    }
  }

  Future<List<CartItem>> getCartItems() async {
    final prefs = await SharedPreferences.getInstance();
    final String? cartJson = prefs.getString(_cartKey);
    if (cartJson == null) return [];

    List<dynamic> cartList = json.decode(cartJson);
    return cartList.map((item) => CartItem.fromJson(item)).toList();
  }

  Future<void> addToCart(CartItem item) async {
    final prefs = await SharedPreferences.getInstance();
    List<CartItem> currentCart = await getCartItems();

    bool exists = currentCart
        .any((cartItem) => cartItem.coursePackageId == item.coursePackageId);
    if (!exists) {
      currentCart.add(item);
      String cartJson =
          json.encode(currentCart.map((item) => item.toJson()).toList());
      await prefs.setString(_cartKey, cartJson);
    }
  }

  Future<void> removeFromCart(int coursePackageId) async {
    final prefs = await SharedPreferences.getInstance();
    List<CartItem> currentCart = await getCartItems();

    currentCart.removeWhere((item) => item.coursePackageId == coursePackageId);
    String cartJson =
        json.encode(currentCart.map((item) => item.toJson()).toList());
    await prefs.setString(_cartKey, cartJson);
  }

  Future<void> clearCart() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_cartKey);
  }

  Future<int> getCartTotal() async {
    List<CartItem> items = await getCartItems();
    return items.fold<int>(0, (total, item) {
      int discountedPrice = item.price - (item.price * item.discount ~/ 100);
      return total + discountedPrice;
    });
  }
}
