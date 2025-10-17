import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from './environment';
import { catchError, map } from 'rxjs/operators';
import { of, Observable, throwError } from 'rxjs';
import { CryptoService } from './crypto.service';

export interface MonthlyIncomeResponse {
  monthly_income: number | null;
  current_balance: number | null;
}

export interface UpdateMonthlyIncomeRequest {
  user_id: number;
  new_monthly_income: number;
}

@Injectable({
  providedIn: 'root'
})
export class BalanceService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private crypto: CryptoService) {}

  getUserBalance(): Observable<MonthlyIncomeResponse | null> {
    const userId = this.crypto.getCurrentUserId();

    if (!userId) {
      console.error('Usuario no autenticado');
      return throwError(() => new Error('Usuario no autenticado'));
    }

    const url = `${this.apiUrl}/balances/user-balance/`;
    return this.http
      .get<MonthlyIncomeResponse>(url, {
        params: { user_id: userId.toString() }
      })
      .pipe(
        catchError((error) => {
          console.error('Error al obtener el ingreso mensual:', error);
          return of(null);
        })
      );
  }

  updateMonthlyIncome(newMonthlyIncome: number): Observable<any> {
    const userId = this.crypto.getCurrentUserId();

    if (!userId) {
      console.error('Usuario no autenticado');
      return throwError(() => new Error('Usuario no autenticado'));
    }

    const url = `${this.apiUrl}/balances/update-monthly-income/`;
    const body: UpdateMonthlyIncomeRequest = {
      user_id: userId,
      new_monthly_income: newMonthlyIncome
    };

    return this.http.patch(url, body).pipe(
      catchError((error) => {
        console.error('Error al actualizar el ingreso mensual:', error);
        return of(null);
      })
    );
  }
}
