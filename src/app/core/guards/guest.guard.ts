// guest.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class GuestGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('mm-current-user');
    if (!token) {
      return true; // no está logueado, puede ver login/register
    } else {
      this.router.navigate(['/home']); // ya logueado, manda al home
      return false;
    }
  }
}
