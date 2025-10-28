import { Component, Inject, OnInit } from '@angular/core';
import { RecurringPayment } from '../../../shared/models/recurring-payment.model';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { TitleCasePipe } from '@angular/common';
import { Category } from '../../../shared/enums/category.enum';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { AlertService } from '../../../core/services/alert.service';
import { NgToastService } from 'ng-angular-popup';
import { MatIconModule, MatIcon } from '@angular/material/icon';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-recurrent-form',
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
    MatIcon,
    MatIconModule,
    MatCheckboxModule
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'es-PE' }
  ],
  templateUrl: './recurrent-form.html',
  styleUrl: './recurrent-form.css'
})
export class RecurrentForm implements OnInit {
  categories: Category[] = Object.values(Category);
  form!: FormGroup;
  loading = false;
  isDuplicated = false;
  errorMessage: string | null = null;
  isEditMode = false;

  constructor(
    public dialogRef: MatDialogRef<RecurrentForm>,
    @Inject(MAT_DIALOG_DATA) public data: RecurringPayment | null,
    private fb: FormBuilder,
    private alertService: AlertService,
    private toast: NgToastService
  ) {
    // Si recibimos data, estamos en modo edición
    this.isEditMode = !!data;
  }

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      category: [null as Category | null, Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      recurrence_type: ['monthly', Validators.required],
      payment_day: [1, [Validators.required, Validators.min(1), Validators.max(31)]],
      start_date: [new Date(), Validators.required],
      end_date: [''],
      is_active: [true, Validators.required],
    });

    // Si estamos editando, cargar los datos
    if (this.isEditMode && this.data) {
      this.loadPaymentData(this.data);
    }
  }

  loadPaymentData(payment: RecurringPayment): void {
    this.form.patchValue({
      name: payment.name,
      category: payment.category,
      amount: payment.amount,
      recurrence_type: payment.recurrence_type,
      payment_day: payment.payment_day,
      start_date: this.parseDateString(payment.start_date),
      end_date: payment.end_date ? this.parseDateString(payment.end_date) : null,
      is_active: payment.is_active
    });
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

    const formattedStart = this.formatDate(rawValue.start_date);
    const formattedEnd = rawValue.end_date ? this.formatDate(rawValue.end_date) : null;

    const recurringPayment = {
      ...rawValue,
      start_date: formattedStart,
      end_date: formattedEnd,
    };

    if (this.isEditMode && this.data) {
      // Modo edición
      const updateData = {
        ...recurringPayment
      };

      this.loading = true;

      this.alertService.updateRecurringPayment(this.data.id, updateData).subscribe({
        next: (res) => {
          this.loading = false;
          if (res) {
            this.dialogRef.close(res); // Devuelve el pago actualizado al cerrar el modal
          } else {
            this.errorMessage = 'No se pudo actualizar el pago recurrente.';
          }
        },
        error: (err) => {
          this.loading = false;
          console.error('Error al actualizar el pago recurrente:', err);
          this.errorMessage = 'Error inesperado al actualizar el pago recurrente.';
        }
      });
    } else {
      // Modo creación
      this.alertService.createRecurringPaymentReminder(recurringPayment).subscribe({
        next: (res) => {
          this.loading = false;
          if (res.success) {
            this.dialogRef.close(res.data);
          } else {
            if (res.message === 'DUPLICATED') {
              this.isDuplicated = true;
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

  private parseDateString(dateString: string): Date | null {
    if (!dateString) return null;

    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  onCancel() {
    this.dialogRef.close();
  }

  close() {
    this.dialogRef.close();
  }

  get dialogTitle(): string {
    return this.isEditMode ? 'Editar alerta de pago' : 'Nuevo gasto recurrente';
  }
}
