import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../services/auth_service.dart';

class CustomDrawer extends StatelessWidget {
  const CustomDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    final authService = AuthService();

    return Drawer(
      child: FutureBuilder(
        future: authService.getUser(),
        builder: (context, snapshot) {
          final user = snapshot.data;
          final isAdmin = user?.role == 'admin';

          return Column(
            children: [
              UserAccountsDrawerHeader(
                decoration: const BoxDecoration(
                  color: Color(0xFF28a745),
                ),
                accountName: Text(
                  user?.name ?? 'Usuario',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                accountEmail: Text(user?.email ?? ''),
                currentAccountPicture: const CircleAvatar(
                  backgroundColor: Colors.white,
                  child: Icon(
                    Icons.person,
                    color: Color(0xFF28a745),
                    size: 40,
                  ),
                ),
              ),
              ListTile(
                leading: const Icon(Icons.home),
                title: const Text('Inicio'),
                onTap: () {
                  context.pop(); // Close drawer
                  context.go('/home');
                },
              ),
              ListTile(
                leading: const Icon(Icons.book),
                title: const Text('Catálogo'),
                onTap: () {
                  context.pop(); // Close drawer
                  context.go('/catalogo');
                },
              ),
              ListTile(
                leading: const Icon(Icons.list),
                title: const Text('Mis Reservas'),
                onTap: () {
                  context.pop(); // Close drawer
                  context.go('/reservas');
                },
              ),
              if (isAdmin)
                ListTile(
                  leading: const Icon(Icons.admin_panel_settings),
                  title: const Text('Administración'),
                  onTap: () {
                    context.pop(); // Close drawer
                    context.go('/admin/libros');
                  },
                ),
              if (isAdmin)
                ListTile(
                  leading: const Icon(Icons.assignment_turned_in),
                  title: const Text('Gestión de Préstamos'),
                  onTap: () {
                    context.pop(); // Close drawer
                    context.go('/admin/prestamos');
                  },
                ),
              const Spacer(),
              const Divider(),
              ListTile(
                leading: const Icon(Icons.logout, color: Colors.red),
                title: const Text(
                  'Cerrar Sesión',
                  style: TextStyle(color: Colors.red),
                ),
                onTap: () async {
                  await authService.logout();
                  if (context.mounted) {
                    context.go('/login');
                  }
                },
              ),
              const SizedBox(height: 16),
            ],
          );
        },
      ),
    );
  }
}
