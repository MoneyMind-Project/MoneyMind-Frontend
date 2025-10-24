import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RecurringPayment } from '../../../shared/models/recurring-payment.model';
import { Category } from '../../../shared/enums/category.enum';
import { RecurrentForm } from '../recurrent-form/recurrent-form';
import { AlertService } from '../../../core/services/alert.service';
import { NgToastService } from 'ng-angular-popup';

@Component({
  selector: 'app-recurrent-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './recurrent-list.html',
  styleUrl: './recurrent-list.css'
})
export class RecurrentList implements OnInit {
  private dialog = inject(MatDialog);
  private alertService = inject(AlertService);
  private toast = inject(NgToastService);

  recurringPayments: RecurringPayment[] = [];
  loading = false;

  ngOnInit() {
    this.loadRecurringPayments();
  }

  loadRecurringPayments(): void {
    this.loading = true;
     this.alertService.getRecurringPaymentsByUser().subscribe({
       next: (payments) => {
         this.recurringPayments = payments;
         this.loading = false;
       },
       error: (err) => {
         console.error('Error al cargar alertas:', err);
         this.loading = false;
       }
     });
  }

  openAddAlertDialog(): void {
    const dialogRef = this.dialog.open(RecurrentForm, {
      width: '600px',
      disableClose: true,
      data: null // null = modo crear
    });

    dialogRef.afterClosed().subscribe((newRecurrentPay: RecurringPayment | null) => {
      if (newRecurrentPay) {
        console.log('Nueva alerta creada:', newRecurrentPay);
        this.recurringPayments.push(newRecurrentPay);
        this.toast.success('Alerta creada exitosamente', 'Éxito', 3000);
      }
    });
  }

  openEditAlertDialog(payment: RecurringPayment): void {
    const dialogRef = this.dialog.open(RecurrentForm, {
      width: '600px',
      disableClose: true,
      data: payment // pasamos el payment para editar
    });

    dialogRef.afterClosed().subscribe((updatedPayment: RecurringPayment | null) => {
      if (updatedPayment) {
        console.log('Alerta actualizada:', updatedPayment);
        const index = this.recurringPayments.findIndex(p => p.id === updatedPayment.id);
        if (index !== -1) {
          this.recurringPayments[index] = updatedPayment;
        }
        this.toast.success('Alerta actualizada exitosamente', 'Éxito', 3000);
      }
    });
  }

  openDeleteDialog(payment: RecurringPayment): void {
    const confirmDelete = confirm(`¿Estás seguro de eliminar la alerta "${payment.name}"?`);

    if (confirmDelete) {
      this.loading = true;

      this.alertService.deleteRecurringPayment(payment.id).subscribe({
        next: () => {
          this.loading = false;
          // Eliminar del array local para actualizar la vista
          this.recurringPayments = this.recurringPayments.filter(p => p.id !== payment.id);
          this.toast.success('Alerta eliminada exitosamente', 'Éxito', 3000);
        },
        error: (err) => {
          this.loading = false;
          console.error('Error al eliminar la alerta:', err);
          this.toast.danger('Error al eliminar la alerta', 'Error', 3000);
        }
      });
    }
  }

  formatCategory(category: Category): string {
    return category.replace(/_/g, ' ');
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  }

  getNextPaymentDate(paymentDay: number): Date {
    const today = new Date();
    const currentDay = today.getDate();

    let nextPayment = new Date(today.getFullYear(), today.getMonth(), paymentDay);

    // Si el día ya pasó este mes, mover al siguiente mes
    if (currentDay >= paymentDay) {
      nextPayment = new Date(today.getFullYear(), today.getMonth() + 1, paymentDay);
    }

    return nextPayment;
  }

  getDaysUntilPayment(paymentDay: number): number {
    const today = new Date();
    const nextPayment = this.getNextPaymentDate(paymentDay);
    const diffTime = nextPayment.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getUrgencyClass(paymentDay: number): string {
    const daysUntil = this.getDaysUntilPayment(paymentDay);

    if (daysUntil <= 3) return 'urgent';
    if (daysUntil <= 7) return 'warning';
    return 'normal';
  }

  getCategoryIcon(category: Category): string {
    const iconMap: Record<Category, string> = {
      [Category.VIVIENDA]: 'home',
      [Category.SERVICIOS_BASICOS]: 'bolt',
      [Category.ALIMENTACION]: 'restaurant',
      [Category.TRANSPORTE]: 'directions_car',
      [Category.SALUD]: 'local_hospital',
      [Category.ENTRETENIMIENTO]: 'movie',
      [Category.STREAMING_SUSCRIPCIONES]: 'play_circle',
      [Category.MASCOTAS]: 'pets',
      [Category.CUIDADO_PERSONAL]: 'spa',
      [Category.DEUDAS_PRESTAMOS]: 'account_balance',
      [Category.AHORRO_INVERSION]: 'savings',
      [Category.SEGUROS]: 'security',
      [Category.EDUCACION_DESARROLLO]: 'school',
      [Category.REGALOS_CELEBRACIONES]: 'card_giftcard',
      [Category.VIAJES_VACACIONES]: 'flight',
      [Category.IMPREVISTOS]: 'warning'
    };

    return iconMap[category] || 'notifications';
  }
}
