// models/displayable-movement.model.ts
import { Category } from '../enums/category.enum';

export interface DisplayableMovement {
  id: number;
  type: 'expense' | 'income';  // Diferenciar qué es
  title: string;               // Puede ser "place" en Expense o "title" en Income
  date: string;
  time: string;
  total: number;
  comment?: string;
  category?: Category; //   <-- ahora es Category (opcional)
  place?: string;           // Solo para expenses
  created_at?: string;
}
