import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Income} from '../../../shared/models/income.model';
import { CommonModule } from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormField, MatFormFieldModule} from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import {MatOption, MatOptionModule} from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {TitleCasePipe} from '@angular/common';
import {Category} from '../../../shared/enums/category.enum';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatTimepickerModule } from '@angular/material/timepicker'; // 👈 NUEVO

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
    MatTimepickerModule // 👈 NUEVO
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './income-form.html',
  styleUrl: './income-form.css'
})
export class IncomeForm implements OnInit {
  @Input() initialData?: Partial<Income>;
  @Output() save = new EventEmitter<Income>();
  @Output() cancel = new EventEmitter<void>();

  categories: Category[] = Object.values(Category);

  constructor(private fb: FormBuilder) {}

  form!: FormGroup;

  ngOnInit() {
    this.form = this.fb.group({
      title: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      total: [0, [Validators.required, Validators.min(0.01)]],
      comment: ['']
    });

    if (this.initialData) {
      const patchedData = {
        ...this.initialData,
        time: this.initialData.time ? this.parseTimeString(this.initialData.time) : null // 👈 NUEVO
      };
      this.form.patchValue(patchedData);
    }
  }

  submit() {
    if (this.form.valid) {
      const rawValue = this.form.value;

      // Asegurar formato de fecha YYYY-MM-DD
      const formattedDate = this.formatDate(rawValue.date);

      // Convertir el tiempo de Date a string HH:mm 👈 NUEVO
      const formattedTime = this.formatTime(rawValue.time);

      this.save.emit({
        ...rawValue,
        date: formattedDate,
        time: formattedTime // 👈 NUEVO
      } as Income);
    }
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
