import { Injectable, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, interval, Subscription } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface Notificacion {
    id: string;
    tipo: 'vencida' | 'devolucion';
    libroTitulo: string;
    fechaDesde?: Date;
    fechaHasta?: Date;
    fechaDevolucion?: Date;
    diasRetraso?: number;
    multa: number;
    multaEconomica: number;
    mensaje: string;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService implements OnDestroy {
    private apiUrl = 'http://127.0.0.1:8000/api';
    private notificacionesSubject = new BehaviorSubject<Notificacion[]>([]);
    public notificaciones$ = this.notificacionesSubject.asObservable();

    private pollingSubscription?: Subscription;
    private readonly POLLING_INTERVAL = 30000; // 30 segundos
    private readonly MULTA_POR_DIA = 1000; // $1000 por día de retraso

    private notificacionesVistas: Set<string> = new Set();
    private notificacionesDevolucion: Notificacion[] = [];
    private isBrowser: boolean;

    constructor(
        private http: HttpClient,
        @Inject(PLATFORM_ID) platformId: object
    ) {
        this.isBrowser = isPlatformBrowser(platformId);

        if (this.isBrowser) {
            // Cargar notificaciones vistas desde localStorage
            const vistas = localStorage.getItem('notificaciones_vistas');
            if (vistas) {
                this.notificacionesVistas = new Set(JSON.parse(vistas));
            }

            // Cargar notificaciones de devolución
            const devolucion = localStorage.getItem('notificaciones_devolucion');
            if (devolucion) {
                this.notificacionesDevolucion = JSON.parse(devolucion).map((n: any) => ({
                    ...n,
                    fechaDevolucion: n.fechaDevolucion ? new Date(n.fechaDevolucion) : undefined
                }));
            }
        }
    }

    // Obtener headers con token
    private getHeaders(): { headers: HttpHeaders } {
        const token = localStorage.getItem('auth_token');
        return {
            headers: new HttpHeaders({
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            })
        };
    }

    // Calcular días de retraso
    private calcularDiasRetraso(fechaHasta: Date): number {
        const ahora = new Date();
        const diffTime = ahora.getTime() - new Date(fechaHasta).getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    }

    // Formatear fecha
    private formatearFecha(fecha: Date): string {
        const f = new Date(fecha);
        const dia = String(f.getDate()).padStart(2, '0');
        const mes = String(f.getMonth() + 1).padStart(2, '0');
        const anio = f.getFullYear();
        const horas = String(f.getHours()).padStart(2, '0');
        const minutos = String(f.getMinutes()).padStart(2, '0');
        return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
    }

    // Crear mensaje formateado para vencidas
    private crearMensajeVencida(notif: Notificacion): string {
        const fechaDesdeStr = this.formatearFecha(notif.fechaDesde!);
        const fechaHastaStr = this.formatearFecha(notif.fechaHasta!);

        return `Buenos días, estimado/a usuario/a, le queremos comentar que su reserva del libro "${notif.libroTitulo}" necesita ser devuelto, según los datos de fecha "${fechaDesdeStr} - ${fechaHastaStr}", por estos inconvenientes, se le aplicará una multa de ${notif.diasRetraso} día(s) equivalente a $${notif.multaEconomica}`;
    }

    // Crear mensaje para devolución
    private crearMensajeDevolucion(notif: Notificacion): string {
        const fechaStr = this.formatearFecha(notif.fechaDevolucion!);
        return `Libro "${notif.libroTitulo}" devuelto con éxito y pagado el ${fechaStr} con multa de $${notif.multaEconomica}`;
    }

    // Obtener reservas vencidas y convertirlas en notificaciones
    private fetchNotificaciones(): Observable<Notificacion[]> {
        return this.http.get<any[]>(`${this.apiUrl}/reservas/vencidas`, this.getHeaders()).pipe(
            switchMap(reservas => {
                // Notificaciones de libros vencidos (filtrar las vistas)
                const notifVencidas: Notificacion[] = reservas
                    .filter(reserva => !this.notificacionesVistas.has(reserva._id))
                    .map(reserva => {
                        const diasRetraso = this.calcularDiasRetraso(reserva.hasta);
                        const notif: Notificacion = {
                            id: reserva._id,
                            tipo: 'vencida',
                            libroTitulo: reserva.libro_id?.titulo || 'Libro desconocido',
                            fechaDesde: reserva.desde,
                            fechaHasta: reserva.hasta,
                            diasRetraso: diasRetraso,
                            multa: diasRetraso,
                            multaEconomica: diasRetraso * this.MULTA_POR_DIA,
                            mensaje: ''
                        };
                        notif.mensaje = this.crearMensajeVencida(notif);
                        return notif;
                    });

                // Combinar con notificaciones de devolución
                const todasNotificaciones = [...notifVencidas, ...this.notificacionesDevolucion];

                this.notificacionesSubject.next(todasNotificaciones);
                return of(todasNotificaciones);
            }),
            catchError(error => {
                console.error('Error obteniendo notificaciones:', error);
                // Aunque falle el backend, mostrar notificaciones de devolución
                this.notificacionesSubject.next([...this.notificacionesDevolucion]);
                return of([...this.notificacionesDevolucion]);
            })
        );
    }

    // Marcar notificación como vista/cerrada
    marcarComoVista(id: string): void {
        if (!this.isBrowser) return;

        // Si es notificación de devolución, eliminarla completamente
        if (id.startsWith('dev_')) {
            this.notificacionesDevolucion = this.notificacionesDevolucion.filter(n => n.id !== id);
            localStorage.setItem('notificaciones_devolucion', JSON.stringify(this.notificacionesDevolucion));
        } else {
            // Si es notificación vencida, marcarla como vista
            this.notificacionesVistas.add(id);
            localStorage.setItem('notificaciones_vistas', JSON.stringify([...this.notificacionesVistas]));
        }

        // Actualizar la lista
        this.fetchNotificaciones().subscribe();
    }

    // Crear notificación de devolución
    crearNotificacionDevolucion(libroTitulo: string, multa: number, multaEconomica: number): void {
        if (!this.isBrowser) return;

        const notif: Notificacion = {
            id: `dev_${Date.now()}`,
            tipo: 'devolucion',
            libroTitulo: libroTitulo,
            fechaDevolucion: new Date(),
            multa: multa,
            multaEconomica: multaEconomica,
            mensaje: ''
        };

        notif.mensaje = this.crearMensajeDevolucion(notif);

        this.notificacionesDevolucion.push(notif);
        localStorage.setItem('notificaciones_devolucion', JSON.stringify(this.notificacionesDevolucion));

        // Actualizar inmediatamente
        this.fetchNotificaciones().subscribe();
    }

    // Iniciar polling automático
    iniciarPolling(): void {
        if (this.pollingSubscription) {
            return; // Ya está activo
        }

        // Primera carga inmediata
        this.fetchNotificaciones().subscribe();

        // Polling periódico
        this.pollingSubscription = interval(this.POLLING_INTERVAL).pipe(
            switchMap(() => this.fetchNotificaciones())
        ).subscribe();
    }

    // Detener polling
    detenerPolling(): void {
        if (this.pollingSubscription) {
            this.pollingSubscription.unsubscribe();
            this.pollingSubscription = undefined;
        }
        this.notificacionesSubject.next([]);
    }

    // Limpiar datos al cerrar sesión
    limpiarDatos(): void {
        if (!this.isBrowser) return;

        this.notificacionesVistas.clear();
        this.notificacionesDevolucion = [];
        localStorage.removeItem('notificaciones_vistas');
        localStorage.removeItem('notificaciones_devolucion');
    }

    // Obtener el número de notificaciones
    getContador(): Observable<number> {
        return new Observable(observer => {
            this.notificaciones$.subscribe(notificaciones => {
                observer.next(notificaciones.length);
            });
        });
    }

    ngOnDestroy(): void {
        this.detenerPolling();
    }
}
