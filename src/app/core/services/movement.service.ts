import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from './environment';
import { Expense } from '../../shared/models/expense.model';
import { Income} from '../../shared/models/income.model';
import { DisplayableMovement} from '../../shared/models/displayable-movement.model';
import { CryptoService} from './crypto.service';
import { catchError, map } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { ApiResponse, DashboardResponse} from '../../shared/models/response.model';


@Injectable({
  providedIn: 'root'
})

export class MovementService{
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient, private crypto: CryptoService){}

  createExpense(data: Expense): Observable<ApiResponse<Expense>> {
    const userId = this.crypto.getCurrentUserId();
    const payload = { ...data, user_id: userId };

    return this.http.post<Expense>(`${this.apiUrl}/movements/expense/create/`, payload).pipe(
      map((expense) => ({
        success: true,
        message: 'Gasto creado exitosamente',
        data: expense
      })),
      catchError((error) =>
        of({
          success: false,
          message: error.error?.message || 'Error al crear el gasto',
          data: null
        })
      )
    );
  }

  deleteExpense(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<void>(`${this.apiUrl}/movements/expense/delete/${id}/`).pipe(
      map(() => ({
        success: true,
        message: 'Gasto eliminado exitosamente',
        data: null
      })),
      catchError((error) =>
        of({
          success: false,
          message: error.error?.message || 'Error al eliminar el gasto',
          data: null
        })
      )
    );
  }

  deleteIncome(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<void>(`${this.apiUrl}/movements/income/delete/${id}/`).pipe(
      map(() => ({
        success: true,
        message: 'Ingreso eliminado exitosamente',
        data: null
      })),
      catchError((error) =>
        of({
          success: false,
          message: error.error?.message || 'Error al eliminar el ingreso',
          data: null
        })
      )
    );
  }


  createIncome(data: Income): Observable<ApiResponse<Income>> {
    const userId = this.crypto.getCurrentUserId();
    const payload = { ...data, user_id: userId };

    return this.http.post<Income>(`${this.apiUrl}/movements/income/create/`, payload).pipe(
      map((income) => ({
        success: true,
        message: 'Ingreso creado exitosamente',
        data: income
      })),
      catchError((error) =>
        of({
          success: false,
          message: error.error?.message || 'Error al crear el ingreso',
          data: null
        })
      )
    );
  }


  getScanDashboard(): Observable<ApiResponse<DashboardResponse>> {
    const userId = this.crypto.getCurrentUserId();

    return this.http
      .get<any>(`${this.apiUrl}/movements/scan/dashboard/${userId}/`)
      .pipe(
        map((res) => {
          // adaptamos los nombres snake_case -> camelCase
          const dashboard: DashboardResponse = {
            currentBalance: parseFloat(res.current_balance),
            recentMovements: res.recent_movements.map((m: any) => ({
              id: m.id,
              type: m.type,
              title: m.type === 'expense' ? m.place : m.title,
              date: m.date,
              time: m.time,
              total: parseFloat(m.total),
              comment: m.comment,
              category: m.category,
              place: m.place
            })),
            totalMovements: res.total_movements
          };

          return {
            success: true,
            message: 'Dashboard cargado correctamente',
            data: dashboard
          };
        }),
        catchError((error) =>
          of({
            success: false,
            message: error.error?.message || 'Error al cargar dashboard',
            data: null
          })
        )
      );
  }


  getAllMovements(page: number, pageSize: number): Observable<ApiResponse<DisplayableMovement[]>> {
    const userId = this.crypto.getCurrentUserId();

    return this.http
      .get<{ movements: DisplayableMovement[]; has_more: boolean; next_page: number | null }>(
        `${this.apiUrl}/movements/all/${userId}/?page=${page}&page_size=${pageSize}`
      )
      .pipe(
        map((res) => ({
          success: true,
          message: 'Movimientos obtenidos correctamente',
          data: res.movements,
          meta: {
            hasMore: res.has_more,
            nextPage: res.next_page
          }
        })),
        catchError((error) =>
          of({
            success: false,
            message: error.error?.message || 'Error al obtener movimientos',
            data: [],
            meta: {
              hasMore: false,
              nextPage: null
            }
          })
        )
      );
  }


}
