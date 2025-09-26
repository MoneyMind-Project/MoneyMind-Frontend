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
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MovementService} from '../../../core/services/movement.service';


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
    MatTimepickerModule
  ],
  providers: [provideNativeDateAdapter()],
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
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private expenseService: MovementService) {}

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
        time: this.initialData.time ? this.parseTimeString(this.initialData.time) : null // 👈 NUEVO
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
          this.errorMessage = res.message;
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

  // 👈 NUEVO: Convertir Date a string HH:mm
  private formatTime(time: any): string {
    if (!time) return '';

    if (!(time instanceof Date)) {
      time = new Date(time);
    }

    const hours = String(time.getHours()).padStart(2, '0');
    const minutes = String(time.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  // 👈 NUEVO: Convertir string HH:mm a Date para el timepicker
  private parseTimeString(timeString: string): Date | null {
    if (!timeString) return null;

    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return date;
  }

  onCancel() {
    this.cancel.emit();
  }

  resetForm() {
    this.form.reset();
  }
}

