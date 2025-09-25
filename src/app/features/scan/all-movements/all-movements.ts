import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { DisplayableMovement} from '../../../shared/models/displayable-movement.model';
import { Category} from '../../../shared/enums/category.enum';
import { FormsModule } from '@angular/forms';
import {MovementDetails} from '../movement-details/movement-details';
import {MatDialog} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-all-movements',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, MatIconModule],
  templateUrl: './all-movements.html',
  styleUrl: './all-movements.css'
})
export class AllMovements implements OnInit {
  movements: DisplayableMovement[] = [];
  filteredMovements: DisplayableMovement[] = [];
  groupedFilteredMovements: { date: string; movements: DisplayableMovement[] }[] = [];

  searchTerm = '';
  activeDateFilter: string = 'all';

  // TODO: implementar lazy loading con backend
  hasMore = true;

  dateOptions = [
    { label: 'Hoy', value: 'today' },
    { label: '7 días', value: '7' },
    { label: '15 días', value: '15' },
    { label: '30 días', value: '30' },
    { label: '90 días', value: '90' },
    { label: 'Todos', value: 'all' },
  ];

  constructor(private dialog: MatDialog) {
  }

  ngOnInit(): void {
    // Mock de movimientos locales
    this.movements = [
      {
        id: '1',
        title : 'Compra semanal',
        type: 'expense',
        place: 'Supermercado',
        date: '2025-09-22',
        time: '10:30',
        total: 120.5,
        category: Category.GASTOS_ESENCIALES,
      },
      {
        id: '2',
        type: 'income',
        title: 'Sueldo',
        date: '2025-09-20',
        time: '09:00',
        total: 2500,
        category: Category.OTROS,
      },
      {
        id: '3',
        title : 'Llenado de tanque',
        type: 'expense',
        place: 'Gasolinera',
        date: '2025-09-19',
        time: '18:45',
        total: 180,
        category: Category.GASTOS_PERSONALES,
      },
      {
        id: '4',
        title : 'Cena con amigos',
        type: 'expense',
        place: 'Restaurante',
        date: '2025-09-18',
        time: '20:15',
        total: 75,
        category: Category.GASTOS_ESENCIALES,
      },
      {
        id: '5',
        type: 'income',
        title: 'Freelance',
        date: '2025-09-17',
        time: '14:00',
        total: 800,
        category: Category.OTROS,
      },
      {
        id: '6',
        title : 'Medicinas',
        type: 'expense',
        place: 'Farmacia',
        date: '2025-09-15',
        time: '11:20',
        total: 45,
        category: Category.GASTOS_ESENCIALES,
      },
      {
        id: '7',
        title : 'Película',
        type: 'expense',
        place: 'Cine',
        date: '2025-09-14',
        time: '22:00',
        total: 30,
        category: Category.GASTOS_PERSONALES,
      },
      {
        id: '8',
        type: 'income',
        title: 'Regalo',
        date: '2025-09-10',
        time: '16:30',
        total: 200,
        category: Category.OTROS,
      },
      {
        id: '9',
        title: 'Ropa nueva',
        type: 'expense',
        place: 'Tienda de ropa',
        date: '2025-09-08',
        time: '12:00',
        total: 150,
        category: Category.GASTOS_PERSONALES,
      },
      {
        id: '10',
        title: 'Viaje en taxi',
        type: 'expense',
        place: 'Uber',
        date: '2025-09-05',
        time: '08:30',
        total: 20,
        category: Category.GASTOS_PERSONALES,
      },
    ];

    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.movements];

    // Filtro por búsqueda
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.title?.toLowerCase().includes(term) ||
          m.place?.toLowerCase().includes(term)
      );
    }

    // Filtro por rango de fecha
    if (this.activeDateFilter !== 'all') {
      const days = this.activeDateFilter === 'today' ? 1 : parseInt(this.activeDateFilter, 10);
      const now = new Date();
      filtered = filtered.filter((m) => {
        const diff = (now.getTime() - new Date(m.date).getTime()) / (1000 * 3600 * 24);
        return diff < days;
      });
    }

    this.filteredMovements = filtered;

    // Agrupar por fecha
    this.groupedFilteredMovements = this.groupByDate(this.filteredMovements);
  }

  setDateFilter(value: string) {
    this.activeDateFilter = value;
    this.applyFilters();
  }

  groupByDate(movements: DisplayableMovement[]) {
    const grouped: { [key: string]: DisplayableMovement[] } = {};
    movements.forEach((m) => {
      if (!grouped[m.date]) grouped[m.date] = [];
      grouped[m.date].push(m);
    });

    return Object.keys(grouped)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .map((date) => ({ date, movements: grouped[date] }));
  }

  // Helpers (reutilizar los que ya tengas en Scan)
  getCategoryColor(category?: Category): string {
    if (!category) {
      // Si no hay categoría (es un income), devolvemos un color por defecto
      return '#4caf50'; // verde para ingresos
    }

    switch (category) {
      case Category.GASTOS_ESENCIALES:
        return '#FF6B35'; // naranja fuerte
      case Category.GASTOS_PERSONALES:
        return '#4ECDC4'; // turquesa
      case Category.FINANCIEROS:
        return '#45B7D1'; // azul
      case Category.EDUCACION:
        return '#FFEAA7'; // amarillo suave
      case Category.OTROS:
      default:
        return '#DDA0DD'; // púrpura
    }

  }

  getCategoryIcon(category?: Category): string {
    if (!category) {
      return 'attach_money'; // ícono para ingresos
    }

    switch (category) {
      case Category.GASTOS_ESENCIALES:
        return 'home'; // puede ser comida, vivienda, transporte → algo esencial
      case Category.GASTOS_PERSONALES:
        return 'person'; // ocio, compras, bienestar
      case Category.FINANCIEROS:
        return 'account_balance'; // bancos, préstamos, etc.
      case Category.EDUCACION:
        return 'school'; // estudios, cursos
      case Category.OTROS:
      default:
        return 'category'; // ícono genérico
    }
  }

  formatAmount(amount: number, type: 'income' | 'expense') {
    return `${type === 'expense' ? '-' : '+'} S/ ${amount.toFixed(2)}`;
  }

  getAmountClass(type: 'income' | 'expense') {
    return type === 'income' ? 'income-amount' : 'expense-amount';
  }

  formatDate(date: string) {
    return new Date(date).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  // Lazy loading placeholder
  loadMore() {
    console.log('Cargar más movimientos...');
    // TODO: Llamar backend para traer más resultados
  }

  openDetails(movement: DisplayableMovement) {
    const ref = this.dialog.open(MovementDetails, {
      width: '400px',
      data: movement
    });

    ref.componentInstance.deleted.subscribe((deletedMovement) => {
      // 👉 Borrar localmente
      this.movements = this.movements.filter(
        m => !(m.id === deletedMovement.id && m.type === deletedMovement.type)
      );
      this.applyFilters();
    });
  }
}
