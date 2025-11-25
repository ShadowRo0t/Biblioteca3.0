import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { ReservaService } from '../services/reserva';
import { NotificationService, Notificacion } from '../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  menuOpen = signal(false);
  adminMenuOpen = signal(false);
  notificacionesOpen = signal(false);
  notificaciones = signal<Notificacion[]>([]);
  contadorNotificaciones = signal<number>(0);

  private notificacionesSubscription?: Subscription;

  constructor(
    public authService: AuthService,
    private router: Router,
    private reservaService: ReservaService,
    public notificationService: NotificationService
  ) { }

  logout() {
    //  Limpiar reservas antes de hacer logout
    this.reservaService.limpiarReservas();
    this.notificationService.limpiarDatos(); // Limpiar notificaciones también
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

  toggleNotificaciones() {
    this.notificacionesOpen.update(value => !value);
    // Cerrar menú móvil si está abierto
    if (this.menuOpen()) {
      this.menuOpen.set(false);
    }
  }

  cerrarNotificacion(id: string, event: Event) {
    event.stopPropagation(); // Evitar que cierre el dropdown
    this.notificationService.marcarComoVista(id);
  }

  ngOnInit() {
    // Iniciar polling de notificaciones si el usuario está autenticado
    if (this.authService.isLoggedIn()) {
      this.notificationService.iniciarPolling();

      // Suscribirse a las notificaciones
      this.notificacionesSubscription = this.notificationService.notificaciones$.subscribe(
        notifs => {
          this.notificaciones.set(notifs);
          this.contadorNotificaciones.set(notifs.length);
        }
      );
    }
  }

  ngOnDestroy() {
    // Detener polling y limpiar suscripciones
    this.notificationService.detenerPolling();
    if (this.notificacionesSubscription) {
      this.notificacionesSubscription.unsubscribe();
    }
  }
}
