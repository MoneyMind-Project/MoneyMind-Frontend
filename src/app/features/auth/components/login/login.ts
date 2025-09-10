import { Component } from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {Router, RouterLink} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterLink,
  ],
  styleUrl: './login.css'
})
export class Login {
  constructor(private router: Router) {}

  onLogin() {
    // aquí llamas a tu API, validas credenciales, etc.
    console.log('Iniciando sesión...');
    // Si el login es exitoso:
    //this.router.navigate(['/home']);
  }

}
