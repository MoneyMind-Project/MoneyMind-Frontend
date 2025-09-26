// models/Expense.ts
import {Category} from '../enums/category.enum';

export interface Expense {
  id: number;          // Unique identifier (UUID or incremental)
  category: Category;  // Enum for classification (e.g., FOOD, TRANSPORT, ENTERTAINMENT)
  place: string;       // Store, company, or location
  date: string;        // ISO date string "2025-09-13"
  time: string;        // "14:35" or in HH:mm format
  total: number;       // Amount spent
  comment?: string;    // Optional notes
}
