import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class OneSignalService {
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;


  async init(): Promise<void> {
    // Previene inicialización duplicada
    if (this.isInitialized) {
      console.log('⚠️ OneSignal ya inicializado (flag interno)');
      return;
    }

    if (window.OneSignal && window.OneSignal.initialized) {
      console.log('⚠️ OneSignal ya inicializado (SDK)');
      this.isInitialized = true;
      return;
    }

    // Evita duplicación si ya se está inicializando
    if (this.initPromise) {
      console.log('⚠️ OneSignal se está inicializando, espera...');
      return this.initPromise;
    }

    this.initPromise = new Promise<void>((resolve) => {
      try {
        // Crea el array solo si no existe
        window.OneSignalDeferred = window.OneSignalDeferred || [];

        // Marca antes de empujar
        console.log('🚀 Iniciando OneSignal...');

        // Solo un push controlado
        window.OneSignalDeferred.push(async (OneSignal: any) => {
          try {
            if (this.isInitialized || OneSignal.initialized) {
              console.log('⚠️ OneSignal ya estaba inicializado, se omite.');
              resolve();
              return;
            }

            await OneSignal.init({
              appId: "64b2a598-c69a-40bc-9b73-300085bcca04",
              notifyButton: { enable: true },
              serviceWorkerPath: '/OneSignalSDKWorker.js',
              serviceWorkerUpdaterPath: '/OneSignalSDKUpdaterWorker.js',
              serviceWorkerParam: { scope: '/' },
            });

            console.log('✅ OneSignal inicializado correctamente');
            this.isInitialized = true;
            resolve();
          } catch (err) {
            console.error('❌ Error en inicialización interna:', err);
            resolve();
          }
        });

      } catch (error) {
        console.error('❌ Error inicializando OneSignal:', error);
        this.initPromise = null;
        resolve();
      }
    });

    return this.initPromise;
  }



  /**
   * Solicita permiso para notificaciones y vincula al usuario
   */
  async requestPermissionAndSetUser(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.isInitialized) {
        await this.init();
      }

      return await new Promise<{ success: boolean; message: string }>((resolve) => {
        window.OneSignalDeferred!.push(async (OneSignal: any) => {
          try {
            // 1️⃣ Solicitar permiso nativo
            const nativePermission = await Notification.requestPermission();
            console.log('🔔 Permiso nativo del navegador:', nativePermission);

            if (nativePermission !== 'granted') {
              console.warn('🚫 Usuario negó el permiso de notificaciones');
              resolve({ success: false, message: 'PERMISSION_DENIED' });
              return;
            }

            // 2️⃣ Solicitar permiso desde OneSignal
            const permission = await OneSignal.Notifications.requestPermission();
            console.log('🔔 Permiso OneSignal:', permission);

            if (!permission) {
              console.warn('⚠️ Usuario rechazó permiso desde OneSignal');
              resolve({ success: false, message: 'PERMISSION_DENIED' });
              return;
            }

            // 3️⃣ Verificar suscripción y suscribir si es necesario
            const isSubscribed = await OneSignal.User.PushSubscription.optedIn;
            console.log('📡 Usuario suscrito:', isSubscribed);

            if (!isSubscribed) {
              console.log('🟡 Intentando suscribir usuario...');
              await OneSignal.User.PushSubscription.optIn();
              console.log('✅ Usuario suscrito correctamente');
            }

            // 4️⃣ Vincular usuario con OneSignal
            await OneSignal.login(userId);
            console.log('🔗 Usuario vinculado a OneSignal:', userId);

            // 5️⃣ Verificar ID de suscripción
            const subscriptionId = OneSignal.User.PushSubscription.id;
            console.log('📱 Subscription ID:', subscriptionId);

            if (!subscriptionId) {
              console.warn('⚠️ No se obtuvo Subscription ID, podría no estar suscrito completamente');
            }

            resolve({ success: true, message: 'SUCCESS' });
          } catch (error) {
            console.error('❌ Error durante el proceso de permiso/suscripción:', error);
            resolve({ success: false, message: 'ERROR' });
          }
        });
      });
    } catch (error) {
      console.error('❌ Error general en requestPermissionAndSetUser:', error);
      return { success: false, message: 'ERROR' };
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
