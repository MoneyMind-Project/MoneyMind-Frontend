import { DisplayableMovement } from './displayable-movement.model';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T | null;
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
