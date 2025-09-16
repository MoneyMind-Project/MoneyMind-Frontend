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
      this.save.emit(this.form.value as Expense);
    }
  }

  onCancel(){
    this.form.reset();
  }
}

