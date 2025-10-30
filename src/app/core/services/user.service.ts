import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from './environment';
import { User } from '../../shared/models/user.model';
import {UserPreference} from '../../shared/models/user.model';
import { RegisterRequest } from '../../shared/models/register-request.model';
import {catchError, map, switchMap} from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { ApiResponse} from '../../shared/models/response.model';
import { CryptoService } from './crypto.service';
import {UpdateProfileData} from "../../shared/models/user.model";
import { OneSignalService} from './onesignal.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private crypto: CryptoService, private oneSignal: OneSignalService) {}

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
      map((response) => { // ✅ Cambiado de switchMap a map
        if (response && response.token && response.user) {
          // 1️⃣ Guardar usuario en localStorage (cifrado)
          const currentUser = { token: response.token, user: response.user };
          localStorage.setItem('mm-current-user', this.crypto.encrypt(currentUser));

          // 2️⃣ Inicializar y vincular usuario con OneSignal SIN BLOQUEAR
          // ✅ Ejecutamos en segundo plano sin await
          this.setupOneSignal(response.user.id.toString());

          // 3️⃣ Retornar respuesta exitosa INMEDIATAMENTE
          return {
            success: true,
            message: response.message || 'Login exitoso',
            data: {
              token: response.token,
              user: response.user
            }
          } as ApiResponse<{ token: string, user: User }>;
        }

        // 4️⃣ Si la respuesta no incluye token o user
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
  
  private async setupOneSignal(userId: string): Promise<void> {
    try {
      // Timeout general de 30 segundos
      const result = await Promise.race([
        this.oneSignal.requestPermissionAndSetUser(userId),
        new Promise<{ success: boolean; message: string }>((resolve) =>
          setTimeout(() => {
            console.warn('⏱️ OneSignal setup timeout, continuando sin notificaciones');
            resolve({ success: false, message: 'TIMEOUT' });
          }, 30000)
        )
      ]);

      if (result.success) {
        console.log('✅ Usuario suscrito y vinculado correctamente a OneSignal');
      } else {
        if (result.message === 'PERMISSION_BLOCKED') {
          console.warn('🚫 Notificaciones bloqueadas manualmente en el navegador');
          this.showNotificationBlockedMessage();
        } else if (result.message === 'PERMISSION_DENIED') {
          console.warn('⚠️ Usuario rechazó las notificaciones');
        } else if (result.message === 'TIMEOUT') {
          console.warn('⏱️ OneSignal tardó demasiado, se continuó sin configurar notificaciones');
        } else {
          console.warn('⚠️ No se pudo completar la suscripción:', result.message);
        }
      }
    } catch (error) {
      console.error('❌ Error configurando OneSignal (no afecta el login):', error);
    }
  }


  private showNotificationBlockedMessage(): void {
    // Mostrar mensaje al usuario con instrucciones
    // Puedes usar NgToast, MatDialog, o cualquier sistema de notificaciones
    console.log(`
      🔔 Las notificaciones están bloqueadas

      Para activarlas:
      1. Haz clic en el candado 🔒 junto a la URL
      2. Busca "Notificaciones"
      3. Cambia a "Permitir"
      4. Recarga la página
    `);
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

  // ✅ Obtener preferencia por userId
  getUserPreference(userId: number): Observable<UserPreference> {
    return this.http.get<UserPreference>(`${this.apiUrl}/users/user-preferences/${userId}/`);
  }

  // ✅ Crear o actualizar (upsert) preferencia
  upsertUserPreference(userId: number, color: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/user-preferences/${userId}/`, { color });
  }

}
