import { Component, Inject, OnInit } from '@angular/core';
import {provideNativeDateAdapter} from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {MatDialogModule} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatRadioModule} from '@angular/material/radio';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';

export interface ExportDialogData {
  format: 'pdf' | 'excel';
}

export interface ExportConfig {
  reportType: 'monthly' | 'yearly' | 'custom';
  format: 'pdf' | 'excel';
  month?: number;
  year: number;
  startDate?: Date;
  endDate?: Date;
}

@Component({
  selector: 'app-export-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatIconModule,
    MatRadioModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatInputModule,
    MatButtonModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './export-dialog.html',
  styleUrl: './export-dialog.css'
})
export class ExportDialog implements OnInit {
  exportForm!: FormGroup;
  currentYear = new Date().getFullYear();
  years: number[] = [];
  months = [
    { value: 1, name: 'Enero' },
    { value: 2, name: 'Febrero' },
    { value: 3, name: 'Marzo' },
    { value: 4, name: 'Abril' },
    { value: 5, name: 'Mayo' },
    { value: 6, name: 'Junio' },
    { value: 7, name: 'Julio' },
    { value: 8, name: 'Agosto' },
    { value: 9, name: 'Septiembre' },
    { value: 10, name: 'Octubre' },
    { value: 11, name: 'Noviembre' },
    { value: 12, name: 'Diciembre' }
  ];

  constructor(
    public dialogRef: MatDialogRef<ExportDialog>,
    @Inject(MAT_DIALOG_DATA) public data: ExportDialogData,
    private fb: FormBuilder
  ) {
    // Generar últimos 5 años
    for (let i = 0; i < 5; i++) {
      this.years.push(this.currentYear - i);
    }
  }

  ngOnInit(): void {
    const today = new Date();
    this.exportForm = this.fb.group({
      reportType: ['monthly', Validators.required],
      year: [today.getFullYear(), Validators.required],
      month: [today.getMonth() + 1, Validators.required],
      startDate: [null],
      endDate: [null]
    });

    // Escuchar cambios en el tipo de reporte
    this.exportForm.get('reportType')?.valueChanges.subscribe(type => {
      this.updateValidators(type);
    });
  }

  updateValidators(reportType: string): void {
    const monthControl = this.exportForm.get('month');
    const startDateControl = this.exportForm.get('startDate');
    const endDateControl = this.exportForm.get('endDate');

    // Limpiar todos los validadores primero
    monthControl?.clearValidators();
    startDateControl?.clearValidators();
    endDateControl?.clearValidators();

    // Aplicar validadores según el tipo
    if (reportType === 'monthly') {
      monthControl?.setValidators([Validators.required]);
    } else if (reportType === 'range') {
      startDateControl?.setValidators([Validators.required]);
      endDateControl?.setValidators([Validators.required]);
    }

    // Actualizar validación
    monthControl?.updateValueAndValidity();
    startDateControl?.updateValueAndValidity();
    endDateControl?.updateValueAndValidity();
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onExport(): void {
    if (this.exportForm.valid) {
      const formValue = this.exportForm.value;
      const config: ExportConfig = {
        reportType: formValue.reportType,
        format: this.data.format,
        year: formValue.year
      };

      if (formValue.reportType === 'monthly') {
        config.month = formValue.month;
      } else if (formValue.reportType === 'range') {
        config.startDate = formValue.startDate;
        config.endDate = formValue.endDate;
      }

      this.dialogRef.close(config);
    }
  }

  get isMonthly(): boolean {
    return this.exportForm.get('reportType')?.value === 'monthly';
  }

  get isYearly(): boolean {
    return this.exportForm.get('reportType')?.value === 'yearly';
  }

  get isCustom(): boolean {
    return this.exportForm.get('reportType')?.value === 'custom';
  }

  get formatName(): string {
    return this.data.format === 'pdf' ? 'PDF' : 'Excel';
  }
}
