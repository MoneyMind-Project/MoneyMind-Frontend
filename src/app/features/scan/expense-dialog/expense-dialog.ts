import { Component, Inject } from '@angular/core';
import { Expense } from '../../../shared/models/expense.model';
import { HttpClient } from '@angular/common/http';
import {MatDialogRef} from '@angular/material/dialog';
import {ExpenseForm} from '../expense-form/expense-form';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ViewChild } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';


@Component({
  selector: 'app-expense-dialog',
  imports: [
    ExpenseForm,
    CommonModule,
    MatIconModule
  ],
  templateUrl: './expense-dialog.html',
  styleUrl: './expense-dialog.css'
})
export class ExpenseDialog {
  step = 1;
  selectedFile: File | null = null;
  parsedExpense: Partial<Expense> | null = null;
  loading = false;
  mode: 'upload' | 'camera' | 'manual' = 'upload';

  @ViewChild(ExpenseForm) expenseForm!: ExpenseForm;

  constructor(
    private http: HttpClient,
    private dialogRef: MatDialogRef<ExpenseDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'upload' | 'camera' | 'manual' }
  ) {
    if (data.mode === 'manual') this.step = 2;
    this.mode = data.mode;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.selectedFile = input.files[0];
  }

  processReceipt() {
    if (!this.selectedFile) return;
    this.loading = true;

    const formData = new FormData();
    formData.append('file', this.selectedFile, this.selectedFile.name);

    this.http.post<{ data: Partial<Expense> }>('http://127.0.0.1:8000/api/expenses/analyze/', formData)
      .subscribe({
        next: (res) => {
          console.log(res);
          this.parsedExpense = res.data;
          this.step = 2;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          alert('Error procesando con Gemini');
        }
      });
  }

  onSave(expense: Expense) {
    this.dialogRef.close(expense);
  }

  close() {
    this.dialogRef.close(null);
  }

  onCancel() {
    if (this.mode === 'manual') {
      this.close(); // Cierra el diálogo
    } else {
      this.step = 1;
      this.expenseForm.resetForm(); // Limpia el formulario
    }
  }
}

