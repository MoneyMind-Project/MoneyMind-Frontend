import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from './environment';
import { CryptoService} from './crypto.service';
import { catchError, map } from 'rxjs/operators';
import { of, Observable, throwError } from 'rxjs';
import { HomeDashboardResponse} from '../../shared/models/home-dashboard.model';

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

  getUnifiedAnalysis(month: number, year: number): Observable<any> {
    const userId = this.crypto.getCurrentUserId();

    if (!userId) {
      console.error('Usuario no autenticado');
      return of({ success: false, data: [] });
    }

    return this.http.get(`${this.apiUrl}/reports/unified-analysis/`, {
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

  getSavingsEvolution(year: number): Observable<any> {
    const userId = this.crypto.getCurrentUserId();

    if (!userId) {
      console.error('Usuario no autenticado');
      return of({ success: false, data: [] });
    }

    return this.http.get(`${this.apiUrl}/reports/saving-evolution/`, {
      params: {
        user_id: userId.toString(),
        year: year.toString()
      }
    }).pipe(
      catchError((error) => {
        console.error('Error obteniendo evolución de ahorro:', error);
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

  getHomeDashboard(): Observable<HomeDashboardResponse> {
    const userId = this.crypto.getCurrentUserId();

    if (!userId) {
      console.error('Usuario no autenticado');
      return throwError(() => new Error('Usuario no autenticado'));
    }

    const url = `${this.apiUrl}/reports/home/dashboard/`;

    return this.http.get<HomeDashboardResponse>(url, {
      params: {
        user_id: userId.toString(),
      }
    }).pipe(
      catchError((error) => {
        console.error('Error obteniendo datos del Home Dashboard:', error);
        return of({ success: false, data: null as any });
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

  exportReport(params: {
    userId: string;
    reportType: 'monthly' | 'yearly' | 'custom';
    format: 'pdf' | 'excel';
    month?: number;
    year?: number;
    startDate?: string;
    endDate?: string;
  }): Observable<Blob> {
    let httpParams = new HttpParams()
      .set('user_id', params.userId)
      .set('report_type', params.reportType)
      .set('file_format', params.format);

    if (params.reportType === 'monthly' && params.month && params.year) {
      httpParams = httpParams
        .set('month', params.month.toString())
        .set('year', params.year.toString());
    }

    if (params.reportType === 'yearly' && params.year) {
      httpParams = httpParams.set('year', params.year.toString());
    }

    if (params.reportType === 'custom' && params.startDate && params.endDate) {
      httpParams = httpParams
        .set('start_date', params.startDate)
        .set('end_date', params.endDate);
    }

    return this.http.get(`${this.apiUrl}/reports/export/`, {
      params: httpParams,
      responseType: 'blob' // ← Importante para archivos
    });
  }

  /**
   * Descarga el archivo generado
   */
  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

}
