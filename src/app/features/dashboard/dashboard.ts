// dashboard.component.ts
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Chart, registerables } from 'chart.js';
import { Category, CategoryParent, CATEGORY_LABELS, CATEGORY_PARENT_LABELS } from '../../shared/enums/category.enum';
import { AlertService} from '../../core/services/alert.service';
import {ReportService} from '../../core/services/report.service';
import {NotificationsPanel} from './notifications-panel/notifications-panel';
import {MatDialogModule, MatDialog} from '@angular/material/dialog';
import { Router } from '@angular/router';
import {CryptoService} from '../../core/services/crypto.service';
import { User } from '../../shared/models/user.model';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

// Registrar todos los componentes de Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatGridListModule,
    MatCardModule,
    MatIconModule,
    MatBadgeModule,
    MatButtonModule,
    MatMenuModule,
    MatDialogModule,
    NotificationsPanel,
    MatProgressSpinnerModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, AfterViewInit {
  currentUser!: User;
  unreadNotifications: number = 0;
  showNotificationPanel = false;

  private chartDataList: any[] = [];

  // 🔹 Estados de carga
  isLoadingKpis: boolean = true;
  isLoadingCharts: boolean = true;
  isLoadingComments: boolean = false;

  // KPIs
  totalGastadoMes: number = 0;
  categoriaMasAlta: string = '';
  presupuestoRestante: number = 0;
  proyeccionProximoMes: number = 0;

  // Responsive grid columns
  gridCols: number = 3;
  mainChartCols: number = 2;
  sideChartCols: number = 1;
  smallChartCols: number = 1;
  mediumChartCols: number = 1;
  lastChartCols: number = 1;

  // Charts
  categoriasChart: any;
  proporcionChart: any;
  prediccionChart: any;
  esencialesChart: any;

  // Comentarios explicativos (generados por IA)
  monthlyPredictionsComment: string = '';
  expensesByCategoryComment: string = '';
  expensesByParentCategoryComment: string = '';
  savingsEvolutionComment: string = '';
  essentialVsNonEssentialComment: string = '';

  showBackCategorias = false;
  showBackAhorro = false;
  showBackProyeccion = false;
  showBackEsenciales = false;
  showBackPadres = false;

  constructor(private breakpointObserver: BreakpointObserver, private reportService: ReportService,
              private dialog: MatDialog, private router: Router, private  alertService: AlertService,
              private cryptoService: CryptoService) {}

  ngOnInit(): void {
    const user = this.cryptoService.getCurrentUser();
    if (user) {
      this.currentUser = user;
    } else {
      console.warn('No se encontró el usuario en localStorage');
      this.router.navigate(['/login']);
    }
    this.breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
      Breakpoints.Medium,
      Breakpoints.Large,
      Breakpoints.XLarge
    ]).subscribe(result => {
      if (result.breakpoints[Breakpoints.XSmall]) {
        this.gridCols = 1;
        this.mainChartCols = 1;
        this.sideChartCols = 1;
        this.smallChartCols = 1;
        this.mediumChartCols = 1;
        this.lastChartCols = 1;
      } else if (result.breakpoints[Breakpoints.Small] || result.breakpoints[Breakpoints.Medium]) {
        this.gridCols = 2;
        this.mainChartCols = 2;
        this.sideChartCols = 2;
        this.smallChartCols = 1;
        this.mediumChartCols = 1;
        this.lastChartCols = 2;
      } else {
        this.gridCols = 3;
        this.mainChartCols = 2;
        this.sideChartCols = 1;
        this.smallChartCols = 1;
        this.mediumChartCols = 1;
        this.lastChartCols = 1;
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.loadUnifiedDashboardData();
      this.loadDashboardOverview();
      this.loadUserAlerts();
    }, 0);
  }

  toggleFlip(chart: string): void {
    if (this.chartDataList && this.chartDataList.length > 0) {
      const commentsExist =
        this.monthlyPredictionsComment ||
        this.expensesByCategoryComment ||
        this.expensesByParentCategoryComment ||
        this.savingsEvolutionComment ||
        this.essentialVsNonEssentialComment;

      if (!commentsExist) {
        console.log("🧠 No hay comentarios previos, generando con IA...");
        this.generateAIComments();
      } else {
        console.log("✅ Comentarios de IA ya existen, no se genera nuevamente.");
      }
    } else {
      console.warn("⚠️ No hay datos de los gráficos aún. Espera a que el dashboard cargue.");
    }

    switch (chart) {
      case 'categorias': this.showBackCategorias = !this.showBackCategorias; break;
      case 'ahorro': this.showBackAhorro = !this.showBackAhorro; break;
      case 'proyeccion': this.showBackProyeccion = !this.showBackProyeccion; break;
      case 'esenciales': this.showBackEsenciales = !this.showBackEsenciales; break;
      case 'padres': this.showBackPadres = !this.showBackPadres; break;
    }
  }

  loadDashboardOverview(): void {
    this.isLoadingKpis = true;
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    this.reportService.getDashboardOverview(month, year).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.totalGastadoMes = response.data.total_gastado_mes || 0;
          this.categoriaMasAlta = response.data.categoria_mas_alta.label || 'N/A';
          this.presupuestoRestante = response.data.presupuesto_restante || 0;
          this.proyeccionProximoMes = response.data.proyeccion_proximo_mes || 0;
        }
        this.isLoadingKpis = false;
      },
      error: (error) => {
        console.error('Error al cargar KPIs:', error);
        this.isLoadingKpis = false;
      }
    });
  }

  loadUnifiedDashboardData(): void {
    this.isLoadingCharts = true;
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    this.reportService.getUnifiedAnalysis(month, year).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const data = response.data;

          this.chartDataList = [
            data.monthly_predictions,
            data.expenses_by_category,
            data.expenses_by_parent_category,
            data.savings_evolution,
            data.essential_vs_non_essential
          ];

          // Primero cambiamos el estado de carga
          this.isLoadingCharts = false;

          // Esperamos a que Angular actualice el DOM antes de crear los gráficos
          setTimeout(() => {
            this.createCategoriasChartWithData(data.expenses_by_category);
            this.createProporcionChartWithData(data.expenses_by_parent_category);
            this.createPrediccionChartWithData(data.monthly_predictions);
            this.createAhorroChartWithData(data.savings_evolution);
            this.createEsencialesChartWithData(data.essential_vs_non_essential);
          }, 100);
        } else {
          console.error('Respuesta no válida del backend:', response);
          this.isLoadingCharts = false;
          setTimeout(() => this.loadFallbackCharts(), 100);
        }
      },
      error: (error) => {
        console.error('Error al obtener datos unificados:', error);
        this.isLoadingCharts = false;
        setTimeout(() => this.loadFallbackCharts(), 100);
      }
    });
  }

  generateAIComments(): void {
    if (!this.chartDataList || this.chartDataList.length !== 5) {
      console.warn("⚠️ Datos de gráficos incompletos, no se puede generar comentarios IA.");
      return;
    }

    console.log("🧠 Generando comentarios de IA...");
    this.isLoadingComments = true;

    this.reportService.getChartComments(this.chartDataList).subscribe({
      next: (response) => {
        if (response.success && response.comments) {
          const [
            monthlyComment,
            categoryComment,
            parentComment,
            savingsComment,
            essentialsComment
          ] = response.comments;

          this.monthlyPredictionsComment = monthlyComment;
          this.expensesByCategoryComment = categoryComment;
          this.expensesByParentCategoryComment = parentComment;
          this.savingsEvolutionComment = savingsComment;
          this.essentialVsNonEssentialComment = essentialsComment;

          console.log("✅ Comentarios de IA generados correctamente.");
        } else {
          console.warn("⚠️ No se pudieron generar comentarios de IA o respuesta vacía.");
        }

        this.isLoadingComments = false;
      },
      error: (err) => {
        console.error("🔥 Error generando comentarios IA:", err);
        this.isLoadingComments = false;
      }
    });
  }

  private loadFallbackCharts(): void {
    this.createCategoriasChart();
    this.createProporcionChart();
    this.createPrediccionChart();
    this.createAhorroChartWithData([]);
    this.createEsencialesChart();
  }

  createEsencialesChartWithData(data: Array<{month: number, esencial: number, no_esencial: number}>): void {
    const ctx = document.getElementById('esencialesChart') as HTMLCanvasElement;

    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    this.esencialesChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(item => monthNames[item.month - 1]),
        datasets: [
          {
            label: 'Gastos Esenciales',
            data: data.map(item => item.esencial),
            backgroundColor: '#FF6B35',
            borderRadius: 4
          },
          {
            label: 'Gastos No Esenciales',
            data: data.map(item => item.no_esencial),
            backgroundColor: '#4ECDC4',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: (context) => `${context.dataset.label}: S/ ${context.parsed.y.toFixed(2)}`
            }
          }
        },
        scales: {
          x: {
            stacked: false
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `S/ ${value}`
            }
          }
        }
      }
    });
  }

  createCategoriasChartWithData(data: Array<{category: string, total: number}>): void {
    const ctx = document.getElementById('categoriasChart') as HTMLCanvasElement;

    // Mapear los datos del backend a labels y valores
    const categoriesData = data.map(item => ({
      label: CATEGORY_LABELS[item.category as Category],
      value: item.total
    }));

    this.categoriasChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: categoriesData.map(c => c.label),
        datasets: [{
          label: 'Gasto en S/',
          data: categoriesData.map(c => c.value),
          backgroundColor: '#00d4aa',
          borderRadius: 4
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
            callbacks: {
              label: (context) => `S/ ${context.parsed.y.toFixed(2)}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `S/ ${value}`
            }
          }
        }
      }
    });
  }

  createAhorroChartWithData(
    data: Array<{ month: number; date: string; balance: number; saving: number }>
  ): void {
    const ctx = document.getElementById('ahorroCanvas') as HTMLCanvasElement;
    if (!ctx) return;

    if (Chart.getChart(ctx)) {
      Chart.getChart(ctx)?.destroy();
    }

    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: monthNames,
        datasets: [
          {
            label: 'Balance mensual (S/)',
            data: data.map(d => d.balance), // 👈 ahora usamos balance
            backgroundColor: '#4caf50',
            borderRadius: 8,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.raw as number;
                return `S/ ${value.toFixed(2)}`;
              }
            }
          }
        }
      }
    });
  }

  createPrediccionChartWithData(data: Array<{month: number, real: number | null, prediction: number | null}>): void {
    const ctx = document.getElementById('prediccionChart') as HTMLCanvasElement;

    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    this.prediccionChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: monthNames,
        datasets: [
          {
            label: 'Gasto Real',
            data: data.map(item => item.real),
            borderColor: '#1976d2',
            backgroundColor: 'transparent',
            tension: 0.4,
            pointRadius: 5,
            pointBackgroundColor: '#1976d2',
            pointBorderWidth: 2
          },
          {
            label: 'Predicción',
            data: data.map(item => item.prediction),
            borderColor: '#ff9800',
            backgroundColor: 'transparent',
            borderDash: [8, 4],
            tension: 0.4,
            pointRadius: 5,
            pointBackgroundColor: '#ff9800',
            pointBorderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.parsed.y;
                return value !== null ? `${context.dataset.label}: S/ ${value.toFixed(2)}` : '';
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `S/ ${value}`
            }
          }
        }
      }
    });
  }

  createProporcionChartWithData(data: Array<{parent_category: string, total: number}>): void {
    const ctx = document.getElementById('proporcionChart') as HTMLCanvasElement;

    // Colores por categoría padre
    const colors: Record<string, string> = {
      'gastos_esenciales': '#FF6B35',
      'gastos_personales': '#4ECDC4',
      'financieros': '#45B7D1',
      'educacion': '#FFEAA7',
      'otros': '#DDA0DD'
    };

    // Mapear categorías padre a sus labels
    const parentLabelsMap: Record<string, string> = {
      'gastos_esenciales': 'Gastos Esenciales',
      'gastos_personales': 'Gastos Personales',
      'financieros': 'Financieros',
      'educacion': 'Educación',
      'otros': 'Otros'
    };

    const chartData = data.map(item => ({
      label: parentLabelsMap[item.parent_category] || item.parent_category,
      value: item.total,
      color: colors[item.parent_category] || '#999999'
    }));

    this.proporcionChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: chartData.map(c => c.label),
        datasets: [{
          data: chartData.map(c => c.value),
          backgroundColor: chartData.map(c => c.color),
          borderRadius: 4
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
            callbacks: {
              label: (context) => `S/ ${context.parsed.y.toFixed(2)}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `S/ ${value}`
            }
          }
        }
      }
    });
  }

  createCategoriasChart(): void {
    const ctx = document.getElementById('categoriasChart') as HTMLCanvasElement;

    // Obtener todas las categorías del enum
    const allCategories = Object.values(Category);

    // Datos de ejemplo por categoría (en soles)
    const categoriesData = allCategories.map(category => ({
      label: CATEGORY_LABELS[category],
      value: this.generateNullExpense()
    }));

    this.categoriasChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: categoriesData.map(c => c.label),
        datasets: [{
          label: 'Gasto en S/',
          data: categoriesData.map(c => c.value),
          backgroundColor: '#00d4aa',
          borderRadius: 4
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
            callbacks: {
              label: (context) => `S/ ${context.parsed.y}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `S/ ${value}`
            }
          }
        }
      }
    });
  }

  createProporcionChart(): void {
    const ctx = document.getElementById('proporcionChart') as HTMLCanvasElement;

    // Obtener todas las categorías padre
    const allParentCategories = Object.values(CategoryParent);

    const parentCategoriesData = allParentCategories.map(parent => ({
      label: CATEGORY_PARENT_LABELS[parent],
      value: this.generateRandomParentExpense()
    }));

    // Colores por categoría padre
    const colors = {
      [CategoryParent.GASTOS_ESENCIALES]: '#FF6B35',
      [CategoryParent.GASTOS_PERSONALES]: '#4ECDC4',
      [CategoryParent.FINANCIEROS]: '#45B7D1',
      [CategoryParent.EDUCACION]: '#FFEAA7',
      [CategoryParent.OTROS]: '#DDA0DD'
    };

    this.proporcionChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: parentCategoriesData.map(c => c.label),
        datasets: [{
          data: parentCategoriesData.map(c => c.value),
          backgroundColor: allParentCategories.map(parent => colors[parent]),
          borderRadius: 4
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
            callbacks: {
              label: (context) => `S/ ${context.parsed.y}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `S/ ${value}`
            }
          }
        }
      }
    });
  }

  // Métodos auxiliares para generar datos de prueba realistas
  private generateNullExpense(): number {
    return 0;
  }

  private generateRandomParentExpense(): number {
    return 0;
  }

  createPrediccionChart(): void {
    const ctx = document.getElementById('prediccionChart') as HTMLCanvasElement;

    // Gasto total por mes (histórico + predicción)
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const gastosReales = [2800, 3200, 2900, 3400, 3100, 2850, 3600, 3300, 3450, null, null, null];
    const predicciones = [null, null, null, null, null, null, null, null, 3450, 3500, 3650, 3700];

    this.prediccionChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: meses,
        datasets: [
          {
            label: 'Gasto Real',
            data: gastosReales,
            borderColor: '#1976d2',
            backgroundColor: 'transparent',
            tension: 0.4,
            pointRadius: 5,
            pointBackgroundColor: '#1976d2',
            pointBorderWidth: 2
          },
          {
            label: 'Predicción',
            data: predicciones,
            borderColor: '#ff9800',
            backgroundColor: 'transparent',
            borderDash: [8, 4],
            tension: 0.4,
            pointRadius: 5,
            pointBackgroundColor: '#ff9800',
            pointBorderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: (context) => `${context.dataset.label}: S/ ${context.parsed.y}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 4000,
            ticks: {
              callback: (value) => `S/ ${value}`
            }
          }
        }
      }
    });
  }

  createEsencialesChart(): void {
    const ctx = document.getElementById('esencialesChart') as HTMLCanvasElement;

    // Gasto por mes dividido en esenciales vs no esenciales
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep'];

    this.esencialesChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: meses,
        datasets: [
          {
            label: 'Gastos Esenciales',
            data: new Array(meses.length).fill(0),
            backgroundColor: '#FF6B35',
            borderRadius: 4
          },
          {
            label: 'Gastos No Esenciales',
            data: new Array(meses.length).fill(0),
            backgroundColor: '#4ECDC4',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: (context) => `${context.dataset.label}: S/ ${context.parsed.y}`
            }
          }
        },
        scales: {
          x: {
            stacked: false
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `S/ ${value}`
            }
          }
        }
      }
    });
  }

  loadUserAlerts(): void {

    this.reportService.getUserAlerts(false).subscribe({
      next: (response) => {
        if (response.success) {
          this.unreadNotifications = response.unread_count;
        }
      }
    });
  }

  get isPresupuestoCritico(): boolean {
    const presupuestoTotal = this.presupuestoRestante + this.totalGastadoMes;
    const limite = (2 / 3) * presupuestoTotal;
    return this.totalGastadoMes >= limite;
  }

  markAllAsRead(): void {
    this.alertService.markAllRiskAlertsAsSeen().subscribe({
      next: (res) => {
        if (res.success) {
          this.unreadNotifications=0;
          console.log(`✅ ${res.updated_count} alertas de tipo 'risk' marcadas como vistas.`);
        } else {
          console.warn('⚠️ No se pudieron marcar las alertas como vistas.');
        }
      },
      error: (err) => {
        console.error('❌ Error al marcar todas las alertas risk como vistas:', err);
      }
    });
  }

  viewNotifications(): void {
    this.showNotificationPanel = !this.showNotificationPanel;
  }

  closeNotificationPanel(): void {
    this.showNotificationPanel = false;
  }

  viewAllNotifications(): void {
    this.dialog.closeAll(); // Cierra el panel si está abierto
    this.router.navigate(['/dashboard/notifications']);
  }
}
