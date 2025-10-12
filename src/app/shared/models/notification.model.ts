export interface Notification {
  id: number;
  alert_type: 'risk' | 'warning' | 'info' | 'success';
  message: string;
  target_month: number;
  target_year: number;
  seen: boolean;
  created_at: string;
}

