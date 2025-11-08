import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReservaService } from '../../services/reserva';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  reservas: any[] = [];

  constructor(
    private reservaService: ReservaService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.cargarReservas();
    } else {
      this.router.navigate(['/login']); // 🔒 seguridad extra por si entran sin token
    }
  }

  cargarReservas() {
    this.reservaService.getReservas().subscribe({
      next: (data) => this.reservas = data,
      error: (err) => console.error('Error cargando reservas', err)
    });
  }

  cancelarReserva(id: number) {
    this.reservaService.eliminarReserva(id).subscribe({
      next: () => {
        this.reservas = this.reservas.filter(r => r.id !== id);
      },
      error: (err) => console.error('Error cancelando reserva', err)
    });
  }
}
