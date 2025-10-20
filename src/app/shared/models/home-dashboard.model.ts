import {RecurringPayment} from './recurring-payment.model';

export interface HomeDashboardResponse {
  success: boolean;
  data: HomeDashboardData;
}

export interface HomeDashboardData {
  weekly_tip: WeeklyTip;
  budget: BudgetData;
  daily_expenses: DailyExpense[];
  upcoming_payments: RecurringPayment[];
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
