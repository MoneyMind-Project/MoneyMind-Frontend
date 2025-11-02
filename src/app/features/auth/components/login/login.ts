import {Component, OnInit} from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {Router, RouterLink} from '@angular/router';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgIf} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {UserService} from '../../../../core/services/user.service';
import {NgToastService} from 'ng-angular-popup';
import {MatCardModule} from '@angular/material/card';
import {OneSignalService} from '../../../../core/services/onesignal.service';
import {MatDialogModule} from '@angular/material/dialog';

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
    MatCardModule,
    MatDialogModule
  ],
  styleUrl: './login.css'
})
export class Login implements OnInit{
  loginForm: FormGroup;
  isLoading = false;

  constructor(private fb: FormBuilder, private router: Router,
              private userService: UserService, private toast: NgToastService,
              private oneSignal: OneSignalService,) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  async ngOnInit() {
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.isLoading=true;
      const formValue = this.loginForm.value;

      const credentials = {
        email: formValue.email.toLowerCase(),
        password: formValue.password
      };

      this.userService.login(credentials).subscribe((res) => {
        if (res.success) {
          this.isLoading = false;
          // Luego, sin bloquear la navegación:
          this.router.navigate(['/']); // o '/home'
        } else {
          this.isLoading = false;
          console.log("ERROR")
          this.toast.danger(res.message, 'Error', 3000);
        }
      });
    }
  }

}
