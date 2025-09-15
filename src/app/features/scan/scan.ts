import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Expense} from '../../shared/models/expense.model';
import { Category} from '../../shared/enums/category.enum';
import {DecimalPipe} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-scan',
  imports: [
    DecimalPipe,
    CommonModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule
  ],
  templateUrl: './scan.html',
  styleUrl: './scan.css'
})
export class Scan implements OnInit {

  totalAmount: number = 433.53;
  expenses: Expense[] = [];

  constructor() { }

  ngOnInit(): void {
    this.loadMockExpenses();
    this.calculateTotal();
  }

  private loadMockExpenses(): void {
    this.expenses = [
      {
        id: '1',
        category: Category.TRANSPORT,
        place: 'YAPE a 370',
        date: '2025-09-15',
        time: '14:30',
        total: -1.00,
        comment: 'Pago'
      },
      {
        id: '2',
        category: Category.ENTERTAINMENT,
        place: 'PASSLINE',
        date: '2025-09-14',
        time: '16:45',
        total: -17.25
      },
      {
        id: '3',
        category: Category.ENTERTAINMENT,
        place: 'DLC*SPOTIFY PE',
        date: '2025-09-09',
        time: '10:15',
        total: -20.90
      },
      {
        id: '4',
        category: Category.TRANSPORT,
        place: 'YAPE a 295771',
        date: '2025-09-09',
        time: '08:20',
        total: -20.00
      },
      {
        id: '5',
        category: Category.FOOD,
        place: 'YAPE de 29509',
        date: '2025-09-08',
        time: '12:30',
        total: 45.00,
        comment: 'Ingreso'
      },
      {
        id: '6',
        category: Category.TRANSPORT,
        place: 'YAPE a 194012',
        date: '2025-09-08',
        time: '09:15',
        total: -25.50
      }
    ];
  }

  private calculateTotal(): void {
    this.totalAmount = this.expenses.reduce((total, expense) => total + expense.total, 0);
  }

  getCategoryIcon(category: Category): string {
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

  getCategoryColor(category: Category): string {
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

  formatAmount(amount: number): string {
    return amount > 0 ? `S/ ${amount.toFixed(2)}` : `S/ ${amount.toFixed(2)}`;
  }

  getAmountClass(amount: number): string {
    return amount > 0 ? 'amount-positive' : 'amount-negative';
  }

  getGroupedExpenses() {
    const grouped = this.expenses.reduce((groups: any, expense) => {
      const dateKey = this.formatDate(expense.date);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(expense);
      return groups;
    }, {});

    return Object.keys(grouped).map(key => ({
      date: key,
      expenses: grouped[key]
    }));
  }
}
