import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'services/auth_service.dart';
import 'screens/login_screen.dart';
import 'screens/register_screen.dart';
import 'screens/home_screen.dart';
import 'screens/catalogo_screen.dart';
import 'screens/reservas_screen.dart';

void main() {
  runApp(const BibliotecaApp());
}

class BibliotecaApp extends StatelessWidget {
  const BibliotecaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Biblioteca BEC',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.green,
        primaryColor: const Color(0xFF28a745),
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF28a745),
          brightness: Brightness.light,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF28a745),
          foregroundColor: Colors.white,
          elevation: 0,
        ),
      ),
      routerConfig: _router,
    );
  }
}

final GoRouter _router = GoRouter(
  initialLocation: '/login',
  debugLogDiagnostics: true, // Habilitar logs de debug del router
  routes: [
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/register',
      builder: (context, state) => const RegisterScreen(),
    ),
    GoRoute(
      path: '/home',
      builder: (context, state) => const HomeScreen(),
    ),
    GoRoute(
      path: '/catalogo',
      builder: (context, state) => const CatalogoScreen(),
    ),
    GoRoute(
      path: '/reservas',
      builder: (context, state) => const ReservasScreen(),
    ),
  ],
  redirect: (context, state) async {
    final authService = AuthService();
    final isLoggedIn = await authService.isLoggedIn();
    final currentPath = state.matchedLocation;
    final isLoginPage = currentPath == '/login' || currentPath == '/register';
    
    // Debug
    print('🔍 Redirect check - isLoggedIn: $isLoggedIn, path: $currentPath');
    
    // Si no está logueado y no está en login/register, redirigir a login
    if (!isLoggedIn && !isLoginPage) {
      print('➡️ Redirigiendo a /login (no autenticado)');
      return '/login';
    }
    
    // Si está logueado y está en login/register, redirigir a home
    if (isLoggedIn && isLoginPage) {
      print('➡️ Redirigiendo a /home (ya autenticado)');
      return '/home';
    }
    
    print('✅ Sin redirección necesaria');
    return null;
  },
  refreshListenable: null, // No usar refreshListenable por ahora
);

