import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservaService } from '../services/reserva';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './misreservas.html',
  styleUrls: ['./misreservas.css']
})
export class MisReservas implements OnInit, OnDestroy {
  reservas: any[] = [];
  loading = false;
  error: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(private reservaService: ReservaService) {}

  ngOnInit() {
    // ✅ Cargar reservas al iniciar
    this.cargarReservas();

    // ✅ Observar cambios en la lista de reservas en tiempo real
    this.reservaService.getReservasObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe(reservas => {
        console.log('🔄 Reservas actualizadas:', reservas);
        this.reservas = reservas;
      });
  }

  cargarReservas() {
    this.loading = true;
    this.error = null;

    this.reservaService.getReservas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('✅ Reservas cargadas:', response);
          // El backend devuelve un array directamente, normalizar la respuesta
          const reservasArray = Array.isArray(response) 
            ? response 
            : ((response as { reservas?: any[] })?.reservas || []);
          this.reservas = reservasArray;
          this.loading = false;
        },
        error: (error) => {
          console.error('❌ Error cargando reservas:', error);
          this.error = 'Error al cargar reservas';
          this.loading = false;
        }
      });
  }

  eliminarReserva(id: string) {
    if (confirm('¿Estás seguro de que deseas eliminar esta reserva?')) {
      this.reservaService.eliminarReserva(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log('✅ Reserva eliminada');
            this.cargarReservas(); // Recargar lista
          },
          error: (error) => {
            console.error('❌ Error:', error);
            this.error = error;
          }
        });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}