// auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token'); // o donde guardes el token
    if (token) {
      console.log("usuario logueado, puede entrar");
      return true; // usuario logueado, puede entrar
    } else {
      console.log("no logueado, manda al login");
      this.router.navigate(['/auth/login']); // no logueado, manda al login
      return false;
    }
  }
}
