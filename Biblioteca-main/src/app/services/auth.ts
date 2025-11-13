import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

// Interfaz para tipar la respuesta del login
interface LoginResponse {
  token: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  // 🔹 Chequea si estamos en navegador (no en SSR)
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, userData).pipe(
      tap(response => {
        console.log('✅ Registro exitoso:', response);
      }),
      catchError(error => {
        console.error('❌ Error en registro:', error);
        return throwError(() => error);
      })
    );
  }

  login(credentials: any): Observable<LoginResponse> {
    console.log('🔐 Intentando login con:', credentials);
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials, { headers }).pipe(
      tap(response => {
        console.log('✅ Login exitoso:', response);
        if (response.token) {
          this.saveToken(response.token);
          console.log('✅ Token guardado en localStorage');
        }
      }),
      catchError(error => {
        console.error('❌ Error en login:', error.error?.message || error.message);
        console.error('Status:', error.status);
        console.error('Respuesta completa:', error);
        return throwError(() => error.error?.message || 'Error al iniciar sesión');
      })
    );
  }

  saveToken(token: string) {
    if (this.isBrowser()) {
      localStorage.setItem('auth_token', token);
      console.log('✅ Token guardado');
    }
  }

  getToken(): string | null {
    if (this.isBrowser()) {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  logout() {
    if (this.isBrowser()) {
      localStorage.removeItem('auth_token');
      console.log('✅ Token eliminado - Usuario deslogueado');
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}