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
    MatMenuModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, AfterViewInit {
  userName: string = 'Diego';
  unreadNotifications: number = 2;

  // KPIs
  totalGastadoMes: number = 780;
  categoriaMasAlta: string = 'COLEGIO';
  presupuestoRestante: number = 130;
  proyeccionProximoMes: number = 1380;

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

  constructor(private breakpointObserver: BreakpointObserver) {}

  ngOnInit(): void {
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

  viewNotifications(): void {
    console.log('Ver notificaciones');
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.createCategoriasChart();
      this.createProporcionChart();
      this.createPrediccionChart();
      this.createEsencialesChart();
    }, 0);
  }

  createCategoriasChart(): void {
    const ctx = document.getElementById('categoriasChart') as HTMLCanvasElement;

    // Obtener todas las categorías del enum
    const allCategories = Object.values(Category);

    // Datos de ejemplo por categoría (en soles)
    const categoriesData = allCategories.map(category => ({
      label: CATEGORY_LABELS[category],
      value: this.generateRandomExpense(category)
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
      value: this.generateRandomParentExpense(parent)
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
  private generateRandomExpense(category: Category): number {
    // Generar valores realistas según el tipo de categoría
    const ranges = {
      [Category.VIVIENDA]: [500, 1200],
      [Category.SERVICIOS_BASICOS]: [200, 400],
      [Category.ALIMENTACION]: [300, 600],
      [Category.TRANSPORTE]: [150, 400],
      [Category.SALUD]: [100, 500],
      [Category.ENTRETENIMIENTO]: [50, 200],
      [Category.STREAMING_SUSCRIPCIONES]: [30, 100],
      [Category.MASCOTAS]: [50, 200],
      [Category.CUIDADO_PERSONAL]: [50, 150],
      [Category.DEUDAS_PRESTAMOS]: [200, 800],
      [Category.AHORRO_INVERSION]: [0, 500],
      [Category.SEGUROS]: [100, 300],
      [Category.EDUCACION_DESARROLLO]: [200, 800],
      [Category.REGALOS_CELEBRACIONES]: [0, 300],
      [Category.VIAJES_VACACIONES]: [0, 1000],
      [Category.IMPREVISTOS]: [0, 400]
    };

    const [min, max] = ranges[category];
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private generateRandomParentExpense(parent: CategoryParent): number {
    const ranges = {
      [CategoryParent.GASTOS_ESENCIALES]: [1500, 2500],
      [CategoryParent.GASTOS_PERSONALES]: [300, 600],
      [CategoryParent.FINANCIEROS]: [400, 1200],
      [CategoryParent.EDUCACION]: [200, 800],
      [CategoryParent.OTROS]: [100, 500]
    };

    const [min, max] = ranges[parent];
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
            data: [1850, 2100, 1900, 2250, 2050, 1880, 2400, 2150, 2300],
            backgroundColor: '#FF6B35',
            borderRadius: 4
          },
          {
            label: 'Gastos No Esenciales',
            data: [950, 1100, 1000, 1150, 1050, 970, 1200, 1150, 1150],
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
}
