import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'dart:io' show Platform;

class ApiService {
  /// URL base del backend.
  ///
  /// Se puede sobrescribir en tiempo de compilación con:
  /// `--dart-define=BACKEND_HOST=192.168.1.10 --dart-define=BACKEND_PORT=8000`
  static String get baseUrl {
    const customHost = String.fromEnvironment('BACKEND_HOST');
    const customPort = String.fromEnvironment('BACKEND_PORT', defaultValue: '8000');

    if (customHost.isNotEmpty) {
      return 'http://$customHost:$customPort/api';
    }

    if (kIsWeb) {
      // Flutter Web puede usar localhost sin problemas
      return 'http://localhost:$customPort/api';
    }

    if (Platform.isAndroid) {
      // Emulador Android (AVD) usa 10.0.2.2 para llegar al host
      return 'http://10.0.2.2:$customPort/api';
    }

    if (Platform.isIOS) {
      // iOS Simulator permite acceder a localhost directamente
      return 'http://localhost:$customPort/api';
    }

    // Para dispositivos físicos (Android/iOS) se requiere la IP local de la máquina host
    // Puedes definirlo con --dart-define o modificar esta constante.
    const localNetworkHost = String.fromEnvironment('BACKEND_LAN_HOST', defaultValue: '');
    if (localNetworkHost.isNotEmpty) {
      return 'http://$localNetworkHost:$customPort/api';
    }

    // Último recurso: usar 127.0.0.1, aunque normalmente no funcionará en dispositivos físicos
    return 'http://127.0.0.1:$customPort/api';
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
        errorMessage = 'No se pudo conectar al servidor. Verifica que el backend esté corriendo en $baseUrl';
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
        errorMessage = 'No se pudo conectar al servidor. Verifica que el backend esté corriendo en $baseUrl';
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
        errorMessage = 'No se pudo conectar al servidor. Verifica que el backend esté corriendo en $baseUrl';
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

  static Future<Map<String, dynamic>> patch(
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
      final response = await http.patch(
        url,
        headers: headers,
        body: jsonEncode(body),
      );

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
      String errorMessage = 'Error de conexión';
      if (e.toString().contains('Failed host lookup') || e.toString().contains('Failed to fetch')) {
        errorMessage = 'No se pudo conectar al servidor. Verifica que el backend esté corriendo en $baseUrl';
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

