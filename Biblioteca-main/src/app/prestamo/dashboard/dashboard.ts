import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReservaService } from '../../services/reserva';
import { AuthService } from '../../services/auth';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  reservas: any[] = [];
  loading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private reservaService: ReservaService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      // Cargar reservas inicialmente
      this.cargarReservas();

      // ✅ Escuchar cambios en tiempo real del BehaviorSubject
      this.reservaService.getReservasObservable()
        .pipe(takeUntil(this.destroy$))
        .subscribe(reservas => {
          console.log('🔄 Dashboard: Reservas actualizadas:', reservas);
          this.reservas = reservas;
        });
    } else {
      this.router.navigate(['/login']); // 🔒 seguridad extra por si entran sin token
    }
  }

  cargarReservas() {
    this.loading = true;
    this.reservaService.getReservas().subscribe({
      next: (data) => {
        // El backend devuelve un array directamente, normalizar la respuesta
        const reservasArray = Array.isArray(data) 
          ? data 
          : ((data as { reservas?: any[] })?.reservas || []);
        this.reservas = reservasArray;
        this.loading = false;
        console.log('✅ Dashboard: Reservas cargadas:', reservasArray);
      },
      error: (err) => {
        console.error('❌ Error cargando reservas:', err);
        this.loading = false;
      }
    });
  }

  cancelarReserva(id: any) {
    // El backend puede usar _id (MongoDB) o id
    const reservaId = id?._id || id?.id || id;
    if (!reservaId) {
      console.error('❌ ID de reserva no válido');
      return;
    }

    if (confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      this.reservaService.eliminarReserva(reservaId.toString()).subscribe({
        next: () => {
          console.log('✅ Reserva cancelada');
          // La lista se actualizará automáticamente gracias al BehaviorSubject
        },
        error: (err) => {
          console.error('❌ Error cancelando reserva:', err);
          alert('Error al cancelar la reserva');
        }
      });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
