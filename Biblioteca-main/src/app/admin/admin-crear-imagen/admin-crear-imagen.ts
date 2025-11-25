import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ImagenService } from '../../services/imagen.service';

@Component({
  selector: 'app-admin-crear-imagen',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-crear-imagen.html',
})
export class AdminCrearImagenComponent {
  titulo = '';
  userId = 1;
  file: File | null = null;
  isImage = false;
  subiendo = false;

  constructor(private imagenSrv: ImagenService, private router: Router) {}

  onFile(e: Event) {
    const input = e.target as HTMLInputElement;
    this.file = input.files?.[0] ?? null;
    this.isImage = !!this.file && this.file.type.startsWith('image/');
  }

  crearImagen(f: NgForm) {
    if (f.invalid || !this.file || !this.isImage) return;

    this.subiendo = true;
    this.imagenSrv.uploadImagen(this.titulo, this.userId, this.file).subscribe({
      next: () => {
        //  Mensaje exigido por la guía
        console.log('La imagen ha sido agregada correctamente');
        //  Volver al administrador de imágenes
        this.router.navigate(['/admin/imagenes']);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error:', err.error?.message || err.message);
        this.subiendo = false;
      }
    });
  }

  cancelar() {
    this.router.navigate(['/admin']); // “volver al menú principal”
  }
}
