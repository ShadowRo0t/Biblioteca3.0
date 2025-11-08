import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Imagen, ImagenService } from '../services/imagen.service';

@Component({
  selector: 'app-imagenes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './imagenes.html',
  styleUrls: ['./imagenes.css'],
})
export class ImagenesComponent implements OnInit {
  imagenes$!: Observable<Imagen[]>;
  titulo = '';
  userId = 1;
  file: File | null = null;

  constructor(private imagenSrv: ImagenService) {}

  ngOnInit(): void { this.refresh(); }

  refresh(): void {
    this.imagenes$ = this.imagenSrv.getImagenes();
  }

  onFileSelected(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length) this.file = input.files[0];
  }

  onSubmit(): void {
    if (!this.file || !this.titulo) return;
    this.imagenSrv.uploadImagen(this.titulo, this.userId, this.file).subscribe({
      next: () => { this.titulo = ''; this.file = null; this.refresh(); },
      error: (err: HttpErrorResponse) =>
        alert('Error subiendo: ' + (err.error?.message || err.message || 'desconocido')),
    });
  }
}
