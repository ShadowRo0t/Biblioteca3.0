import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { ReservaService } from '../services/reserva';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent {
  constructor(
    public authService: AuthService, 
    private router: Router,
    private reservaService: ReservaService
  ) {}

  logout() {
    // ✅ Limpiar reservas antes de hacer logout
    this.reservaService.limpiarReservas();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
