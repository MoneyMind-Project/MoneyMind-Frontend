import { Component } from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {Router, RouterLink} from '@angular/router';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgIf} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {UserService} from '../../../../core/services/user.service';

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
    MatIconModule,
  ],
  styleUrl: './login.css'
})
export class Login {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router, private userService: UserService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      const credentials = this.loginForm.value;

      this.userService.login(credentials).subscribe(success => {
        if (success) {
          console.log('Login exitoso ✅');
          this.router.navigate(['/']); // o '/home' según tu app
        } else {
          console.log('Credenciales inválidas ❌');
        }
      });
    }
  }

}
