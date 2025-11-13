import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Imagen {
  id: number;
  titulo: string;
  ruta: string;
  miniatura?: string | null;
  user_id: number;
  created_at: string;
  updated_at: string;
}

const API_BASE = 'http://localhost:8000/api/v1';
const HOST = 'http://homestead.test';
const toAbs = (p?: string | null) => !p ? '' : (p.startsWith('http') ? p : `${HOST}${p}`);

@Injectable({ providedIn: 'root' })
export class ImagenService {
  constructor(private http: HttpClient) {}

  // LISTAR
  getImagenes(): Observable<Imagen[]> {
    return this.http.get<Imagen[]>(`${API_BASE}/imagenes`).pipe(
      map(list => list.map(i => ({
        ...i,
        ruta: toAbs(i.ruta),
        miniatura: i.miniatura ? toAbs(i.miniatura) : null
      })))
    );
  }

  // SUBIR
  uploadImagen(titulo: string, userId: number, file: File): Observable<Imagen> {
    const form = new FormData();
    form.append('titulo', titulo);
    form.append('user_id', String(userId));
    form.append('imagen', file);

    return this.http.post<Imagen>(`${API_BASE}/imagenes`, form).pipe(
      map(i => ({
        ...i,
        ruta: toAbs(i.ruta),
        miniatura: i.miniatura ? toAbs(i.miniatura) : null
      }))
    );
  }
}
