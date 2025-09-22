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
    MatButtonModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './income-form.html',
  styleUrl: './income-form.css'
})
export class IncomeForm implements OnInit{

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
      total: [0, Validators.required],
      comment: ['']
    });

    if (this.initialData) {
      const patchedData = {
        ...this.initialData,
      };
      this.form.patchValue(patchedData);
    }
  }

  submit() {
    if (this.form.valid) {
      this.save.emit(this.form.value as Income);
    }
  }
  onCancel() {
    this.cancel.emit();
  }

  resetForm() {
    this.form.reset();
  }

}
