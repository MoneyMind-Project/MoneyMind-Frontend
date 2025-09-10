// app.routes.ts
import { Routes } from '@angular/router';
import { AUTH_ROUTES} from './features/auth/components/auth.routes';
import { AuthLayout} from './features/layouts/auth-layout/auth-layout';
import { MainLayout} from './features/layouts/main-layout/main-layout';
import {GuestGuard} from './core/guards/guest.guard';
import {AuthGuard} from './core/guards/auth.guard';
import {Home} from './features/home/home';
import {Scan} from './features/scan/scan';
import {Dashboard} from './features/dashboard/dashboard';
import {Profile} from './features/profile/profile';

export const routes: Routes = [
  {
    path: 'auth',
    component: AuthLayout,
    canActivate: [GuestGuard],
    children: AUTH_ROUTES
  },
  {
    path: '',
    component: MainLayout,
    canActivate: [AuthGuard], // solo accesible si estás logueado
    children: [
      { path: 'home', component: Home },
      { path: 'scan', component: Scan },
      { path: 'dashboard', component: Dashboard },
      { path: 'profile', component: Profile },
      { path: '', redirectTo: 'home', pathMatch: 'full' }, // default después del login
    ],
  },

];
