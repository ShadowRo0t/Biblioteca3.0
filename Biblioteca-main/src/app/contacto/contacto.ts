import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';      // ngModel
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './contacto.html',
  styleUrls: ['./contacto.css']
})
export class Contacto {
  nombre = '';
  correo = '';
  mensaje = '';

  // Archivos
  archivos: File[] = [];
  maxFiles = 5;                // máximo 5 archivos
  maxSizeMB = 10;              // 10 MB por archivo
  tiposPermitidos = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword' // .doc
  ];

  errorArchivos: string | null = null;

  onFilesSelected(event: Event) {
    this.errorArchivos = null;
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const seleccion = Array.from(input.files);

    // Validaciones
    if (this.archivos.length + seleccion.length > this.maxFiles) {
      this.errorArchivos = `Máximo ${this.maxFiles} archivos en total.`;
      return;
    }

    for (const file of seleccion) {
      const sizeOk = file.size <= this.maxSizeMB * 1024 * 1024;
      const tipoOk = this.tiposPermitidos.includes(file.type);
      if (!sizeOk) {
        this.errorArchivos = `El archivo "${file.name}" supera ${this.maxSizeMB} MB.`;
        return;
      }
      if (!tipoOk) {
        this.errorArchivos = `Tipo no permitido: ${file.name}. Adjunta PDF, JPG, PNG o DOC/DOCX.`;
        return;
      }
    }

    this.archivos.push(...seleccion);
    // limpia el input para permitir re-selección del mismo archivo si se elimina
    input.value = '';
  }

  quitarArchivo(i: number) {
    this.archivos.splice(i, 1);
  }

  pesoHumano(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  formInvalido(): boolean {
    const emailOk = /\S+@\S+\.\S+/.test(this.correo);
    return !this.nombre || !emailOk || !this.mensaje || !!this.errorArchivos;
  }

  enviar() {
    if (this.formInvalido()) return;

    // Construir FormData para enviar al backend
    const fd = new FormData();
    fd.append('nombre', this.nombre);
    fd.append('correo', this.correo);
    fd.append('mensaje', this.mensaje);
    this.archivos.forEach((f, idx) => fd.append('archivos', f, f.name));

    // TODO: reemplazar por un servicio HTTP real
    // this.contactoService.enviar(fd).subscribe(...)
    console.log('FormData listo para enviar', {
      nombre: this.nombre,
      correo: this.correo,
      mensaje: this.mensaje,
      archivos: this.archivos.map(a => ({ name: a.name, size: a.size, type: a.type }))
    });

    alert('Mensaje enviado (simulado). Aquí iría la llamada HTTP.');
    this.nombre = '';
    this.correo = '';
    this.mensaje = '';
    this.archivos = [];
  }
}
