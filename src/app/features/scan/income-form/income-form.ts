import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Income} from '../../../shared/models/income.model';
import { CommonModule } from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MovementService} from '../../../core/services/movement.service';
import {ApiResponse} from '../../../shared/models/response.model';
import {NgToastService} from 'ng-angular-popup';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-income-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerToggle,
    MatDatepicker,
    MatDatepickerInput,
    CommonModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    MatTimepickerModule,
    MatCheckboxModule,
    MatIconModule
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'es-PE' }
  ],
  templateUrl: './income-form.html',
  styleUrl: './income-form.css'
})
export class IncomeForm implements OnInit {
  @Input() initialData?: Partial<Income>;
  @Output() save = new EventEmitter<Income>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  loading = false;
  isDuplicated = false;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private incomeService: MovementService, private toast: NgToastService) {}

  ngOnInit() {
    this.form = this.fb.group({
      title: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      total: [0, [Validators.required, Validators.min(0.01)]],
      comment: [''],
      is_recurring: [false]
    });

    if (this.initialData) {
      const patchedData = {
        ...this.initialData,
        date: this.initialData.date ? this.parseDateString(this.initialData.date as string) : null, // 👈 AGREGADO
        time: this.initialData.time ? this.parseTimeString(this.initialData.time) : null,
        is_recurring: this.initialData.is_recurring ?? false
      };
      this.form.patchValue(patchedData);
    }
  }

  submit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.errorMessage = null;
    this.isDuplicated = false;

    const rawValue = this.form.value;

    const formattedDate = this.formatDate(rawValue.date);
    const formattedTime = this.formatTime(rawValue.time);

    const income: Income = {
      ...rawValue,
      date: formattedDate,
      time: formattedTime,
      is_recurring: rawValue.is_recurring ?? false
    };

    this.incomeService.createIncome(income).subscribe({
      next: (res: ApiResponse<Income>) => {
        this.loading = false;
        if (res.success && res.data) {
          this.save.emit(res.data);
        } else {
          if (res.message === 'DUPLICATED') {
            this.isDuplicated = true; // 👈 activamos alerta en el form
            this.toast.danger(
              'No se pudo crear el registro porque ya existe otro con las mismas características.',
              'Error',
              3000
            );
          } else {
            this.errorMessage = res.message;
          }
        }
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Error inesperado al crear el ingreso';
      }
    });
  }

  private formatDate(date: any): string {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatTime(time: any): string {
    if (!time) return '';

    if (!(time instanceof Date)) {
      time = new Date(time);
    }

    const hours = String(time.getHours()).padStart(2, '0');
    const minutes = String(time.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private parseTimeString(timeString: string): Date | null {
    if (!timeString) return null;

    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return date;
  }

  // 👈 NUEVO: Convertir string YYYY-MM-DD a Date local (sin desfase de zona horaria)
  private parseDateString(dateString: string): Date | null {
    if (!dateString) return null;

    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  onCancel() {
    this.cancel.emit();
  }

  resetForm() {
    this.form.reset({
      is_recurring: false // Reset al valor por defecto
    });
  }
}
