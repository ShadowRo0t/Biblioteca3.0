import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { LibroService, Libro } from '../../services/libro';

@Component({
  selector: 'app-admin-libros',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-libros.html',
  styleUrls: ['./admin-libros.css'],
})
export class AdminLibrosComponent implements OnInit {
  private fb = inject(FormBuilder);
  libros = signal<Libro[]>([]);
  isFetching = signal(false);
  isProcessing = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  crearLibroForm = this.fb.group({
    titulo: ['', [Validators.required, Validators.maxLength(150)]],
    autor: ['', [Validators.required, Validators.maxLength(150)]],
    genero: ['', [Validators.required, Validators.maxLength(120)]],
    descripcion: ['', [Validators.required, Validators.maxLength(600)]],
    anio_edicion: ['', [Validators.required, Validators.maxLength(10)]],
    imagen: [''],
    copias_totales: [1, [Validators.required, Validators.min(0)]],
  });

  stockForm = this.fb.group({
    libroId: ['', [Validators.required]],
    cantidad: [1, [Validators.required, Validators.min(1)]],
  });

  constructor(
    private libroService: LibroService
  ) {}

  ngOnInit(): void {
    this.cargarLibros();
  }

  cargarLibros(): void {
    this.isFetching.set(true);
    this.errorMessage.set(null);

    this.libroService.getLibros().subscribe({
      next: (libros) => {
        this.libros.set(libros);
      },
      error: (error) => {
        console.error('Error cargando libros:', error);
        this.errorMessage.set('No se pudieron cargar los libros. Intenta nuevamente más tarde.');
      },
      complete: () => this.isFetching.set(false),
    });
  }

  crearLibro(): void {
    if (this.crearLibroForm.invalid || this.isProcessing()) {
      this.crearLibroForm.markAllAsTouched();
      return;
    }

    const payload = {
      titulo: this.crearLibroForm.value.titulo?.trim() || '',
      autor: this.crearLibroForm.value.autor?.trim() || '',
      genero: this.crearLibroForm.value.genero?.trim() || '',
      descripcion: this.crearLibroForm.value.descripcion?.trim() || '',
      anio_edicion: this.crearLibroForm.value.anio_edicion?.trim() || '',
      imagen: this.crearLibroForm.value.imagen?.trim() || undefined,
      copias_totales: this.crearLibroForm.value.copias_totales ?? 1,
      copias_disponibles: this.crearLibroForm.value.copias_totales ?? 1,
    };

    this.isProcessing.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.libroService.crearLibro(payload).subscribe({
      next: (libro) => {
        this.successMessage.set(`Libro "${libro.titulo}" creado correctamente.`);
        this.libros.update((current) => [libro, ...current]);
        this.crearLibroForm.reset({
          titulo: '',
          autor: '',
          genero: '',
          descripcion: '',
          anio_edicion: '',
          imagen: '',
          copias_totales: 1,
        });
      },
      error: (error) => {
        console.error('Error creando libro:', error);
        const message =
          error?.error?.message ||
          error?.message ||
          'No se pudo crear el libro. Intenta nuevamente.';
        this.errorMessage.set(message);
      },
      complete: () => this.isProcessing.set(false),
    });
  }

  agregarStock(): void {
    if (this.stockForm.invalid || this.isProcessing()) {
      this.stockForm.markAllAsTouched();
      return;
    }

    const libroId = this.stockForm.value.libroId!;
    const cantidad = Number(this.stockForm.value.cantidad);

    this.isProcessing.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.libroService.agregarStock(libroId, cantidad).subscribe({
      next: (libroActualizado) => {
        this.successMessage.set(`Se añadieron ${cantidad} copias a "${libroActualizado.titulo}".`);
        this.libros.update((current) =>
          current.map((libro) => (libro._id === libroActualizado._id ? libroActualizado : libro))
        );
        this.stockForm.reset({ libroId, cantidad: 1 });
      },
      error: (error) => {
        console.error('Error agregando stock:', error);
        const message =
          error?.error?.message ||
          error?.message ||
          'No se pudo actualizar el stock. Intenta nuevamente.';
        this.errorMessage.set(message);
      },
      complete: () => this.isProcessing.set(false),
    });
  }

  eliminarLibro(libro: Libro): void {
    if (this.isProcessing()) {
      return;
    }

    const confirmar = confirm(`¿Eliminar el libro "${libro.titulo}"?`);
    if (!confirmar) return;

    this.isProcessing.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.libroService.eliminarLibro(libro._id).subscribe({
      next: () => {
        this.successMessage.set(`Libro "${libro.titulo}" eliminado correctamente.`);
        this.libros.update((current) => current.filter((item) => item._id !== libro._id));
        if (this.stockForm.value.libroId === libro._id) {
          this.stockForm.reset({ libroId: '', cantidad: 1 });
        }
      },
      error: (error) => {
        console.error('Error eliminando libro:', error);
        const message =
          error?.error?.message ||
          error?.message ||
          'No se pudo eliminar el libro. Intenta nuevamente.';
        this.errorMessage.set(message);
      },
      complete: () => this.isProcessing.set(false),
    });
  }

  getLibroPorId(id: string): Libro | undefined {
    return this.libros().find((libro) => libro._id === id);
  }
}


