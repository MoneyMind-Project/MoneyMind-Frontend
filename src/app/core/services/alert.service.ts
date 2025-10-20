import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from './environment';
import {
  ApiResponse,
  CreateExpenseApiResponse,
  PaginatedNotificationsResponse
} from '../../shared/models/response.model';
import { CryptoService} from './crypto.service';
import { catchError, map } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import {RecurringPayment} from '../../shared/models/recurring-payment.model';

@Injectable({
  providedIn: 'root'
})

export class AlertService{
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient, private crypto: CryptoService){}

  getUserAlertsPagination(page: number = 1, pageSize: number = 5, seen?: boolean): Observable<PaginatedNotificationsResponse> {
    const userId = this.crypto.getCurrentUserId();

    if (!userId) {
      console.error('Usuario no autenticado');
      return of({
        success: false,
        data: [],
        unread_count: 0,
        pagination: {
          page: 1,
          page_size: pageSize,
          total_alerts: 0,
          loaded_count: 0,
          has_more: false,
          next_page: null
        }
      });
    }

    const params: any = {
      user_id: userId.toString(),
      page: page.toString(),
      page_size: pageSize.toString()
    };

    if (seen !== undefined) {
      params.seen = seen.toString();
    }

    return this.http.get<PaginatedNotificationsResponse>(
      `${this.apiUrl}/alerts/user-alerts-pagination/`,
      { params }
    ).pipe(
      catchError((error) => {
        console.error('Error obteniendo alertas:', error);
        return of({
          success: false,
          data: [],
          unread_count: 0,
          pagination: {
            page: 1,
            page_size: pageSize,
            total_alerts: 0,
            loaded_count: 0,
            has_more: false,
            next_page: null
          }
        });
      })
    );
  }

  markAlertAsSeen(alertId: number): Observable<any> {
    const userId = this.crypto.getCurrentUserId();

    if (!userId) {
      console.error('Usuario no autenticado');
      return of({ success: false, data: [] });
    }

    return this.http.patch(`${this.apiUrl}/alerts/mark-seen/${userId}/${alertId}/`, {}).pipe(
      catchError((error) => {
        console.error(`Error marcando alerta ${alertId} como vista:`, error);
        return of({ success: false, error });
      })
    );
  }

  markAllRiskAlertsAsSeen(): Observable<any> {
    const userId = this.crypto.getCurrentUserId();

    if (!userId) {
      console.error('Usuario no autenticado');
      return of({ success: false, message: 'Usuario no autenticado' });
    }

    return this.http.patch(`${this.apiUrl}/alerts/mark-all-risk-seen/${userId}/`, {}).pipe(
      catchError((error) => {
        console.error(`Error marcando alertas de tipo 'risk' como vistas para el usuario ${userId}:`, error);
        return of({ success: false, error });
      })
    );
  }

  createRecurringPaymentReminder(data: RecurringPayment): Observable<ApiResponse<RecurringPayment>> {
    const userId = this.crypto.getCurrentUserId();

    const payload = {
      ...data,
      user_id: userId
    };

    return this.http.post<any>(`${this.apiUrl}/alerts/recurring-payments/create/`, payload).pipe(
      map((response) => ({
        success: true,
        message: response.message,
        data: response.data // 👈 aquí, no "expense"
      })),
      catchError((error) =>
        of({
          success: false,
          message: error.error?.message || 'Error al crear el pago recurrente',
          data: undefined
        })
      )
    );
  }

  markRecurringPaymentAsPaid(reminderId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/alerts/recurring-payments/${reminderId}/mark-paid/`,
      {} // Body vacío ya que el ID va en la URL
    );
  }

}
