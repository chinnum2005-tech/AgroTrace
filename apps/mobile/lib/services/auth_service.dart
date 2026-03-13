import 'package:flutter/material.dart';

class AuthService extends ChangeNotifier {
  String? _token;
  Map<String, dynamic>? _user;
  
  bool get isAuthenticated => _token != null;
  Map<String, dynamic>? get user => _user;
  
  Future<bool> login(String email, String password) async {
    // TODO: Implement API call
    await Future.delayed(const Duration(seconds: 1));
    
    // Mock login for development
    _token = 'mock_jwt_token';
    _user = {
      'id': '1',
      'email': email,
      'firstName': 'John',
      'lastName': 'Doe',
      'role': 'FARMER',
    };
    
    notifyListeners();
    return true;
  }
  
  Future<void> logout() async {
    _token = null;
    _user = null;
    notifyListeners();
  }
}
