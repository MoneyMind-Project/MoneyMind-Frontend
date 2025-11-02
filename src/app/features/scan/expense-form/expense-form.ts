import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Expense} from '../../../shared/models/expense.model';
import { CommonModule } from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import {MatOption} from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {TitleCasePipe} from '@angular/common';
import {Category} from '../../../shared/enums/category.enum';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MovementService} from '../../../core/services/movement.service';
import {NgToastService} from 'ng-angular-popup';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOption,
    MatDatepickerToggle,
    MatDatepicker,
    MatDatepickerInput,
    TitleCasePipe,
    CommonModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    MatTimepickerModule,
    MatProgressSpinnerModule
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'es-PE' }
  ],
  templateUrl: './expense-form.html',
  styleUrl: './expense-form.css'
})
export class ExpenseForm implements OnInit {
  @Input() initialData?: Partial<Expense>;
  @Output() save = new EventEmitter<Expense>();
  @Output() cancel = new EventEmitter<void>();

  categories: Category[] = Object.values(Category);
  form!: FormGroup;
  loading = false;
  isDuplicated = false;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private expenseService: MovementService, private toast: NgToastService) {}

  ngOnInit() {
    this.form = this.fb.group({
      category: [null as Category | null, Validators.required],
      place: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      total: [0, [Validators.required, Validators.min(0.01)]],
      comment: ['']
    });

    if (this.initialData) {
      const patchedData = {
        ...this.initialData,
        category: this.initialData.category ?? null,
        date: this.initialData.date ? this.parseDateString(this.initialData.date as string) : null, // 👈 AGREGADO
        time: this.initialData.time ? this.parseTimeString(this.initialData.time) : null
      };
      this.form.patchValue(patchedData);
    }
  }

  formatCategory(cat: string): string {
    return cat.replace(/_/g, ' ').toLowerCase();
  }

  submit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.errorMessage = null;
    this.isDuplicated = false;

    const rawValue = this.form.value;

    const formattedDate = this.formatDate(rawValue.date);
    const formattedTime = this.formatTime(rawValue.time);

    const expense: Expense = {
      ...rawValue,
      date: formattedDate,
      time: formattedTime
    };

    this.expenseService.createExpense(expense).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
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
        this.errorMessage = 'Error inesperado al crear el gasto';
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
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
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
    this.form.reset();
  }
}
