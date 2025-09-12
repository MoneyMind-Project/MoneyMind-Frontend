import { Component } from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {Router, RouterLink} from '@angular/router';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgIf} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {UserService} from '../../../../core/services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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

  constructor(private fb: FormBuilder, private router: Router, private userService: UserService, private snackBar: MatSnackBar) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      const credentials = this.loginForm.value;

      this.userService.login(credentials).subscribe((res) => {
        if (res.success) {
          console.log('Login exitoso ✅');
          //localStorage.setItem('user', JSON.stringify(res.data?.user));
          this.router.navigate(['/']); // o '/home'
        } else {
          // Mostrar snackbar solo en caso de error
          this.snackBar.open(res.message, 'Cerrar', {
            duration: 3000,
            panelClass: ['snackbar-error'], // opcional: estilo custom
          });
        }
      });
    }
  }

}
