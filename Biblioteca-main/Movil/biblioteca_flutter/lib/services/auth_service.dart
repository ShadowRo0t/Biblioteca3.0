import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'api_service.dart';
import '../models/user.dart';

class AuthService {
  static const String _tokenKey = 'auth_token';
  static const String _userKey = 'user_data';

  Future<bool> login(String email, String password) async {
    final response = await ApiService.post(
      '/auth/login',
      {'email': email, 'password': password},
    );

    print('🔐 Respuesta del login: $response'); // Debug

    if (response['success'] == true) {
      final data = response['data'];
      print('📦 Datos recibidos: $data'); // Debug
      
      // El backend puede devolver token y user directamente o dentro de un objeto
      final token = data['token'];
      final userData = data['user'] ?? data; // Si no hay 'user', usar data directamente
      
      if (token == null) {
        print('❌ Token no encontrado en la respuesta');
        return false;
      }

      try {
        final user = User.fromJson(userData);
        await _saveToken(token);
        await _saveUser(user);
        print('✅ Token y usuario guardados correctamente');
        return true;
      } catch (e) {
        print('❌ Error al guardar usuario: $e');
        return false;
      }
    }

    print('❌ Login fallido: ${response['message']}');
    return false;
  }

  Future<String?> getErrorMessage(String email, String password) async {
    final response = await ApiService.post(
      '/auth/login',
      {'email': email, 'password': password},
    );

    if (response['success'] == true) {
      return null;
    }

    return response['message'] ?? 'Credenciales incorrectas';
  }

  Future<bool> register(String name, String email, String password) async {
    final response = await ApiService.post(
      '/auth/register',
      {
        'name': name,
        'email': email,
        'password': password,
      },
    );

    return response['success'] == true;
  }

  Future<String?> getRegisterErrorMessage(
    String name,
    String email,
    String password,
  ) async {
    final response = await ApiService.post(
      '/auth/register',
      {
        'name': name,
        'email': email,
        'password': password,
      },
    );

    if (response['success'] == true) {
      return null;
    }

    return response['message'] ?? 'Error al registrar usuario';
  }

  Future<void> _saveToken(String token) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final saved = await prefs.setString(_tokenKey, token);
      print('💾 Token guardado: $saved');
      // Verificar que se guardó
      final verify = await prefs.getString(_tokenKey);
      print('✅ Token verificado: ${verify != null ? "Sí" : "No"}');
    } catch (e) {
      print('❌ Error guardando token: $e');
    }
  }

  Future<void> _saveUser(User user) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_userKey, jsonEncode(user.toJson()));
      print('💾 Usuario guardado: ${user.name}');
    } catch (e) {
      print('❌ Error guardando usuario: $e');
    }
  }

  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  Future<User?> getUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userJson = prefs.getString(_userKey);
    if (userJson != null) {
      return User.fromJson(jsonDecode(userJson));
    }
    return null;
  }

  Future<bool> isLoggedIn() async {
    final token = await getToken();
    final isLogged = token != null && token.isNotEmpty;
    print('🔐 isLoggedIn check: $isLogged (token: ${token != null ? "presente" : "ausente"})');
    return isLogged;
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_userKey);
  }
}

