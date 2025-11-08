import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Imagen {
  id: number; titulo: string; ruta: string; miniatura?: string|null;
  user_id: number; created_at: string; updated_at: string;
}

const API_BASE = 'http://homestead.test/api/v1';

@Injectable({ providedIn: 'root' })
export class ImagenService {
  constructor(private http: HttpClient) {}
  getImagenes(): Observable<Imagen[]> { return this.http.get<Imagen[]>(`${API_BASE}/imagenes`); }
  uploadImagen(titulo: string, userId: number, file: File): Observable<Imagen> {
    const form = new FormData();
    form.append('titulo', titulo);
    form.append('user_id', String(userId));
    form.append('imagen', file);
    return this.http.post<Imagen>(`${API_BASE}/imagenes`, form);
  }
}
