import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from './environment';
import { User } from '../../shared/models/user.model';
import { RegisterRequest } from '../../shared/models/register-request.model';
import { catchError, map } from 'rxjs/operators';
import { of, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Registro
  register(data: RegisterRequest): Observable<boolean> {
    return this.http.post(`${this.apiUrl}/users/register/`, data).pipe(
      map(() => true),              // si la API responde 201, devolvemos true
      catchError(() => of(false))   // si hay error, devolvemos false
    );
  }

  // Login
  login(credentials: { email: string; password: string }): Observable<boolean> {
    return this.http.post<any>(`${this.apiUrl}/users/login/`, credentials).pipe(
      map((response) => {
        if (response && response.token) {
          localStorage.setItem('token', response.token); // guardamos token
          return true;
        }
        return false;
      }),
      catchError(() => of(false)) // si hay error devolvemos false
    );
  }


  // Logout
  logout(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/users/logout/`, {});
  }

  // Obtener lista de usuarios (solo prueba/admin)
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users/list/`);
  }
}
