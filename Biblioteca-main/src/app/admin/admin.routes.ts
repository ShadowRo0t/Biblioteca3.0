import { Routes } from '@angular/router';
import { AdminComponent } from './admin';
import { DashboardComponent } from './dashboard/dashboard';
import { AdminListaImagenesComponent } from './admin-lista-imagenes/admin-lista-imagenes';
import { AdminCrearImagenComponent } from './admin-crear-imagen/admin-crear-imagen';
import { AdminLibrosComponent } from './admin-libros/admin-libros';
import { AdminGuard } from '../guards/admin-guard';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminComponent,          // shell
    canActivateChild: [AdminGuard],
    children: [
      { path: '', component: DashboardComponent },               // /admin
      { path: 'imagenes', component: AdminListaImagenesComponent },        // /admin/imagenes
      { path: 'imagenes/crear', component: AdminCrearImagenComponent },    // /admin/imagenes/crear
      { path: 'libros', component: AdminLibrosComponent },                 // /admin/libros
    ],
  },
];
