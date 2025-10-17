export interface HomeDashboardResponse {
  success: boolean;
  data: HomeDashboardData;
}

export interface HomeDashboardData {
  weekly_tip: WeeklyTip;
  budget: BudgetData;
  daily_expenses: DailyExpense[];
  upcoming_payments: UpcomingPayment[];
}

export interface WeeklyTip {
  title: string;
  message: string;
}

export interface BudgetData {
  month: number;
  year: number;
  total: number;
  spent: number;
  remaining: number;
  percentage: number;
}

export interface DailyExpense {
  day: number;
  amount: number;
}

export interface UpcomingPayment {
  // temporalmente vacío, pero puedes ampliarlo luego
  id?: number;
  description?: string;
  due_date?: string;
  amount?: number;
}
