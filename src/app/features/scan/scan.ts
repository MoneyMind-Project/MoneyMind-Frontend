import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Expense} from '../../shared/models/expense.model';
import { Income} from '../../shared/models/income.model';
import { DisplayableMovement} from '../../shared/models/displayable-movement.model';
import { Category} from '../../shared/enums/category.enum';
import {DecimalPipe} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {ExpenseDialog} from './expense-dialog/expense-dialog';
import {IncomeDialog} from './income-dialog/income-dialog';
import { RouterModule } from '@angular/router';
import { MovementDetails} from './movement-details/movement-details';
import { DashboardResponse} from '../../shared/models/response.model';
import { MovementService } from '../../core/services/movement.service';
import {CategoryUtils} from '../../shared/utils/category.utils';
import { Router } from '@angular/router';
import { RecurringPayment } from '../../shared/models/recurring-payment.model';



@Component({
  selector: 'app-scan',
  imports: [
    DecimalPipe,
    CommonModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatDialogModule,
    RouterModule,
    FormsModule,
  ],
  templateUrl: './scan.html',
  styleUrl: './scan.css'
})
export class Scan implements OnInit {

  totalAmount: number = 0;
  isTotalAmountVisible: boolean = false;
  movements: DisplayableMovement[] = [];
  groupedMovements: { date: string; movements: DisplayableMovement[] }[] = [];

  searchText: string = '';
  allMovements: DisplayableMovement[] = [];

  constructor(
    private dialog: MatDialog,
    private movementService: MovementService,
    private router: Router
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      const state = navigation.extras.state as {
        recurringPayment?: RecurringPayment;
        autoOpenForm?: boolean;
      };

      if (state.autoOpenForm && state.recurringPayment) {
        // Guardar temporalmente para usar en ngAfterViewInit
        this.pendingRecurringPayment = state.recurringPayment;
      }
    }
  }

  private pendingRecurringPayment?: RecurringPayment;

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngAfterViewInit(): void {
    // Abrir el form automáticamente si viene de un recurring payment
    if (this.pendingRecurringPayment) {
      setTimeout(() => {
        this.openExpenseDialog('manual', this.pendingRecurringPayment);
        this.pendingRecurringPayment = undefined; // Limpiar después de usar
      }, 100);
    }
  }

  loadDashboard(): void {
    this.movementService.getScanDashboard().subscribe((res) => {
      if (res.success && res.data) {
        const dashboard: DashboardResponse = res.data;

        this.totalAmount = dashboard.currentBalance;
        this.allMovements = dashboard.recentMovements.sort((a, b) => {
          const d1 = new Date(`${a.date}T${a.time}`);
          const d2 = new Date(`${b.date}T${b.time}`);
          return d2.getTime() - d1.getTime();
        });
        this.movements = [...this.allMovements];
        this.updateGroupedMovements();
      } else {
        console.error(res.message);
      }
    });
  }

  onSearchChange(searchTerm: string): void {
    this.searchText = searchTerm.toLowerCase().trim();

    if (this.searchText === '') {
      this.movements = [...this.allMovements];
    } else {
      this.movements = this.allMovements.filter(movement => {
        const searchIn = [
          movement.title?.toLowerCase() || '',
          movement.place?.toLowerCase() || '',
          movement.comment?.toLowerCase() || ''
        ].join(' ');

        return searchIn.includes(this.searchText);
      });
    }

    this.updateGroupedMovements();
  }

  clearSearch(): void {
    this.searchText = '';
    this.onSearchChange('');
  }

  private addMovementUpdateTotal(type: 'income' | 'expense', amount: number): void {
    if (type === 'income') {
      this.totalAmount += amount;
    } else {
      this.totalAmount -= amount;
    }
  }


  getCategoryIcon(category?: Category): string {
    return CategoryUtils.getCategoryIcon(category);
  }

  setTotalAmountVisibility(){
    this.isTotalAmountVisible = !this.isTotalAmountVisible;
  }

  openExpenseDialog(mode: 'upload' | 'camera' | 'manual', recurringPayment?: RecurringPayment) {
    const dialogRef = this.dialog.open(ExpenseDialog, {
      data: {
        mode,
        prefilledData: recurringPayment ? {
          place: recurringPayment.name,  // "Netflix Premium" va a "place"
          total: recurringPayment.amount,
          category: recurringPayment.category,
          date: new Date().toISOString().split('T')[0], // Fecha de hoy en formato YYYY-MM-DD
          time: new Date().toTimeString().slice(0, 5),  // Hora actual HH:MM
          recurringPaymentId: recurringPayment.id
        } : null
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((newExpense: Expense | null) => {
      if (newExpense) {
        console.log('Nuevo gasto guardado:', newExpense);
        this.addNewMovement('expense', newExpense);

        // Si viene de recurring payment, ocultar la alerta
        if (recurringPayment) {
          this.dismissRecurringPaymentAlert(recurringPayment.id);
        }
      }
    });
  }

  dismissRecurringPaymentAlert(recurringPaymentId: number): void {
    const today = new Date();
    /*this.paymentService.dismissPaymentAlert({
      recurring_payment_id: recurringPaymentId,
      target_month: today.getMonth() + 1,
      target_year: today.getFullYear()
    }).subscribe({
      next: () => {
        console.log('Alerta de pago ocultada exitosamente');
      },
      error: (err) => {
        console.error('Error al ocultar alerta:', err);
      }
    });*/
  }

  openIncomeDialog(mode: 'upload' | 'manual') {
    const dialogRef = this.dialog.open(IncomeDialog, {
      data: { mode },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((newIncome: Income | null) => {
      if (newIncome) {
        console.log('Nuevo ingreso guardado:', newIncome);
        this.addNewMovement('income', newIncome);
      }
    });
  }

  // Reutilizable para income y expense
  private addNewMovement(type: 'income' | 'expense', movement: Income | Expense) {

    let displayable: DisplayableMovement;

    if (type === 'income') {
      const income = movement as Income;
      displayable = {
        id: income.id,
        type: type,
        title: income.title,
        date: income.date,
        time: income.time,
        total: Number(income.total),
        comment: income.comment,
        created_at: income.created_at
      };
    } else {
      const expense = movement as Expense;
      displayable = {
        id: expense.id,
        type: type,
        title: expense.place,
        date: expense.date,
        time: expense.time,
        total: Number(expense.total),
        comment: expense.comment,
        category: expense.category,
        place: expense.place,
        created_at: expense.created_at
      };
    }

    // Actualizar ambas listas
    this.allMovements = [displayable, ...this.allMovements].sort((a, b) => {
      const d1 = new Date(`${a.date}T${a.time}`);
      const d2 = new Date(`${b.date}T${b.time}`);
      return d2.getTime() - d1.getTime();
    });

    // Aplicar el filtro actual si existe
    if (this.searchText === '') {
      this.movements = [...this.allMovements];
    } else {
      this.onSearchChange(this.searchText);
    }

    // Asegurar que el total sea número antes de pasarlo
    this.addMovementUpdateTotal(type, Number(movement.total));
    this.updateGroupedMovements();

  }

  getCategoryColor(category?: Category): string {
    return CategoryUtils.getCategoryColor(category);
  }

  formatDate(dateString: string): string {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // <-- Esto crea la fecha en hora local
    const today = new Date();

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    }

    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    return `${date.getDate()} ${months[date.getMonth()]}`;
  }

  formatAmount(amount: number, type: string): string {
    // Si es ingreso (income) => normal
    if (type === 'income') {
      return `S/ ${amount.toFixed(2)}`;
    }

    // Si es gasto (expense) => con signo negativo
    return `-S/ ${Math.abs(amount).toFixed(2)}`;
  }

  getAmountClass(type: string): string {
    return type === 'income' ? 'amount-positive' : 'amount-negative';
  }

  private updateGroupedMovements(): void {
    const groups: { [key: string]: DisplayableMovement[] } = {};

    for (const mov of this.movements) {
      if (!groups[mov.date]) {
        groups[mov.date] = [];
      }
      groups[mov.date].push(mov);
    }

    this.groupedMovements = Object.keys(groups).map(date => ({
      date,
      movements: groups[date]
    }));
  }

  openDetails(movement: DisplayableMovement) {
    const ref = this.dialog.open(MovementDetails, {
      width: '500px',
      maxWidth: window.innerWidth <= 768 ? '85vw' : '500px',
      data: movement
    });

    ref.componentInstance.deleted.subscribe((deletedMovement) => {
      // Actualizar el total amount ANTES de filtrar
      this.updateTotalOnDelete(deletedMovement.type, deletedMovement.total);

      // Eliminar de ambas listas para mantener consistencia
      this.allMovements = this.allMovements.filter(
        m => !(m.id === deletedMovement.id && m.type === deletedMovement.type)
      );

      this.movements = this.movements.filter(
        m => !(m.id === deletedMovement.id && m.type === deletedMovement.type)
      );

      // Actualizar la vista agrupada
      this.updateGroupedMovements();

      console.log(`Movimiento ${deletedMovement.type} eliminado. Nuevo total: ${this.totalAmount}`);
    });
  }


  private updateTotalOnDelete(type: 'income' | 'expense', amount: number): void {
    if (type === 'expense') {
      // Si elimino un gasto, sumo de vuelta al total (porque el gasto restaba)
      this.totalAmount += amount;
    } else {
      // Si elimino un ingreso, resto del total (porque el ingreso sumaba)
      this.totalAmount -= amount;
    }
  }
}
