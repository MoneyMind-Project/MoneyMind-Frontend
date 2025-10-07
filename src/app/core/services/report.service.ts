import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from './environment';
import { Expense } from '../../shared/models/expense.model';
import { Income} from '../../shared/models/income.model';
import { CryptoService} from './crypto.service';
import { catchError, map } from 'rxjs/operators';
import { of, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ReportService{
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient, private crypto: CryptoService){}

  getExpensesByCategory(month: number, year: number): Observable<any> {
    const userId = this.crypto.getCurrentUserId();

    if (!userId) {
      console.error('Usuario no autenticado');
      return of({ success: false, data: [] });
    }

    return this.http.get(`${this.apiUrl}/reports/expenses-by-category/`, {
      params: {
        user_id: userId.toString(),
        month: month.toString(),
        year: year.toString()
      }
    }).pipe(
      catchError((error) => {
        console.error('Error obteniendo gastos por categoría:', error);
        return of({ success: false, data: [] });
      })
    );
  }

  getExpensesByParentCategory(month: number, year: number): Observable<any> {
    const userId = this.crypto.getCurrentUserId();

    if (!userId) {
      console.error('Usuario no autenticado');
      return of({ success: false, data: [] });
    }

    return this.http.get(`${this.apiUrl}/reports/expenses-by-parent-category/`, {
      params: {
        user_id: userId.toString(),
        month: month.toString(),
        year: year.toString()
      }
    }).pipe(
      catchError((error) => {
        console.error('Error obteniendo gastos por categoría padre:', error);
        return of({ success: false, data: [] });
      })
    );
  }

  getEssentialVsNonEssential(year: number): Observable<any> {
    const userId = this.crypto.getCurrentUserId();

    if (!userId) {
      console.error('Usuario no autenticado');
      return of({ success: false, data: [] });
    }

    return this.http.get(`${this.apiUrl}/reports/essential-vs-non-essential/`, {
      params: {
        user_id: userId.toString(),
        year: year.toString()
      }
    }).pipe(
      catchError((error) => {
        console.error('Error obteniendo gastos esenciales vs no esenciales:', error);
        return of({ success: false, data: [] });
      })
    );
  }

  getDashboardOverview(month: number, year: number): Observable<any> {
    const userId = this.crypto.getCurrentUserId();

    if (!userId) {
      console.error('Usuario no autenticado');
      return of({ success: false, data: [] });
    }

    return this.http.get(`${this.apiUrl}/reports/dashboard-overview/`, {
      params: {
        user_id: userId.toString(),
        month: month.toString(),
        year: year.toString()
      }
    }).pipe(
      catchError((error) => {
        console.error('Error obteniendo overview del dashboard:', error);
        return of({ success: false, data: null });
      })
    );
  }

  getUserAlerts(seen?: boolean): Observable<any> {
    const userId = this.crypto.getCurrentUserId();

    if (!userId) {
      console.error('Usuario no autenticado');
      return of({ success: false, data: [] });
    }

    const params: any = { user_id: userId.toString() };
    if (seen !== undefined) {
      params.seen = seen.toString();
    }

    return this.http.get(`${this.apiUrl}/alerts/user-alerts/`, { params }).pipe(
      catchError((error) => {
        console.error('Error obteniendo alertas:', error);
        return of({ success: false, data: [], unread_count: 0 });
      })
    );
  }

  getMonthlyPrediction(year: number): Observable<any> {
    const userId = this.crypto.getCurrentUserId();

    if (!userId) {
      console.error('Usuario no autenticado');
      return of({ success: false, data: [] });
    }

    return this.http.get(`${this.apiUrl}/reports/monthly-prediction/`, {
      params: {
        user_id: userId.toString(),
        year: year.toString()
      }
    }).pipe(
      catchError((error) => {
        console.error('Error obteniendo predicción mensual:', error);
        return of({ success: false, data: [] });
      })
    );
  }

  markAlertsAsSeen(alertIds: number[]): Observable<any> {
    return this.http.patch(`${this.apiUrl}/reports/user-alerts/`, { alert_ids: alertIds });
  }

}
