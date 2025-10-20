import { Category } from '../enums/category.enum';

export interface RecurringPayment {
  id: number;                  // Identificador único
  user: number;                // ID del usuario al que pertenece el pago
  name: string;                // Ej: "Netflix Premium", "Internet Movistar"
  category: Category;          // Categoría (enum)
  amount: number;              // Monto mensual o periódico
  recurrence_type: string;     // Ej: "monthly"
  payment_day: number;         // Día del mes en que se paga (1-31)
  is_active: boolean;          // Si sigue activo o fue cancelado
  start_date: string;          // Fecha de inicio (YYYY-MM-DD)
  end_date?: string | null;    // Fecha de fin opcional
  last_payment_date?: string | null; // Última vez que se marcó como pagado
  created_at: string;          // Fecha de creación del registro
}

