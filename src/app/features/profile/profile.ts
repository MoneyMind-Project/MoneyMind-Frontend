import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { User } from '../../shared/models/user.model';
import { CryptoService } from '../../core/services/crypto.service';
import {BalanceService} from '../../core/services/balance.service';
import {ReportService} from '../../core/services/report.service';
import {ExportDialog, ExportConfig} from './export-dialog/export-dialog';
import { MatDialog } from '@angular/material/dialog';
import {MatDialogModule} from '@angular/material/dialog';

interface UserData {
  memberSince: Date;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatListModule
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  currentUser!: User;
  userData: UserData = {
    memberSince: new Date(2024, 0, 15),
  };
  monthly_income: number = 0;
  current_balance: number = 0;


  constructor(private router: Router, private cryptoService: CryptoService,
              private balanceService: BalanceService, private reportService :ReportService, private dialog: MatDialog) {}

  ngOnInit(): void {
    // Aquí cargarías los datos reales del usuario desde tu servicio
    this.loadUserData();
    this.loadUserBalance();
  }

  loadUserData(): void {
    this.currentUser = this.cryptoService.getCurrentUser()!;
    this.balanceService.getUserBalance().subscribe()
  }

  private loadUserBalance(): void {
    this.balanceService.getUserBalance().subscribe({
      next: (res) => {
        if (res) {
          this.monthly_income = res.monthly_income ?? 0;
          this.current_balance = res.current_balance ?? 0;
          console.log('✅ Datos de balance cargados:', res);
        } else {
          console.warn('No se encontraron datos de balance para este usuario');
        }
      },
      error: (err) => {
        console.error('❌ Error al obtener el balance del usuario:', err);
      }
    });
  }

  editBudget(): void {
    // Aquí abrirías el diálogo del cuestionario de presupuesto
    console.log('Abrir cuestionario de presupuesto');
    // this.router.navigate(['/onboarding/budget']);
  }

  exportPDF(): void {
    const dialogRef = this.dialog.open(ExportDialog, {
      width: '600px',
      data: { format: 'pdf' },
      disableClose: true,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe((config: ExportConfig) => {
      if (config) {
        this.downloadReport(config);
      }
    });
  }

  exportExcel(): void {
    const dialogRef = this.dialog.open(ExportDialog, {
      width: '600px',
      data: { format: 'excel' },
      disableClose: true,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe((config: ExportConfig) => {
      if (config) {
        this.downloadReport(config);
      }
    });
  }

  private downloadReport(config: ExportConfig): void {
    const userId = '13';

    console.log(`Exportando reporte en ${config.format.toUpperCase()}...`, config);

    // Preparar parámetros según el tipo de reporte
    let params: any = {
      userId: userId,
      reportType: config.reportType,
      format: config.format,
      year: config.year
    };

    if (config.reportType === 'monthly') {
      params.report_type = 'monthly';
      params.month = config.month;
    } else if (config.reportType === 'yearly') {
      params.report_type = 'yearly';  // Backend usa 'yearly'
    } else if (config.reportType === 'custom' && config.startDate && config.endDate) {
      params.report_type = 'custom';  // Backend usa 'custom'
      params.start_date = this.formatDate(config.startDate);
      params.end_date = this.formatDate(config.endDate);
    }

    this.reportService.exportReport(params).subscribe({
      next: (blob) => {
        const filename = this.generateFilename(config);
        this.reportService.downloadFile(blob, filename);
        console.log(`✅ ${config.format.toUpperCase()} descargado exitosamente`);
      },
      error: (err) => {
        console.error(`❌ Error al descargar ${config.format.toUpperCase()}:`, err);
        // Aquí podrías mostrar un snackbar o notificación de error
      }
    });
  }

  private generateFilename(config: ExportConfig): string {
    const extension = config.format === 'pdf' ? 'pdf' : 'xlsx';
    const prefix = 'reporte_financiero';

    if (config.reportType === 'monthly' && config.month) {
      return `${prefix}_${config.year}_${String(config.month).padStart(2, '0')}.${extension}`;
    } else if (config.reportType === 'yearly') {
      return `${prefix}_${config.year}.${extension}`;
    } else if (config.reportType === 'custom' && config.startDate && config.endDate) {
      const start = this.formatDateShort(config.startDate);
      const end = this.formatDateShort(config.endDate);
      return `${prefix}_${start}_${end}.${extension}`;
    }

    return `${prefix}_${Date.now()}.${extension}`;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatDateShort(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  editProfile(): void {
    console.log('Editar perfil');
    // Implementar edición de perfil
  }

  logOut(): void {
    // Mostrar confirmación
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      localStorage.removeItem('mm-current-user');
      this.router.navigate(['/auth/login']);
    }
  }

  formatCurrency(amount: number): string {
    return `S/ ${amount.toFixed(2)}`;
  }

  getMembershipDuration(): string {
    const now = new Date();
    const months = (now.getFullYear() - this.userData.memberSince.getFullYear()) * 12
      + (now.getMonth() - this.userData.memberSince.getMonth());

    if (months < 1) return 'Nuevo miembro';
    if (months === 1) return '1 mes';
    if (months < 12) return `${months} meses`;

    const years = Math.floor(months / 12);
    return years === 1 ? '1 año' : `${years} años`;
  }
}
