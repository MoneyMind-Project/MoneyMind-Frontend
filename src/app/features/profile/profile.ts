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
import {EditProfileDialog} from './edit-profile-dialog/edit-profile-dialog';
import {UserService} from '../../core/services/user.service';

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
  monthly_income: number = 0;
  current_balance: number = 0;

  avatarColor: string = '#1033d3'; // color por defecto
  avatarIconColor: string = 'white';

  colorOptions: string[] = [
    '#1033d3', // azul
    '#ff5733', // naranja
    '#28a745', // verde
    '#6f42c1', // morado
    '#e83e8c'  // rosa
  ];
  showColorPicker: boolean = false;

  // Estados de carga
  loadingAvatarColor: boolean = true;
  loadingBalance: boolean = true;


  constructor(private router: Router, private cryptoService: CryptoService,
              private balanceService: BalanceService, private reportService :ReportService, private dialog: MatDialog,
              private userService: UserService) {}

  ngOnInit(): void {
    // Aquí cargarías los datos reales del usuario desde tu servicio
    this.loadUserData();
    this.loadUserBalance();
    this.loadUserPreference();
  }

  loadUserData(): void {
    this.currentUser = this.cryptoService.getCurrentUser()!;
    this.balanceService.getUserBalance().subscribe()
  }

  private loadUserPreference(): void {
    const userId = this.cryptoService.getCurrentUser()?.id;
    if (!userId) {
      this.loadingAvatarColor = false;
      return;
    }

    this.userService.getUserPreference(userId).subscribe({
      next: (pref) => {
        if (pref?.color) {
          this.avatarColor = pref.color;
          this.avatarIconColor = this.getContrastColor(pref.color);
        }
        this.loadingAvatarColor = false;
      },
      error: (err) => {
        console.warn('No se pudo cargar la preferencia de color del usuario:', err);
        this.loadingAvatarColor = false;
      }
    });
  }

  private getContrastColor(hexColor: string): string {
    return 'white';
  }

  toggleColorPicker() {
    if (!this.loadingAvatarColor) {
      this.showColorPicker = !this.showColorPicker;
    }
  }

  selectAvatarColor(color: string) {
    this.avatarColor = color;
    this.avatarIconColor = 'white';
    this.showColorPicker = false; // cierra el overlay al seleccionar

    const userId = this.currentUser?.id;
    if (userId) {
      this.userService.upsertUserPreference(userId, color).subscribe({
        next: (res) => console.log('Preferencia de color guardada', res),
        error: (err) => console.error('Error guardando preferencia de color', err)
      });
    }
  }

  private loadUserBalance(): void {
    this.balanceService.getUserBalance().subscribe({
      next: (res) => {
        if (res) {
          this.monthly_income = res.monthly_income ?? 0;
          this.current_balance = res.current_balance ?? 0;
        } else {
          console.warn('No se encontraron datos de balance para este usuario');
        }
        this.loadingBalance = false;
      },
      error: (err) => {
        console.error('❌ Error al obtener el balance del usuario:', err);
        this.loadingBalance = false;
      }
    });
  }

  editProfile(): void {
    const dialogRef = this.dialog.open(EditProfileDialog, {
      width: '600px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: {
        user: this.currentUser,
        monthlyIncome: this.monthly_income
      },
      disableClose: false,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Actualiza la data local para refrescar la vista
        this.currentUser = { ...this.currentUser, ...result.user };
        this.monthly_income = result.monthly_income;
        console.log(this.currentUser);
      }
    });
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

    console.log(`Exportando reporte en ${config.format.toUpperCase()}...`, config);

    // Preparar parámetros según el tipo de reporte
    let params: any = {
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
}
