import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private apiUrl = 'http://127.0.0.1:8000/api'; //

  constructor(private http: HttpClient) {}

  //  Obtener headers con token
  private getHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('auth_token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      })
    };
  }

  //  Listar reservas del usuario logueado
  getReservas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reservas`, this.getHeaders());
  }

  //  Crear una nueva reserva
  crearReserva(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reservas`, data, this.getHeaders());
  }

  //  Eliminar reserva
  eliminarReserva(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reservas/${id}`, this.getHeaders());
  }
}
