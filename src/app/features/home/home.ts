import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';

Chart.register(...registerables);

interface Debt {
  id: number;
  name: string;
  amount: number;
  dueDate: Date;
  isPaid: boolean;
  daysUntilDue: number;
}

interface DailyExpense {
  day: number;
  amount: number;
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
export class Home implements OnInit {
  // Usuario
  userName = 'Diego';
  userGender: 'male' | 'female' = 'male';

  // Tip de la semana
  weeklyTip = {
    title: 'Consejo de ahorro',
    message: 'Has gastado 45% más en "Entretenimiento" este mes. Considera reducir salidas y usar alternativas gratuitas como parques.',
    icon: '💡'
  };

  // KPIs del mes actual
  currentMonth = 'Octubre';
  totalBudget = 1200;
  spent = 856;
  remaining = 344;
  spentPercentage = 71;

  @ViewChild('dailyExpensesChart') chartCanvas!: ElementRef<HTMLCanvasElement>;
  gastoMensualChart: any;

  // Gráfico de gastos diarios (datos simulados)
  dailyExpenses: DailyExpense[] = [
    { day: 1, amount: 25 },
    { day: 2, amount: 45 },
    { day: 3, amount: 30 },
    { day: 4, amount: 15 },
    { day: 5, amount: 60 },
    { day: 6, amount: 80 },
    { day: 7, amount: 35 },
    { day: 8, amount: 25 },
    { day: 9, amount: 40 },
    { day: 10, amount: 55 },
    { day: 11, amount: 45 },
    { day: 12, amount: 30 },
    { day: 13, amount: 70 },
    { day: 14, amount: 35 },
    { day: 15, amount: 50 },
    { day: 16, amount: 45 }
  ];

  maxDailyExpense = 80;

  // Recordatorios de pagos/deudas
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

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Aquí cargarías los datos reales de tu API
  }

  ngAfterViewInit(): void {
    this.createDailyExpensesChart();
  }

  createDailyExpensesChart(): void {
    const ctx = this.chartCanvas.nativeElement.getContext('2d');

    this.gastoMensualChart = new Chart(ctx!, {
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
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                return `Gastado: ${this.formatCurrency(context.parsed.y)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 11
              },
              color: '#6b7280'
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              font: {
                size: 11
              },
              color: '#6b7280',
              callback: (value) => {
                return 'S/ ' + value;
              }
            }
          }
        }
      }
    });
  }

  get welcomeMessage(): string {
    const greeting = this.getGreeting();
    return this.userGender === 'male'
      ? `${greeting} ${this.userName}`
      : `${greeting} ${this.userName}`;
  }

  getGreeting(): string {
    return 'Bienvenido';
  }

  getBarHeight(amount: number): number {
    return (amount / this.maxDailyExpense) * 100;
  }

  getDebtUrgencyClass(daysUntilDue: number): string {
    if (daysUntilDue <= 3) return 'urgent';
    if (daysUntilDue <= 7) return 'warning';
    return 'normal';
  }

  goToScanner(): void {
    this.router.navigate(['/escanear']);
  }

  openAddDebtDialog(): void {
    // Aquí abrirías el diálogo para agregar deuda
    console.log('Abrir diálogo de agregar deuda');
  }

  openPaymentDialog(debt: Debt): void {
    // Aquí abrirías el diálogo para registrar el pago
    console.log('Registrar pago para:', debt.name);
  }

  formatCurrency(amount: number): string {
    return `S/ ${amount.toFixed(2)}`;
  }
}
