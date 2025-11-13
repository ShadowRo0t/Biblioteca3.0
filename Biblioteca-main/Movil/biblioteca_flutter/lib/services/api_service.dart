import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart' show kIsWeb;

class ApiService {
  // Para web, usa localhost. Para móvil, usa 127.0.0.1 o IP local
  static String get baseUrl {
    if (kIsWeb) {
      // En web, usa localhost (mejor compatibilidad con CORS)
      return 'http://localhost:8000/api';
    } else {
      // En móvil, usa 127.0.0.1 o IP local
      return 'http://127.0.0.1:8000/api';
      // Para dispositivo físico en la misma red:
      // return 'http://TU_IP_LOCAL:8000/api';
    }
  }

  static Future<Map<String, dynamic>> post(
    String endpoint,
    Map<String, dynamic> body, {
    String? token,
  }) async {
    final url = Uri.parse('$baseUrl$endpoint');
    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
    }

    try {
      final response = await http.post(
        url,
        headers: headers,
        body: jsonEncode(body),
      );

      // Manejar respuesta vacía
      if (response.body.isEmpty) {
        return {
          'success': false,
          'message': 'Respuesta vacía del servidor',
        };
      }

      final data = jsonDecode(response.body);
      
      if (response.statusCode >= 200 && response.statusCode < 300) {
        return {'success': true, 'data': data};
      } else {
        return {
          'success': false,
          'message': data['message'] ?? 'Error en la petición',
        };
      }
    } catch (e) {
      // Mensaje de error más amigable
      String errorMessage = 'Error de conexión';
      if (e.toString().contains('Failed host lookup') || 
          e.toString().contains('Failed to fetch') ||
          e.toString().contains('ClientException')) {
        errorMessage = 'No se pudo conectar al servidor. Verifica que el backend esté corriendo en http://localhost:8000';
      } else if (e.toString().contains('Connection refused')) {
        errorMessage = 'Conexión rechazada. Asegúrate de que el backend esté corriendo';
      } else if (e.toString().contains('CORS')) {
        errorMessage = 'Error de CORS. Verifica la configuración del backend';
      } else {
        errorMessage = 'Error de conexión: ${e.toString()}';
      }
      
      return {
        'success': false,
        'message': errorMessage,
      };
    }
  }

  static Future<Map<String, dynamic>> get(
    String endpoint, {
    String? token,
  }) async {
    final url = Uri.parse('$baseUrl$endpoint');
    final headers = {
      'Accept': 'application/json',
    };

    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
    }

    try {
      final response = await http.get(
        url,
        headers: headers,
      );

      // Manejar respuesta vacía
      if (response.body.isEmpty) {
        return {
          'success': false,
          'message': 'Respuesta vacía del servidor',
        };
      }

      final data = jsonDecode(response.body);
      
      if (response.statusCode >= 200 && response.statusCode < 300) {
        return {'success': true, 'data': data};
      } else {
        return {
          'success': false,
          'message': data['message'] ?? 'Error en la petición',
        };
      }
    } catch (e) {
      // Mensaje de error más amigable
      String errorMessage = 'Error de conexión';
      if (e.toString().contains('Failed host lookup') || e.toString().contains('Failed to fetch')) {
        errorMessage = 'No se pudo conectar al servidor. Verifica que el backend esté corriendo en http://localhost:8000';
      } else if (e.toString().contains('Connection refused')) {
        errorMessage = 'Conexión rechazada. Asegúrate de que el backend esté corriendo';
      } else if (e.toString().contains('CORS')) {
        errorMessage = 'Error de CORS. Verifica la configuración del backend';
      } else {
        errorMessage = 'Error de conexión: ${e.toString()}';
      }
      
      return {
        'success': false,
        'message': errorMessage,
      };
    }
  }

  static Future<Map<String, dynamic>> delete(
    String endpoint, {
    String? token,
  }) async {
    final url = Uri.parse('$baseUrl$endpoint');
    final headers = {
      'Accept': 'application/json',
    };

    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
    }

    try {
      final response = await http.delete(
        url,
        headers: headers,
      );

      // Manejar respuesta vacía
      if (response.body.isEmpty) {
        return {
          'success': false,
          'message': 'Respuesta vacía del servidor',
        };
      }

      final data = jsonDecode(response.body);
      
      if (response.statusCode >= 200 && response.statusCode < 300) {
        return {'success': true, 'data': data};
      } else {
        return {
          'success': false,
          'message': data['message'] ?? 'Error en la petición',
        };
      }
    } catch (e) {
      // Mensaje de error más amigable
      String errorMessage = 'Error de conexión';
      if (e.toString().contains('Failed host lookup') || e.toString().contains('Failed to fetch')) {
        errorMessage = 'No se pudo conectar al servidor. Verifica que el backend esté corriendo en http://localhost:8000';
      } else if (e.toString().contains('Connection refused')) {
        errorMessage = 'Conexión rechazada. Asegúrate de que el backend esté corriendo';
      } else if (e.toString().contains('CORS')) {
        errorMessage = 'Error de CORS. Verifica la configuración del backend';
      } else {
        errorMessage = 'Error de conexión: ${e.toString()}';
      }
      
      return {
        'success': false,
        'message': errorMessage,
      };
    }
  }
}

