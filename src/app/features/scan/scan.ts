import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Expense} from '../../shared/models/expense.model';
import { Income} from '../../shared/models/income.model';
import { DisplayableMovement} from '../../shared/models/displayable-movement.model';
import { Category} from '../../shared/enums/category.enum';
import {DecimalPipe} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import {ChangeDetectionStrategy, inject, model, signal} from '@angular/core';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {ExpenseDialog} from './expense-dialog/expense-dialog';
import {IncomeDialog} from './income-dialog/income-dialog';

@Component({
  selector: 'app-scan',
  imports: [
    DecimalPipe,
    CommonModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatDialogModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './scan.html',
  styleUrl: './scan.css'
})
export class Scan implements OnInit {

  totalAmount: number = 433.53;
  movements: DisplayableMovement[] = [];

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
    this.movements = this.getMovements();
    this.calculateTotal();
  }

  getMovements(): DisplayableMovement[] {
    const expenses = this.getExpenses().map(e => ({
      id: e.id,
      type: 'expense' as const,
      title: e.place,
      date: e.date,
      time: e.time,
      total: e.total,
      comment: e.comment,
      category: e.category,
      place: e.place
    }));

    const incomes = this.getIncomes().map(i => ({
      id: i.id,
      type: 'income' as const,
      title: i.title,
      date: i.date,
      time: i.time,
      total: i.total,
      comment: i.comment,
    }));

    // Unir ambos y ordenar por fecha/hora descendente
    return [...expenses, ...incomes].sort((a, b) => {
      const d1 = new Date(`${a.date}T${a.time}`);
      const d2 = new Date(`${b.date}T${b.time}`);
      return d2.getTime() - d1.getTime();
    });
  }


  getExpenses(): Expense[] {
    return [
      {
        id: '1',
        category: Category.TRANSPORT,
        place: 'YAPE a 370',
        date: '2025-09-15',
        time: '14:30',
        total: 1.00,
        comment: 'Pago'
      },
      {
        id: '2',
        category: Category.ENTERTAINMENT,
        place: 'PASSLINE',
        date: '2025-09-14',
        time: '16:45',
        total: 17.25
      }
    ];
  }

  getIncomes(): Income[] {
    return [
      {
        id: '10',
        title: 'Sueldo',
        date: '2025-09-14',
        time: '09:00',
        total: 1200.00,
        comment: 'Pago mensual'
      },
      {
        id: '11',
        title: 'Venta laptop',
        date: '2025-09-13',
        time: '16:00',
        total: 2000.00
      }
    ];
  }


  private calculateTotal(): void {
    //this.totalAmount = this.totalAmount
  }

  getCategoryIcon(category?: Category): string {
    if (!category) {
      return 'attach_money'; // ícono para incomes
    }

    switch (category) {
      case Category.FOOD:
        return 'restaurant';
      case Category.TRANSPORT:
        return 'directions_car';
      case Category.ENTERTAINMENT:
        return 'movie';
      case Category.HEALTH:
        return 'local_hospital';
      default:
        return 'account_balance_wallet';
    }
  }

  openExpenseDialog(mode: 'upload' | 'camera' | 'manual') {
    const dialogRef = this.dialog.open(ExpenseDialog, {
      data: { mode }
    });

    dialogRef.afterClosed().subscribe((newExpense: Expense | null) => {
      if (newExpense) {
        console.log('Nuevo gasto guardado:', newExpense);
        // aquí puedes guardarlo en un servicio o enviarlo al backend
        //this.expenses.push(newExpense);
      }
    });
  }

  openIncomeDialog(mode: 'upload' | 'camera' | 'manual') {
    const dialogRef = this.dialog.open(IncomeDialog, {
      data: { mode }
    });

    dialogRef.afterClosed().subscribe((newIncome: Income | null) => {
      if (newIncome) {
        console.log('Nuevo ingreso guardado:', newIncome);
        // aquí puedes guardarlo en un servicio o enviarlo al backend
        //this.incomes.push(newIncome);
      }
    });
  }

  getCategoryColor(category?: Category): string {
    if (!category) {
      // Si no hay categoría (es un income), devolvemos un color por defecto
      return '#4caf50'; // verde para ingresos
    }

    switch (category) {
      case Category.FOOD:
        return '#FF6B35';
      case Category.TRANSPORT:
        return '#4ECDC4';
      case Category.ENTERTAINMENT:
        return '#45B7D1';
      case Category.HEALTH:
        return '#FFEAA7';
      default:
        return '#DDA0DD';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
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

  getGroupedMovements() {
    const movements = this.getMovements(); // ya unificados
    const grouped: { date: string; movements: DisplayableMovement[] }[] = [];

    movements.forEach(movement => {
      let group = grouped.find(g => g.date === movement.date);
      if (!group) {
        group = { date: movement.date, movements: [] };
        grouped.push(group);
      }
      group.movements.push(movement);
    });

    // Ordenar descendente por fecha
    return grouped.sort((a, b) => (a.date < b.date ? 1 : -1));
  }
}
