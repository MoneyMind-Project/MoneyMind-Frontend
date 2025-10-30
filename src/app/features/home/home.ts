import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';
import { User } from '../../shared/models/user.model';
import { CryptoService } from '../../core/services/crypto.service';
import { ReportService } from '../../core/services/report.service';
import { HomeDashboardResponse, DailyExpense } from '../../shared/models/home-dashboard.model';
import { MatDialog } from '@angular/material/dialog';
import { RecurringPayment } from '../../shared/models/recurring-payment.model';
import { RecurrentForm } from './recurrent-form/recurrent-form';

Chart.register(...registerables);

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit, AfterViewInit {

  currentUser!: User;
  dashboardData!: HomeDashboardResponse;

  @ViewChild('dailyExpensesChart') chartCanvas!: ElementRef<HTMLCanvasElement>;
  gastoMensualChart: any;

  currentMonth = '';
  dailyExpenses: DailyExpense[] = [];
  private viewInitialized = false;
  loading = true; // ⭐ Estado de loading

  constructor(
    private router: Router,
    private cryptoService: CryptoService,
    private reportService: ReportService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.currentUser = this.cryptoService.getCurrentUser()!;
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;

    this.reportService.getHomeDashboard().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.dashboardData = res;

          const budget = res.data.budget;
          this.currentMonth = this.getMonthName(budget.month);

          // Cargar gastos diarios
          this.dailyExpenses = res.data.daily_expenses;

          // Si la vista ya está lista, crear gráfico
          if (this.viewInitialized && this.dailyExpenses.length > 0) {
            setTimeout(() => this.createDailyExpensesChart(), 100);
          }

          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error cargando dashboard:', err);
        this.loading = false;
      }
    });
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;

    // Si los datos ya llegaron, crear gráfico
    if (!this.loading && this.dailyExpenses.length > 0) {
      this.createDailyExpensesChart();
    }
  }

  createDailyExpensesChart(): void {
    if (!this.chartCanvas || !this.dailyExpenses.length) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.gastoMensualChart) {
      this.gastoMensualChart.destroy();
    }

    this.gastoMensualChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.dailyExpenses.map(e => e.day.toString()),
        datasets: [{
          label: 'Gasto diario',
          data: this.dailyExpenses.map(e => e.amount),
          backgroundColor: 'rgba(102, 126, 234, 0.8)',
          borderColor: 'rgba(102, 126, 234, 1)',
          borderWidth: 0,
          borderRadius: 6,
          barPercentage: 0.8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (context) => `Gastado: ${this.formatCurrency(context.parsed.y)}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 11 }, color: '#6b7280' }
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0, 0, 0, 0.05)' },
            ticks: {
              font: { size: 11 },
              color: '#6b7280',
              callback: (value) => 'S/ ' + value
            }
          }
        }
      }
    });
  }

  private getMonthName(monthNumber: number): string {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[monthNumber - 1] || '';
  }

  get welcomeMessage(): string {
    const greeting = this.getGreeting();
    const firstName = this.currentUser ? this.currentUser.first_name : '';
    return `${greeting} ${firstName}`;
  }

  getGreeting(): string {
    if (!this.currentUser) return 'Bienvenido';
    switch (this.currentUser.gender?.toLowerCase()) {
      case 'male': return 'Bienvenido';
      case 'female': return 'Bienvenida';
      default: return 'Bienvenid@';
    }
  }

  getDebtUrgencyClass(payment_day: number): string {
    const daysUntilDue = this.getDaysUntilPayment(payment_day);

    if (daysUntilDue === 0) return 'urgent';
    if (daysUntilDue === 1) return 'warning';
    return 'normal';
  }

  getDaysUntilPayment(payment_day: number): number {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let targetMonth = currentMonth;
    let targetYear = currentYear;

    if (payment_day < currentDay) {
      targetMonth += 1;
      if (targetMonth > 11) {
        targetMonth = 0;
        targetYear += 1;
      }
    }

    const paymentDate = new Date(targetYear, targetMonth, payment_day);
    const diffTime = paymentDate.getTime() - today.getTime();
    const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return daysUntilDue;
  }

  getPaymentDate(payment_day: number): Date {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let targetMonth = currentMonth;
    let targetYear = currentYear;

    if (payment_day < currentDay) {
      targetMonth += 1;
      if (targetMonth > 11) {
        targetMonth = 0;
        targetYear += 1;
      }
    }

    return new Date(targetYear, targetMonth, payment_day);
  }

  goToScanner(): void {
    this.router.navigate(['/scan']);
  }

  openAddDebtDialog(): void {
    const dialogRef = this.dialog.open(RecurrentForm, {});

    dialogRef.afterClosed().subscribe((newRecurrentPay: RecurringPayment | null) => {
      if (newRecurrentPay) {
        console.log('Nuevo gasto recurrente guardado:', newRecurrentPay);

        const today = new Date();
        const currentDay = today.getDate();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        let paymentDateThisMonth = new Date(currentYear, currentMonth, newRecurrentPay.payment_day);

        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        if (newRecurrentPay.payment_day > lastDayOfMonth) {
          paymentDateThisMonth = new Date(currentYear, currentMonth, lastDayOfMonth);
        }

        let paymentDateToCheck = paymentDateThisMonth;

        if (today > paymentDateThisMonth) {
          paymentDateToCheck = new Date(currentYear, currentMonth + 1, newRecurrentPay.payment_day);
        }

        const alertStartDate = new Date(paymentDateToCheck);
        alertStartDate.setDate(paymentDateToCheck.getDate() - 2);

        const alertEndDate = paymentDateToCheck;

        if (today >= alertStartDate && today <= alertEndDate) {
          this.dashboardData.data.upcoming_payments.push(newRecurrentPay);
          console.log('✅ Agregado a upcoming_payments:', newRecurrentPay);
        } else {
          console.log('⚠️ No se agregó: fuera del rango de 3 días.');
        }
      }
    });
  }

  openViewDebtsDialog(): void {
    this.router.navigate(['home/recurrent-payments']);
  }

  openPaymentDialog(recurringPayment: RecurringPayment): void {
    this.router.navigate(['/scan'], {
      state: {
        recurringPayment: recurringPayment,
        autoOpenForm: true
      }
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(amount);
  }
}
