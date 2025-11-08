import { Routes } from '@angular/router';
import { AdminComponent } from './admin';
import { DashboardComponent } from './dashboard/dashboard';
import { AdminListaImagenesComponent } from './admin-lista-imagenes/admin-lista-imagenes';
import { AdminCrearImagenComponent } from './admin-crear-imagen/admin-crear-imagen';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminComponent,          // shell
    children: [
      { path: '', component: DashboardComponent },               // /admin
      { path: 'imagenes', component: AdminListaImagenesComponent },        // /admin/imagenes
      { path: 'imagenes/crear', component: AdminCrearImagenComponent },    // /admin/imagenes/crear
    ],
  },
];
