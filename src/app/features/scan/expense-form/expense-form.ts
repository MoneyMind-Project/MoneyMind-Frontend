import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Expense} from '../../../shared/models/expense.model';
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
import {Income} from '../../../shared/models/income.model';


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
    MatButtonModule
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

  constructor(private fb: FormBuilder) {}

  form!: FormGroup;

  ngOnInit() {
    this.form = this.fb.group({
      category: [null as Category | null, Validators.required],
      place: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      total: [0, Validators.required],
      comment: ['']
    });

    if (this.initialData) {
      const patchedData = {
        ...this.initialData,
        category: this.initialData.category ?? null
      };
      this.form.patchValue(patchedData);
    }
  }

  submit() {
    if (this.form.valid) {
      const rawValue = this.form.value;

      // Asegurar formato de fecha YYYY-MM-DD
      const formattedDate = this.formatDate(rawValue.date);

      this.save.emit({
        ...rawValue,
        date: formattedDate
      } as Expense);
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

  onCancel() {
    this.cancel.emit();
  }

  resetForm() {
    this.form.reset();
  }

}

