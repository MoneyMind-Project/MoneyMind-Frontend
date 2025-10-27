import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from './environment';
import { User } from '../../shared/models/user.model';
import { RegisterRequest } from '../../shared/models/register-request.model';
import { catchError, map } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { ApiResponse} from '../../shared/models/response.model';
import { CryptoService } from './crypto.service';
import {UpdateProfileData} from "../../shared/models/user.model";

interface CurrentUserData {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private crypto: CryptoService) {}

  // Registro
  register(data: RegisterRequest): Observable<ApiResponse<User>> {
    return this.http.post<User>(`${this.apiUrl}/users/register/`, data).pipe(
      map((user) => ({
        success: true,
        message: 'Registro exitoso',
        data: user
      })),
      catchError((error) =>
        of({
          success: false,
          message: error.error?.message || 'Error en el registro',
          data: undefined
        })
      )
    );
  }

  // Login
  login(credentials: { email: string; password: string }): Observable<ApiResponse<{ token: string, user: User }>> {
    return this.http.post<any>(`${this.apiUrl}/users/login/`, credentials).pipe(
      map((response) => {
        if (response && response.token && response.user) {

          // Guardamos data en el localstorage
          const currentUser = { token: response.token, user: response.user };
          localStorage.setItem('mm-current-user', this.crypto.encrypt(currentUser));

          return {
            success: true,
            message: response.message || 'Login exitoso',
            data: {
              token: response.token,
              user: response.user
            }
          } as ApiResponse<{ token: string, user: User }>;
        }

        // Caso en el que backend solo devuelve un mensaje (ejemplo: credenciales inválidas)
        return {
          success: false,
          message: response.message || 'Credenciales inválidas'
        } as ApiResponse<{ token: string, user: User }>;
      }),
      catchError((error) =>
        of({
          success: false,
          message: error?.error?.message || 'Error en el login'
        } as ApiResponse<{ token: string, user: User }>)
      )
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

  updateProfile(data: UpdateProfileData): Observable<ApiResponse<any>> {
    const userId = this.crypto.getCurrentUserId();

    if (!userId) {
      console.error('Usuario no autenticado');
      return of({
        success: false,
        message: 'Error usuario no logeado',
        data: undefined
      } as ApiResponse<any>);
    }

    const payload = {
      user_id: userId,
      ...data
    };

    return this.http.patch<any>(`${this.apiUrl}/users/update-profile/`, payload).pipe(
      map((response) => {
        if (response?.success && response?.user) {
          // Actualizamos el usuario almacenado en el localStorage
          const encryptedUser = localStorage.getItem('mm-current-user');
          if (encryptedUser) {
            const currentUser = this.crypto.decrypt(encryptedUser) as any;

            // Actualizar datos del usuario
            currentUser.user = {
              ...currentUser.user,
              ...response.user
            };

            localStorage.setItem('mm-current-user', this.crypto.encrypt(currentUser));
          }

          return {
            success: true,
            message: response.message || 'Perfil actualizado correctamente',
            data: {
              user: response.user,
              monthly_income: response.monthly_income
            }
          } as ApiResponse<any>;
        }

        return {
          success: false,
          message: response?.message || 'Error al actualizar el perfil',
          data: undefined
        } as ApiResponse<any>;
      }),
      catchError((error) => {
        console.error('Error al actualizar perfil:', error);
        return of({
          success: false,
          message: error?.error?.error || error?.error?.message || 'Error al actualizar el perfil',
          data: undefined
        } as ApiResponse<any>);
      })
    );
  }

}
