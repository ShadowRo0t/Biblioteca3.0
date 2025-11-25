import 'package:flutter/material.dart';
import '../services/notification_service.dart';
import '../models/notificacion.dart';

class NotificationBell extends StatefulWidget {
  const NotificationBell({super.key});

  @override
  State<NotificationBell> createState() => _NotificationBellState();
}

class _NotificationBellState extends State<NotificationBell> {
  final _notificationService = NotificationService();
  bool _showDropdown = false;

  @override
  void initState() {
    super.initState();
    _notificationService.iniciarPolling();
  }

  @override
  void dispose() {
    _notificationService.dispose();
    super.dispose();
  }

  void _toggleDropdown() {
    setState(() {
      _showDropdown = !_showDropdown;
    });
  }

  void _cerrarNotificacion(String id) {
    _notificationService.marcarComoVista(id);
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<List<Notificacion>>(
      stream: _notificationService.notificaciones$,
      initialData: const [],
      builder: (context, snapshot) {
        final notificaciones = snapshot.data ?? [];
        final contador = notificaciones.length;

        return Stack(
          children: [
            IconButton(
              icon: Stack(
                children: [
                  Icon(
                    Icons.notifications,
                    color: contador > 0 ? Colors.orange : Colors.white,
                  ),
                  if (contador > 0)
                    Positioned(
                      right: 0,
                      top: 0,
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(
                          color: Colors.red,
                          shape: BoxShape.circle,
                        ),
                        constraints: const BoxConstraints(
                          minWidth: 16,
                          minHeight: 16,
                        ),
                        child: Text(
                          contador > 9 ? '9+' : contador.toString(),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                ],
              ),
              onPressed: _toggleDropdown,
            ),
            if (_showDropdown)
              Positioned(
                top: 50,
                right: 0,
                child: Material(
                  elevation: 8,
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    width: MediaQuery.of(context).size.width * 0.9,
                    constraints:
                        const BoxConstraints(maxHeight: 500, maxWidth: 420),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Header
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.blue[700],
                            borderRadius: const BorderRadius.only(
                              topLeft: Radius.circular(12),
                              topRight: Radius.circular(12),
                            ),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'Notificaciones',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              IconButton(
                                icon: const Icon(Icons.close,
                                    color: Colors.white),
                                onPressed: _toggleDropdown,
                                padding: EdgeInsets.zero,
                                constraints: const BoxConstraints(),
                              ),
                            ],
                          ),
                        ),
                        // Content
                        Flexible(
                          child: notificaciones.isEmpty
                              ? const Padding(
                                  padding: EdgeInsets.all(32),
                                  child: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(Icons.check_circle,
                                          size: 48, color: Colors.green),
                                      SizedBox(height: 16),
                                      Text(
                                          'No tienes notificaciones pendientes'),
                                    ],
                                  ),
                                )
                              : ListView.separated(
                                  shrinkWrap: true,
                                  padding: const EdgeInsets.all(8),
                                  itemCount: notificaciones.length,
                                  separatorBuilder: (_, __) =>
                                      const Divider(height: 1),
                                  itemBuilder: (context, index) {
                                    final notif = notificaciones[index];
                                    return _buildNotificationItem(notif);
                                  },
                                ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
          ],
        );
      },
    );
  }

  Widget _buildNotificationItem(Notificacion notif) {
    final esDevolucion = notif.tipo == 'devolucion';

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: esDevolucion ? Colors.green[50] : Colors.red[50],
        borderRadius: BorderRadius.circular(8),
        border: Border(
          left: BorderSide(
            color: esDevolucion ? Colors.green : Colors.red,
            width: 3,
          ),
        ),
      ),
      margin: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            esDevolucion ? Icons.check_circle : Icons.warning,
            color: esDevolucion ? Colors.green : Colors.red,
            size: 24,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  notif.mensaje,
                  style: const TextStyle(fontSize: 13),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 4,
                  children: [
                    if (notif.tipo == 'vencida') ...[
                      _buildBadge(
                        '${notif.diasRetraso} día(s)',
                        Icons.access_time,
                        Colors.orange,
                      ),
                      _buildBadge(
                        '\$${notif.multaEconomica}',
                        Icons.attach_money,
                        Colors.red,
                      ),
                    ] else ...[
                      _buildBadge(
                        '\$${notif.multaEconomica}',
                        Icons.check,
                        Colors.green,
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.close, size: 20),
            onPressed: () => _cerrarNotificacion(notif.id),
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(),
          ),
        ],
      ),
    );
  }

  Widget _buildBadge(String text, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.2),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.5)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: color),
          const SizedBox(width: 4),
          Text(
            text,
            style: TextStyle(
              color: color,
              fontSize: 11,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}
