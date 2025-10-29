import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class OneSignalService {
  private isInitialized = false;

  async init(): Promise<void> {
    if (this.isInitialized) {
      console.log('⚠️ OneSignal ya está inicializado');
      return;
    }

    try {
      // Asegurar que OneSignalDeferred existe
      window.OneSignalDeferred = window.OneSignalDeferred || [];

      await new Promise<void>((resolve) => {
        window.OneSignalDeferred!.push(async (OneSignal: any) => {
          await OneSignal.init({
            appId: '64b2a598-c69a-40bc-9b73-300085bcca04',
            safari_web_id: 'web.onesignal.auto.57daeefd-2777-4d55-aef6-93b3ff4b973a',
            allowLocalhostAsSecureOrigin: true,
            notifyButton: {
              enable: true,
            },
          });

          this.isInitialized = true;
          console.log('✅ OneSignal inicializado correctamente');
          resolve();
        });
      });
    } catch (error) {
      console.error('❌ Error inicializando OneSignal:', error);
    }
  }

  /**
   * Solicita permiso para notificaciones y vincula al usuario
   */
  async requestPermissionAndSetUser(userId: string): Promise<{ success: boolean; message: string }> {
    console.log('🌐 Dominio actual:', window.location.hostname);
    console.log('🔐 HTTPS:', window.location.protocol === 'https:');
    console.log('🔔 Permiso actual:', Notification.permission);
    console.log('👷 Service Worker soportado:', 'serviceWorker' in navigator);

    try {
      if (!this.isInitialized) {
        console.warn('⚠️ OneSignal no está inicializado, inicializando...');
        await this.init();
      }

      return await new Promise<{ success: boolean; message: string }>((resolve) => {
        window.OneSignalDeferred!.push(async (OneSignal: any) => {
          try {
            // Verificar si el permiso ya está bloqueado
            const currentPermission = await OneSignal.Notifications.permission;

            if (currentPermission === false) {
              console.error('🚫 Permiso de notificaciones bloqueado por el navegador');
              resolve({
                success: false,
                message: 'PERMISSION_BLOCKED'
              });
              return;
            }

            // 1. Solicitar permiso de notificaciones
            const permission = await OneSignal.Notifications.requestPermission();
            console.log('🔔 Permiso de notificaciones:', permission);

            if (!permission) {
              console.warn('⚠️ Usuario rechazó las notificaciones');
              resolve({
                success: false,
                message: 'PERMISSION_DENIED'
              });
              return;
            }

            // 2. Verificar si el usuario ya está suscrito
            const isPushEnabled = await OneSignal.User.PushSubscription.optedIn;
            console.log('📡 Usuario suscrito:', isPushEnabled);

            if (!isPushEnabled) {
              // Intentar suscribir al usuario
              await OneSignal.User.PushSubscription.optIn();
              console.log('✅ Usuario suscrito a notificaciones push');
            }

            // 3. Vincular external user ID
            await OneSignal.login(userId);
            console.log('🔗 Usuario vinculado a OneSignal:', userId);

            // 4. Verificar la suscripción
            const subscriptionId = OneSignal.User.PushSubscription.id;
            console.log('📱 Subscription ID:', subscriptionId);

            resolve({
              success: true,
              message: 'SUCCESS'
            });
          } catch (error) {
            console.error('❌ Error en el proceso de suscripción:', error);
            resolve({
              success: false,
              message: 'ERROR'
            });
          }
        });
      });
    } catch (error) {
      console.error('❌ Error en requestPermissionAndSetUser:', error);
      return {
        success: false,
        message: 'ERROR'
      };
    }
  }

  /**
   * Vincula el usuario logueado (sin solicitar permisos nuevamente)
   */
  async setExternalUserId(userId: string): Promise<void> {
    try {
      if (!this.isInitialized) {
        console.warn('⚠️ OneSignal no inicializado');
        return;
      }

      await new Promise<void>((resolve) => {
        window.OneSignalDeferred!.push(async (OneSignal: any) => {
          await OneSignal.login(userId);
          console.log('📡 Usuario vinculado:', userId);
          resolve();
        });
      });
    } catch (error) {
      console.error('❌ Error vinculando usuario:', error);
    }
  }

  /**
   * Desvincula el usuario al cerrar sesión
   */
  async removeExternalUserId(): Promise<void> {
    try {
      await new Promise<void>((resolve) => {
        window.OneSignalDeferred!.push(async (OneSignal: any) => {
          await OneSignal.logout();
          console.log('👋 Usuario desvinculado de OneSignal');
          resolve();
        });
      });
    } catch (error) {
      console.error('❌ Error desvinculando usuario:', error);
    }
  }

  /**
   * Verifica si el usuario está suscrito
   */
  async isSubscribed(): Promise<boolean> {
    try {
      return await new Promise<boolean>((resolve) => {
        window.OneSignalDeferred!.push(async (OneSignal: any) => {
          const isSubscribed = await OneSignal.User.PushSubscription.optedIn;
          resolve(isSubscribed);
        });
      });
    } catch (error) {
      console.error('❌ Error verificando suscripción:', error);
      return false;
    }
  }

  /**
   * Obtiene el ID de suscripción de OneSignal
   */
  async getSubscriptionId(): Promise<string | null> {
    try {
      return await new Promise<string | null>((resolve) => {
        window.OneSignalDeferred!.push(async (OneSignal: any) => {
          const subscriptionId = OneSignal.User.PushSubscription.id;
          resolve(subscriptionId || null);
        });
      });
    } catch (error) {
      console.error('❌ Error obteniendo subscription ID:', error);
      return null;
    }
  }
}
