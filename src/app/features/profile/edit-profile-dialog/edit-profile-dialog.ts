import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {MatNativeDateModule, MAT_DATE_LOCALE, provideNativeDateAdapter} from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { User} from '../../../shared/models/user.model';
import {UserService} from '../../../core/services/user.service';
import {ApiResponse} from '../../../shared/models/response.model';
import {NgToastService} from 'ng-angular-popup';

interface EditProfileData {
  user: User;
  monthlyIncome: number;
}

@Component({
  selector: 'app-edit-profile-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatIconModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    provideNativeDateAdapter()
  ],
  templateUrl: './edit-profile-dialog.html',
  styleUrl: './edit-profile-dialog.css'
})
export class EditProfileDialog implements OnInit {
  editForm!: FormGroup;
  maxDate: Date;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditProfileDialog>,
    private userService: UserService,
    private toast: NgToastService,
    @Inject(MAT_DIALOG_DATA) public data: EditProfileData
  ) {
    // Fecha máxima: hace 18 años
    this.maxDate = new Date();
    this.maxDate.setFullYear(this.maxDate.getFullYear() - 0);
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    // Parsear la fecha de nacimiento
    const birthDate = this.data.user.birth_date
      ? this.parseDateString(this.data.user.birth_date)
      : null;

    // Determinar si tiene ingreso mensual
    const hasIncome = this.data.monthlyIncome > 0;

    this.editForm = this.fb.group({
      firstName: [this.data.user.first_name, [Validators.required, Validators.minLength(2)]],
      lastName: [this.data.user.last_name, [Validators.required, Validators.minLength(2)]],
      birthDate: [birthDate, Validators.required],
      gender: [this.data.user.gender, Validators.required],
      preferNotToSayIncome: [!hasIncome],
      monthlyIncome: [hasIncome ? this.data.monthlyIncome : null]
    });
  }

  parseDateString(dateString: string): Date {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  onIncomePreferenceChange(event: any): void {
    const preferNotToSay = event.checked;

    if (preferNotToSay) {
      this.editForm.get('monthlyIncome')?.setValue(null);
      this.editForm.get('monthlyIncome')?.clearValidators();
    }

    this.editForm.get('monthlyIncome')?.updateValueAndValidity();
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onSave(): void {
    if (this.editForm.valid) {
      const formData = this.editForm.value;

      // Formatear fecha
      const birthDate = new Date(formData.birthDate);
      const formattedDate = birthDate.toISOString().split('T')[0];

      const updatedData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        birth_date: formattedDate,
        gender: formData.gender,
        monthly_income: formData.preferNotToSayIncome ? null : (formData.monthlyIncome ? Number(formData.monthlyIncome) : null)
      };

      this.userService.updateProfile(updatedData).subscribe((response: ApiResponse<any>) => {
        if (response.success) {
          this.toast.success(response.message, 'Éxito');
          this.dialogRef.close(response.data); // 👈 devolvemos los datos actualizados
        } else {
          this.toast.danger(response.message, 'Error');
        }
      });

    } else {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.editForm.controls).forEach(key => {
        this.editForm.get(key)?.markAsTouched();
      });
    }
  }

  get isFormValid(): boolean {
    return this.editForm.valid;
  }
}
