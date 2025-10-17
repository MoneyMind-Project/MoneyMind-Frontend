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

interface UserData {
  memberSince: Date;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
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


  constructor(private router: Router, private cryptoService: CryptoService, private balanceService: BalanceService) {}

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
    console.log('Exportando reporte en PDF...');
    // Implementar lógica de exportación
  }

  exportExcel(): void {
    console.log('Exportando reporte en Excel...');
    // Implementar lógica de exportación
  }

  changePassword(): void {
    console.log('Cambiar contraseña');
    // Implementar cambio de contraseña
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
