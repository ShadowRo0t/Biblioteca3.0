import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservaService } from '../../services/reserva';
import { NotificationService } from '../../services/notification.service';

@Component({
    selector: 'app-admin-prestamos',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './admin-prestamos.html',
    styleUrls: ['./admin-prestamos.css']
})
export class AdminPrestamosComponent implements OnInit {
    activeTab: 'solicitudes' | 'vencidos' | 'devolucion' = 'solicitudes';

    solicitudes = signal<any[]>([]);
    vencidos = signal<any[]>([]);

    // Devolución
    libroIdDevolucion = '';
    mensajeDevolucion = '';
    errorDevolucion = '';

    isLoading = signal(false);

    constructor(
        private reservaService: ReservaService,
        private notificationService: NotificationService
    ) { }

    ngOnInit() {
        this.cargarSolicitudes();
    }

    setTab(tab: 'solicitudes' | 'vencidos' | 'devolucion') {
        this.activeTab = tab;
        if (tab === 'solicitudes') this.cargarSolicitudes();
        if (tab === 'vencidos') this.cargarVencidos();
    }

    cargarSolicitudes() {
        this.isLoading.set(true);
        // Usar el endpoint de admin para ver todas las reservas de todos los usuarios
        this.reservaService.getTodasReservas().subscribe({
            next: (response) => {
                // Normalizar respuesta y filtrar solo las activas
                const data = Array.isArray(response) ? response : [];
                this.solicitudes.set(data.filter((r: any) => r.estado === 'activa'));
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error(err);
                this.isLoading.set(false);
            }
        });
    }

    cargarVencidos() {
        this.isLoading.set(true);
        this.reservaService.getVencidas().subscribe({
            next: (data) => {
                // Agregar el cálculo de días de atraso a cada reserva
                const vencidosConAtraso = data.map((r: any) => ({
                    ...r,
                    diasAtraso: this.calcularDiasAtraso(r.hasta)
                }));
                this.vencidos.set(vencidosConAtraso);
                this.isLoading.set(false);
            },
            error: (err: any) => {
                console.error(err);
                this.isLoading.set(false);
            }
        });
    }

    procesarDevolucion() {
        if (!this.libroIdDevolucion) return;

        this.mensajeDevolucion = '';
        this.errorDevolucion = '';

        this.reservaService.devolverLibro(this.libroIdDevolucion).subscribe({
            next: (res) => {
                const multaMsg = res.multa_economica ? `$${res.multa_economica}` : `${res.multa_dias} días`;
                const usuarioMsg = res.usuario ? ` Usuario: ${res.usuario}.` : '';
                const libroMsg = res.libro ? ` Libro: ${res.libro}.` : '';
                this.mensajeDevolucion = `Devolución exitosa.${usuarioMsg}${libroMsg} Multa: ${multaMsg}`;

                // Crear notificación de devolución exitosa para el usuario
                if (res.libro && res.multa_economica !== undefined) {
                    this.notificationService.crearNotificacionDevolucion(
                        res.libro,
                        res.multa_dias || 0,
                        res.multa_economica
                    );
                }

                this.libroIdDevolucion = '';
                if (this.activeTab === 'solicitudes') this.cargarSolicitudes();
                if (this.activeTab === 'vencidos') this.cargarVencidos();
            },
            error: (err: any) => {
                this.errorDevolucion = err.error?.message || 'Error al procesar devolución';
            }
        });
    }

    enviarRecordatorio(reservaId: string) {
        // Implementar lógica de recordatorio si el backend lo soporta
        alert('Recordatorio enviado (simulado)');
    }

    eliminarPrestamo(id: string, tipo: 'activo' | 'vencido') {
        const confirmacion = confirm('¿Está seguro de eliminar este préstamo? Esta acción no se puede deshacer.');

        if (!confirmacion) {
            return;
        }

        this.reservaService.eliminarReserva(id).subscribe({
            next: () => {
                alert('Préstamo eliminado exitosamente');
                // Recargar la lista correspondiente
                if (tipo === 'activo') {
                    this.cargarSolicitudes();
                } else {
                    this.cargarVencidos();
                }
            },
            error: (err: any) => {
                const mensaje = err.error?.message || err || 'Error al eliminar el préstamo';
                alert(`Error: ${mensaje}`);
                console.error('Error eliminando préstamo:', err);
            }
        });
    }

    obtenerLibroId(reserva: any): string {
        // Intentar obtener el ID del libro desde diferentes campos posibles
        if (reserva.libro_id?._id) {
            return reserva.libro_id._id;
        }
        if (typeof reserva.libro_id === 'string') {
            return reserva.libro_id;
        }
        return 'N/A';
    }

    calcularDiasAtraso(fechaVencimiento: Date | string): number {
        const ahora = new Date();
        const vencimiento = new Date(fechaVencimiento);
        const diffTime = ahora.getTime() - vencimiento.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    }
}
