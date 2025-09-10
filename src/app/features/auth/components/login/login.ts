import { Component } from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {Router, RouterLink} from '@angular/router';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  imports: [
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    RouterLink,
    FormsModule,
    NgIf,
  ],
  styleUrl: './login.css'
})
export class Login {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      console.log('Usuario registrado:', this.loginForm.value);
      // Aquí luego llamas a tu API
      //redirigir a home
    }
    // aquí llamas a tu API, validas credenciales, etc.
    console.log('Iniciando sesión...');
    // Si el login es exitoso:
    //this.router.navigate(['/home']);
  }

}
