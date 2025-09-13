import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-profile',
  imports: [
    MatButton
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile {

  constructor(private router: Router) {}

  logOut() {
    // Limpia el token
    localStorage.removeItem('mm-current-user');

    // Opcional: limpiar todo lo del localStorage
    // localStorage.clear();

    // Redirigir al login
    this.router.navigate(['/auth/login']);
  }
}
