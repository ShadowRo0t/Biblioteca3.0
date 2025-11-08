import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  login(credentials: any): Observable<any> {
  return new Observable(observer => {
    this.http.post(`${this.apiUrl}/login`, credentials).subscribe({
      next: (res: any) => {
        if (res.token) {
          this.saveToken(res.token); // ✅ guardamos el token
        }
        observer.next(res);
        observer.complete();
      },
      error: (err) => observer.error(err)
    });
  });
}

  saveToken(token: string) {
    if (this.isBrowser()) {
      localStorage.setItem('auth_token', token);
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
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
