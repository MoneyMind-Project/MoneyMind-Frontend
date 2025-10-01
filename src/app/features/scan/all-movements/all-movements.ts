import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { DisplayableMovement} from '../../../shared/models/displayable-movement.model';
import { Category} from '../../../shared/enums/category.enum';
import { FormsModule } from '@angular/forms';
import {MovementDetails} from '../movement-details/movement-details';
import {MatDialog} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {RouterLink} from '@angular/router';
import { MovementService} from '../../../core/services/movement.service';
import { PaginatedMovementsResponse} from '../../../shared/models/response.model';
import { CategoryUtils} from '../../../shared/utils/category.utils';


@Component({
  selector: 'app-all-movements',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, MatIconModule, RouterLink],
  templateUrl: './all-movements.html',
  styleUrl: './all-movements.css'
})
export class AllMovements implements OnInit {
  movements: DisplayableMovement[] = [];
  filteredMovements: DisplayableMovement[] = [];
  groupedFilteredMovements: { date: string; movements: DisplayableMovement[] }[] = [];

  searchTerm = '';
  activeDateFilter: string = 'all';

  // Paginación
  page = 1;
  pageSize = 20;
  hasMore = true;

  dateOptions = [
    { label: 'Hoy', value: 'today' },
    { label: '7 días', value: '7' },
    { label: '15 días', value: '15' },
    { label: '30 días', value: '30' },
    { label: '90 días', value: '90' },
    { label: 'Todos', value: 'all' },
  ];

  constructor(
    private dialog: MatDialog,
    private movementService: MovementService
  ) {}


  ngOnInit(): void {
    this.loadMovements();
  }

  loadMovements(): void {
    this.movementService.getAllMovements(this.page, this.pageSize).subscribe((res) => {
      if (res.success && res.data) {
        const response: PaginatedMovementsResponse = res.data;

        // Agregar los movimientos nuevos
        this.movements = [...this.movements, ...response.movements];

        // Actualizar paginación
        this.hasMore = response.hasMore;
        this.page = response.nextPage ?? this.page;

        // Aplicar filtros sobre todos los movimientos
        this.applyFilters();
      } else {
        console.error(res.message);
      }
    });
  }

  loadMore(): void {
    if (this.hasMore) {
      this.loadMovements();
    }
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

  private groupByDate(movements: DisplayableMovement[]) {
    const grouped: { [date: string]: DisplayableMovement[] } = {};
    movements.forEach((m) => {
      if (!grouped[m.date]) {
        grouped[m.date] = [];
      }
      grouped[m.date].push(m);
    });

    return Object.keys(grouped).map((date) => ({
      date,
      movements: grouped[date]
    }));
  }

  // Helpers (reutilizar los que ya tengas en Scan)
  getCategoryColor(category?: Category): string {
    return CategoryUtils.getCategoryColor(category);
  }

  getCategoryIcon(category?: Category): string {
    return CategoryUtils.getCategoryIcon(category);
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

  openDetails(movement: DisplayableMovement) {
    const ref = this.dialog.open(MovementDetails, {
      width: '500px',
      maxWidth: window.innerWidth <= 768 ? '85vw' : '500px',
      maxHeight: '85vh',
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
