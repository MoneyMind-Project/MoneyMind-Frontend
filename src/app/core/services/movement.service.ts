import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from './environment';
import { Expense } from '../../shared/models/expense.model';
import { Income} from '../../shared/models/income.model';
import { DisplayableMovement} from '../../shared/models/displayable-movement.model';
import { CryptoService} from './crypto.service';
import { catchError, map } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { ApiResponse, DashboardResponse, PaginatedMovementsResponse, CreateExpenseApiResponse} from '../../shared/models/response.model';

const categoryMapper = {
  'GASTOS_ESENCIALES': 'gastos_esenciales',
  'GASTOS_PERSONALES': 'gastos_personales',
  'FINANCIEROS': 'financieros',
  'EDUCACION': 'educacion',
  'OTROS': 'otros'
};

@Injectable({
  providedIn: 'root'
})

export class MovementService{
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient, private crypto: CryptoService){}

  createExpense(data: Expense): Observable<ApiResponse<Expense>> {
    const userId = this.crypto.getCurrentUserId();

    const payload = {
      ...data,
      user_id: userId,
      category: data.category,
      time: data.time.length === 5 ? `${data.time}:00` : data.time // "12:51" → "12:51:00"
    };

    return this.http.post<CreateExpenseApiResponse>(`${this.apiUrl}/movements/expense/create/`, payload).pipe(
      map((response) => ({
        success: true,
        message: response.message,
        data: response.expense
      })),
      catchError((error) =>
        of({
          success: false,
          // 👇 mandamos exactamente lo que el backend puso en "message"
          message: error.error?.message || 'Error al crear el gasto',
          data: undefined
        })
      )
    );
  }

  createIncome(data: Income): Observable<ApiResponse<Income>> {
    const userId = this.crypto.getCurrentUserId();
    const payload = { ...data, user_id: userId };

    return this.http.post<any>(`${this.apiUrl}/movements/income/create/`, payload).pipe(
      map((response) => {
        const income = {
          ...response.income,
          total: parseFloat(response.income.total) // aseguramos number
        } as Income;

        return {
          success: true,
          message: response.message || 'Ingreso creado exitosamente',
          data: income
        };
      }),
      catchError((error) =>
        of({
          success: false,
          // 👇 aquí también propagamos el mensaje tal cual
          message: error.error?.message || 'Error al crear el ingreso',
          data: undefined
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
          data: undefined
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
              place: m.place,
              created_at: m.created_at,
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
            data: undefined
          })
        )
      );
  }


  getAllMovements(page: number, pageSize: number): Observable<ApiResponse<PaginatedMovementsResponse>> {
    const userId = this.crypto.getCurrentUserId();

    return this.http
      .get<any>(`${this.apiUrl}/movements/scan/all/${userId}/?page=${page}&page_size=${pageSize}`)
      .pipe(
        map((res) => ({
          success: true,
          message: 'Movimientos obtenidos correctamente',
          data: {
            movements: res.movements.map((m: any) => ({
              id: m.id,
              type: m.type,
              title: m.type === 'expense' ? m.place : m.title,
              date: m.date,
              time: m.time,
              total: parseFloat(m.total),
              comment: m.comment,
              category: m.category,
              place: m.place,
              created_at: m.created_at,
            })),
            hasMore: res.has_more,
            page: res.page,
            pageSize: res.page_size,
            totalMovements: res.total_movements,
            loadedCount: res.loaded_count,
            nextPage: res.next_page
          }
        })),
        catchError((error) =>
          of({
            success: false,
            message: error.error?.message || 'Error al obtener movimientos',
            data: {
              movements: [],
              hasMore: false,
              page: page,
              pageSize: pageSize,
              totalMovements: 0,
              loadedCount: 0,
              nextPage: null
            }
          })
        )
      );
  }



}
