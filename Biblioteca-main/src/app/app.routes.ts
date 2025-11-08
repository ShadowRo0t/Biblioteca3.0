// src/app/app.routes.ts
import { Routes } from '@angular/router';

import { Home } from './home/home';
import { Catalogo } from './catalogo/catalogo';
import { Login } from './login/login';
import { Listado } from './prestamo/listado/listado';
import { Contacto } from './contacto/contacto';
import { AcercaDe } from './acercade/acercade';
import { RegisterComponent } from './register/register';
import { DashboardComponent } from './prestamo/dashboard/dashboard';

import { AuthGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', component: Home, pathMatch: 'full' },
  { path: 'catalogo', component: Catalogo },
  { path: 'prestamos', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'login', component: Login },
  { path: 'register', component: RegisterComponent },
  { path: 'contacto', component: Contacto },
  { path: 'acercade', component: AcercaDe },
  { path: 'imagenes', loadComponent: () => import('./imagenes/imagenes').then(c => c.ImagenesComponent) },
  { path: 'admin', loadChildren: () => import('./admin/admin.routes').then(m => m.adminRoutes) },
  { path: '**', redirectTo: '' }
];
