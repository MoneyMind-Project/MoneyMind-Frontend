// app.routes.ts
import { Routes } from '@angular/router';
import { AUTH_ROUTES} from './features/auth/components/auth.routes';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'auth', children: AUTH_ROUTES },
];
