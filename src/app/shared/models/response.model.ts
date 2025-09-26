import { DisplayableMovement } from './displayable-movement.model';

// response.model.ts
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
