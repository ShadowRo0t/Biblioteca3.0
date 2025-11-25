import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth'; // ajusta la ruta si es distinta
import { ReservaService } from '../services/reserva';
import { LibroService, Libro } from '../services/libro';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './catalogo.html',
  styleUrls: ['./catalogo.css']
})
export class Catalogo implements OnInit {
  searchTerm: string = '';

  // ----- ESTADO DEL MODAL / CALENDARIO -----
  showCalendario = false;
  libroSeleccionado: Libro | null = null;
  fechaDesde = '';
  fechaHasta = '';
  tipoPrestamo: 'sala' | 'domicilio' = 'domicilio';

  libros: Libro[] = [];
  isLoading = signal(false);
  loadError = signal<string | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router,
    private reservaService: ReservaService,
    private libroService: LibroService
  ) { }

  ngOnInit(): void {
    this.fetchLibros();
  }

  private fetchLibros(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    this.libroService.getLibros().subscribe({
      next: (libros) => {
        this.libros = libros;
      },
      error: () => {
        this.loadError.set('No se pudieron cargar los libros del catálogo.');
        this.isLoading.set(false);
      },
      complete: () => this.isLoading.set(false),
    });
  }

  // mínimo: hoy (para no permitir fechas pasadas)
  get hoy(): string {
    return new Date().toISOString().split('T')[0];
  }

  //  Filtro de búsqueda
  librosFiltrados() {
    if (!this.searchTerm) return this.libros;
    const term = this.searchTerm.toLowerCase();
    return this.libros.filter(libro =>
      libro.titulo?.toLowerCase().includes(term) ||
      libro.autor?.toLowerCase().includes(term) ||
      libro.genero?.toLowerCase().includes(term)
    );
  }

  // ----- MODAL: abrir / cerrar / confirmar -----
  openCalendario(libro: Libro) {
    //  Validación de sesión
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']); // si no está logueado → login
      return;
    }

    // si está agotado → no permitir
    if (!this.isLibroReservable(libro)) {
      return;
    }

    // si está logueado y disponible → abrir modal
    this.libroSeleccionado = libro;
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.tipoPrestamo = 'domicilio';
    this.showCalendario = true;
  }

  cerrarCalendario() {
    this.showCalendario = false;
    this.libroSeleccionado = null;
  }

  confirmarPrestamo() {
    if (!this.fechaDesde || !this.fechaHasta) {
      alert('Selecciona ambas fechas (desde y hasta).');
      return;
    }
    if (this.fechaDesde > this.fechaHasta) {
      alert('La fecha “desde” no puede ser mayor que la “hasta”.');
      return;
    }

    if (!this.libroSeleccionado?._id) {
      alert('No se pudo identificar el libro seleccionado.');
      return;
    }

    const nuevaReserva = {
      libro_id: this.libroSeleccionado._id,
      tipo: this.tipoPrestamo,
      desde: this.fechaDesde,
      hasta: this.fechaHasta
    };

    this.reservaService.crearReserva(nuevaReserva).subscribe({
      next: () => {
        alert(` Préstamo registrado para "${this.libroSeleccionado?.titulo}" 
Desde: ${this.fechaDesde} 
Hasta: ${this.fechaHasta}`);

        this.cerrarCalendario();
        this.fetchLibros();
        this.router.navigate(['/prestamos']);
      },
      error: (err) => {
        console.error('Error al crear la reserva', err);
        const message = err?.message || err?.error?.message || 'Ocurrió un error al registrar la reserva.';
        alert(` ${message}`);
        if (err?.error?.message === 'Token no proporcionado' || err?.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  getEstadoClase(libro: Libro): 'disponible' | 'no-disponible' {
    return this.isLibroReservable(libro) ? 'disponible' : 'no-disponible';
  }

  isLibroReservable(libro: Libro): boolean {
    const disponibilidad = (libro.disponibilidad || '').toLowerCase();
    return disponibilidad === 'disponible' && (libro.copias_disponibles ?? 0) > 0;
  }
}
