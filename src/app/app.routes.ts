// app.routes.ts
import { Routes } from '@angular/router';
import { AUTH_ROUTES} from './features/auth/components/auth.routes';
import { AuthLayout} from './features/layouts/auth-layout/auth-layout';
import { MainLayout} from './features/layouts/main-layout/main-layout';
import {GuestGuard} from './core/guards/guest.guard';
import {AuthGuard} from './core/guards/auth.guard';

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
    canActivate: [AuthGuard],
    children: []
  }

];
