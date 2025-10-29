// auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('mm-current-user'); // o donde guardes el token
    if (token) {
      return true; // usuario logueado, puede entrar
    } else {
      this.router.navigate(['/auth/login']); // no logueado, manda al login
      return false;
    }
  }
}
