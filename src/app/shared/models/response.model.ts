import { DisplayableMovement } from './displayable-movement.model';
import { Expense} from './expense.model';
import { Notification} from './notification.model';

export interface BasicApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    hasMore: boolean;
    nextPage: number | null;
  };
}

export interface DashboardResponse {
  currentBalance: number;                // balance actual
  recentMovements: DisplayableMovement[]; // últimos movimientos
  totalMovements: number;                // número total de movimientos
}

export interface PaginatedMovementsResponse {
  movements: DisplayableMovement[];
  hasMore: boolean;
  page: number;
  pageSize: number;
  totalMovements: number;
  loadedCount: number;
  nextPage: number | null;
}

export interface CreateExpenseApiResponse {
  message: string;
  expense: Expense;
  new_balance: string;
}

export interface PaginatedNotificationsResponse {
  success: boolean;
  data: Notification[];
  unread_count: number;
  pagination: {
    page: number;
    page_size: number;
    total_alerts: number;
    loaded_count: number;
    has_more: boolean;
    next_page: number | null;
  };
}
