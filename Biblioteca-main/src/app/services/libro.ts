import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AuthService } from './auth';

export interface Libro {
  _id: string;
  titulo: string;
  autor: string;
  genero: string;
  descripcion: string;
  anio_edicion: string;
  imagen: string;
  disponibilidad: 'Disponible' | 'Agotado' | 'Prestado';
  copias_totales: number;
  copias_disponibles: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CrearLibroPayload {
  titulo: string;
  autor: string;
  genero: string;
  descripcion: string;
  anio_edicion: string;
  imagen?: string;
  copias_totales?: number;
  copias_disponibles?: number;
}

export interface ActualizarLibroPayload {
  titulo?: string;
  autor?: string;
  genero?: string;
  descripcion?: string;
  anio_edicion?: string;
  imagen?: string;
  copias_totales?: number;
  copias_disponibles?: number;
  disponibilidad?: 'Disponible' | 'Agotado' | 'Prestado';
}

@Injectable({
  providedIn: 'root',
})
export class LibroService {
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getLibros(): Observable<Libro[]> {
    return this.http.get<Libro[]>(`${this.apiUrl}/libros`).pipe(
      map((libros) =>
        libros.map((libro: any) => ({
          ...libro,
          _id: libro._id ?? libro.id,
          disponibilidad: libro.disponibilidad || (libro.copias_disponibles > 0 ? 'Disponible' : 'Agotado'),
          imagen: libro.imagen || 'https://via.placeholder.com/150',
        }))
      )
    );
  }

  crearLibro(payload: CrearLibroPayload): Observable<Libro> {
    const headers = this.buildAuthHeaders();
    return this.http.post<{ libro: Libro }>(`${this.apiUrl}/libros`, payload, { headers }).pipe(
      map((response) => response.libro)
    );
  }

  actualizarLibro(id: string, payload: ActualizarLibroPayload): Observable<Libro> {
    const headers = this.buildAuthHeaders();
    return this.http.patch<{ libro: Libro }>(`${this.apiUrl}/libros/${id}`, payload, { headers }).pipe(
      map((response) => response.libro)
    );
  }

  agregarStock(id: string, cantidad: number): Observable<Libro> {
    const headers = this.buildAuthHeaders();
    return this.http.patch<{ libro: Libro }>(
      `${this.apiUrl}/libros/${id}/stock`,
      { cantidad },
      { headers }
    ).pipe(map((response) => response.libro));
  }

  eliminarLibro(id: string): Observable<void> {
    const headers = this.buildAuthHeaders();
    return this.http.delete<{ message: string }>(`${this.apiUrl}/libros/${id}`, { headers }).pipe(
      map(() => undefined)
    );
  }

  private buildAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    const headersConfig: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (token) {
      headersConfig['Authorization'] = `Bearer ${token}`;
    }

    return new HttpHeaders(headersConfig);
  }
}


