import { Component, signal } from '@angular/core';
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
  menuOpen = signal(false);
  adminMenuOpen = signal(false);

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
    this.closeMenus();
  }

  toggleMenu() {
    this.menuOpen.update(value => !value);
    if (!this.menuOpen()) {
      this.adminMenuOpen.set(false);
    }
  }

  toggleAdminMenu() {
    this.adminMenuOpen.update(value => !value);
  }

  closeMenus() {
    this.menuOpen.set(false);
    this.adminMenuOpen.set(false);
  }

  navigate(path: string) {
    this.router.navigate([path]);
    this.closeMenus();
  }
}
