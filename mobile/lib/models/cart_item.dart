import 'dart:convert';

class CartItem {
  final int coursePackageId;
  final String courseName;
  final String imageUrl;
  final int price;
  final int discount;

  CartItem({
    required this.coursePackageId,
    required this.courseName,
    required this.imageUrl,
    required this.price,
    required this.discount,
  });

  Map<String, dynamic> toJson() {
    return {
      'coursePackageId': coursePackageId,
      'courseName': courseName,
      'imageUrl': imageUrl,
      'price': price,
      'discount': discount,
    };
  }

  factory CartItem.fromJson(Map<String, dynamic> json) {
    return CartItem(
      coursePackageId: json['coursePackageId'],
      courseName: json['courseName'],
      imageUrl: json['imageUrl'],
      price: json['price'],
      discount: json['discount'],
    );
  }
}
