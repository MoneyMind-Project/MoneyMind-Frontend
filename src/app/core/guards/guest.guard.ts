// guest.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class GuestGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log("no está logueado, puede ver login/register");
      return true; // no está logueado, puede ver login/register
    } else {
      console.log("ya logueado, manda al home");
      this.router.navigate(['/home']); // ya logueado, manda al home
      return false;
    }
  }
}
