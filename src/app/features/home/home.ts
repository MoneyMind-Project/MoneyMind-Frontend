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

Chart.register(...registerables);

interface Debt {
  id: number;
  name: string;
  amount: number;
  dueDate: Date;
  isPaid: boolean;
  daysUntilDue: number;
}

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
  private viewInitialized = false; // 👈 Añadido

  debts: Debt[] = [
    {
      id: 1,
      name: 'Tarjeta de crédito BBVA',
      amount: 450,
      dueDate: new Date(2025, 9, 20),
      isPaid: false,
      daysUntilDue: 4
    },
    {
      id: 2,
      name: 'Internet Movistar',
      amount: 89.90,
      dueDate: new Date(2025, 9, 25),
      isPaid: false,
      daysUntilDue: 9
    },
    {
      id: 3,
      name: 'Netflix Premium',
      amount: 44.90,
      dueDate: new Date(2025, 9, 18),
      isPaid: false,
      daysUntilDue: 2
    }
  ];

  constructor(
    private router: Router,
    private cryptoService: CryptoService,
    private reportService: ReportService,

  ) {}

  ngOnInit(): void {
    this.currentUser = this.cryptoService.getCurrentUser()!;

    this.reportService.getHomeDashboard().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.dashboardData = res;

          const budget = res.data.budget;
          this.currentMonth = this.getMonthName(budget.month);

          // Cargar gastos diarios desde el backend
          this.dailyExpenses = res.data.daily_expenses;

          // 👇 Si la vista ya está lista, crea el gráfico
          if (this.viewInitialized) {
            this.createDailyExpensesChart();
          }

        }
      },
      error: (err) => {
        console.error('Error cargando dashboard:', err);
      }
    });
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;

    // 👇 Si los datos ya llegaron antes que la vista, ahora sí crea el gráfico
    if (this.dailyExpenses.length > 0) {
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

  getDebtUrgencyClass(daysUntilDue: number): string {
    if (daysUntilDue <= 3) return 'urgent';
    if (daysUntilDue <= 7) return 'warning';
    return 'normal';
  }

  goToScanner(): void {
    this.router.navigate(['/scan']);
  }

  openAddDebtDialog(): void {
    console.log('Abrir diálogo de agregar deuda');
  }

  openPaymentDialog(debt: Debt): void {
    console.log('Registrar pago para:', debt.name);
  }

  formatCurrency(amount: number): string {
    return `S/ ${amount.toFixed(2)}`;
  }
}
