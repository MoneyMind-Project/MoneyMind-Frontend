// dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatMenuModule } from '@angular/material/menu';

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
export class Dashboard implements OnInit {
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
  mediumChartCols: number = 2;

  lastChartCols: number = 1;

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
        // Mobile
        this.gridCols = 1;
        this.mainChartCols = 1;
        this.sideChartCols = 1;
        this.smallChartCols = 1;
        this.mediumChartCols = 1;
        this.lastChartCols = 1;
      } else if (result.breakpoints[Breakpoints.Small] || result.breakpoints[Breakpoints.Medium]) {
        // Tablet
        this.gridCols = 2;
        this.mainChartCols = 2;
        this.sideChartCols = 2;
        this.smallChartCols = 1;
        this.mediumChartCols = 1;
        this.lastChartCols = 2; // 👈 Ocupa ambas columnas
      } else {
        // Desktop
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
}
