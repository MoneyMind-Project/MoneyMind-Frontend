import { Component, Inject } from '@angular/core';
import { Income } from '../../../shared/models/income.model';
import { HttpClient } from '@angular/common/http';
import {MatDialogRef} from '@angular/material/dialog';
import {IncomeForm} from '../income-form/income-form';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ViewChild } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-income-dialog',
    imports: [
        IncomeForm,
        CommonModule,
        MatIconModule
    ],
  templateUrl: './income-dialog.html',
  styleUrl: './income-dialog.css'
})
export class IncomeDialog {
  step = 1;
  selectedFile: File | null = null;
  parsedIncome: Partial<Income> | null = null;
  loading = false;
  mode: 'upload' | 'camera' | 'manual' = 'upload';

  @ViewChild(IncomeForm) incomeForm!: IncomeForm;

  constructor(
    private http: HttpClient,
    private dialogRef: MatDialogRef<IncomeDialog>,
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

    this.http.post<{ data: Partial<Income> }>('http://127.0.0.1:8000/api/movements/analyze-income/', formData)
      .subscribe({
        next: (res) => {
          console.log(res);
          this.parsedIncome = res.data;
          this.step = 2;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          alert('Error procesando con Gemini');
        }
      });
  }

  onSave(income: Income) {
    this.dialogRef.close(income);
  }

  close() {
    this.dialogRef.close(null);
  }

  onCancel() {
    if (this.mode === 'manual') {
      this.close(); // Cierra el diálogo
    } else {
      this.step = 1;
      this.incomeForm.resetForm(); // Limpia el formulario
    }
  }
}
