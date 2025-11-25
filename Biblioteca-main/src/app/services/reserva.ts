import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

// Interfaz para tipar la respuesta de reservas
// El backend puede devolver un array directamente o un objeto con reservas
type ReservasResponse = any[] | { reservas: any[];[key: string]: any };

// Función helper para normalizar la respuesta de reservas
function normalizarReservas(response: ReservasResponse): any[] {
  if (Array.isArray(response)) {
    return response;
  }
  return (response as { reservas?: any[] })?.reservas || [];
}

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private apiUrl = 'http://127.0.0.1:8000/api';

  //  BehaviorSubject para mantener sincronizada la lista de reservas
  private reservasSubject = new BehaviorSubject<any[]>([]);
  public reservas$ = this.reservasSubject.asObservable();

  constructor(private http: HttpClient) { }

  // Obtener headers con token
  private getHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('auth_token');

    //  Log para depuración: verificar que el token se está enviando
    if (!token) {
      console.warn(' No hay token de autenticación en localStorage');
    } else {
      console.log(' Token encontrado, enviando en petición');
    }

    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      })
    };
  }

  // Listar reservas del usuario logueado
  getReservas(): Observable<ReservasResponse> {
    console.log(' Solicitando reservas del usuario autenticado...');
    return this.http.get<any>(`${this.apiUrl}/reservas`, this.getHeaders()).pipe(
      tap(response => {
        console.log(' Reservas obtenidas del backend:', response);
        // El backend devuelve un array directamente, no un objeto con reservas
        // Normalizar la respuesta para el BehaviorSubject
        const reservasArray = normalizarReservas(response);
        console.log(` Total de reservas normalizadas: ${reservasArray.length}`);
        this.reservasSubject.next(reservasArray);
      }),
      catchError(error => {
        console.error(' Error obteniendo reservas:', error);
        return throwError(() => error);
      })
    );
  }

  // Crear una nueva reserva
  crearReserva(data: any): Observable<any> {
    console.log(' Creando reserva con datos:', data);
    console.log(' Token de autenticación:', localStorage.getItem('auth_token') ? 'Presente' : 'Ausente');
    return this.http.post(`${this.apiUrl}/reservas`, data, this.getHeaders()).pipe(
      tap(response => {
        console.log(' Reserva creada exitosamente:', response);
        //  IMPORTANTE: Recargar la lista de reservas después de crear
        // Usar un delay más largo para asegurar que la reserva se haya guardado en el backend
        setTimeout(() => {
          this.getReservas().subscribe({
            next: (reservas) => {
              console.log(' Lista de reservas actualizada:', reservas);
            },
            error: (err) => console.error(' Error al recargar reservas:', err)
          });
        }, 300);
      }),
      catchError(error => {
        console.error(' Error creando reserva:', error);
        const message = error?.error?.message || error?.message || 'Error al crear la reserva';
        return throwError(() => ({ message, error }));
      })
    );
  }

  // Eliminar reserva
  eliminarReserva(id: string): Observable<any> {
    console.log(' Eliminando reserva:', id);
    return this.http.delete(`${this.apiUrl}/reservas/${id}`, this.getHeaders()).pipe(
      tap(response => {
        console.log(' Reserva eliminada:', response);
        //  IMPORTANTE: Recargar la lista después de eliminar
        // Usar setTimeout para asegurar que la eliminación se haya procesado en el backend
        setTimeout(() => {
          this.getReservas().subscribe({
            next: () => console.log(' Lista de reservas actualizada'),
            error: (err) => console.error(' Error al recargar reservas:', err)
          });
        }, 100);
      }),
      catchError(error => {
        console.error(' Error eliminando reserva:', error);
        return throwError(() => error.error?.message || 'Error al eliminar reserva');
      })
    );
  }

  // Obtener todas las reservas (Admin) - para panel de préstamos
  getTodasReservas(): Observable<ReservasResponse> {
    console.log(' Solicitando todas las reservas (admin)...');
    return this.http.get<any>(`${this.apiUrl}/reservas/admin/todas`, this.getHeaders()).pipe(
      tap(response => {
        console.log(' Todas las reservas obtenidas del backend:', response);
      }),
      catchError(error => {
        console.error(' Error obteniendo todas las reservas:', error);
        return throwError(() => error);
      })
    );
  }

  // Obtener reservas vencidas (Admin)
  getVencidas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reservas/vencidas`, this.getHeaders());
  }

  // Devolver libro (Admin)
  devolverLibro(libroId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reservas/devolver`, { libro_id: libroId }, this.getHeaders()).pipe(
      tap(response => {
        console.log(' Devolución procesada:', response);
        // Forzar recarga de reservas para actualizar "Mis reservas" de todos los usuarios
        setTimeout(() => {
          this.getReservas().subscribe({
            next: () => console.log(' Lista de reservas actualizada después de devolución'),
            error: (err) => console.error(' Error al recargar reservas:', err)
          });
        }, 500);
      }),
      catchError(error => {
        console.error(' Error en devolución:', error);
        return throwError(() => error);
      })
    );
  }

  // Cancelar reserva (Usuario)
  cancelarReserva(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reservas/${id}`, this.getHeaders());
  }

  // Obtener las reservas en tiempo real (Observable)
  getReservasObservable(): Observable<any[]> {
    return this.reservas$;
  }

  // Forzar recarga de reservas
  recargarReservas(): void {
    this.getReservas().subscribe();
  }

  //  Limpiar reservas cuando el usuario hace logout
  limpiarReservas(): void {
    console.log(' Limpiando reservas del BehaviorSubject');
    this.reservasSubject.next([]);
  }
}

