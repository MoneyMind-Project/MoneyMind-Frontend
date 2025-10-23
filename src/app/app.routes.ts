// app.routes.ts
import { Routes } from '@angular/router';
import { AUTH_ROUTES} from './features/auth/components/auth.routes';
import { AuthLayout} from './features/layouts/auth-layout/auth-layout';
import { MainLayout} from './features/layouts/main-layout/main-layout';
import {GuestGuard} from './core/guards/guest.guard';
import {AuthGuard} from './core/guards/auth.guard';
import {Home} from './features/home/home';
import {RecurrentList} from './features/home/recurrent-list/recurrent-list';
import {Scan} from './features/scan/scan';
import {AllMovements} from './features/scan/all-movements/all-movements';
import {Dashboard} from './features/dashboard/dashboard';
import {Profile} from './features/profile/profile';
import {Notifications} from './features/dashboard/notifications/notifications';

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
      { path: 'home/recurrent-payments', component: RecurrentList },
      {
        path: 'scan',
        component: Scan,
      },
      {
        path: 'scan/all-movements',
        component: AllMovements
      },
      { path: 'dashboard', component: Dashboard },
      { path: 'profile', component: Profile },
      { path: 'dashboard/notifications', component: Notifications },
      { path: '', redirectTo: 'home', pathMatch: 'full' }, // default después del login
    ],
  },

];
