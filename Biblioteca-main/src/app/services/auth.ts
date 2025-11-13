import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

// Interfaz para tipar la respuesta del login
interface LoginResponse {
  token: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
  };
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/api';
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

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
        this.handleLoginSuccess(response);
      }),
      catchError(error => {
        console.error('❌ Error en login:', error.error?.message || error.message);
        console.error('Status:', error.status);
        console.error('Respuesta completa:', error);
        return throwError(() => error.error?.message || 'Error al iniciar sesión');
      })
    );
  }

  private handleLoginSuccess(response: LoginResponse) {
    if (response.token) {
      this.saveToken(response.token);
    }

    if (response.user) {
      this.saveUser(response.user);
    }
  }

  saveToken(token: string) {
    if (this.isBrowser()) {
      localStorage.setItem(this.tokenKey, token);
      console.log('✅ Token guardado');
    }
  }

  getToken(): string | null {
    if (this.isBrowser()) {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  saveUser(user: LoginResponse['user']) {
    if (this.isBrowser() && user) {
      localStorage.setItem(this.userKey, JSON.stringify(user));
      console.log('✅ Datos de usuario guardados');
    }
  }

  getUser(): LoginResponse['user'] | null {
    if (!this.isBrowser()) {
      return null;
    }

    const raw = localStorage.getItem(this.userKey);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw);
    } catch (error) {
      console.warn('⚠️ No se pudo parsear el usuario desde localStorage', error);
      return null;
    }
  }

  isAdmin(): boolean {
    return this.getUser()?.role === 'admin';
  }

  logout() {
    if (this.isBrowser()) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
      console.log('✅ Sesión cerrada - Token y datos eliminados');
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}